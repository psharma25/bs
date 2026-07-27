import hashlib
import json
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from .models import Device, Passage, RefreshRun, Source


ROOT = Path(__file__).resolve().parents[2]


def split_text(text: str, size: int = 1200, overlap: int = 180) -> list[str]:
    clean = " ".join(text.split())
    return [clean[i : i + size] for i in range(0, len(clean), size - overlap)] if clean else []


def sync_generated(db: Session, trigger: str = "startup") -> dict:
    now = datetime.now(timezone.utc)
    run = RefreshRun(status="running", trigger=trigger, started_at=now)
    db.add(run)
    db.commit()
    try:
        catalog = {item["product_id"]: item for item in json.loads((ROOT / "data/catalog.json").read_text())}
        manifest = json.loads((ROOT / "data/rag/index.json").read_text())
        passages_written = 0
        for device_id, metadata in manifest["devices"].items():
            payload = json.loads((ROOT / "data/rag" / metadata["file"]).read_text())
            device = db.get(Device, device_id)
            if device is None:
                device = Device(
                    id=device_id,
                    product_name=payload["product_name"],
                    catalog_json=json.dumps(catalog[device_id]),
                    rag_version=1,
                    updated_at=now,
                )
                db.add(device)
                db.flush()
            else:
                device.product_name = payload["product_name"]
                device.catalog_json = json.dumps(catalog[device_id])
                device.rag_version += 1
                device.updated_at = now
                db.execute(delete(Passage).where(Passage.device_id == device_id))
            for position, item in enumerate(payload["passages"]):
                db.add(Passage(device_id=device_id, position=position, tag=item["tag"], content=item["t"]))
                passages_written += 1
            position = len(payload["passages"])
            existing_sources = db.scalars(select(Source).where(Source.device_id == device_id)).all()
            for source in existing_sources:
                for chunk in split_text(source.content):
                    db.add(Passage(device_id=device_id, position=position, tag=f"source:{source.name}", content=chunk))
                    position += 1
                    passages_written += 1
        run.status = "completed"
        run.finished_at = datetime.now(timezone.utc)
        run.details = json.dumps({"devices": len(catalog), "passages": passages_written})
        db.commit()
        return {"devices": len(catalog), "passages": passages_written}
    except Exception as exc:
        db.rollback()
        run = db.get(RefreshRun, run.id)
        run.status = "failed"
        run.finished_at = datetime.now(timezone.utc)
        run.details = str(exc)[:2000]
        db.commit()
        raise


def add_source(db: Session, device_id: str, name: str, content: str) -> dict:
    device = db.get(Device, device_id)
    if not device:
        raise KeyError(device_id)
    checksum = hashlib.sha256(content.encode()).hexdigest()
    source = Source(
        device_id=device_id,
        name=name,
        content=content,
        checksum=checksum,
        created_at=datetime.now(timezone.utc),
    )
    db.add(source)
    start = db.scalar(select(Passage.position).where(Passage.device_id == device_id).order_by(Passage.position.desc()).limit(1))
    position = (start or 0) + 1
    for chunk in split_text(content):
        db.add(Passage(device_id=device_id, position=position, tag=f"source:{name}", content=chunk))
        position += 1
    device.rag_version += 1
    device.updated_at = datetime.now(timezone.utc)
    db.commit()
    return {"source_id": source.id, "checksum": checksum, "rag_version": device.rag_version}


def refresh_fda_and_rags(db: Session) -> dict:
    subprocess.run([sys.executable, str(ROOT / "scripts/build_pages_data.py")], cwd=ROOT, check=True)
    subprocess.run([sys.executable, str(ROOT / "scripts/generate_device_rags.py")], cwd=ROOT, check=True)
    return sync_generated(db, "scheduled")
