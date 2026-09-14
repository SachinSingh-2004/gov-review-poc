import uuid
from datetime import datetime, date
from sqlalchemy import (
    Column, String, Text, Boolean, Integer, Date, DateTime, 
    ForeignKey, Table
)
from sqlalchemy.orm import relationship
from app.database import Base

def generate_uuid():
    return str(uuid.uuid4())

# Association Tables
user_roles = Table(
    'user_roles',
    Base.metadata,
    Column('user_id', String(36), ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True),
    Column('role_id', String(36), ForeignKey('roles.role_id', ondelete="CASCADE"), primary_key=True)
)

role_permissions = Table(
    'role_permissions',
    Base.metadata,
    Column('role_id', String(36), ForeignKey('roles.role_id', ondelete="CASCADE"), primary_key=True),
    Column('permission_id', String(36), ForeignKey('permissions.permission_id', ondelete="CASCADE"), primary_key=True)
)

class AuditParticipant(Base):
    __tablename__ = 'audit_participants'
    audit_id = Column(String(36), ForeignKey('audits.audit_id', ondelete="CASCADE"), primary_key=True)
    user_id = Column(String(36), ForeignKey('users.user_id', ondelete="CASCADE"), primary_key=True)
    role_in_audit = Column(String(50), default="Auditee")

    audit = relationship("Audit", back_populates="participants")
    user = relationship("User")

# 1. Identity & RBAC Entities
class User(Base):
    __tablename__ = 'users'
    user_id = Column(String(36), primary_key=True, default=generate_uuid)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    full_name = Column(String(100), nullable=False)
    department = Column(String(100), default="R&D Governance")
    is_active = Column(Boolean, default=True)

    roles = relationship("Role", secondary=user_roles, back_populates="users")
    logs = relationship("AuditLog", back_populates="user")

class Role(Base):
    __tablename__ = 'roles'
    role_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))

    users = relationship("User", secondary=user_roles, back_populates="roles")
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")

class Permission(Base):
    __tablename__ = 'permissions'
    permission_id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(50), unique=True, nullable=False)
    description = Column(String(255))

    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")

# 2. Portfolio & Project Entities
class Portfolio(Base):
    __tablename__ = 'portfolios'
    portfolio_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text)

    projects = relationship("Project", back_populates="portfolio")

class TechnologyCenter(Base):
    __tablename__ = 'technology_centers'
    technology_center_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(150), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    lead_user_id = Column(String(36), ForeignKey('users.user_id'), nullable=True)

    lead_user = relationship("User")
    projects = relationship("Project", back_populates="technology_center")

class ProjectPhase(Base):
    __tablename__ = 'project_phases'
    phase_id = Column(String(36), primary_key=True, default=generate_uuid)
    name = Column(String(100), nullable=False)
    code = Column(String(20), unique=True, nullable=False)
    sequence = Column(Integer, default=1)

    projects = relationship("Project", back_populates="current_phase")

class Project(Base):
    __tablename__ = 'projects'
    project_id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(20), unique=True, nullable=False)
    name = Column(String(150), nullable=False)
    description = Column(Text)
    portfolio_id = Column(String(36), ForeignKey('portfolios.portfolio_id'), nullable=False)
    technology_center_id = Column(String(36), ForeignKey('technology_centers.technology_center_id'), nullable=False)
    current_phase_id = Column(String(36), ForeignKey('project_phases.phase_id'), nullable=False)
    project_manager_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    technical_lead_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    overall_health_status = Column(String(20), default="GREEN") # GREEN, AMBER, RED

    portfolio = relationship("Portfolio", back_populates="projects")
    technology_center = relationship("TechnologyCenter", back_populates="projects")
    current_phase = relationship("ProjectPhase", back_populates="projects")
    project_manager = relationship("User", foreign_keys=[project_manager_id])
    technical_lead = relationship("User", foreign_keys=[technical_lead_id])

    audits = relationship("Audit", back_populates="project")
    risks = relationship("Risk", back_populates="project")
    issues = relationship("Issue", back_populates="project")
    milestones = relationship("Milestone", back_populates="project")
    governance_reviews = relationship("GovernanceReview", back_populates="project")

