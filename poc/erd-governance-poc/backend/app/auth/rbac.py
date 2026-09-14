import json
from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User, Role, Permission, AuditLog, user_roles, role_permissions

def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    user_id = request.headers.get("X-Demo-User-ID") or request.query_params.get("demo_user_id")
    user = None
    if user_id:
        user = db.query(User).filter(User.user_id == user_id).first()
        if not user:
            user = db.query(User).filter(User.username == user_id).first()
            
    if not user:
        user = db.query(User).filter(User.username == "admin").first()
        if not user:
            user = db.query(User).first()

    # Absolute fallback if database is totally unseeded
    if not user:
        fallback_role = Role(name="ADMIN", description="Fallback Admin")
        fallback_role.permissions = [Permission(code="ALL", description="All")]
        user = User(
            user_id="usr-fallback-01",
            username="admin",
            email="admin@enterprise.com",
            full_name="System Admin",
            department="IT",
            roles=[fallback_role]
        )

    return user

def log_audit_event(db: Session, user_id: str, action_type: str, entity_type: str, entity_id: str, details: dict = None):
    try:
        log_entry = AuditLog(
            user_id=user_id,
            action_type=action_type,
            entity_type=entity_type,
            entity_id=entity_id,
            details_json=json.dumps(details) if details else None
        )
        db.add(log_entry)
        db.commit()
    except Exception as e:
        db.rollback()

class PermissionChecker:
    def __init__(self, required_permission: str, entity_type: str = "UNKNOWN"):
        self.required_permission = required_permission
        self.entity_type = entity_type

    def __call__(self, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
        user_permissions = set()
        if hasattr(user, "roles") and user.roles:
            for role in user.roles:
                if hasattr(role, "permissions") and role.permissions:
                    for perm in role.permissions:
                        user_permissions.add(perm.code)
        
        if "ALL" in user_permissions or "ADMIN_ALL" in user_permissions or self.required_permission in user_permissions:
            return user
        
        log_audit_event(
            db=db,
            user_id=user.user_id if hasattr(user, "user_id") else "unknown",
            action_type="PERMISSION_DENIED",
            entity_type=self.entity_type,
            entity_id="ACCESS_DENIED",
            details={
                "required_permission": self.required_permission,
                "user_roles": [r.name for r in user.roles] if hasattr(user, "roles") else [],
                "path": str(request.url)
            }
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Permission Denied: User '{getattr(user, 'full_name', 'Unknown')}' lacks required permission '{self.required_permission}' for operation."
        )

def require_perm(perm_code: str, entity_type: str = "SYSTEM"):
    return PermissionChecker(perm_code, entity_type)
