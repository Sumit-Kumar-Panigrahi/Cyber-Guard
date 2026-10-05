from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class DeviceAuditLogOut(BaseModel):
    id: str
    device_name: str
    device_fingerprint: str
    ip_address: str
    geo_location: str
    browser_agent: str
    is_trusted: bool
    logged_in_at: datetime

    class Config:
        from_attributes = True

class AuditTrailBlockOut(BaseModel):
    block_id: str
    event_id: str
    event_type: str
    timestamp: str
    user_id: str
    payload_summary: str
    payload_hash: str
    prev_hash: str
    block_hash: str
    is_tampered: bool = False

class AuditVerificationOut(BaseModel):
    is_valid: bool
    total_blocks: int
    verified_at: str
    merkle_root: str
    status: str
    message: str

class IncidentOut(BaseModel):
    id: str
    chain_id: str
    status: str
    recommended_action: str
    action_target: str
    action_approved_by: Optional[str] = None
    action_executed_at: Optional[datetime] = None
    resolution_notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
