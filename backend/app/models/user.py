import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # 'user' | 'admin' | 'soc_analyst'
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    consent = relationship("UserConsent", back_populates="user", uselist=False, cascade="all, delete-orphan")
    events = relationship("SecurityEvent", back_populates="user", cascade="all, delete-orphan")
    attack_chains = relationship("AttackChain", back_populates="user", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="user", cascade="all, delete-orphan")
    audit_logs = relationship("DeviceAuditLog", back_populates="user", cascade="all, delete-orphan")
