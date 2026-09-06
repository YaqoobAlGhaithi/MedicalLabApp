import express from 'express';
import path from 'path';
import fs from 'fs';
import jwt from 'jsonwebtoken';
import { createServer as createViteServer } from 'vite';

const app = express();
const PORT = 3000;
// JWT_SECRET is loaded exclusively from the environment. No secret is compiled into the code.
const JWT_SECRET = process.env.JWT_SECRET;

// Increase payload limit for medical report base64 PDFs and images
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload and data persistence directories exist
const DATA_DIR = path.join(process.cwd(), 'server-data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const DB_FILE = path.join(DATA_DIR, 'db.json');

// Initial seed data structure
interface ServerDatabase {
  reports: Array<any>;
  patients: Array<any>;
  printJobs: Array<any>;
}

function loadDatabase(): ServerDatabase {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error reading database file, fallback to empty DB:', e);
  }
  return { reports: [], patients: [], printJobs: [] };
}

function saveDatabase(db: ServerDatabase): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing database file:', e);
  }
}

// ----------------------------------------------------
// Backend users (env-driven, no hardcoded credentials)
// ----------------------------------------------------
interface LabUser {
  username: string;
  password: string;
  name: string;
  role: string;
}

/**
 * Lab users are loaded exclusively from the LAB_USERS environment variable (a JSON array).
 * No credentials are hardcoded in source code.
 * Example value:
 *   LAB_USERS='[{"username":"admin","password":"<strong>","name":"مدير النظام","role":"admin"}]'
 */
function loadLabUsers(): LabUser[] {
  const raw = process.env.LAB_USERS;
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Invalid LAB_USERS environment variable:', e);
    return [];
  }
}

// ----------------------------------------------------
// 1. Health & Server Info
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Al-Manar Medical Laboratories & Clinics Backend',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    features: ['jwt-auth', 'reports-crud', 'file-storage', 'print-manager-sync'],
  });
});

// ----------------------------------------------------
// 2. Authentication API (JWT)
// ----------------------------------------------------
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  if (!JWT_SECRET) {
    return res.status(503).json({ success: false, message: 'JWT_SECRET غير مُعرّف على الخادم (Environment Variable)' });
  }

  const users = loadLabUsers();
  const found = users.find((u) => u.username === username && u.password === password);

  if (!found) {
    return res.status(401).json({ success: false, message: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
  }

  const user = {
    id: found.username === 'admin' ? 'usr_admin' : 'usr_spec',
    username: found.username,
    name: found.name,
    role: found.role,
  };

  const token = jwt.sign(user, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    success: true,
    token,
    user,
    message: 'تم تسجيل الدخول بنجاح',
  });
});

app.get('/api/auth/verify', (req, res) => {
  if (!JWT_SECRET) {
    return res.status(503).json({ valid: false, message: 'JWT_SECRET غير مُعرّف على الخادم (Environment Variable)' });
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ valid: false, message: 'Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return res.json({ valid: true, user: decoded });
  } catch (err) {
    return res.status(401).json({ valid: false, message: 'Invalid or expired token' });
  }
});

// ----------------------------------------------------
// 3. Reports REST API
// ----------------------------------------------------
app.get('/api/reports', (req, res) => {
  const db = loadDatabase();
  const { q, patient, labNumber } = req.query;

  let results = [...db.reports];

  if (typeof q === 'string' && q.trim()) {
    const term = q.trim().toLowerCase();
    results = results.filter(
      (r) =>
        r.patientName?.toLowerCase().includes(term) ||
        r.labNumber?.toLowerCase().includes(term) ||
        r.doctorName?.toLowerCase().includes(term)
    );
  }

  if (typeof patient === 'string') {
    results = results.filter((r) => r.patientName === patient);
  }

  if (typeof labNumber === 'string') {
    results = results.filter((r) => r.labNumber?.toLowerCase() === labNumber.toLowerCase());
  }

  res.json({
    success: true,
    total: results.length,
    reports: results,
  });
});

app.get('/api/reports/:id', (req, res) => {
  const db = loadDatabase();
  const report = db.reports.find((r) => r.id === req.params.id);
  if (!report) {
    return res.status(404).json({ success: false, message: 'التقرير غير موجود' });
  }
  res.json({ success: true, report });
});

