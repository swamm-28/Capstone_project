from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, FinancialProfile, CreditScoreHistory
from schemas import UserRegister, UserLogin, UserResponse, Token
from auth import verify_password, get_password_hash, create_access_token
from dependencies import get_current_user
from services.financial_service import save_or_update_profile
from schemas import FinancialProfileCreate

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    if user_in.password != user_in.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )
    
    existing = db.query(User).filter(User.email == user_in.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists"
        )

    user = User(
        full_name=user_in.full_name.strip(),
        email=user_in.email.lower().strip(),
        password_hash=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email.lower().strip()).first()
    if not user or not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@router.post("/demo-seed", response_model=Token)
def create_demo_user_with_seed(db: Session = Depends(get_db)):
    """Creates or resets the realistic demo user account with full Indian financial ecosystem data."""
    demo_email = "demo.cibil@creditassistant.in"
    user = db.query(User).filter(User.email == demo_email).first()

    if not user:
        user = User(
            full_name="Sakshi Phalke",
            email=demo_email,
            password_hash=get_password_hash("DemoPass123!")
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    # Seed score progression history: 690 -> 702 -> 715 -> 728 -> 735
    db.query(CreditScoreHistory).filter(CreditScoreHistory.user_id == user.id).delete()
    
    past_dates = [
        (datetime.utcnow() - timedelta(days=120), 690, "Initial CIBIL audit"),
        (datetime.utcnow() - timedelta(days=90), 702, "Paid off personal overdraft"),
        (datetime.utcnow() - timedelta(days=60), 715, "Lowered card utilization to 45%"),
        (datetime.utcnow() - timedelta(days=30), 728, "Zero late payments milestone"),
        (datetime.utcnow() - timedelta(days=5), 735, "Limit enhancement approved")
    ]
    
    for recorded, score, note in past_dates:
        h = CreditScoreHistory(
            user_id=user.id,
            credit_score=score,
            recorded_at=recorded,
            note=note
        )
        db.add(h)
    db.commit()

    # Seed profile
    seed_data = FinancialProfileCreate(
        monthly_income=75000.0,
        monthly_expenses=42000.0,
        total_debt=250000.0,
        credit_limit=400000.0,
        credit_utilization=37.5,
        active_loans=2,
        missed_payments=0,
        current_credit_score=735
    )
    save_or_update_profile(db, user, seed_data)

    token = create_access_token(data={"sub": str(user.id), "email": user.email})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user
    }
