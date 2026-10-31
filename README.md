live website : https://dhansetu7.ai.studio

full documentation : https://ap.wps.com/cms/docs/d/cbCaecwM4S6fdwgZ?platform=pc&refer=copylink

# DHANSETU (धनसेतु)
### AI-Powered Credit Health & Financial Wellness Platform (Indian Banking & CIBIL Ecosystem)

**DhanSetu** is an industry-grade, full-stack financial wellness platform designed specifically for users in the Indian retail credit ecosystem. The application integrates real-time credit score analytics, debt-to-income (DTI) calculations, credit card utilization monitoring, Google Gemini AI consultation, and automated PDF financial health reports.

---

## 1. Project Overview

In the Indian financial market, understanding and improving CIBIL / Experian credit scores can mean the difference of hundreds of basis points in loan interest rates. DhanSetu bridges the gap between raw bureau numbers and actionable financial execution by:
- Monitoring CIBIL credit scores across historical progression audits.
- Enforcing the optimal 30% credit card utilization ceiling in Indian Rupees (`₹`).
- Calculating Debt-to-Income (DTI) capacity benchmarks for retail loan eligibility.
- Generating personalized 5-step action roadmaps using Google Gemini.
- Exporting downloadable, audit-ready Financial Health Reports in PDF.

---

## 2. Features

- **End-to-End JWT Authentication**: Secure user registration, password hashing with bcrypt, protected route authorization, and session persistence.
- **Interactive Financial Onboarding**: Captures gross income, debt liabilities, credit card ceilings, active loan counts, and missed payments.
- **Composite Financial Health Score**: Transparent 0–100 index assessing credit score, utilization ratio, DTI headroom, and zero-default repayment history.
- **Responsive Visualizations**:
  - Recharts Area/Line Chart with historical CIBIL trajectory and milestone benchmarks (750+ Prime).
  - Recharts Donut/Pie Chart with used vs available credit in Indian Rupees (`₹`).
  - Progress tracking for debt reduction and credit score increments.
- **Google Gemini AI Financial Advisor**:
  - Credit health summary and risk bottleneck detection.
  - Tactical 5-step milestone roadmap (Days 1–30 to Long-term).
  - Short-term & long-term goals.
  - Strict educational and compliance disclaimers.
- **PDF Report Generation**:
  - Server-side generated report containing full financial metrics, audit snapshot, score history table, AI recommendations, and regulatory disclaimers.
- **1-Click Live Demo Seed**:
  - Instantly load authentic Indian credit data (690 → 702 → 715 → 728 → 735 CIBIL progression, ₹75,000 income, ₹2,50,000 debt) with a single click.

---

## 3. Architecture & Application Flow

```
USER
  ↓
WEB FRONTEND (React.js + Vite + Tailwind CSS + Recharts)
  ↓ HTTP / JSON Requests (Axios)
FASTAPI BACKEND (Python + Pydantic)
  ↕
SQLITE DATABASE (SQLAlchemy ORM)

FASTAPI BACKEND
  ↓ Financial Data + Profile Metrics
AI ENGINE (Google Gemini API: gemini-3.8-flash)
  ↓ AI Analysis & 5-Step Improvement Plan
FASTAPI BACKEND

FASTAPI BACKEND
  ↓ Processed Data & Insights
FINANCIAL HEALTH REPORT
  ↓
WEB FRONTEND (Card Layout & Interactive Visuals)

FASTAPI BACKEND
  ↓ Generate Report Request
PDF GENERATION SERVICE (ReportLab)
  ↓ Generated PDF Stream
WEB FRONTEND / DOWNLOAD (Direct PDF File)
```

---

## 4. Technology Stack

### Frontend:
- **Framework**: React 19 (TypeScript / JSX)
- **Bundler**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts (Responsive Line, Area, and Donut charts)
- **Icons**: Lucide React
- **HTTP Client**: Axios (with Bearer interceptors)

