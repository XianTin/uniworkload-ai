/**
 * Workload Scoring System (ระบบเกณฑ์การให้คะแนนภาระงาน)
 * มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)
 * 
 * 15 เกณฑ์การให้คะแนนภาระงาน:
 * 1. งานสอน: 2.0 คะแนน
 * 2. งานสาขา: 0.25 คะแนน
 * 3. งานคณะ: 0.5 คะแนน
 * 4. งานมหาลัย: 1.0 คะแนน
 * 5. งานอำเภอ: 2.0 คะแนน
 * 6. งานจังหวัด: 3.0 คะแนน
 * 7. งานประเทศ: 4.0 คะแนน
 * 8. วิทยากร ภายใน: 1.0 คะแนน
 * 9. วิทยากร ภายนอก: 2.0 คะแนน
 * 10. กรรมการภายใน: 1.0 คะแนน
 * 11. กรรมการภายนอก: 2.0 คะแนน
 * 12. ไปอบรมพัฒนาตนเอง: 1.0 คะแนน
 * 13. ไปเข้าร่วมงาน: 0.5 คะแนน
 * 14. เขียนตำรา/หนังสือ: 2.0 คะแนน
 * 15. ตีพิมพ์วิจัย: 3.0 คะแนน
 */

export const WORKLOAD_SCORING_CRITERIA = [
  {
    id: "teaching",
    name: "งานสอน",
    score: 2.0,
    group: "วิชาการและการสอน",
    color: "amber",
    badgeBg: "bg-amber-50 text-amber-800 border-amber-200",
    description: "การจัดการเรียนการสอน บรรยาย ปฏิบัติการ นิเทศนักศึกษา และงานพัฒนาหลักสูตร",
    keywords: ["สอน", "การสอน", "จัดการเรียนการสอน", "บรรยาย", "ปฏิบัติการ", "ตารางสอน", "นิเทศ", "วิชา", "กระบวนวิชา", "course", "lecture"]
  },
  {
    id: "dept",
    name: "งานสาขา",
    score: 0.25,
    group: "ระดับองค์กรและพื้นที่",
    color: "slate",
    badgeBg: "bg-slate-100 text-slate-800 border-slate-300",
    description: "ภารกิจ การประชุม และกิจกรรมบริหารระดับสาขาวิชาหรือประจำหลักสูตร",
    keywords: ["งานสาขา", "ระดับสาขา", "สาขาวิชา", "หลักสูตร", "ประชุมสาขา", "ประจำสาขา"]
  },
  {
    id: "faculty",
    name: "งานคณะ",
    score: 0.5,
    group: "ระดับองค์กรและพื้นที่",
    color: "blue",
    badgeBg: "bg-blue-50 text-blue-800 border-blue-200",
    description: "ภารกิจ งานกิจกรรม โครงการ และคณะกรรมการดำเนินงานระดับคณะ",
    keywords: ["งานคณะ", "ระดับคณะ", "คณะวิทยาการจัดการ", "คณะวิทยาศาสตร์", "ประชุมคณะ", "คก.", "คพ."]
  },
  {
    id: "university",
    name: "งานมหาลัย",
    score: 1.0,
    group: "ระดับองค์กรและพื้นที่",
    color: "purple",
    badgeBg: "bg-purple-50 text-purple-800 border-purple-200",
    description: "ภารกิจ งานพิธีการ โครงการ และคณะกรรมการดำเนินงานระดับมหาวิทยาลัย",
    keywords: ["งานมหาลัย", "งานมหาวิทยาลัย", "ระดับมหาวิทยาลัย", "มรภ.นว.", "มหาวิทยาลัยราชภัฏ", "อธิการบดี", "สภามหาวิทยาลัย"]
  },
  {
    id: "district",
    name: "งานอำเภอ",
    score: 2.0,
    group: "ระดับองค์กรและพื้นที่",
    color: "indigo",
    badgeBg: "bg-indigo-50 text-indigo-800 border-indigo-200",
    description: "ภารกิจ โครงการความร่วมมือ และการบริการวิชาการระดับอำเภอ",
    keywords: ["งานอำเภอ", "ระดับอำเภอ", "ที่ว่าการอำเภอ", "นายอำเภอ", "อ.เมือง", "อ.โกรกพระ", "อ.บรรพตพิสัย", "อ.ลาดยาว", "อ.ตาคลี", "อ.พยุหะคีรี"]
  },
  {
    id: "province",
    name: "งานจังหวัด",
    score: 3.0,
    group: "ระดับองค์กรและพื้นที่",
    color: "violet",
    badgeBg: "bg-violet-50 text-violet-800 border-violet-200",
    description: "ภารกิจ คณะกรรมการ โครงการพัฒนาท้องถิ่น และบริการวิชาการระดับจังหวัด",
    keywords: ["งานจังหวัด", "ระดับจังหวัด", "ผู้ว่าราชการ", "ศาลากลาง", "จ.นครสวรรค์", "จังหวัดนครสวรรค์", "จ.พิษณุโลก", "จ.อุทัยธานี", "จ.พิจิตร", "ปากน้ำโพ"]
  },
  {
    id: "national",
    name: "งานประเทศ",
    score: 4.0,
    group: "ระดับองค์กรและพื้นที่",
    color: "rose",
    badgeBg: "bg-rose-50 text-rose-800 border-rose-200",
    description: "ภารกิจ โครงการยุทธศาสตร์ระดับชาติ/ประเทศ กระทรวง หรือหน่วยงานส่วนกลาง",
    keywords: ["งานประเทศ", "ระดับประเทศ", "ระดับชาติ", "กระทรวง", "กพอ.", "สกอ.", "อว.", "สำนักนายกรัฐมนตรี", "national"]
  },
  {
    id: "speaker_internal",
    name: "วิทยากร ภายใน",
    score: 1.0,
    group: "วิทยากรและผู้ทรงคุณวุฒิ",
    color: "emerald",
    badgeBg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    description: "วิทยากรบรรยาย อบรม สัมมนา หรือถ่ายทอดความรู้ภายในมหาวิทยาลัย",
    keywords: ["วิทยากรภายใน", "วิทยากร ภายใน", "วิทยากรบรรยายภายใน"]
  },
  {
    id: "speaker_external",
    name: "วิทยากร ภายนอก",
    score: 2.0,
    group: "วิทยากรและผู้ทรงคุณวุฒิ",
    color: "teal",
    badgeBg: "bg-teal-50 text-teal-800 border-teal-200",
    description: "วิทยากรบรรยาย อบรม หรือบริการวิชาการแก่หน่วยงานภายนอก/ชุมชน/ท้องถิ่น",
    keywords: ["วิทยากรภายนอก", "วิทยากร ภายนอก", "วิทยากรภายนอกสถาบัน", "วิทยากรรับเชิญ"]
  },
  {
    id: "committee_internal",
    name: "กรรมการภายใน",
    score: 1.0,
    group: "คณะกรรมการ",
    color: "cyan",
    badgeBg: "bg-cyan-50 text-cyan-800 border-cyan-200",
    description: "กรรมการดำเนินงาน กรรมการบริหาร หรือกรรมการตรวจประเมินภายในสถาบัน",
    keywords: ["กรรมการภายใน", "กรรมการ ภายใน", "คณะกรรมการภายใน", "กรรมการประจำ"]
  },
  {
    id: "committee_external",
    name: "กรรมการภายนอก",
    score: 2.0,
    group: "คณะกรรมการ",
    color: "sky",
    badgeBg: "bg-sky-50 text-sky-800 border-sky-200",
    description: "กรรมการผู้ทรงคุณวุฒิ คณะกรรมการตรวจประเมิน หรือกรรมการระดับภายนอกสถาบัน",
    keywords: ["กรรมการภายนอก", "กรรมการ ภายนอก", "ผู้ทรงคุณวุฒิภายนอก", "คณะกรรมการภายนอก"]
  },
  {
    id: "self_training",
    name: "ไปอบรมพัฒนาตนเอง",
    score: 1.0,
    group: "การพัฒนาตนเองและการมีส่วนร่วม",
    color: "lime",
    badgeBg: "bg-lime-50 text-lime-900 border-lime-300",
    description: "การเข้าร่วมอบรม สัมมนาเชิงปฏิบัติการ อัปสกิล เพื่อพัฒนาสมรรถนะวิชาชีพอาจารย์",
    keywords: ["ไปอบรมพัฒนาตนเอง", "อบรมพัฒนาตนเอง", "พัฒนาตนเอง", "อบรมเชิงปฏิบัติการ", "upskill", "reskill", "สัมมนาพัฒนา"]
  },
  {
    id: "attend_event",
    name: "ไปเข้าร่วมงาน",
    score: 0.5,
    group: "การพัฒนาตนเองและการมีส่วนร่วม",
    color: "orange",
    badgeBg: "bg-orange-50 text-orange-800 border-orange-200",
    description: "การไปเข้าร่วมงานพิธีการ กิจกรรมสถาบัน พิธีมอบรางวัล นิทรรศการ หรือประชุม",
    keywords: ["ไปเข้าร่วมงาน", "เข้าร่วมงาน", "ร่วมพิธี", "ร่วมงาน", "มอบรางวัล", "เข้าร่วมกิจกรรม", "เข้าร่วมประชุม", "พิธีเปิด"]
  },
  {
    id: "write_book",
    name: "เขียนตำรา/หนังสือ",
    score: 2.0,
    group: "ผลงานทางวิชาการ",
    color: "pink",
    badgeBg: "bg-pink-50 text-pink-800 border-pink-200",
    description: "การเรียบเรียง ผลิต และจัดทำตำรา หนังสือวิชาการ หรือเอกสารคำสอน",
    keywords: ["เขียนตำรา", "ตำรา", "หนังสือ", "เขียนหนังสือ", "เอกสารประกอบการสอน", "เอกสารคำสอน", "book", "textbook"]
  },
  {
    id: "publish_research",
    name: "ตีพิมพ์วิจัย",
    score: 3.0,
    group: "ผลงานทางวิชาการ",
    color: "emerald",
    badgeBg: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    description: "การตีพิมพ์เผยแพร่บทความวิจัยในวารสารระดับชาติ/นานาชาติ หรือ Conference Proceeding",
    keywords: ["ตีพิมพ์วิจัย", "ตีพิมพ์", "งานวิจัย", "บทความวิจัย", "วารสาร", "journal", "proceeding", "tci", "scopus"]
  }
];

