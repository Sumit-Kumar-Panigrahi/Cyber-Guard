from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    device_name: Optional[str] = "Windows PC / Chrome"
    device_fingerprint: Optional[str] = "fp_default_win_client"
    ip_address: Optional[str] = "103.211.54.12"
    geo_location: Optional[str] = "New Delhi, India"

class UserOut(UserBase):
    id: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class TokenData(BaseModel):
    user_id: Optional[str] = None
    role: Optional[str] = None
