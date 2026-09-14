from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from datetime import date
from app.database import get_db
from app.models.models import (
    GovernanceReview, PMUpdate, GovernanceAssessment, GovernanceDecision, Action, Project, User
)
from app.schemas.schemas import (
    GovernanceReviewSchema, PMUpdateSchema, GovernanceAssessmentSchema, GovernanceDecisionSchema, ActionSchema
)
from app.auth.rbac import get_current_user, require_perm, log_audit_event

router = APIRouter(prefix="/governance-reviews", tags=["Governance Reviews"])

class CreateReviewRequest(BaseModel):
    project_id: str
    review_number: str
    review_date: date
    technology_center_manager_id: str

class PMUpdateRequestPayload(BaseModel):
    what_changed: str
    support_required: str
    pending_decisions: str
    executive_actions: str

class AssessmentRequestPayload(BaseModel):
    delivery_health: str # GREEN, AMBER, RED
    engineering_health: str # GREEN, AMBER, RED
    delivery_score: int
    engineering_score: int
    overall_score: int
    comments: Optional[str] = None

class DecisionRequestPayload(BaseModel):
    title: str
    description: str
    owner_id: str
    due_date: date
    status: str = "PENDING"
    final_decision: Optional[str] = None

class CreateGovActionPayload(BaseModel):
    code: str
    description: str
    owner_id: str
    due_date: date
    priority: str = "HIGH"

