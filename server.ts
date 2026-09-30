import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const JWT_SECRET = process.env.SECRET_KEY || 'credit_assistant_jwt_super_secret_key_change_in_production';

app.use(express.json());

// Persistent Data File
const DATA_DIR = path.resolve(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'credit_assistant_store.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

interface StoredUser {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  created_at: string;
}

interface StoredProfile {
  id: number;
  user_id: number;
  monthly_income: number;
  monthly_expenses: number;
  total_debt: number;
  credit_limit: number;
  credit_utilization: number;
  active_loans: number;
  missed_payments: number;
  current_credit_score: number;
  dti_ratio: number;
  financial_health_score: number;
  health_status: string;
  created_at: string;
  updated_at: string;
}

interface StoredScoreHistory {
  id: number;
  user_id: number;
  credit_score: number;
  recorded_at: string;
  note: string;
}

interface StoredAIAdvice {
  id: number;
  user_id: number;
  summary: string;
  credit_health_analysis: string;
  key_risks: string[];
  bottlenecks: string[];
  recommendations: string[];
  five_step_plan: Array<{ step: number; title: string; description: string; timeline: string }>;
  short_term_goals: string[];
  long_term_goals: string[];
  disclaimer: string;
  created_at: string;
}

interface StoredReport {
  id: number;
  user_id: number;
  report_name: string;
  report_type: string;
  data: any;
  generated_at: string;
}

interface AppStore {
  users: StoredUser[];
  profiles: StoredProfile[];
  score_history: StoredScoreHistory[];
  ai_recommendations: StoredAIAdvice[];
  reports: StoredReport[];
}

function loadStore(): AppStore {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading store, initializing default:', err);
  }
  return {
    users: [],
    profiles: [],
    score_history: [],
    ai_recommendations: [],
    reports: [],
  };
}

function saveStore(store: AppStore) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving store:', err);
  }
}

// Financial Analytics Calculators
function getCibilStatus(score: number): string {
  if (score >= 750) return 'Excellent';
  if (score >= 700) return 'Good';
  if (score >= 650) return 'Fair';
  return 'Needs Attention';
}

function calculateDTI(expenses: number, income: number): number {
  if (income <= 0) return 0;
  return Math.min(100, Math.round(((expenses / income) * 100) * 100) / 100);
}

function calculateUtilization(debt: number, limit: number, explicitUtil?: number): number {
  if (explicitUtil !== undefined && explicitUtil !== null && !isNaN(explicitUtil)) {
    return Math.min(100, Math.max(0, Math.round(explicitUtil * 100) / 100));
  }
  if (limit <= 0) return 0;
  return Math.min(100, Math.round(((debt / limit) * 100) * 100) / 100);
}

function calculateFinancialHealth(
  score: number,
  utilization: number,
  dti: number,
  missedPayments: number
): { score: number; status: string; breakdown: any } {
  const scoreClamped = Math.max(300, Math.min(900, score));
  const scorePoints = ((scoreClamped - 300) / 600) * 40;

  let utilPoints = 3;
  if (utilization <= 30) utilPoints = 25;
  else if (utilization <= 50) utilPoints = 18;
  else if (utilization <= 70) utilPoints = 10;

  let dtiPoints = 2;
  if (dti <= 30) dtiPoints = 20;
  else if (dti <= 45) dtiPoints = 14;
  else if (dti <= 60) dtiPoints = 8;

  let paymentPoints = 0;
  if (missedPayments === 0) paymentPoints = 15;
  else if (missedPayments === 1) paymentPoints = 7;
  else if (missedPayments === 2) paymentPoints = 3;

  const total = Math.max(10, Math.min(100, Math.round(scorePoints + utilPoints + dtiPoints + paymentPoints)));
  let status = 'Fair';
  if (total >= 80) status = 'Excellent';
  else if (total >= 68) status = 'Good';
  else if (total < 50) status = 'Needs Attention';

  return {
    score: total,
    status,
    breakdown: { scorePoints, utilPoints, dtiPoints, paymentPoints },
  };
}

// Authentication Middleware
interface AuthenticatedRequest extends Request {
  user?: StoredUser;
}

function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ detail: 'Authentication credentials were not provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded: any) => {
    if (err || !decoded || !decoded.sub) {
      return res.status(401).json({ detail: 'Invalid or expired token' });
    }
    const store = loadStore();
    const user = store.users.find((u) => u.id === parseInt(decoded.sub, 10));
    if (!user) {
      return res.status(404).json({ detail: 'User not found' });
    }
    req.user = user;
    next();
  });
}

