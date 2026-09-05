import uuid
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import get_db
from models import Transaction, Decision

router = APIRouter(prefix="/api/v1/decisions", tags=["Decisions"])

class DecisionCreateSchema(BaseModel):
    transaction_id: str
    action: str  # APPROVE, REQUEST_VERIFICATION, HOLD, ESCALATE
    rationale: Optional[str] = "Analyst reviewed investigation evidence and confirmed action."
    analyst_name: Optional[str] = "Risk Analyst (AI-Assisted)"

@router.post("", response_model=dict)
def create_decision(payload: DecisionCreateSchema, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter((Transaction.id == payload.transaction_id) | (Transaction.tx_code == payload.transaction_id)).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    action_upper = payload.action.upper()
    if action_upper not in ["APPROVE", "REQUEST_VERIFICATION", "HOLD", "ESCALATE"]:
        raise HTTPException(status_code=400, detail="Invalid action. Must be APPROVE, REQUEST_VERIFICATION, HOLD, or ESCALATE")

    # Update Transaction Status
    if action_upper == "APPROVE":
        tx.status = "APPROVED"
    elif action_upper == "HOLD":
        tx.status = "HELD"
    elif action_upper == "ESCALATE":
        tx.status = "ESCALATED"
    elif action_upper == "REQUEST_VERIFICATION":
        tx.status = "VERIFICATION_REQUESTED"

    # Create immutable audit decision record
    decision_id = f"DEC_{uuid.uuid4().hex[:8].upper()}"
    decision = Decision(
        id=decision_id,
        transaction_id=tx.id,
        analyst_action=action_upper,
        rationale=payload.rationale,
        decision_by=payload.analyst_name,
        timestamp=datetime.datetime.utcnow()
    )

    db.add(decision)
    db.commit()
    db.refresh(decision)

    return {
        "id": decision.id,
        "transaction_id": tx.id,
        "tx_code": tx.tx_code,
        "action": decision.analyst_action,
        "new_transaction_status": tx.status,
        "rationale": decision.rationale,
        "decision_by": decision.decision_by,
        "timestamp": decision.timestamp.isoformat()
    }


@router.get("", response_model=List[dict])
def list_decisions(db: Session = Depends(get_db)):
    decisions = db.query(Decision).order_by(Decision.timestamp.desc()).all()
    result = []
    for d in decisions:
        tx = db.query(Transaction).filter(Transaction.id == d.transaction_id).first()
        result.append({
            "id": d.id,
            "transaction_id": d.transaction_id,
            "tx_code": tx.tx_code if tx else d.transaction_id,
            "amount": tx.amount if tx else 0.0,
            "risk_score": tx.risk_score if tx else 0,
            "action": d.analyst_action,
            "rationale": d.rationale,
            "decision_by": d.decision_by,
            "timestamp": d.timestamp.isoformat()
        })
    return result


@router.get("/{tx_id}", response_model=List[dict])
def get_decisions_for_transaction(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter((Transaction.id == tx_id) | (Transaction.tx_code == tx_id)).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    decisions = db.query(Decision).filter(Decision.transaction_id == tx.id).order_by(Decision.timestamp.desc()).all()
    return [
        {
            "id": d.id,
            "transaction_id": d.transaction_id,
            "tx_code": tx.tx_code,
            "action": d.analyst_action,
            "rationale": d.rationale,
            "decision_by": d.decision_by,
            "timestamp": d.timestamp.isoformat()
        }
        for d in decisions
    ]
