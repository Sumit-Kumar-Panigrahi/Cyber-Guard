from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.consent import ConsentOut, ConsentUpdate
from app.services.auth_service import get_current_user
from app.services.consent_service import get_or_create_consent, update_consent, purge_face_descriptors

router = APIRouter(prefix="/consent", tags=["Privacy & Consent"])

@router.get("", response_model=ConsentOut)
def fetch_consent(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Retrieve current user's per-source privacy and permission preferences."""
    return get_or_create_consent(db, current_user.id)

@router.put("", response_model=ConsentOut)
def modify_consent(
    updates: ConsentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update granular per-source permissions (SMS, Email, Browser, WhatsApp, Call Guard, Identity)."""
    return update_consent(db, current_user.id, updates)

@router.delete("/face-data")
def delete_face_biometrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently delete and purge opt-in face biometric embeddings."""
    return purge_face_descriptors(db, current_user.id)
