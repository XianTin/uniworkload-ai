// Realistic Mock Data for UniWorkload AI (NSRU - Faculty of Management Science)

export const FACULTY_MEMBERS = [
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
      totalOrders: 14,
      completedOrders: 11,
      pendingOrders: 3,
      totalHours: 42.5,
      evidenceReadyPct: 88,
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
      totalOrders: 21,
      completedOrders: 18,
      pendingOrders: 3,
      totalHours: 58.0,
      evidenceReadyPct: 92,
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
      totalOrders: 9,
      completedOrders: 7,
      pendingOrders: 2,
      totalHours: 29.0,
      evidenceReadyPct: 80,
    }
  }
];

export const INITIAL_ORDERS = [
  {
    id: "ord-1042",
    orderNumber: "คก. ๑๐๔๒/๒๕๖๙",
    title: "แต่งตั้งคณะกรรมการจัดโครงการสัมมนาเชิงปฏิบัติการ นวัตกรรม AI เพื่อธุรกิจดิจิทัล 2026",
    signDate: "2026-08-15",
    eventDate: "2026-09-18",
    eventTime: "08:30 - 16:30 น.",
    location: "ห้องประชุม ๑๔๑๐๒ ชั้น ๔ อาคารวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์",
    category: "วิชาการ/บริการวิชาการ",
    categoryColor: "emerald",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "ประธานกรรมการฝ่ายพัฒนาระบบและโสตทัศนูปกรณ์" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ที่ปรึกษาโครงการและวิทยากรบรรยายพิเศษ" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "กรรมการฝ่ายประชาสัมพันธ์และสื่อสารองค์กร" }
    ],
    status: "upcoming", // upcoming | done | pending_evidence
    evidenceFiles: [
      { id: "ev-1", name: "คำสั่งแต่งตั้ง_๑๐๔๒_๒๕๖๙.pdf", size: "1.2 MB", type: "pdf", uploadedAt: "2026-08-16" }
    ],
    actualPhotos: [],
    ePortfolio: {
      year: "2569",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
      topic: "ประธานกรรมการฝ่ายพัฒนาระบบและโสตทัศนูปกรณ์ โครงการสัมมนาเชิงปฏิบัติการ นวัตกรรม AI เพื่อธุรกิจดิจิทัล 2026",
      workloadRef: "ภาระงานด้านบริการวิชาการ / คณะกรรมการจัดโครงการตามคำสั่งมหาวิทยาลัย",
      status: "ready_to_export"
    }
  },
  {
    id: "ord-0895",
    orderNumber: "มรภ.นว. ๐๘๙๕/๒๕๖๙",
    title: "แต่งตั้งคณะกรรมการตรวจประเมินคุณภาพการศึกษาภายในระดับหลักสูตร ประจำปีการศึกษา 2568",
    signDate: "2026-07-20",
    eventDate: "2026-09-08",
    eventTime: "09:00 - 15:00 น.",
    location: "ห้องประชุมเกียรติยศ ชั้น ๓ อาคาร ๑๔",
    category: "ประกันคุณภาพการศึกษา",
    categoryColor: "blue",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการและเลขานุการ" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "ประธานกรรมการตรวจประเมิน" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-2", name: "คำสั่ง_๐๘๙๕_๒๕๖๙_AQA.pdf", size: "2.4 MB", type: "pdf", uploadedAt: "2026-07-22" }
    ],
    actualPhotos: [
      { id: "ph-1", name: "ภาพบรรยากาศการตรวจประเมิน_0809.jpg", size: "3.8 MB", url: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?w=500&auto=format&fit=crop&q=80" },
      { id: "ph-2", name: "ใบลงทะเบียนผู้เข้าร่วมประชุม.pdf", size: "890 KB", url: null }
    ],
    ePortfolio: {
      year: "2569",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
      topic: "กรรมการและเลขานุการ คณะกรรมการตรวจประเมินคุณภาพการศึกษาภายในระดับหลักสูตร วิทยาการจัดการ มรภ.นครสวรรค์",
      workloadRef: "งานด้านการประกันคุณภาพการศึกษาและมาตรฐานวิชาการ",
      status: "completed"
    }
  },
  {
    id: "ord-1120",
    orderNumber: "คก. ๑๑๒๐/๒๕๖๙",
    title: "มอบหมายภารกิจอาจารย์นิเทศก์ ติดตามนักศึกษาฝึกงานและสหกิจศึกษา ภาคการศึกษาที่ 1/2569",
    signDate: "2026-08-28",
    eventDate: "2026-09-25",
    eventTime: "10:00 - 16:00 น.",
    location: "สถานประกอบการ จ.นครสวรรค์ และ จ.พิษณุโลก",
    category: "การเรียนการสอนและพัฒนานักศึกษา",
    categoryColor: "amber",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "อาจารย์นิเทศก์ประจำเขตพื้นที่นครสวรรค์" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "อาจารย์นิเทศก์ประจำเขตพื้นที่พิษณุโลก" }
    ],
    status: "upcoming",
    evidenceFiles: [
      { id: "ev-3", name: "คำสั่งนิเทศก์สหกิจ_๑๑๒๐_๒๕๖๙.pdf", size: "1.7 MB", type: "pdf", uploadedAt: "2026-08-30" }
    ],
    actualPhotos: [],
    ePortfolio: {
      year: "2569",
      round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
      topic: "อาจารย์นิเทศก์ ติดตามและประเมินผลนักศึกษาปฏิบัติงานสหกิจศึกษา ภาคเรียนที่ 1/2569",
      workloadRef: "ภาระงานสอนและการพัฒนานักศึกษา / กิจการนักศึกษาและสหกิจศึกษา",
      status: "pending_task"
    }
  },
  {
    id: "ord-0750",
    orderNumber: "มรภ.นว. ๐๗๕๐/๒๕๖๙",
    title: "คณะกรรมการดำเนินงานปฐมนิเทศนักศึกษาใหม่ ประจำปีการศึกษา 2569",
    signDate: "2026-06-10",
    eventDate: "2026-06-25",
    eventTime: "08:00 - 12:00 น.",
    location: "หอประชุมใหญ่ อาคาร ๔",
    category: "พัฒนานักศึกษา",
    categoryColor: "purple",
    facultyAssigned: [
      { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "กรรมการฝ่ายต้อนรับและลงทะเบียนดิจิทัล" },
      { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "กรรมการร่วมพิธีเปิด" },
      { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "พิธีกรดำเนินรายการ" }
    ],
    status: "done",
    evidenceFiles: [
      { id: "ev-4", name: "คำสั่งปฐมนิเทศ_๐๗๕๐_๒๕๖๙.pdf", size: "1.9 MB", type: "pdf", uploadedAt: "2026-06-12" }
    ],
    actualPhotos: [
      { id: "ph-3", name: "ภาพลงทะเบียนนักศึกษา.jpg", size: "2.1 MB", url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=500&auto=format&fit=crop&q=80" }
    ],
    ePortfolio: {
      year: "2569",
      round: "รอบ 1 (1 ต.ค. 2568 - 31 มี.ค. 2569)",
      topic: "กรรมการฝ่ายต้อนรับและลงทะเบียนดิจิทัล งานปฐมนิเทศนักศึกษาใหม่ มหาวิทยาลัยราชภัฏนครสวรรค์",
      workloadRef: "ภาระงานกิจการนักศึกษาและทำนุบำรุงวัฒนธรรม",
      status: "completed"
    }
  }
];

