from pydantic import BaseModel
from typing import Optional
from datetime import datetime, date

class CampaignSchema(BaseModel):
    id: str
    code: str
    name: str
    project_id: str
    project_name: Optional[str] = None
    description: Optional[str] = None
    owner_id: str
    owner_name: Optional[str] = None
    start_date: date
    end_date: date
    status: str
    created_by: str
    creator_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    audit_count: Optional[int] = 0

    class Config:
        from_attributes = True

class CampaignCreate(BaseModel):
    code: str
    name: str
    project_id: str
    description: Optional[str] = None
    owner_id: str
    start_date: date
    end_date: date
    status: Optional[str] = "PLANNED"

class CampaignUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    owner_id: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
