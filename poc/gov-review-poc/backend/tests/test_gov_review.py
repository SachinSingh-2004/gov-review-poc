import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_1_pm_login_success():
    res = client.post("/api/auth/login", json={"username": "pm.demo", "password": "PM@123"})
    assert res.status_code == 200
    data = res.json()
    assert data["role_code"] == "PM"
    assert data["user"]["display_name"] == "Priya Sharma"

def test_2_tl_login_success():
    res = client.post("/api/auth/login", json={"username": "tl.demo", "password": "TL@123"})
    assert res.status_code == 200
    data = res.json()
    assert data["role_code"] == "TL"
    assert data["user"]["display_name"] == "Arjun Mehta"

def test_3_list_assigned_projects():
    headers = {"X-Demo-User-ID": "1"}
    res = client.get("/api/users/me/projects", headers=headers)
    assert res.status_code == 200
    projects = res.json()
    assert len(projects) == 3

def test_4_pm_can_update_project_health():
    # PM updating Project Health MUST return 200 OK
    headers = {"X-Demo-User-ID": "1"}
    payload = {"schedule_health": "AMBER", "budget_status": "GREEN", "overall_health": "AMBER"}
    res = client.put("/api/governance-reviews/1/health", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["schedule_health"] == "AMBER"

def test_5_tl_can_update_technical_assessment():
    # TL updating Technical Assessment MUST return 200 OK
    headers = {"X-Demo-User-ID": "2"}
    payload = {"technical_readiness_score": 5, "technical_health": "GREEN", "comments": "Updated by Technical Lead"}
    res = client.put("/api/governance-reviews/1/technical-assessment", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["technical_readiness_score"] == 5

def test_6_pm_cannot_update_technical_assessment():
    # PM attempt to update technical assessment MUST return 403 Forbidden
    headers = {"X-Demo-User-ID": "1"}
    payload = {"technical_readiness_score": 5, "technical_health": "GREEN", "comments": "PM unauthorized update"}
    res = client.put("/api/governance-reviews/1/technical-assessment", json=payload, headers=headers)
    assert res.status_code == 403
    assert "You do not have permission" in res.json()["detail"]

def test_7_create_new_audit():
    headers = {"X-Demo-User-ID": "1"}
    payload = {"audit_name": "New Safety Audit", "audit_type": "Safety", "audit_status": "IN_PROGRESS", "planned_date": "2026-10-01"}
    res = client.post("/api/projects/1/audits", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["audit_name"] == "New Safety Audit"

def test_8_create_new_risk():
    headers = {"X-Demo-User-ID": "1"}
    payload = {"title": "New Hardware Supply Chain Delay", "status": "OPEN", "impact": "HIGH", "probability": "MEDIUM"}
    res = client.post("/api/projects/1/risks", json=payload, headers=headers)
    assert res.status_code == 200
    assert res.json()["title"] == "New Hardware Supply Chain Delay"

def test_9_tl_cannot_update_project_health():
    # TL attempt to update project health MUST return 403 Forbidden
    headers = {"X-Demo-User-ID": "2"}
    payload = {"schedule_health": "RED", "budget_status": "RED", "overall_health": "RED"}
    res = client.put("/api/governance-reviews/1/health", json=payload, headers=headers)
    assert res.status_code == 403
    assert "You do not have permission" in res.json()["detail"]