# 3. Audit, Finding, Action & Evidence Entities
class Audit(Base):
    __tablename__ = 'audits'
    audit_id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(20), unique=True, nullable=False)
    title = Column(String(200), nullable=False)
    project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    lead_auditor_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default="PLANNED") # PLANNED, IN_PROGRESS, COMPLETED, CLOSED
    audit_type = Column(String(50), default="PROCESS")
    scope_description = Column(Text)

    project = relationship("Project", back_populates="audits")
    lead_auditor = relationship("User", foreign_keys=[lead_auditor_id])
    participants = relationship("AuditParticipant", back_populates="audit", cascade="all, delete-orphan")
    findings = relationship("Finding", back_populates="audit")

class Finding(Base):
    __tablename__ = 'findings'
    finding_id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(20), unique=True, nullable=False)
    audit_id = Column(String(36), ForeignKey('audits.audit_id'), nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text)
    severity = Column(String(20), nullable=False) # CRITICAL, MAJOR, MINOR
    status = Column(String(20), default="OPEN") # OPEN, IN_PROGRESS, CLOSED
    owner_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    due_date = Column(Date, nullable=False)

    audit = relationship("Audit", back_populates="findings")
    owner = relationship("User", foreign_keys=[owner_id])
    actions = relationship("Action", back_populates="finding")

class Action(Base):
    __tablename__ = 'actions'
    action_id = Column(String(36), primary_key=True, default=generate_uuid)
    code = Column(String(20), unique=True, nullable=False)
    description = Column(Text, nullable=False)
    finding_id = Column(String(36), ForeignKey('findings.finding_id'), nullable=True)
    governance_review_id = Column(String(36), ForeignKey('governance_reviews.review_id'), nullable=True)
    owner_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    reviewer_id = Column(String(36), ForeignKey('users.user_id'), nullable=True)
    priority = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW
    status = Column(String(20), default="OPEN") # OPEN, IN_PROGRESS, PENDING_REVIEW, COMPLETED, OVERDUE, CLOSED
    due_date = Column(Date, nullable=False)
    completion_date = Column(Date, nullable=True)
    review_status = Column(String(20), default="NOT_SUBMITTED") # NOT_SUBMITTED, PENDING, APPROVED, REJECTED

    finding = relationship("Finding", back_populates="actions")
    governance_review = relationship("GovernanceReview", back_populates="governance_actions")
    owner = relationship("User", foreign_keys=[owner_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])
    evidence_list = relationship("Evidence", back_populates="action")

class Evidence(Base):
    __tablename__ = 'evidence'
    evidence_id = Column(String(36), primary_key=True, default=generate_uuid)
    action_id = Column(String(36), ForeignKey('actions.action_id'), nullable=False)
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_type = Column(String(100), default="document")
    file_size = Column(Integer, default=1024)
    uploaded_by_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    review_status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    reviewer_id = Column(String(36), ForeignKey('users.user_id'), nullable=True)
    comments = Column(Text)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    action = relationship("Action", back_populates="evidence_list")
    uploaded_by = relationship("User", foreign_keys=[uploaded_by_id])
    reviewer = relationship("User", foreign_keys=[reviewer_id])

# 4. Supporting Entities
class Risk(Base):
    __tablename__ = 'risks'
    risk_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    title = Column(String(200), nullable=False)
    risk_level = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW
    mitigation_plan = Column(Text)
    status = Column(String(20), default="OPEN") # OPEN, MITIGATED, CLOSED

    project = relationship("Project", back_populates="risks")

class Issue(Base):
    __tablename__ = 'issues'
    issue_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    title = Column(String(200), nullable=False)
    severity = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW
    resolution_plan = Column(Text)
    status = Column(String(20), default="OPEN") # OPEN, IN_PROGRESS, RESOLVED

    project = relationship("Project", back_populates="issues")

class Dependency(Base):
    __tablename__ = 'dependencies'
    dependency_id = Column(String(36), primary_key=True, default=generate_uuid)
    source_project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    target_project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    description = Column(Text, nullable=False)
    dependency_type = Column(String(50), default="TECHNICAL") # TECHNICAL, RESOURCE, SCHEDULE
    status = Column(String(20), default="ACTIVE") # ACTIVE, RESOLVED

    source_project = relationship("Project", foreign_keys=[source_project_id])
    target_project = relationship("Project", foreign_keys=[target_project_id])

