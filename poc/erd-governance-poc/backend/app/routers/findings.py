from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.database import get_db
from app.models.models import Finding, Audit, User
from app.schemas.schemas import FindingSchema
from app.auth.rbac import get_current_user, require_perm, log_audit_event

router = APIRouter(prefix="/findings", tags=["Findings"])

class CreateFindingRequest(BaseModel):
    audit_id: str
    code: str
    title: str
    description: Optional[str] = None
    severity: str # CRITICAL, MAJOR, MINOR
    owner_id: str
    due_date: date

@router.get("", response_model=List[FindingSchema])
def list_findings(
    audit_id: Optional[str] = None,
    project_id: Optional[str] = None,
    status_filter: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Finding)
    if audit_id:
        query = query.filter(Finding.audit_id == audit_id)
    if project_id:
        query = query.join(Audit).filter(Audit.project_id == project_id)
    if status_filter:
        query = query.filter(Finding.status == status_filter)
    return query.all()

@router.get("/{finding_id}", response_model=FindingSchema)
def get_finding(finding_id: str, db: Session = Depends(get_db)):
    finding = db.query(Finding).filter(Finding.finding_id == finding_id).first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return finding

@router.post("", response_model=FindingSchema)
def create_finding(
    req: CreateFindingRequest,
    user: User = Depends(require_perm("CREATE", "FINDING")),
    db: Session = Depends(get_db)
):
    audit = db.query(Audit).filter(Audit.audit_id == req.audit_id).first()
    if not audit:
        raise HTTPException(status_code=404, detail="Audit not found")
    
    finding = Finding(
        code=req.code,
        audit_id=req.audit_id,
        title=req.title,
        description=req.description,
        severity=req.severity,
        status="OPEN",
        owner_id=req.owner_id,
        due_date=req.due_date
    )
    db.add(finding)
    db.commit()
    db.refresh(finding)

    log_audit_event(db, user.user_id, "CREATE", "Finding", finding.finding_id, {"title": finding.title, "code": finding.code})
    return finding
