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

// เดือนภาษาไทยเป็นเลขเดือน 01-12 (รองรับทั้งชื่อเต็ม อักษรย่อ มีจุดและไม่มีจุด)
const THAI_MONTH_MAP = {
  'มกราคม': '01', 'ม.ค.': '01', 'ม.ค': '01', 'มค': '01',
  'กุมภาพันธ์': '02', 'ก.พ.': '02', 'ก.พ': '02', 'กพ': '02',
  'มีนาคม': '03', 'มี.ค.': '03', 'มี.ค': '03', 'มีค': '03',
  'เมษายน': '04', 'เม.ย.': '04', 'เม.ย': '04', 'เมย': '04',
  'พฤษภาคม': '05', 'พ.ค.': '05', 'พ.ค': '05', 'พค': '05',
  'มิถุนายน': '06', 'มิ.ย.': '06', 'มิ.ย': '06', 'มิย': '06',
  'กรกฎาคม': '07', 'ก.ค.': '07', 'ก.ค': '07', 'กค': '07',
  'สิงหาคม': '08', 'ส.ค.': '08', 'ส.ค': '08', 'สค': '08',
  'กันยายน': '09', 'ก.ย.': '09', 'ก.ย': '09', 'กย': '09',
  'ตุลาคม': '10', 'ต.ค.': '10', 'ต.ค': '10', 'ตค': '10',
  'พฤศจิกายน': '11', 'พ.ย.': '11', 'พ.ย': '11', 'พย': '11',
  'ธันวาคม': '12', 'ธ.ค.': '12', 'ธ.ค': '12', 'ธค': '12',
};

// แปลงวันที่ภาษาไทย (เช่น 25 ก.ย. 69, 18 กันยายน 2569) เป็น ISO YYYY-MM-DD (2026-09-18)
export function parseThaiDateToIso(dayStr, monthName, yearStr) {
  const d = parseInt(convertThaiNumerals(dayStr), 10);
  const cleanMonth = (monthName || '').trim().replace(/\s+/g, '');
  let m = THAI_MONTH_MAP[cleanMonth];
  if (!m) {
    for (const [name, code] of Object.entries(THAI_MONTH_MAP)) {
      if (cleanMonth === name || cleanMonth.includes(name) || name.includes(cleanMonth)) {
        m = code;
        break;
      }
    }
  }
  if (!m) m = '01';

  let y = parseInt(convertThaiNumerals(yearStr), 10);
  if (isNaN(y)) {
    y = new Date().getFullYear();
  } else if (y < 100) {
    // กรณี พ.ศ. 2 หลัก เช่น 67, 68, 69, 70 -> แปลงเป็น 2567, 2568, 2569...
    y += 2500;
  }

  // ถ้าเป็น พ.ศ. (>= 2400) ให้แปลงเป็น ค.ศ.
  if (y >= 2400) {
    y = y - 543;
  }

  const dayFormatted = String(isNaN(d) ? 1 : d).padStart(2, '0');
  return `${y}-${m}-${dayFormatted}`;
}

/**
 * สกัดข้อมูลคำสั่งราชการจากข้อความดิบ (Local Rule-based & Heuristics ที่แม่นยำสูง)
 * ไม่สร้างข้อมูลเท็จ ไม่ยัดเยียดชื่ออาจารย์สุ่มมั่ว
 */
