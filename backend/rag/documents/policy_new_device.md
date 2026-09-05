# Policy: New Device Anomaly & Account Takeover (ATO)

Transactions originating from a device hardware ID or browser fingerprint not previously associated with the user account carry heightened risk of Account Takeover.

## Directive:
1. For low-value transactions on new devices, issue 2FA verification.
2. For high-value transactions (> ₹50,000) conducted on a new unverified device, automatic instant approval is prohibited.
3. If accompanied by high transaction velocity or new merchant activity within 15 minutes of device registration, enforce **HOLD FOR REVIEW** or **REQUEST VERIFICATION**.
