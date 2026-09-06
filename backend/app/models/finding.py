import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Finding(Base):
    __tablename__ = 'findings'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), nullable=False, unique=True, index=True)
    audit_id = Column(String(36), ForeignKey('audits.id'), nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(20), nullable=False) # CRITICAL, MAJOR, MINOR
    status = Column(String(20), default='OPEN') # OPEN, IN_PROGRESS, PENDING_REVIEW, CLOSED
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    due_date = Column(Date, nullable=False)
    closure_info = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    audit = relationship('Audit', back_populates='findings')
    owner = relationship('User', foreign_keys=[owner_id])
    actions = relationship('Action', back_populates='finding', cascade='all, delete-orphan')
