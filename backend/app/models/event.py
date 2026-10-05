import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database import Base

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    source = Column(String(50), nullable=False)        # SMS, EMAIL, BROWSER, WHATSAPP, CALL, MEDIA, LOGIN
    category = Column(String(80), nullable=False)      # PHISHING_SMS, SUSPICIOUS_URL, etc.
    risk_score = Column(Integer, nullable=False)       # 0 - 100
    confidence = Column(Float, default=1.0)            # 0.0 - 1.0
    indicators = Column(JSON, default=list)            # List of string tags
    evidence = Column(JSON, default=dict)              # Sanitized evidence tokens
    mitre_technique_id = Column(String(50), nullable=True)
    mitre_technique_name = Column(String(100), nullable=True)
    mitre_tactic = Column(String(100), nullable=True)
    chain_id = Column(String(36), ForeignKey("attack_chains.id", ondelete="SET NULL"), nullable=True, index=True)
    is_simulated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="events")
    chain = relationship("AttackChain", back_populates="events")
