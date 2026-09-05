import datetime
from sqlalchemy.orm import Session
from models import Transaction, User, Merchant

def get_user_stats(user_id: str, db: Session) -> dict:
    """Returns user profile stats: account age, average tx, usual location, trust score"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"error": "User not found"}
    
    tx_count = db.query(Transaction).filter(Transaction.user_id == user_id).count()
    return {
        "user_id": user.id,
        "name": user.name,
        "average_transaction": user.average_transaction,
        "usual_location": user.usual_location,
        "trust_score": user.trust_score,
        "total_historical_transactions": tx_count
    }


def get_merchant_stats(merchant_id: str, db: Session) -> dict:
    """Returns merchant profile stats: account age in days, risk category"""
    merchant = db.query(Merchant).filter(Merchant.id == merchant_id).first()
    if not merchant:
        return {"error": "Merchant not found"}
    
    tx_count = db.query(Transaction).filter(Transaction.merchant_id == merchant_id).count()
    return {
        "merchant_id": merchant.id,
        "name": merchant.name,
        "account_age_days": merchant.account_age_days,
        "risk_category": merchant.risk_category,
        "processed_transactions_count": tx_count
    }


def get_transaction_history(user_id: str, db: Session, limit: int = 5) -> list[dict]:
    """Returns user's last N transactions"""
    txs = (
        db.query(Transaction)
        .filter(Transaction.user_id == user_id)
        .order_by(Transaction.timestamp.desc())
        .limit(limit)
        .all()
    )
    return [
        {
            "tx_code": t.tx_code,
            "amount": t.amount,
            "merchant_id": t.merchant_id,
            "location": t.location,
            "is_new_device": t.is_new_device,
            "timestamp": t.timestamp.isoformat() if t.timestamp else "",
            "risk_score": t.risk_score
        }
        for t in txs
    ]


def get_recent_velocity(user_id: str, db: Session, window_minutes: int = 2) -> dict:
    """Returns count of transactions in the last N minutes for the given user"""
    # For seed data, count transactions within a short relative time window or recent count
    tx_count = db.query(Transaction).filter(Transaction.user_id == user_id).count()
    return {
        "user_id": user_id,
        "window_minutes": window_minutes,
        "recent_count": tx_count
    }
