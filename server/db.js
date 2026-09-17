import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, '../data/db.json');
const SEED_PIMRA_PATH = path.join(__dirname, '../data/seed_pimra.json');

// Default initial state
const defaultFaculties = [
  {
    id: "fac-pimra",
    name: "อ.พิมรา ทองแสง",
    role: "อาจารย์ / รองผู้อำนวยการ",
    department: "สาขาวิชาสาธารณสุขศาสตร์",
    faculty: "คณะวิทยาศาสตร์และเทคโนโลยี",
    email: "pimra.t@nsru.ac.th",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    stats: {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalHours: 0,
      evidenceReadyPct: 0,
    }
  },
  {
    id: "fac-1",
    name: "อ.ธนภัทร สุขเกษม",
    role: "อาจารย์ประจำหลักสูตรเทคโนโลยีสารสนเทศ",
    department: "สาขาวิชาเทคโนโลยีสารสนเทศ",
    faculty: "คณะวิทยาการจัดการ",
    email: "thanaphat.s@nsru.ac.th",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    stats: {
      totalOrders: 0,
      completedOrders: 0,
      pendingOrders: 0,
      totalHours: 0,
      evidenceReadyPct: 0,
    }
  },
  {
    id: "fac-2",
    name: "ผศ.ดร.สมชาย ใจดี",
    role: "หัวหน้าสาขาวิชาเทคโนโลยีสารสนเทศ",
    department: "สาขาวิชาเทคโนโลยีสารสนเทศ",
    faculty: "คณะวิทยาการจัดการ",
    email: "somchai.j@nsru.ac.th",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    stats: {
      totalOrders: 24,
      completedOrders: 21,
      pendingOrders: 3,
      totalHours: 68.0,
      evidenceReadyPct: 94,
    }
  }
];

class Database {
  constructor() {
    this.data = {
      faculties: [],
      orders: [],
      tunnelUrl: null
    };
    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        this.data = JSON.parse(raw);
        console.log(`[Database] Loaded ${this.data.orders.length} orders, ${this.data.faculties.length} faculties.`);
      } else {
        this.seed();
      }
    } catch (e) {
      console.error('[Database] Failed to load db.json, reseeding...', e);
      this.seed();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('[Database] Failed to save db.json:', e);
    }
  }

  seed() {
    let pimraOrders = [];
    if (fs.existsSync(SEED_PIMRA_PATH)) {
      try {
        pimraOrders = JSON.parse(fs.readFileSync(SEED_PIMRA_PATH, 'utf-8'));
      } catch (err) {
        console.error('Failed reading seed_pimra.json', err);
      }
    }

    // Default mock orders
    const defaultOrders = [
      {
        id: "ord-1042",
        orderNumber: "คก. 1042/2569",
        title: "แต่งตั้งคณะกรรมการจัดโครงการสัมมนาเชิงปฏิบัติการ นวัตกรรม AI เพื่อธุรกิจดิจิทัล 2026",
        signDate: "2026-08-15",
        eventDate: "2026-09-18",
        eventTime: "08:30 - 16:30 น.",
        location: "ห้องประชุม 14102 ชั้น 4 อาคารวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์",
        category: "บริการวิชาการแก่สังคม",
        categoryCode: "service",
        score: 1.0,
        facultyAssigned: [
          { id: "fac-1", name: "อ.ธนภัทร สุขเกษม", roleInOrder: "ประธานกรรมการฝ่ายพัฒนาระบบ" },
          { id: "fac-pimra", name: "อ.พิมรา ทองแสง", roleInOrder: "วิทยากรร่วม" }
        ],
        status: "done",
        evidenceFiles: [
          { id: "ev-1", name: "คำสั่งแต่งตั้ง_1042_2569.pdf", size: "1.2 MB", type: "pdf", uploadedAt: "2026-08-16" }
        ],
        actualPhotos: [
          {
            id: "photo-seed-1042",
            name: "ภาพสัมมนา_AI.jpg",
            url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80",
            caption: "การบรรยายโครงการนวัตกรรม AI",
            uploadedAt: "2026-09-18"
          }
        ],
        ePortfolio: {
          year: "2569",
          round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
          topic: "ประธานกรรมการฝ่ายพัฒนาระบบ โครงการสัมมนาเชิงปฏิบัติการ นวัตกรรม AI เพื่อธุรกิจดิจิทัล 2026",
          workloadRef: "ภาระงานด้านบริการวิชาการแก่สังคม (กพอ.3)",
          status: "ready_to_export"
        }
      },
      {
        id: "ord-0895",
        orderNumber: "มรภ.นว. 0895/2569",
        title: "แต่งตั้งคณะกรรมการตรวจประเมินคุณภาพการศึกษาภายใน ประจำปีการศึกษา 2568",
        signDate: "2026-07-20",
        eventDate: "2026-09-25",
        eventTime: "09:00 - 16:30 น.",
        location: "ห้องประชุมพระบาง อาคาร 14 ชั้น 2 มหาวิทยาลัยราชภัฏนครสวรรค์",
        category: "ประกันคุณภาพการศึกษา",
        categoryCode: "qa",
        score: 1.0,
        facultyAssigned: [
          { id: "fac-1", name: "อ.ธนภัทร สุขเกษม", roleInOrder: "กรรมการและเลขานุการ" },
          { id: "fac-pimra", name: "อ.พิมรา ทองแสง", roleInOrder: "กรรมการตรวจประเมิน" }
        ],
        status: "upcoming",
        evidenceFiles: [
          { id: "ev-2", name: "คำสั่งแต่งตั้ง_0895_2569.pdf", size: "980 KB", type: "pdf", uploadedAt: "2026-07-22" }
        ],
        actualPhotos: [],
        ePortfolio: {
          year: "2569",
          round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
          topic: "กรรมการและเลขานุการ คณะกรรมการตรวจประเมินคุณภาพการศึกษาภายใน",
          workloadRef: "ภาระงานด้านประกันคุณภาพการศึกษา (กพอ.6)",
          status: "pending_event"
        }
      }
    ];

    this.data = {
      faculties: defaultFaculties,
      orders: [],
      tunnelUrl: null
    };
    this.save();
    console.log(`[Database] Initialized with clean empty state (0 orders).`);
  }

  getFaculties() {
    return this.data.faculties;
  }

  addFaculty(faculty) {
    this.data.faculties.push(faculty);
    this.save();
    return faculty;
  }

  getOrders(facultyId = null) {
    if (!facultyId || facultyId === 'all') {
      return this.data.orders;
    }
    return this.data.orders.filter(ord => {
      if (ord.facultyId === facultyId) return true;
      if (ord.facultyAssigned && ord.facultyAssigned.some(f => f.id === facultyId)) return true;
      return false;
    });
  }

  getOrderById(id) {
    return this.data.orders.find(o => o.id === id);
  }

  addOrder(order) {
    this.data.orders.unshift(order);
    this.save();
    return order;
  }

  updateOrder(id, updates) {
    const idx = this.data.orders.findIndex(o => o.id === id);
    if (idx !== -1) {
      this.data.orders[idx] = { ...this.data.orders[idx], ...updates };
      this.save();
      return this.data.orders[idx];
    }
    return null;
  }

  deleteOrder(id) {
    const prevLen = this.data.orders.length;
    this.data.orders = this.data.orders.filter(o => o.id !== id);
    if (this.data.orders.length !== prevLen) {
      this.save();
      return true;
    }
    return false;
  }

  setTunnelUrl(url) {
    this.data.tunnelUrl = url;
    this.save();
  }

  getTunnelUrl() {
    return this.data.tunnelUrl;
  }
}

export const db = new Database();
