from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.audit import Audit
from app.models.finding import Finding
from app.models.governance import AuditLog
from app.models.user import User
from app.schemas.audit import AuditSchema, AuditCreate, AuditUpdate, AuditConflictCheckRequest, AuditConflictCheckResponse, OverlappingAuditInfo

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
        "lead_auditor_email": aud.lead_auditor.email if aud.lead_auditor else None,
        "start_date": aud.start_date,
        "end_date": aud.end_date,
        "status": aud.status,
        "audit_type": getattr(aud, "audit_type", "PROCESS") or "PROCESS",
        "recurrence_pattern": getattr(aud, "recurrence_pattern", "NONE") or "NONE",
        "scope_description": getattr(aud, "scope_description", None),
        "estimated_hours": float(getattr(aud, "estimated_hours", 40.0) or 40.0),
        "milestone_id": getattr(aud, "milestone_id", None),
        "milestone_title": aud.milestone.title if getattr(aud, "milestone", None) else None,
        "closure_percentage": float(aud.closure_percentage),
        "created_at": aud.created_at,
        "updated_at": aud.updated_at,
        "finding_count": finding_count
    }

@router.get("", response_model=List[AuditSchema])
def list_audits(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    audits = db.query(Audit).all()
    return [enrich_audit(a, db) for a in audits]

@router.post("/schedule/check-conflicts", response_model=AuditConflictCheckResponse)
def check_schedule_conflicts(
    payload: AuditConflictCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Checks if assigning a Lead Auditor during [start_date, end_date] conflicts with existing scheduled audits.
    """
    query = db.query(Audit).filter(
        Audit.lead_auditor_id == payload.lead_auditor_id,
        Audit.status.in_(["PLANNED", "IN_PROGRESS", "FIELDWORK", "ATTENTION"]),
        Audit.start_date <= payload.end_date,
        Audit.end_date >= payload.start_date
    )
    if payload.exclude_audit_id:
        query = query.filter(Audit.id != payload.exclude_audit_id)

    overlapping = query.all()
    has_conflict = len(overlapping) > 0
    conflict_list = [
        OverlappingAuditInfo(
            id=a.id,
            code=a.code,
            title=a.title,
            start_date=a.start_date,
            end_date=a.end_date,
            status=a.status
        )
        for a in overlapping
    ]

    msg = f"Found {len(overlapping)} schedule conflict(s)." if has_conflict else "No schedule conflicts detected."
    return AuditConflictCheckResponse(
        has_conflict=has_conflict,
        conflict_count=len(overlapping),
        overlapping_audits=conflict_list,
        message=msg
    )

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
        audit_type=payload.audit_type or "PROCESS",
        recurrence_pattern=payload.recurrence_pattern or "NONE",
        scope_description=payload.scope_description,
        estimated_hours=payload.estimated_hours or 40.0,
        milestone_id=payload.milestone_id,
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
        details_json=f'{{"code": "{aud.code}", "title": "{aud.title}", "audit_type": "{aud.audit_type}"}}'
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
    if payload.audit_type: aud.audit_type = payload.audit_type
    if payload.recurrence_pattern: aud.recurrence_pattern = payload.recurrence_pattern
    if payload.scope_description is not None: aud.scope_description = payload.scope_description
    if payload.estimated_hours is not None: aud.estimated_hours = payload.estimated_hours
    if payload.milestone_id is not None: aud.milestone_id = payload.milestone_id
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
