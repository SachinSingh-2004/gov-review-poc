from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import User
from app.schemas.schemas import UserSchema
from app.auth.rbac import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.get("/demo-users", response_model=List[UserSchema])
def get_demo_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@router.get("/me", response_model=UserSchema)
def get_me(user: User = Depends(get_current_user)):
    return user
