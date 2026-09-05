from .rules import run_all_rules
from .anomaly import calculate_anomaly_score

def calculate_risk(transaction: dict, user: dict, merchant: dict, recent_transaction_count: int) -> dict:
    rule_score, triggered_factors = run_all_rules(
        transaction, user, merchant, recent_transaction_count
    )
    anom_score = calculate_anomaly_score(transaction, user)

    # Weighted risk scoring: 60% rule score + 40% anomaly score
    final_score = int(round(rule_score * 0.60 + anom_score * 0.40))
    final_score = min(final_score, 100)

    if final_score <= 30:
        level = "LOW"
    elif final_score <= 60:
        level = "MEDIUM"
    elif final_score <= 85:
        level = "HIGH"
    else:
        level = "CRITICAL"

    return {
        "rule_score": rule_score,
        "anomaly_score": anom_score,
        "risk_score": final_score,
        "risk_level": level,
        "risk_factors": triggered_factors,
    }
