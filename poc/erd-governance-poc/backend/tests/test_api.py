import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["service"] == "R&D Governance Portal POC"

def test_demo_users_endpoint():
    response = client.get("/api/auth/demo-users")
    assert response.status_code == 200
    users = response.json()
    assert isinstance(users, list)

def test_list_portfolios():
    response = client.get("/api/portfolios")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_list_projects():
    response = client.get("/api/projects")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_executive_summary():
    response = client.get("/api/reports/executive-summary")
    assert response.status_code == 200
    data = response.json()
    assert "projects" in data
    assert "audits" in data
    assert "actions" in data
    assert "governance" in data
