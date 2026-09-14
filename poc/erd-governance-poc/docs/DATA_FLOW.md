# Data Flow & Dashboard Aggregation Architecture

This document describes how data flows from core CRUD entity operations through to real-time dashboards in the **R&D Governance Portal POC**.

## 1. No Duplicate Dashboard Tables

Dashboards in the application do **not** use static or pre-aggregated tables (such as `audit_dashboard` or `executive_dashboard`).

Instead, all metrics are computed dynamically at query time from source entities:

```
[AUDIT] + [FINDING] + [ACTION] + [RISK] + [PROJECT] + [GOVERNANCE_REVIEW]
                                 |
                                 v
                     [FastAPI Aggregation Service]
                                 |
                                 v
                   /api/reports/executive-summary
                                 |
                                 v
                     [React Recharts Dashboard]
```

## 2. Dynamic Metric Rules

- **Open Findings Count:** `SELECT COUNT(*) FROM findings WHERE status != 'CLOSED'`
- **Critical Findings:** `SELECT COUNT(*) FROM findings WHERE severity = 'CRITICAL' AND status != 'CLOSED'`
- **Overdue Actions:** `SELECT COUNT(*) FROM actions WHERE due_date < CURRENT_DATE AND status NOT IN ('COMPLETED', 'CLOSED')`
- **Project Health Breakdown:** Grouping `PROJECT` table by `overall_health_status` (`GREEN`, `AMBER`, `RED`).
- **Governance Review Completion:** Updating `GOVERNANCE_REVIEW.review_status = 'COMPLETED'` automatically updates the underlying `PROJECT.overall_health_status`.