// ==========================================
// AUTH ROUTER
// ==========================================
app.post('/api/auth/register', (req, res) => {
  const { full_name, email, password, confirm_password } = req.body;

  if (!full_name || !email || !password) {
    return res.status(400).json({ detail: 'All fields are required' });
  }

  if (password !== confirm_password) {
    return res.status(400).json({ detail: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ detail: 'Password must be at least 6 characters' });
  }

  const store = loadStore();
  const existing = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ detail: 'An account with this email already exists' });
  }

  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const newUser: StoredUser = {
    id: store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1,
    full_name: full_name.trim(),
    email: email.toLowerCase().trim(),
    password_hash,
    created_at: new Date().toISOString(),
  };

  store.users.push(newUser);
  saveStore(store);

  const token = jwt.sign({ sub: String(newUser.id), email: newUser.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.status(201).json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: newUser.id,
      full_name: newUser.full_name,
      email: newUser.email,
      created_at: newUser.created_at,
    },
  });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ detail: 'Email and password are required' });
  }

  const store = loadStore();
  const user = store.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim());

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ detail: 'Invalid email or password' });
  }

  const token = jwt.sign({ sub: String(user.id), email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      created_at: user.created_at,
    },
  });
});

app.post('/api/auth/logout', (_req, res) => {
  return res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    id: req.user!.id,
    full_name: req.user!.full_name,
    email: req.user!.email,
    created_at: req.user!.created_at,
  });
});

// Seed/Demo Endpoint
app.post('/api/auth/demo-seed', (_req, res) => {
  const store = loadStore();
  const demoEmail = 'demo.cibil@creditassistant.in';
  let user = store.users.find((u) => u.email === demoEmail);

  if (!user) {
    const salt = bcrypt.genSaltSync(10);
    user = {
      id: store.users.length > 0 ? Math.max(...store.users.map((u) => u.id)) + 1 : 1,
      full_name: 'Sakshi Phalke',
      email: demoEmail,
      password_hash: bcrypt.hashSync('DemoPass123!', salt),
      created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    };
    store.users.push(user);
  }

  // Clear past history and profile for this user
  store.score_history = store.score_history.filter((h) => h.user_id !== user!.id);
  store.profiles = store.profiles.filter((p) => p.user_id !== user!.id);

  // Score Progression: 690 -> 702 -> 715 -> 728 -> 735
  const sampleProgression = [
    { daysAgo: 120, score: 690, note: 'Initial CIBIL bureau registration' },
    { daysAgo: 90, score: 702, note: 'Settled personal overdraft' },
    { daysAgo: 60, score: 715, note: 'Decreased revolving card balance' },
    { daysAgo: 30, score: 728, note: 'Consecutive on-time EMIs milestone' },
    { daysAgo: 5, score: 735, note: 'Credit limit enhancement granted' },
  ];

  let nextHistId = store.score_history.length > 0 ? Math.max(...store.score_history.map((h) => h.id)) + 1 : 1;
  sampleProgression.forEach((item) => {
    store.score_history.push({
      id: nextHistId++,
      user_id: user!.id,
      credit_score: item.score,
      recorded_at: new Date(Date.now() - item.daysAgo * 86400000).toISOString(),
      note: item.note,
    });
  });

  const income = 75000;
  const expenses = 42000;
  const debt = 250000;
  const limit = 400000;
  const util = 37.5;
  const dti = calculateDTI(expenses, income);
  const health = calculateFinancialHealth(735, util, dti, 0);

  const profile: StoredProfile = {
    id: store.profiles.length > 0 ? Math.max(...store.profiles.map((p) => p.id)) + 1 : 1,
    user_id: user.id,
    monthly_income: income,
    monthly_expenses: expenses,
    total_debt: debt,
    credit_limit: limit,
    credit_utilization: util,
    active_loans: 2,
    missed_payments: 0,
    current_credit_score: 735,
    dti_ratio: dti,
    financial_health_score: health.score,
    health_status: health.status,
    created_at: new Date(Date.now() - 120 * 86400000).toISOString(),
    updated_at: new Date().toISOString(),
  };

  store.profiles.push(profile);
  saveStore(store);

  const token = jwt.sign({ sub: String(user.id), email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    access_token: token,
    token_type: 'bearer',
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      created_at: user.created_at,
    },
  });
});

// ==========================================
// USER ROUTER
// ==========================================
app.get('/api/users/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  return res.json({
    id: req.user!.id,
    full_name: req.user!.full_name,
    email: req.user!.email,
    created_at: req.user!.created_at,
  });
});

app.post('/api/users/change-password', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { current_password, new_password } = req.body;
  const store = loadStore();
  const user = store.users.find((u) => u.id === req.user!.id);
  if (!user || !bcrypt.compareSync(current_password, user.password_hash)) {
    return res.status(400).json({ detail: 'Current password is incorrect' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(new_password, salt);
  saveStore(store);
  return res.json({ message: 'Password changed successfully' });
});

app.delete('/api/users/account', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  store.users = store.users.filter((u) => u.id !== req.user!.id);
  store.profiles = store.profiles.filter((p) => p.user_id !== req.user!.id);
  store.score_history = store.score_history.filter((h) => h.user_id !== req.user!.id);
  store.ai_recommendations = store.ai_recommendations.filter((a) => a.user_id !== req.user!.id);
  store.reports = store.reports.filter((r) => r.user_id !== req.user!.id);
  saveStore(store);
  return res.json({ message: 'Account deleted successfully' });
});

// ==========================================
// FINANCIAL PROFILE ROUTER
// ==========================================
app.get('/api/financial/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const profile = store.profiles.find((p) => p.user_id === req.user!.id);
  if (!profile) {
    return res.status(404).json({ detail: 'Financial profile not found. Please complete onboarding.' });
  }
  return res.json(profile);
});

