from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Portfolio, TechnologyCenter, ProjectPhase
from app.schemas.schemas import PortfolioSchema, TechnologyCenterSchema, ProjectPhaseSchema

router = APIRouter(prefix="", tags=["Portfolios & Tech Centers"])

@router.get("/portfolios", response_model=List[PortfolioSchema])
def list_portfolios(db: Session = Depends(get_db)):
    return db.query(Portfolio).all()

@router.get("/technology-centers", response_model=List[TechnologyCenterSchema])
def list_technology_centers(db: Session = Depends(get_db)):
    return db.query(TechnologyCenter).all()

@router.get("/project-phases", response_model=List[ProjectPhaseSchema])
def list_project_phases(db: Session = Depends(get_db)):
    return db.query(ProjectPhase).order_by(ProjectPhase.sequence).all()
