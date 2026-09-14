from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AttachmentSchema(BaseModel):
    id: str
    entity_type: str
    entity_id: str
    file_name: str
    file_size: int
    mime_type: str
    uploaded_by_id: str
    uploaded_by_name: Optional[str] = None
    uploaded_at: datetime

    class Config:
        from_attributes = True

class AttachmentUploadResponse(BaseModel):
    success: bool
    attachment: AttachmentSchema
    message: str
