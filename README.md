# 🛡️ RiskForge — AI-Powered Transaction Fraud Detection System

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React 18](https://img.shields.io/badge/react-18.2-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)

**RiskForge** is a real-time fraud detection and investigation system that combines **rule-based risk scoring**, **anomaly detection**, and **AI-powered investigation** to protect financial transactions. Built for the **Razorpay AI Buildathon**.

---

## 📋 Table of Contents

- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Risk Scoring System](#risk-scoring-system)
- [API Documentation](#api-documentation)
- [Dataset](#dataset)
- [Configuration](#configuration)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### 🎯 Core Capabilities

- **Real-Time Risk Scoring** — Evaluates transactions in milliseconds using 5 deterministic rules
- **AI Investigation Agent** — RAG-enhanced reasoning with policy citations and explainable recommendations
- **Anomaly Detection** — Statistical deviation analysis from user behavior baselines
- **Audit Trail** — Complete decision history with analyst rationale tracking
- **Interactive Dashboard** — Analyst workstation with risk visualization and workflow management

### 🔍 Risk Detection Rules

1. **Unusual Amount** (+25 pts) — Transaction >5x user's average
2. **High Velocity** (+20 pts) — >10 transactions in 2-minute window
3. **New Device** (+20 pts) — High-value transaction from unrecognized device
4. **Merchant Risk** (+20 pts) — New merchant (<30 days) + large amount
5. **Location Anomaly** (+15 pts) — Transaction from unusual geographic location

### 🤖 AI Agent Features

- **Contextual Investigation** — Synthesizes user stats, merchant data, and transaction history
- **RAG Policy Retrieval** — Cites relevant compliance policies from knowledge base
- **Explainable Recommendations** — Provides reasoning for APPROVE/HOLD/ESCALATE decisions
- **Evidence Documentation** — Structured findings with quantitative metrics

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React + Vite)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Login Page  │→ │ Landing Page │→ │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                                    │                   │
│         └────────────── API Calls ──────────┘                   │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI + SQLAlchemy)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │ Transaction  │  │  Decision    │  │ Investigation│          │
│  │   Routes     │  │   Routes     │  │   Agent      │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                  │                  │                  │
│         └──────────────────┴──────────────────┘                  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Risk Scoring Engine                          │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Rule-Based  │  │   Anomaly    │  │ RAG Retriever│   │  │
│  │  │   Scoring    │  │   Detection  │  │  (Policies)  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ↓                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           SQLite Database (SQLAlchemy ORM)                │  │
│  │  [Users] [Merchants] [Transactions] [Investigations]      │  │
│  │  [Decisions]                                               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### System Flow

```
Transaction → Risk Scoring → Dashboard Display → Analyst Review → AI Investigation → Decision → Audit Log
```

1. **Transaction Ingestion** — Transactions enter the system (via CSV seed or API)
2. **Risk Evaluation** — Combined rule-based (60%) + anomaly (40%) scoring
3. **Queue Flagging** — High-risk transactions flagged for analyst review
4. **Analyst Investigation** — Analyst triggers AI agent for detailed analysis
5. **AI Reasoning** — Agent retrieves policies, analyzes evidence, recommends action
6. **Decision Recording** — Analyst approves/holds/blocks with rationale
7. **Audit Trail** — All decisions logged for compliance and model tuning

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18.2** | UI framework |
| **Vite 5.1** | Build tool & dev server |
| **Lucide React** | Icon library (350+ icons) |
| **Framer Motion** | Animation library |
| **CSS Variables** | Theming system (brown/black palette) |

### Backend

| Technology | Purpose |
|------------|---------|
| **FastAPI 0.110+** | REST API framework |
| **SQLAlchemy 2.0** | ORM for database operations |
| **SQLite** | Embedded database |
| **Uvicorn** | ASGI server |
| **Python 3.11+** | Programming language |
| **Pydantic 2.6** | Data validation |
| **pytest 8.0** | Testing framework |

### AI & Data

| Technology | Purpose |
|------------|---------|
| **RAG (Retrieval-Augmented Generation)** | Policy document retrieval |
| **Markdown Policies** | Knowledge base for AI agent |
| **Statistical Anomaly Detection** | Z-score based outlier detection |
| **PaySim Dataset** | Synthetic fraud transaction dataset |

---

## 📁 Project Structure

```
riskforge/
├── backend/
│   ├── agent/
│   │   ├── investigation_agent.py    # AI investigation orchestrator
│   │   └── tools.py                  # Evidence gathering functions
│   ├── database/
│   │   └── (removed seed files)
│   ├── rag/
│   │   ├── documents/                # Policy knowledge base
│   │   │   ├── policy_large_transactions.md
│   │   │   ├── policy_velocity.md
│   │   │   ├── policy_new_device.md
│   │   │   ├── policy_merchant_risk.md
│   │   │   └── policy_location_anomaly.md
│   │   └── retriever.py              # Keyword-based RAG retriever
│   ├── risk_engine/
│   │   ├── rules.py                  # 5 deterministic risk rules
│   │   ├── scoring.py                # Composite risk calculation
│   │   └── anomaly.py                # Statistical deviation detection
│   ├── routes/
│   │   ├── transactions.py           # Transaction API endpoints
│   │   └── decisions.py              # Decision audit endpoints
│   ├── tests/
│   │   ├── test_api_routes.py        # API integration tests
│   │   └── test_engine.py            # Risk engine unit tests
│   ├── .env                          # Environment variables
│   ├── database.py                   # SQLAlchemy setup
│   ├── main.py                       # FastAPI app entry point
│   ├── models.py                     # Database ORM models
│   ├── requirements.txt              # Python dependencies
│   ├── riskforge.db                  # SQLite database file
│   └── seed_from_csv.py              # CSV import script
├── frontend/
│   ├── dist/                         # Production build output
│   ├── src/
│   │   ├── components/
│   │   │   ├── AgentFindings.jsx     # AI investigation results panel
│   │   │   ├── AuditLogModal.jsx     # Decision history modal
│   │   │   ├── LandingPage.jsx       # Hero/welcome page
│   │   │   ├── LoginPage.jsx         # Authentication screen
│   │   │   ├── Logo.jsx              # Brand logo component
│   │   │   ├── MetricsHeader.jsx     # KPI metrics ribbon
│   │   │   ├── Navbar.jsx            # Top navigation bar
│   │   │   ├── RecommendationPanel.jsx # Analyst action controls
│   │   │   ├── RiskFactors.jsx       # Triggered rules display
│   │   │   ├── RiskGauge.jsx         # Circular risk score gauge
│   │   │   └── TransactionList.jsx   # Transaction queue
│   │   ├── services/
│   │   │   └── api.js                # Backend API client
│   │   ├── App.jsx                   # Main app component
│   │   ├── index.css                 # Global styles + CSS variables
│   │   └── main.jsx                  # React entry point
│   ├── index.html                    # HTML template
│   ├── package.json                  # NPM dependencies
│   └── vite.config.js                # Vite configuration
├── .gitignore                        # Git ignore rules
├── CHANGES_APPLIED.md                # Recent cleanup documentation
├── DASHBOARD_AND_RISK_EXPLANATION.md # Complete system guide (23 pages)
├── README.md                         # This file
└── RISK_POLICY_AND_TRANSACTION_SCORING.md # Policy specification (23 pages)
```

---

## 🚀 Installation

### Prerequisites

- **Python 3.11+** ([Download](https://www.python.org/downloads/))
- **Node.js 18+** and npm ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))

### 1. Clone Repository

```bash
git clone https://github.com/biplobsinha/test.git
cd test
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (optional, has defaults)
echo "DATABASE_URL=sqlite:///./riskforge.db" > .env

# Seed database with sample data
python seed_from_csv.py --limit 1000

# Start backend server
python main.py
```

Backend will run at `http://localhost:8000`  
API docs at `http://localhost:8000/docs`

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run at `http://localhost:5173`

---

## 💻 Usage

### Starting the Application

#### Terminal 1 — Backend
```bash
cd backend
venv\Scripts\activate  # Windows
python main.py
```

#### Terminal 2 — Frontend
```bash
cd frontend
npm run dev
```

### Using the Dashboard

1. **Login** — Enter any email to authenticate (demo mode, no validation)
2. **Landing Page** — Click "Enter Dashboard" to access analyst workstation
3. **Transaction Queue** — Select a flagged transaction from the left panel
4. **Review Risk Details** — View risk score, triggered factors, and metadata
5. **Run AI Investigation** — Click "Run AI Investigation" to get detailed analysis
6. **Make Decision** — Approve/Hold/Block with rationale, logged to audit trail
7. **View Audit Log** — Click "View Audit Log" button in navbar

### Filtering Transactions

Use filter tabs in the transaction list:
- **ALL** — All transactions
- **PENDING** — Flagged transactions awaiting review
- **HIGH RISK** — Risk score 60-85
- **CRITICAL** — Risk score 86-100

---

## 🎯 Risk Scoring System

### Scoring Formula

```python
FINAL_RISK_SCORE = (rule_score × 0.60) + (anomaly_score × 0.40)
```

### Risk Levels

| Score Range | Level | Color | Action |
|-------------|-------|-------|--------|
| 0-30 | LOW | 🟢 Green | Auto-approve |
| 31-60 | MEDIUM | 🟡 Yellow | Review queue |
| 61-85 | HIGH | 🟠 Orange | Manual review required |
| 86-100 | CRITICAL | 🔴 Red | Immediate hold |

### Rule-Based Scoring (60% weight)

Each rule contributes weight points when triggered:

#### 1. Unusual Amount (+25 points)
```python
triggered = transaction.amount > (user.average * 5.0)
```
**Example:** User avg ₹1,000, transaction ₹6,000 → Triggers (+25)

#### 2. High Velocity (+20 points)
```python
triggered = transaction_count_in_2_minutes > 10
```
**Example:** 12 transactions in 2 minutes → Triggers (+20)

#### 3. New Device (+20 points)
```python
triggered = is_new_device AND (amount > user.average * 3.0)
```
**Example:** New device + ₹50,000 (user avg ₹10,000) → Triggers (+20)

#### 4. Merchant Risk (+20 points)
```python
triggered = merchant.age_days < 30 AND amount > 50000
```
**Example:** 15-day-old merchant + ₹75,000 → Triggers (+20)

#### 5. Location Anomaly (+15 points)
```python
triggered = transaction.location != user.usual_location
```
**Example:** User usual "Mumbai", transaction "Singapore" → Triggers (+15)

### Anomaly Scoring (40% weight)

Statistical deviation from user baseline:

```python
deviation_ratio = transaction.amount / user.average

if deviation_ratio <= 1.5:    return 0    # Within normal range
elif deviation_ratio <= 3.0:  return 30   # Minor anomaly
elif deviation_ratio <= 5.0:  return 60   # Moderate anomaly
else:                         return 100  # Severe anomaly
```

### Example Calculation

```
Transaction: ₹75,000 to new merchant from new device in Singapore
User Profile: Avg ₹10,000, usual location Mumbai

Rule Scoring:
  Unusual Amount:    ₹75,000 / ₹10,000 = 7.5x  → +25 points
  New Device:        New device + high value   → +20 points
  Merchant Risk:     15-day merchant + ₹75K   → +20 points
  Location Anomaly:  Singapore ≠ Mumbai        → +15 points
  Total Rule Score:  80 points

Anomaly Scoring:
  Deviation: 75000 / 10000 = 7.5x  → 100 points

Final Score:
  (80 × 0.60) + (100 × 0.40) = 48 + 40 = 88
  Risk Level: CRITICAL
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:8000
```

### Endpoints

#### 1. Get All Transactions
```http
GET /transactions?filter={ALL|PENDING|HIGH|CRITICAL}&limit=100
```
**Response:**
```json
[
  {
    "id": "TX_A3F2B7C1",
    "tx_code": "TXN-8821",
    "amount": 124500.00,
    "risk_score": 73,
    "risk_level": "HIGH",
    "status": "FLAGGED",
    "timestamp": "2023-01-15T14:32:11"
  }
]
```

#### 2. Get Transaction Detail
```http
GET /transactions/{transaction_id}
```
**Response:**
```json
{
  "id": "TX_A3F2B7C1",
  "tx_code": "TXN-8821",
  "amount": 124500.00,
  "user": {
    "id": "U00812",
    "name": "Customer ABC",
    "average_transaction": 20000.00,
    "usual_location": "Mumbai, MH"
  },
  "merchant": {
    "id": "M04293",
    "name": "Merchant XYZ",
    "account_age_days": 15
  },
  "risk_score": 73,
  "risk_level": "HIGH",
  "risk_factors": ["Unusual amount", "New device", "Location anomaly"],
  "is_new_device": true,
  "location": "Singapore",
  "investigation": { ... }
}
```

#### 3. Run AI Investigation
```http
POST /transactions/{transaction_id}/investigate
```
**Response:**
```json
{
  "rule_score": 60,
  "anomaly_score": 100,
  "risk_score": 88,
  "risk_level": "CRITICAL",
  "findings": [
    "Transaction amount ₹124,500.00 is 6.2x higher than user's historical average",
    "Executed from an unverified new device",
    "Geographic discrepancy detected: Singapore vs. Mumbai"
  ],
  "recommendation": "HOLD",
  "explanation": "Critical composite risk score...",
  "retrieved_policies": [...]
}
```

#### 4. Submit Decision
```http
POST /decisions
{
  "transaction_id": "TX_A3F2B7C1",
  "action": "HOLD",
  "rationale": "Multiple high-risk signals, pending verification"
}
```

#### 5. Get Transaction Statistics
```http
GET /transactions/stats
```
**Response:**
```json
{
  "total_transactions": 1000,
  "flagged_count": 342,
  "approved_count": 658,
  "high_risk_count": 87,
  "critical_count": 23
}
```

#### 6. Get Audit Log
```http
GET /decisions
```
**Response:**
```json
[
  {
    "id": "DEC_12345",
    "transaction": {...},
    "analyst_action": "HOLD",
    "rationale": "Multiple risk factors present",
    "decision_by": "Risk Analyst (AI-Assisted)",
    "timestamp": "2023-01-15T15:00:00"
  }
]
```

### Interactive API Docs
Visit `http://localhost:8000/docs` for Swagger UI with live testing

---

## 📊 Dataset

### PaySim Synthetic Dataset

RiskForge uses the **PaySim mobile money simulation dataset** for realistic fraud testing.

**Source:** Kaggle — [Synthetic Financial Dataset For Fraud Detection](https://www.kaggle.com/datasets/ealaxi/paysim1)

**Dataset Characteristics:**
- **Size:** 6,362,620 transactions
- **Fraud Rate:** 0.13% (8,213 fraud cases)
- **Transaction Types:** PAYMENT, TRANSFER, CASH_OUT, DEBIT, CASH_IN
- **Period:** 30-day simulation (744 steps = 1 hour per step)

### Seeding the Database

#### Import 1,000 Transactions (Default)
```bash
python backend/seed_from_csv.py --limit 1000
```

#### Import 10,000 Transactions (Balanced Sample)
```bash
python backend/seed_from_csv.py --limit 10000
```

#### Import All 6M+ Transactions (⚠️ Slow)
```bash
python backend/seed_from_csv.py --all
```

#### Wipe Database and Re-seed
```bash
python backend/seed_from_csv.py --limit 1000 --wipe
```

### Seed Strategy

The script uses a **balanced fraud-to-clean sampling strategy**:
- 50% fraud transactions (isFraud=1)
- 50% clean transactions (isFraud=0)

This ensures the dashboard always has interesting risk cases to display.

---

## ⚙️ Configuration

### Backend Configuration

**Environment Variables** (`backend/.env`):

```bash
# Database
DATABASE_URL=sqlite:///./riskforge.db

# API Keys (optional, for future enhancements)
# ANTHROPIC_API_KEY=your_key_here
# OPENAI_API_KEY=your_key_here
```

### Risk Parameters

**Risk thresholds** are currently hardcoded in `backend/risk_engine/rules.py`:

```python
# Configurable parameters
LARGE_TRANSACTION_MULTIPLIER = 5.0   # Amount > 5x average
HIGH_VELOCITY_THRESHOLD = 10         # >10 txns in 2 minutes
NEW_DEVICE_VALUE_MULTIPLIER = 3.0    # Amount > 3x average
MERCHANT_AGE_THRESHOLD = 30          # <30 days old
MERCHANT_RISK_AMOUNT = 50000         # >₹50,000
```

**Future Enhancement:** Move to `backend/config/risk_parameters.json` for runtime tuning.

### Frontend Configuration

**API Base URL** (`frontend/src/services/api.js`):

```javascript
const API_BASE_URL = 'http://localhost:8000';
```

**Theme Colors** (`frontend/src/index.css`):

```css
:root {
  --bg-app: #0a0704;              /* Dark brown background */
  --bg-surface: #1a1410;          /* Brown surface */
  --accent-primary: #C49A5A;      /* Gold accent */
  --accent-hover: #8B6340;        /* Dark gold */
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
pytest tests/ -v
```

**Test Coverage:**
- `test_engine.py` — Risk scoring logic unit tests
- `test_api_routes.py` — API endpoint integration tests

### Manual Testing Checklist

- [ ] Backend starts without errors (`python main.py`)
- [ ] Frontend starts without errors (`npm run dev`)
- [ ] Login page accepts any email
- [ ] Landing page displays and transitions to dashboard
- [ ] Transaction list loads and displays risk levels
- [ ] Selecting transaction shows risk details
- [ ] Risk gauge displays correct score and color
- [ ] Risk factors panel shows triggered rules
- [ ] "Run AI Investigation" button triggers agent
- [ ] Agent findings display with policy citations
- [ ] Decision submission updates status
- [ ] Audit log modal shows decision history

---

## 🤝 Contributing

### Development Workflow

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/YOUR_USERNAME/test.git`
3. **Create branch**: `git checkout -b feature/your-feature-name`
4. **Make changes** and test thoroughly
5. **Commit**: `git commit -m "feat: add new risk rule for XYZ"`
6. **Push**: `git push origin feature/your-feature-name`
7. **Create Pull Request** on GitHub

### Code Style

**Python:**
- Follow PEP 8 style guide
- Use type hints for function signatures
- Add docstrings for all public functions

**JavaScript/React:**
- Use functional components with hooks
- Use JSX for component structure
- Keep components small and focused

### Adding New Risk Rules

1. Add rule function to `backend/risk_engine/rules.py`:
```python
def rule_suspicious_pattern(transaction: dict, user: dict):
    """Rule 6: Describe what it detects"""
    triggered = # your logic here
    return triggered, weight, "Factor label"
```

2. Add to `run_all_rules()` in same file
3. Add policy document to `backend/rag/documents/policy_new_rule.md`
4. Update `factor_map` in `backend/rag/retriever.py`
5. Add UI metadata to `frontend/src/components/RiskFactors.jsx`

---

## 📝 Documentation

### Available Documentation

- **README.md** (this file) — Complete project overview
- **DASHBOARD_AND_RISK_EXPLANATION.md** — Detailed 23-page system guide
- **RISK_POLICY_AND_TRANSACTION_SCORING.md** — Policy specification (23 pages)
- **CHANGES_APPLIED.md** — Recent cleanup and fixes
- **API Docs** — `http://localhost:8000/docs` (Swagger UI)

### Key Concepts

**Risk Score** — 0-100 composite metric (60% rules + 40% anomaly)  
**Risk Factor** — Individual detection rule that triggered  
**Risk Level** — Categorical band (LOW/MEDIUM/HIGH/CRITICAL)  
**Investigation** — AI agent analysis with policy citations  
**Decision** — Analyst action (APPROVE/HOLD/BLOCK) with rationale  
**Audit Trail** — Immutable log of all decisions  

---

## 🔮 Future Enhancements

### Phase 1: Parameter Configuration (Priority: High)
- [ ] Move risk thresholds to `config.json`
- [ ] Add admin UI for parameter tuning
- [ ] A/B testing framework for threshold optimization

### Phase 2: Enhanced Detection (Priority: High)
- [ ] Geographic distance calculation for location anomaly
- [ ] Customer tier logic (VIP vs. new users)
- [ ] Device trust scoring with time decay
- [ ] IP reputation service integration

### Phase 3: ML Integration (Priority: Medium)
- [ ] Train gradient boosting model on historical data
- [ ] Replace anomaly z-score with ML predictions
- [ ] Active learning from analyst feedback

### Phase 4: Advanced Features (Priority: Medium)
- [ ] Real-time transaction stream processing
- [ ] Network graph analysis (entity connections)
- [ ] Behavioral biometrics (typing patterns, mouse movements)
- [ ] Multi-model ensemble (XGBoost + neural network)

### Phase 5: Production Readiness (Priority: Low)
- [ ] PostgreSQL migration for scale
- [ ] Redis caching layer
- [ ] Kubernetes deployment manifests
- [ ] Prometheus metrics and Grafana dashboards

---

## 🐛 Known Issues

### Location Anomaly False Positives
**Issue:** Uses naive string matching, triggers for same city with different IP  
**Workaround:** Manually verify location-flagged transactions  
**Fix Planned:** Haversine distance calculation (Phase 2)

### New Device Definition
**Issue:** No trust-building period (device is "new" forever until seen once)  
**Workaround:** Analysts should check device transaction history manually  
**Fix Planned:** Time-based trust decay (7 days = new, 30 days = trusted)

### Hardcoded Thresholds
**Issue:** Risk parameters hardcoded, requires code changes to adjust  
**Workaround:** Modify values in `rules.py` and restart backend  
**Fix Planned:** Configuration file + hot reload (Phase 1)

---

## 📜 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 Biplob Sinha

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 👥 Authors

**Biplob Sinha**  
GitHub: [@biplobsinha](https://github.com/biplobsinha)  
Project: [RiskForge on GitHub](https://github.com/biplobsinha/test)

---

## 🙏 Acknowledgments

- **Razorpay** — For hosting the AI Buildathon
- **PaySim Dataset** — For realistic synthetic fraud data
- **FastAPI Community** — For excellent documentation and examples
- **React Community** — For modern UI patterns and best practices

---

## 📞 Support

### Getting Help

- **GitHub Issues** — Report bugs or request features: [Issue Tracker](https://github.com/biplobsinha/test/issues)
- **Documentation** — Read `DASHBOARD_AND_RISK_EXPLANATION.md` for detailed guides
- **API Docs** — Interactive testing at `http://localhost:8000/docs`

### Common Questions

**Q: Why is my risk score always low?**  
A: Check that you seeded the database with fraud cases. Use `--limit 1000` to get a balanced sample.

**Q: AI investigation not working?**  
A: Ensure policy documents exist in `backend/rag/documents/`. Check backend logs for errors.

**Q: Frontend not connecting to backend?**  
A: Verify backend is running on port 8000. Check CORS settings in `main.py`.

**Q: Database is empty?**  
A: Run `python backend/seed_from_csv.py --limit 1000` to populate with sample data.

---

## 🚀 Quick Start (TL;DR)

```bash
# Clone repo
git clone https://github.com/biplobsinha/test.git
cd test

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python seed_from_csv.py --limit 1000
python main.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Open browser
# http://localhost:5173
```

**Login → Enter Dashboard → Select Transaction → Run AI Investigation → Make Decision**

---

**Built with ❤️ for the Razorpay AI Buildathon**

*Last Updated: 2026-09-05*
