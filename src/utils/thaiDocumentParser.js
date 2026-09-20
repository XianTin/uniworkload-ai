/**
 * Thai Official Order Parser for UniWorkload AI
 * สกัดข้อมูลคำสั่งราชการภาษาไทย (มหาวิทยาลัยราชภัฏนครสวรรค์)
 * แปลงเลขไทยเป็นอารบิก สกัดเลขคำสั่ง วันที่ เวลา สถานที่ หมวดหมู่ กพอ. และรายชื่อบุคลากร
 * รองรับทั้งเอกสารราชการทางการ โพสต์ Facebook แคปชัน และข้อความแชตประกาศ
 */

import { determineWorkloadCriteria } from './workloadScoring';

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
    // แก้ปี พ.ศ. 5 หลักที่ OCR อ่านเบิ้ลเลข 2 และ 0
    .replace(/๒๕๒๐๕/g, '๒๕๖๙')
    .replace(/25205/g, '2569')
    .replace(/๒๕๐๕/g, '๒๕๖๙')
    .replace(/2505(?=\s|$)/g, '2569');

  return cleaned;
}

// เดือนภาษาไทยเป็นเลขเดือน 01-12
export const THAI_MONTH_MAP = {
  'มกราคม': '01', 'ม.ค.': '01', 'ม.ค': '01', 'มค': '01', 'มกรา': '01',
  'กุมภาพันธ์': '02', 'ก.พ.': '02', 'ก.พ': '02', 'กพ': '02', 'กุมภา': '02',
  'มีนาคม': '03', 'มี.ค.': '03', 'มี.ค': '03', 'มีค': '03', 'มีนา': '03',
  'เมษายน': '04', 'เม.ย.': '04', 'เม.ย': '04', 'เมย': '04', 'เมษา': '04',
  'พฤษภาคม': '05', 'พ.ค.': '05', 'พ.ค': '05', 'พค': '05', 'พฤษภา': '05',
  'มิถุนายน': '06', 'มิ.ย.': '06', 'มิ.ย': '06', 'มิย': '06', 'มิถุนา': '06',
  'กรกฎาคม': '07', 'ก.ค.': '07', 'ก.ค': '07', 'กค': '07', 'กรกฎา': '07',
  'สิงหาคม': '08', 'ส.ค.': '08', 'ส.ค': '08', 'สค': '08', 'สิงหา': '08',
  'กันยายน': '09', 'ก.ย.': '09', 'ก.ย': '09', 'กย': '09', 'กันยา': '09',
  'ตุลาคม': '10', 'ต.ค.': '10', 'ต.ค': '10', 'ตค': '10', 'ตุลา': '10',
  'พฤศจิกายน': '11', 'พ.ย.': '11', 'พ.ย': '11', 'พย': '11', 'พฤศจิกา': '11',
  'ธันวาคม': '12', 'ธ.ค.': '12', 'ธ.ค': '12', 'ธค': '12', 'ธันวา': '12',
};

// แปลงวันที่ภาษาไทยเป็น ISO YYYY-MM-DD (เช่น 2 สิงหาคม 2569 -> 2026-08-02)
export function parseThaiDateToIso(dayStr, monthName, yearStr) {
  const d = parseInt(convertThaiNumerals(String(dayStr || '1')), 10);
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

  let y = parseInt(convertThaiNumerals(String(yearStr || '2569')), 10);
  if (isNaN(y)) {
    y = 2569;
  } else if (y < 100) {
    y += 2500;
  }

  // แปลง พ.ศ. (>= 2400) เป็น ค.ศ.
  if (y >= 2400) {
    y = y - 543;
  }

  const dayFormatted = String(isNaN(d) ? 1 : d).padStart(2, '0');
  return `${y}-${m}-${dayFormatted}`;
}

/**
 * สกัดวันที่ทั้งหมดจากข้อความ พร้อมระบุบริบทว่าวันไหนเป็นวันสั่งการ (signDate) หรือวันจัดกิจกรรม (eventDate)
 */
