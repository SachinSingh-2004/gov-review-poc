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
    lead_auditor_email: Optional[str] = None
    start_date: date
    end_date: date
    status: str
    audit_type: Optional[str] = "PROCESS"
    recurrence_pattern: Optional[str] = "NONE"
    scope_description: Optional[str] = None
    estimated_hours: Optional[float] = 40.0
    milestone_id: Optional[str] = None
    milestone_title: Optional[str] = None
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
    audit_type: Optional[str] = "PROCESS"
    recurrence_pattern: Optional[str] = "NONE"
    scope_description: Optional[str] = None
    estimated_hours: Optional[float] = 40.0
    milestone_id: Optional[str] = None

class AuditUpdate(BaseModel):
    title: Optional[str] = None
    campaign_id: Optional[str] = None
    lead_auditor_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    audit_type: Optional[str] = None
    recurrence_pattern: Optional[str] = None
    scope_description: Optional[str] = None
    estimated_hours: Optional[float] = None
    milestone_id: Optional[str] = None
    closure_percentage: Optional[float] = None

class AuditConflictCheckRequest(BaseModel):
    lead_auditor_id: str
    start_date: date
    end_date: date
    exclude_audit_id: Optional[str] = None

class OverlappingAuditInfo(BaseModel):
    id: str
    code: str
    title: str
    start_date: date
    end_date: date
    status: str

class AuditConflictCheckResponse(BaseModel):
    has_conflict: bool
    conflict_count: int
    overlapping_audits: list[OverlappingAuditInfo]
    message: str

