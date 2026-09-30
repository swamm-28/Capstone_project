import sys
from datetime import datetime, timedelta
from database import SessionLocal, engine, Base
import models
from models import User, CreditScoreHistory, FinancialProfile
from auth import get_password_hash
from services.financial_service import save_or_update_profile
from schemas import FinancialProfileCreate

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        email = "demo.cibil@creditassistant.in"
        user = db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                full_name="Sakshi Phalke",
                email=email,
                password_hash=get_password_hash("DemoPass123!")
            )
            db.add(user)
            db.commit()
            db.refresh(user)
            print(f"Created demo user: {user.email}")
        else:
            print(f"Demo user exists: {user.email}")

        # Clear existing score history
        db.query(CreditScoreHistory).filter(CreditScoreHistory.user_id == user.id).delete()

        # Score progression: 690 -> 702 -> 715 -> 728 -> 735
        past_dates = [
            (datetime.utcnow() - timedelta(days=120), 690, "Initial CIBIL report"),
            (datetime.utcnow() - timedelta(days=90), 702, "Paid off personal overdraft"),
            (datetime.utcnow() - timedelta(days=60), 715, "Lowered card utilization to 45%"),
            (datetime.utcnow() - timedelta(days=30), 728, "Zero late payments milestone"),
            (datetime.utcnow() - timedelta(days=5), 735, "Credit limit increase approved")
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
        data = FinancialProfileCreate(
            monthly_income=75000.0,
            monthly_expenses=42000.0,
            total_debt=250000.0,
            credit_limit=400000.0,
            credit_utilization=37.5,
            active_loans=2,
            missed_payments=0,
            current_credit_score=735
        )
        save_or_update_profile(db, user, data)
        print("Demo financial profile seeded successfully!")
        print("Credentials: demo.cibil@creditassistant.in / DemoPass123!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
