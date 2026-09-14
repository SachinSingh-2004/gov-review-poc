from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date, datetime

# User & Role Schemas
class PermissionSchema(BaseModel):
    permission_id: str
    code: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class RoleSchema(BaseModel):
    role_id: str
    name: str
    description: Optional[str] = None
    permissions: List[PermissionSchema] = []
    class Config:
        from_attributes = True

class UserSchema(BaseModel):
    user_id: str
    username: str
    email: str
    full_name: str
    department: Optional[str] = None
    is_active: bool
    roles: List[RoleSchema] = []
    class Config:
        from_attributes = True

# Portfolio & Project Schemas
class PortfolioSchema(BaseModel):
    portfolio_id: str
    name: str
    code: str
    description: Optional[str] = None
    class Config:
        from_attributes = True

class TechnologyCenterSchema(BaseModel):
    technology_center_id: str
    name: str
    code: str
    lead_user_id: Optional[str] = None
    lead_user: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class ProjectPhaseSchema(BaseModel):
    phase_id: str
    name: str
    code: str
    sequence: int
    class Config:
        from_attributes = True

class ProjectSchema(BaseModel):
    project_id: str
    code: str
    name: str
    description: Optional[str] = None
    portfolio_id: str
    technology_center_id: str
    current_phase_id: str
    project_manager_id: str
    technical_lead_id: str
    overall_health_status: str
    portfolio: Optional[PortfolioSchema] = None
    technology_center: Optional[TechnologyCenterSchema] = None
    current_phase: Optional[ProjectPhaseSchema] = None
    project_manager: Optional[UserSchema] = None
    technical_lead: Optional[UserSchema] = None
    class Config:
        from_attributes = True

# Audit, Finding, Action, Evidence Schemas
class AuditParticipantSchema(BaseModel):
    audit_id: str
    user_id: str
    role_in_audit: str
    user: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class AuditSchema(BaseModel):
    audit_id: str
    code: str
    title: str
    project_id: str
    lead_auditor_id: str
    start_date: date
    end_date: date
    status: str
    audit_type: str
    scope_description: Optional[str] = None
    project: Optional[ProjectSchema] = None
    lead_auditor: Optional[UserSchema] = None
    participants: List[AuditParticipantSchema] = []
    class Config:
        from_attributes = True

class FindingSchema(BaseModel):
    finding_id: str
    code: str
    audit_id: str
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    owner_id: str
    due_date: date
    audit: Optional[AuditSchema] = None
    owner: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class EvidenceSchema(BaseModel):
    evidence_id: str
    action_id: str
    file_name: str
    file_path: str
    file_type: str
    file_size: int
    uploaded_by_id: str
    review_status: str
    reviewer_id: Optional[str] = None
    comments: Optional[str] = None
    uploaded_at: datetime
    uploaded_by: Optional[UserSchema] = None
    reviewer: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class ActionSchema(BaseModel):
    action_id: str
    code: str
    description: str
    finding_id: Optional[str] = None
    governance_review_id: Optional[str] = None
    owner_id: str
    reviewer_id: Optional[str] = None
    priority: str
    status: str
    due_date: date
    completion_date: Optional[date] = None
    review_status: str
    owner: Optional[UserSchema] = None
    reviewer: Optional[UserSchema] = None
    finding: Optional[FindingSchema] = None
    evidence_list: List[EvidenceSchema] = []
    class Config:
        from_attributes = True

# Supporting Schemas
class RiskSchema(BaseModel):
    risk_id: str
    project_id: str
    title: str
    risk_level: str
    mitigation_plan: Optional[str] = None
    status: str
    class Config:
        from_attributes = True

class IssueSchema(BaseModel):
    issue_id: str
    project_id: str
    title: str
    severity: str
    resolution_plan: Optional[str] = None
    status: str
    class Config:
        from_attributes = True

class DependencySchema(BaseModel):
    dependency_id: str
    source_project_id: str
    target_project_id: str
    description: str
    dependency_type: str
    status: str
    source_project: Optional[ProjectSchema] = None
    target_project: Optional[ProjectSchema] = None
    class Config:
        from_attributes = True

class MilestoneSchema(BaseModel):
    milestone_id: str
    project_id: str
    title: str
    target_date: date
    status: str
    class Config:
        from_attributes = True

# Governance Review Schemas
class PMUpdateSchema(BaseModel):
    update_id: str
    review_id: str
    submitted_by_id: str
    what_changed: Optional[str] = None
    support_required: Optional[str] = None
    pending_decisions: Optional[str] = None
    executive_actions: Optional[str] = None
    submitted_at: datetime
    submitted_by: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class GovernanceAssessmentSchema(BaseModel):
    assessment_id: str
    review_id: str
    assessed_by_id: str
    delivery_health: str
    engineering_health: str
    delivery_score: int
    engineering_score: int
    overall_score: int
    comments: Optional[str] = None
    assessed_at: datetime
    assessed_by: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class GovernanceDecisionSchema(BaseModel):
    decision_id: str
    review_id: str
    title: str
    description: Optional[str] = None
    owner_id: str
    status: str
    due_date: date
    decision_date: Optional[date] = None
    final_decision: Optional[str] = None
    owner: Optional[UserSchema] = None
    class Config:
        from_attributes = True

class GovernanceReviewSchema(BaseModel):
    review_id: str
    project_id: str
    review_number: str
    review_date: date
    review_status: str
    overall_health_status: str
    previous_review_id: Optional[str] = None
    technology_center_manager_id: str
    project: Optional[ProjectSchema] = None
    technology_center_manager: Optional[UserSchema] = None
    pm_update: Optional[PMUpdateSchema] = None
    assessment: Optional[GovernanceAssessmentSchema] = None
    decisions: List[GovernanceDecisionSchema] = []
    governance_actions: List[ActionSchema] = []
    class Config:
        from_attributes = True

# Audit Log Schema
class AuditLogSchema(BaseModel):
    log_id: str
    user_id: str
    action_type: str
    entity_type: str
    entity_id: str
    details_json: Optional[str] = None
    timestamp: datetime
    user: Optional[UserSchema] = None
    class Config:
        from_attributes = True
