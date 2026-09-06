from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import get_current_user, require_permission
from app.models.campaign import Campaign
from app.models.audit import Audit
from app.models.governance import AuditLog
from app.models.user import User
from app.schemas.campaign import CampaignSchema, CampaignCreate, CampaignUpdate

router = APIRouter(prefix="/campaigns", tags=["Campaigns"])

def enrich_campaign(cmp: Campaign, db: Session) -> dict:
    audit_count = db.query(Audit).filter(Audit.campaign_id == cmp.id).count()
    return {
        "id": cmp.id,
        "code": cmp.code,
        "name": cmp.name,
        "project_id": cmp.project_id,
        "project_name": cmp.project.name if cmp.project else "Unassigned",
        "description": cmp.description,
        "owner_id": cmp.owner_id,
        "owner_name": cmp.owner.full_name if cmp.owner else "Unassigned",
        "start_date": cmp.start_date,
        "end_date": cmp.end_date,
        "status": cmp.status,
        "created_by": cmp.created_by,
        "creator_name": cmp.creator.full_name if cmp.creator else "System",
        "created_at": cmp.created_at,
        "updated_at": cmp.updated_at,
        "audit_count": audit_count
    }

@router.get("", response_model=List[CampaignSchema])
def list_campaigns(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    campaigns = db.query(Campaign).all()
    return [enrich_campaign(c, db) for c in campaigns]

@router.get("/{campaign_id}", response_model=CampaignSchema)
def get_campaign(campaign_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    cmp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not cmp:
        raise HTTPException(status_code=404, detail="Campaign not found")
    return enrich_campaign(cmp, db)

@router.post("", response_model=CampaignSchema)
def create_campaign(payload: CampaignCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("campaign.create"))):
    cmp = Campaign(
        code=payload.code,
        name=payload.name,
        project_id=payload.project_id,
        description=payload.description,
        owner_id=payload.owner_id,
        start_date=payload.start_date,
        end_date=payload.end_date,
        status=payload.status or "PLANNED",
        created_by=current_user.id
    )
    db.add(cmp)
    db.commit()
    db.refresh(cmp)

    # Log audit action
    log = AuditLog(
        user_id=current_user.id,
        action_type="CREATE",
        entity_type="Campaign",
        entity_id=cmp.id,
        details_json=f'{{"code": "{cmp.code}", "name": "{cmp.name}"}}'
    )
    db.add(log)
    db.commit()

    return enrich_campaign(cmp, db)

@router.put("/{campaign_id}", response_model=CampaignSchema)
def update_campaign(campaign_id: str, payload: CampaignUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("campaign.update"))):
    cmp = db.query(Campaign).filter(Campaign.id == campaign_id).first()
    if not cmp:
        raise HTTPException(status_code=404, detail="Campaign not found")

    if payload.name: cmp.name = payload.name
    if payload.description: cmp.description = payload.description
    if payload.owner_id: cmp.owner_id = payload.owner_id
    if payload.start_date: cmp.start_date = payload.start_date
    if payload.end_date: cmp.end_date = payload.end_date
    if payload.status: cmp.status = payload.status

    db.commit()
    db.refresh(cmp)
    return enrich_campaign(cmp, db)
