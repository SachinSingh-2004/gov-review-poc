from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.finding import Finding
from app.models.action import Action
from app.models.governance import AuditLog
from app.models.user import User
from app.schemas.finding import FindingSchema, FindingCreate, FindingUpdate

router = APIRouter(prefix="/findings", tags=["Findings"])

def enrich_finding(fnd: Finding, db: Session) -> dict:
    action_count = db.query(Action).filter(Action.finding_id == fnd.id).count()
    audit = fnd.audit
    campaign = audit.campaign if audit else None
    project = campaign.project if campaign else None

    return {
        "id": fnd.id,
        "code": fnd.code,
        "audit_id": fnd.audit_id,
        "audit_title": audit.title if audit else "Unassigned",
        "campaign_id": campaign.id if campaign else None,
        "campaign_name": campaign.name if campaign else "Unassigned",
        "project_id": project.id if project else None,
        "project_name": project.name if project else "Unassigned",
        "title": fnd.title,
        "description": fnd.description,
        "severity": fnd.severity,
        "status": fnd.status,
        "owner_id": fnd.owner_id,
        "owner_name": fnd.owner.full_name if fnd.owner else "Unassigned",
        "due_date": fnd.due_date,
        "closure_info": fnd.closure_info,
        "created_at": fnd.created_at,
        "updated_at": fnd.updated_at,
        "action_count": action_count
    }

@router.get("", response_model=List[FindingSchema])
def list_findings(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    findings = db.query(Finding).all()
    return [enrich_finding(f, db) for f in findings]

@router.get("/{finding_id}", response_model=FindingSchema)
def get_finding(finding_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    fnd = db.query(Finding).filter(Finding.id == finding_id).first()
    if not fnd:
        raise HTTPException(status_code=404, detail="Finding not found")
    return enrich_finding(fnd, db)

@router.post("", response_model=FindingSchema)
def create_finding(payload: FindingCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("finding.create"))):
    fnd = Finding(
        code=payload.code,
        audit_id=payload.audit_id,
        title=payload.title,
        description=payload.description,
        severity=payload.severity,
        owner_id=payload.owner_id,
        due_date=payload.due_date,
        status=payload.status or "OPEN"
    )
    db.add(fnd)
    db.commit()
    db.refresh(fnd)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="CREATE",
        entity_type="Finding",
        entity_id=fnd.id,
        details_json=f'{{"code": "{fnd.code}", "severity": "{fnd.severity}"}}'
    ))
    db.commit()

    return enrich_finding(fnd, db)

@router.put("/{finding_id}", response_model=FindingSchema)
def update_finding(finding_id: str, payload: FindingUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("finding.update"))):
    fnd = db.query(Finding).filter(Finding.id == finding_id).first()
    if not fnd:
        raise HTTPException(status_code=404, detail="Finding not found")

    old_status = fnd.status
    if payload.title: fnd.title = payload.title
    if payload.description: fnd.description = payload.description
    if payload.severity: fnd.severity = payload.severity
    if payload.status: fnd.status = payload.status
    if payload.owner_id: fnd.owner_id = payload.owner_id
    if payload.due_date: fnd.due_date = payload.due_date
    if payload.closure_info: fnd.closure_info = payload.closure_info

    db.commit()
    db.refresh(fnd)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="STATUS_CHANGE" if old_status != fnd.status else "UPDATE",
        entity_type="Finding",
        entity_id=fnd.id,
        details_json=f'{{"from": "{old_status}", "to": "{fnd.status}"}}'
    ))
    db.commit()

    return enrich_finding(fnd, db)
