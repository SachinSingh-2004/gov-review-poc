from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models.models import Risk, Issue, Dependency, Milestone
from app.schemas.schemas import RiskSchema, IssueSchema, DependencySchema, MilestoneSchema

router = APIRouter(prefix="", tags=["Supporting Entities"])

@router.get("/risks", response_model=List[RiskSchema])
def list_risks(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Risk)
    if project_id:
        query = query.filter(Risk.project_id == project_id)
    return query.all()

@router.get("/issues", response_model=List[IssueSchema])
def list_issues(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Issue)
    if project_id:
        query = query.filter(Issue.project_id == project_id)
    return query.all()

@router.get("/dependencies", response_model=List[DependencySchema])
def list_dependencies(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Dependency)
    if project_id:
        query = query.filter((Dependency.source_project_id == project_id) | (Dependency.target_project_id == project_id))
    return query.all()

@router.get("/milestones", response_model=List[MilestoneSchema])
def list_milestones(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Milestone)
    if project_id:
        query = query.filter(Milestone.project_id == project_id)
    return query.order_by(Milestone.target_date).all()
