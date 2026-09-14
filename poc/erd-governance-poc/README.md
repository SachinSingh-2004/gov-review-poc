# R&D Governance Portal - ERD Proof of Concept (POC)

This subfolder contains a fully working, relationally consistent Proof of Concept (POC) that visually and functionally demonstrates and validates the current ERD / data model and business relationships for the **R&D Governance Portal**.

---

## 1. Objectives

- Validate how all 22 core entities in the current ERD are connected.
- Demonstrate real record creation, updates, and cascading metric propagation.
- Validate RBAC, permission enforcement, and data scoping across 9 demo roles.
- Demonstrate live multi-module consumption of the same underlying database records.
- Demonstrate complete **Audit -> Finding -> Action -> Evidence** and **Project -> Governance Review -> PM Update / Assessment / Decision / Action** workflows.
- Demonstrate live dynamic dashboards without creating master dashboard tables.

---

## 2. Architecture & Tech Stack

- **Backend:** Python 3.13, FastAPI, SQLAlchemy ORM, Pydantic v2, Pytest.
- **Frontend:** React 18, Vite 5, TypeScript 5, MUI v5, Recharts, TanStack Query, Mermaid.js.
- **Database:** SQLite (`poc_governance.db` - isolated local file, PostgreSQL compatible).

---

## 3. Folder Structure

```
/poc/erd-governance-poc/
├── erd/                          # 6 Editable Mermaid ERD diagrams (.mmd)
├── backend/                      # FastAPI Backend service & Pytest suite
│   ├── app/                      # Models, schemas, auth, routers, database setup
│   ├── tests/                    # API and RBAC test suite
│   └── requirements.txt
├── frontend/                     # React + Vite + TS + MUI Frontend application
│   ├── src/                      # API client, context, components, pages, types
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── seed/                         # Relational database seed & reset scripts
│   ├── seed_data.py
│   └── reset_db.py
├── docs/                         # Architecture, RBAC, data flow & demo script docs
└── README.md
```

---

## 4. Setup & Running Instructions

### Step A: Seed Database
From repository root or `seed/` directory:
```bash
cd poc/erd-governance-poc/seed
python seed_data.py
```
*(Or use virtualenv python: `..\..\..\venv\Scripts\python.exe seed_data.py`)*

### Step B: Start Backend API
From `backend/` directory:
```bash
cd poc/erd-governance-poc/backend
uvicorn app.main:app --reload --port 8000
```
API Documentation available at: `http://localhost:8000/docs`

### Step C: Start Frontend Application
From `frontend/` directory:
```bash
cd poc/erd-governance-poc/frontend
npm install
npm run dev
```
Open browser at: `http://localhost:5173`

---

## 5. Demo Users & Roles

1. **System Admin** (`admin`) - Full administrative access
2. **Jordan Park** (`jordan_park`) - PROJECT_MANAGER
3. **Sarah Chen** (`sarah_chen`) - TECHNICAL_LEAD
4. **Alex Morgan** (`alex_morgan`) - AUDITOR
5. **Elena Rostova** (`elena_rostova`) - AUDIT_MANAGER
6. **Marcus Vance** (`marcus_vance`) - TECHNOLOGY_CENTER_MANAGER
7. **David Kim** (`david_kim`) - ACTION_OWNER
8. **Rachel Adams** (`rachel_adams`) - EXECUTIVE
9. **Sam Taylor** (`sam_taylor`) - VIEWER

---

## 6. Testing

### Run Backend Unit Tests:
```bash
cd poc/erd-governance-poc/backend
pytest tests/
```

### Run Frontend Type Check:
```bash
cd poc/erd-governance-poc/frontend
npm run lint
```

---

## 7. Documented TBC Items

1. **Multi-Source Action Origin:** Action has optional FKs `finding_id` and `governance_review_id`.
2. **Governance Review History:** Prior reviews link via `previous_review_id` self-referential FK.
3. **Assessment Scores:** Governance Assessment contains delivery & engineering scores (1-5).
