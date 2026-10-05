from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserConsent(Base):
    __tablename__ = "user_consents"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    messages_enabled = Column(Boolean, default=False)
    email_enabled = Column(Boolean, default=False)
    browser_protection_enabled = Column(Boolean, default=False)
    social_share_enabled = Column(Boolean, default=False)
    call_guard_enabled = Column(Boolean, default=False)
    identity_monitoring_enabled = Column(Boolean, default=False)
    login_security_enabled = Column(Boolean, default=True)
    raw_storage_prohibited = Column(Boolean, default=True)
    opt_in_face_embedding = Column(Boolean, default=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="consent")
