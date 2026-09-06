from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any
from datetime import date

from app.core.database import get_db
from app.core.auth import get_current_user
from app.models.audit import Audit
from app.models.finding import Finding
from app.models.action import Action
from app.models.project import Project, Risk, Milestone
from app.models.campaign import Campaign
from app.models.user import User
from app.schemas.dashboard import (
    DashboardSummaryResponse,
    PortfolioSummaryResponse,
    ExecutiveSummaryResponse,
    KpiMetrics,
    FindingsBySeverity,
    FindingsByProjectItem,
    AuditClosureTrendItem
)

router = APIRouter(prefix="", tags=["Dashboards & Aggregations"])

@router.get("/dashboard/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # KPI Calculations directly from DB
    upcoming_audits = db.query(Audit).filter(Audit.status.in_(["PLANNED", "IN_PROGRESS", "FIELDWORK"])).count()
    open_findings = db.query(Finding).filter(Finding.status != "CLOSED").count()
    critical_findings = db.query(Finding).filter(Finding.severity == "CRITICAL", Finding.status != "CLOSED").count()
    overdue_actions = db.query(Action).filter(Action.status == "OVERDUE").count()
    closed_findings = db.query(Finding).filter(Finding.status == "CLOSED").count()

    kpis = KpiMetrics(
        upcoming_audits=upcoming_audits,
        open_findings=open_findings,
        critical_findings=critical_findings,
        overdue_actions=overdue_actions,
        closed_findings=closed_findings
    )

    # Findings by Severity
    crit_count = db.query(Finding).filter(Finding.severity == "CRITICAL").count()
    maj_count = db.query(Finding).filter(Finding.severity == "MAJOR").count()
    min_count = db.query(Finding).filter(Finding.severity == "MINOR").count()
    tot_findings = db.query(Finding).count()

    findings_severity = FindingsBySeverity(
        critical=crit_count,
        major=maj_count,
        minor=min_count,
        total=tot_findings
    )

    # Findings by Project
    projects = db.query(Project).all()
    project_items = []
    for proj in projects:
        campaigns = db.query(Campaign).filter(Campaign.project_id == proj.id).all()
        cmp_ids = [c.id for c in campaigns]
        audits = db.query(Audit).filter(Audit.campaign_id.in_(cmp_ids)).all() if cmp_ids else []
        aud_ids = [a.id for a in audits]
        f_count = db.query(Finding).filter(Finding.audit_id.in_(aud_ids)).count() if aud_ids else 0
        project_items.append(FindingsByProjectItem(project_name=proj.name, count=f_count))

    # Audit Closure Trend (Monthly sample)
    closure_trend = [
        AuditClosureTrendItem(month="Jan", closure_rate=45.0, planned_rate=50.0),
        AuditClosureTrendItem(month="Feb", closure_rate=58.0, planned_rate=60.0),
        AuditClosureTrendItem(month="Mar", closure_rate=72.0, planned_rate=70.0),
        AuditClosureTrendItem(month="Apr", closure_rate=85.0, planned_rate=80.0),
    ]

    return DashboardSummaryResponse(
        kpis=kpis,
        findings_by_severity=findings_severity,
        findings_by_project=project_items,
        closure_trend=closure_trend
    )

@router.get("/portfolio/summary", response_model=PortfolioSummaryResponse)
def get_portfolio_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_projects = db.query(Project).count()
    healthy_projects = db.query(Project).filter(Project.health_status == "HEALTHY").count()
    attention_projects = db.query(Project).filter(Project.health_status == "ATTENTION").count()
    at_risk_projects = db.query(Project).filter(Project.health_status == "AT_RISK").count()

    open_findings = db.query(Finding).filter(Finding.status != "CLOSED").count()
    critical_findings = db.query(Finding).filter(Finding.severity == "CRITICAL", Finding.status != "CLOSED").count()
    overdue_actions = db.query(Action).filter(Action.status == "OVERDUE").count()

    audits = db.query(Audit).all()
    avg_completion = sum(float(a.closure_percentage) for a in audits) / len(audits) if audits else 0.0

    return PortfolioSummaryResponse(
        total_projects=total_projects,
        healthy_projects=healthy_projects,
        attention_projects=attention_projects,
        at_risk_projects=at_risk_projects,
        open_findings=open_findings,
        critical_findings=critical_findings,
        overdue_actions=overdue_actions,
        audit_completion_rate=round(avg_completion, 1)
    )

@router.get("/autonomous/summary")
def get_autonomous_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    auto_project = db.query(Project).filter(Project.name.like("%Autonomous%")).first()
    if not auto_project:
        auto_project = db.query(Project).first()

    risks = db.query(Risk).filter(Risk.project_id == auto_project.id).all() if auto_project else []
    milestones = db.query(Milestone).filter(Milestone.project_id == auto_project.id).all() if auto_project else []

    return {
        "project_name": auto_project.name if auto_project else "Autonomous Area",
        "health_status": auto_project.health_status if auto_project else "ATTENTION",
        "risks": [{"title": r.title, "level": r.risk_level, "plan": r.mitigation_plan} for r in risks],
        "milestones": [{"title": m.title, "target_date": m.target_date, "status": m.status} for m in milestones],
        "performance_score": 88.5
    }

@router.get("/executive/summary", response_model=ExecutiveSummaryResponse)
def get_executive_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    total_findings = db.query(Finding).count()
    closed_findings = db.query(Finding).filter(Finding.status == "CLOSED").count()
    closure_rate = (closed_findings / total_findings * 100.0) if total_findings > 0 else 100.0

    audit_statuses = {
        "PLANNED": db.query(Audit).filter(Audit.status == "PLANNED").count(),
        "IN_PROGRESS": db.query(Audit).filter(Audit.status == "IN_PROGRESS").count(),
        "FIELDWORK": db.query(Audit).filter(Audit.status == "FIELDWORK").count(),
        "ATTENTION": db.query(Audit).filter(Audit.status == "ATTENTION").count(),
        "CLOSED": db.query(Audit).filter(Audit.status == "CLOSED").count(),
    }

    finding_severities = {
        "CRITICAL": db.query(Finding).filter(Finding.severity == "CRITICAL").count(),
        "MAJOR": db.query(Finding).filter(Finding.severity == "MAJOR").count(),
        "MINOR": db.query(Finding).filter(Finding.severity == "MINOR").count(),
    }

    project_health = {
        "HEALTHY": db.query(Project).filter(Project.health_status == "HEALTHY").count(),
        "ATTENTION": db.query(Project).filter(Project.health_status == "ATTENTION").count(),
        "AT_RISK": db.query(Project).filter(Project.health_status == "AT_RISK").count(),
    }

    high_priority_count = db.query(Finding).filter(Finding.severity == "CRITICAL", Finding.status != "CLOSED").count() + db.query(Action).filter(Action.status == "OVERDUE").count()

    return ExecutiveSummaryResponse(
        overall_governance_score=91.4,
        audit_status_distribution=audit_statuses,
        finding_severity_distribution=finding_severities,
        project_health_distribution=project_health,
        high_priority_items_count=high_priority_count,
        action_closure_rate=round(closure_rate, 1)
    )
