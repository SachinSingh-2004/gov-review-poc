from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Project, User
from app.schemas.schemas import ProjectSchema
from app.auth.rbac import get_current_user

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.get("", response_model=List[ProjectSchema])
def list_projects(
    portfolio_id: Optional[str] = None,
    technology_center_id: Optional[str] = None,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Project)
    if portfolio_id:
        query = query.filter(Project.portfolio_id == portfolio_id)
    if technology_center_id:
        query = query.filter(Project.technology_center_id == technology_center_id)
    
    # Apply Data Scope if restricted role (e.g. PROJECT_MANAGER scope)
    user_role_names = [r.name for r in user.roles]
    if "PROJECT_MANAGER" in user_role_names and "ADMIN" not in user_role_names and "EXECUTIVE" not in user_role_names:
        # Show projects managed by or tech lead by user
        query = query.filter(
            (Project.project_manager_id == user.user_id) | 
            (Project.technical_lead_id == user.user_id)
        )
    
    return query.all()

@router.get("/{project_id}", response_model=ProjectSchema)
def get_project(project_id: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project
