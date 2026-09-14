import seedPimraOrders from './seedPimra.json';

// Realistic Mock Data for UniWorkload AI (NSRU - Faculty of Management Science & Faculty of Science and Technology)

export const WORKLOAD_CATEGORIES = [
  { id: "all", name: "ทุกหมวดหมู่งาน", code: "ALL", color: "slate" },
  { id: "teaching", name: "การจัดการเรียนการสอน", code: "กพอ.1", color: "amber" },
  { id: "research", name: "งานวิจัยและงานสร้างสรรค์", code: "กพอ.2", color: "indigo" },
  { id: "service", name: "บริการวิชาการแก่สังคม", code: "กพอ.3", color: "emerald" },
  { id: "arts", name: "ทำนุบำรุงศิลปวัฒนธรรม", code: "กพอ.4", color: "rose" },
  { id: "admin", name: "บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย", code: "กพอ.5", color: "purple" },
  { id: "qa", name: "ประกันคุณภาพการศึกษา", code: "กพอ.6", color: "blue" }
];

export const FACULTY_MEMBERS = [
  {
    id: "fac-pimra",
    name: "อ.พิมรา ทองแสง",
    role: "อาจารย์ / รองผู้อำนวยการ",
    department: "สาขาวิชาสาธารณสุขศาสตร์",
    faculty: "คณะวิทยาศาสตร์และเทคโนโลยี",
    email: "pimra.t@nsru.ac.th",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    icalFeedUrl: "webcal://uniworkload.nsru.ac.th/api/calendar/feed/fac-pimra.ics",
    stats: {
      totalOrders: 42,
      completedOrders: 36,
      pendingOrders: 6,
      totalHours: 112.6,
      evidenceReadyPct: 88,
    }
  },
  {
    id: "fac-1",
    name: "อ.ธนภัทร สุขเกษม (tie)",
    role: "อาจารย์ประจำหลักสูตรเทคโนโลยีสารสนเทศ",
    department: "สาขาวิชาเทคโนโลยีสารสนเทศ",
    faculty: "คณะวิทยาการจัดการ",
    email: "thanaphat.s@nsru.ac.th",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    icalFeedUrl: "webcal://uniworkload.nsru.ac.th/api/v1/ical/tie-84920.ics",
    stats: {
      totalOrders: 18,
      completedOrders: 15,
      pendingOrders: 3,
      totalHours: 56.5,
      evidenceReadyPct: 92,
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
    icalFeedUrl: "webcal://uniworkload.nsru.ac.th/api/v1/ical/somchai-19284.ics",
    stats: {
      totalOrders: 24,
      completedOrders: 21,
      pendingOrders: 3,
      totalHours: 68.0,
      evidenceReadyPct: 94,
    }
  },
  {
    id: "fac-3",
    name: "อ.วรัญญา ประเสริฐสุข",
    role: "อาจารย์ประจำหลักสูตรนิเทศศาสตร์",
    department: "สาขาวิชานิเทศศาสตร์",
    faculty: "คณะวิทยาการจัดการ",
    email: "waranya.p@nsru.ac.th",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    icalFeedUrl: "webcal://uniworkload.nsru.ac.th/api/v1/ical/waranya-37291.ics",
    stats: {
      totalOrders: 12,
      completedOrders: 10,
      pendingOrders: 2,
      totalHours: 35.0,
      evidenceReadyPct: 85,
    }
  }
];

export const INITIAL_ORDERS = [
  ...seedPimraOrders,
  // --- ปีการศึกษา 2569 (ปัจจุบัน) ---
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
    categoryColor: "emerald",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "ประธานกรรมการฝ่ายพัฒนาระบบและโสตทัศนูปกรณ์" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ที่ปรึกษาโครงการและวิทยากรบรรยายพิเศษ" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "กรรมการฝ่ายประชาสัมพันธ์และสื่อสารองค์กร" }
    ],
    status: "upcoming", // upcoming | done | pending_evidence
    evidenceFiles: [
      { id: "ev-1", name: "คำสั่งแต่งตั้ง_1042_2569.pdf", size: "1.2 MB", type: "pdf", uploadedAt: "2026-08-16" }
    ],
    actualPhotos: [],
    ePortfolio: {
      year: "2569",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
      topic: "ประธานกรรมการฝ่ายพัฒนาระบบและโสตทัศนูปกรณ์ โครงการสัมมนาเชิงปฏิบัติการ นวัตกรรม AI เพื่อธุรกิจดิจิทัล 2026",
      workloadRef: "ภาระงานด้านบริการวิชาการแก่สังคม (กพอ.3)",
      status: "ready_to_export"
    }
  },
  {
    id: "ord-0895",
    orderNumber: "มรภ.นว. 0895/2569",
    title: "แต่งตั้งคณะกรรมการตรวจประเมินคุณภาพการศึกษาภายในระดับหลักสูตร ประจำปีการศึกษา 2568",
    signDate: "2026-07-20",
    eventDate: "2026-09-08",
    eventTime: "09:00 - 15:00 น.",
    location: "ห้องประชุมเกียรติยศ ชั้น 3 อาคาร 14",
    category: "ประกันคุณภาพการศึกษา",
    categoryCode: "qa",
    categoryColor: "blue",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการและเลขานุการ" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ประธานกรรมการตรวจประเมิน" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-2", name: "คำสั่ง_0895_2569_AQA.pdf", size: "2.4 MB", type: "pdf", uploadedAt: "2026-07-22" }
    ],
    actualPhotos: [
      {
        id: "ph-1",
        name: "ภาพบรรยากาศการตรวจประเมิน_0809.jpg",
        size: "2.8 MB",
        url: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2026-09-08",
        note: "อ.ธนภัทร และคณะกรรมการร่วมประชุมเปิดการตรวจประเมินหลักสูตร"
      },
      {
        id: "ph-2",
        name: "ภาพสรุปผลคะแนนการประเมิน.jpg",
        size: "1.9 MB",
        url: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2026-09-08",
        note: "การนำเสนอผลการประเมินตนเอง (SAR) ต่อผู้ประเมินภายนอก"
      }
    ],
    ePortfolio: {
      year: "2569",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
      topic: "กรรมการและเลขานุการ ตรวจประเมินคุณภาพการศึกษาภายในระดับหลักสูตร 2568",
      workloadRef: "ภาระงานด้านการประกันคุณภาพการศึกษา (กพอ.6)",
      status: "completed"
    }
  },
  {
    id: "ord-1120",
    orderNumber: "คก. 1120/2569",
    title: "มอบหมายภารกิจอาจารย์นิเทศก์ ติดตามนักศึกษาฝึกงานและสหกิจศึกษา ภาคการศึกษาที่ 1/2569",
    signDate: "2026-08-28",
    eventDate: "2026-09-25",
    eventTime: "10:00 - 16:00 น.",
    location: "สถานประกอบการ จ.นครสวรรค์ และ จ.พิษณุโลก",
    category: "การจัดการเรียนการสอน",
    categoryCode: "teaching",
    categoryColor: "amber",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "อาจารย์นิเทศก์ประจำเขตพื้นที่นครสวรรค์" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "อาจารย์นิเทศก์ประจำเขตพื้นที่พิษณุโลก" }
    ],
    status: "upcoming",
    evidenceFiles: [
      { id: "ev-3", name: "คำสั่งนิเทศก์สหกิจ_1120_2569.pdf", size: "1.7 MB", type: "pdf", uploadedAt: "2026-08-30" }
    ],
    actualPhotos: [],
    ePortfolio: {
      year: "2569",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
      topic: "อาจารย์นิเทศก์ ติดตามและประเมินผลนักศึกษาปฏิบัติงานสหกิจศึกษา ภาคเรียนที่ 1/2569",
      workloadRef: "ภาระงานสอนและการพัฒนานักศึกษา / กิจการนักศึกษาและสหกิจศึกษา (กพอ.1)",
      status: "pending_task"
    }
  },
  {
    id: "ord-0750",
    orderNumber: "มรภ.นว. 0750/2569",
    title: "คณะกรรมการดำเนินงานปฐมนิเทศนักศึกษาใหม่ ประจำปีการศึกษา 2569",
    signDate: "2026-06-10",
    eventDate: "2026-06-25",
    eventTime: "08:00 - 12:00 น.",
    location: "หอประชุมใหญ่ อาคาร 4 มหาวิทยาลัยราชภัฏนครสวรรค์",
    category: "บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย",
    categoryCode: "admin",
    categoryColor: "purple",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการฝ่ายต้อนรับและลงทะเบียนดิจิทัล" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "กรรมการร่วมพิธีเปิด" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "พิธีกรดำเนินรายการ" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-4", name: "คำสั่งปฐมนิเทศ_0750_2569.pdf", size: "1.9 MB", type: "pdf", uploadedAt: "2026-06-12" }
    ],
    actualPhotos: [
      {
        id: "ph-3",
        name: "ภาพลงทะเบียนนักศึกษาใหม่.jpg",
        size: "2.1 MB",
        url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2026-06-25",
        note: "จุดต้อนรับนักศึกษาใหม่และแนะนำการใช้งานระบบสารสนเทศ"
      }
    ],
    ePortfolio: {
      year: "2569",
      round: "รอบ 1 (1 ต.ค. 2568 - 31 มี.ค. 2569)",
      topic: "กรรมการฝ่ายต้อนรับและลงทะเบียนดิจิทัล งานปฐมนิเทศนักศึกษาใหม่ มหาวิทยาลัยราชภัฏนครสวรรค์",
      workloadRef: "ภาระงานกิจการนักศึกษาและทำนุบำรุงวัฒนธรรม (กพอ.5)",
      status: "completed"
    }
  },

  // --- ปีการศึกษา 2567 (รองรับช่วง 1 มกราคม 2567 – 25 มิถุนายน 2567 ตามตัวอย่าง) ---
  {
    id: "ord-2567-01",
    orderNumber: "มรภ.นว. 0152/2567",
    title: "แต่งตั้งคณะกรรมการจัดกิจกรรมสัมมนาเครือข่ายความร่วมมือทางวิชาการและวิจัยระดับชาติ 2567",
    signDate: "2024-01-20",
    eventDate: "2024-02-14",
    eventTime: "08:30 - 16:30 น.",
    location: "ศูนย์ประชุม มหาวิทยาลัยราชภัฏนครสวรรค์",
    category: "บริการวิชาการแก่สังคม",
    categoryCode: "service",
    categoryColor: "emerald",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "ประธานฝ่ายเทคโนโลยีสารสนเทศและถ่ายทอดสด" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ประธานฝ่ายประสานงานวิชาการ" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-2567-1", name: "คำสั่ง_0152_2567.pdf", size: "1.8 MB", type: "pdf", uploadedAt: "2024-01-22" }
    ],
    actualPhotos: [
      {
        id: "ph-2567-1a",
        name: "ภาพถ่ายหน้างานสัมมนาเครือข่ายวิชาการ_14022567.jpg",
        size: "3.2 MB",
        url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2024-02-14",
        note: "อ.ธนภัทร ควบคุมระบบถ่ายทอดสดและระบบโสตทัศนูปกรณ์ตลอดการจัดงาน"
      },
      {
        id: "ph-2567-1b",
        name: "ภาพถ่ายมอบของที่ระลึกแก่วิทยากร.jpg",
        size: "2.8 MB",
        url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2024-02-14",
        note: "ถ่ายภาพร่วมกับคณะวิทยากรและผู้บริหารสถาบันเครือข่าย"
      }
    ],
    ePortfolio: {
      year: "2567",
      round: "รอบ 1 (1 ต.ค. 2566 - 31 มี.ค. 2567)",
      topic: "ประธานฝ่ายเทคโนโลยีและถ่ายทอดสด สัมมนาเครือข่ายวิชาการและวิจัยระดับชาติ 2567",
      workloadRef: "ภาระงานด้านบริการวิชาการแก่สังคม (กพอ.3)",
      status: "completed"
    }
  },
  {
    id: "ord-2567-02",
    orderNumber: "คก. 0318/2567",
    title: "แต่งตั้งคณะทำงานขับเคลื่อนงานวิจัยชุมชนและฐานข้อมูลดิจิทัลภูมิปัญญาท้องถิ่นปากน้ำโพ",
    signDate: "2024-04-18",
    eventDate: "2024-05-20",
    eventTime: "09:00 - 16:00 น.",
    location: "ศูนย์การเรียนรู้ชุมชนบ้านเกยไชย อ.ชุมแสง จ.นครสวรรค์",
    category: "งานวิจัยและงานสร้างสรรค์",
    categoryCode: "research",
    categoryColor: "indigo",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "นักวิจัยร่วมและหัวหน้าฝ่ายพัฒนาระบบคลังข้อมูลดิจิทัล" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "หัวหน้าโครงการวิจัย" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "นักวิจัยฝ่ายสื่อสร้างสรรค์" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-2567-2", name: "คำสั่งแต่งตั้งคณะทำงานวิจัย_0318_2567.pdf", size: "1.4 MB", type: "pdf", uploadedAt: "2024-04-20" }
    ],
    actualPhotos: [
      {
        id: "ph-2567-2a",
        name: "ภาพลงพื้นที่เก็บข้อมูลภาคสนามชุมชนปากน้ำโพ.jpg",
        size: "4.1 MB",
        url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2024-05-20",
        note: "สัมภาษณ์ปราชญ์ชาวบ้านและสำรวจข้อมูลเพื่อจัดทำฐานข้อมูลดิจิทัล"
      }
    ],
    ePortfolio: {
      year: "2567",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2567)",
      topic: "นักวิจัยร่วมและพัฒนาระบบคลังข้อมูลดิจิทัลชุมชนปากน้ำโพ 2567",
      workloadRef: "ภาระงานด้านการวิจัยและงานสร้างสรรค์ (กพอ.2)",
      status: "completed"
    }
  },
  {
    id: "ord-2567-03",
    orderNumber: "มรภ.นว. 0540/2567",
    title: "คณะกรรมการพัฒนาปรับปรุงหลักสูตรวิทยาศาสตรบัณฑิต สาขาวิชาเทคโนโลยีสารสนเทศ พ.ศ. 2567",
    signDate: "2024-05-28",
    eventDate: "2024-06-12",
    eventTime: "09:00 - 17:00 น.",
    location: "ห้องประชุมสารสนเทศ อาคาร 14 ชั้น 2",
    category: "การจัดการเรียนการสอน",
    categoryCode: "teaching",
    categoryColor: "amber",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการและเลขานุการคณะกรรมการพัฒนาหลักสูตร" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ประธานคณะกรรมการพัฒนาหลักสูตร" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-2567-3", name: "คำสั่งพัฒนาหลักสูตร_0540_2567.pdf", size: "2.1 MB", type: "pdf", uploadedAt: "2024-06-01" }
    ],
    actualPhotos: [
      {
        id: "ph-2567-3a",
        name: "ภาพการประชุมพิจารณาโครงสร้างหลักสูตรกับผู้ทรงคุณวุฒิ.jpg",
        size: "3.5 MB",
        url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2024-06-12",
        note: "ประชุมวิพากษ์หลักสูตร IT ฉบับปรับปรุงร่วมกับผู้ทรงคุณวุฒิภายนอก"
      }
    ],
    ePortfolio: {
      year: "2567",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2567)",
      topic: "กรรมการและเลขานุการ พัฒนาหลักสูตร วท.บ. เทคโนโลยีสารสนเทศ ฉบับปรับปรุง พ.ศ. 2567",
      workloadRef: "ภาระงานด้านการจัดการเรียนการสอน (กพอ.1)",
      status: "completed"
    }
  },
  {
    id: "ord-2567-04",
    orderNumber: "มรภ.นว. 0992/2567",
    title: "คณะกรรมการจัดงานวันสถาปนามหาวิทยาลัยราชภัฏนครสวรรค์และพิธีทำบุญตักบาตร ประจำปี 2567",
    signDate: "2024-10-10",
    eventDate: "2024-10-25",
    eventTime: "07:30 - 12:00 น.",
    location: "ลานกิจกรรมอนุสรณ์สถาน มหาวิทยาลัยราชภัฏนครสวรรค์",
    category: "ทำนุบำรุงศิลปวัฒนธรรม",
    categoryCode: "arts",
    categoryColor: "rose",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการฝ่ายพิธีการสงฆ์และจัดสถานที่" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "กรรมการร่วมพิธี" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-2567-4", name: "คำสั่งวันสถาปนา_0992_2567.pdf", size: "1.5 MB", type: "pdf", uploadedAt: "2024-10-12" }
    ],
    actualPhotos: [
      {
        id: "ph-2567-4a",
        name: "ภาพบรรยากาศพิธีทำบุญตักบาตรวันสถาปนา.jpg",
        size: "2.9 MB",
        url: "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80",
        uploadedAt: "2024-10-25",
        note: "ร่วมพิธีสงฆ์และจัดเตรียมสถานที่ต้อนรับแขกผู้มีเกียรติ"
      }
    ],
    ePortfolio: {
      year: "2568",
      round: "รอบ 1 (1 ต.ค. 2567 - 31 มี.ค. 2568)",
      topic: "กรรมการฝ่ายพิธีการ งานวันสถาปนามหาวิทยาลัยราชภัฏนครสวรรค์ 2567",
      workloadRef: "ภาระงานด้านทำนุบำรุงศิลปวัฒนธรรม (กพอ.4)",
      status: "completed"
    }
  }
];