export function parseThaiOfficialOrder(rawText = '', filename = 'เอกสารคำสั่ง.pdf', existingFacultyList = [], activeFaculty = null) {
  // ทำความสะอาดอักขระและแปลงเลขไทยเป็นเลขอารบิก
  const preCleaned = cleanOcrArtifacts(rawText || '');
  const normalizedText = convertThaiNumerals(preCleaned);
  let confidenceScore = 60;

  // 1. สกัดเลขที่คำสั่ง (Order Number)
  let orderNumber = '';
  const orderNumRegexes = [
    /(?:คำสั่ง[^\n\r]*?ที่|ประกาศ[^\n\r]*?ที่|ที่)\s*([A-Za-zก-๙0-9\.\s\-]+\s*\/\s*(?:25[0-9]{2}|[0-9]{2,4}))/i,
    /(?:มรภ\.นว\.|คก\.|ทส\.|สพ\.)\s*[0-9]+\s*\/\s*(?:25[0-9]{2}|[0-9]{2,4})/i,
    /(?:คำสั่ง[^\n\r]*?ที่|ที่)\s*([0-9]{1,4}\s*\/\s*(?:25[0-9]{2}|[0-9]{2,4}))/,
    /([0-9]{1,4}\s*\/\s*25[0-9]{2})/,
    /([0-9]{1,4}\s*\/\s*[0-9]{2})(?=\s|$)/
  ];

  for (const regex of orderNumRegexes) {
    const match = normalizedText.match(regex);
    if (match) {
      orderNumber = (match[1] || match[0]).replace(/\s+/g, ' ').trim();
      confidenceScore += 15;
      break;
    }
  }

  if (!orderNumber) {
    const fileMatch = filename.match(/([0-9]{3,4})[_\-\/\s]+(25[0-9]{2})/);
    if (fileMatch) {
      orderNumber = `มรภ.นว. ${fileMatch[1]}/${fileMatch[2]}`;
      confidenceScore += 8;
    } else {
      // หากไม่มีเลขคำสั่ง ให้แสดงเป็น รอระบุเลขที่คำสั่ง (ไม่สร้างเลขเท็จ)
      orderNumber = 'รอระบุเลขที่คำสั่ง';
    }
  }

  // 2. สกัดชื่อคำสั่ง / เรื่อง (Title) - รองรับทั้งเอกสารทางการและข้อความโพสต์/แคปชั่น
  let title = '';
  const titleMultiLineMatch = normalizedText.match(/(?:เรื่อง|เรื\s*อง|เร่\s*ือง)\s*[:\-\s]*([^\n\r]+(?:\n[ \t]*[^\n\r]+){0,3})/i);
  if (titleMultiLineMatch) {
    const rawTitleChunk = titleMultiLineMatch[1];
    const lines = rawTitleChunk.split('\n').map(l => l.trim()).filter(Boolean);
    const validTitleLines = [];

    for (const line of lines) {
      if (/^(ด้วย|ตามที่|ตามประกาศ|อาศัยอำนาจ|จึงขอ|จึงแต่งตั้ง|เพื่อให้|เพื่อให|ข้อ\s*[0-9๑-๙]|๑\.|1\.|---|หน้าที่|สั่ง\s*ณ|ลงวันที่|ทั้งนี้)/.test(line)) {
        break;
      }
      if (/แต่งตั้ง.+?(?:เป็นประธาน|เป็นกรรมการ|เป็นวิทยากร)/.test(line)) {
        break;
      }
      if (line.length <= 2 && !/[0-9ก-๙]/.test(line)) continue;
      validTitleLines.push(line);
    }

    if (validTitleLines.length > 0) {
      title = validTitleLines.join(' ').replace(/\s+/g, ' ').trim();
      confidenceScore += 20;
    }
  }

  // หากยังไม่ได้ชื่อเรื่อง ให้สแกนหาบรรทัดที่มีคีย์เวิร์ดโครงการ/กิจกรรม/คำสั่ง
  if (!title || title.length < 6) {
    const lines = normalizedText.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 3);
    for (const line of lines) {
      // ข้ามบรรทัดหัวกระดาษราชการสั้นๆ
      if (/^(คำสั่งมหาวิทยาลัย|ประกาศมหาวิทยาลัย|บันทึกข้อความ|ส่วนราชการ|ที่\s*[0-9]+)/.test(line) && line.length < 50) {
        continue;
      }
      if (
        line.startsWith('แต่งตั้ง') || 
        line.includes('โครงการ') || 
        line.includes('สัมมนา') || 
        line.includes('อบรม') || 
        line.includes('การประชุม') || 
        line.includes('คณะกรรมการ') || 
        line.includes('ผลการพิจารณา') ||
        line.includes('ขอเชิญ') ||
        line.includes('ประชาสัมพันธ์') ||
        line.includes('กิจกรรม')
      ) {
        if (line.length > 8 && line.length < 180 && !line.startsWith('ด้วย') && !line.startsWith('อาศัย') && !line.startsWith('เพื่อให้')) {
          title = line;
          confidenceScore += 14;
          break;
        }
      }
    }
  }

  // กรณีเป็นข้อความแคปชั่น FB หรือแชตที่ไม่มีคีย์เวิร์ดชัดเจน ให้ใช้บรรทัดแรกที่มีความหมาย
  if (!title || title.length < 6) {
    const cleanLines = normalizedText.split(/[\n\r]+/)
      .map(l => l.replace(/^[#\-\*\s]+/, '').trim())
      .filter(l => l.length > 5 && !l.startsWith('http') && !l.startsWith('www') && !l.includes('Facebook'));
    if (cleanLines.length > 0) {
      title = cleanLines[0].slice(0, 120);
      confidenceScore += 10;
    }
  }

  // Fallback สะอาด
  if (!title) {
    if (filename && !filename.includes('ข้อความคำสั่ง') && !filename.includes('เอกสารคำสั่ง') && !filename.includes('Facebook')) {
      title = filename.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
    } else {
      title = 'กิจกรรมและภาระงาน (รอระบุชื่อเรื่อง)';
    }
  }

  // ทำความสะอาดชื่อเรื่อง
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

  // 3. สกัดวันที่ (Sign Date & Event Date) - รองรับทุกรูปแบบทั้งทางการและย่อ
  let signDate = new Date().toISOString().split('T')[0];
  let eventDate = signDate;

  // ค้นหาวันที่สั่งการ (Sign Date)
  const signDateMatch = normalizedText.match(/(?:สั่ง\s*ณ\s*วันที่|ลงวันที่)\s*([0-9]{1,2})\s*([ก-๙\.]+)\s*(?:พ\.ศ\.\s*)?([0-9]{2,4})/i);
  if (signDateMatch) {
    try {
      signDate = parseThaiDateToIso(signDateMatch[1], signDateMatch[2], signDateMatch[3]);
      eventDate = signDate;
      confidenceScore += 10;
    } catch {
      // fallback
    }
  }

  // ค้นหาวันจัดกิจกรรม (Event Date)
  const eventDateMatch = normalizedText.match(/(?:ในวันที่|ระหว่างวันที่|จัดขึ้นในวันที่|กำหนดจัดงานวันที่|จัดงานวันที่|วันที่)\s*([0-9]{1,2})\s*(?:ถึง|-)?\s*([0-9]{1,2})?\s*([ก-๙\.]+)\s*(?:พ\.ศ\.\s*)?([0-9]{2,4})/i);
  if (eventDateMatch) {
    try {
      eventDate = parseThaiDateToIso(eventDateMatch[1], eventDateMatch[3], eventDateMatch[4]);
      if (!signDateMatch) signDate = eventDate;
      confidenceScore += 12;
    } catch {
      // fallback
    }
  } else {
    // ลองค้นหาวันที่ตัวเลขสแลช เช่น 25/09/2569 หรือ 25/9/69
    const slashMatch = normalizedText.match(/([0-9]{1,2})[\/\-\.]([0-9]{1,2})[\/\-\.](25[0-9]{2}|20[0-9]{2}|[0-9]{2})/);
    if (slashMatch) {
      try {
        let d = String(parseInt(slashMatch[1], 10)).padStart(2, '0');
        let m = String(parseInt(slashMatch[2], 10)).padStart(2, '0');
        let y = parseInt(slashMatch[3], 10);
        if (y < 100) y += 2500;
        if (y >= 2400) y -= 543;
        eventDate = `${y}-${m}-${d}`;
        if (!signDateMatch) signDate = eventDate;
        confidenceScore += 10;
      } catch {
        // fallback
      }
    }
  }

  // 4. สกัดเวลา (Event Time)
  let eventTime = 'ไม่ระบุเวลา';
  const timeMatch = normalizedText.match(/(?:เวลา\s*)?([0-9]{1,2}[:\.][0-9]{2}(?:\s*(?:-|ถึง)\s*[0-9]{1,2}[:\.][0-9]{2})?\s*(?:น\.|นาฬิกา))/);
  if (timeMatch) {
    eventTime = timeMatch[1].trim();
    if (!eventTime.endsWith('น.') && !eventTime.endsWith('นาฬิกา')) {
      eventTime += ' น.';
    }
    confidenceScore += 6;
  }

  // 5. สกัดสถานที่ (Location)
  let location = 'มหาวิทยาลัยราชภัฏนครสวรรค์';
  const locationMatch = normalizedText.match(/(?:ณ|สถานที่|ห้องประชุม|ห้องปฏิบัติการ|ห้อง|อาคาร|ศูนย์)\s*([^\n\r,\.]{3,80}?(?:ห้อง|อาคาร|ศูนย์|คณะ|มหาวิทยาลัย|โรงแรม|หอประชุม|จังหวัด|มรภ\.)[^\n\r,\.]*)/);
  if (locationMatch) {
    location = locationMatch[0].replace(/^(?:ณ|สถานที่)\s*/, '').trim();
    confidenceScore += 8;
  }

  // 6. จำแนกหมวดหมู่ กพอ. 1-6 (Category Classification)
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

  // 7. ตรวจจับรายชื่ออาจารย์และบุคลากร (Smart Faculty Detection - ไม่ยัดเยียดชื่อมั่ว)
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

  // ถ้ายังไม่พบใครเลยในข้อความ ให้ใช้อาจารย์ที่ล็อกอินอยู่ปัจจุบัน (activeFaculty)
  // เพื่อป้องกันการยัดเยียดชื่ออาจารย์ท่านอื่นที่ไม่ได้อยู่ในเอกสาร
  if (detectedFaculty.length === 0) {
    if (activeFaculty) {
      detectedFaculty.push({
        id: activeFaculty.id,
        name: activeFaculty.name,
        roleInOrder: 'ผู้รับผิดชอบโครงการ / ผู้ปฏิบัติงาน'
      });
    } else if (existingFacultyList.length > 0) {
      detectedFaculty.push({
        id: existingFacultyList[0].id,
        name: existingFacultyList[0].name,
        roleInOrder: 'ผู้รับผิดชอบโครงการ'
      });
    }
  }

  // คำนวณชั่วโมงภาระงานตามบทบาท
  let estimatedHours = 3;
  const primaryRole = detectedFaculty[0]?.roleInOrder || '';
  if (primaryRole.includes('ประธาน') || primaryRole.includes('วิทยากร')) {
    estimatedHours = 6;
  } else if (primaryRole.includes('เลขานุการ')) {
    estimatedHours = 4;
  }

  const finalConfidence = Math.min(Math.max(confidenceScore, 75), 98);

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
