import os
import json
from typing import Dict, Any
from datetime import datetime
from models import FinancialProfile

def generate_ai_credit_analysis(profile: FinancialProfile, user_name: str = "User") -> Dict[str, Any]:
    api_key = os.getenv("GEMINI_API_KEY", "")
    
    # Financial context formatted in INR
    credit_score = profile.current_credit_score
    income = f"₹{profile.monthly_income:,.2f}"
    expenses = f"₹{profile.monthly_expenses:,.2f}"
    debt = f"₹{profile.total_debt:,.2f}"
    credit_limit = f"₹{profile.credit_limit:,.2f}"
    utilization = f"{profile.credit_utilization:.1f}%"
    active_loans = profile.active_loans
    missed_payments = profile.missed_payments
    dti = f"{profile.dti_ratio:.1f}%"
    health_score = profile.financial_health_score
    health_status = profile.health_status

    prompt = f"""You are a senior financial wellness and credit health consultant specializing in the Indian financial and banking ecosystem (CIBIL, Experian, RBI credit guidelines).

Analyze the following user's verified financial profile:
- User Name: {user_name}
- Current CIBIL/Credit Score: {credit_score} (Status: {health_status})
- Monthly Income: {income}
- Monthly Expenses/Obligations: {expenses}
- Total Outstanding Debt: {debt}
- Total Available Credit Limit: {credit_limit}
- Current Credit Utilization: {utilization} (Ideal: <= 30%)
- Active Loans: {active_loans}
- Missed Payments (past 24 months): {missed_payments}
- Debt-to-Income (DTI) Ratio: {dti} (Healthy benchmark: <= 35%)
- Financial Health Score: {health_score}/100

Respond strictly in valid JSON matching this schema:
{{
  "summary": "Concise 2-3 sentence overview of the user's current credit standing and primary leverage points in the Indian market.",
  "credit_health_analysis": "Detailed 2-paragraph evaluation of creditworthiness, repayment reliability, and capacity to service debt under Indian banking conditions.",
  "key_risks": [
    "Risk 1 with specific impact on CIBIL score",
    "Risk 2",
    "Risk 3"
  ],
  "bottlenecks": [
    "Bottleneck 1 preventing score improvement",
    "Bottleneck 2",
    "Bottleneck 3"
  ],
  "recommendations": [
    "Actionable recommendation 1",
    "Actionable recommendation 2",
    "Actionable recommendation 3",
    "Actionable recommendation 4"
  ],
  "five_step_plan": [
    {{
      "step": 1,
      "title": "Action title for Step 1",
      "description": "Specific tactical action",
      "timeline": "e.g. Month 1 (Days 1-30)"
    }},
    {{
      "step": 2,
      "title": "Action title for Step 2",
      "description": "Specific tactical action",
      "timeline": "e.g. Month 2 (Days 31-60)"
    }},
    {{
      "step": 3,
      "title": "Action title for Step 3",
      "description": "Specific tactical action",
      "timeline": "e.g. Month 3-4 (Days 61-120)"
    }},
    {{
      "step": 4,
      "title": "Action title for Step 4",
      "description": "Specific tactical action",
      "timeline": "e.g. Month 5-6"
    }},
    {{
      "step": 5,
      "title": "Action title for Step 5",
      "description": "Specific tactical action",
      "timeline": "e.g. Month 6-12"
    }}
  ],
  "short_term_goals": [
    "Goal within next 30-60 days",
    "Goal within next 30-60 days"
  ],
  "long_term_goals": [
    "Goal for next 6-12 months",
    "Goal for next 6-12 months"
  ]
}}

Ensure all numbers are realistic and directly reflect the user's data. Avoid generic fluff. Do NOT guarantee exact point jumps, but educate on proven credit score mechanisms."""

    disclaimer = "This report and guidance are generated for educational and financial wellness planning purposes only. It does not constitute official lending underwriting, legal, or guaranteed financial advice under SEBI or RBI regulations."

    if api_key and api_key != "your_gemini_api_key_here":
        try:
            from google import genai
            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model='gemini-3.8-flash',
                contents=prompt,
                config={
                    'response_mime_type': 'application/json'
                }
            )
            raw_text = response.text
            parsed = json.loads(raw_text)
            parsed["disclaimer"] = disclaimer
            parsed["created_at"] = datetime.utcnow().isoformat()
            return parsed
        except Exception as e:
            print(f"[Gemini Service Warning]: Direct API call failed: {e}. Falling back to rule-based financial analysis engine.")

    # High-quality deterministic fallback analysis tailored to profile data
    util_val = profile.credit_utilization or 0.0
    dti_val = profile.dti_ratio or 0.0
    score_val = profile.current_credit_score or 650
    missed_val = profile.missed_payments or 0

    risks = []
    bottlenecks = []
    recs = []

    if util_val > 40.0:
        risks.append(f"High credit utilization at {util_val:.1f}% signals credit reliance to CIBIL and suppresses score by up to 45 points.")
        bottlenecks.append(f"Credit card revolving balances are consuming over {util_val:.1f}% of total borrowing limit.")
        recs.append("Implement the 30% utilization rule by requesting a credit limit hike or splitting spends across multiple billing cycles.")
    else:
        recs.append("Maintain credit utilization below 30% to maximize the credit capacity metric in bureau reports.")

    if missed_val > 0:
        risks.append(f"{missed_val} missed payment(s) in history severely impact repayment track record (which constitutes ~35% of CIBIL weighting).")
        bottlenecks.append("Prior late payments flagged in DPDS (Days Past Due) reports.")
        recs.append("Set up NACH / e-mandate auto-debit on all ongoing loan EMIs and credit card minimum dues immediately.")
    else:
        recs.append("Flawless zero-default track record. Preserve this by scheduling payment alerts 5 days prior to statement due dates.")

    if dti_val > 45.0:
        risks.append(f"Elevated DTI of {dti_val:.1f}% limits headroom for prospective home or auto loan approvals from Indian banks.")
        bottlenecks.append("Fixed obligations exceed 45% of net monthly earnings.")
        recs.append("Target prepayments on high-interest unsecured personal loans to compress monthly EMI outgo.")

    recs.append("Review CIBIL credit report quarterly to check for erroneous accounts, spelling mismatches in PAN, or unclosed inquiries.")

    if not risks:
        risks.append("Occasional hard inquiries if applying for multiple credit cards concurrently.")
    if not bottlenecks:
        bottlenecks.append("Limited diversity between secured (home/auto) and unsecured (personal/credit card) credit facilities.")

    summary = f"Your current credit standing stands at {score_val} ({health_status}) with a credit utilization of {util_val:.1f}% and DTI of {dti_val:.1f}%. While your base profile demonstrates solid credit potential, targeted discipline in utilization and payment timing will unlock premier tier CIBIL scores (780+)."

    credit_health_analysis = f"Based on analysis of your monthly cash flow ({income} income vs {expenses} expenses) and debt load of {debt}, your debt-to-income ratio is currently {dti_val:.1f}%. Indian lenders typically favor applicants with DTI under 35-40% for pre-approved lending terms. Your utilization of {util_val:.1f}% demonstrates {'controlled' if util_val <= 30 else 'elevated'} usage across your {credit_limit} credit limit."

    five_step_plan = [
        {
            "step": 1,
            "title": "Compress Credit Utilization Below 30%",
            "description": f"Pay down card balances mid-month before the billing date to report an utilization ratio under 30% on your {credit_limit} limit.",
            "timeline": "Month 1 (Days 1–30)"
        },
        {
            "step": 2,
            "title": "Automate All Ongoing EMI & Dues Via NACH/Auto-Debit",
            "description": "Eliminate late fee and CIBIL DPD reporting risk by scheduling automated clearing for all active credit facilities.",
            "timeline": "Month 2 (Days 31–60)"
        },
        {
            "step": 3,
            "title": "Tackle High-Interest Unsecured Debt First",
            "description": "Utilize debt avalanche methodology: allocate surplus monthly savings toward credit card rollover charges and personal loans.",
            "timeline": "Month 3–4 (Days 61–120)"
        },
        {
            "step": 4,
            "title": "Request Strategic Credit Limit Enhancement",
            "description": "Contact your primary card issuer for an income-backed limit increase without opening fresh credit lines, instantly dropping utilization ratio.",
            "timeline": "Month 5 (Days 121–150)"
        },
        {
            "step": 5,
            "title": "Establish Diversified Healthy Credit Mix",
            "description": "Maintain existing seasoned accounts to build account age history, while limiting fresh hard credit inquiries to zero for 6 months.",
            "timeline": "Month 6–12 (Long-term)"
        }
    ]

    short_term_goals = [
        "Reduce current credit card balance to under 25% before the next billing cycle.",
        "Verify bank statements and enable auto-debit for full monthly bill amounts."
    ]

    long_term_goals = [
        "Achieve and sustain a CIBIL score of 780+ to qualify for prime lending interest rates.",
        "Bring Debt-to-Income ratio below 28% to maximize home loan borrowing eligibility."
    ]

    return {
        "summary": summary,
        "credit_health_analysis": credit_health_analysis,
        "key_risks": risks,
        "bottlenecks": bottlenecks,
        "recommendations": recs,
        "five_step_plan": five_step_plan,
        "short_term_goals": short_term_goals,
        "long_term_goals": long_term_goals,
        "disclaimer": disclaimer,
        "created_at": datetime.utcnow().isoformat()
    }
