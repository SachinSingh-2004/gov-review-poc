from fastapi import Request, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, Role, ProjectMember

def get_current_user(request: Request, db: Session = Depends(get_db)) -> tuple[User, str, int]:
    # Read auth user from header X-Demo-User-ID or X-Demo-Role
    user_id_str = request.headers.get("X-Demo-User-ID")
    if not user_id_str:
        auth_header = request.headers.get("Authorization", "")
        if auth_header.startswith("Bearer "):
            token_val = auth_header.split(" ")[1]
            if token_val == "token-pm":
                user_id_str = "1"
            elif token_val == "token-tl":
                user_id_str = "2"

    if not user_id_str:
        user_id = 1 # Fallback to PM
    else:
        try:
            user_id = int(user_id_str)
        except ValueError:
            user_id = 1

    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid user session")

    # Find role
    user_role_entry = db.query(UserRole).filter(UserRole.user_id == user.user_id).first()
    role_code = user_role_entry.role.role_code if user_role_entry and user_role_entry.role else "PM"

    # Find assigned project
    proj_mem = db.query(ProjectMember).filter(ProjectMember.user_id == user.user_id).first()
    project_id = proj_mem.project_id if proj_mem else 1

    return user, role_code, project_id

def require_role(allowed_roles: list[str]):
    def dependency(user_tuple: tuple[User, str, int] = Depends(get_current_user)):
        user, role_code, project_id = user_tuple
        if role_code not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You do not have permission for this action. Required role: {', '.join(allowed_roles)}"
            )
        return user_tuple
    return dependency

