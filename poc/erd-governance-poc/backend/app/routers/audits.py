from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Audit, User, AuditParticipant
from app.schemas.schemas import AuditSchema
from app.auth.rbac import get_current_user

router = APIRouter(prefix="/audits", tags=["Audits"])

@router.get("", response_model=List[AuditSchema])
def list_audits(
    project_id: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Audit)
    if project_id:
        query = query.filter(Audit.project_id == project_id)
    
    # Data scope check for AUDITOR role
    user_roles = [r.name for r in user.roles]
    if "AUDITOR" in user_roles and "ADMIN" not in user_roles and "EXECUTIVE" not in user_roles and "AUDIT_MANAGER" not in user_roles:
        # Filter assigned audits
        query = query.join(AuditParticipant).filter(
            (Audit.lead_auditor_id == user.user_id) | (AuditParticipant.user_id == user.user_id)
        )
        
    return query.distinct().all()

@router.get("/{audit_id}", response_model=AuditSchema)
def get_audit(audit_id: str, db: Session = Depends(get_db)):
    audit = db.query(Audit).filter(Audit.audit_id == audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    return audit