export const WORKLOAD_CRITERIA_MAP = Object.fromEntries(
  WORKLOAD_SCORING_CRITERIA.map(c => [c.id, c])
);

export const WORKLOAD_CRITERIA_BY_NAME = Object.fromEntries(
  WORKLOAD_SCORING_CRITERIA.map(c => [c.name, c])
);

/**
 * ดึงข้อมูลเกณฑ์จาก id
 */
export function getWorkloadCriteriaById(id) {
  return WORKLOAD_CRITERIA_MAP[id] || null;
}

/**
 * ดึงข้อมูลเกณฑ์จากชื่อ (เช่น "งานสอน", "วิทยากร ภายนอก")
 */
export function getWorkloadCriteriaByName(name) {
  if (!name) return null;
  return WORKLOAD_CRITERIA_BY_NAME[name.trim()] || null;
}

/**
 * ปรับแต่งตัวเลขคะแนนให้แสดงทศนิยมสวยงาม (เช่น 2 -> "2.0", 0.25 -> "0.25", 0.5 -> "0.5")
 */
export function formatScore(score) {
  const num = Number(score);
  if (isNaN(num)) return '0.0';
  if (Number.isInteger(num)) return `${num}.0`;
  return num.toString();
}

/**
 * สกัดและระบุเกณฑ์การให้คะแนนภาระงานอัตโนมัติจากข้อความหรือชื่อคำสั่ง
 */
