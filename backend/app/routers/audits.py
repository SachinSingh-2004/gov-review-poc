from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.audit import Audit
from app.models.finding import Finding
from app.models.governance import AuditLog
from app.models.user import User
from app.schemas.audit import AuditSchema, AuditCreate, AuditUpdate

router = APIRouter(prefix="/audits", tags=["Audits"])

def enrich_audit(aud: Audit, db: Session) -> dict:
    finding_count = db.query(Finding).filter(Finding.audit_id == aud.id).count()
    project = aud.campaign.project if aud.campaign else None
    return {
        "id": aud.id,
        "code": aud.code,
        "title": aud.title,
        "campaign_id": aud.campaign_id,
        "campaign_name": aud.campaign.name if aud.campaign else "Unassigned",
        "project_id": project.id if project else None,
        "project_name": project.name if project else "Unassigned",
        "lead_auditor_id": aud.lead_auditor_id,
        "lead_auditor_name": aud.lead_auditor.full_name if aud.lead_auditor else "Unassigned",
        "start_date": aud.start_date,
        "end_date": aud.end_date,
        "status": aud.status,
        "closure_percentage": float(aud.closure_percentage),
        "created_at": aud.created_at,
        "updated_at": aud.updated_at,
        "finding_count": finding_count
    }

@router.get("", response_model=List[AuditSchema])
def list_audits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    audits = db.query(Audit).all()
    return [enrich_audit(a, db) for a in audits]

@router.get("/{audit_id}", response_model=AuditSchema)
def get_audit(audit_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    aud = db.query(Audit).filter(Audit.id == audit_id).first()
    if not aud:
        raise HTTPException(status_code=404, detail="Audit not found")
    return enrich_audit(aud, db)

@router.post("", response_model=AuditSchema)
def create_audit(payload: AuditCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("audit.create"))):
    aud = Audit(
        code=payload.code,
        title=payload.title,
        campaign_id=payload.campaign_id,
        lead_auditor_id=payload.lead_auditor_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status or "PLANNED",
        closure_percentage=0.00
    )
    db.add(aud)
    db.commit()
    db.refresh(aud)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="CREATE",
        entity_type="Audit",
        entity_id=aud.id,
        details_json=f'{{"code": "{aud.code}", "title": "{aud.title}"}}'
    ))
    db.commit()

    return enrich_audit(aud, db)

@router.put("/{audit_id}", response_model=AuditSchema)
def update_audit(audit_id: str, payload: AuditUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("audit.update"))):
    aud = db.query(Audit).filter(Audit.id == audit_id).first()
    if not aud:
        raise HTTPException(status_code=404, detail="Audit not found")

    if payload.title: aud.title = payload.title
    if payload.campaign_id: aud.campaign_id = payload.campaign_id
    if payload.lead_auditor_id: aud.lead_auditor_id = payload.lead_auditor_id
    if payload.start_date: aud.start_date = payload.start_date
    if payload.end_date: aud.end_date = payload.end_date
    if payload.status: aud.status = payload.status
    if payload.closure_percentage is not None: aud.closure_percentage = payload.closure_percentage

    db.commit()
    db.refresh(aud)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="UPDATE",
        entity_type="Audit",
        entity_id=aud.id,
        details_json=f'{{"status": "{aud.status}", "closure_percentage": {aud.closure_percentage}}}'
    ))
    db.commit()

    return enrich_audit(aud, db)