app.post('/api/reports', (req, res) => {
  const db = loadDatabase();
  const newReport = req.body;

  if (!newReport.patientName || !newReport.labNumber) {
    return res.status(400).json({ success: false, message: 'اسم المريض والرقم المخبري مطلوبان' });
  }

  // Check if exists or update
  const existingIdx = db.reports.findIndex((r) => r.id === newReport.id || r.labNumber === newReport.labNumber);
  if (existingIdx >= 0) {
    db.reports[existingIdx] = { ...db.reports[existingIdx], ...newReport, updatedAt: new Date().toISOString() };
  } else {
    const reportToSave = {
      ...newReport,
      id: newReport.id || `rep_${Date.now()}`,
      createdAt: newReport.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    db.reports.unshift(reportToSave);
  }

  saveDatabase(db);
  res.status(201).json({ success: true, message: 'تم حفظ التقرير بنجاح في قاعدة البيانات', report: newReport });
});

app.put('/api/reports/:id', (req, res) => {
  const db = loadDatabase();
  const idx = db.reports.findIndex((r) => r.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'التقرير غير موجود' });
  }

  db.reports[idx] = { ...db.reports[idx], ...req.body, updatedAt: new Date().toISOString() };
  saveDatabase(db);
  res.json({ success: true, message: 'تم تحديث التقرير بنجاح', report: db.reports[idx] });
});

app.delete('/api/reports/:id', (req, res) => {
  const db = loadDatabase();
  const initialLength = db.reports.length;
  db.reports = db.reports.filter((r) => r.id !== req.params.id);

  if (db.reports.length === initialLength) {
    return res.status(404).json({ success: false, message: 'التقرير غير موجود' });
  }

  saveDatabase(db);
  res.json({ success: true, message: 'تم حذف التقرير بنجاح' });
});

// Batch sync reports from client to server
app.post('/api/reports/sync', (req, res) => {
  const { reports } = req.body;
  if (!Array.isArray(reports)) {
    return res.status(400).json({ success: false, message: 'Invalid reports payload' });
  }

  const db = loadDatabase();
  let addedCount = 0;
  let updatedCount = 0;

  for (const item of reports) {
    const idx = db.reports.findIndex((r) => r.id === item.id || r.labNumber === item.labNumber);
    if (idx >= 0) {
      db.reports[idx] = { ...db.reports[idx], ...item, updatedAt: new Date().toISOString() };
      updatedCount++;
    } else {
      db.reports.push({ ...item, createdAt: item.createdAt || new Date().toISOString() });
      addedCount++;
    }
  }

  saveDatabase(db);
  res.json({
    success: true,
    message: 'تمت مزامنة التقارير مع السيرفر بنجاح',
    stats: { addedCount, updatedCount, total: db.reports.length },
    reports: db.reports,
  });
});

// ----------------------------------------------------
// 4. File Storage API (PDF & Images)
// ----------------------------------------------------
app.post('/api/files/upload', (req, res) => {
  const { fileName, base64Data, mimeType, patientName, labNumber } = req.body;

  if (!fileName || !base64Data) {
    return res.status(400).json({ success: false, message: 'fileName and base64Data are required' });
  }

  try {
    const safeFileName = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9_.\-\u0600-\u06FF]/g, '_')}`;
    const filePath = path.join(UPLOADS_DIR, safeFileName);

    // Remove base64 header if present
    const cleanBase64 = base64Data.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    fs.writeFileSync(filePath, buffer);

    const fileUrl = `/api/files/${encodeURIComponent(safeFileName)}`;

    res.status(201).json({
      success: true,
      fileName: safeFileName,
      originalName: fileName,
      fileUrl,
      sizeBytes: buffer.length,
      mimeType: mimeType || 'application/octet-stream',
      patientName,
      labNumber,
      message: 'تم رفع الملف وحفظه بنجاح على الخادم',
    });
  } catch (err: any) {
    console.error('File upload error:', err);
    res.status(500).json({ success: false, message: 'تعذر حفظ الملف: ' + err.message });
  }
});

app.get('/api/files/:filename', (req, res) => {
  const fileName = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'الملف غير موجود' });
  }

  if (fileName.endsWith('.pdf')) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(fileName)}"`);
  } else if (fileName.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  } else if (fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
    res.setHeader('Content-Type', 'image/jpeg');
  } else {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);
  }

  fs.createReadStream(filePath).pipe(res);
});

// ----------------------------------------------------
// 5. Print Queue & Audit Sync API
// ----------------------------------------------------
app.post('/api/print/jobs', (req, res) => {
  const db = loadDatabase();
  const { reportId, patientName, labNumber, printerName, copies, paperSize, status = 'completed' } = req.body;

  const job = {
    id: `job_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    reportId,
    patientName,
    labNumber,
    printerName: printerName || 'Default System Printer',
    copies: copies || 1,
    paperSize: paperSize || 'A4',
    status,
    timestamp: new Date().toISOString(),
  };

  db.printJobs.unshift(job);
  // Keep only latest 100 print logs
  if (db.printJobs.length > 100) {
    db.printJobs = db.printJobs.slice(0, 100);
  }

  saveDatabase(db);
  res.json({ success: true, message: 'تم تسجيل ومزامنة عملية الطباعة بنجاح', job });
});

app.get('/api/print/jobs', (req, res) => {
  const db = loadDatabase();
  res.json({ success: true, printJobs: db.printJobs });
});

// ----------------------------------------------------
// 6. Vite Integration & App Startup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Al-Manar Lab System Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
