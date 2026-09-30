from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, FinancialProfile, CreditScoreHistory
from schemas import CreditScoreCreate, CreditScoreHistoryItem, CreditAnalyticsResponse
from dependencies import get_current_user
from services.financial_service import add_score_entry
from services.credit_service import compute_credit_analytics

router = APIRouter(prefix="/api/credit", tags=["Credit Analytics"])

@router.get("/score-history", response_model=List[CreditScoreHistoryItem])
def get_score_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    history = db.query(CreditScoreHistory).filter(
        CreditScoreHistory.user_id == current_user.id
    ).order_by(CreditScoreHistory.recorded_at.asc()).all()
    return history

@router.post("/score", response_model=CreditScoreHistoryItem, status_code=status.HTTP_201_CREATED)
def record_new_score(data: CreditScoreCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    entry = add_score_entry(db, current_user, data.credit_score, data.note or "Manual update")
    return entry

@router.get("/analytics", response_model=CreditAnalyticsResponse)
def get_credit_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Financial profile not found. Please complete profile onboarding first."
        )
    
    score_history = db.query(CreditScoreHistory).filter(
        CreditScoreHistory.user_id == current_user.id
    ).order_by(CreditScoreHistory.recorded_at.asc()).all()

    analytics = compute_credit_analytics(profile, score_history)
    return analytics
