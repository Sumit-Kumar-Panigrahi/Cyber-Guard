from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

from app.database import get_db
from app.models.user import User
from app.models.event import SecurityEvent
from app.models.attack_chain import AttackChain
from app.services.auth_service import get_optional_current_user
from app.services.ai_assistant import ai_assistant_engine

router = APIRouter(prefix="/assistant", tags=["AI Security Assistant"])

class ChatRequest(BaseModel):
    message: str
    preferred_language: Optional[str] = "auto" # "auto" | "en" | "hi"

class SecurityAnalysisOut(BaseModel):
    risk_score: int
    severity: str
    confidence: float
    threat_type: str
    summary: str
    indicators: List[str]
    evidence: Dict[str, Any]
    recommended_actions: List[str]
    explanation_en: str
    explanation_hi: str
    predicted_next_step: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    reply_en: str
    reply_hi: str
    intent: str
    language_detected: str
    is_security_threat: bool
    analysis: Optional[SecurityAnalysisOut] = None
    sensitive_data_warning: Optional[str] = None
    speech_text_en: str
    speech_text_hi: str
    saved_event_id: Optional[str] = None

@router.post("/chat", response_model=ChatResponse)
def chat_with_assistant(
    req: ChatRequest,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    """
    Dynamic interactive endpoint for natural language cyber defense queries,
    scam evaluation, educational questions, and incident response advice.
    """
    res = ai_assistant_engine.process_query(
        raw_input=req.message,
        preferred_lang=req.preferred_language or "auto"
    )

    saved_event_id = None

    # Only log a security event if it represents an actual elevated security threat
    # and NOT an educational or privacy query
    if res.get("is_security_threat") and res.get("intent") in ["SECURITY_ANALYSIS", "URL_ANALYSIS"] and current_user:
        analysis_data = res.get("analysis") or {}
        active_chain = db.query(AttackChain).filter(
            AttackChain.user_id == current_user.id,
            AttackChain.status == "ACTIVE"
        ).first()

        event = SecurityEvent(
            user_id=current_user.id,
            source="AI Assistant Chat Ingestion",
            category=analysis_data.get("threat_type", "SUSPICIOUS_CONTENT"),
            risk_score=analysis_data.get("risk_score", 50),
            confidence=analysis_data.get("confidence", 0.9),
            indicators=analysis_data.get("indicators", []),
            evidence=analysis_data.get("evidence", {}),
            chain_id=active_chain.id if active_chain else None,
            is_simulated=False
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        saved_event_id = event.id

    res["saved_event_id"] = saved_event_id

    # Format analysis out matching schema
    if res.get("analysis"):
        a = res["analysis"]
        res["analysis"] = SecurityAnalysisOut(
            risk_score=a.get("risk_score", 0),
            severity=a.get("severity", "LOW"),
            confidence=a.get("confidence", 0.0),
            threat_type=a.get("threat_type", "GENERAL"),
            summary=a.get("summary_en", a.get("summary", "")),
            indicators=a.get("indicators", []),
            evidence=a.get("evidence", {}),
            recommended_actions=a.get("recommended_actions", []),
            explanation_en=a.get("explanation_en", ""),
            explanation_hi=a.get("explanation_hi", ""),
            predicted_next_step=a.get("predicted_next_step")
        )

    return res

@router.get("/suggestions")
def get_prompt_suggestions():
    """Returns dynamic suggestions for natural questions and security checks."""
    return {
        "categories": [
            {
                "label": "Educational Questions",
                "prompts": [
                    "What is phishing?",
                    "What is malware?",
                    "What is two factor authentication?",
                    "How can I protect my bank account?"
                ]
            },
            {
                "label": "Scam & Threat Checks",
                "prompts": [
                    "My electricity provider says my connection will be disconnected in 2 hours unless I make an immediate payment.",
                    "I received a message saying I won a prize but I need to pay money first.",
                    "Someone called me pretending to be customer support and requested a verification code."
                ]
            },
            {
                "label": "Bilingual / Hindi Queries",
                "prompts": [
                    "Ye message safe hai kya? Mujhe bahut suspicious lag raha hai.",
                    "Mujhe ek unknown number se OTP ke liye call aaya.",
                    "Explain this in Hindi."
                ]
            },
            {
                "label": "Credential & Incident Guidance",
                "prompts": [
                    "What should I do if I shared my password?",
                    "What is the 1930 Cyber Helpline?"
                ]
            }
        ]
    }
