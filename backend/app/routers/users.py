from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.auth import require_permission
from app.models.user import User, Role, Permission
from app.schemas.user import UserSchema, UserCreate, RoleSchema, PermissionSchema

router = APIRouter(prefix="/users", tags=["Users & Administration"])

@router.get("", response_model=List[UserSchema])
def list_users(db: Session = Depends(get_db), current_user: User = Depends(require_permission("user.manage"))):
    return db.query(User).all()

@router.post("", response_model=UserSchema)
def create_user(payload: UserCreate, db: Session = Depends(get_db), current_user: User = Depends(require_permission("user.manage"))):
    existing = db.query(User).filter((User.username == payload.username) | (User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        department=payload.department
    )
    
    roles = db.query(Role).filter(Role.name.in_(payload.role_names)).all()
    user.roles = roles
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@router.get("/roles", response_model=List[RoleSchema])
def list_roles(db: Session = Depends(get_db), current_user: User = Depends(require_permission("role.manage"))):
    return db.query(Role).all()

@router.get("/permissions", response_model=List[PermissionSchema])
def list_permissions(db: Session = Depends(get_db), current_user: User = Depends(require_permission("permission.manage"))):
    return db.query(Permission).all()