class Milestone(Base):
    __tablename__ = 'milestones'
    milestone_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    title = Column(String(200), nullable=False)
    target_date = Column(Date, nullable=False)
    status = Column(String(20), default="PLANNED") # PLANNED, IN_PROGRESS, COMPLETED

    project = relationship("Project", back_populates="milestones")

# 5. Governance Review Entities
class GovernanceReview(Base):
    __tablename__ = 'governance_reviews'
    review_id = Column(String(36), primary_key=True, default=generate_uuid)
    project_id = Column(String(36), ForeignKey('projects.project_id'), nullable=False)
    review_number = Column(String(20), nullable=False)
    review_date = Column(Date, nullable=False)
    review_status = Column(String(20), default="DRAFT") # DRAFT, IN_REVIEW, COMPLETED
    overall_health_status = Column(String(20), default="AMBER") # GREEN, AMBER, RED
    previous_review_id = Column(String(36), ForeignKey('governance_reviews.review_id'), nullable=True)
    technology_center_manager_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)

    project = relationship("Project", back_populates="governance_reviews")
    technology_center_manager = relationship("User", foreign_keys=[technology_center_manager_id])
    previous_review = relationship("GovernanceReview", remote_side=[review_id])

    pm_update = relationship("PMUpdate", back_populates="governance_review", uselist=False)
    assessment = relationship("GovernanceAssessment", back_populates="governance_review", uselist=False)
    decisions = relationship("GovernanceDecision", back_populates="governance_review")
    governance_actions = relationship("Action", back_populates="governance_review")

class PMUpdate(Base):
    __tablename__ = 'pm_updates'
    update_id = Column(String(36), primary_key=True, default=generate_uuid)
    review_id = Column(String(36), ForeignKey('governance_reviews.review_id'), nullable=False, unique=True)
    submitted_by_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    what_changed = Column(Text)
    support_required = Column(Text)
    pending_decisions = Column(Text)
    executive_actions = Column(Text)
    submitted_at = Column(DateTime, default=datetime.utcnow)

    governance_review = relationship("GovernanceReview", back_populates="pm_update")
    submitted_by = relationship("User", foreign_keys=[submitted_by_id])

class GovernanceAssessment(Base):
    __tablename__ = 'governance_assessments'
    assessment_id = Column(String(36), primary_key=True, default=generate_uuid)
    review_id = Column(String(36), ForeignKey('governance_reviews.review_id'), nullable=False, unique=True)
    assessed_by_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    delivery_health = Column(String(20), default="AMBER")
    engineering_health = Column(String(20), default="GREEN")
    delivery_score = Column(Integer, default=3) # 1-5
    engineering_score = Column(Integer, default=4) # 1-5
    overall_score = Column(Integer, default=4) # 1-5
    comments = Column(Text)
    assessed_at = Column(DateTime, default=datetime.utcnow)

    governance_review = relationship("GovernanceReview", back_populates="assessment")
    assessed_by = relationship("User", foreign_keys=[assessed_by_id])

class GovernanceDecision(Base):
    __tablename__ = 'governance_decisions'
    decision_id = Column(String(36), primary_key=True, default=generate_uuid)
    review_id = Column(String(36), ForeignKey('governance_reviews.review_id'), nullable=False)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    owner_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    status = Column(String(20), default="PENDING") # PENDING, APPROVED, REJECTED
    due_date = Column(Date, nullable=False)
    decision_date = Column(Date, nullable=True)
    final_decision = Column(Text)

    governance_review = relationship("GovernanceReview", back_populates="decisions")
    owner = relationship("User", foreign_keys=[owner_id])

# 6. Audit Logging
class AuditLog(Base):
    __tablename__ = 'audit_logs'
    log_id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey('users.user_id'), nullable=False)
    action_type = Column(String(50), nullable=False) # CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, REJECT, DENIED
    entity_type = Column(String(50), nullable=False)
    entity_id = Column(String(36), nullable=False)
    details_json = Column(Text)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="logs")
