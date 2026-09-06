from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime

class PermissionSchema(BaseModel):
    id: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True

class RoleSchema(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[PermissionSchema] = []

    class Config:
        from_attributes = True

class UserSchema(BaseModel):
    id: str
    username: str
    email: str
    full_name: str
    department: str
    is_active: bool
    roles: List[RoleSchema] = []
    created_at: datetime

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: str
    full_name: str
    department: str = "R&D Governance"
    role_names: List[str] = ["VIEWER"]
