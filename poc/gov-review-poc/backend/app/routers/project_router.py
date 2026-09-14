from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models import Project, ProjectMember
from app.schemas import ProjectSchema
from app.auth import get_current_user

router = APIRouter(prefix="", tags=["Projects"])

@router.get("/users/me/projects", response_model=List[ProjectSchema])
def list_my_assigned_projects(user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    user, _, _ = user_tuple
    memberships = db.query(ProjectMember).filter(ProjectMember.user_id == user.user_id).all()
    project_ids = [m.project_id for m in memberships]
    projects = db.query(Project).filter(Project.project_id.in_(project_ids)).all()
    return projects

@router.get("/projects/{project_id}", response_model=ProjectSchema)
def get_project(project_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.project_id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found.")
    return project
