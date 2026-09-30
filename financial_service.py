from datetime import datetime
from sqlalchemy.orm import Session
from models import FinancialProfile, CreditScoreHistory, User
from schemas import FinancialProfileCreate, FinancialProfileUpdate
from services.credit_service import calculate_dti, calculate_utilization, calculate_financial_health

def save_or_update_profile(db: Session, user: User, data: FinancialProfileCreate | FinancialProfileUpdate) -> FinancialProfile:
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    
    # Extract values or keep existing
    income = data.monthly_income if data.monthly_income is not None else (profile.monthly_income if profile else 0.0)
    expenses = data.monthly_expenses if data.monthly_expenses is not None else (profile.monthly_expenses if profile else 0.0)
    debt = data.total_debt if data.total_debt is not None else (profile.total_debt if profile else 0.0)
    limit = data.credit_limit if data.credit_limit is not None else (profile.credit_limit if profile else 0.0)
    active_loans = data.active_loans if data.active_loans is not None else (profile.active_loans if profile else 0)
    missed_payments = data.missed_payments if data.missed_payments is not None else (profile.missed_payments if profile else 0)
    score = data.current_credit_score if data.current_credit_score is not None else (profile.current_credit_score if profile else 650)

    # Utilization
    if data.credit_utilization is not None:
        utilization = round(min(100.0, max(0.0, data.credit_utilization)), 2)
    elif limit > 0 and debt > 0:
        utilization = calculate_utilization(limit, debt)
    elif profile and profile.credit_utilization is not None:
        utilization = profile.credit_utilization
    else:
        utilization = 30.0

    # DTI Ratio
    # In Indian banking, DTI can be calculated using monthly debt obligations or expenses vs income
    dti = calculate_dti(expenses, income)

    # Health score
    health = calculate_financial_health(score, utilization, dti, missed_payments, active_loans)

    score_changed = False
    if not profile:
        profile = FinancialProfile(
            user_id=user.id,
            monthly_income=income,
            monthly_expenses=expenses,
            total_debt=debt,
            credit_limit=limit,
            credit_utilization=utilization,
            active_loans=active_loans,
            missed_payments=missed_payments,
            current_credit_score=score,
            dti_ratio=dti,
            financial_health_score=health["score"],
            health_status=health["status"]
        )
        db.add(profile)
        score_changed = True
    else:
        if profile.current_credit_score != score:
            score_changed = True

        profile.monthly_income = income
        profile.monthly_expenses = expenses
        profile.total_debt = debt
        profile.credit_limit = limit
        profile.credit_utilization = utilization
        profile.active_loans = active_loans
        profile.missed_payments = missed_payments
        profile.current_credit_score = score
        profile.dti_ratio = dti
        profile.financial_health_score = health["score"]
        profile.health_status = health["status"]
        profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(profile)

    # Record to history if new or changed
    if score_changed:
        history_entry = CreditScoreHistory(
            user_id=user.id,
            credit_score=score,
            recorded_at=datetime.utcnow(),
            note="Score update"
        )
        db.add(history_entry)
        db.commit()

    return profile

def add_score_entry(db: Session, user: User, credit_score: int, note: str = "Manual update") -> CreditScoreHistory:
    entry = CreditScoreHistory(
        user_id=user.id,
        credit_score=credit_score,
        recorded_at=datetime.utcnow(),
        note=note
    )
    db.add(entry)

    # Update profile score as well
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == user.id).first()
    if profile:
        profile.current_credit_score = credit_score
        health = calculate_financial_health(
            credit_score,
            profile.credit_utilization or 30.0,
            profile.dti_ratio or 35.0,
            profile.missed_payments or 0,
            profile.active_loans or 0
        )
        profile.financial_health_score = health["score"]
        profile.health_status = health["status"]
        profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(entry)
    return entry
