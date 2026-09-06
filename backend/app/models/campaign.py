import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Campaign(Base):
    __tablename__ = 'campaigns'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String(20), nullable=False, unique=True, index=True)
    name = Column(String(150), nullable=False)
    project_id = Column(String(36), ForeignKey('projects.id'), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    status = Column(String(20), default='PLANNED') # DRAFT, PLANNED, ACTIVE, COMPLETED, CANCELLED
    created_by = Column(String(36), ForeignKey('users.id'), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship('Project', back_populates='campaigns')
    owner = relationship('User', foreign_keys=[owner_id])
    creator = relationship('User', foreign_keys=[created_by])
    audits = relationship('Audit', back_populates='campaign', cascade='all, delete-orphan')
