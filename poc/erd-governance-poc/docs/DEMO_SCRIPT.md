# Proof of Concept (POC) Interactive Demo Script

Follow this step-by-step walkthrough script to demonstrate end-to-end ERD validation, multi-user role switching, governance workflows, and live metric propagation.

---

## 29-Step Validation Scenario

1. **Start Application:** Ensure backend API (`http://localhost:8000`) and frontend Vite app (`http://localhost:5173`) are running.
2. **Login as Project Manager:** Select **Jordan Park (PROJECT_MANAGER)** from the top demo bar switcher.
3. **Open Project Module:** Navigate to **Portfolios & Projects** -> Click **Autonomous Vehicle Platform (PRJ-AUTO-01)**.
4. **Inspect Project Relationships:** Observe associated Portfolio, Technology Center, PM, Technical Lead, Phase, Risks, Issues, Milestones, Audits, and Governance Reviews.
5. **Open Audit Workspace:** Click **Audits** tab or sidebar -> Select **ISO 26262 Compliance Audit (AUD-2026-001)**.
6. **Open Finding Detail:** Click **Finding FND-001 (Missing Fault Tree Analysis)** under Audit Detail.
7. **Open Action Detail:** Click **Action ACT-001 (Update Steering Actuator FTA)** under Corrective Actions.
8. **View Evidence:** Click **Evidence (FTA_Steering_Actuator_v2.2.pdf)** attached to ACT-001.
9. **Return to Project:** Navigate back to **Autonomous Vehicle Platform**.
10. **Open Governance Review:** Select **Governance Review REV-AUTO-2026-08**.
11. **Review Project Health Context:** Observe schedule health, open risks (1 Critical), open audit findings, and overdue actions pulled live from underlying entities.
12. **Enter PM Update:** In the **PM Update** tab, enter changes, required leadership support, and click **Save PM Update**.
13. **Switch User Role:** Click the top user dropdown and switch to **Marcus Vance (TECHNOLOGY_CENTER_MANAGER)**.
14. **Open Same Governance Review:** Navigate to **Governance Review REV-AUTO-2026-08**.
15. **Complete Assessment:** Go to **Technology Center Assessment** tab -> Enter scores (Engineering: 3, Delivery: 3) -> Click **Save Assessment**. Observe Review Health update to **AMBER**.
16. **Create Leadership Decision:** Click **Leadership Decisions** tab -> Click **+ Add Decision** -> Create **Approve CAN-FD Bus Protocol Migration**.
17. **Create Governance Action:** Click **Governance Actions** tab -> Click **+ Add Governance Action** -> Create **GOV-ACT-001 (Architecture Review)** assigned to David Kim.
18. **Attempt Early Review Completion:** Click **Save Draft** vs **Complete Review**.
19. **Switch Role to Action Owner:** Select **David Kim (ACTION_OWNER)** from the top user switcher bar.
20. **Navigate to Action Centre:** Click **Action Centre** in left sidebar -> Filter by **My Actions**.
21. **Locate & Update Action:** Open **ACT-001** -> Change status to **IN_PROGRESS**.
22. **Upload Evidence:** Click **Upload Evidence** -> Attach sample file `FTA_Steering_Actuator_v2.2.pdf`. Status changes to **PENDING_REVIEW**.
23. **Test Permission Denial:** Attempt to click **Approve Action** as David Kim. Notice the system rejects self-approval with a **403 Forbidden** error and logs the attempt!
24. **Switch User Role to Auditor:** Select **Alex Morgan (AUDITOR)** from top bar.
25. **Approve Evidence:** Navigate to **Action Centre** -> **Pending Review** -> Open **ACT-001** -> Click **Approve Evidence & Complete Action**. Status updates to **COMPLETED**.
26. **Return to Governance Review:** Navigate back to **REV-AUTO-2026-08** -> Observe updated Action status.
27. **Switch to Executive Role:** Select **Rachel Adams (EXECUTIVE)** from top bar.
28. **Open Executive Governance Dashboard:** Verify live KPI cards (Open Findings, Overdue Actions, Health Breakdown) update dynamically without manual database changes.
29. **Open Audit Logs:** Navigate to **Audit Logs** -> Verify recorded events for PM Update, Assessment, Evidence Upload, Permission Denial, and Action Completion.
