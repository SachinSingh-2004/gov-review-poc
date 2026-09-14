from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from app.database import get_db
from app.models.models import Evidence, Action, User
from app.schemas.schemas import EvidenceSchema
from app.auth.rbac import get_current_user, require_perm, log_audit_event

router = APIRouter(prefix="/evidence", tags=["Evidence"])

class ReviewEvidenceRequest(BaseModel):
    review_status: str # APPROVED, REJECTED
    comments: Optional[str] = None

class CreateEvidencePayload(BaseModel):
    action_id: str
    file_name: str
    file_type: str = "document"

@router.get("", response_model=List[EvidenceSchema])
def list_evidence(action_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Evidence)
    if action_id:
        query = query.filter(Evidence.action_id == action_id)
    return query.all()

@router.post("", response_model=EvidenceSchema)
def upload_evidence(
    payload: CreateEvidencePayload,
    user: User = Depends(require_perm("UPLOAD_EVIDENCE", "EVIDENCE")),
    db: Session = Depends(get_db)
):
    action = db.query(Action).filter(Action.action_id == payload.action_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found")
    
    evidence = Evidence(
        action_id=payload.action_id,
        file_name=payload.file_name,
        file_path=f"/uploads/{payload.file_name}",
        file_type=payload.file_type,
        file_size=2048,
        uploaded_by_id=user.user_id,
        review_status="PENDING"
    )
    db.add(evidence)
    
    # Update action review status
    action.status = "PENDING_REVIEW"
    action.review_status = "PENDING"
    
    db.commit()
    db.refresh(evidence)

    log_audit_event(db, user.user_id, "UPLOAD_EVIDENCE", "Evidence", evidence.evidence_id, {"file_name": evidence.file_name, "action_id": payload.action_id})
    return evidence

@router.put("/{evidence_id}/review", response_model=EvidenceSchema)
def review_evidence(
    evidence_id: str,
    req: ReviewEvidenceRequest,
    user: User = Depends(require_perm("REVIEW_EVIDENCE", "EVIDENCE")),
    db: Session = Depends(get_db)
):
    evidence = db.query(Evidence).filter(Evidence.evidence_id == evidence_id).first()
    if not evidence:
        raise HTTPException(status_code=404, detail="Evidence not found")
    
    action = db.query(Action).filter(Action.action_id == evidence.action_id).first()
    
    # Business Rule: Action Owner cannot review their own evidence unless admin
    user_roles = [r.name for r in user.roles]
    if evidence.uploaded_by_id == user.user_id and "ADMIN" not in user_roles and "AUDIT_MANAGER" not in user_roles:
        log_audit_event(db, user.user_id, "DENIED", "Evidence", evidence_id, {"error": "Self-review attempted"})
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Business Rule Violation: You cannot approve or reject evidence that you uploaded yourself."
        )

    evidence.review_status = req.review_status
    evidence.reviewer_id = user.user_id
    evidence.comments = req.comments

    if action:
        if req.review_status == "APPROVED":
            action.review_status = "APPROVED"
            action.status = "COMPLETED"
        elif req.review_status == "REJECTED":
            action.review_status = "REJECTED"
            action.status = "IN_PROGRESS"

    db.commit()
    db.refresh(evidence)

    log_audit_event(db, user.user_id, req.review_status, "Evidence", evidence_id, {"status": req.review_status})
    return evidence
