def rule_large_transaction(transaction: dict, user: dict):
    """Rule 1: amount > 5x user's average transaction"""
    avg = user.get("average_transaction", 1000)
    threshold = avg * 5
    triggered = transaction["amount"] > threshold
    return triggered, 25, "Unusual amount"


def rule_velocity(recent_transaction_count: int, limit: int = 10):
    """Rule 2: more than 10 transactions in 2 minutes"""
    triggered = recent_transaction_count > limit
    return triggered, 20, "High velocity"


def rule_new_device(transaction: dict, is_high_value: bool):
    """Rule 3: high-value transaction AND new device"""
    triggered = bool(transaction.get("is_new_device")) and is_high_value
    return triggered, 20, "New device"


def rule_new_merchant(merchant: dict, transaction: dict, high_value_threshold: float = 50000.0):
    """Rule 4: merchant < 30 days old AND transaction amount > 50,000"""
    account_age = merchant.get("account_age_days", 365)
    triggered = account_age < 30 and transaction["amount"] > high_value_threshold
    return triggered, 20, "Merchant risk"


def rule_location_anomaly(transaction: dict, user: dict):
    """Rule 5: transaction location differs from user's usual location
    
    WARNING: This rule uses exact string matching and may produce false positives.
    Known issues:
    - Triggers for same city with different IP addresses
    - Doesn't account for VPN usage or mobile network changes
    - Doesn't use geographic distance calculation
    
    TODO: Implement haversine distance calculation for true geographic anomaly detection
    Recommended threshold: >50km from usual location
    """
    usual = user.get("usual_location", "")
    current = transaction.get("location", "")
    triggered = current.strip().lower() != usual.strip().lower()
    return triggered, 15, "Location anomaly"


def run_all_rules(transaction: dict, user: dict, merchant: dict, recent_transaction_count: int):
    avg = user.get("average_transaction", 1000)
    is_high_value = transaction["amount"] > (avg * 3)

    checks = [
        rule_large_transaction(transaction, user),
        rule_velocity(recent_transaction_count),
        rule_new_device(transaction, is_high_value),
        rule_new_merchant(merchant, transaction),
        rule_location_anomaly(transaction, user),
    ]

    triggered_factors = [label for (triggered, weight, label) in checks if triggered]
    rule_score = sum(weight for (triggered, weight, label) in checks if triggered)
    rule_score = min(rule_score, 100)  # cap at 100

    return rule_score, triggered_factors
