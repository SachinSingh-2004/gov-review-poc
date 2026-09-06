from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional, List

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User, Role, Permission

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login", auto_error=False)

def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(oauth2_scheme),
    x_persona_role: Optional[str] = Header(None, alias="X-Persona-Role")
) -> User:
    """
    Retrieves the current authenticated user.
    In DEMO auth mode:
    - If JWT token is present, decodes sub (username).
    - If no token or if X-Persona-Role header is passed, loads the primary user matching that persona role.
    - Default fallback persona: ADMIN user ('admin').
    """
    username = None

    if token:
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            username = payload.get("sub")
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

    if not username and settings.AUTH_MODE == "DEMO":
        # Map requested persona role to default demo usernames
        role_user_map = {
            "ADMIN": "admin",
            "AUDITOR": "auditor_jane",
            "AUDIT_MANAGER": "audit_mgr_mark",
            "PROJECT_OWNER": "proj_owner_sarah",
            "ACTION_OWNER": "action_owner_alex",
            "EXECUTIVE": "executive_david",
            "VIEWER": "viewer_sam"
        }
        requested_role = (x_persona_role or "ADMIN").upper()
        username = role_user_map.get(requested_role, "admin")

    if not username:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Fallback to first user in database
        user = db.query(User).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found in system")

    if not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user account")

    return user

def require_permission(required_permission: str):
    """
    FastAPI Dependency wrapper enforcing RBAC permissions.
    """
    def permission_checker(current_user: User = Depends(get_current_user)):
        user_permissions = set()
        user_roles = [r.name for r in current_user.roles]

        # ADMIN role bypasses explicit permission checks in prototype mode
        if "ADMIN" in user_roles:
            return current_user

        for role in current_user.roles:
            for perm in role.permissions:
                user_permissions.add(perm.code)

        if required_permission not in user_permissions:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required permission: '{required_permission}'"
            )
        return current_user

    return permission_checker
