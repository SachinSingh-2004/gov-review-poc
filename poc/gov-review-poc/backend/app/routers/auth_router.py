from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User, UserRole, Role, ProjectMember
from app.schemas import LoginRequest, LoginResponse, UserSchema, RoleSchema
from app.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Auth"])

@router.post("/login", response_model=LoginResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == req.username).first()
    if not user or user.password != req.password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password."
        )

    # Get role
    user_role_entry = db.query(UserRole).filter(UserRole.user_id == user.user_id).first()
    role_code = user_role_entry.role.role_code if user_role_entry and user_role_entry.role else "PM"
    role_name = user_role_entry.role.role_name if user_role_entry and user_role_entry.role else "Project Manager"

    # Get assigned project
    proj_mem = db.query(ProjectMember).filter(ProjectMember.user_id == user.user_id).first()
    project_id = proj_mem.project_id if proj_mem else 1

    token = "token-pm" if role_code == "PM" else "token-tl"

    user_schema = UserSchema(
        user_id=user.user_id,
        display_name=user.display_name,
        email=user.email,
        username=user.username,
        roles=[RoleSchema(role_id=1 if role_code=="PM" else 2, role_code=role_code, role_name=role_name)]
    )

    return LoginResponse(
        user=user_schema,
        role_code=role_code,
        assigned_project_id=project_id,
        token=token
    )

@router.get("/me", response_model=UserSchema)
def get_me(user_tuple: tuple = Depends(get_current_user), db: Session = Depends(get_db)):
    user, role_code, _ = user_tuple
    user_role_entry = db.query(UserRole).filter(UserRole.user_id == user.user_id).first()
    role_name = user_role_entry.role.role_name if user_role_entry and user_role_entry.role else "Project Manager"
    
    return UserSchema(
        user_id=user.user_id,
        display_name=user.display_name,
        email=user.email,
        username=user.username,
        roles=[RoleSchema(role_id=1 if role_code=="PM" else 2, role_code=role_code, role_name=role_name)]
    )