function handleProfileSaveOrUpdate(userId: number, body: any, isNew: boolean): StoredProfile {
  const store = loadStore();
  let profile = store.profiles.find((p) => p.user_id === userId);

  const income = body.monthly_income !== undefined ? Number(body.monthly_income) : profile?.monthly_income ?? 0;
  const expenses = body.monthly_expenses !== undefined ? Number(body.monthly_expenses) : profile?.monthly_expenses ?? 0;
  const debt = body.total_debt !== undefined ? Number(body.total_debt) : profile?.total_debt ?? 0;
  const limit = body.credit_limit !== undefined ? Number(body.credit_limit) : profile?.credit_limit ?? 0;
  const activeLoans = body.active_loans !== undefined ? Number(body.active_loans) : profile?.active_loans ?? 0;
  const missed = body.missed_payments !== undefined ? Number(body.missed_payments) : profile?.missed_payments ?? 0;
  const score = body.current_credit_score !== undefined ? Number(body.current_credit_score) : profile?.current_credit_score ?? 650;

  const util = calculateUtilization(debt, limit, body.credit_utilization !== undefined ? Number(body.credit_utilization) : profile?.credit_utilization);
  const dti = calculateDTI(expenses, income);
  const health = calculateFinancialHealth(score, util, dti, missed);

  const prevScore = profile?.current_credit_score;

  if (!profile) {
    profile = {
      id: store.profiles.length > 0 ? Math.max(...store.profiles.map((p) => p.id)) + 1 : 1,
      user_id: userId,
      monthly_income: income,
      monthly_expenses: expenses,
      total_debt: debt,
      credit_limit: limit,
      credit_utilization: util,
      active_loans: activeLoans,
      missed_payments: missed,
      current_credit_score: score,
      dti_ratio: dti,
      financial_health_score: health.score,
      health_status: health.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.profiles.push(profile);

    // Initial history entry
    store.score_history.push({
      id: store.score_history.length > 0 ? Math.max(...store.score_history.map((h) => h.id)) + 1 : 1,
      user_id: userId,
      credit_score: score,
      recorded_at: new Date().toISOString(),
      note: 'Initial Profile Setup',
    });
  } else {
    profile.monthly_income = income;
    profile.monthly_expenses = expenses;
    profile.total_debt = debt;
    profile.credit_limit = limit;
    profile.credit_utilization = util;
    profile.active_loans = activeLoans;
    profile.missed_payments = missed;
    profile.current_credit_score = score;
    profile.dti_ratio = dti;
    profile.financial_health_score = health.score;
    profile.health_status = health.status;
    profile.updated_at = new Date().toISOString();

    if (prevScore !== score) {
      store.score_history.push({
        id: store.score_history.length > 0 ? Math.max(...store.score_history.map((h) => h.id)) + 1 : 1,
        user_id: userId,
        credit_score: score,
        recorded_at: new Date().toISOString(),
        note: 'Profile update',
      });
    }
  }

  saveStore(store);
  return profile;
}

app.post('/api/financial/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const profile = handleProfileSaveOrUpdate(req.user!.id, req.body, true);
  return res.status(201).json(profile);
});

app.put('/api/financial/profile', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const profile = handleProfileSaveOrUpdate(req.user!.id, req.body, false);
  return res.json(profile);
});

// ==========================================
// CREDIT ANALYTICS ROUTER
// ==========================================
app.get('/api/credit/score-history', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const history = store.score_history
    .filter((h) => h.user_id === req.user!.id)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());
  return res.json(history);
});

app.post('/api/credit/score', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const { credit_score, note } = req.body;
  if (!credit_score || credit_score < 300 || credit_score > 900) {
    return res.status(400).json({ detail: 'Valid credit score between 300 and 900 is required' });
  }

  const store = loadStore();
  const newHist: StoredScoreHistory = {
    id: store.score_history.length > 0 ? Math.max(...store.score_history.map((h) => h.id)) + 1 : 1,
    user_id: req.user!.id,
    credit_score,
    recorded_at: new Date().toISOString(),
    note: note || 'Manual score update',
  };
  store.score_history.push(newHist);

  // Update profile
  const profile = store.profiles.find((p) => p.user_id === req.user!.id);
  if (profile) {
    profile.current_credit_score = credit_score;
    const health = calculateFinancialHealth(credit_score, profile.credit_utilization, profile.dti_ratio, profile.missed_payments);
    profile.financial_health_score = health.score;
    profile.health_status = health.status;
    profile.updated_at = new Date().toISOString();
  }

  saveStore(store);
  return res.status(201).json(newHist);
});

