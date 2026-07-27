import asyncio
import json
import secrets
from contextlib import asynccontextmanager, suppress

from fastapi import Depends, FastAPI, Header, HTTPException, Response
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from .config import settings
from .db import Base, SessionLocal, engine, session
from .models import Device, Passage, RefreshRun
from .service import add_source, refresh_fda_and_rags, sync_generated


cfg = settings()


async def scheduled_refresh() -> None:
    while True:
        await asyncio.sleep(cfg.refresh_hours * 3600)
        with suppress(Exception):
            await asyncio.to_thread(run_refresh)


def run_refresh() -> None:
    with SessionLocal() as db:
        refresh_fda_and_rags(db)


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(engine)
    with SessionLocal() as db:
        if not db.scalar(select(func.count(Device.id))):
            sync_generated(db)
    task = asyncio.create_task(scheduled_refresh())
    yield
    task.cancel()
    with suppress(asyncio.CancelledError):
        await task


app = FastAPI(title="Medtech Risk Assessment API", version="1.0.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in cfg.cors_origins.split(",")],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "X-Admin-Token"],
)


class SourceInput(BaseModel):
    name: str = Field(min_length=1, max_length=300)
    content: str = Field(min_length=1, max_length=10_000_000)


def admin(x_admin_token: str = Header(default="")) -> None:
    if cfg.admin_token == "change-me" or not secrets.compare_digest(x_admin_token, cfg.admin_token):
        raise HTTPException(status_code=401, detail="Valid X-Admin-Token required")


@app.get("/api/v1/health")
def health(db: Session = Depends(session)) -> dict:
    return {"status": "ok", "devices": db.scalar(select(func.count(Device.id)))}


@app.get("/api/v1/devices")
def devices(db: Session = Depends(session)) -> list[dict]:
    rows = db.scalars(select(Device).order_by(Device.product_name)).all()
    return [{"id": row.id, "product_name": row.product_name, "rag_version": row.rag_version, "updated_at": row.updated_at} for row in rows]


@app.get("/api/v1/devices/{device_id}/rag")
def device_rag(device_id: str, response: Response, db: Session = Depends(session)) -> dict:
    device = db.get(Device, device_id)
    if not device:
        raise HTTPException(status_code=404, detail="Device not found")
    rows = db.scalars(select(Passage).where(Passage.device_id == device_id).order_by(Passage.position)).all()
    response.headers["ETag"] = f'W/"{device_id}-{device.rag_version}"'
    response.headers["Cache-Control"] = "public, max-age=300"
    return {
        "device_id": device_id,
        "product_name": device.product_name,
        "rag_version": device.rag_version,
        "passages": [{"tag": row.tag, "t": row.content} for row in rows],
    }


@app.post("/api/v1/devices/{device_id}/sources", dependencies=[Depends(admin)])
def create_source(device_id: str, payload: SourceInput, db: Session = Depends(session)) -> dict:
    try:
        return add_source(db, device_id, payload.name, payload.content)
    except KeyError:
        raise HTTPException(status_code=404, detail="Device not found")


@app.post("/api/v1/admin/refresh", dependencies=[Depends(admin)])
def refresh(db: Session = Depends(session)) -> dict:
    return refresh_fda_and_rags(db)


@app.get("/api/v1/admin/refreshes", dependencies=[Depends(admin)])
def refreshes(db: Session = Depends(session)) -> list[dict]:
    rows = db.scalars(select(RefreshRun).order_by(RefreshRun.id.desc()).limit(50)).all()
    return [
        {
            "id": row.id,
            "status": row.status,
            "trigger": row.trigger,
            "details": json.loads(row.details) if row.details.startswith("{") else row.details,
            "started_at": row.started_at,
            "finished_at": row.finished_at,
        }
        for row in rows
    ]
