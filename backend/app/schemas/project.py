from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, date

class RiskSchema(BaseModel):
    id: str
    project_id: str
    title: str
    risk_level: str
    mitigation_plan: Optional[str] = None
    status: str

    class Config:
        from_attributes = True

class MilestoneSchema(BaseModel):
    id: str
    project_id: str
    title: str
    target_date: date
    status: str

    class Config:
        from_attributes = True

class ProjectSchema(BaseModel):
    id: str
    code: str
    name: str
    description: Optional[str] = None
    owner_id: str
    owner_name: Optional[str] = None
    health_status: str
    created_at: datetime
    updated_at: datetime
    campaign_count: Optional[int] = 0
    open_findings_count: Optional[int] = 0
    critical_findings_count: Optional[int] = 0
    overdue_actions_count: Optional[int] = 0
    risks: List[RiskSchema] = []
    milestones: List[MilestoneSchema] = []

    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    code: str
    name: str
    description: Optional[str] = None
    owner_id: str
    health_status: Optional[str] = "HEALTHY"

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[str] = None
    health_status: Optional[str] = None
