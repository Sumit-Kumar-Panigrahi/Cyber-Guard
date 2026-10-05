from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class MessageAnalysisRequest(BaseModel):
    text: str
    sender_id: Optional[str] = "Unknown"

class URLAnalysisRequest(BaseModel):
    url: str

class CallAnalysisRequest(BaseModel):
    transcript: str
    caller_id: Optional[str] = "+91 Unknown"

class SocialShareRequest(BaseModel):
    platform: str = "WhatsApp" # "WhatsApp" | "Instagram" | "Telegram"
    content: str
    link: Optional[str] = None
    sender_handle: Optional[str] = None

class MediaAnalysisRequest(BaseModel):
    filename: str = "capture.jpg"
    file_size_bytes: int = 45000
    content_type: str = "image/jpeg"
    is_synthetic_marker: bool = False

class LoginAnalysisRequest(BaseModel):
    device_fingerprint: str
    device_name: str = "Unknown Device"
    ip_address: str = "127.0.0.1"
    geo_location: str = "New Delhi, India"

class MITREInfo(BaseModel):
    technique_id: str
    technique_name: str
    tactic: str

class AnalysisResultResponse(BaseModel):
    source: str
    category: str
    verdict: str
    risk_score: int
    confidence: float
    indicators: List[str]
    evidence: Dict[str, Any]
    mitre: Optional[MITREInfo] = None
    explanation_en: str
    explanation_hi: str
    recommended_action: str
    saved_event_id: Optional[str] = None
