from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models.user import User
from app.models.consent import UserConsent
from app.models.audit import DeviceAuditLog
from app.schemas.user import UserCreate, UserLogin
from app.utils.security import hash_password, verify_password, create_access_token, decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception
    user_id: Optional[str] = payload.get("sub")
    if user_id is None:
        raise credentials_exception
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_current_user(
    token: Optional[str] = Depends(oauth2_scheme_optional),
    db: Session = Depends(get_db)
) -> Optional[User]:
    if token:
        payload = decode_access_token(token)
        if payload and payload.get("sub"):
            user = db.query(User).filter(User.id == payload.get("sub")).first()
            if user:
                return user
    # Fallback to demo user
    return db.query(User).first()

def register_user(db: Session, user_in: UserCreate) -> User:
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address is already registered."
        )
    
    hashed_pwd = hash_password(user_in.password)
    user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        hashed_password=hashed_pwd,
        role=user_in.role or "user"
    )
    db.add(user)
    db.flush()

    # Automatically initialize default privacy and consent settings
    consent = UserConsent(
        user_id=user.id,
        messages_enabled=False,
        email_enabled=False,
        browser_protection_enabled=False,
        social_share_enabled=False,
        call_guard_enabled=False,
        identity_monitoring_enabled=False,
        login_security_enabled=True,
        raw_storage_prohibited=True,
        opt_in_face_embedding=False
    )
    db.add(consent)
    db.commit()
    db.refresh(user)
    return user

def authenticate_user(db: Session, login_data: UserLogin) -> dict:
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Audit device login
    audit_log = DeviceAuditLog(
        user_id=user.id,
        device_fingerprint=login_data.device_fingerprint or "unknown_fp",
        device_name=login_data.device_name or "Desktop Browser",
        ip_address=login_data.ip_address or "127.0.0.1",
        geo_location=login_data.geo_location or "New Delhi, India",
        browser_agent=login_data.device_name or "Mozilla/5.0",
        is_trusted=True
    )
    db.add(audit_log)
    db.commit()

    token_payload = {
        "sub": user.id,
        "name": user.full_name,
        "email": user.email,
        "role": user.role
    }
    access_token = create_access_token(data=token_payload)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }
