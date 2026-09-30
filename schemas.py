from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field

# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    full_name: str

class UserRegister(UserBase):
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None

class PasswordChange(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

# --- Financial Profile Schemas ---
class FinancialProfileBase(BaseModel):
    monthly_income: float = Field(..., ge=0, description="Monthly income in INR")
    monthly_expenses: float = Field(..., ge=0, description="Monthly expenses in INR")
    total_debt: float = Field(..., ge=0, description="Total outstanding debt in INR")
    credit_limit: float = Field(..., ge=0, description="Total credit limit across cards/facilities")
    credit_utilization: Optional[float] = Field(None, ge=0, le=100, description="Credit utilization %")
    active_loans: int = Field(0, ge=0, description="Count of active loans")
    missed_payments: int = Field(0, ge=0, description="Number of missed/late payments in past 24m")
    current_credit_score: int = Field(650, ge=300, le=900, description="CIBIL / Experian Credit Score")

class FinancialProfileCreate(FinancialProfileBase):
    pass

class FinancialProfileUpdate(BaseModel):
    monthly_income: Optional[float] = Field(None, ge=0)
    monthly_expenses: Optional[float] = Field(None, ge=0)
    total_debt: Optional[float] = Field(None, ge=0)
    credit_limit: Optional[float] = Field(None, ge=0)
    credit_utilization: Optional[float] = Field(None, ge=0, le=100)
    active_loans: Optional[int] = Field(None, ge=0)
    missed_payments: Optional[int] = Field(None, ge=0)
    current_credit_score: Optional[int] = Field(None, ge=300, le=900)

class FinancialProfileResponse(FinancialProfileBase):
    id: int
    user_id: int
    dti_ratio: float
    financial_health_score: int
    health_status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# --- Credit Score Schemas ---
class CreditScoreCreate(BaseModel):
    credit_score: int = Field(..., ge=300, le=900)
    note: Optional[str] = None

class CreditScoreHistoryItem(BaseModel):
    id: int
    credit_score: int
    recorded_at: datetime
    note: Optional[str] = None

    class Config:
        from_attributes = True

class CreditAnalyticsResponse(BaseModel):
    current_score: int
    previous_score: Optional[int] = None
    delta: int = 0
    highest_score: int
    lowest_score: int
    score_status: str
    dti_ratio: float
    credit_utilization: float
    available_credit: float
    used_credit: float
    financial_health_score: int
    health_status: str
    score_history: List[CreditScoreHistoryItem]

# --- AI Advisor Schemas ---
class StepPlanItem(BaseModel):
    step: int
    title: str
    description: str
    timeline: str

class AIAnalyzeResponse(BaseModel):
    id: Optional[int] = None
    summary: str
    credit_health_analysis: str
    key_risks: List[str]
    bottlenecks: List[str]
    recommendations: List[str]
    five_step_plan: List[StepPlanItem]
    short_term_goals: List[str]
    long_term_goals: List[str]
    created_at: datetime
    disclaimer: str

# --- Report Schemas ---
class ReportGenerateRequest(BaseModel):
    report_name: Optional[str] = "Comprehensive Financial Health Report"

class ReportSummary(BaseModel):
    id: int
    report_name: str
    report_type: str
    generated_at: datetime

    class Config:
        from_attributes = True

class ReportDetailResponse(ReportSummary):
    data: Dict[str, Any]

# --- Dashboard Schemas ---
class DashboardOverview(BaseModel):
    user: UserResponse
    profile: Optional[FinancialProfileResponse]
    analytics: Optional[CreditAnalyticsResponse]
    latest_ai_advice: Optional[AIAnalyzeResponse] = None
    recent_reports: List[ReportSummary] = []
