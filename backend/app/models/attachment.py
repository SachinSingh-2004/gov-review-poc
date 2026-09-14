import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Attachment(Base):
    __tablename__ = 'attachments'

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    entity_type = Column(String(20), nullable=False) # 'ACTION' or 'FINDING'
    entity_id = Column(String(36), nullable=False, index=True)
    file_name = Column(String(255), nullable=False)
    stored_file_name = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    file_size = Column(Integer, nullable=False)
    mime_type = Column(String(100), nullable=False)
    uploaded_by_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    uploaded_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    uploaded_by = relationship('User', foreign_keys=[uploaded_by_id])
