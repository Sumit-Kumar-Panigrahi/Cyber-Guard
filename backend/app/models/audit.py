import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class DeviceAuditLog(Base):
    __tablename__ = "device_audit_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    device_fingerprint = Column(String(255), nullable=False)
    device_name = Column(String(100), default="Unknown Device")
    ip_address = Column(String(60), nullable=False)
    geo_location = Column(String(100), default="New Delhi, India")
    browser_agent = Column(String(255), nullable=False)
    is_trusted = Column(Boolean, default=False)
    logged_in_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="audit_logs")
