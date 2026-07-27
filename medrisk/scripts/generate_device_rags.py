#!/usr/bin/env python3
"""Generate one compact browser-loadable RAG knowledge file per device."""

import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).parents[1]
OUTPUT = ROOT / "data" / "rag"


def add(passages: list[dict], tag: str, text: str | None) -> None:
    if text and text.strip():
        passages.append({"tag": tag, "t": " ".join(text.split())})


def embedded_array(name: str) -> list[dict]:
    source = (ROOT / "index.html").read_text()
    marker = f"const {name} = "
    start = source.index(marker) + len(marker)
    return json.JSONDecoder().raw_decode(source[start:])[0]


def hospital_setting(device: dict) -> str:
    text = f"{device.get('product_name','')} {device.get('device_type','')}".lower()
    if any(term in text for term in ("implant", "pacemaker", "defibrillator")):
        return "implant clinic, procedure room, programmer workstation, remote-monitoring service"
    if any(term in text for term in ("surgical", "robot", "imaging", "ct", "mri", "ultrasound")):
        return "operating room or imaging department, clinical VLAN, PACS/EHR, service workstation"
    if any(term in text for term in ("infusion", "pump", "monitor", "ventilat", "dialysis")):
        return "bedside care area, biomedical engineering, clinical VLAN, EHR and device-management server"
    return "hospital clinical network, biomedical engineering, identity boundary and EHR integration"


def build_passages(device: dict, adverse: dict | None, advisories: list[dict], install_sites: list[dict]) -> list[dict]:
    passages: list[dict] = []
    add(passages, "overview", f"{device['product_name']} by {device.get('manufacturer','unknown')}. Type: {device.get('device_type','unknown')}. FDA class: {device.get('device_class','unknown')}. Pathway: {device.get('primary_pma','unknown')}.")
    add(passages, "methodology", device.get("scoring_method"))
    add(passages, "provenance", device.get("provenance_note"))
    add(passages, "confidence", f"Assessment confidence: {device.get('confidence','Low')}.")
    for domain, details in (device.get("domains") or {}).items():
        label = domain.replace("_", " ")
        add(passages, domain, f"{label} score {details.get('score','unscored')}/100. {details.get('summary','')}")
        for finding in details.get("findings") or []:
            add(passages, domain, f"{label} finding: {finding.get('text','')}")
        for improvement in details.get("improvement") or []:
            add(passages, domain, f"{label} improvement: {improvement}")
    for item in device.get("vulnerability_register") or []:
        add(passages, "vulnerability", f"{item.get('id','')} {item.get('cve','')}: {item.get('type','')}. Status: {item.get('status','')}. Impact: {item.get('impact','')}.")
    for audience, statements in (device.get("enduser_views") or {}).items():
        for statement in statements:
            add(passages, f"{audience}-view", statement)
    for source_id, source in (device.get("sources") or {}).items():
        add(passages, "source", f"Source {source_id}: {source.get('title',source_id)}. URL: {source.get('url','not supplied')}.")
    if adverse:
        add(passages, "adverse-events", f"FDA MAUDE monthly matched-report signal: {adverse.get('count',0)} reports. Matching method: {adverse.get('matched_by','not specified')}. Last checked: {adverse.get('last_checked','not specified')}. This is not an incidence rate and does not establish causation.")
    if install_sites:
        counts: dict[str, int] = {}
        for site in install_sites:
            counts[site.get("confidence", "inferred")] = counts.get(site.get("confidence", "inferred"), 0) + 1
        sample = ", ".join(site.get("name", "") for site in install_sites[:8])
        add(passages, "install-base", f"Hospital Tracker install-base signal: {len(install_sites)} named site hypotheses ({', '.join(f'{v} {k}' for k, v in counts.items())}). Sample: {sample}. Inferred records are not verified deployments and must be checked against hospital inventory.")
    security = (device.get("domains") or {}).get("security") or {}
    connected = any(term in f"{device.get('product_name','')} {device.get('device_type','')}".lower() for term in ("connected", "wireless", "cloud", "app", "software", "digital", "monitor", "pump", "imaging", "robot"))
    add(passages, "threat-model", f"Hospital deployment threat boundary: {hospital_setting(device)}. Protect network segmentation, authenticated service access, update provenance, clinical availability, and audit logging.")
    add(passages, "threat-model", f"Software supply-chain and SBOM threat: verify the actual manufacturer SBOM, VEX, MDS2, third-party components, signed firmware, and deployed patch level. Public security score is {security.get('score','unscored')}/100; representative components are not authoritative.")
    if connected:
        add(passages, "threat-model", "Connected attack-path inference: external or vendor service to hospital trust boundary to device workflow and patient/data impact. Validate authentication, encryption, least privilege, monitoring, fail-safe behavior, and recovery.")
    for advisory in advisories:
        add(passages, "advisory", f"Advisory {advisory.get('id','')}, severity {advisory.get('severity','Unknown')}, dated {advisory.get('published','not dated')}. Status: {advisory.get('status','unknown')}. Likelihood: {(advisory.get('likelihood') or {}).get(device['product_id'],advisory.get('confidence','Possible'))}. Recommendation: {advisory.get('recommendation','confirm remediation with manufacturer')}.")
    return passages


def main() -> None:
    catalog = json.loads((ROOT / "data" / "catalog.json").read_text())
    adverse_payload = json.loads((ROOT / "data" / "adverse-events.json").read_text())
    adverse = adverse_payload.get("devices", {})
    notifications = embedded_array("NOTIFS")
    install_text = (ROOT / "data" / "hospital-install-base.js").read_text().strip()
    install_payload = json.loads(install_text.removeprefix("window.HOSPITAL_INSTALL_BASE=").removesuffix(";"))
    install_by_device = install_payload.get("products", {})
    advisories_by_device: dict[str, list[dict]] = {}
    for advisory in notifications:
        for device_id in advisory.get("impacted") or []:
            advisories_by_device.setdefault(device_id, []).append(advisory)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    manifest = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "embedding_model": "Xenova/all-MiniLM-L6-v2",
        "retrieval": "per-device WebGPU cosine similarity",
        "devices": {},
    }
    expected = set()
    for device in catalog:
        device_id = device["product_id"]
        filename = f"{device_id}.json"
        expected.add(filename)
        passages = build_passages(device, adverse.get(device_id), advisories_by_device.get(device_id, []), install_by_device.get(device_id, []))
        path = OUTPUT / filename
        path.write_text(json.dumps({"device_id": device_id, "product_name": device["product_name"], "passages": passages}, separators=(",", ":")) + "\n")
        manifest["devices"][device_id] = {"file": filename, "passages": len(passages), "bytes": path.stat().st_size}
    for stale in OUTPUT.glob("*.json"):
        if stale.name != "index.json" and stale.name not in expected:
            stale.unlink()
    (OUTPUT / "index.json").write_text(json.dumps(manifest, separators=(",", ":")) + "\n")
    print(json.dumps({"devices": len(catalog), "passages": sum(x["passages"] for x in manifest["devices"].values())}))


if __name__ == "__main__":
    main()
