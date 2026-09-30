import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User, FinancialProfile, CreditScoreHistory, AIRecommendation, FinancialReport
from schemas import DashboardOverview, UserResponse, FinancialProfileResponse, CreditAnalyticsResponse, AIAnalyzeResponse, ReportSummary
from dependencies import get_current_user
from services.credit_service import compute_credit_analytics

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardOverview)
def get_dashboard(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    
    analytics = None
    if profile:
        history = db.query(CreditScoreHistory).filter(
            CreditScoreHistory.user_id == current_user.id
        ).order_by(CreditScoreHistory.recorded_at.asc()).all()
        analytics = compute_credit_analytics(profile, history)

    latest_ai = db.query(AIRecommendation).filter(
        AIRecommendation.user_id == current_user.id
    ).order_by(AIRecommendation.created_at.desc()).first()

    latest_ai_resp = None
    if latest_ai:
        try:
            five_step = json.loads(latest_ai.five_step_plan) if latest_ai.five_step_plan else []
            key_risks = json.loads(latest_ai.key_risks) if latest_ai.key_risks else []
            bottlenecks = json.loads(latest_ai.bottlenecks) if latest_ai.bottlenecks else []
            recs = json.loads(latest_ai.recommendations) if latest_ai.recommendations else []
            short_goals = json.loads(latest_ai.short_term_goals) if latest_ai.short_term_goals else []
            long_goals = json.loads(latest_ai.long_term_goals) if latest_ai.long_term_goals else []
        except Exception:
            five_step = []
            key_risks = []
            bottlenecks = []
            recs = [latest_ai.recommendations]
            short_goals = []
            long_goals = []

        latest_ai_resp = {
            "id": latest_ai.id,
            "summary": latest_ai.summary,
            "credit_health_analysis": latest_ai.credit_health_analysis or "",
            "key_risks": key_risks,
            "bottlenecks": bottlenecks,
            "recommendations": recs,
            "five_step_plan": five_step,
            "short_term_goals": short_goals,
            "long_term_goals": long_goals,
            "created_at": latest_ai.created_at,
            "disclaimer": "Educational financial wellness guidance, not guaranteed financial advice."
        }

    recent_reports = db.query(FinancialReport).filter(
        FinancialReport.user_id == current_user.id
    ).order_by(FinancialReport.generated_at.desc()).limit(5).all()

    return {
        "user": current_user,
        "profile": profile,
        "analytics": analytics,
        "latest_ai_advice": latest_ai_resp,
        "recent_reports": recent_reports
    }
