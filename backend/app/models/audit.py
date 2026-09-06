import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Date, Numeric, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Audit(Base):
    __tablename__ = 'audits'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), nullable=False, unique=True, index=True)
    title = Column(String(200), nullable=False)
    campaign_id = Column(String(36), ForeignKey('campaigns.id'), nullable=False)
    lead_auditor_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default='PLANNED') # PLANNED, IN_PROGRESS, FIELDWORK, ATTENTION, CLOSED
    closure_percentage = Column(Numeric(5, 2), default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    campaign = relationship('Campaign', back_populates='audits')
    lead_auditor = relationship('User', foreign_keys=[lead_auditor_id])
    findings = relationship('Finding', back_populates='audit', cascade='all, delete-orphan')
