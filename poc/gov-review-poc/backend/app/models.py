from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Text, Date, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

# 1. USER
class User(Base):
    __tablename__ = 'users'
    user_id = Column(Integer, primary_key=True, autoincrement=True)
    display_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    username = Column(String(50), unique=True, nullable=False)
    password = Column(String(100), nullable=False)

    user_roles = relationship("UserRole", back_populates="user")
    project_memberships = relationship("ProjectMember", back_populates="user")

# 2. ROLE
class Role(Base):
    __tablename__ = 'roles'
    role_id = Column(Integer, primary_key=True, autoincrement=True)
    role_code = Column(String(20), unique=True, nullable=False) # PM, TL
    role_name = Column(String(50), nullable=False)

    user_roles = relationship("UserRole", back_populates="role")

# 3. USER_ROLE
class UserRole(Base):
    __tablename__ = 'user_roles'
    user_role_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    role_id = Column(Integer, ForeignKey('roles.role_id', ondelete="CASCADE"), nullable=False)

    user = relationship("User", back_populates="user_roles")
    role = relationship("Role", back_populates="user_roles")

# 4. PROJECT
class Project(Base):
    __tablename__ = 'projects'
    project_id = Column(Integer, primary_key=True, autoincrement=True)
    project_code = Column(String(50), unique=True, nullable=False)
    project_name = Column(String(150), nullable=False)

    members = relationship("ProjectMember", back_populates="project")
    governance_reviews = relationship("GovernanceReview", back_populates="project")
    audits = relationship("Audit", back_populates="project")
    risks = relationship("Risk", back_populates="project")

# 5. PROJECT_MEMBER
class ProjectMember(Base):
    __tablename__ = 'project_members'
    project_member_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.project_id', ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id', ondelete="CASCADE"), nullable=False)
    project_role = Column(String(20), nullable=False) # PM, TL

    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")

# 6. GOVERNANCE_REVIEW
class GovernanceReview(Base):
    __tablename__ = 'governance_reviews'
    governance_review_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.project_id', ondelete="CASCADE"), nullable=False)
    review_number = Column(String(50), nullable=False)
    review_date = Column(Date, nullable=False)
    review_status = Column(String(20), default="IN_PROGRESS")

    project = relationship("Project", back_populates="governance_reviews")
    project_health = relationship("ProjectHealth", back_populates="governance_review", uselist=False)
    technical_assessment = relationship("TechnicalAssessment", back_populates="governance_review", uselist=False)

# 7. PROJECT_HEALTH
class ProjectHealth(Base):
    __tablename__ = 'project_health'
    project_health_id = Column(Integer, primary_key=True, autoincrement=True)
    governance_review_id = Column(Integer, ForeignKey('governance_reviews.governance_review_id', ondelete="CASCADE"), nullable=False, unique=True)
    schedule_health = Column(String(20), default="GREEN")
    budget_status = Column(String(20), default="GREEN")
    open_risk_count = Column(Integer, default=0)
    open_finding_count = Column(Integer, default=0)
    overall_health = Column(String(20), default="AMBER")

    governance_review = relationship("GovernanceReview", back_populates="project_health")

# 8. TECHNICAL_ASSESSMENT
class TechnicalAssessment(Base):
    __tablename__ = 'technical_assessments'
    technical_assessment_id = Column(Integer, primary_key=True, autoincrement=True)
    governance_review_id = Column(Integer, ForeignKey('governance_reviews.governance_review_id', ondelete="CASCADE"), nullable=False, unique=True)
    technical_readiness_score = Column(Integer, nullable=False, default=4) # 1-5
    technical_health = Column(String(20), nullable=False, default="AMBER") # GREEN, AMBER, RED
    comments = Column(Text, nullable=True)
    assessed_by = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    assessed_at = Column(DateTime, default=datetime.utcnow)

    governance_review = relationship("GovernanceReview", back_populates="technical_assessment")
    assessor = relationship("User", foreign_keys=[assessed_by])

# 9. AUDIT
class Audit(Base):
    __tablename__ = 'audits'
    audit_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.project_id', ondelete="CASCADE"), nullable=False)
    audit_name = Column(String(150), nullable=False)
    audit_type = Column(String(50), nullable=False)
    audit_status = Column(String(20), default="IN_PROGRESS")
    planned_date = Column(Date, nullable=False)
    actual_date = Column(Date, nullable=True)

    project = relationship("Project", back_populates="audits")
    findings = relationship("Finding", back_populates="audit")

# 10. FINDING
class Finding(Base):
    __tablename__ = 'findings'
    finding_id = Column(Integer, primary_key=True, autoincrement=True)
    audit_id = Column(Integer, ForeignKey('audits.audit_id', ondelete="CASCADE"), nullable=False)
    finding_reference = Column(String(50), nullable=False)
    title = Column(String(200), nullable=False)
    severity = Column(String(20), nullable=False) # MAJOR, MINOR, CRITICAL
    status = Column(String(20), default="OPEN") # OPEN, CLOSED

    audit = relationship("Audit", back_populates="findings")
    actions = relationship("Action", back_populates="finding")

# 11. ACTION
class Action(Base):
    __tablename__ = 'actions'
    action_id = Column(Integer, primary_key=True, autoincrement=True)
    finding_id = Column(Integer, ForeignKey('findings.finding_id', ondelete="CASCADE"), nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    status = Column(String(20), default="OPEN") # IN_PROGRESS, OPEN, CLOSED
    due_date = Column(Date, nullable=False)

    finding = relationship("Finding", back_populates="actions")
    owner = relationship("User", foreign_keys=[owner_id])

# 12. RISK
class Risk(Base):
    __tablename__ = 'risks'
    risk_id = Column(Integer, primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.project_id', ondelete="CASCADE"), nullable=False)
    title = Column(String(200), nullable=False)
    status = Column(String(20), default="OPEN")
    impact = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW
    probability = Column(String(20), default="MEDIUM") # HIGH, MEDIUM, LOW

    project = relationship("Project", back_populates="risks")