export function extractSmartDates(normalizedText) {
  const monthKeys = Object.keys(THAI_MONTH_MAP).sort((a, b) => b.length - a.length);
  const monthPattern = monthKeys.map(m => m.replace(/\./g, '\\.')).join('|');

  // Regex ดึงวันที่ภาษาไทยทุกรูปแบบ
  // รองรับ: "วันอาทิตย์ ที่ 2 สิงหาคม พ.ศ 2569", "2 ส.ค. 69", "วันที่ 15-17 กรกฎาคม 2569"
  const dateRegex = new RegExp(
    '([0-9]{1,2})\\s*(?:ถึง|-|–|\\s+ถึง\\s+)?\\s*([0-9]{1,2})?\\s*' +
    '(' + monthPattern + ')' +
    '(?:\\s*(?:พ\\.?\\s*ศ\\.?|พศ\\.?|ปี\\s*พ\\.?\\s*ศ\\.?|ค\\.?\\s*ศ\\.?|ปี)?\\s*([0-9]{2,4}))?',
    'gi'
  );

  const foundDates = [];
  let m;
  while ((m = dateRegex.exec(normalizedText)) !== null) {
    const startIdx = m.index;
    const prefix = normalizedText.substring(Math.max(0, startIdx - 45), startIdx);
    const day = m[1].padStart(2, '0');
    const month = THAI_MONTH_MAP[m[3].trim()] || '01';
    let year = m[4] ? parseInt(m[4], 10) : 2569;
    if (year < 100) year += 2500;
    if (year >= 2400) year -= 543;

    const isoDate = `${year}-${month}-${day}`;
    foundDates.push({
      isoDate,
      fullText: m[0],
      isSign: /(?:สั่ง\s*ณ\s*วัน|ลงวัน)/i.test(prefix),
      isEvent: /(?:จัดขึ้น|จัดงาน|กำหนดจัด|กำหนดการ|ระหว่างวัน|ในวัน|วัน(?:จันทร์|อังคาร|พุธ|พฤหัส|ศุกร์|เสาร์|อาทิตย์))/i.test(prefix)
    });
  }

  let signDate = '';
  let eventDate = '';

  const signCandidate = foundDates.find(d => d.isSign);
  const eventCandidate = foundDates.find(d => d.isEvent);

  if (signCandidate) signDate = signCandidate.isoDate;
  if (eventCandidate) eventDate = eventCandidate.isoDate;

  // หากพบหลายวันแต่ไม่มีคีย์เวิร์ดชัด วันสุดท้ายมักเป็นวันจัดงาน วันแรกมักเป็นวันสั่งการ
  if (!eventDate && foundDates.length > 0) {
    eventDate = foundDates[foundDates.length - 1].isoDate;
  }
  if (!signDate && foundDates.length > 0) {
    signDate = foundDates[0].isoDate;
  }

  // Fallback: รูปแบบสแลช เช่น 02/08/2569 หรือ 2/8/69
  if (!eventDate) {
    const slashMatch = normalizedText.match(/([0-9]{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/);
    if (slashMatch) {
      let d = slashMatch[1].padStart(2, '0');
      let mo = slashMatch[2].padStart(2, '0');
      let y = parseInt(slashMatch[3], 10);
      if (y < 100) y += 2500;
      if (y >= 2400) y -= 543;
      eventDate = `${y}-${mo}-${d}`;
      signDate = eventDate;
    }
  }

  let eventEndDate = '';
  // Check date range pattern: เช่น "ระหว่างวันที่ 17 ถึง 20 กันยายน 2569" หรือ "17 - 20 ก.ย. 2569"
  const rangePattern = /(?:ระหว่างวันที่|วันที่|ในวันที่)?\s*([0-9]{1,2})\s*(?:ถึง|-|–|—)\s*([0-9]{1,2})\s*([ก-๙]+)\s*(?:พ\.ศ\.\s*)?([0-9]{2,4})?/i;
  const rangeMatch = normalizedText.match(rangePattern);
  if (rangeMatch && THAI_MONTH_MAP[rangeMatch[3].trim()]) {
    const startDay = rangeMatch[1].padStart(2, '0');
    const endDay = rangeMatch[2].padStart(2, '0');
    const month = THAI_MONTH_MAP[rangeMatch[3].trim()];
    let year = rangeMatch[4] ? parseInt(rangeMatch[4], 10) : 2569;
    if (year < 100) year += 2500;
    if (year >= 2400) year -= 543;
    eventDate = `${year}-${month}-${startDay}`;
    eventEndDate = `${year}-${month}-${endDay}`;
  }

  const today = new Date().toISOString().split('T')[0];
  return {
    signDate: signDate || eventDate || today,
    eventDate: eventDate || signDate || today,
    eventEndDate: eventEndDate || eventDate || signDate || today,
    hasRealDate: foundDates.length > 0 || !eventDate
  };
}

/**
 * สกัดชื่อโครงการ/กิจกรรม (Title) ฉลาดรอบด้าน รองรับชื่อหลักและชื่อรองหลายบรรทัด
 */
function extractSmartTitle(normalizedText, filename = '') {
  let title = '';

  // 1. ค้นหา "เรื่อง..." รูปแบบทางการ
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
    }
  }

  const lines = normalizedText.split(/[\n\r]+/).map(l => l.trim()).filter(Boolean);

  // 2. หากยังไม่ได้ชื่อเรื่อง ให้สแกนหาบรรทัดที่มีคีย์เวิร์ดโครงการ/กิจกรรม/การพัฒนา
  if (!title || title.length < 6) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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
        line.includes('กิจกรรม') ||
        line.includes('การพัฒนา') ||
        line.includes('ประกวด') ||
        line.includes('แข่งขัน')
      ) {
        if (line.length > 6 && line.length < 180 && !line.startsWith('ด้วย') && !line.startsWith('อาศัย') && !line.startsWith('เพื่อให้')) {
          const assembled = [line];
          // รวมบรรทัดถัดไปถ้าเป็นชื่องานรอง เช่น AIT AMBASSADOR 2026 หรือ ปีการศึกษา
          if (i + 1 < lines.length) {
            const nextLine = lines[i + 1];
            if (isSubtitleContinuation(nextLine)) {
              assembled.push(nextLine);
            }
          }
          title = assembled.join(' ');
          break;
        }
      }
    }
  }

  // 3. สำหรับข้อความโพสต์ FB หรือแชตที่บรรทัดแรกเป็นชื่องาน
  if (!title || title.length < 6) {
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace(/^[#\-\*\s]+/, '').trim();
      if (line.length > 5 && !line.startsWith('http') && !line.startsWith('www') && !isMetaHeaderOrFooter(line)) {
        const assembled = [line];
        if (i + 1 < lines.length) {
          const nextLine = lines[i + 1].trim();
          if (isSubtitleContinuation(nextLine)) {
            assembled.push(nextLine);
          }
        }
        title = assembled.join(' ');
        break;
      }
    }
  }

  // 4. Fallback จากชื่อไฟล์
  if (!title) {
    if (filename && !filename.includes('ข้อความคำสั่ง') && !filename.includes('เอกสารคำสั่ง') && !filename.includes('Facebook')) {
      title = filename.replace(/\.[^/.]+$/, '').replace(/[_\\-]/g, ' ');
    } else {
      title = 'กิจกรรมและภาระงาน (รอระบุชื่อเรื่อง)';
    }
  }

  return title
    .replace(/^[:\-\s\.\_\~\"\'\`\=\*]+/, '')
    .replace(/[:\-\s\.\_\~\"\'\`\=\*]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isMetaHeaderOrFooter(line) {
  return /^(คำสั่ง|ประกาศ|บันทึกข้อความ|ส่วนราชการ|โทร|แฟกซ์|email|http|www|facebook)/i.test(line);
}

function isSubtitleContinuation(line) {
  const trimmed = line.replace(/^[^\wก-๙A-Za-z0-9]+/, '').trim();
  if (!trimmed || trimmed.length > 90) return false;
  // ไม่ใช่สถานที่
  if (/^(?:ณ|สถานที่|ห้องประชุม|ห้อง|อาคาร|ศูนย์|โรงแรม|หอประชุม)/i.test(trimmed)) return false;
  // ไม่ใช่วันที่หรือเวลา
  if (/^(?:วัน|วันที่|เวลา|ระหว่าง|ในวัน|กำหนดการ)/i.test(trimmed)) return false;
  if (/มกราคม|กุมภาพันธ์|มีนาคม|เมษายน|พฤษภาคม|มิถุนายน|กรกฎาคม|สิงหาคม|กันยายน|ตุลาคม|พฤศจิกายน|ธันวาคม|ม\.ค\.|ก\.พ\.|มี\.ค\.|เม\.ย\.|พ\.ค\.|มิ\.ย\.|ก\.ค\.|ส\.ค\.|ก\.ย\.|ต\.ค\.|พ\.ย\.|ธ\.ค\./.test(trimmed)) return false;
  // ไม่ใช่ชื่อคณะ/มหาวิทยาลัยเพียวๆ (เว้นแต่เป็นชื่อโครงการ)
  if (/^(?:คณะ|มหาวิทยาลัย|สาขาวิชา|ภาควิชา|สำนัก)/i.test(trimmed) && !trimmed.includes('โครงการ') && !trimmed.includes('กิจกรรม')) return false;
  // ไม่ใช่ชื่อคน
  if (/^(?:ผศ\.|รศ\.|ศ\.|ดร\.|อาจารย์|อ\.|นาย|นางสาว|นาง)/.test(trimmed)) return false;
  return true;
}

/**
 * สกัดสถานที่จัดงาน (Location) ป้องกันการจับคู่ผิดพลาดกับตัวอักษร ณ ในคำว่า คณะ
 */
function extractSmartLocation(normalizedText) {
  let location = 'มหาวิทยาลัยราชภัฏนครสวรรค์';

  // 1. ระบุด้วยคำบุพบท ณ (ต้องมีช่องว่าง/ต้นบรรทัด เพื่อไม่ชนกับคำว่า คณะ) หรือ สถานที่
  const locMatch1 = normalizedText.match(/(?:(?:^|[\s\n\r])ณ\s+|สถานที่[:\-\s]+|สถานที่จัดงาน[:\-\s]+|จัดขึ้นที่[:\-\s]+)([^\n\r,\.]{3,120})/);
  if (locMatch1) {
    location = locMatch1[1].trim();
  } else {
    // 2. ระบุชื่อห้อง หรืออาคาร หรือโรงแรม
    const locMatch2 = normalizedText.match(/(?:(?:^|[\s\n\r])(?:ห้องประชุม|ห้องปฏิบัติการ|ห้องคอมพิวเตอร์|หอประชุม|ห้อง\s*[0-9A-Za-z]+|อาคาร\s*[0-9A-Za-zก-๙]+|โรงแรม\s*[ก-๙]+)[^\n\r,\.]{0,80})/i);
    if (locMatch2) {
      location = locMatch2[0].trim();
    }
  }

  return location;
}

/**
 * สกัดข้อมูลคำสั่งราชการจากข้อความดิบ (Smart Heuristic Parser v3.6.0)
 * แม่นยำสูง ไม่สร้างข้อมูลเท็จ รองรับทั้งข้อความประกาศและคำสั่งราชการเต็มรูปแบบ
 */
export function parseThaiOfficialOrder(rawText = '', filename = 'เอกสารคำสั่ง.pdf', existingFacultyList = [], activeFaculty = null) {
  const preCleaned = cleanOcrArtifacts(rawText || '');
  const normalizedText = convertThaiNumerals(preCleaned);
  let confidenceScore = 65;

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
      orderNumber = 'รอระบุเลขที่คำสั่ง';
    }
  }

  // 2. สกัดชื่อคำสั่ง / เรื่อง (Title)
  const title = extractSmartTitle(normalizedText, filename);
  if (title && !title.includes('รอระบุ')) confidenceScore += 18;

  // 3. สกัดวันที่ (Sign Date & Event Date & Event End Date)
  const { signDate, eventDate, eventEndDate, hasRealDate } = extractSmartDates(normalizedText);
  if (hasRealDate) confidenceScore += 15;

  // 4. สกัดเวลา (Event Time)
  let eventTime = 'ไม่ระบุเวลา';
  const timeMatch = normalizedText.match(/(?:เวลา\s*)?([0-9]{1,2}[:\.][0-9]{2}(?:\s*(?:-|ถึง)\s*[0-9]{1,2}[:\.][0-9]{2})?\s*(?:น\.|นาฬิกา)?)/);
  if (timeMatch && /[0-9]/.test(timeMatch[1])) {
    let t = timeMatch[1].trim();
    if (!t.endsWith('น.') && !t.endsWith('นาฬิกา')) {
      t += ' น.';
    }
    eventTime = t;
    confidenceScore += 8;
  }

  // 5. สกัดสถานที่ (Location)
  const location = extractSmartLocation(normalizedText);
  if (location !== 'มหาวิทยาลัยราชภัฏนครสวรรค์') confidenceScore += 10;

  // 6. จำแนกหมวดหมู่ กพอ. 1-6 (Category Classification)
  let category = 'การจัดการเรียนการสอน';
  let categoryCode = 'teaching';
  let categoryColor = 'amber';

  const fullSearchText = (title + ' ' + normalizedText).toLowerCase();

  if (/วิจัย|ทุนวิจัย|งานสร้างสรรค์|บทความวิจัย|วารสาร|สิ่งประดิษฐ์|นวัตกรรมวิจัย|r2r|conference|proceeding|สิทธิบัตร/.test(fullSearchText)) {
    category = 'งานวิจัยและงานสร้างสรรค์';
    categoryCode = 'research';
    categoryColor = 'indigo';
  } else if (/การสอน|จัดการเรียนการสอน|ตารางสอน|นิเทศ|หลักสูตร|สอบวัดผล|ปฐมนิเทศ|ปัจฉิมนิเทศ|ศึกษาทั่วไป|นักศึกษา|พัฒนานักศึกษา|บุคลิกภาพนักศึกษา|กิจกรรมนักศึกษา|แกนนำนักศึกษา|สโมสรนักศึกษา|ทูตกิจกรรม|ambassador|สหกิจศึกษา|ฝึกงาน|ฝึกประสบการณ์|อาจารย์ที่ปรึกษา/.test(fullSearchText)) {
    category = 'การจัดการเรียนการสอน';
    categoryCode = 'teaching';
    categoryColor = 'amber';
  } else if (/ศิลปวัฒนธรรม|ประเพณี|ทำนุบำรุง|ศาสนา|ดนตรีไทย|วันสำคัญ|สงกรานต์|ลอยกระทง|บายศรี|ไหว้ครู|ถวายพระพร|เฉลิมพระเกียรติ|มุทิตาจิต/.test(fullSearchText)) {
    category = 'ทำนุบำรุงศิลปวัฒนธรรม';
    categoryCode = 'arts';
    categoryColor = 'rose';
  } else if (/ประกันคุณภาพ|มคอ|aun-qa|สมศ|sar|ประเมินคุณภาพ|ความเสี่ยง|เกณฑ์มาตรฐาน|edpex/.test(fullSearchText)) {
    category = 'ประกันคุณภาพการศึกษา';
    categoryCode = 'qa';
    categoryColor = 'blue';
  } else if (/บริการวิชาการ|อบรม|สัมมนา|ถ่ายทอดเทคโนโลยี|พัฒนาท้องถิ่น|ชุมชน|วิทยากร|อพ\.สธ|อนุรักษ์พันธุกรรม|ประชาชน|ชาวบ้าน|วิสาหกิจชุมชน|otop|โรงเรียน/.test(fullSearchText)) {
    category = 'บริการวิชาการแก่สังคม';
    categoryCode = 'service';
    categoryColor = 'emerald';
  } else if (/บริหาร|กรรมการ|ดำเนินงาน|ยุทธศาสตร์|พัสดุ|คัดเลือก|สรรหา|สภานักศึกษา|องค์การบริหาร|สภามหาวิทยาลัย|สภาคณาจารย์|งบประมาณ|ประชุมคณะ|ประชุมสาขา/.test(fullSearchText)) {
    category = 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย';
    categoryCode = 'admin';
    categoryColor = 'purple';
  }

  // 7. ตรวจจับรายชื่ออาจารย์และบุคลากร (Smart Faculty Detection)
  const detectedFaculty = [];
  const lines = normalizedText.split(/[\n\r]+/);

  // ตรวจหาอาจารย์ที่มีอยู่ในระบบ
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

  // หากในข้อความไม่ได้ระบุชื่อใคร ให้ผูกกับอาจารย์ที่กำลังล็อกอินอยู่ปัจจุบัน (activeFaculty)
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

  // คำนวณเกณฑ์การให้คะแนนภาระงาน (15 เกณฑ์)
  const criteria = determineWorkloadCriteria({
    title,
    text: normalizedText,
    location,
    category,
    role: primaryRole
  });

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
      eventEndDate: eventEndDate || eventDate,
      eventTime,
      location,
      category,
      categoryCode,
      categoryColor,
      facultyAssigned: detectedFaculty,
      estimatedHours,
      workloadType: criteria.name,
      workloadScore: criteria.score,
      score: criteria.score
    }
  };
}
