import json
from datetime import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, FinancialProfile, AIRecommendation
from schemas import AIAnalyzeResponse
from dependencies import get_current_user
from services.gemini_service import generate_ai_credit_analysis

router = APIRouter(prefix="/api/ai", tags=["AI Advisor"])

@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze_credit_health(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please complete your financial profile before requesting AI credit analysis."
        )

    # Call Gemini service
    ai_result = generate_ai_credit_analysis(profile, user_name=current_user.full_name)

    # Store in database
    rec_record = AIRecommendation(
        user_id=current_user.id,
        summary=ai_result.get("summary", ""),
        credit_health_analysis=ai_result.get("credit_health_analysis", ""),
        key_risks=json.dumps(ai_result.get("key_risks", [])),
        bottlenecks=json.dumps(ai_result.get("bottlenecks", [])),
        recommendations=json.dumps(ai_result.get("recommendations", [])),
        five_step_plan=json.dumps(ai_result.get("five_step_plan", [])),
        short_term_goals=json.dumps(ai_result.get("short_term_goals", [])),
        long_term_goals=json.dumps(ai_result.get("long_term_goals", [])),
        created_at=datetime.utcnow()
    )
    db.add(rec_record)
    db.commit()
    db.refresh(rec_record)

    ai_result["id"] = rec_record.id
    ai_result["created_at"] = rec_record.created_at
    return ai_result

@router.get("/recommendations", response_model=Optional[AIAnalyzeResponse])
def get_latest_recommendations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    rec = db.query(AIRecommendation).filter(
        AIRecommendation.user_id == current_user.id
    ).order_by(AIRecommendation.created_at.desc()).first()

    if not rec:
        return None

    try:
        five_step = json.loads(rec.five_step_plan) if rec.five_step_plan else []
        key_risks = json.loads(rec.key_risks) if rec.key_risks else []
        bottlenecks = json.loads(rec.bottlenecks) if rec.bottlenecks else []
        recs = json.loads(rec.recommendations) if rec.recommendations else []
        short_goals = json.loads(rec.short_term_goals) if rec.short_term_goals else []
        long_goals = json.loads(rec.long_term_goals) if rec.long_term_goals else []
    except Exception:
        five_step = []
        key_risks = []
        bottlenecks = []
        recs = [rec.recommendations]
        short_goals = []
        long_goals = []

    return {
        "id": rec.id,
        "summary": rec.summary,
        "credit_health_analysis": rec.credit_health_analysis or "",
        "key_risks": key_risks,
        "bottlenecks": bottlenecks,
        "recommendations": recs,
        "five_step_plan": five_step,
        "short_term_goals": short_goals,
        "long_term_goals": long_goals,
        "created_at": rec.created_at,
        "disclaimer": "Educational financial wellness guidance, not guaranteed financial advice."
    }
