import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    chain_id = Column(String(36), ForeignKey("attack_chains.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String(30), default="NEW")             # NEW | INVESTIGATING | CONTAINED | RESOLVED
    recommended_action = Column(String(80), nullable=False) # REVOKE_SESSION | BLOCK_DEVICE | BLOCK_DOMAIN
    action_target = Column(String(255), nullable=False)    # Target identifier (e.g., Session Token, IP, Domain)
    action_approved_by = Column(String(120), nullable=True) # Full Name or ID of user/admin
    action_executed_at = Column(DateTime, nullable=True)
    resolution_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    chain = relationship("AttackChain", back_populates="incidents")
    user = relationship("User", back_populates="incidents")
