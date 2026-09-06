import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class AuditLog(Base):
    __tablename__ = 'audit_logs'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    action_type = Column(String(50), nullable=False) # CREATE, UPDATE, DELETE, STATUS_CHANGE, APPROVE, CLOSE
    entity_type = Column(String(50), nullable=False) # Campaign, Audit, Finding, Action, Project, User
    entity_id = Column(String(36), nullable=False)
    details_json = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', foreign_keys=[user_id])

class Notification(Base):
    __tablename__ = 'notifications'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', foreign_keys=[user_id])
