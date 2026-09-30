import json
from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from database import get_db
from models import User, FinancialProfile, CreditScoreHistory, AIRecommendation, FinancialReport
from schemas import ReportGenerateRequest, ReportSummary, ReportDetailResponse
from dependencies import get_current_user
from services.credit_service import compute_credit_analytics
from services.gemini_service import generate_ai_credit_analysis
from services.pdf_service import generate_pdf_report

router = APIRouter(prefix="/api/reports", tags=["Reports"])

@router.post("/generate", response_model=ReportDetailResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    req: ReportGenerateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(FinancialProfile).filter(FinancialProfile.user_id == current_user.id).first()
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot generate financial health report without an initialized profile."
        )

    score_history = db.query(CreditScoreHistory).filter(
        CreditScoreHistory.user_id == current_user.id
    ).order_by(CreditScoreHistory.recorded_at.asc()).all()
    analytics = compute_credit_analytics(profile, score_history)

    # Get latest AI advice or generate fresh
    latest_ai = db.query(AIRecommendation).filter(
        AIRecommendation.user_id == current_user.id
    ).order_by(AIRecommendation.created_at.desc()).first()

    if latest_ai:
        try:
            ai_data = {
                "summary": latest_ai.summary,
                "credit_health_analysis": latest_ai.credit_health_analysis,
                "key_risks": json.loads(latest_ai.key_risks),
                "bottlenecks": json.loads(latest_ai.bottlenecks),
                "recommendations": json.loads(latest_ai.recommendations),
                "five_step_plan": json.loads(latest_ai.five_step_plan),
                "short_term_goals": json.loads(latest_ai.short_term_goals),
                "long_term_goals": json.loads(latest_ai.long_term_goals),
            }
        except Exception:
            ai_data = generate_ai_credit_analysis(profile, current_user.full_name)
    else:
        ai_data = generate_ai_credit_analysis(profile, current_user.full_name)

    # Compile snapshot
    snapshot = {
        "user_name": current_user.full_name,
        "email": current_user.email,
        "current_credit_score": analytics["current_score"],
        "score_delta": f"+{analytics['delta']}" if analytics["delta"] >= 0 else str(analytics["delta"]),
        "financial_health_score": analytics["financial_health_score"],
        "health_status": analytics["health_status"],
        "monthly_income": profile.monthly_income,
        "monthly_expenses": profile.monthly_expenses,
        "total_debt": profile.total_debt,
        "credit_limit": profile.credit_limit,
        "credit_utilization": analytics["credit_utilization"],
        "dti_ratio": analytics["dti_ratio"],
        "active_loans": profile.active_loans,
        "missed_payments": profile.missed_payments,
        "score_history": [
            {
                "id": h.id,
                "credit_score": h.credit_score,
                "recorded_at": h.recorded_at.isoformat(),
                "note": h.note
            }
            for h in score_history
        ],
        "ai_advice": ai_data,
        "generated_at": datetime.utcnow().isoformat()
    }

    report_record = FinancialReport(
        user_id=current_user.id,
        report_name=req.report_name or f"Credit Health Audit - {datetime.utcnow().strftime('%b %Y')}",
        report_type="HEALTH_ANALYSIS",
        data_json=json.dumps(snapshot),
        generated_at=datetime.utcnow()
    )
    db.add(report_record)
    db.commit()
    db.refresh(report_record)

    return {
        "id": report_record.id,
        "report_name": report_record.report_name,
        "report_type": report_record.report_type,
        "generated_at": report_record.generated_at,
        "data": snapshot
    }

@router.get("", response_model=List[ReportSummary])
def list_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    reports = db.query(FinancialReport).filter(
        FinancialReport.user_id == current_user.id
    ).order_by(FinancialReport.generated_at.desc()).all()
    return reports

@router.get("/{report_id}", response_model=ReportDetailResponse)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(FinancialReport).filter(
        FinancialReport.id == report_id,
        FinancialReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    
    return {
        "id": report.id,
        "report_name": report.report_name,
        "report_type": report.report_type,
        "generated_at": report.generated_at,
        "data": json.loads(report.data_json)
    }

@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    report = db.query(FinancialReport).filter(
        FinancialReport.id == report_id,
        FinancialReport.user_id == current_user.id
    ).first()
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    data = json.loads(report.data_json)
    pdf_buffer = generate_pdf_report(current_user.full_name, current_user.email, data)

    filename = f"CreditAssistant_Report_{current_user.full_name.replace(' ', '_')}_{report.id}.pdf"
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
