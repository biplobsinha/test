# RiskForge Dashboard & Risk Scoring System — Complete Explanation

**Document Version:** 1.0  
**Date:** 2026-09-05  
**Purpose:** Complete explanation of dashboard components, risk factors, scoring parameters, and system behavior

---

## Table of Contents

1. [Dashboard Overview](#dashboard-overview)
2. [Risk Scoring Engine](#risk-scoring-engine)
3. [Risk Factors Explained](#risk-factors-explained)
4. [Scoring Parameters](#scoring-parameters)
5. [Dashboard Components](#dashboard-components)
6. [Unnecessary Elements to Remove](#unnecessary-elements-to-remove)

---

## Dashboard Overview

The RiskForge dashboard is a **real-time fraud detection workstation** for transaction analysts. It provides:

- **Transaction Queue** (left panel): List of flagged transactions requiring review
- **Risk Analysis** (right panel): Detailed forensic view of selected transaction
- **AI Investigation** (bottom): Automated reasoning and recommendations from AI agent
- **Analyst Actions** (bottom): Approve/Hold/Block controls with rationale tracking

### Dashboard Flow

```
1. Login → Landing Page → Dashboard
2. Analyst selects transaction from queue (left)
3. System displays:
   - Risk Score (0-100) with visual gauge
   - Triggered Risk Factors (which rules fired)
   - Transaction Metadata (amount, location, device, etc.)
4. Analyst clicks "Run AI Investigation"
   - Agent analyzes transaction using RAG (policy docs)
   - Agent provides reasoning and recommendation
5. Analyst makes final decision (Approve/Hold/Block)
   - Decision logged to audit trail
   - Transaction status updated
```

---

## Risk Scoring Engine

### Scoring Formula

```
FINAL_RISK_SCORE = (rule_score × 0.60) + (anomaly_score × 0.40)

Where:
  rule_score     = Sum of triggered rule weights (0-100, capped)
  anomaly_score  = Statistical deviation score (0-100)
```

### Risk Levels

| Score Range | Risk Level | Color | Typical Action |
|-------------|-----------|-------|----------------|
| 0-30 | **LOW** | Green | Auto-approve, monitor only |
| 31-60 | **MEDIUM** | Yellow | Review queue, may require step-up auth |
| 61-85 | **HIGH** | Orange | Manual review required |
| 86-100 | **CRITICAL** | Red | Immediate hold, investigation required |

### Two-Component System

#### 1. Rule-Based Score (60% weight)

Deterministic rules that check specific conditions:
- Large transaction (>5x user average)
- High velocity (>10 transactions in 2 minutes)
- New device + high value
- New merchant (<30 days) + high value
- Location anomaly (differs from user's usual location)

Each triggered rule adds **weight points** to the score.

#### 2. Anomaly Score (40% weight)

Statistical deviation from user's historical baseline:
- Compares transaction amount to user's average
- Pure statistical analysis (no ML model currently)
- Returns 0-100 based on deviation ratio

---

## Risk Factors Explained

### Currently Implemented Risk Factors

#### 1. **Unusual Amount** (+25 points)

**What it detects:** Transaction exceeds 5x user's average transaction amount

**Why it matters:** Large, unusual amounts may indicate account takeover or fraud

**Example:**
- User's average transaction: ₹1,000
- Current transaction: ₹6,000
- Trigger: 6000 / 1000 = 6.0x (exceeds 5x threshold)
- Weight: +25 points

**Backend Logic:**
```python
avg = user.get("average_transaction", 1000)
threshold = avg * 5
triggered = transaction["amount"] > threshold
```

**Legitimate scenarios (false positives):**
- Car down payment
- Tuition payment
- Emergency medical expense
- Rent deposit

---

#### 2. **High Velocity** (+20 points)

**What it detects:** More than 10 transactions in 2-minute window

**Why it matters:** Rapid-fire transactions suggest bot activity or testing stolen cards

**Example:**
- User makes 12 transactions in 2 minutes
- Trigger: 12 > 10 threshold
- Weight: +20 points

**Backend Logic:**
```python
recent_transaction_count = count_transactions_in_last_2_minutes()
triggered = recent_transaction_count > 10
```

**Legitimate scenarios (false positives):**
- Bill payment day (multiple utility bills)
- Online shopping spree
- Business account with high volume

---

#### 3. **New Device** (+20 points)

**What it detects:** High-value transaction (>3x average) on unrecognized device

**Why it matters:** Account takeover attackers use their own devices

**Example:**
- User's usual devices: iPhone 12, MacBook Pro
- Current device: Samsung Galaxy S21 (never seen before)
- Transaction: ₹50,000 (>3x average of ₹10,000)
- Trigger: New device AND high value
- Weight: +20 points

**Backend Logic:**
```python
is_high_value = transaction["amount"] > (user_avg * 3)
triggered = transaction.get("is_new_device") and is_high_value
```

**Legitimate scenarios (false positives):**
- New phone purchase
- Using friend's phone in emergency
- Device factory reset (changes fingerprint)

---

#### 4. **Merchant Risk** (+20 points)

**What it detects:** Transaction to merchant <30 days old with amount >₹50,000

**Why it matters:** Newly created merchant accounts may be fraud fronts

**Example:**
- Merchant account created: 15 days ago
- Transaction amount: ₹75,000
- Trigger: 15 < 30 days AND 75000 > 50000
- Weight: +20 points

**Backend Logic:**
```python
account_age = merchant.get("account_age_days", 365)
triggered = (account_age < 30) and (transaction["amount"] > 50000)
```

**Legitimate scenarios (false positives):**
- Legitimate new business startup
- Seasonal merchant (festival stall)

---

#### 5. **Location Anomaly** (+15 points)

**What it detects:** Transaction location differs from user's usual location

**Why it matters:** Transactions from unusual locations may indicate account takeover

**Example:**
- User's usual location: "Mumbai"
- Current transaction location: "Singapore"
- Trigger: "Singapore" ≠ "Mumbai"
- Weight: +15 points

**Backend Logic:**
```python
usual = user.get("usual_location", "")
current = transaction.get("location", "")
triggered = current.strip().lower() != usual.strip().lower()
```

**Legitimate scenarios (false positives):**
- Business travel
- Vacation spending
- VPN usage
- IP geolocation inaccuracy

---

#### 6. **System Flagged** (+25 points)

**What it detects:** Generic catch-all for other system-level risk signals

**Why it matters:** Placeholder for future rules or external system integrations

**Current Status:** NOT IMPLEMENTED in backend code (exists only in UI metadata)

**Note:** This factor appears in `RiskFactors.jsx` but has no corresponding backend rule. Should be removed or implemented.

---

### Anomaly Scoring Logic

The anomaly score provides a **statistical deviation metric** independent of rule-based detection.

**Algorithm:**
```python
deviation_ratio = transaction_amount / user_average_amount

if deviation_ratio <= 1.5:    # Within 1.5x average
    return 0                   # No anomaly

elif deviation_ratio <= 3.0:  # 1.5x - 3x average
    return 30                  # Minor anomaly

elif deviation_ratio <= 5.0:  # 3x - 5x average
    return 60                  # Moderate anomaly

else:                          # >5x average
    return 100                 # Severe anomaly
```

**Example Calculation:**

```
User's average transaction: ₹10,000
Current transaction: ₹45,000

deviation_ratio = 45000 / 10000 = 4.5

Since 3.0 < 4.5 <= 5.0:
  anomaly_score = 60
```

---

## Scoring Parameters

### Current Parameter Values

| Parameter | Value | Adjustable? | Purpose |
|-----------|-------|-------------|---------|
| **Rule Weight: Large Transaction** | +25 | Yes | Points added when amount >5x average |
| **Rule Weight: High Velocity** | +20 | Yes | Points added when >10 txns in 2 min |
| **Rule Weight: New Device** | +20 | Yes | Points added for new device + high value |
| **Rule Weight: Merchant Risk** | +20 | Yes | Points added for new merchant + high amount |
| **Rule Weight: Location Anomaly** | +15 | Yes | Points added for unusual location |
| **Large Transaction Multiplier** | 5.0x | Yes | Threshold for "unusual amount" |
| **High Velocity Threshold** | 10 txns | Yes | Max transactions in 2-minute window |
| **New Device Value Threshold** | 3.0x | Yes | Amount must exceed 3x average to trigger |
| **Merchant Age Threshold** | 30 days | Yes | Merchant must be <30 days old |
| **Merchant Risk Amount** | ₹50,000 | Yes | Minimum amount for merchant risk |
| **Anomaly Deviation Tiers** | 1.5x, 3.0x, 5.0x | Yes | Thresholds for anomaly scoring |
| **Rule Score Weight** | 60% | Yes | Contribution of rule-based scoring |
| **Anomaly Score Weight** | 40% | Yes | Contribution of statistical scoring |

### Parameter Tuning Recommendations

**High Priority (Should be configurable):**

1. **Large Transaction Multiplier (5.0x)**
   - Current: 5x user average
   - Issue: Too sensitive for high-net-worth users, too lenient for low-value users
   - Solution: Should vary by customer tier (2x for new users, 10x for VIP)

2. **High Velocity Threshold (10 txns)**
   - Current: 10 transactions in 2 minutes
   - Issue: Doesn't account for customer type (consumer vs. business)
   - Solution: Should vary by account type (5 for consumer, 50 for business)

3. **Location Detection Logic**
   - Current: Exact string match (case-insensitive)
   - Issue: Too strict—different IP in same city triggers false positive
   - Solution: Should use geographic distance (trigger only if >50km from usual)

**Medium Priority (Could be improved):**

4. **Anomaly Scoring Tiers**
   - Current: Fixed thresholds (1.5x, 3x, 5x)
   - Issue: Not personalized to customer behavior patterns
   - Solution: Should use standard deviation (z-score) instead of fixed ratios

5. **New Device Definition**
   - Current: Boolean flag `is_new_device` (no aging logic)
   - Issue: Doesn't distinguish between "never seen" vs. "seen once"
   - Solution: Should have trust-building period (7 days = new, 30 days = trusted)

---

## Dashboard Components

### 1. Navbar (Top Bar)

**Purpose:** Navigation and quick access to audit log

**Elements:**
- Logo + "RiskForge" branding
- Transaction count badge
- "View Audit Log" button

**Status:** ✅ Essential, keep as-is

---

### 2. MetricsHeader (KPI Ribbon)

**Purpose:** Real-time system health metrics

**Displays:**
- Total transactions processed
- Fraud caught (blocked transactions)
- False positives (approved high-risk transactions)
- Detection rate percentage

**Status:** ✅ Essential, keep as-is

---

### 3. TransactionList (Left Panel)

**Purpose:** Queue of transactions requiring review

**Elements:**
- Filter tabs: ALL | PENDING | HIGH RISK | CRITICAL
- Transaction cards showing:
  - Transaction code (TXN-XXXX)
  - Amount
  - Risk level badge
  - Timestamp

**Status:** ✅ Essential, keep as-is

---

### 4. Transaction Metadata Card (Left Panel, Below List)

**Purpose:** Displays entity-level details for selected transaction

**Displays:**
- **Amount:** ₹X,XXX.XX (large, blue highlighted)
- **Origin Account:** User ID
- **Destination:** Merchant ID
- **Hardware Trust:** Device status (Recognized vs. Unverified/New)
- **Location:** City/country
- **IP Routing:** IP address
- **Timestamp:** Transaction date/time

**Issues Found:**
- ❌ "Hardware Trust" label too technical
- ❌ "IP Routing" label confusing (not about routing)
- ❌ IP address shown but rarely useful for analysts

**Recommendations:**
- Rename "Hardware Trust" → "Device Status"
- Rename "IP Routing" → "IP Address"
- Consider removing IP address (low value, privacy concern)

---

### 5. RiskGauge (Right Panel, Top Left)

**Purpose:** Visual representation of risk score

**Elements:**
- Circular gauge showing 0-100 score
- Color-coded arc (green → yellow → orange → red)
- Risk level text (LOW, MEDIUM, HIGH, CRITICAL)
- Numeric score display

**Status:** ✅ Essential, highly effective visualization

---

### 6. RiskFactors (Right Panel, Top Right)

**Purpose:** Shows which rules triggered for this transaction

**Displays:**
- List of triggered risk factors
- Icon for each factor type
- Weight contribution (+XX points)
- Description text for each factor

**Issues Found:**
- ❌ "System flagged" factor exists in UI but NOT in backend
- ❌ Factor descriptions too technical ("Rule threshold violation flagged by system")

**Recommendations:**
- **Remove "System flagged" factor** (not implemented)
- Simplify descriptions for non-technical analysts

---

### 7. AgentFindings (Right Panel, Middle)

**Purpose:** AI agent investigation results

**Elements:**
- "Run AI Investigation" button
- Agent reasoning text (RAG-enhanced analysis)
- Policy citations from documents
- Structured findings

**Status:** ✅ Essential, core feature

---

### 8. RecommendationPanel (Right Panel, Bottom)

**Purpose:** Final analyst decision controls

**Elements:**
- AI recommendation badge (APPROVE, HOLD, ESCALATE)
- Action buttons: Approve | Hold | Block
- Rationale text input
- Submit button

**Status:** ✅ Essential, keep as-is

---

### 9. AuditLogModal (Overlay)

**Purpose:** Historical decision audit trail

**Displays:**
- All past analyst decisions
- Transaction details for each decision
- Analyst rationale
- Timestamps

**Status:** ✅ Essential for compliance

---

## Unnecessary Elements to Remove

### Critical Issues (Must Fix)

#### 1. **"System Flagged" Risk Factor** ❌

**Location:** `frontend/src/components/RiskFactors.jsx`

**Issue:** 
- Defined in UI metadata but NOT implemented in backend
- Adds +25 points weight but can never actually trigger
- Creates confusion for analysts

**Action Required:**
```javascript
// REMOVE this entry from factorMeta object:
'System flagged': { 
  weight: 25, 
  desc: 'Rule threshold violation flagged by system', 
  icon: Flag 
}
```

**Rationale:** Ghost feature—never triggers, misleads users

---

#### 2. **Location Anomaly Detection Logic** ⚠️

**Location:** `backend/risk_engine/rules.py` → `rule_location_anomaly()`

**Issue:**
- Uses exact string matching (case-insensitive)
- Triggers false positives for same city, different IP
- Ignores VPN usage, mobile network IP changes

**Current Code:**
```python
triggered = current.strip().lower() != usual.strip().lower()
```

**Problem Example:**
- User's usual location: "Mumbai"
- Current transaction location: "mumbai" (lowercase)
- Result: False positive (should not trigger)

**Action Required:**
```python
# REPLACE with geographic distance calculation
# OR temporarily disable this rule until proper implementation
# OR add comment explaining limitation
```

**Rationale:** Too many false positives, needs geographic distance logic

---

### Medium Priority (Should Improve)

#### 3. **IP Address Display**

**Location:** `frontend/src/App.jsx` → Transaction Metadata Card

**Issue:**
- Shown to analysts but rarely actionable
- Privacy concern (PII exposure)
- Takes up screen space

**Current Display:**
```jsx
<div>
  <Globe size={13} /> IP Routing
  <span>{txDetail.ip_address || '127.0.0.1'}</span>
</div>
```

**Recommendation:**
- Keep IP in database for audit trail
- Remove from analyst UI (or hide behind "Show Details" toggle)

---

#### 4. **Technical Label Names**

**Location:** `frontend/src/App.jsx` → Transaction Metadata Card

**Issues:**
- "Hardware Trust" → Too technical
- "IP Routing" → Misleading (not about routing)
- "Origin Account" → Could be simpler

**Recommendations:**
- "Hardware Trust" → "Device Status"
- "IP Routing" → "IP Address"
- "Origin Account" → "Sender"

---

#### 5. **Risk Factor Descriptions**

**Location:** `frontend/src/components/RiskFactors.jsx`

**Issue:** Descriptions too technical for non-technical analysts

**Current Examples:**
- "Transaction exceeds 5x user baseline volume" → Too technical
- "High frequency transaction burst detected" → Jargon
- "Rule threshold violation flagged by system" → Meaningless

**Recommendations:**
- "Transaction exceeds 5x user baseline volume" → "Much larger than usual"
- "High frequency transaction burst detected" → "Many transactions in short time"
- "Geographic location mismatch with user origin" → "Unusual location"

---

### Low Priority (Optional Cleanup)

#### 6. **Unused Imports**

**Location:** `frontend/src/App.jsx`

**Issue:** Some Lucide icons imported but not used directly in App.jsx

**Current:**
```javascript
import { 
  CreditCard, User, Building2, Smartphone, MapPin, 
  Globe, Clock, ShieldCheck, AlertTriangle 
} from 'lucide-react';
```

**Note:** `ShieldCheck` and `AlertTriangle` not used in this component (used in child components)

**Action:** Minor cleanup, low priority

---

#### 7. **Hardcoded Default Values**

**Location:** Multiple files

**Examples:**
- Default IP: `127.0.0.1` (localhost)
- Default merchant age: `365 days`
- Default user average: `₹1,000`

**Issue:** 
- Hardcoded values make testing difficult
- Should be environment variables or config file

**Recommendation:** 
- Move to `backend/.env` or `config.json`
- Allows easy tuning without code changes

---

## Summary of Changes Needed

### Immediate Actions (Critical)

1. ✅ **Remove "System Flagged" risk factor** from `RiskFactors.jsx`
2. ⚠️ **Fix or disable Location Anomaly rule** in `rules.py`

### High Priority (Should Do Soon)

3. 🔄 **Simplify risk factor descriptions** for analysts
4. 🔄 **Rename technical labels** in metadata card
5. 🔄 **Make parameters configurable** (move to config file)

### Medium Priority (Nice to Have)

6. 🔄 **Hide IP address** from analyst UI (privacy)
7. 🔄 **Improve location detection** with geographic distance
8. 🔄 **Add customer tier logic** for thresholds

### Low Priority (Cleanup)

9. 🧹 **Remove unused imports**
10. 🧹 **Add comments** explaining parameter choices

---

## Recommendations for Next Steps

### Phase 1: Fix Critical Issues (1-2 hours)

1. Remove "System flagged" factor
2. Add warning comment to location anomaly rule
3. Simplify UI labels and descriptions

### Phase 2: Parameter Configuration (2-3 hours)

4. Create `backend/config.json` with all thresholds
5. Update backend code to read from config
6. Add admin UI for parameter tuning (future)

### Phase 3: Enhanced Detection (1-2 days)

7. Implement geographic distance for location anomaly
8. Add customer tier logic (VIP, regular, new)
9. Improve device trust scoring with time-based decay

### Phase 4: Analytics & Tuning (Ongoing)

10. Track false positive rate by rule
11. A/B test parameter values
12. Add feedback loop for analyst decisions

---

**End of Document**
