import os
import sys
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import Base
from models import User, Merchant, Transaction, Decision
from risk_engine.rules import run_all_rules
from risk_engine.scoring import calculate_risk
from agent.investigation_agent import run_investigation

TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(TEST_DATABASE_URL)
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    session = TestingSessionLocal()
    
    user = User(id="USR_TEST", name="Test User", average_transaction=1000.0, usual_location="Mumbai, MH")
    merchant = Merchant(id="MER_TEST", name="Test Merchant", account_age_days=10, risk_category="HIGH")
    session.add_all([user, merchant])
    session.commit()

    yield session
    session.close()

def test_rule_engine_hero_scenario():
    user = {"average_transaction": 1500.0, "usual_location": "Mumbai, MH"}
    merchant = {"account_age_days": 14, "risk_category": "HIGH"}
    tx = {"amount": 185000.0, "is_new_device": True, "location": "Bengaluru, KA"}
    
    score, factors = run_all_rules(tx, user, merchant, recent_transaction_count=12)
    
    assert "Unusual amount" in factors
    assert "High velocity" in factors
    assert "New device" in factors
    assert "Merchant risk" in factors
    assert "Location anomaly" in factors
    assert score == 100

def test_scoring_hero_scenario():
    user = {"average_transaction": 1500.0, "usual_location": "Mumbai, MH"}
    merchant = {"account_age_days": 14, "risk_category": "HIGH"}
    tx = {"amount": 185000.0, "is_new_device": True, "location": "Bengaluru, KA"}
    
    result = calculate_risk(tx, user, merchant, recent_transaction_count=12)
    
    assert result["rule_score"] == 100
    assert result["anomaly_score"] == 100
    assert result["risk_score"] == 100
    assert result["risk_level"] == "CRITICAL"

def test_investigation_agent(db_session):
    tx = Transaction(
        id="TX_TEST_001",
        tx_code="TXT001",
        user_id="USR_TEST",
        merchant_id="MER_TEST",
        amount=185000.0,
        currency="INR",
        device_id="DEV_NEW",
        is_new_device=True,
        location="Bengaluru, KA",
        status="FLAGGED"
    )
    db_session.add(tx)
    db_session.commit()

    scoring = {
        "rule_score": 100,
        "anomaly_score": 100,
        "risk_score": 91,
        "risk_level": "CRITICAL",
        "risk_factors": ["Unusual amount", "High velocity", "New device", "Merchant risk", "Location anomaly"]
    }

    inv = run_investigation(tx, scoring, db_session)
    
    assert inv["recommendation"] == "HOLD"
    assert len(inv["findings"]) >= 3
    assert len(inv["retrieved_policies"]) >= 1
