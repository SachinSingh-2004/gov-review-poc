# Role-Based Access Control (RBAC) & Data Scope Matrix

This document outlines the permissions and data scope boundaries enforced in the **R&D Governance Portal POC**.

## 1. Demo User Roster

| Demo User Name | Username | Assigned Role | Primary Data Scope |
| :--- | :--- | :--- | :--- |
| **System Admin** | `admin` | `ADMIN` | All system entities and full administrative access. |
| **Jordan Park** | `jordan_park` | `PROJECT_MANAGER` | Projects managed by user, related reviews, risks, and findings. |
| **Sarah Chen** | `sarah_chen` | `TECHNICAL_LEAD` | Assigned technical projects, findings, and technical actions. |
| **Alex Morgan** | `alex_morgan` | `AUDITOR` | Assigned audits, findings, evidence reviews. |
| **Elena Rostova** | `elena_rostova` | `AUDIT_MANAGER` | All quality and safety audits across portfolios. |
| **Marcus Vance** | `marcus_vance` | `TECHNOLOGY_CENTER_MANAGER` | Technology Center projects, assessments, governance reviews. |
| **David Kim** | `david_kim` | `ACTION_OWNER` | Assigned corrective and governance actions, evidence uploads. |
| **Rachel Adams** | `rachel_adams` | `EXECUTIVE` | Broad portfolio-wide read-only & executive metrics view. |
| **Sam Taylor** | `sam_taylor` | `VIEWER` | Portfolio-wide read-only stakeholder view. |

---

## 2. Permission Matrix

| Capability Code | ADMIN | PM | TECH_LEAD | AUDITOR | AUDIT_MGR | TC_MGR | ACTION_OWNER | EXEC | VIEWER |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| `READ` | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes | Yes |
| `CREATE` | Yes | Yes | No | Yes | Yes | Yes | No | No | No |
| `UPDATE` | Yes | Yes | Yes | Yes | Yes | Yes | Yes (Assigned) | No | No |
| `DELETE` | Yes | No | No | No | Yes | No | No | No | No |
| `APPROVE` | Yes | No | No | No | Yes | Yes | No | No | No |
| `REJECT` | Yes | No | No | No | Yes | Yes | No | No | No |
| `ASSIGN` | Yes | Yes | No | Yes | Yes | Yes | No | No | No |
| `CLOSE` | Yes | No | No | Yes | Yes | No | No | No | No |
| `COMPLETE_REVIEW` | Yes | No | No | No | No | Yes | No | No | No |
| `UPLOAD_EVIDENCE` | Yes | Yes | No | No | No | No | Yes | No | No |
| `REVIEW_EVIDENCE` | Yes | No | No | Yes | Yes | No | No | No | No |

---

## 3. Core Business Rules Enforced

1. **Self-Approval Prohibition:** An Action Owner or Evidence Uploader **cannot** approve or review their own evidence or mark their action as APPROVED.
2. **Review Completion Privilege:** Completing a Governance Review (`COMPLETE_REVIEW`) is restricted to Technology Center Managers and Admins.
3. **Audit Log Generation:** Any unauthorized attempt triggers an HTTP 403 response and logs a `PERMISSION_DENIED` entry in `AUDIT_LOG`.
