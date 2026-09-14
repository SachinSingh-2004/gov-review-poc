from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.database import get_db
from app.models import GovernanceReview, ProjectHealth, TechnicalAssessment, User
from app.schemas import (
    GovernanceReviewSchema, ProjectHealthSchema, TechnicalAssessmentSchema,
    UpdateProjectHealthRequest, UpdateTechnicalAssessmentRequest
)
from app.auth import get_current_user, require_role

router = APIRouter(prefix="", tags=["Governance Reviews"])

@router.get("/projects/{project_id}/governance-reviews", response_model=List[GovernanceReviewSchema])
def list_project_governance_reviews(project_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    reviews = db.query(GovernanceReview).filter(GovernanceReview.project_id == project_id).all()
    return reviews

@router.get("/governance-reviews/{review_id}", response_model=GovernanceReviewSchema)
def get_governance_review(review_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    review = db.query(GovernanceReview).filter(GovernanceReview.governance_review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found.")
    return review

@router.get("/governance-reviews/{review_id}/health", response_model=ProjectHealthSchema)
def get_project_health(review_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    health = db.query(ProjectHealth).filter(ProjectHealth.governance_review_id == review_id).first()
    if not health:
        raise HTTPException(status_code=404, detail="Project Health record not found.")
    return health

@router.put("/governance-reviews/{review_id}/health", response_model=ProjectHealthSchema)
def update_project_health(
    review_id: int,
    req: UpdateProjectHealthRequest,
    user_tuple: tuple = Depends(require_role(["PM"])),
    db: Session = Depends(get_db)
):
    health = db.query(ProjectHealth).filter(ProjectHealth.governance_review_id == review_id).first()
    if not health:
        raise HTTPException(status_code=404, detail="Project Health record not found.")

    health.schedule_health = req.schedule_health
    health.budget_status = req.budget_status
    health.overall_health = req.overall_health

    db.commit()
    db.refresh(health)
    return health

@router.get("/governance-reviews/{review_id}/technical-assessment", response_model=TechnicalAssessmentSchema)
def get_technical_assessment(review_id: int, user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    assessment = db.query(TechnicalAssessment).filter(TechnicalAssessment.governance_review_id == review_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Technical Assessment not found.")
    return assessment

@router.put("/governance-reviews/{review_id}/technical-assessment", response_model=TechnicalAssessmentSchema)
def update_technical_assessment(
    review_id: int,
    req: UpdateTechnicalAssessmentRequest,
    user_tuple: tuple = Depends(require_role(["TL"])), # Only Technical Lead can edit!
    db: Session = Depends(get_db)
):
    user, role_code, _ = user_tuple
    assessment = db.query(TechnicalAssessment).filter(TechnicalAssessment.governance_review_id == review_id).first()
    if not assessment:
        raise HTTPException(status_code=404, detail="Technical Assessment not found.")

    assessment.technical_readiness_score = req.technical_readiness_score
    assessment.technical_health = req.technical_health
    if req.comments is not None:
        assessment.comments = req.comments
    assessment.assessed_by = user.user_id
    assessment.assessed_at = datetime.utcnow()

    db.commit()
    db.refresh(assessment)
    return assessment
