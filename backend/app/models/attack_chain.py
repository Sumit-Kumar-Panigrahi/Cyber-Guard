import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class AttackChain(Base):
    __tablename__ = "attack_chains"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(150), nullable=False)
    status = Column(String(30), default="ACTIVE")         # ACTIVE | CONTAINED | RESOLVED
    severity = Column(String(20), default="LOW")          # LOW | MEDIUM | HIGH | CRITICAL
    human_risk_score = Column(Integer, default=0)         # 0 - 100
    tech_risk_score = Column(Integer, default=0)          # 0 - 100
    current_stage = Column(String(100), default="Initial Recon / Lure")
    predicted_next_stage = Column(String(100), default="Credential Harvesting")
    prediction_confidence = Column(Float, default=0.5)
    explanation_en = Column(Text, default="")
    explanation_hi = Column(Text, default="")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="attack_chains")
    events = relationship("SecurityEvent", back_populates="chain")
    edges = relationship("AttackChainEdge", back_populates="chain", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="chain", cascade="all, delete-orphan")


class AttackChainEdge(Base):
    __tablename__ = "attack_chain_edges"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chain_id = Column(String(36), ForeignKey("attack_chains.id", ondelete="CASCADE"), nullable=False)
    source_event_id = Column(String(36), ForeignKey("security_events.id", ondelete="CASCADE"), nullable=False)
    target_event_id = Column(String(36), ForeignKey("security_events.id", ondelete="CASCADE"), nullable=False)
    relation_type = Column(String(60), nullable=False)    # DELIVERED_URL, HARVESTED_CREDS, REQUESTED_OTP, etc.
    confidence = Column(Float, default=1.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    chain = relationship("AttackChain", back_populates="edges")
