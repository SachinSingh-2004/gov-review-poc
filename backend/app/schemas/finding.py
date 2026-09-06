from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class FindingSchema(BaseModel):
    id: str
    code: str
    audit_id: str
    audit_title: Optional[str] = None
    campaign_id: Optional[str] = None
    campaign_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    title: str
    description: Optional[str] = None
    severity: str
    status: str
    owner_id: str
    owner_name: Optional[str] = None
    due_date: date
    closure_info: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    action_count: Optional[int] = 0

    class Config:
        from_attributes = True

class FindingCreate(BaseModel):
    code: str
    audit_id: str
    title: str
    description: Optional[str] = None
    severity: str # CRITICAL, MAJOR, MINOR
    owner_id: str
    due_date: date
    status: Optional[str] = "OPEN"

class FindingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    severity: Optional[str] = None
    status: Optional[str] = None
    owner_id: Optional[str] = None
    due_date: Optional[date] = None
    closure_info: Optional[str] = None
