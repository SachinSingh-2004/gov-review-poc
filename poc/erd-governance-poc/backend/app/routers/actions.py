from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.database import get_db
from app.models.models import Action, Finding, GovernanceReview, User
from app.schemas.schemas import ActionSchema
from app.auth.rbac import get_current_user, require_perm, log_audit_event

router = APIRouter(prefix="/actions", tags=["Action Centre"])

class UpdateActionRequest(BaseModel):
    description: Optional[str] = None
    status: Optional[str] = None # OPEN, IN_PROGRESS, PENDING_REVIEW, COMPLETED, OVERDUE, CLOSED
    review_status: Optional[str] = None # NOT_SUBMITTED, PENDING, APPROVED, REJECTED
    completion_date: Optional[date] = None

class AssignActionRequest(BaseModel):
    owner_id: str
    reviewer_id: Optional[str] = None

@router.get("", response_model=List[ActionSchema])
def list_actions(
    my_actions_only: bool = False,
    status_filter: Optional[str] = None,
    source_type: Optional[str] = None, # FINDING or GOVERNANCE_REVIEW
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Action)
    
    if my_actions_only:
        query = query.filter(Action.owner_id == user.user_id)
    else:
        # Data scope check
        user_role_names = [r.name for r in user.roles]
        if "ACTION_OWNER" in user_role_names and "ADMIN" not in user_role_names and "EXECUTIVE" not in user_role_names and "AUDIT_MANAGER" not in user_role_names:
            query = query.filter(Action.owner_id == user.user_id)
            
    if status_filter:
        query = query.filter(Action.status == status_filter)
        
    if source_type == "FINDING":
        query = query.filter(Action.finding_id.isnot(None))
    elif source_type == "GOVERNANCE_REVIEW":
        query = query.filter(Action.governance_review_id.isnot(None))

    return query.all()

@router.get("/{action_id}", response_model=ActionSchema)
def get_action(action_id: str, db: Session = Depends(get_db)):
    action = db.query(Action).filter(Action.action_id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    return action

@router.put("/{action_id}", response_model=ActionSchema)
def update_action(
    action_id: str,
    req: UpdateActionRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    action = db.query(Action).filter(Action.action_id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    user_roles = [r.name for r in user.roles]
    is_admin = "ADMIN" in user_roles or "EXECUTIVE" in user_roles or "AUDIT_MANAGER" in user_roles
    is_owner = action.owner_id == user.user_id
    is_reviewer = action.reviewer_id == user.user_id

    # Business Rule: Action owner cannot approve their own action!
    if req.review_status == "APPROVED" and is_owner and not is_admin and not is_reviewer:
        log_audit_event(
            db, user.user_id, "DENIED", "Action", action_id, 
            {"error": "Action Owner attempted self-approval", "user": user.full_name}
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business Rule Violation: Action owner cannot approve their own action. Approval required by assigned reviewer or auditor."
        )

    if req.description is not None:
        action.description = req.description
    if req.status is not None:
        action.status = req.status
    if req.review_status is not None:
        action.review_status = req.review_status
    if req.completion_date is not None:
        action.completion_date = req.completion_date

    db.commit()
    db.refresh(action)

    log_audit_event(
        db, user.user_id, "UPDATE", "Action", action_id, 
        {"status": action.status, "review_status": action.review_status}
    )
    return action

@router.put("/{action_id}/assign", response_model=ActionSchema)
def assign_action(
    action_id: str,
    req: AssignActionRequest,
    user: User = Depends(require_perm("ASSIGN", "ACTION")),
    db: Session = Depends(get_db)
):
    action = db.query(Action).filter(Action.action_id == action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    action.owner_id = req.owner_id
    if req.reviewer_id:
        action.reviewer_id = req.reviewer_id
        
    db.commit()
    db.refresh(action)

    log_audit_event(db, user.user_id, "ASSIGN", "Action", action_id, {"new_owner_id": req.owner_id})
    return action
