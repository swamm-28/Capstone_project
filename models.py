import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    financial_profile = relationship("FinancialProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    score_history = relationship("CreditScoreHistory", back_populates="user", cascade="all, delete-orphan", order_by="CreditScoreHistory.recorded_at")
    ai_recommendations = relationship("AIRecommendation", back_populates="user", cascade="all, delete-orphan", order_by="desc(AIRecommendation.created_at)")
    reports = relationship("FinancialReport", back_populates="user", cascade="all, delete-orphan", order_by="desc(FinancialReport.generated_at)")

class FinancialProfile(Base):
    __tablename__ = "financial_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    monthly_income = Column(Float, default=0.0)
    monthly_expenses = Column(Float, default=0.0)
    total_debt = Column(Float, default=0.0)
    credit_limit = Column(Float, default=0.0)
    credit_utilization = Column(Float, default=0.0) # in percentage e.g. 35.0
    active_loans = Column(Integer, default=0)
    missed_payments = Column(Integer, default=0)
    current_credit_score = Column(Integer, default=650)
    dti_ratio = Column(Float, default=0.0) # debt-to-income percentage
    financial_health_score = Column(Integer, default=70) # 0-100 composite score
    health_status = Column(String(50), default="Fair") # Excellent, Good, Fair, Needs Attention
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="financial_profile")

class CreditScoreHistory(Base):
    __tablename__ = "credit_score_history"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    credit_score = Column(Integer, nullable=False)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    note = Column(String(200), nullable=True)

    user = relationship("User", back_populates="score_history")

class AIRecommendation(Base):
    __tablename__ = "ai_recommendations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    summary = Column(Text, nullable=False)
    credit_health_analysis = Column(Text, nullable=True)
    key_risks = Column(Text, nullable=True) # JSON or markdown list
    bottlenecks = Column(Text, nullable=True) # JSON or markdown list
    recommendations = Column(Text, nullable=False) # JSON or markdown list
    five_step_plan = Column(Text, nullable=True) # JSON string of 5 steps
    short_term_goals = Column(Text, nullable=True)
    long_term_goals = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="ai_recommendations")

class FinancialReport(Base):
    __tablename__ = "financial_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    report_name = Column(String(200), nullable=False)
    report_type = Column(String(50), default="HEALTH_ANALYSIS")
    data_json = Column(Text, nullable=False) # Snapshot of financial state + score + AI advice
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="reports")
