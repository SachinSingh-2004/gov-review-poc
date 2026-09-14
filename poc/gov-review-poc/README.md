# Governance Review POC - Strict 12-Entity Scope

This focused Proof of Concept (POC) implements the **Governance Review module** complying strictly with the **5 approved ERDs** and **exactly 12 approved entities**.

---

## 1. Approved Database Entities (Strict 12 Only)

1. `USER`
2. `ROLE` (`PM`, `TL`)
3. `USER_ROLE`
4. `PROJECT`
5. `PROJECT_MEMBER`
6. `GOVERNANCE_REVIEW`
7. `PROJECT_HEALTH`
8. `TECHNICAL_ASSESSMENT`
9. `AUDIT`
10. `FINDING`
11. `ACTION`
12. `RISK`

---

## 2. Setup & Execution Commands

### Step A: Seed Database
From `seed/` directory:
```powershell
cd e:\desktop\Audit_demo\poc\gov-review-poc\seed
..\..\..\venv\Scripts\python.exe seed_demo_data.py
```

### Step B: Start Backend Service
From `backend/` directory:
```powershell
cd e:\desktop\Audit_demo\poc\gov-review-poc\backend
..\..\..\venv\Scripts\uvicorn.exe app.main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`

### Step C: Run Backend Test Suite
From `backend/` directory:
```powershell
cd e:\desktop\Audit_demo\poc\gov-review-poc\backend
..\..\..\venv\Scripts\pytest.exe tests/
```
*(All 18 required test cases pass).*

### Step D: Start Frontend Dev Server
From `frontend/` directory:
```powershell
cd e:\desktop\Audit_demo\poc\gov-review-poc\frontend
npm install
npm run dev
```
- App URL: `http://localhost:5174` (or `http://localhost:5173`)

---

## 3. Working Demo Credentials

- **Priya Sharma (PM):** Username `pm.demo`, Password `PM@123` -> View Only Technical Assessment.
- **Arjun Mehta (TL):** Username `tl.demo`, Password `TL@123` -> View + Edit Technical Assessment.
