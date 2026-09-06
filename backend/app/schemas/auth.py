from pydantic import BaseModel
from typing import List, Optional

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    role: str

class LoginRequest(BaseModel):
    username: str
    password: Optional[str] = "password123"

class PersonaSwitchRequest(BaseModel):
    role_name: str
