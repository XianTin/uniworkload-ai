import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { db } from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;
const UPLOADS_DIR = path.join(__dirname, '../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_\u0E00-\u0E7F-]/g, '_');
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e4);
    cb(null, `${basename}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 } // 15MB
});

app.use(cors());
app.use(express.json());

// Serve uploaded files statically
app.use('/uploads', express.static(UPLOADS_DIR));

// ----------------------------------------------------
// 1. Healthcheck & Tunnel Info
// ----------------------------------------------------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '2.8.0-pilot',
    ordersCount: db.getOrders().length,
    facultiesCount: db.getFaculties().length,
    tunnelUrl: db.getTunnelUrl(),
    uptime: process.uptime()
  });
});

app.get('/api/tunnel/info', (req, res) => {
  res.json({
    tunnelUrl: db.getTunnelUrl(),
    localApiUrl: `http://localhost:${PORT}/api`,
    icalPath: '/api/calendar/feed'
  });
});

app.post('/api/tunnel/register', (req, res) => {
  const { url } = req.body;
  if (url) {
    db.setTunnelUrl(url);
    console.log(`[Server] Cloudflare Tunnel URL registered: ${url}`);
    return res.json({ success: true, tunnelUrl: url });
  }
  res.status(400).json({ error: 'Missing url' });
});

// ----------------------------------------------------
// 2. Faculty Endpoints
// ----------------------------------------------------
app.get('/api/faculty', (req, res) => {
  const faculties = db.getFaculties();
  const tunnelUrl = db.getTunnelUrl();
  const host = tunnelUrl || `http://localhost:${PORT}`;

  const enriched = faculties.map(f => ({
    ...f,
    icalFeedUrl: `webcal://${host.replace(/^https?:\/\//, '')}/api/calendar/feed/${f.id}.ics`,
    httpIcalUrl: `${host}/api/calendar/feed/${f.id}.ics`
  }));
  res.json(enriched);
});

app.post('/api/faculty', (req, res) => {
  const { name, role, department, faculty, email, avatar } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }
  const id = 'fac-' + Date.now();
  const newFaculty = {
    id,
    name,
    role: role || 'อาจารย์ประจำสาขาวิชา',
    department: department || 'สาขาวิชาวิทยาการคอมพิวเตอร์',
    faculty: faculty || 'คณะวิทยาศาสตร์และเทคโนโลยี',
    email: email || `${id}@nsru.ac.th`,
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    stats: {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalHours: 0,
      evidenceReadyPct: 100
    }
  };
  db.addFaculty(newFaculty);
  res.status(201).json(newFaculty);
});

// ----------------------------------------------------
// 3. Orders Endpoints
// ----------------------------------------------------
app.get('/api/orders', (req, res) => {
  const { facultyId, category, status, search, startDate, endDate } = req.query;
  let orders = db.getOrders(facultyId);

  if (category && category !== 'all') {
    orders = orders.filter(o => o.categoryCode === category);
  }

  if (status && status !== 'all') {
    if (status === 'missing_evidence') {
      orders = orders.filter(o => !o.actualPhotos || o.actualPhotos.length === 0);
    } else {
      orders = orders.filter(o => o.status === status);
    }
  }

  if (search) {
    const s = search.toLowerCase();
    orders = orders.filter(o =>
      (o.orderNumber && o.orderNumber.toLowerCase().includes(s)) ||
      (o.title && o.title.toLowerCase().includes(s)) ||
      (o.location && o.location.toLowerCase().includes(s)) ||
      (o.fullDescription && o.fullDescription.toLowerCase().includes(s))
    );
  }

  if (startDate) {
    orders = orders.filter(o => o.eventDate >= startDate);
  }
  if (endDate) {
    orders = orders.filter(o => o.eventDate <= endDate);
  }

  res.json(orders);
});

app.get('/api/orders/:id', (req, res) => {
  const order = db.getOrderById(req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  res.json(order);
});

app.post('/api/orders', (req, res) => {
  const orderData = req.body;
  if (!orderData.title) {
    return res.status(400).json({ error: 'Title is required' });
  }

  const id = orderData.id || `ord-${Date.now()}`;
  const newOrder = {
    id,
    orderNumber: orderData.orderNumber || `มรภ.นว. ${Math.floor(1000 + Math.random() * 9000)}/2569`,
    title: orderData.title,
    fullDescription: orderData.fullDescription || orderData.title,
    signDate: orderData.signDate || new Date().toISOString().split('T')[0],
    eventDate: orderData.eventDate || new Date().toISOString().split('T')[0],
    eventDateDisplay: orderData.eventDateDisplay || orderData.eventDate,
    eventTime: orderData.eventTime || '08:30 - 16:30 น.',
    location: orderData.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์',
    category: orderData.category || 'บริการวิชาการแก่สังคม',
    categoryCode: orderData.categoryCode || 'service',
    score: Number(orderData.score) || 1.0,
    facultyId: orderData.facultyId || 'fac-pimra',
    facultyAssigned: orderData.facultyAssigned || [],
    status: orderData.status || 'upcoming',
    actualPhotos: orderData.actualPhotos || [],
    evidenceFiles: orderData.evidenceFiles || [],
    ePortfolio: orderData.ePortfolio || {
      year: '2569',
      round: 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
      topic: orderData.title,
      workloadRef: `ภาระงานตามเกณฑ์ มรภ.นว. (${orderData.score || 1.0} ภาระงาน)`,
      status: 'ready_to_export'
    }
  };

  db.addOrder(newOrder);
  res.status(201).json(newOrder);
});

app.put('/api/orders/:id', (req, res) => {
  const updated = db.updateOrder(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.json(updated);
});

app.delete('/api/orders/:id', (req, res) => {
  const ok = db.deleteOrder(req.params.id);
  if (!ok) return res.status(404).json({ error: 'Order not found' });
  res.json({ success: true, id: req.params.id });
});

// ----------------------------------------------------
// 4. File Upload (Photo Evidence / Documents)
// ----------------------------------------------------
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const host = db.getTunnelUrl() || `http://localhost:${PORT}`;
  const relativePath = `/uploads/${req.file.filename}`;
  const absoluteUrl = `${host}${relativePath}`;

  res.json({
    success: true,
    file: {
      name: req.file.originalname,
      filename: req.file.filename,
      size: `${(req.file.size / 1024).toFixed(1)} KB`,
      mimetype: req.file.mimetype,
      url: relativePath,
      absoluteUrl: absoluteUrl,
      uploadedAt: new Date().toISOString()
    }
  });
});

