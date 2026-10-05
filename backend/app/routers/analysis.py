from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.event import SecurityEvent
from app.models.audit import DeviceAuditLog
from app.models.attack_chain import AttackChain
from app.services.auth_service import get_current_user, get_optional_current_user
from app.services.nlp_detector import nlp_detector
from app.services.url_detector import url_detector
from app.services.call_analyzer import call_analyzer
from app.services.anomaly_detector import anomaly_detector
from app.services.media_analyzer import media_analyzer
from app.schemas.analysis import (
    MessageAnalysisRequest,
    URLAnalysisRequest,
    CallAnalysisRequest,
    SocialShareRequest,
    MediaAnalysisRequest,
    LoginAnalysisRequest,
    AnalysisResultResponse
)
from app.schemas.event import SecurityEventOut

router = APIRouter(prefix="/analyze", tags=["Specialized Detection Engines"])

def save_security_event_if_threat(
    db: Session,
    user_id: Optional[str],
    result: dict,
    is_simulated: bool = False
) -> Optional[str]:
    # Persist security indicator if risk is elevated and user is available
    if user_id and result.get("risk_score", 0) >= 30:
        active_chain = db.query(AttackChain).filter(
            AttackChain.user_id == user_id,
            AttackChain.status == "ACTIVE"
        ).first()

        event = SecurityEvent(
            user_id=user_id,
            source=result.get("source", "Unknown"),
            category=result.get("category", "SUSPICIOUS_ACTIVITY"),
            risk_score=result.get("risk_score", 50),
            confidence=result.get("confidence", 0.9),
            indicators=result.get("indicators", []),
            evidence=result.get("evidence", {}),
            mitre_technique_id=result.get("mitre", {}).get("technique_id") if result.get("mitre") else None,
            mitre_technique_name=result.get("mitre", {}).get("technique_name") if result.get("mitre") else None,
            mitre_tactic=result.get("mitre", {}).get("tactic") if result.get("mitre") else None,
            chain_id=active_chain.id if active_chain else None,
            is_simulated=is_simulated
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        return event.id
    return None

@router.post("/message", response_model=AnalysisResultResponse)
def analyze_message(
    req: MessageAnalysisRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Analyze SMS / Hinglish / Hindi messages for banking, KYC, and urgency threats."""
    result = nlp_detector.analyze(req.text)
    user_id = current_user.id if current_user else None
    event_id = save_security_event_if_threat(db, user_id, result)
    result["saved_event_id"] = event_id
    return result

@router.post("/url", response_model=AnalysisResultResponse)
def analyze_url(
    req: URLAnalysisRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Analyze Pay-Safe URLs for banking lookalikes, typosquatting, and homograph threats."""
    result = url_detector.analyze(req.url)
    user_id = current_user.id if current_user else None
    event_id = save_security_event_if_threat(db, user_id, result)
    result["saved_event_id"] = event_id
    return result

@router.post("/social-share", response_model=AnalysisResultResponse)
def analyze_social_share(
    req: SocialShareRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Share-to-CYBERGUARD ingestion for WhatsApp, Instagram, and Telegram content."""
    # Composite analysis: analyze text content and embedded link if present
    text_res = nlp_detector.analyze(req.content)
    
    if req.link:
        url_res = url_detector.analyze(req.link)
        # Combine if URL is higher severity
        if url_res["risk_score"] > text_res["risk_score"]:
            result = url_res
            result["source"] = f"{req.platform} Shared Link"
            result["indicators"].extend([f"SHARED_VIA_{req.platform.upper()}_FORWARD"])
        else:
            result = text_res
            result["source"] = f"{req.platform} Shared Message"
            result["indicators"].extend([f"SHARED_VIA_{req.platform.upper()}_FORWARD"])
    else:
        result = text_res
        result["source"] = f"{req.platform} Shared Message"
        result["indicators"].extend([f"SHARED_VIA_{req.platform.upper()}_FORWARD"])

    user_id = current_user.id if current_user else None
    event_id = save_security_event_if_threat(db, user_id, result, is_simulated=True)
    result["saved_event_id"] = event_id
    return result

@router.post("/call", response_model=AnalysisResultResponse)
def analyze_call(
    req: CallAnalysisRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """Call Guard transcript analyzer for OTP pressure and official impersonation."""
    result = call_analyzer.analyze_transcript(req.transcript)
    user_id = current_user.id if current_user else None
    event_id = save_security_event_if_threat(db, user_id, result, is_simulated=True)
    result["saved_event_id"] = event_id
    return result

@router.post("/media", response_model=AnalysisResultResponse)
def analyze_media(
    req: MediaAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deepfake & synthetic identity misuse heuristic inspector."""
    result = media_analyzer.analyze_media(
        filename=req.filename,
        file_size_bytes=req.file_size_bytes,
        content_type=req.content_type,
        is_synthetic_marker=req.is_synthetic_marker
    )
    event_id = save_security_event_if_threat(db, current_user.id, result, is_simulated=True)
    result["saved_event_id"] = event_id
    return result

@router.post("/login", response_model=AnalysisResultResponse)
def analyze_login(
    req: LoginAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Login and unknown device anomaly analysis using Isolation Forest."""
    # Query known user devices
    known_devices = db.query(DeviceAuditLog).filter(DeviceAuditLog.user_id == current_user.id).all()
    known_fps = [d.device_fingerprint for d in known_devices]
    prev_geo = known_devices[-1].geo_location if known_devices else "New Delhi, India"

    result = anomaly_detector.evaluate_login(
        device_fingerprint=req.device_fingerprint,
        known_fingerprints=known_fps,
        current_geo=req.geo_location,
        previous_geo=prev_geo,
        ip_address=req.ip_address,
        device_name=req.device_name
    )

    event_id = save_security_event_if_threat(db, current_user.id, result)
    result["saved_event_id"] = event_id
    return result

@router.get("/events", response_model=List[SecurityEventOut])
def get_user_security_events(
    limit: int = 20,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve chronologically ordered security events and indicators for user."""
    events = (
        db.query(SecurityEvent)
        .filter(SecurityEvent.user_id == current_user.id)
        .order_by(SecurityEvent.created_at.desc())
        .limit(limit)
        .all()
    )
    return events
