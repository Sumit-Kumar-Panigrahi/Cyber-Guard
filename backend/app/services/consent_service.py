from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.consent import UserConsent
from app.schemas.consent import ConsentUpdate

def get_or_create_consent(db: Session, user_id: str) -> UserConsent:
    consent = db.query(UserConsent).filter(UserConsent.user_id == user_id).first()
    if not consent:
        consent = UserConsent(
            user_id=user_id,
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
        db.refresh(consent)
    return consent

def update_consent(db: Session, user_id: str, updates: ConsentUpdate) -> UserConsent:
    consent = get_or_create_consent(db, user_id)
    update_data = updates.model_dump(exclude_unset=True)
    
    for field, val in update_data.items():
        if hasattr(consent, field):
            setattr(consent, field, val)
            
    db.commit()
    db.refresh(consent)
    return consent

def purge_face_descriptors(db: Session, user_id: str) -> dict:
    consent = get_or_create_consent(db, user_id)
    consent.opt_in_face_embedding = False
    db.commit()
    return {
        "status": "success",
        "message": "All opt-in face biometric embeddings have been permanently purged from system memory.",
        "user_id": user_id
    }
