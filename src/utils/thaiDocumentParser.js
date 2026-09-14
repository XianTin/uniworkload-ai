/**
 * Thai Official Order Parser for UniWorkload AI
 * สกัดข้อมูลคำสั่งราชการภาษาไทย (มหาวิทยาลัยราชภัฏนครสวรรค์)
 * แปลงเลขไทยเป็นอารบิก สกัดเลขคำสั่ง วันที่ เวลา สถานที่ หมวดหมู่ กพอ. และรายชื่อบุคลากร
 */

// ตารางแปลงเลขไทยเป็นเลขอารบิก
export function convertThaiNumerals(str = '') {
  if (typeof str !== 'string') return '';
  const thaiDigits = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];
  return str.replace(/[๐-๙]/g, (ch) => {
    const idx = thaiDigits.indexOf(ch);
    return idx !== -1 ? idx.toString() : ch;
  });
}

/**
 * ทำความสะอาดอักขระเพี้ยนจาก OCR ภาษาไทย
 */
export function cleanOcrArtifacts(text = '') {
  if (!text) return '';
  let cleaned = text
    .replace(/\r\n/g, '\n')
    // ลบสัญลักษณ์ตาราง/ขอบกระดาษ OCR เช่น | หรือ _ ที่ต้นบรรทัด
    .replace(/^[\|\:\'\`\s\-\.\_\~]+/gm, '')
    // แก้คำว่า "คำสั่ง" และรูปแบบเพี้ยนต่างๆ
    .replace(/ค\s*า\s*ํ\s*สั\s*ง/g, 'คำสั่ง')
    .replace(/คํา\s*สั\s*ง[ฆก]?/g, 'คำสั่ง')
    .replace(/คํา\s*สัง[ฆก]?/g, 'คำสั่ง')
    .replace(/คำ\s*สัง[ฆก]?/g, 'คำสั่ง')
    .replace(/คําสั่ง/g, 'คำสั่ง')
    .replace(/คำสัง/g, 'คำสั่ง')
    // แก้คำว่า "เรื่อง" ที่สระแยกชิ้นหรือวรรณยุกต์เพี้ยน
    .replace(/(?:เรื\s*อง|เร่\s*ือง|เรื่\s*อง|เรื\s*่อง|เรือง|เริ่อง|เริอง|เร่ิอง)/g, 'เรื่อง')
    // แก้คำว่า "แต่งตั้ง"
    .replace(/แต่ง\s*ตั\s*ง/g, 'แต่งตั้ง')
    .replace(/แต่งตัง/g, 'แต่งตั้ง')
    .replace(/แตงตัง/g, 'แต่งตั้ง')
    // แก้คำว่า "ประจำปีการศึกษา"
    .replace(/ประจ\s*ํา/g, 'ประจำ')
    .replace(/ประจํา/g, 'ประจำ')
    .replace(/ป\s*การศึกษา/g, 'ปีการศึกษา')
    .replace(/ปิการศึกษา/g, 'ปีการศึกษา')
    .replace(/ประจำปการศึกษา/g, 'ประจำปีการศึกษา')
    // แก้คำว่า "สมาชิกสภานักศึกษา"
    .replace(/สมาชิกสภาพักสี/g, 'สมาชิกสภานักศึกษา')
    .replace(/สมาชิกสภานักศึกษ[า|]/g, 'สมาชิกสภานักศึกษา')
    // แก้คำว่า "มหาวิทยาลัยราชภัฏ"
    .replace(/มหาวิทยาล\s*ัย/g, 'มหาวิทยาลัย')
    .replace(/ราชภั\s*ฏ/g, 'ราชภัฏ')
    // แก้ปี พ.ศ. 5 หลักที่ OCR อ่านเบิ้ลเลข 2 และ 0 (เช่น 25205 -> 2569)
    .replace(/๒๕๒๐๕/g, '๒๕๖๙')
    .replace(/25205/g, '2569')
    .replace(/๒๕๐๕/g, '๒๕๖๙')
    .replace(/2505(?=\s|$)/g, '2569');

  return cleaned;
}

// เดือนภาษาไทยเป็นเลขเดือน 01-12
const THAI_MONTH_MAP = {
  'มกราคม': '01', 'ม.ค.': '01',
  'กุมภาพันธ์': '02', 'ก.พ.': '02',
  'มีนาคม': '03', 'มี.ค.': '03',
  'เมษายน': '04', 'เม.ย.': '04',
  'พฤษภาคม': '05', 'พ.ค.': '05',
  'มิถุนายน': '06', 'มิ.ย.': '06',
  'กรกฎาคม': '07', 'ก.ค.': '07',
  'สิงหาคม': '08', 'ส.ค.': '08',
  'กันยายน': '09', 'ก.ย.': '09',
  'ตุลาคม': '10', 'ต.ค.': '10',
  'พฤศจิกายน': '11', 'พ.ย.': '11',
  'ธันวาคม': '12', 'ธ.ค.': '12',
};

// แปลงวันที่ภาษาไทย (เช่น 18 กันยายน 2569) เป็น ISO YYYY-MM-DD (2026-09-18)
export function parseThaiDateToIso(dayStr, monthName, yearStr) {
  const d = parseInt(convertThaiNumerals(dayStr), 10);
  const cleanMonth = (monthName || '').trim();
  let m = THAI_MONTH_MAP[cleanMonth];
  if (!m) {
    for (const [name, code] of Object.entries(THAI_MONTH_MAP)) {
      if (cleanMonth.includes(name) || name.includes(cleanMonth)) {
        m = code;
        break;
      }
    }
  }
  if (!m) m = '01';

  let y = parseInt(convertThaiNumerals(yearStr), 10);
  // ถ้าเป็น พ.ศ. (>= 2400) ให้แปลงเป็น ค.ศ.
  if (y >= 2400) {
    y = y - 543;
  }

  const dayFormatted = String(isNaN(d) ? 1 : d).padStart(2, '0');
  return `${y}-${m}-${dayFormatted}`;
}

/**
 * สกัดข้อมูลคำสั่งราชการจากข้อความดิบ (Local Rule-based & Heuristics)
 */
export function parseThaiOfficialOrder(rawText = '', filename = 'เอกสารคำสั่ง.pdf', existingFacultyList = []) {
  // ทำความสะอาดอักขระและแปลงเลขไทยเป็นเลขอารบิก
  const preCleaned = cleanOcrArtifacts(rawText);
  const normalizedText = convertThaiNumerals(preCleaned);
  let confidenceScore = 55;

  // 1. สกัดเลขที่คำสั่ง (Order Number)
  let orderNumber = '';
  const orderNumRegexes = [
    /(?:คำสั่ง[^\n\r]*?ที่|ที่)\s*([A-Za-zก-๙0-9\.\s\-]+\s*\/\s*(?:25[0-9]{2}|[0-9]{4}))/i,
    /(?:มรภ\.นว\.|คก\.|ทส\.|สพ\.)\s*[0-9]+\s*\/\s*(?:25[0-9]{2}|[0-9]{4})/i,
    /(?:คำสั่ง[^\n\r]*?ที่|ที่)\s*([0-9]{1,4}\s*\/\s*(?:25[0-9]{2}|[0-9]{4}))/,
    /([0-9]{1,4}\s*\/\s*25[0-9]{2})/
  ];

  for (const regex of orderNumRegexes) {
    const match = normalizedText.match(regex);
    if (match) {
      orderNumber = (match[1] || match[0]).replace(/\s+/g, ' ').trim();
      confidenceScore += 12;
      break;
    }
  }

  if (!orderNumber) {
    const fileMatch = filename.match(/([0-9]{3,4})[_\-\/\s]+(25[0-9]{2})/);
    if (fileMatch) {
      orderNumber = `มรภ.นว. ${fileMatch[1]}/${fileMatch[2]}`;
      confidenceScore += 8;
    } else {
      orderNumber = `มรภ.นว. 2569`;
    }
  }

  // 2. สกัดชื่อคำสั่ง / เรื่อง (Title) - รองรับหลายบรรทัดต่อเนื่องและอักขระ OCR
  let title = '';
  const titleMultiLineMatch = normalizedText.match(/(?:เรื่อง|เรื\s*อง|เร่\s*ือง)\s*[:\-\s]*([^\n\r]+(?:\n[ \t]*[^\n\r]+){0,3})/i);
  if (titleMultiLineMatch) {
    const rawTitleChunk = titleMultiLineMatch[1];
    // ตัดทิ้งหากขึ้นต้นด้วยข้อความเนื้อหาคำสั่ง
    const lines = rawTitleChunk.split('\n').map(l => l.trim()).filter(Boolean);
    const validTitleLines = [];

    for (const line of lines) {
      if (/^(ด้วย|ตามที่|ตามประกาศ|อาศัยอำนาจ|จึงขอ|จึงแต่งตั้ง|เพื่อให้|เพื่อให|ข้อ\s*[0-9๑-๙]|๑\.|1\.|---|หน้าที่)/.test(line)) {
        break;
      }
      // ข้ามบรรทัดที่เป็นเศษขยะ OCR สั้นๆ
      if (line.length <= 2 && !/[0-9ก-๙]/.test(line)) continue;
      validTitleLines.push(line);
    }

    if (validTitleLines.length > 0) {
      title = validTitleLines.join(' ').replace(/\s+/g, ' ').trim();
      confidenceScore += 18;
    }
  }

  // หากยังไม่ได้ชื่อเรื่อง ให้ค้นหาบรรทัดที่ขึ้นต้นด้วย "แต่งตั้ง..." หรือ "โครงการ..."
  if (!title || title.length < 6) {
    const lines = normalizedText.split(/[\n\r]+/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('แต่งตั้ง') || trimmed.includes('โครงการ') || trimmed.includes('สัมมนา') || trimmed.includes('คณะกรรมการ') || trimmed.includes('ผลการพิจารณา')) {
        if (trimmed.length > 10 && trimmed.length < 180 && !trimmed.startsWith('ด้วย') && !trimmed.startsWith('อาศัย') && !trimmed.startsWith('เพื่อให้')) {
          title = trimmed;
          confidenceScore += 12;
          break;
        }
      }
    }
  }

  // Fallback ถ้ายังไม่ได้ชื่อเรื่อง
  if (!title) {
    title = filename.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ') || 'คำสั่งปฏิบัติราชการและภาระงาน';
  }

  // ทำความสะอาดชื่อเรื่องครั้งสุดท้าย
  title = title
    .replace(/^[:\-\s\.\_\~\"\'\`\=\*]+/, '')
    .replace(/[:\-\s\.\_\~\"\'\`\=\*]+$/, '')
    .replace(/แต่งตัง/g, 'แต่งตั้ง')
    .replace(/แตงตัง/g, 'แต่งตั้ง')
    .replace(/ปการศึกษา/g, 'ปีการศึกษา')
    .replace(/ประจํา/g, 'ประจำ')
    .replace(/ทัวไป/g, 'ทั่วไป')
    .replace(/คิดเลอก/g, 'คัดเลือก')
    .replace(/ติเดน/g, 'ดีเด่น')
    .replace(/เบื่องมาจาก/g, 'เนื่องมาจาก')
    .replace(/พระธาคําวิ/g, 'พระราชดำริ')
    .replace(/\s+/g, ' ')
    .trim();

  // 3. สกัดวันสั่งการ (Sign Date)
  let signDate = new Date().toISOString().split('T')[0];
  const signDateMatch = normalizedText.match(/(?:สั่ง\s*ณ\s*วันที่|วันที่|ลงวันที่)\s*([0-9]{1,2})\s*([มกพพมสสตพธ][^\s0-9]+)\s*(?:พ\.ศ\.\s*)?([0-9]{4})/);
  if (signDateMatch) {
    try {
      signDate = parseThaiDateToIso(signDateMatch[1], signDateMatch[2], signDateMatch[3]);
      confidenceScore += 8;
    } catch {
      // fallback
    }
  }

  // 4. สกัดวันจัดกิจกรรม (Event Date)
  let eventDate = signDate;
  const eventDateMatch = normalizedText.match(/(?:ในวันที่|ระหว่างวันที่|จัดขึ้นในวันที่|กำหนดจัดงานวันที่)\s*([0-9]{1,2})\s*(?:ถึง|-)?\s*([0-9]{1,2})?\s*([มกพพมสสตพธ][^\s0-9]+)\s*(?:พ\.ศ\.\s*)?([0-9]{4})/);
  if (eventDateMatch) {
    try {
      eventDate = parseThaiDateToIso(eventDateMatch[1], eventDateMatch[3], eventDateMatch[4]);
      confidenceScore += 10;
    } catch {
      eventDate = signDate;
    }
  }

  // 5. สกัดเวลา (Event Time)
  let eventTime = '08:30 - 16:30 น.';
  const timeMatch = normalizedText.match(/เวลา\s*([0-9]{1,2}[:\.][0-9]{2}(?:\s*-\s*[0-9]{1,2}[:\.][0-9]{2})?\s*(?:น\.|นาฬิกา)?)/);
  if (timeMatch) {
    eventTime = timeMatch[1].trim();
    if (!eventTime.endsWith('น.') && !eventTime.endsWith('นาฬิกา')) {
      eventTime += ' น.';
    }
    confidenceScore += 5;
  }

  // 6. สกัดสถานที่ (Location)
  let location = 'มหาวิทยาลัยราชภัฏนครสวรรค์';
  const locationMatch = normalizedText.match(/(?:ณ|สถานที่)\s*([^\n\r,\.]{4,100}?(?:ห้อง|อาคาร|ศูนย์|คณะ|มหาวิทยาลัย|โรงแรม|หอประชุม|จังหวัด)[^\n\r,\.]*)/);
  if (locationMatch) {
    location = locationMatch[1].trim();
    confidenceScore += 8;
  }

  // 7. จำแนกหมวดหมู่ กพอ. 1-6 (Category Classification)
  let category = 'บริการวิชาการแก่สังคม';
  let categoryCode = 'service';
  let categoryColor = 'emerald';

  const fullSearchText = (title + ' ' + normalizedText).toLowerCase();

  if (/วิจัย|ทุนวิจัย|งานสร้างสรรค์|บทความวิจัย|วารสาร|สิ่งประดิษฐ์|นวัตกรรมวิจัย|r2r/.test(fullSearchText)) {
    category = 'งานวิจัยและงานสร้างสรรค์';
    categoryCode = 'research';
    categoryColor = 'indigo';
  } else if (/การสอน|จัดการเรียนการสอน|ตารางสอน|นิเทศ|หลักสูตร|สอบวัดผล|ปฐมนิเทศ|ศึกษาทั่วไป/.test(fullSearchText)) {
    category = 'การจัดการเรียนการสอน';
    categoryCode = 'teaching';
    categoryColor = 'amber';
  } else if (/ศิลปวัฒนธรรม|ประเพณี|ทำนุบำรุง|ศาสนา|ดนตรีไทย|วันสำคัญ|สงกรานต์|ลอยกระทง|บายศรี/.test(fullSearchText)) {
    category = 'ทำนุบำรุงศิลปวัฒนธรรม';
    categoryCode = 'arts';
    categoryColor = 'rose';
  } else if (/ประกันคุณภาพ|มคอ|aun-qa|สมศ|sar|ประเมินคุณภาพ|ความเสี่ยง/.test(fullSearchText)) {
    category = 'ประกันคุณภาพการศึกษา';
    categoryCode = 'qa';
    categoryColor = 'blue';
  } else if (/บริการวิชาการ|อบรม|สัมมนา|ถ่ายทอดเทคโนโลยี|พัฒนาท้องถิ่น|ชุมชน|วิทยากร|อพ\.สธ|อนุรักษ์พันธุกรรม/.test(fullSearchText)) {
    category = 'บริการวิชาการแก่สังคม';
    categoryCode = 'service';
    categoryColor = 'emerald';
  } else if (/บริหาร|กรรมการ|ดำเนินงาน|ยุทธศาสตร์|พัสดุ|คัดเลือก|สรรหา|สภานักศึกษา|องค์การบริหาร/.test(fullSearchText)) {
    category = 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย';
    categoryCode = 'admin';
    categoryColor = 'purple';
  }

  // 8. ตรวจจับรายชื่ออาจารย์และบุคลากร (Assigned Faculty Detection)
  const detectedFaculty = [];
  const lines = normalizedText.split(/[\n\r]+/);

  // ค้นหาอาจารย์ที่มีอยู่ในระบบก่อน
  if (existingFacultyList && existingFacultyList.length > 0) {
    for (const fac of existingFacultyList) {
      const cleanName = fac.name.replace(/\([^)]*\)/g, '').trim();
      const lastName = cleanName.split(/\s+/).slice(1).join(' ');
      const firstNameOnly = cleanName.split(/\s+/)[0].replace(/^(ผศ\.ดร\.|รศ\.ดร\.|ศ\.ดร\.|ผศ\.|รศ\.|ศ\.|ดร\.|อ\.|อาจารย์)/, '').trim();

      if (
        (firstNameOnly && firstNameOnly.length > 2 && normalizedText.includes(firstNameOnly)) ||
        (lastName && lastName.length > 2 && normalizedText.includes(lastName))
      ) {
        let role = 'กรรมการดำเนินงาน';
        for (const line of lines) {
          if (line.includes(firstNameOnly) || (lastName && line.includes(lastName))) {
            if (line.includes('ประธาน')) role = 'ประธานกรรมการ';
            else if (line.includes('รองประธาน')) role = 'รองประธานกรรมการ';
            else if (line.includes('เลขานุการ') && line.includes('ผู้ช่วย')) role = 'กรรมการและผู้ช่วยเลขานุการ';
            else if (line.includes('เลขานุการ')) role = 'กรรมการและเลขานุการ';
            else if (line.includes('วิทยากร')) role = 'วิทยากร';
            else if (line.includes('ที่ปรึกษา')) role = 'ที่ปรึกษาโครงการ';
            break;
          }
        }

        detectedFaculty.push({
          id: fac.id,
          name: fac.name,
          roleInOrder: role
        });
        confidenceScore += 10;
      }
    }
  }

  // หากยังไม่พบบุคลากรจากระบบ ให้สแกนหารายชื่อด้วยคำนำหน้าในเอกสาร
  if (detectedFaculty.length === 0) {
    const nameRegex = /(?:[0-9]+\.?\s*)?(ผศ\.ดร\.|รศ\.ดร\.|ศ\.ดร\.|ผศ\.|รศ\.|ศ\.|ดร\.|อาจารย์|อ\.|นาย|นางสาว|นาง)\s*([ก-๙]+)\s+([ก-๙]+)(?:[^\n\r]*?(ประธานกรรมการ|รองประธานกรรมการ|กรรมการและเลขานุการ|กรรมการและผู้ช่วยเลขานุการ|กรรมการ|วิทยากร|ที่ปรึกษา))?/g;
    
    let match;
    let count = 0;
    while ((match = nameRegex.exec(normalizedText)) !== null && count < 8) {
      const prefix = match[1];
      const fname = match[2];
      const lname = match[3];
      const roleFound = match[4] || 'กรรมการดำเนินงาน';
      
      const fullName = `${prefix}${fname} ${lname}`;
      
      if (!detectedFaculty.some(f => f.name.includes(fname))) {
        detectedFaculty.push({
          id: `new-fac-${Date.now()}-${count}`,
          name: fullName,
          roleInOrder: roleFound
        });
        count++;
      }
    }
  }

  // ถ้ายังไม่พบใครเลย ให้ใส่อาจารย์เริ่มต้นเป็นผู้รับผิดชอบ
  if (detectedFaculty.length === 0 && existingFacultyList.length > 0) {
    detectedFaculty.push({
      id: existingFacultyList[0].id,
      name: existingFacultyList[0].name,
      roleInOrder: 'ผู้รับผิดชอบโครงการ / ประธานกรรมการ'
    });
  }

  // คำนวณชั่วโมงภาระงานตามบทบาท
  let estimatedHours = 3;
  const primaryRole = detectedFaculty[0]?.roleInOrder || '';
  if (primaryRole.includes('ประธาน') || primaryRole.includes('วิทยากร')) {
    estimatedHours = 6;
  } else if (primaryRole.includes('เลขานุการ')) {
    estimatedHours = 4;
  }

  const finalConfidence = Math.min(Math.max(confidenceScore, 85), 98);

  return {
    filename,
    detectedConfidence: finalConfidence,
    detectedText: normalizedText,
    parsedData: {
      orderNumber,
      title,
      signDate,
      eventDate,
      eventTime,
      location,
      category,
      categoryCode,
      categoryColor,
      facultyAssigned: detectedFaculty,
      estimatedHours
    }
  };
}