@router.get("", response_model=List[GovernanceReviewSchema])
def list_governance_reviews(project_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(GovernanceReview)
    if project_id:
        query = query.filter(GovernanceReview.project_id == project_id)
    return query.order_by(GovernanceReview.review_date.desc()).all()

@router.get("/{review_id}", response_model=GovernanceReviewSchema)
def get_governance_review(review_id: str, db: Session = Depends(get_db)):
    review = db.query(GovernanceReview).filter(GovernanceReview.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found")
    return review

@router.post("", response_model=GovernanceReviewSchema)
def create_governance_review(
    req: CreateReviewRequest,
    user: User = Depends(require_perm("CREATE", "GOVERNANCE_REVIEW")),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.project_id == req.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Find previous review if exists
    prev_review = db.query(GovernanceReview).filter(
        GovernanceReview.project_id == req.project_id
    ).order_by(GovernanceReview.review_date.desc()).first()

    review = GovernanceReview(
        project_id=req.project_id,
        review_number=req.review_number,
        review_date=req.review_date,
        review_status="DRAFT",
        overall_health_status=project.overall_health_status,
        previous_review_id=prev_review.review_id if prev_review else None,
        technology_center_manager_id=req.technology_center_manager_id
    )
    db.add(review)
    db.commit()
    db.refresh(review)

    log_audit_event(db, user.user_id, "CREATE", "GovernanceReview", review.review_id, {"number": review.review_number})
    return review

@router.post("/{review_id}/pm-update", response_model=PMUpdateSchema)
def submit_pm_update(
    review_id: str,
    payload: PMUpdateRequestPayload,
    user: User = Depends(require_perm("UPDATE", "GOVERNANCE_REVIEW")),
    db: Session = Depends(get_db)
):
    review = db.query(GovernanceReview).filter(GovernanceReview.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found")

    if review.pm_update:
        update = review.pm_update
        update.what_changed = payload.what_changed
        update.support_required = payload.support_required
        update.pending_decisions = payload.pending_decisions
        update.executive_actions = payload.executive_actions
    else:
        update = PMUpdate(
            review_id=review_id,
            submitted_by_id=user.user_id,
            what_changed=payload.what_changed,
            support_required=payload.support_required,
            pending_decisions=payload.pending_decisions,
            executive_actions=payload.executive_actions
        )
        db.add(update)

    if review.review_status == "DRAFT":
        review.review_status = "IN_REVIEW"

    db.commit()
    db.refresh(update)

    log_audit_event(db, user.user_id, "PM_UPDATE", "GovernanceReview", review_id, {"by": user.full_name})
    return update

@router.post("/{review_id}/assessment", response_model=GovernanceAssessmentSchema)
def submit_assessment(
    review_id: str,
    payload: AssessmentRequestPayload,
    user: User = Depends(require_perm("UPDATE", "GOVERNANCE_REVIEW")),
    db: Session = Depends(get_db)
):
    review = db.query(GovernanceReview).filter(GovernanceReview.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found")

    if review.assessment:
        assessment = review.assessment
        assessment.delivery_health = payload.delivery_health
        assessment.engineering_health = payload.engineering_health
        assessment.delivery_score = payload.delivery_score
        assessment.engineering_score = payload.engineering_score
        assessment.overall_score = payload.overall_score
        assessment.comments = payload.comments
    else:
        assessment = GovernanceAssessment(
            review_id=review_id,
            assessed_by_id=user.user_id,
            delivery_health=payload.delivery_health,
            engineering_health=payload.engineering_health,
            delivery_score=payload.delivery_score,
            engineering_score=payload.engineering_score,
            overall_score=payload.overall_score,
            comments=payload.comments
        )
        db.add(assessment)

    # Derive overall review health status
    if payload.delivery_health == "RED" or payload.engineering_health == "RED":
        review.overall_health_status = "RED"
    elif payload.delivery_health == "AMBER" or payload.engineering_health == "AMBER":
        review.overall_health_status = "AMBER"
    else:
        review.overall_health_status = "GREEN"

    db.commit()
    db.refresh(assessment)

    log_audit_event(db, user.user_id, "ASSESSMENT", "GovernanceReview", review_id, {"overall_score": payload.overall_score})
    return assessment

@router.post("/{review_id}/decisions", response_model=GovernanceDecisionSchema)
def create_decision(
    review_id: str,
    payload: DecisionRequestPayload,
    user: User = Depends(require_perm("CREATE", "GOVERNANCE_REVIEW")),
    db: Session = Depends(get_db)
):
    review = db.query(GovernanceReview).filter(GovernanceReview.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found")

    decision = GovernanceDecision(
        review_id=review_id,
        title=payload.title,
        description=payload.description,
        owner_id=payload.owner_id,
        due_date=payload.due_date,
        status=payload.status,
        final_decision=payload.final_decision,
        decision_date=date.today() if payload.final_decision else None
    )
    db.add(decision)
    db.commit()
    db.refresh(decision)

    log_audit_event(db, user.user_id, "CREATE_DECISION", "GovernanceReview", review_id, {"decision_title": decision.title})
    return decision

@router.post("/{review_id}/actions", response_model=ActionSchema)
def create_governance_action(
    review_id: str,
    payload: CreateGovActionPayload,
    user: User = Depends(require_perm("CREATE", "GOVERNANCE_REVIEW")),
    db: Session = Depends(get_db)
):
    review = db.query(GovernanceReview).filter(GovernanceReview.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found")

    gov_action = Action(
        code=payload.code,
        description=payload.description,
        governance_review_id=review_id,
        finding_id=None, # Governance originated
        owner_id=payload.owner_id,
        due_date=payload.due_date,
        priority=payload.priority,
        status="OPEN",
        review_status="NOT_SUBMITTED"
    )
    db.add(gov_action)
    db.commit()
    db.refresh(gov_action)

    log_audit_event(db, user.user_id, "CREATE_GOV_ACTION", "GovernanceReview", review_id, {"action_code": gov_action.code})
    return gov_action

@router.put("/{review_id}/complete", response_model=GovernanceReviewSchema)
def complete_review(
    review_id: str,
    user: User = Depends(require_perm("COMPLETE_REVIEW", "GOVERNANCE_REVIEW")),
    db: Session = Depends(get_db)
):
    review = db.query(GovernanceReview).filter(GovernanceReview.review_id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="Governance Review not found")

    review.review_status = "COMPLETED"
    
    # Update underlying Project health status based on review result!
    project = db.query(Project).filter(Project.project_id == review.project_id).first()
    if project:
        project.overall_health_status = review.overall_health_status

    db.commit()
    db.refresh(review)

    log_audit_event(db, user.user_id, "COMPLETE_REVIEW", "GovernanceReview", review_id, {"health": review.overall_health_status})
    return review