app.get('/api/credit/analytics', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const profile = store.profiles.find((p) => p.user_id === req.user!.id);
  if (!profile) {
    return res.status(404).json({ detail: 'Financial profile not found' });
  }

  const history = store.score_history
    .filter((h) => h.user_id === req.user!.id)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  const scores = history.map((h) => h.credit_score);
  if (scores.length === 0) scores.push(profile.current_credit_score);

  const current_score = profile.current_credit_score;
  const previous_score = scores.length >= 2 ? scores[scores.length - 2] : scores[0];
  const delta = current_score - previous_score;
  const highest_score = Math.max(...scores);
  const lowest_score = Math.min(...scores);

  const used_credit = (profile.credit_utilization / 100) * profile.credit_limit;
  const available_credit = Math.max(0, profile.credit_limit - used_credit);

  return res.json({
    current_score,
    previous_score,
    delta,
    highest_score,
    lowest_score,
    score_status: getCibilStatus(current_score),
    dti_ratio: profile.dti_ratio,
    credit_utilization: profile.credit_utilization,
    available_credit,
    used_credit,
    financial_health_score: profile.financial_health_score,
    health_status: profile.health_status,
    score_history: history,
  });
});

// ==========================================
// DASHBOARD ROUTER
// ==========================================
app.get('/api/dashboard', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const profile = store.profiles.find((p) => p.user_id === req.user!.id);
  const history = store.score_history
    .filter((h) => h.user_id === req.user!.id)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  let analytics = null;
  if (profile) {
    const scores = history.map((h) => h.credit_score);
    if (scores.length === 0) scores.push(profile.current_credit_score);
    const current_score = profile.current_credit_score;
    const previous_score = scores.length >= 2 ? scores[scores.length - 2] : scores[0];
    const used_credit = (profile.credit_utilization / 100) * profile.credit_limit;

    analytics = {
      current_score,
      previous_score,
      delta: current_score - previous_score,
      highest_score: Math.max(...scores),
      lowest_score: Math.min(...scores),
      score_status: getCibilStatus(current_score),
      dti_ratio: profile.dti_ratio,
      credit_utilization: profile.credit_utilization,
      available_credit: Math.max(0, profile.credit_limit - used_credit),
      used_credit,
      financial_health_score: profile.financial_health_score,
      health_status: profile.health_status,
      score_history: history,
    };
  }

  const latest_ai = store.ai_recommendations
    .filter((a) => a.user_id === req.user!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0] || null;

  const recent_reports = store.reports
    .filter((r) => r.user_id === req.user!.id)
    .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
    .slice(0, 5)
    .map((r) => ({
      id: r.id,
      report_name: r.report_name,
      report_type: r.report_type,
      generated_at: r.generated_at,
    }));

  return res.json({
    user: {
      id: req.user!.id,
      full_name: req.user!.full_name,
      email: req.user!.email,
      created_at: req.user!.created_at,
    },
    profile: profile || null,
    analytics,
    latest_ai_advice: latest_ai,
    recent_reports,
  });
});

