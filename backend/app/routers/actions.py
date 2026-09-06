from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import date

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.action import Action
from app.models.finding import Finding
from app.models.governance import AuditLog
from app.models.user import User
from app.schemas.action import ActionSchema, ActionCreate, ActionUpdate

router = APIRouter(prefix="/actions", tags=["Corrective Actions"])

def enrich_action(act: Action, db: Session) -> dict:
    finding = act.finding
    audit = finding.audit if finding else None
    campaign = audit.campaign if audit else None
    project = campaign.project if campaign else None

    return {
        "id": act.id,
        "code": act.code,
        "finding_id": act.finding_id,
        "finding_title": finding.title if finding else "Unassigned",
        "audit_id": audit.id if audit else None,
        "project_id": project.id if project else None,
        "project_name": project.name if project else "Unassigned",
        "description": act.description,
        "owner_id": act.owner_id,
        "owner_name": act.owner.full_name if act.owner else "Unassigned",
        "due_date": act.due_date,
        "status": act.status,
        "completion_date": act.completion_date,
        "evidence_summary": act.evidence_summary,
        "reviewer_id": act.reviewer_id,
        "reviewer_name": act.reviewer.full_name if act.reviewer else None,
        "created_at": act.created_at,
        "updated_at": act.updated_at
    }

@router.get("", response_model=List[ActionSchema])
def list_actions(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    actions = db.query(Action).all()
    return [enrich_action(a, db) for a in actions]

@router.get("/{action_id}", response_model=ActionSchema)
def get_action(action_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    act = db.query(Action).filter(Action.id == action_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Action not found")
    return enrich_action(act, db)

@router.post("", response_model=ActionSchema)
def create_action(payload: ActionCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("action.create"))):
    act = Action(
        code=payload.code,
        finding_id=payload.finding_id,
        description=payload.description,
        owner_id=payload.owner_id,
        due_date=payload.due_date,
        status=payload.status or "OPEN"
    )
    db.add(act)
    db.commit()
    db.refresh(act)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="CREATE",
        entity_type="Action",
        entity_id=act.id,
        details_json=f'{{"code": "{act.code}"}}'
    ))
    db.commit()

    return enrich_action(act, db)

@router.put("/{action_id}", response_model=ActionSchema)
def update_action(action_id: str, payload: ActionUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("action.update"))):
    act = db.query(Action).filter(Action.id == action_id).first()
    if not act:
        raise HTTPException(status_code=404, detail="Action not found")

    old_status = act.status
    if payload.description: act.description = payload.description
    if payload.owner_id: act.owner_id = payload.owner_id
    if payload.due_date: act.due_date = payload.due_date
    if payload.evidence_summary is not None: act.evidence_summary = payload.evidence_summary
    if payload.reviewer_id: act.reviewer_id = payload.reviewer_id

    if payload.status:
        act.status = payload.status
        if payload.status in ["COMPLETED", "CLOSED"] and not act.completion_date:
            act.completion_date = date.today()

    db.commit()
    db.refresh(act)

    db.add(AuditLog(
        user_id=current_user.id,
        action_type="STATUS_CHANGE" if old_status != act.status else "UPDATE",
        entity_type="Action",
        entity_id=act.id,
        details_json=f'{{"from": "{old_status}", "to": "{act.status}"}}'
    ))
    db.commit()

    return enrich_action(act, db)
