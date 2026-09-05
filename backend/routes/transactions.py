import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from database import get_db
from models import Transaction, User, Merchant, Investigation
from risk_engine.scoring import calculate_risk
from agent.investigation_agent import run_investigation

router = APIRouter(prefix="/api/v1/transactions", tags=["Transactions"])

class TransactionCreateSchema(BaseModel):
    user_id: str
    merchant_id: str
    amount: float
    currency: Optional[str] = "INR"
    device_id: str
    is_new_device: Optional[bool] = False
    location: str
    ip_address: Optional[str] = "127.0.0.1"
    recent_velocity_count: Optional[int] = 1

@router.post("", response_model=dict)
def submit_transaction(payload: TransactionCreateSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    merchant = db.query(Merchant).filter(Merchant.id == payload.merchant_id).first()
    if not merchant:
        raise HTTPException(status_code=404, detail="Merchant not found")

    user_dict = {"average_transaction": user.average_transaction, "usual_location": user.usual_location}
    merchant_dict = {"account_age_days": merchant.account_age_days, "risk_category": merchant.risk_category}
    tx_dict = {"amount": payload.amount, "is_new_device": payload.is_new_device, "location": payload.location}

    # Run Detection & Risk Scoring Engine
    scoring = calculate_risk(
        tx_dict, user_dict, merchant_dict, recent_transaction_count=payload.recent_velocity_count
    )

    tx_id = f"TX_{uuid.uuid4().hex[:8].upper()}"
    tx_code = f"TX{uuid.uuid4().hex[:6].upper()}"

    new_tx = Transaction(
        id=tx_id,
        tx_code=tx_code,
        user_id=user.id,
        merchant_id=merchant.id,
        amount=payload.amount,
        currency=payload.currency,
        device_id=payload.device_id,
        is_new_device=payload.is_new_device,
        location=payload.location,
        ip_address=payload.ip_address,
        timestamp=datetime.datetime.utcnow(),
        status="FLAGGED" if scoring["risk_score"] > 30 else "APPROVED",
        risk_score=scoring["risk_score"],
        risk_level=scoring["risk_level"],
        risk_factors=scoring["risk_factors"]
    )
    db.add(new_tx)
    db.commit()
    db.refresh(new_tx)

    return {
        "id": new_tx.id,
        "tx_code": new_tx.tx_code,
        "amount": new_tx.amount,
        "status": new_tx.status,
        "risk_score": new_tx.risk_score,
        "risk_level": new_tx.risk_level,
        "risk_factors": new_tx.risk_factors,
        "created_at": new_tx.timestamp.isoformat()
    }


@router.get("/stats", response_model=dict)
def get_transaction_stats(db: Session = Depends(get_db)):
    """Aggregate statistics over all transactions in the database."""
    total = db.query(func.count(Transaction.id)).scalar() or 0

    # Status breakdown
    status_rows = (
        db.query(Transaction.status, func.count(Transaction.id))
        .group_by(Transaction.status)
        .all()
    )
    status_breakdown = {s: c for s, c in status_rows}

    # Risk level breakdown
    risk_rows = (
        db.query(Transaction.risk_level, func.count(Transaction.id))
        .group_by(Transaction.risk_level)
        .all()
    )
    risk_breakdown = {(r or "UNKNOWN"): c for r, c in risk_rows}

    # Fraud counts (status=FLAGGED as proxy)
    flagged_count = status_breakdown.get("FLAGGED", 0)
    approved_count = status_breakdown.get("APPROVED", 0)

    # Total & average amounts
    total_amount = db.query(func.sum(Transaction.amount)).scalar() or 0.0
    avg_amount = db.query(func.avg(Transaction.amount)).scalar() or 0.0
    max_amount = db.query(func.max(Transaction.amount)).scalar() or 0.0

    # Average risk score
    avg_risk = db.query(func.avg(Transaction.risk_score)).scalar() or 0.0

    return {
        "total_transactions": total,
        "flagged_count": flagged_count,
        "approved_count": approved_count,
        "status_breakdown": status_breakdown,
        "risk_level_breakdown": risk_breakdown,
        "total_amount": round(float(total_amount), 2),
        "average_amount": round(float(avg_amount), 2),
        "max_amount": round(float(max_amount), 2),
        "average_risk_score": round(float(avg_risk), 1),
        "fraud_rate_pct": round((flagged_count / total * 100) if total else 0, 2),
    }



@router.get("", response_model=List[dict])
def list_transactions(
    status: Optional[str] = None,
    limit: int = Query(50, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Transaction)
    if status:
        query = query.filter(Transaction.status == status.upper())
    
    txs = query.order_by(Transaction.timestamp.desc()).limit(limit).all()
    
    result = []
    for t in txs:
        u = db.query(User).filter(User.id == t.user_id).first()
        m = db.query(Merchant).filter(Merchant.id == t.merchant_id).first()
        result.append({
            "id": t.id,
            "tx_code": t.tx_code,
            "user_name": u.name if u else t.user_id,
            "user_id": t.user_id,
            "merchant_name": m.name if m else t.merchant_id,
            "merchant_id": t.merchant_id,
            "amount": t.amount,
            "currency": t.currency,
            "location": t.location,
            "is_new_device": t.is_new_device,
            "status": t.status,
            "risk_score": t.risk_score,
            "risk_level": t.risk_level,
            "risk_factors": t.risk_factors or [],
            "timestamp": t.timestamp.isoformat() if t.timestamp else ""
        })
    return result


@router.get("/{tx_id}", response_model=dict)
def get_transaction_detail(tx_id: str, db: Session = Depends(get_db)):
    t = db.query(Transaction).filter((Transaction.id == tx_id) | (Transaction.tx_code == tx_id)).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")

    u = db.query(User).filter(User.id == t.user_id).first()
    m = db.query(Merchant).filter(Merchant.id == t.merchant_id).first()
    inv = db.query(Investigation).filter(Investigation.transaction_id == t.id).first()

    return {
        "id": t.id,
        "tx_code": t.tx_code,
        "user": {
            "id": u.id if u else t.user_id,
            "name": u.name if u else "Unknown User",
            "email": u.email if u else "",
            "average_transaction": u.average_transaction if u else 1000.0,
            "usual_location": u.usual_location if u else "Unknown",
            "trust_score": u.trust_score if u else 80
        },
        "merchant": {
            "id": m.id if m else t.merchant_id,
            "name": m.name if m else "Unknown Merchant",
            "account_age_days": m.account_age_days if m else 365,
            "risk_category": m.risk_category if m else "LOW"
        },
        "amount": t.amount,
        "currency": t.currency,
        "device_id": t.device_id,
        "is_new_device": t.is_new_device,
        "location": t.location,
        "ip_address": t.ip_address,
        "timestamp": t.timestamp.isoformat() if t.timestamp else "",
        "status": t.status,
        "risk_score": t.risk_score,
        "risk_level": t.risk_level,
        "risk_factors": t.risk_factors or [],
        "investigation": {
            "id": inv.id,
            "findings": inv.findings,
            "retrieved_policies": inv.retrieved_policies,
            "explanation": inv.explanation,
            "recommendation": inv.recommendation
        } if inv else None
    }


@router.post("/{tx_id}/investigate", response_model=dict)
def run_transaction_investigation(tx_id: str, db: Session = Depends(get_db)):
    t = db.query(Transaction).filter((Transaction.id == tx_id) | (Transaction.tx_code == tx_id)).first()
    if not t:
        raise HTTPException(status_code=404, detail="Transaction not found")

    u = db.query(User).filter(User.id == t.user_id).first()
    m = db.query(Merchant).filter(Merchant.id == t.merchant_id).first()

    user_dict = {"average_transaction": u.average_transaction if u else 1000.0, "usual_location": u.usual_location if u else ""}
    merchant_dict = {"account_age_days": m.account_age_days if m else 365, "risk_category": m.risk_category if m else "LOW"}
    tx_dict = {"amount": t.amount, "is_new_device": t.is_new_device, "location": t.location}

    # Recalculate or retrieve scoring
    scoring = calculate_risk(tx_dict, user_dict, merchant_dict, recent_transaction_count=12 if t.amount > 100000 else 1)

    # Run Investigation Agent
    inv_data = run_investigation(t, scoring, db)

    # Check if investigation record exists
    inv = db.query(Investigation).filter(Investigation.transaction_id == t.id).first()
    if not inv:
        inv = Investigation(
            id=f"INV_{uuid.uuid4().hex[:8].upper()}",
            transaction_id=t.id,
            rule_score=inv_data["rule_score"],
            anomaly_score=inv_data["anomaly_score"],
            risk_score=t.risk_score or inv_data["risk_score"],
            risk_level=t.risk_level or inv_data["risk_level"],
            findings=inv_data["findings"],
            retrieved_policies=inv_data["retrieved_policies"],
            explanation=inv_data["explanation"],
            recommendation=inv_data["recommendation"]
        )
        db.add(inv)
    else:
        inv.findings = inv_data["findings"]
        inv.retrieved_policies = inv_data["retrieved_policies"]
        inv.explanation = inv_data["explanation"]
        inv.recommendation = inv_data["recommendation"]

    db.commit()
    db.refresh(inv)

    return {
        "investigation_id": inv.id,
        "transaction_id": t.id,
        "risk_score": inv.risk_score,
        "risk_level": inv.risk_level,
        "findings": inv.findings,
        "retrieved_policies": inv.retrieved_policies,
        "explanation": inv.explanation,
        "recommendation": inv.recommendation
    }