// ==========================================
// AI ADVISOR ROUTER (Gemini API)
// ==========================================
app.post('/api/ai/analyze', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const profile = store.profiles.find((p) => p.user_id === req.user!.id);
  if (!profile) {
    return res.status(400).json({ detail: 'Please complete your financial profile before requesting AI credit analysis.' });
  }

  const apiKey = process.env.GEMINI_API_KEY || '';
  const incomeStr = `₹${profile.monthly_income.toLocaleString('en-IN')}`;
  const expenseStr = `₹${profile.monthly_expenses.toLocaleString('en-IN')}`;
  const debtStr = `₹${profile.total_debt.toLocaleString('en-IN')}`;
  const limitStr = `₹${profile.credit_limit.toLocaleString('en-IN')}`;

  const prompt = `You are an elite financial wellness advisor specializing in the Indian banking and CIBIL credit scoring ecosystem.
Analyze this user's profile:
- Name: ${req.user!.full_name}
- Credit Score: ${profile.current_credit_score} (${profile.health_status})
- Monthly Income: ${incomeStr}
- Monthly Expenses: ${expenseStr}
- Total Debt: ${debtStr}
- Credit Facility Limit: ${limitStr}
- Credit Utilization: ${profile.credit_utilization}% (ideal <= 30%)
- Active Loans: ${profile.active_loans}
- Missed Payments: ${profile.missed_payments}
- Debt-to-Income: ${profile.dti_ratio}%
- Financial Health Score: ${profile.financial_health_score}/100

Respond strictly in valid JSON with this exact schema:
{
  "summary": "2-3 sentence overview highlighting current score standing and key leverage points in India.",
  "credit_health_analysis": "Detailed 2-paragraph evaluation of credit capacity, repayment discipline, and debt servicing.",
  "key_risks": ["Risk 1 with CIBIL impact", "Risk 2", "Risk 3"],
  "bottlenecks": ["Bottleneck 1", "Bottleneck 2", "Bottleneck 3"],
  "recommendations": ["Actionable step 1", "Actionable step 2", "Actionable step 3", "Actionable step 4"],
  "five_step_plan": [
    {"step": 1, "title": "Title 1", "description": "Specific action", "timeline": "Month 1 (Days 1-30)"},
    {"step": 2, "title": "Title 2", "description": "Specific action", "timeline": "Month 2 (Days 31-60)"},
    {"step": 3, "title": "Title 3", "description": "Specific action", "timeline": "Month 3-4 (Days 61-120)"},
    {"step": 4, "title": "Title 4", "description": "Specific action", "timeline": "Month 5-6"},
    {"step": 5, "title": "Title 5", "description": "Specific action", "timeline": "Month 6-12"}
  ],
  "short_term_goals": ["Goal 1 (30 days)", "Goal 2 (60 days)"],
  "long_term_goals": ["Long term goal 1", "Long term goal 2"]
}`;

  let aiResult: any = null;

  if (apiKey && apiKey !== 'your_gemini_api_key_here') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const geminiResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      const text = geminiResponse.text;
      if (text) {
        aiResult = JSON.parse(text);
      }
    } catch (err) {
      console.warn('Gemini direct API execution notice:', err);
    }
  }

  // Graceful rule-based engine if Gemini key is absent or timed out
  if (!aiResult) {
    const isHighUtil = profile.credit_utilization > 30;
    const hasMissed = profile.missed_payments > 0;
    const isHighDti = profile.dti_ratio > 40;

    aiResult = {
      summary: `Your CIBIL profile reflects a score of ${profile.current_credit_score} (${profile.health_status}) with ${profile.credit_utilization}% credit utilization. By managing revolving balances and sustaining on-time payments, your path toward an elite 780+ bureau rating is well within reach.`,
      credit_health_analysis: `Your financial cash flow shows ${incomeStr} gross monthly income against ${expenseStr} in recurring outgo, yielding a Debt-to-Income ratio of ${profile.dti_ratio}%. In the Indian retail lending framework, banks prefer DTIs below 35-40% when assessing home and auto loan eligibility. With ${debtStr} in total obligations across ${profile.active_loans} loan account(s), systematic debt acceleration will free up substantial monthly cash surplus.`,
      key_risks: [
        isHighUtil
          ? `Credit utilization of ${profile.credit_utilization}% exceeds the bureau benchmark of 30%, which negatively influences credit capacity scoring.`
          : 'Card balances should be monitored around festival seasons to prevent utilization spikes.',
        hasMissed
          ? `${profile.missed_payments} missed/late payment record(s) flagged on credit bureau history, which dampens repayment performance.`
          : 'Zero missed payments recorded—preserve this flawless track record to maintain high bureau trust.',
        isHighDti
          ? `DTI ratio of ${profile.dti_ratio}% leaves compressed margin for emergency borrowing from scheduled commercial banks.`
          : 'Ensure emergency liquid savings equal 4-6 months of EMI obligations in a high-yield savings account or liquid fund.',
      ],
      bottlenecks: [
        `Revolving utilization on credit lines represents ₹${((profile.credit_utilization / 100) * profile.credit_limit).toLocaleString('en-IN')}.`,
        'Potential skew toward unsecured lending products compared to asset-backed credit facilities.',
        'High frequency of multiple credit applications within a short window triggers unnecessary hard bureau inquiries.',
      ],
      recommendations: [
        'Target card payments prior to the billing statement generation date to reflect under 25% utilization to CIBIL.',
        'Set up mandatory NACH / e-Mandate auto-debit for full credit card statement dues rather than minimum payments.',
        'Apply the debt-avalanche method by directing any quarterly incentives or bonuses toward the highest interest debt.',
        'Review your consolidated credit report bi-annually to dispute any mismatched PAN entries or delayed closure updates.',
      ],
      five_step_plan: [
        {
          step: 1,
          title: 'Curtail Revolving Credit Utilization Below 30%',
          description: `Pay down card balances mid-cycle to bring total utilized credit to under ₹${(profile.credit_limit * 0.28).toLocaleString('en-IN')}.`,
          timeline: 'Month 1 (Days 1–30)',
        },
        {
          step: 2,
          title: 'Establish Zero-Default Auto Payment Mandates',
          description: 'Enable automated standing instructions on salary account for all loan EMIs and credit card accounts.',
          timeline: 'Month 2 (Days 31–60)',
        },
        {
          step: 3,
          title: 'Accelerate High-Cost Unsecured Debt Clearance',
          description: 'Allocate surplus monthly budget toward clearing the most expensive personal loan or revolving balance.',
          timeline: 'Month 3–4 (Days 61–120)',
        },
        {
          step: 4,
          title: 'Request Strategic Card Limit Augmentation',
          description: 'Request an income-backed credit limit hike from your existing bank without opening fresh credit accounts.',
          timeline: 'Month 5 (Days 121–150)',
        },
        {
          step: 5,
          title: 'Consolidate Healthy Credit Mix & Account Age',
          description: 'Preserve your oldest active card accounts to extend average credit age while maintaining zero hard inquiries for 6 months.',
          timeline: 'Month 6–12 (Long-term)',
        },
      ],
      short_term_goals: [
        'Bring credit card balance under 25% before the next billing cycle cutoff.',
        'Activate automated bill pay on your primary bank netbanking portal.',
      ],
      long_term_goals: [
        'Cross and comfortably sustain 780+ CIBIL score for preferential home loan rates.',
        'Compress Debt-to-Income ratio below 30% to maximize financial security.',
      ],
    };
  }

  aiResult.disclaimer =
    'This AI-powered financial consultation is provided for educational and wellness purposes only and does not constitute official lending underwriting, legal, or guaranteed financial advice under SEBI or RBI regulations.';
  aiResult.created_at = new Date().toISOString();

  // Store in database
  const adviceRecord: StoredAIAdvice = {
    id: store.ai_recommendations.length > 0 ? Math.max(...store.ai_recommendations.map((a) => a.id)) + 1 : 1,
    user_id: req.user!.id,
    ...aiResult,
  };
  store.ai_recommendations.push(adviceRecord);
  saveStore(store);

  return res.json(adviceRecord);
});

