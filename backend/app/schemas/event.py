from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class SecurityEventBase(BaseModel):
    source: str
    category: str
    risk_score: int
    confidence: float = 1.0
    indicators: List[str] = []
    evidence: Dict[str, Any] = {}
    mitre_technique_id: Optional[str] = None
    mitre_technique_name: Optional[str] = None
    mitre_tactic: Optional[str] = None
    is_simulated: bool = False

class SecurityEventCreate(SecurityEventBase):
    user_id: Optional[str] = None
    chain_id: Optional[str] = None

class SecurityEventOut(SecurityEventBase):
    id: str
    user_id: str
    timestamp: datetime
    chain_id: Optional[str] = None

    class Config:
        from_attributes = True