// ----------------------------------------------------
// 5. Live RFC 5545 iCal Feed Generator
// ----------------------------------------------------
app.get('/api/calendar/feed/:facultyId.ics', (req, res) => {
  const { facultyId } = req.params;
  const faculty = db.getFaculties().find(f => f.id === facultyId) || { name: 'คณาจารย์ มรภ.นครสวรรค์' };
  const orders = db.getOrders(facultyId);

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NSRU//UniWorkload AI RFC5545 Engine v2.8//TH',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:ภาระงาน มรภ.นว. - ${faculty.name}`,
    'X-WR-TIMEZONE:Asia/Bangkok',
    'X-WR-CALDESC:ปฏิทินภาระงานและคำสั่งราชการ มหาวิทยาลัยราชภัฏนครสวรรค์'
  ];

  orders.forEach(order => {
    if (!order.eventDate) return;
    const cleanDate = order.eventDate.replace(/-/g, '');
    const dtstart = `${cleanDate}T083000`;
    const dtend = `${cleanDate}T163000`;
    const uid = `uniworkload-${order.id}@nsru.ac.th`;
    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;TZID=Asia/Bangkok:${dtstart}`);
    lines.push(`DTEND;TZID=Asia/Bangkok:${dtend}`);
    lines.push(`SUMMARY:[${order.orderNumber}] ${order.title.replace(/\n/g, ' ')}`);
    lines.push(`LOCATION:${(order.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์').replace(/\n/g, ' ')}`);
    lines.push(`DESCRIPTION:คำสั่ง: ${order.orderNumber}\\nหมวดหมู่: ${order.category || ''}\\nคะแนนภาระงาน: ${order.score || 0} แต้ม\\nสถานะหลักฐาน: ${order.actualPhotos && order.actualPhotos.length ? 'มีรูปแนบแล้ว' : 'รอภาพหลักฐาน'}`);
    lines.push(`STATUS:${order.status === 'done' ? 'CONFIRMED' : 'TENTATIVE'}`);
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `inline; filename="workload_${facultyId}.ics"`);
  res.send(lines.join('\r\n'));
});

// ----------------------------------------------------
// 6. Report Export (แบบ ป.5 Structure)
// ----------------------------------------------------
app.get('/api/export/p-o-5/:facultyId', (req, res) => {
  const { facultyId } = req.params;
  const faculty = db.getFaculties().find(f => f.id === facultyId);
  const orders = db.getOrders(facultyId);

  const teachingOrders = orders.filter(o => o.categoryCode === 'teaching');
  const serviceOrders = orders.filter(o => o.categoryCode === 'service');
  const researchOrders = orders.filter(o => o.categoryCode === 'research');
  const artsOrders = orders.filter(o => o.categoryCode === 'arts');
  const adminOrders = orders.filter(o => o.categoryCode === 'admin');
  const qaOrders = orders.filter(o => o.categoryCode === 'qa');

  const totalScore = orders.reduce((sum, o) => sum + (Number(o.score) || 0), 0);

  res.json({
    university: 'มหาวิทยาลัยราชภัฏนครสวรรค์',
    form: 'แบบประเมินผลการปฏิบัติงานของบุคลากรมหาวิทยาลัยราชภัฏนครสวรรค์ ตำแหน่งประเภทวิชาการ (แบบ ป.5)',
    faculty,
    round: 'รอบประเมิน ครั้งที่ 2/2569 (1 เม.ย. - 30 ก.ย. 2569)',
    summary: {
      totalItems: orders.length,
      totalScore: Number(totalScore.toFixed(2)),
      byCategory: {
        teaching: { count: teachingOrders.length, score: teachingOrders.reduce((s, o) => s + (o.score || 0), 0) },
        service: { count: serviceOrders.length, score: serviceOrders.reduce((s, o) => s + (o.score || 0), 0) },
        research: { count: researchOrders.length, score: researchOrders.reduce((s, o) => s + (o.score || 0), 0) },
        arts: { count: artsOrders.length, score: artsOrders.reduce((s, o) => s + (o.score || 0), 0) },
        admin: { count: adminOrders.length, score: adminOrders.reduce((s, o) => s + (o.score || 0), 0) },
        qa: { count: qaOrders.length, score: qaOrders.reduce((s, o) => s + (o.score || 0), 0) }
      }
    },
    items: orders
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[UniWorkload AI Backend] Running on http://localhost:${PORT}`);
});