app.get('/api/ai/recommendations', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const latest = store.ai_recommendations
    .filter((a) => a.user_id === req.user!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  return res.json(latest || null);
});

// ==========================================
// REPORTS ROUTER (with PDF Export)
// ==========================================
app.post('/api/reports/generate', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const profile = store.profiles.find((p) => p.user_id === req.user!.id);
  if (!profile) {
    return res.status(400).json({ detail: 'Cannot generate report without an initialized financial profile.' });
  }

  const history = store.score_history
    .filter((h) => h.user_id === req.user!.id)
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime());

  const scores = history.map((h) => h.credit_score);
  if (scores.length === 0) scores.push(profile.current_credit_score);
  const current_score = profile.current_credit_score;
  const previous_score = scores.length >= 2 ? scores[scores.length - 2] : scores[0];
  const delta = current_score - previous_score;

  const latest_ai = store.ai_recommendations
    .filter((a) => a.user_id === req.user!.id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];

  const snapshot = {
    user_name: req.user!.full_name,
    email: req.user!.email,
    current_credit_score: current_score,
    score_delta: delta >= 0 ? `+${delta}` : `${delta}`,
    financial_health_score: profile.financial_health_score,
    health_status: profile.health_status,
    monthly_income: profile.monthly_income,
    monthly_expenses: profile.monthly_expenses,
    total_debt: profile.total_debt,
    credit_limit: profile.credit_limit,
    credit_utilization: profile.credit_utilization,
    dti_ratio: profile.dti_ratio,
    active_loans: profile.active_loans,
    missed_payments: profile.missed_payments,
    score_history: history,
    ai_advice: latest_ai || {
      summary: 'Solid foundational credit with clear opportunities to advance toward 780+ CIBIL tier.',
      credit_health_analysis: 'Healthy cash flow and debt service capacity under Indian banking benchmarks.',
      key_risks: ['Credit utilization should stay capped at 30%'],
      bottlenecks: ['Maintain account age on older credit lines'],
      recommendations: ['Enable auto-debit on monthly cards and loans'],
      five_step_plan: [
        { step: 1, title: 'Keep utilization under 30%', description: 'Pay before statement date', timeline: 'Month 1' },
        { step: 2, title: 'Sustain 100% on-time payments', description: 'Zero DPD track record', timeline: 'Month 2' },
        { step: 3, title: 'Reduce high interest debt', description: 'Apply debt avalanche', timeline: 'Month 3-4' },
        { step: 4, title: 'Strategic limit increase', description: 'Request bank limit hike', timeline: 'Month 5' },
        { step: 5, title: 'Diversify credit mix', description: 'Balance secured and unsecured', timeline: 'Month 6-12' },
      ],
      short_term_goals: ['Reduce card balances below 25%'],
      long_term_goals: ['Attain 780+ CIBIL score'],
    },
    generated_at: new Date().toISOString(),
  };

  const newReport: StoredReport = {
    id: store.reports.length > 0 ? Math.max(...store.reports.map((r) => r.id)) + 1 : 1,
    user_id: req.user!.id,
    report_name: req.body.report_name || `Financial Health Audit - ${new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`,
    report_type: 'HEALTH_ANALYSIS',
    data: snapshot,
    generated_at: new Date().toISOString(),
  };

  store.reports.push(newReport);
  saveStore(store);

  return res.status(201).json(newReport);
});