export function determineWorkloadCriteria({
  text = '',
  title = '',
  role = '',
  location = '',
  category = ''
} = {}) {
  const combined = `${title} ${text} ${role} ${location} ${category}`.toLowerCase();

  // 1. ผลงานวิชาการ
  if (/เขียนตำรา|ตำรา|หนังสือวิชาการ|เอกสารคำสอน|เอกสารประกอบการสอน/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.write_book;
  }
  if (/ตีพิมพ์|บทความวิจัย|วารสาร|journal|proceeding|tci|scopus|การตีพิมพ์/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.publish_research;
  }

  // 2. วิทยากร
  if (/วิทยากร/.test(combined)) {
    if (/ภายนอก|นอกสถาบัน|ชุมชน|อบต|เทศบาล|โรงเรียน|ชาวบ้าน|วิสาหกิจ/.test(combined)) {
      return WORKLOAD_CRITERIA_MAP.speaker_external;
    }
    if (/ภายใน|ในสถาบัน|ในมหาวิทยาลัย|คณะวิทยาการจัดการ|คณะวิทยาศาสตร์/.test(combined)) {
      return WORKLOAD_CRITERIA_MAP.speaker_internal;
    }
    // ถ้าสถานที่อยู่นอก มรภ.นครสวรรค์
    if (location && !location.includes('มหาวิทยาลัยราชภัฏ') && !location.includes('มรภ.')) {
      return WORKLOAD_CRITERIA_MAP.speaker_external;
    }
    return WORKLOAD_CRITERIA_MAP.speaker_internal;
  }

  // 3. กรรมการ
  if (/กรรมการ/.test(combined)) {
    if (/กรรมการภายนอก|ผู้ทรงคุณวุฒิภายนอก/.test(combined)) {
      return WORKLOAD_CRITERIA_MAP.committee_external;
    }
    if (/กรรมการภายใน|ตรวจประเมินภายใน|กรรมการดำเนินงาน|กรรมการฝ่าย/.test(combined)) {
      return WORKLOAD_CRITERIA_MAP.committee_internal;
    }
    if (/ภายนอก/.test(combined)) {
      return WORKLOAD_CRITERIA_MAP.committee_external;
    }
  }

  // 4. การพัฒนาตนเอง & การเข้าร่วมงาน
  if (/ไปอบรม|อบรมพัฒนาตนเอง|พัฒนาตนเอง|อบรมเชิงปฏิบัติการ|upskill|reskill|สัมมนาเชิงปฏิบัติการ/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.self_training;
  }
  if (/เข้าร่วมงาน|ไปเข้าร่วมงาน|ร่วมพิธี|มอบรางวัล|ร่วมงาน|เข้าร่วมโครงการ|นิทรรศการ|วันสำคัญ|พิธีเปิด/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.attend_event;
  }

  // 5. งานสอน
  if (/งานสอน|จัดการเรียนการสอน|ตารางสอน|นิเทศนักศึกษา|ฝึกงาน|สหกิจศึกษา|อาจารย์ที่ปรึกษาหลักสูตร/.test(combined) || category === 'การจัดการเรียนการสอน') {
    return WORKLOAD_CRITERIA_MAP.teaching;
  }

  // 6. ระดับพื้นที่ / องค์กร (จากใหญ่ไปเล็ก)
  if (/ระดับชาติ|ระดับประเทศ|กระทรวง|กพอ|สกอ|อว|สำนักนายก/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.national;
  }
  if (/ระดับจังหวัด|ผู้ว่าราชการ|ศาลากลาง|จังหวัดนครสวรรค์|จ\.นครสวรรค์|ปากน้ำโพ/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.province;
  }
  if (/ระดับอำเภอ|ที่ว่าการอำเภอ|นายอำเภอ|อ\.เมือง|อ\.โกรกพระ|อ\.บรรพตพิสัย|อ\.ลาดยาว|อ\.ตาคลี/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.district;
  }
  if (/มหาวิทยาลัย|มรภ\.นว|อธิการบดี|สภามหาวิทยาลัย/.test(combined) || category.includes('มหาวิทยาลัย')) {
    return WORKLOAD_CRITERIA_MAP.university;
  }
  if (/คณะ|คณะวิทยาการจัดการ|คณะวิทยาศาสตร์|ประชุมคณะ/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.faculty;
  }
  if (/สาขาวิชา|สาขา|หลักสูตร|ประชุมสาขา/.test(combined)) {
    return WORKLOAD_CRITERIA_MAP.dept;
  }

  // Default fallback: งานมหาลัย (1.0)
  return WORKLOAD_CRITERIA_MAP.university;
}

