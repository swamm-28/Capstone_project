from typing import Dict, Any, List, Optional
from models import CreditScoreHistory, FinancialProfile

def get_cibil_status(score: int) -> str:
    if score >= 750:
        return "Excellent"
    elif score >= 700:
        return "Good"
    elif score >= 650:
        return "Fair"
    else:
        return "Needs Attention"

def calculate_dti(monthly_debt_or_expenses: float, monthly_income: float) -> float:
    if monthly_income <= 0:
        return 0.0
    dti = (monthly_debt_or_expenses / monthly_income) * 100.0
    return round(min(dti, 100.0), 2)

def calculate_utilization(credit_limit: float, total_debt_or_utilization: float, direct_utilization: Optional[float] = None) -> float:
    if direct_utilization is not None and direct_utilization >= 0:
        return round(min(direct_utilization, 100.0), 2)
    if credit_limit <= 0:
        return 0.0
    util = (total_debt_or_utilization / credit_limit) * 100.0
    return round(min(util, 100.0), 2)

def calculate_financial_health(
    credit_score: int,
    credit_utilization: float,
    dti_ratio: float,
    missed_payments: int,
    active_loans: int
) -> Dict[str, Any]:
    # 1. Credit Score weight: 40 points
    score_clamped = max(300, min(900, credit_score))
    score_points = ((score_clamped - 300) / 600.0) * 40.0

    # 2. Credit Utilization weight: 25 points
    if credit_utilization <= 30.0:
        util_points = 25.0
    elif credit_utilization <= 50.0:
        util_points = 18.0
    elif credit_utilization <= 70.0:
        util_points = 10.0
    else:
        util_points = 3.0

    # 3. DTI Ratio weight: 20 points
    if dti_ratio <= 30.0:
        dti_points = 20.0
    elif dti_ratio <= 45.0:
        dti_points = 14.0
    elif dti_ratio <= 60.0:
        dti_points = 8.0
    else:
        dti_points = 2.0

    # 4. Missed payments weight: 15 points
    if missed_payments == 0:
        payment_points = 15.0
    elif missed_payments == 1:
        payment_points = 7.0
    elif missed_payments == 2:
        payment_points = 3.0
    else:
        payment_points = 0.0

    total_score = int(round(score_points + util_points + dti_points + payment_points))
    total_score = max(10, min(100, total_score))

    if total_score >= 80:
        status = "Excellent"
    elif total_score >= 68:
        status = "Good"
    elif total_score >= 50:
        status = "Fair"
    else:
        status = "Needs Attention"

    return {
        "score": total_score,
        "status": status,
        "breakdown": {
            "score_points": round(score_points, 1),
            "util_points": round(util_points, 1),
            "dti_points": round(dti_points, 1),
            "payment_points": round(payment_points, 1)
        }
    }

def compute_credit_analytics(profile: FinancialProfile, score_history: List[CreditScoreHistory]) -> Dict[str, Any]:
    scores = [h.credit_score for h in score_history] if score_history else [profile.current_credit_score]
    if not scores:
        scores = [profile.current_credit_score or 650]

    current_score = profile.current_credit_score or scores[-1]
    previous_score = scores[-2] if len(scores) >= 2 else scores[0]
    delta = current_score - previous_score
    highest_score = max(scores)
    lowest_score = min(scores)

    # Utilization calculations
    credit_limit = profile.credit_limit or 0.0
    utilization_pct = profile.credit_utilization or 0.0
    used_credit = (utilization_pct / 100.0) * credit_limit if credit_limit > 0 else 0.0
    available_credit = max(0.0, credit_limit - used_credit)

    return {
        "current_score": current_score,
        "previous_score": previous_score,
        "delta": delta,
        "highest_score": highest_score,
        "lowest_score": lowest_score,
        "score_status": get_cibil_status(current_score),
        "dti_ratio": profile.dti_ratio or 0.0,
        "credit_utilization": utilization_pct,
        "available_credit": available_credit,
        "used_credit": used_credit,
        "financial_health_score": profile.financial_health_score or 70,
        "health_status": profile.health_status or "Good",
        "score_history": score_history
    }
