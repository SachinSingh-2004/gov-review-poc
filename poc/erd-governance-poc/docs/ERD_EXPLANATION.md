# ERD Architecture & Entity Model Explanation

This document explains the entity relationships and data architecture implemented in the **R&D Governance Portal Proof of Concept (POC)**.

## Core Entity Summary

The POC enforces 22 logical entities defined across 6 Mermaid `.mmd` diagrams:

| Entity Name | Primary Key | Key Foreign Keys | Purpose & Business Logic |
| :--- | :--- | :--- | :--- |
| **USER** | `user_id` | N/A | Represents enterprise users across all roles (PM, Auditor, TC Manager, etc.). |
| **ROLE** | `role_id` | N/A | Defines functional authorization groups (ADMIN, PROJECT_MANAGER, etc.). |
| **PERMISSION** | `permission_id` | N/A | Granular operation capability codes (CREATE, APPROVE, COMPLETE_REVIEW, etc.). |
| **USER_ROLE** | `(user_id, role_id)` | `user_id`, `role_id` | N:M association between Users and Roles. |
| **ROLE_PERMISSION** | `(role_id, permission_id)` | `role_id`, `permission_id` | N:M association between Roles and Permissions. |
| **PORTFOLIO** | `portfolio_id` | N/A | High-level portfolio grouping of R&D projects. |
| **TECHNOLOGY_CENTER** | `technology_center_id` | `lead_user_id` | Technology domain center overseeing engineering health. |
| **PROJECT_PHASE** | `phase_id` | N/A | Gate lifecycle phase (Concept, Design, V&V, Production). |
| **PROJECT** | `project_id` | `portfolio_id`, `technology_center_id`, `current_phase_id`, `project_manager_id`, `technical_lead_id` | Master project record connecting audits, risks, milestones, and reviews. |
| **AUDIT** | `audit_id` | `project_id`, `lead_auditor_id` | Planned or active quality/safety/security audit. |
| **AUDIT_PARTICIPANT** | `(audit_id, user_id)` | `audit_id`, `user_id` | N:M association mapping auditors and auditees to audits. |
| **FINDING** | `finding_id` | `audit_id`, `owner_id` | Identified gap or non-conformance resulting from an audit. |
| **ACTION** | `action_id` | `finding_id` (opt), `governance_review_id` (opt), `owner_id`, `reviewer_id` | **Multi-source** corrective or governance action item. |
| **EVIDENCE** | `evidence_id` | `action_id`, `uploaded_by_id`, `reviewer_id` | Uploaded document/file metadata proving action closure. |
| **RISK** | `risk_id` | `project_id` | Project risk item with severity level and mitigation plan. |
| **ISSUE** | `issue_id` | `project_id` | Active project problem or obstacle requiring resolution. |
| **DEPENDENCY** | `dependency_id` | `source_project_id`, `target_project_id` | Inter-project dependency relationship. |
| **MILESTONE** | `milestone_id` | `project_id` | Critical milestone date and completion status. |
| **GOVERNANCE_REVIEW** | `review_id` | `project_id`, `previous_review_id`, `technology_center_manager_id` | Periodic governance gate review with self-referential prior history. |
| **PM_UPDATE** | `update_id` | `review_id`, `submitted_by_id` | 1:0..1 status update submitted by Project Manager. |
| **GOVERNANCE_ASSESSMENT** | `assessment_id` | `review_id`, `assessed_by_id` | 1:0..1 technical and delivery assessment by TC Manager. |
| **GOVERNANCE_DECISION** | `decision_id` | `review_id`, `owner_id` | Leadership decisions and directives resulting from review. |
| **AUDIT_LOG** | `log_id` | `user_id` | Immutable audit trail recording mutations and security violations. |

---

## Multi-Source Action Origin

```
+----------------+          +-------------------+
|    FINDING     |          | GOVERNANCE_REVIEW |
+-------+--------+          +---------+--------- cascade
        | 1:N                         | 1:N
        v                             v
+-------+-----------------------------+---------+
|                    ACTION                     |
|  (finding_id OR governance_review_id set)     |
+-----------------------+-----------------------+
                        | 1:N
                        v
+-----------------------+-----------------------+
|                   EVIDENCE                    |
+-----------------------------------------------+
```

Actions originate either from **Audit Findings** or **Governance Reviews**. The single `ACTION` entity handles both sources cleanly via nullable foreign keys.
