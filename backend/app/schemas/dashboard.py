from pydantic import BaseModel
from typing import List, Dict, Any

class FindingsBySeverity(BaseModel):
    critical: int
    major: int
    minor: int
    total: int

class FindingsByProjectItem(BaseModel):
    project_name: str
    count: int

class AuditClosureTrendItem(BaseModel):
    month: str
    closure_rate: float
    planned_rate: float

class KpiMetrics(BaseModel):
    upcoming_audits: int
    open_findings: int
    critical_findings: int
    overdue_actions: int
    closed_findings: int

class DashboardSummaryResponse(BaseModel):
    kpis: KpiMetrics
    findings_by_severity: FindingsBySeverity
    findings_by_project: List[FindingsByProjectItem]
    closure_trend: List[AuditClosureTrendItem]

class PortfolioSummaryResponse(BaseModel):
    total_projects: int
    healthy_projects: int
    attention_projects: int
    at_risk_projects: int
    open_findings: int
    critical_findings: int
    overdue_actions: int
    audit_completion_rate: float

class ExecutiveSummaryResponse(BaseModel):
    overall_governance_score: float
    audit_status_distribution: Dict[str, int]
    finding_severity_distribution: Dict[str, int]
    project_health_distribution: Dict[str, int]
    high_priority_items_count: int
    action_closure_rate: float
