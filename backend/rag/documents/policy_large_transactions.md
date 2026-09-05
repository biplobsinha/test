# Policy: Unusually Large Transactions

When a transaction amount exceeds 5x the user's average historical transaction value (or 3x for high-value baseline thresholds), it represents a high-impact financial risk signal.

## Directive:
1. High-value transactions alone should be checked against user account verification status and average monthly volume.
2. When combined with a new device or velocity spike, the recommended action is **HOLD FOR REVIEW**.
3. If three or more concurrent signals are present (e.g., Large Amount + New Device + Location Anomaly), escalate immediately to fraud operations.
