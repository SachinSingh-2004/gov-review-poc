from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import require_permission
from app.models.governance import AuditLog
from app.models.user import User

router = APIRouter(prefix="/admin", tags=["Administration & Audit Logs"])

@router.get("/audit-logs")
def list_audit_logs(db: Session = Depends(get_db), current_user: User = Depends(require_permission("user.manage"))):
    logs = db.query(AuditLog).order_by(AuditLog.timestamp.desc()).limit(100).all()
    return [
        {
            "id": log.id,
            "user_id": log.user_id,
            "username": log.user.username if log.user else "System",
            "full_name": log.user.full_name if log.user else "System",
            "action_type": log.action_type,
            "entity_type": log.entity_type,
            "entity_id": log.entity_id,
            "details_json": log.details_json,
            "timestamp": log.timestamp
        }
        for log in logs
    ]