/**
 * คำนวณคะแนนของคำสั่ง 1 รายการ
 */
export function getOrderScore(order) {
  if (!order) return 0;
  if (order.workloadScore !== undefined && order.workloadScore !== null) {
    return Number(order.workloadScore) || 0;
  }
  if (order.score !== undefined && order.score !== null) {
    return Number(order.score) || 0;
  }
  if (order.workloadType) {
    const found = getWorkloadCriteriaByName(order.workloadType);
    if (found) return found.score;
  }
  const detected = determineWorkloadCriteria({
    title: order.title || '',
    text: order.fullDescription || order.rawOcrText || '',
    location: order.location || '',
    category: order.category || '',
    role: order.role || order.facultyAssigned?.[0]?.roleInOrder || ''
  });
  return detected.score;
}

/**
 * ดึงชื่อประเภทเกณฑ์ของคำสั่ง 1 รายการ
 */
export function getOrderWorkloadType(order) {
  if (!order) return 'งานมหาลัย';
  if (order.workloadType) return order.workloadType;
  const detected = determineWorkloadCriteria({
    title: order.title || '',
    text: order.fullDescription || order.rawOcrText || '',
    location: order.location || '',
    category: order.category || '',
    role: order.role || order.facultyAssigned?.[0]?.roleInOrder || ''
  });
  return detected.name;
}

