import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from app.core.database import Base

class Project(Base):
    __tablename__ = 'projects'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    health_status = Column(String(20), default='HEALTHY') # HEALTHY, ATTENTION, AT_RISK
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    owner = relationship('User', foreign_keys=[owner_id])
    campaigns = relationship('Campaign', back_populates='project', cascade='all, delete-orphan')
    risks = relationship('Risk', back_populates='project', cascade='all, delete-orphan')
    milestones = relationship('Milestone', back_populates='project', cascade='all, delete-orphan')

class Risk(Base):
    __tablename__ = 'risks'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(200), nullable=False)
    risk_level = Column(String(20), default='MEDIUM') # HIGH, MEDIUM, LOW
    mitigation_plan = Column(Text, nullable=True)
    status = Column(String(20), default='OPEN')
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='risks')

class Milestone(Base):
    __tablename__ = 'milestones'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    title = Column(String(200), nullable=False)
    target_date = Column(Date, nullable=False)
    status = Column(String(20), default='PLANNED') # PLANNED, IN_PROGRESS, COMPLETED
    created_at = Column(DateTime, default=datetime.utcnow)

    project = relationship('Project', back_populates='milestones')
