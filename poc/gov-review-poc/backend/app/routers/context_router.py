from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Audit, Finding, Action, Risk, ProjectHealth, GovernanceReview
from app.schemas import (
    AuditSchema, FindingSchema, ActionSchema, RiskSchema,
    CreateAuditRequest, CreateFindingRequest, CreateActionRequest, CreateRiskRequest
)
from app.auth import get_current_user

router = APIRouter(prefix="", tags=["Supporting Context"])

@router.get("/projects/{project_id}/audits", response_model=List[AuditSchema])
def list_project_audits(project_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Audit).filter(Audit.project_id == project_id).all()

@router.post("/projects/{project_id}/audits", response_model=AuditSchema)
def create_project_audit(
    project_id: int,
    req: CreateAuditRequest,
    user_tuple: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    audit = Audit(
        project_id=project_id,
        audit_name=req.audit_name,
        audit_type=req.audit_type,
        audit_status=req.audit_status,
        planned_date=req.planned_date
    )
    db.add(audit)
    db.commit()
    db.refresh(audit)
    return audit

@router.get("/audits/{audit_id}/findings", response_model=List[FindingSchema])
def list_audit_findings(audit_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Finding).filter(Finding.audit_id == audit_id).all()

@router.post("/audits/{audit_id}/findings", response_model=FindingSchema)
def create_audit_finding(
    audit_id: int,
    req: CreateFindingRequest,
    user_tuple: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    finding = Finding(
        audit_id=audit_id,
        finding_reference=req.finding_reference,
        title=req.title,
        severity=req.severity,
        status=req.status
    )
    db.add(finding)

    # Recalculate open finding count on ProjectHealth if linked to active review
    audit = db.query(Audit).filter(Audit.audit_id == audit_id).first()
    if audit:
        gov_review = db.query(GovernanceReview).filter(GovernanceReview.project_id == audit.project_id).first()
        if gov_review and gov_review.project_health:
            open_count = db.query(Finding).join(Audit).filter(
                Audit.project_id == audit.project_id, Finding.status == "OPEN"
            ).count() + (1 if req.status == "OPEN" else 0)
            gov_review.project_health.open_finding_count = open_count

    db.commit()
    db.refresh(finding)
    return finding

@router.get("/findings/{finding_id}/actions", response_model=List[ActionSchema])
def list_finding_actions(finding_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Action).filter(Action.finding_id == finding_id).all()

@router.post("/findings/{finding_id}/actions", response_model=ActionSchema)
def create_finding_action(
    finding_id: int,
    req: CreateActionRequest,
    user_tuple: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    action = Action(
        finding_id=finding_id,
        description=req.description,
        owner_id=req.owner_id,
        status=req.status,
        due_date=req.due_date
    )
    db.add(action)
    db.commit()
    db.refresh(action)
    return action

@router.get("/projects/{project_id}/risks", response_model=List[RiskSchema])
def list_project_risks(project_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.query(Risk).filter(Risk.project_id == project_id).all()

@router.post("/projects/{project_id}/risks", response_model=RiskSchema)
def create_project_risk(
    project_id: int,
    req: CreateRiskRequest,
    user_tuple: tuple = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    risk = Risk(
        project_id=project_id,
        title=req.title,
        status=req.status,
        impact=req.impact,
        probability=req.probability
    )
    db.add(risk)

    # Recalculate open risk count on ProjectHealth
    gov_review = db.query(GovernanceReview).filter(GovernanceReview.project_id == project_id).first()
    if gov_review and gov_review.project_health:
        open_count = db.query(Risk).filter(
            Risk.project_id == project_id, Risk.status == "OPEN"
        ).count() + (1 if req.status == "OPEN" else 0)
        gov_review.project_health.open_risk_count = open_count

    db.commit()
    db.refresh(risk)
    return risk
