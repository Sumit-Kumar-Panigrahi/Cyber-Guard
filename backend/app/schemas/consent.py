from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class ConsentBase(BaseModel):
    messages_enabled: bool = False
    email_enabled: bool = False
    browser_protection_enabled: bool = False
    social_share_enabled: bool = False
    call_guard_enabled: bool = False
    identity_monitoring_enabled: bool = False
    login_security_enabled: bool = True
    raw_storage_prohibited: bool = True
    opt_in_face_embedding: bool = False

class ConsentUpdate(BaseModel):
    messages_enabled: Optional[bool] = None
    email_enabled: Optional[bool] = None
    browser_protection_enabled: Optional[bool] = None
    social_share_enabled: Optional[bool] = None
    call_guard_enabled: Optional[bool] = None
    identity_monitoring_enabled: Optional[bool] = None
    login_security_enabled: Optional[bool] = None
    opt_in_face_embedding: Optional[bool] = None

class ConsentOut(ConsentBase):
    user_id: str
    updated_at: datetime

    class Config:
        from_attributes = True
