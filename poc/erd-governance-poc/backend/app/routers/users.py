from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User, Role, Permission
from app.schemas.schemas import UserSchema, RoleSchema, PermissionSchema

router = APIRouter(prefix="", tags=["Users & RBAC"])

@router.get("/users", response_model=List[UserSchema])
def list_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/roles", response_model=List[RoleSchema])
def list_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()

@router.get("/permissions", response_model=List[PermissionSchema])
def list_permissions(db: Session = Depends(get_db)):
    return db.query(Permission).all()
