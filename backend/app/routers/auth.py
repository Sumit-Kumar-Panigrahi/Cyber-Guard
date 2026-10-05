from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserOut, Token
from app.services.auth_service import register_user, authenticate_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    user = register_user(db, user_in)
    # Automatically log user in upon registration
    auth_res = authenticate_user(
        db,
        UserLogin(
            email=user_in.email,
            password=user_in.password,
            device_name="Desktop Browser (Registration)",
            ip_address="103.211.54.12",
            geo_location="New Delhi, India"
        )
    )
    return auth_res

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    return authenticate_user(db, login_data)

@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/logout")
def logout(current_user: User = Depends(get_current_user)):
    return {"status": "success", "message": f"Session invalidated for {current_user.full_name}"}
