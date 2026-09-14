from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.models.models import Project, Audit, Finding, Action, Risk, Issue, GovernanceReview, GovernanceDecision, Milestone

router = APIRouter(prefix="/reports", tags=["Reports & Executive Aggregations"])

@router.get("/executive-summary")
def get_executive_summary(db: Session = Depends(get_db)):
    # Calculate live aggregated metrics strictly from underlying entity tables!
    total_projects = db.query(Project).count()
    green_projects = db.query(Project).filter(Project.overall_health_status == "GREEN").count()
    amber_projects = db.query(Project).filter(Project.overall_health_status == "AMBER").count()
    red_projects = db.query(Project).filter(Project.overall_health_status == "RED").count()

    total_audits = db.query(Audit).count()
    total_findings = db.query(Finding).count()
    critical_findings = db.query(Finding).filter(Finding.severity == "CRITICAL", Finding.status != "CLOSED").count()
    open_findings = db.query(Finding).filter(Finding.status != "CLOSED").count()

    total_actions = db.query(Action).count()
    overdue_actions = db.query(Action).filter(Action.due_date < date.today(), Action.status != "COMPLETED", Action.status != "CLOSED").count()
    pending_review_actions = db.query(Action).filter(Action.status == "PENDING_REVIEW").count()

    critical_risks = db.query(Risk).filter(Risk.risk_level == "HIGH", Risk.status == "OPEN").count()
    pending_decisions = db.query(GovernanceDecision).filter(GovernanceDecision.status == "PENDING").count()

    return {
        "projects": {
            "total": total_projects,
            "green": green_projects,
            "amber": amber_projects,
            "red": red_projects
        },
        "audits": {
            "total": total_audits,
            "total_findings": total_findings,
            "open_findings": open_findings,
            "critical_findings": critical_findings
        },
        "actions": {
            "total": total_actions,
            "overdue": overdue_actions,
            "pending_review": pending_review_actions
        },
        "governance": {
            "critical_risks": critical_risks,
            "pending_decisions": pending_decisions
        }
    }

@router.get("/audit-summary")
def get_audit_summary(db: Session = Depends(get_db)):
    audits = db.query(Audit).all()
    res = []
    for a in audits:
        f_count = len(a.findings)
        open_f = len([f for f in a.findings if f.status != "CLOSED"])
        res.append({
            "audit_code": a.code,
            "audit_title": a.title,
            "project_name": a.project.name if a.project else "N/A",
            "status": a.status,
            "total_findings": f_count,
            "open_findings": open_f,
            "start_date": str(a.start_date),
            "end_date": str(a.end_date)
        })
    return res

@router.get("/overdue-actions")
def get_overdue_actions(db: Session = Depends(get_db)):
    actions = db.query(Action).filter(Action.due_date < date.today(), Action.status != "COMPLETED", Action.status != "CLOSED").all()
    res = []
    for act in actions:
        res.append({
            "action_code": act.code,
            "description": act.description,
            "owner": act.owner.full_name if act.owner else "Unassigned",
            "due_date": str(act.due_date),
            "status": act.status,
            "source": "Finding: " + act.finding.code if act.finding else ("Gov Review: " + act.governance_review.review_number if act.governance_review else "Direct")
        })
    return res
