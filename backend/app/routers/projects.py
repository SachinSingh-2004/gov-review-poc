from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.project import Project, Risk, Milestone
from app.models.campaign import Campaign
from app.models.audit import Audit
from app.models.finding import Finding
from app.models.action import Action
from app.models.user import User
from app.schemas.project import ProjectSchema, ProjectCreate, ProjectUpdate, RiskSchema, MilestoneSchema

router = APIRouter(prefix="/projects", tags=["Projects"])

def enrich_project(proj: Project, db: Session) -> dict:
    data = {
        "id": proj.id,
        "code": proj.code,
        "name": proj.name,
        "description": proj.description,
        "owner_id": proj.owner_id,
        "owner_name": proj.owner.full_name if proj.owner else "Unassigned",
        "health_status": proj.health_status,
        "created_at": proj.created_at,
        "updated_at": proj.updated_at,
        "risks": proj.risks,
        "milestones": proj.milestones,
    }

    # Dynamic calculation of related records
    campaigns = db.query(Campaign).filter(Campaign.project_id == proj.id).all()
    campaign_ids = [c.id for c in campaigns]
    data["campaign_count"] = len(campaigns)

    audits = db.query(Audit).filter(Audit.campaign_id.in_(campaign_ids)).all() if campaign_ids else []
    audit_ids = [a.id for a in audits]

    findings = db.query(Finding).filter(Finding.audit_id.in_(audit_ids)).all() if audit_ids else []
    finding_ids = [f.id for f in findings]

    data["open_findings_count"] = sum(1 for f in findings if f.status != "CLOSED")
    data["critical_findings_count"] = sum(1 for f in findings if f.severity == "CRITICAL" and f.status != "CLOSED")

    actions = db.query(Action).filter(Action.finding_id.in_(finding_ids)).all() if finding_ids else []
    data["overdue_actions_count"] = sum(1 for a in actions if a.status == "OVERDUE")

    return data

@router.get("", response_model=List[ProjectSchema])
def list_projects(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    projects = db.query(Project).all()
    return [enrich_project(p, db) for p in projects]

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return enrich_project(proj, db)

@router.post("", response_model=ProjectSchema)
def create_project(payload: ProjectCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("project.update"))):
    proj = Project(
        code=payload.code,
        name=payload.name,
        description=payload.description,
        owner_id=payload.owner_id,
        health_status=payload.health_status or "HEALTHY"
    )
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return enrich_project(proj, db)

@router.put("/{project_id}", response_model=ProjectSchema)
def update_project(project_id: str, payload: ProjectUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("project.update"))):
    proj = db.query(Project).filter(Project.id == project_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")

    if payload.name: proj.name = payload.name
    if payload.description: proj.description = payload.description
    if payload.owner_id: proj.owner_id = payload.owner_id
    if payload.health_status: proj.health_status = payload.health_status

    db.commit()
    db.refresh(proj)
    return enrich_project(proj, db)