### Backend:
- **Framework**: Python 3.10+ / FastAPI
- **Data Validation**: Pydantic v2
- **ORM / Database**: SQLAlchemy / SQLite
- **Security**: Passlib (bcrypt password hashing) & Python-Jose (JWT Tokens)
- **AI Integration**: Google GenAI SDK (`gemini-3.8-flash`)
- **PDF Service**: ReportLab 4.x

---

## 5. Folder Structure

```
credit-assistant/
│
├── backend/
│   ├── main.py                  # FastAPI entry point & CORS configuration
│   ├── database.py              # SQLite engine & SQLAlchemy SessionLocal
│   ├── models.py                # Database models (User, Profile, History, Advice, Report)
│   ├── schemas.py               # Pydantic request & response validation schemas
│   ├── auth.py                  # Password hashing & JWT token generators
│   ├── dependencies.py          # get_current_user HTTPBearer dependency
│   ├── seed.py                  # Standalone database seed script
│   ├── requirements.txt         # Python dependencies
│   ├── .env.example             # Backend environment template
│   │
│   ├── routers/
│   │   ├── auth.py              # Register, login, logout, me, demo-seed
│   │   ├── users.py             # User profile, password change, account deletion
│   │   ├── financial.py         # Financial profile CRUD & calculations
│   │   ├── credit.py            # Credit score logging & analytics engine
│   │   ├── dashboard.py         # Consolidated dashboard overview endpoint
│   │   ├── ai.py                # Gemini AI consultation endpoints
│   │   └── reports.py           # Report compilation & ReportLab PDF streaming
│   │
│   └── services/
│       ├── credit_service.py    # DTI, CUR, and Financial Health Score math
│       ├── financial_service.py # Profile persistence and audit history
│       ├── gemini_service.py    # Google Gemini API connector with fallback
│       └── pdf_service.py       # ReportLab PDF design and canvas builder
│
├── src/                         # React Frontend
│   ├── components/
│   │   ├── Navbar.tsx           # Global header, user pill, demo loader
│   │   ├── Sidebar.tsx          # FinTech navigation drawer with mobile support
│   │   ├── CreditScoreCard.tsx  # CIBIL gauge and score delta tracker
│   │   ├── FinancialHealthCard.tsx # 100-point composite wellness indicator
│   │   ├── UtilizationChart.tsx # Recharts Donut chart with Indian Rupee values
│   │   ├── ScoreHistoryChart.tsx # Recharts Area/Line chart for CIBIL trajectory
│   │   ├── RecommendationCard.tsx # 5-step roadmap & risk factor cards
│   │   ├── UpdateScoreModal.tsx # Quick modal to log new CIBIL scores
│   │   └── LoadingSpinner.tsx   # FinTech pulse and skeleton indicators
│   │
│   ├── pages/
│   │   ├── Landing.tsx          # Public marketing & feature showcase
│   │   ├── Login.tsx            # Sign in with password visibility toggle
│   │   ├── Register.tsx         # Account creation with validation
│   │   ├── Onboarding.tsx       # Initial financial parameters onboarding
│   │   ├── Dashboard.tsx        # Central command center with 4-row layout
│   │   ├── CreditHealth.tsx     # Deep-dive factor diagnostics (DPD, CUR, DTI)
│   │   ├── Profile.tsx          # Real-time liability and income editor
│   │   ├── AIAdvisor.tsx        # Dedicated Gemini consultation interface
│   │   ├── Progress.tsx         # Long-term score and debt reduction trends
│   │   ├── Reports.tsx          # Health audit generator & PDF downloader
│   │   └── Settings.tsx         # Security, notifications, and danger zone
│   │
│   ├── context/
│   │   └── AuthContext.tsx      # Global auth state & token persistence
│   ├── services/
│   │   └── api.ts               # Axios API client with currency formatters
│   ├── App.tsx                  # Root application router
│   ├── main.tsx                 # React entry point
│   └── index.css                # Tailwind CSS imports
│
├── server.ts                    # Full-Stack server with Vite integration & API proxy
├── package.json                 # Node.js dependencies & scripts
├── vite.config.ts               # Vite configuration
└── README.md                    # Project documentation
```

