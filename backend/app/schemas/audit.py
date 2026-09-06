from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class AuditSchema(BaseModel):
    id: str
    code: str
    title: str
    campaign_id: str
    campaign_name: Optional[str] = None
    project_id: Optional[str] = None
    project_name: Optional[str] = None
    lead_auditor_id: str
    lead_auditor_name: Optional[str] = None
    start_date: date
    end_date: date
    status: str
    closure_percentage: float
    created_at: datetime
    updated_at: datetime
    finding_count: Optional[int] = 0

    class Config:
        from_attributes = True

class AuditCreate(BaseModel):
    code: str
    title: str
    campaign_id: str
    lead_auditor_id: str
    start_date: date
    end_date: date
    status: Optional[str] = "PLANNED"

class AuditUpdate(BaseModel):
    title: Optional[str] = None
    campaign_id: Optional[str] = None
    lead_auditor_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    closure_percentage: Optional[float] = None