export const DEMO_RAW_ORDERS = [
  {
    id: "raw-ocr-1",
    filename: "คำสั่งแต่งตั้ง_โครงการวิจัยชุมชน_๒๕๖๙.pdf",
    source: "PDF Official Document",
    detectedConfidence: 98.4,
    detectedText: `คำสั่งมหาวิทยาลัยราชภัฏนครสวรรค์ ที่ ๑๒๙๙/๒๕๖๙
เรื่อง แต่งตั้งคณะทำงานขับเคลื่อนโครงการยกระดับเศรษฐกิจชุมชนด้วยนวัตกรรมดิจิทัล

ด้วย มหาวิทยาลัยราชภัฏนครสวรรค์ มีพันธกิจในการพัฒนาท้องถิ่น...
กำหนดจัดขึ้นในวันที่ ๒๘ กันยายน ๒๕๖๙ เวลา ๐๙.๐๐ - ๑๖.๓๐ น.
ณ ศูนย์การเรียนรู้ชุมชนบ้านเกยไชย อ.ชุมแสง จ.นครสวรรค์

จึงแต่งตั้งบุคลากรดังต่อไปนี้:
๑. ผศ.ดร.สมชาย ใจดี — หัวหน้าคณะทำงาน
๒. อ.ธนภัทร สุขเกษม — คณะทำงานฝ่ายระบบสารสนเทศชุมชน
๓. อ.วรัญญา ประเสริฐสุข — คณะทำงานฝ่ายสื่อประชาสัมพันธ์ชุมชน

สั่ง ณ วันที่ ๑ กันยายน พ.ศ. ๒๕๖๙`,
    parsedData: {
      orderNumber: "มรภ.นว. ๑๒๙๙/๒๕๖๙",
      title: "แต่งตั้งคณะทำงานขับเคลื่อนโครงการยกระดับเศรษฐกิจชุมชนด้วยนวัตกรรมดิจิทัล",
      signDate: "2026-09-01",
      eventDate: "2026-09-28",
      eventTime: "09:00 - 16:30 น.",
      location: "ศูนย์การเรียนรู้ชุมชนบ้านเกยไชย อ.ชุมแสง จ.นครสวรรค์",
      category: "บริการวิชาการและวิจัย",
      facultyAssigned: [
        { id: "fac-2", name: "ผศ.ดร.สมชาย ใจดี", roleInOrder: "หัวหน้าคณะทำงาน" },
        { id: "fac-1", name: "อ.ธนภัทร สุขเกษม (tie)", roleInOrder: "คณะทำงานฝ่ายระบบสารสนเทศชุมชน" },
        { id: "fac-3", name: "อ.วรัญญา ประเสริฐสุข", roleInOrder: "คณะทำงานฝ่ายสื่อประชาสัมพันธ์ชุมชน" }
      ]
    }
  }
];
