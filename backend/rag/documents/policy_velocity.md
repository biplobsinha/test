# Policy: Transaction Velocity & Rapid Fires

A rapid cluster of transactions (more than 10 transactions within a 2-minute rolling window) is a strong indicator of card testing, bot automation, or aggressive account draining.

## Directive:
1. When transaction velocity exceeds 10 transactions in 2 minutes, temporarily block automated authorizations for the payment method.
2. High velocity combined with high transaction amounts triggers critical severity.
3. Recommended Action: **HOLD** or **ESCALATE** for immediate manual analyst intervention and card freeze.
