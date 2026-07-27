#!/usr/bin/env python3
"""Download FDA monthly MAUDE files and build the GitHub Pages data payload."""

import csv
import io
import json
import re
import shutil
import tempfile
import urllib.request
import zipfile
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).parents[1]
FDA_BASE = "https://www.accessdata.fda.gov/MAUDE/ftparea"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; MedtechRiskAssessment/1.0; +https://www.fda.gov/)",
    "Referer": "https://www.fda.gov/",
}
STOP = {
    "abbott", "baxter", "boston", "medical", "device", "devices", "system",
    "systems", "health", "healthcare", "monitor", "monitoring", "pump",
    "infusion", "catheter", "implant", "platform", "software", "digital",
    "surgical", "corporation", "company", "technologies", "technology", "inc",
}


def normalized(value: str) -> str:
    return " ".join(re.findall(r"[a-z0-9]+", value.lower()))


def download(name: str, directory: Path) -> Path:
    target = directory / name
    request = urllib.request.Request(f"{FDA_BASE}/{name}", headers=HEADERS)
    with urllib.request.urlopen(request, timeout=300) as response, target.open("wb") as output:
        shutil.copyfileobj(response, output)
    return target


def rows(archive: Path):
    with zipfile.ZipFile(archive) as bundle:
        with bundle.open(bundle.namelist()[0]) as raw:
            text = io.TextIOWrapper(raw, encoding="latin-1", errors="replace", newline="")
            yield from csv.DictReader(text, delimiter="|")


def device_matchers(catalog: list[dict]) -> list[dict]:
    result = []
    for device in catalog:
        manufacturer = normalized(device.get("manufacturer") or device.get("company_name") or "")
        manufacturer_words = [word for word in manufacturer.split() if word not in STOP]
        terms = [
            word for word in normalized(device["product_name"]).split()
            if len(word) >= 4 and word not in STOP and word not in manufacturer_words
        ]
        result.append(
            {
                "id": device["product_id"],
                "manufacturer": manufacturer_words[0] if manufacturer_words else "",
                "terms": list(dict.fromkeys(terms)),
                "product_code": normalized(device.get("procode", "")),
            }
        )
    return result


def build(report_archive: Path, device_archive: Path) -> dict:
    catalog = json.loads((ROOT / "data" / "catalog.json").read_text())
    matchers = device_matchers(catalog)
    report_to_devices: dict[str, set[str]] = defaultdict(set)
    device_rows = 0
    for row in rows(device_archive):
        device_rows += 1
        key = row.get("MDR_REPORT_KEY") or ""
        manufacturer = normalized(row.get("MANUFACTURER_D_NAME") or "")
        identity = normalized(
            " ".join(
                (
                    row.get("BRAND_NAME") or "",
                    row.get("MODEL_NUMBER") or "",
                    row.get("CATALOG_NUMBER") or "",
                    row.get("GENERIC_NAME") or "",
                )
            )
        )
        code = normalized(row.get("DEVICE_REPORT_PRODUCT_CODE") or "")
        for matcher in matchers:
            code_match = matcher["product_code"] and matcher["product_code"] == code
            identity_match = matcher["terms"] and any(term in identity for term in matcher["terms"])
            manufacturer_match = not matcher["manufacturer"] or matcher["manufacturer"] in manufacturer
            if code_match or (manufacturer_match and identity_match):
                report_to_devices[key].add(matcher["id"])

    matched_keys: dict[str, set[str]] = defaultdict(set)
    report_rows = 0
    for row in rows(report_archive):
        report_rows += 1
        key = row.get("MDR_REPORT_KEY") or ""
        for device_id in report_to_devices.get(key, ()):
            matched_keys[device_id].add(key)

    checked = datetime.now(timezone.utc).isoformat()
    return {
        "meta": {
            "source": "FDA MAUDE monthly master + device files",
            "last_checked": checked,
            "report_rows": report_rows,
            "device_rows": device_rows,
            "matching": "brand/model/product code + MDR_REPORT_KEY",
        },
        "devices": {
            device["product_id"]: {
                "count": len(matched_keys[device["product_id"]]),
                "source": "FDA MAUDE monthly files",
                "last_checked": checked,
                "matched_by": "brand/model/product code + MDR_REPORT_KEY",
            }
            for device in catalog
        },
    }


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="maude-pages-") as temporary:
        directory = Path(temporary)
        report = download("mdrfoiadd.zip", directory)
        device = download("deviceadd.zip", directory)
        payload = build(report, device)
    output = ROOT / "data" / "adverse-events.json"
    output.write_text(json.dumps(payload, separators=(",", ":")) + "\n")
    print(json.dumps(payload["meta"]))


if __name__ == "__main__":
    main()