app.get('/api/reports', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const userReports = store.reports
    .filter((r) => r.user_id === req.user!.id)
    .sort((a, b) => new Date(b.generated_at).getTime() - new Date(a.generated_at).getTime())
    .map((r) => ({
      id: r.id,
      report_name: r.report_name,
      report_type: r.report_type,
      generated_at: r.generated_at,
    }));
  return res.json(userReports);
});

app.get('/api/reports/:id', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const report = store.reports.find((r) => r.id === parseInt(req.params.id, 10) && r.user_id === req.user!.id);
  if (!report) {
    return res.status(404).json({ detail: 'Report not found' });
  }
  return res.json(report);
});

// HTML/PDF Report Viewer & Printable Document
app.get('/api/reports/:id/pdf', authenticateToken, (req: AuthenticatedRequest, res: Response) => {
  const store = loadStore();
  const report = store.reports.find((r) => r.id === parseInt(req.params.id, 10) && r.user_id === req.user!.id);
  if (!report) {
    return res.status(404).send('Report not found');
  }

  const d = report.data;
  const ai = d.ai_advice || {};

  // Formatted HTML that renders cleanly and triggers native browser print/save as PDF
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>DhanSetu - Financial Health Report #${report.id}</title>
  <style>
    @page { size: A4; margin: 20mm; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1e293b; line-height: 1.5; font-size: 13px; margin: 0; padding: 24px; background: #fff; }
    .header { border-bottom: 2px solid #2563eb; padding-bottom: 12px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
    .title { font-size: 24px; font-weight: 800; color: #1e3a8a; margin: 0; letter-spacing: -0.5px; }
    .subtitle { font-size: 13px; color: #64748b; margin-top: 4px; }
    .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; }
    .grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px; margin-bottom: 20px; }
    .metric-card { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px; text-align: center; }
    .metric-val { font-size: 26px; font-weight: 800; color: #1d4ed8; margin: 4px 0; }
    .metric-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; font-weight: 600; }
    .section-title { font-size: 15px; font-weight: 700; color: #0f172a; margin: 18px 0 10px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 12px; }
    th { background: #1e293b; color: #fff; text-align: left; padding: 8px 10px; font-weight: 600; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }
    tr:nth-child(even) { background: #f8fafc; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
    .box { border-radius: 8px; padding: 12px; border: 1px solid #e2e8f0; font-size: 12px; }
    .box-red { background: #fef2f2; border-color: #fecaca; }
    .box-blue { background: #f0fdf4; border-color: #bbf7d0; }
    .box-title { font-weight: 700; margin-bottom: 6px; }
    .step-item { margin-bottom: 10px; padding: 8px 10px; background: #f8fafc; border-left: 3px solid #2563eb; border-radius: 0 4px 4px 0; }
    .step-title { font-weight: 700; color: #1e3a8a; }
    .disclaimer { margin-top: 25px; padding-top: 12px; border-top: 1px solid #cbd5e1; font-size: 10px; color: #64748b; font-style: italic; line-height: 1.4; }
    .no-print { text-align: right; margin-bottom: 16px; }
    .print-btn { background: #2563eb; color: #fff; border: none; padding: 8px 16px; font-size: 13px; font-weight: 600; border-radius: 6px; cursor: pointer; }
    @media print { .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="no-print">
    <button class="print-btn" onclick="window.print()">Download / Print PDF</button>
  </div>

  <div class="header">
    <div>
      <h1 class="title">DHANSETU (धनसेतु)</h1>
      <div class="subtitle">AI-Powered Credit Health &amp; Financial Wellness Assessment</div>
    </div>
    <div style="text-align: right; font-size: 12px; color: #64748b;">
      Report ID: #DS-${report.id}<br>
      Indian Financial Framework (CIBIL Scale)
    </div>
  </div>

  <div class="meta-box">
    <div><strong>Client Name:</strong> ${d.user_name}</div>
    <div><strong>Account Email:</strong> ${d.email}</div>
    <div><strong>Date Generated:</strong> ${new Date(report.generated_at).toLocaleString('en-IN')}</div>
    <div><strong>Bureau Standing:</strong> ${d.health_status}</div>
  </div>

  <div class="grid-3">
    <div class="metric-card">
      <div class="metric-lbl">Current Credit Score</div>
      <div class="metric-val">${d.current_credit_score}</div>
      <div style="font-size: 11px; color: #16a34a; font-weight: 600;">CIBIL Scale (300–900)</div>
    </div>
    <div class="metric-card" style="background: #f0fdf4; border-color: #bbf7d0;">
      <div class="metric-lbl">Financial Health Score</div>
      <div class="metric-val" style="color: #059669;">${d.financial_health_score}/100</div>
      <div style="font-size: 11px; color: #475569; font-weight: 600;">Status: ${d.health_status}</div>
    </div>
    <div class="metric-card" style="background: #faf5ff; border-color: #e9d5ff;">
      <div class="metric-lbl">Score Progression</div>
      <div class="metric-val" style="color: #7c3aed;">${d.score_delta}</div>
      <div style="font-size: 11px; color: #64748b;">Delta Since Tracking</div>
    </div>
  </div>

  <div class="section-title">1. Verified Financial Parameters</div>
  <table>
    <thead>
      <tr>
        <th>Financial Metric</th>
        <th>Recorded Value</th>
        <th>Ideal Benchmark</th>
        <th>Status Analysis</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Gross Monthly Income</td>
        <td><strong>₹${Number(d.monthly_income).toLocaleString('en-IN')}</strong></td>
        <td>-</td>
        <td>Baseline Cashflow</td>
      </tr>
      <tr>
        <td>Monthly Living Obligations / Expenses</td>
        <td><strong>₹${Number(d.monthly_expenses).toLocaleString('en-IN')}</strong></td>
        <td>&le; 50% of Income</td>
        <td>${d.monthly_expenses <= d.monthly_income * 0.5 ? 'Balanced Cashflow' : 'Elevated Outgo'}</td>
      </tr>
      <tr>
        <td>Total Outstanding Debt</td>
        <td><strong>₹${Number(d.total_debt).toLocaleString('en-IN')}</strong></td>
        <td>-</td>
        <td>Active Liabilities</td>
      </tr>
      <tr>
        <td>Total Available Credit Facility Limit</td>
        <td><strong>₹${Number(d.credit_limit).toLocaleString('en-IN')}</strong></td>
        <td>-</td>
        <td>Revolving Ceiling</td>
      </tr>
      <tr>
        <td>Credit Utilization Ratio</td>
        <td><strong>${d.credit_utilization}%</strong></td>
        <td>&le; 30%</td>
        <td>${d.credit_utilization <= 30 ? 'Optimal Bureau Range' : d.credit_utilization <= 50 ? 'Moderate Reliance' : 'High Risk Utilization'}</td>
      </tr>
      <tr>
        <td>Debt-to-Income (DTI) Ratio</td>
        <td><strong>${d.dti_ratio}%</strong></td>
        <td>&le; 35%</td>
        <td>${d.dti_ratio <= 35 ? 'Healthy Debt Coverage' : 'Elevated Debt Burden'}</td>
      </tr>
      <tr>
        <td>Active Loan Facilities</td>
        <td><strong>${d.active_loans}</strong></td>
        <td>1–3 Balanced</td>
        <td>Standard Portfolio</td>
      </tr>
      <tr>
        <td>Missed/Late Payments (24 Mos)</td>
        <td><strong>${d.missed_payments}</strong></td>
        <td>0 Defaults</td>
        <td>${d.missed_payments === 0 ? 'Pristine Track Record' : `${d.missed_payments} Default(s) Flagged`}</td>
      </tr>
    </tbody>
  </table>

  <div class="section-title">2. AI Financial Consultation &amp; Bottlenecks</div>
  <p style="margin: 0 0 10px 0; font-size: 13px; color: #334155;">${ai.summary || ''}</p>
  <p style="margin: 0 0 14px 0; font-size: 12px; color: #475569;">${ai.credit_health_analysis || ''}</p>

  <div class="grid-2">
    <div class="box box-red">
      <div class="box-title" style="color: #991b1b;">Key Risk Factors</div>
      <ul style="margin: 0; padding-left: 18px;">
        ${(ai.key_risks || []).map((r: string) => `<li>${r}</li>`).join('')}
      </ul>
    </div>
    <div class="box box-blue">
      <div class="box-title" style="color: #166534;">Strategic Recommendations</div>
      <ul style="margin: 0; padding-left: 18px;">
        ${(ai.recommendations || []).map((r: string) => `<li>${r}</li>`).join('')}
      </ul>
    </div>
  </div>

  <div class="section-title">3. Five-Step Credit Improvement Roadmap</div>
  ${(ai.five_step_plan || [])
    .map(
      (s: any) => `
    <div class="step-item">
      <div class="step-title">Step ${s.step}: ${s.title} <span style="font-weight: 400; font-size: 11px; color: #64748b;">(${s.timeline})</span></div>
      <div style="font-size: 12px; color: #334155; margin-top: 2px;">${s.description}</div>
    </div>`
    )
    .join('')}

  <div class="disclaimer">
    <strong>REGULATORY &amp; LEGAL DISCLAIMER:</strong> This Financial Health Report is generated for educational and informational purposes only and does not constitute financial, credit, lending, or investment advice. Credit scores and bureau metrics are indicative and may differ from official credit information reports issued by authorized bureaus (TransUnion CIBIL, Experian, Equifax, CRIF High Mark). DhanSetu does not guarantee specific score increments or lending underwriting decisions.
  </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  return res.send(html);
});

// ==========================================
// VITE CLIENT INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production' && fs.existsSync(path.resolve(process.cwd(), 'dist'))) {
    app.use(express.static(path.resolve(process.cwd(), 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(process.cwd(), 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`DhanSetu full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