export const DEMO_RAW_ORDERS = [
  {
    id: "raw-ocr-1",
    filename: "คำสั่งแต่งตั้ง_โครงการวิจัยชุมชน_2569.pdf",
    source: "PDF Official Document",
    detectedConfidence: 98.4,
    detectedText: `คำสั่งมหาวิทยาลัยราชภัฏนครสวรรค์ ที่ 1299/2569
เรื่อง แต่งตั้งคณะทำงานขับเคลื่อนโครงการยกระดับเศรษฐกิจชุมชนด้วยนวัตกรรมดิจิทัล

ด้วย มหาวิทยาลัยราชภัฏนครสวรรค์ มีพันธกิจในการพัฒนาท้องถิ่น...
กำหนดจัดขึ้นในวันที่ 28 กันยายน 2569 เวลา 09.00 - 16.30 น.
ณ ศูนย์การเรียนรู้ชุมชนบ้านเกยไชย อ.ชุมแสง จ.นครสวรรค์

จึงแต่งตั้งบุคลากรดังต่อไปนี้:
1. ผศ.ดร.สมชาย ใจดี — หัวหน้าคณะทำงาน
2. อ.ธนภัทร สุขเกษม — คณะทำงานฝ่ายระบบสารสนเทศชุมชน
3. อ.วรัญญา ประเสริฐสุข — คณะทำงานฝ่ายสื่อประชาสัมพันธ์ชุมชน

สั่ง ณ วันที่ 1 กันยายน พ.ศ. 2569`,
    parsedData: {
      orderNumber: "มรภ.นว. 1299/2569",
      title: "แต่งตั้งคณะทำงานขับเคลื่อนโครงการยกระดับเศรษฐกิจชุมชนด้วยนวัตกรรมดิจิทัล",
      signDate: "2026-09-01",
      eventDate: "2026-09-28",
      eventTime: "09:00 - 16:30 น.",
      location: "ศูนย์การเรียนรู้ชุมชนบ้านเกยไชย อ.ชุมแสง จ.นครสวรรค์",
      category: "งานวิจัยและงานสร้างสรรค์",
      categoryCode: "research",
      categoryColor: "indigo",
      facultyAssigned: [
        { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "หัวหน้าคณะทำงาน" },
        { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "คณะทำงานฝ่ายระบบสารสนเทศชุมชน" },
        { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "คณะทำงานฝ่ายสื่อประชาสัมพันธ์ชุมชน" }
      ]
    }
  },
  {
    id: "raw-ocr-2",
    filename: "คำสั่งอบรมสัมมนา_AI_BigData_2569.pdf",
    source: "PDF Scanned Document (คำสั่งบริการวิชาการ)",
    detectedConfidence: 97.2,
    detectedText: `คำสั่งคณะวิทยาศาสตร์และเทคโนโลยี ที่ 1042/2569
เรื่อง แต่งตั้งคณะทำงานจัดโครงการอบรมเชิงปฏิบัติการ Generative AI และ Data Analytics สำหรับครูและบุคลากรทางการศึกษา

เพื่อให้การจัดโครงการดำเนินไปด้วยความเรียบร้อยและบรรลุวัตถุประสงค์...
กำหนดจัดขึ้นในวันที่ 18 กันยายน 2569 เวลา 08.30 - 16.30 น.
ณ ห้องปฏิบัติการคอมพิวเตอร์ 14102 ชั้น 4 อาคาร 14

จึงแต่งตั้งบุคลากรดังต่อไปนี้:
1. อ.ธนภัทร สุขเกษม — วิทยากรหลักและผู้ดูแลระบบปฏิบัติการ
2. ผศ.ดร.สมชาย ใจดี — ที่ปรึกษาโครงการ
3. อ.วรัญญา ประเสริฐสุข — ผู้ช่วยวิทยากรและประสานงาน

สั่ง ณ วันที่ 25 สิงหาคม พ.ศ. 2569`,
    parsedData: {
      orderNumber: "คก. 1042/2569",
      title: "แต่งตั้งคณะทำงานจัดโครงการอบรมเชิงปฏิบัติการ Generative AI และ Data Analytics สำหรับครูและบุคลากรทางการศึกษา",
      signDate: "2026-08-25",
      eventDate: "2026-09-18",
      eventTime: "08:30 - 16:30 น.",
      location: "ห้องปฏิบัติการคอมพิวเตอร์ 14102 ชั้น 4 อาคาร 14",
      category: "บริการวิชาการแก่สังคม",
      categoryCode: "service",
      categoryColor: "emerald",
      facultyAssigned: [
        { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "วิทยากรหลักและผู้ดูแลระบบปฏิบัติการ" },
        { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ที่ปรึกษาโครงการ" },
        { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "ผู้ช่วยวิทยากรและประสานงาน" }
      ]
    }
  },
  {
    id: "raw-ocr-3",
    filename: "คำสั่งตรวจประกันคุณภาพ_2569.jpg",
    source: "Mobile Camera Photo (คำสั่งประกันคุณภาพ)",
    detectedConfidence: 96.0,
    detectedText: `คำสั่งมหาวิทยาลัยราชภัฏนครสวรรค์ ที่ 0895/2569
เรื่อง แต่งตั้งคณะกรรมการตรวจประเมินคุณภาพการศึกษาภายใน ระดับหลักสูตร ประจำปีการศึกษา 2568

กำหนดการตรวจประเมินในวันที่ 8 กันยายน 2569 เวลา 09.00 - 16.30 น.
ณ ห้องประชุมราชพฤกษ์ ชั้น 2 สำนักงานอธิการบดี

แต่งตั้ง:
1. ผศ.ดร.สมชาย ใจดี — ประธานกรรมการตรวจประเมิน
2. อ.ธนภัทร สุขเกษม — กรรมการและเลขานุการ

สั่ง ณ วันที่ 20 สิงหาคม พ.ศ. 2569`,
    parsedData: {
      orderNumber: "มรภ.นว. 0895/2569",
      title: "แต่งตั้งคณะกรรมการตรวจประเมินคุณภาพการศึกษาภายใน ระดับหลักสูตร ประจำปีการศึกษา 2568",
      signDate: "2026-08-20",
      eventDate: "2026-09-08",
      eventTime: "09:00 - 16:30 น.",
      location: "ห้องประชุมราชพฤกษ์ ชั้น 2 สำนักงานอธิการบดี",
      category: "ประกันคุณภาพการศึกษา",
      categoryCode: "qa",
      categoryColor: "purple",
      facultyAssigned: [
        { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ประธานกรรมการตรวจประเมิน" },
        { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการและเลขานุการ" }
      ]
    }
  }
];

