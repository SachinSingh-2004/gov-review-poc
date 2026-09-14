# Governance Review POC - Interactive Demo Steps

Follow this walkthrough to demonstrate the PM vs TL role-based access, assigned project view, Governance Review component Cards, and database persistence.

---

## Demo 1: Project Manager (PM) Flow (View Only)

1. Open application at `http://localhost:5174` (or `http://localhost:5173`).
2. Login screen appears displaying **"Demo Environment — Not for Production"**.
3. Click **Use PM Demo (Priya Sharma)** or enter credentials:
   - **Username:** `pm.demo`
   - **Password:** `PM@123`
4. Click **Login**.
5. Application identifies:
   - **User:** Priya Sharma
   - **Role:** Project Manager (PM)
   - **Assigned Project:** Autonomous Platform Development (`RD-AUTO-001`)
6. Governance Review `GR-2026-001` opens automatically.
7. Observe **Primary Governance Review Components:**
   - **Project Health:** Schedule Health (GREEN), Budget Status (GREEN), Open Risks (2), Open Findings (2), Overall Health (AMBER).
   - **Technical Assessment:** Readiness Score (4 / 5), Technical Health (AMBER), Comments ("Technical readiness is progressing well..."), Assessed By (Arjun Mehta).
8. Observe **Technical Assessment Card:** Displays a **`[View Only]`** badge. **No Edit button is shown.**
9. Observe **Supporting Project Context:**
   - Audits: Software Quality Audit (`CLOSED`), Design Control Review (`IN_PROGRESS`).
   - Findings: `FND-001` (MAJOR, OPEN), `FND-002` (MINOR, OPEN), `FND-003` (MINOR, CLOSED).
   - Actions: `ACTION-001` (Complete software verification, owner Arjun Mehta), `ACTION-002` (Complete missing review, owner Priya Sharma).
   - Risks: `RISK-001` (Technical integration delay), `RISK-002` (Testing resource availability).
10. Click **Logout**.

---

## Demo 2: Technical Lead (TL) Flow (View + Edit)

1. On Login screen, click **Use TL Demo (Arjun Mehta)** or enter credentials:
   - **Username:** `tl.demo`
   - **Password:** `TL@123`
2. Click **Login**.
3. Application identifies:
   - **User:** Arjun Mehta
   - **Role:** Technical Lead (TL)
   - **Assigned Project:** Autonomous Platform Development (`RD-AUTO-001`)
4. Governance Review `GR-2026-001` opens.
5. On the **Technical Assessment** card, observe the **[Edit]** button is visible.
6. Click **[Edit]**.
7. Change:
   - **Readiness Score:** `5 / 5`
   - **Technical Health:** `GREEN`
   - **Comments:** `"Technical readiness validated. All integration risks mitigated."`
8. Click **[Save]**.
9. Observe success banner: *"Technical Assessment updated successfully."*
10. Refresh the browser page (`F5`).
11. Confirm updated readiness score (`5 / 5`), health (`GREEN`), and comments remain persisted from the database!
12. Click **Logout**.

---

## Demo 3: Security & Role Permission Verification

1. Login as PM (`pm.demo` / `PM@123`).
2. Open Browser Developer Tools (F12) -> Console or Network tab.
3. Send a manual `PUT` request to `/api/governance-reviews/1/technical-assessment`.
4. Observe the backend API rejects the attempt with **HTTP 403 Forbidden**:
   `"You do not have permission to update Technical Assessment."`
