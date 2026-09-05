import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, nullable=True)
    average_transaction = Column(Float, default=1000.0)
    usual_location = Column(String, default="Mumbai, MH")
    trust_score = Column(Integer, default=85)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="user")


class Merchant(Base):
    __tablename__ = "merchants"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    account_age_days = Column(Integer, default=365)
    risk_category = Column(String, default="LOW")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transactions = relationship("Transaction", back_populates="merchant")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    tx_code = Column(String, unique=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    merchant_id = Column(String, ForeignKey("merchants.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="INR")
    device_id = Column(String, nullable=False)
    is_new_device = Column(Boolean, default=False)
    location = Column(String, nullable=False)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String, default="FLAGGED") # FLAGGED, APPROVED, HELD, ESCALATED
    
    risk_score = Column(Integer, nullable=True)
    risk_level = Column(String, nullable=True)
    risk_factors = Column(JSON, nullable=True) # List of triggered factor labels

    user = relationship("User", back_populates="transactions")
    merchant = relationship("Merchant", back_populates="transactions")
    investigations = relationship("Investigation", back_populates="transaction")
    decisions = relationship("Decision", back_populates="transaction")


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    rule_score = Column(Integer, nullable=False)
    anomaly_score = Column(Integer, nullable=False)
    risk_score = Column(Integer, nullable=False)
    risk_level = Column(String, nullable=False)
    findings = Column(JSON, nullable=False) # List of findings from agent
    retrieved_policies = Column(JSON, nullable=False) # List of policy snippets
    explanation = Column(Text, nullable=False)
    recommendation = Column(String, nullable=False) # APPROVE, REQUEST_VERIFICATION, HOLD, ESCALATE
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="investigations")


class Decision(Base):
    __tablename__ = "decisions"

    id = Column(String, primary_key=True, index=True)
    transaction_id = Column(String, ForeignKey("transactions.id"), nullable=False)
    analyst_action = Column(String, nullable=False) # APPROVE, REQUEST_VERIFICATION, HOLD, ESCALATE
    rationale = Column(Text, nullable=True)
    decision_by = Column(String, default="Risk Analyst (AI-Assisted)")
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    transaction = relationship("Transaction", back_populates="decisions")