/**
 * คำนวณผลรวมคะแนนภาระงานทั้งหมด
 */
export function calculateTotalScore(orders = []) {
  if (!Array.isArray(orders)) return 0;
  const total = orders.reduce((sum, ord) => sum + getOrderScore(ord), 0);
  return Number(total.toFixed(2));
}

/**
 * คำนวณสรุปสถิติคะแนนภาระงานแยกตามเกณฑ์ 15 ข้อ
 */
export function calculateScoreBreakdown(orders = []) {
  if (!Array.isArray(orders)) return { total: 0, items: [], byGroup: {} };

  const countMap = {};
  WORKLOAD_SCORING_CRITERIA.forEach(c => {
    countMap[c.name] = {
      criteria: c,
      count: 0,
      totalScore: 0
    };
  });

  let totalScore = 0;

  orders.forEach(ord => {
    const type = getOrderWorkloadType(ord);
    const score = getOrderScore(ord);
    totalScore += score;

    if (countMap[type]) {
      countMap[type].count += 1;
      countMap[type].totalScore += score;
    } else {
      // Fallback matching
      const found = getWorkloadCriteriaByName(type) || WORKLOAD_CRITERIA_MAP.university;
      if (countMap[found.name]) {
        countMap[found.name].count += 1;
        countMap[found.name].totalScore += score;
      }
    }
  });

  const items = Object.values(countMap)
    .map(item => ({
      ...item,
      totalScore: Number(item.totalScore.toFixed(2))
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  // Group by category group
  const byGroup = {};
  items.forEach(item => {
    const grp = item.criteria.group;
    if (!byGroup[grp]) {
      byGroup[grp] = { group: grp, count: 0, totalScore: 0, items: [] };
    }
    byGroup[grp].count += item.count;
    byGroup[grp].totalScore += item.totalScore;
    byGroup[grp].items.push(item);
  });

  return {
    totalScore: Number(totalScore.toFixed(2)),
    items,
    byGroup: Object.values(byGroup).map(g => ({
      ...g,
      totalScore: Number(g.totalScore.toFixed(2))
    }))
  };
}
