import os
from pathlib import Path

database = Path("/tmp/medtech-test.db")
database.unlink(missing_ok=True)
os.environ["MEDTECH_DATABASE_URL"] = f"sqlite:///{database}"
os.environ["MEDTECH_ADMIN_TOKEN"] = "test-admin-token"
os.environ["MEDTECH_CORS_ORIGINS"] = "http://testserver"

from fastapi.testclient import TestClient

from backend.app.main import app


def test_health_and_device_rag():
    with TestClient(app) as client:
        health = client.get("/api/v1/health")
        assert health.status_code == 200
        assert health.json()["devices"] == 101
        rag = client.get("/api/v1/devices/omnipod-5/rag")
        assert rag.status_code == 200
        assert rag.json()["passages"]
        assert rag.headers["etag"]


def test_source_upload_requires_admin_token():
    with TestClient(app) as client:
        denied = client.post(
            "/api/v1/devices/omnipod-5/sources",
            json={"name": "test", "content": "grounded evidence"},
        )
        assert denied.status_code == 401
        accepted = client.post(
            "/api/v1/devices/omnipod-5/sources",
            headers={"X-Admin-Token": "test-admin-token"},
            json={"name": "test", "content": "grounded evidence"},
        )
        assert accepted.status_code == 200
        assert accepted.json()["checksum"]
