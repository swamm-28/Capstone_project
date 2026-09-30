from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, FinancialProfile
from schemas import FinancialProfileCreate, FinancialProfileUpdate, FinancialProfileResponse
from dependencies import get_current_user
from services.financial_service import save_or_update_profile

router = APIRouter(prefix="/api/financial", tags=["Financial Profile"])

@router.get("/profile", response_model=FinancialProfileResponse)
def get_profile(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Financial profile not found. Please complete onboarding.")
    return profile

@router.post("/profile", response_model=FinancialProfileResponse, status_code=status.HTTP_201_CREATED)
def create_profile(data: FinancialProfileCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = save_or_update_profile(db, current_user, data)
    return profile

@router.put("/profile", response_model=FinancialProfileResponse)
def update_profile(data: FinancialProfileUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = save_or_update_profile(db, current_user, data)
    return profile
