import os
import sys
from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from main import app

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    json_data = response.json()
    assert json_data["service"] == "RiskForge Fraud Investigation Engine"
    assert json_data["status"] == "ONLINE"

def test_list_transactions():
    response = client.get("/api/v1/transactions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

def test_get_hero_transaction_detail():
    response = client.get("/api/v1/transactions/TX82931")
    assert response.status_code == 200
    data = response.json()
    assert data["tx_code"] == "TX82931"
    assert data["amount"] == 185000.0
    assert data["risk_score"] == 91
    assert data["risk_level"] == "CRITICAL"

def test_trigger_investigation():
    response = client.post("/api/v1/transactions/TX82931/investigate")
    assert response.status_code == 200
    data = response.json()
    assert data["risk_level"] == "CRITICAL"
    assert data["recommendation"] == "HOLD"
    assert "findings" in data
    assert "retrieved_policies" in data

def test_submit_decision_audit_log():
    payload = {
        "transaction_id": "TX82931",
        "action": "HOLD",
        "rationale": "High-risk fraud signals confirmed by analyst. Holding transaction payout.",
        "analyst_name": "Senior Fraud Ops Analyst"
    }
    response = client.post("/api/v1/decisions", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "HOLD"
    assert data["new_transaction_status"] == "HELD"
    assert data["decision_by"] == "Senior Fraud Ops Analyst"

    # Verify audit log retrieval
    audit_res = client.get("/api/v1/decisions/TX82931")
    assert audit_res.status_code == 200
    audit_list = audit_res.json()
    assert len(audit_list) > 0
    assert audit_list[0]["action"] == "HOLD"