---

## 6. Environment Variables

### Backend (`backend/.env`):
```env
DATABASE_URL=sqlite:///./credit_assistant.db
SECRET_KEY=credit_assistant_jwt_super_secret_key_change_in_production
GEMINI_API_KEY=your_gemini_api_key_here
ACCESS_TOKEN_EXPIRE_MINUTES=1440
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000
```

### Frontend (`.env` or root):
```env
VITE_API_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 7. How to Run Locally

### Option A: Standard Full-Stack Python FastAPI + React

#### 1. Start the FastAPI Backend:
```bash
# Navigate to the backend directory
cd backend

# Create and activate Python virtual environment
python -m venv venv

# On Linux / macOS:
source venv/bin/activate

# On Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the seed script (optional for instant sample data)
python seed.py

# Start FastAPI server on port 8000
uvicorn main:app --reload --port 8000
```
FastAPI Swagger documentation will be available at: `http://localhost:8000/docs`

#### 2. Start the React Frontend:
```bash
# In another terminal, navigate to the frontend directory
npm install

# Run the frontend development server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 8. API Endpoints Reference

### Authentication
- `POST /api/auth/register` — Create new user account with bcrypt hashing.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `POST /api/auth/logout` — Invalidate user session.
- `GET /api/auth/me` — Retrieve currently authenticated user.
- `POST /api/auth/demo-seed` — Populate realistic Indian credit data.

### Financial Profile
- `GET /api/financial/profile` — Get verified financial parameters.
- `POST /api/financial/profile` — Initialize onboarding profile.
- `PUT /api/financial/profile` — Update debt, expenses, or credit limits with auto-recalculation.

### Credit Analytics
- `GET /api/credit/score-history` — Retrieve all logged CIBIL score checkpoints.
- `POST /api/credit/score` — Log a new credit score update with bureau notes.
- `GET /api/credit/analytics` — Compute utilization, available credit, score deltas, and DTI.

### Dashboard
- `GET /api/dashboard` — Unified payload for dashboard widgets, charts, and recommendations.

### AI Advisor (Gemini)
- `POST /api/ai/analyze` — Trigger Google Gemini AI consultation and 5-step roadmap.
- `GET /api/ai/recommendations` — Fetch latest stored AI advisory record.

### Financial Health Reports
- `POST /api/reports/generate` — Compile complete health report snapshot.
- `GET /api/reports` — List generated reports for user.
- `GET /api/reports/{id}` — Fetch detailed report JSON.
- `GET /api/reports/{id}/pdf` — Download ReportLab-generated binary PDF report.

---

## 9. Testing Checklist

1. **Authentication Flow**:
   - Register a new account (`test@example.com` / `Password123!`).
   - Log out and log back in; verify JWT token persistence.
2. **Onboarding Flow**:
   - Enter income (₹75,000), expenses (₹42,000), debt (₹2,50,000), limit (₹4,00,000), and score (735).
   - Verify DTI is calculated as 56% and utilization as 37.5%.
3. **Credit Score Update**:
   - Click "Update Score", enter 750 with note "Annual review".
   - Confirm score increments to 750, delta displays `+15`, and the trajectory chart appends the new point.
4. **Real-time Recalculation**:
   - Go to "Financial Profile", decrease debt to ₹1,50,000.
   - Return to Dashboard; verify utilization dropped to 25% and health status updated to "Excellent".
5. **Gemini AI Consultation**:
   - Go to "AI Advisor" and click "Analyze My Credit Health".
   - Verify 5-step roadmap, key risks, and bottlenecks render in clean card layout.
6. **PDF Generation**:
   - Go to "Health Reports", click "Generate Financial Health Report".
   - Click "Download PDF Report" and open the generated file.

---

## 10. Compliance & Educational Notice

*Credit Assistant is an educational financial wellness technology platform. Bureau classifications adhere to general Indian banking and CIBIL credit guidelines. The platform does not guarantee underwriting approvals or official credit repairs under Reserve Bank of India (RBI) or SEBI regulations.*
