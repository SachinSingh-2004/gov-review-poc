from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

class RoleSchema(BaseModel):
    role_id: int
    role_code: str
    role_name: str
    class Config:
        from_attributes = True

class UserSchema(BaseModel):
    user_id: int
    display_name: str
    email: str
    username: str
    roles: List[RoleSchema] = []
    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    user: UserSchema
    role_code: str
    assigned_project_id: Optional[int] = None
    token: str

class ProjectSchema(BaseModel):
    project_id: int
    project_code: str
    project_name: str
    class Config:
        from_attributes = True

class ProjectHealthSchema(BaseModel):
    project_health_id: int
    governance_review_id: int
    schedule_health: str
    budget_status: str
    open_risk_count: int
    open_finding_count: int
    overall_health: str
    class Config:
        from_attributes = True

class UpdateProjectHealthRequest(BaseModel):
    schedule_health: str
    budget_status: str
    overall_health: str

class TechnicalAssessmentSchema(BaseModel):
    technical_assessment_id: int
    governance_review_id: int
    technical_readiness_score: int
    technical_health: str
    comments: Optional[str] = None
    assessed_by: int
    assessed_at: datetime
    assessor: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class UpdateTechnicalAssessmentRequest(BaseModel):
    technical_readiness_score: int = Field(..., ge=1, le=5)
    technical_health: str
    comments: Optional[str] = None

class ActionSchema(BaseModel):
    action_id: int
    finding_id: int
    description: str
    owner_id: int
    status: str
    due_date: date
    owner: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class CreateActionRequest(BaseModel):
    description: str
    owner_id: int
    status: str = "OPEN"
    due_date: date

class FindingSchema(BaseModel):
    finding_id: int
    audit_id: int
    finding_reference: str
    title: str
    severity: str
    status: str
    actions: List[ActionSchema] = []
    class Config:
        from_attributes = True

class CreateFindingRequest(BaseModel):
    finding_reference: str
    title: str
    severity: str # MAJOR, MINOR, CRITICAL
    status: str = "OPEN"

class AuditSchema(BaseModel):
    audit_id: int
    project_id: int
    audit_name: str
    audit_type: str
    audit_status: str
    planned_date: date
    actual_date: Optional[date] = None
    findings: List[FindingSchema] = []
    class Config:
        from_attributes = True

class CreateAuditRequest(BaseModel):
    audit_name: str
    audit_type: str
    audit_status: str = "IN_PROGRESS"
    planned_date: date

class RiskSchema(BaseModel):
    risk_id: int
    project_id: int
    title: str
    status: str
    impact: str
    probability: str
    class Config:
        from_attributes = True

class CreateRiskRequest(BaseModel):
    title: str
    status: str = "OPEN"
    impact: str = "MEDIUM"
    probability: str = "MEDIUM"

class GovernanceReviewSchema(BaseModel):
    governance_review_id: int
    project_id: int
    review_number: str
    review_date: date
    review_status: str
    project: Optional[ProjectSchema] = None
    project_health: Optional[ProjectHealthSchema] = None
    technical_assessment: Optional[TechnicalAssessmentSchema] = None
    class Config:
        from_attributes = True
