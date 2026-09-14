import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_unauthorized_permission_denied():
    # Action Owner (usr-actown-01) attempting an operation that requires COMPLETE_REVIEW
    headers = {"X-Demo-User-ID": "usr-actown-01"}
    response = client.put("/api/governance-reviews/rev-002/complete", headers=headers)
    # Should yield HTTP 403 Forbidden due to missing COMPLETE_REVIEW permission
    assert response.status_code == 403
    assert "Permission Denied" in response.json()["detail"]

def test_audit_log_recorded():
    logs_res = client.get("/api/audit-logs")
    assert logs_res.status_code == 200
    logs = logs_res.json()
    assert isinstance(logs, list)
