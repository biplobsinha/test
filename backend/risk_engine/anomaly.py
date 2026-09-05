def calculate_anomaly_score(transaction: dict, user: dict) -> int:
    """
    Returns 0-100 based on how far the transaction amount deviates
    from the user's typical behavior. Pure statistics, no trained model.
    """
    avg = user.get("average_transaction", 1000.0)
    if avg == 0 or avg is None:
        return 50  # no history to compare against — moderate default

    deviation_ratio = transaction["amount"] / avg

    if deviation_ratio <= 1.5:
        return 0
    elif deviation_ratio <= 3.0:
        return 30
    elif deviation_ratio <= 5.0:
        return 60
    else:
        return 100
