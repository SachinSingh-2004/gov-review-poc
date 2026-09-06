from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class ActionSchema(BaseModel):
    id: str
    code: str
    finding_id: str
    finding_title: Optional[str] = None
    audit_id: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    description: str
    owner_id: str
    owner_name: Optional[str] = None
    due_date: date
    status: str
    completion_date: Optional[date] = None
    evidence_summary: Optional[str] = None
    reviewer_id: Optional[str] = None
    reviewer_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ActionCreate(BaseModel):
    code: str
    finding_id: str
    description: str
    owner_id: str
    due_date: date
    status: Optional[str] = "OPEN"

class ActionUpdate(BaseModel):
    description: Optional[str] = None
    owner_id: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[str] = None
    completion_date: Optional[date] = None
    evidence_summary: Optional[str] = None
    reviewer_id: Optional[str] = None
