from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app.core.security import create_access_token
from app.core.auth import get_current_user
from app.models.user import User, Role
from app.schemas.auth import Token, LoginRequest, PersonaSwitchRequest
from app.schemas.user import UserSchema

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == request.username).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    primary_role = user.roles[0].name if user.roles else "VIEWER"
    access_token = create_access_token(subject=user.username)
    return Token(access_token=access_token, token_type="bearer", username=user.username, role=primary_role)

@router.get("/me", response_model=UserSchema)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/personas")
def get_demo_personas(db: Session = Depends(get_db)):
    """
    Returns available demo user personas for easy switching in prototype UI.
    """
    roles = db.query(Role).all()
    personas = []
    
    role_user_map = {
        "ADMIN": "admin",
        "AUDITOR": "auditor_jane",
        "AUDIT_MANAGER": "audit_mgr_mark",
        "PROJECT_OWNER": "proj_owner_sarah",
        "ACTION_OWNER": "action_owner_alex",
        "EXECUTIVE": "executive_david",
        "VIEWER": "viewer_sam"
    }

    for role in roles:
        target_username = role_user_map.get(role.name)
        user = db.query(User).filter(User.username == target_username).first() if target_username else None
        if user:
            personas.append({
                "role": role.name,
                "description": role.description,
                "username": user.username,
                "full_name": user.full_name,
                "email": user.email,
                "department": user.department
            })
            
    return personas
