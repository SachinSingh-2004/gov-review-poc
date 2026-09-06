import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Action(Base):
    __tablename__ = 'actions'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), nullable=False, unique=True, index=True)
    finding_id = Column(String(36), ForeignKey('findings.id'), nullable=False)
    description = Column(Text, nullable=False)
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    due_date = Column(Date, nullable=False)
    status = Column(String(20), default='OPEN') # OPEN, IN_PROGRESS, COMPLETED, OVERDUE, PENDING_REVIEW, CLOSED
    completion_date = Column(Date, nullable=True)
    evidence_summary = Column(Text, nullable=True)
    reviewer_id = Column(String(36), ForeignKey('users.id'), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    finding = relationship('Finding', back_populates='actions')
    owner = relationship('User', foreign_keys=[owner_id])
    reviewer = relationship('User', foreign_keys=[reviewer_id])
