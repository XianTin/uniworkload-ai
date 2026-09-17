/**
 * Google Drive Integration Utilities for UniWorkload AI
 * Enables infinite cloud storage for workload evidence files, PDFs, and photo galleries
 * using Google Workspace for Education / Personal Google Drive links.
 * Eliminates server storage limits and browser LocalStorage 5MB quota errors.
 */

// Regex patterns to recognize various Google Drive and Google Docs links
const GDRIVE_FILE_REGEX = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)/;
const GDRIVE_FOLDER_REGEX = /(?:drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/))([a-zA-Z0-9_-]+)/;
const GDOCS_DOC_REGEX = /docs\.google\.com\/document\/d\/([a-zA-Z0-9_-]+)/;
const GDOCS_SHEET_REGEX = /docs\.google\.com\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/;
const GDOCS_SLIDE_REGEX = /docs\.google\.com\/presentation\/d\/([a-zA-Z0-9_-]+)/;

/**
 * Checks if a string is a valid Google Drive or Google Docs URL
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  return trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com');
}

/**
 * Parses a Google Drive URL into structured data and direct preview/thumbnail endpoints
 * @param {string} rawUrl 
 * @returns {object|null} parsed metadata or null if invalid
 */
export function parseGoogleDriveUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const url = rawUrl.trim();

  // 1. Folder check
  const folderMatch = url.match(GDRIVE_FOLDER_REGEX);
  if (folderMatch) {
    const folderId = folderMatch[1];
    return {
      isGoogleDrive: true,
      type: 'folder',
      id: folderId,
      originalUrl: url,
      viewUrl: `https://drive.google.com/drive/folders/${folderId}`,
      previewEmbedUrl: `https://drive.google.com/embeddedfolderview?id=${folderId}#grid`,
      thumbnailUrl: null, // Folders don't have a single image thumbnail
      downloadUrl: null,
      label: 'โฟลเดอร์ Google Drive รวมหลักฐาน',
      iconType: 'folder'
    };
  }

  // 2. Google Docs
  const docMatch = url.match(GDOCS_DOC_REGEX);
  if (docMatch) {
    const docId = docMatch[1];
    return {
      isGoogleDrive: true,
      type: 'doc',
      id: docId,
      originalUrl: url,
      viewUrl: `https://docs.google.com/document/d/${docId}/view`,
      previewEmbedUrl: `https://docs.google.com/document/d/${docId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${docId}&sz=w800`,
      downloadUrl: `https://docs.google.com/document/d/${docId}/export?format=pdf`,
      label: 'Google Docs เอกสารคำสั่ง/รายงาน',
      iconType: 'doc'
    };
  }

  // 3. Google Sheets
  const sheetMatch = url.match(GDOCS_SHEET_REGEX);
  if (sheetMatch) {
    const sheetId = sheetMatch[1];
    return {
      isGoogleDrive: true,
      type: 'sheet',
      id: sheetId,
      originalUrl: url,
      viewUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/view`,
      previewEmbedUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${sheetId}&sz=w800`,
      downloadUrl: `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=pdf`,
      label: 'Google Sheets ตารางสรุปภาระงาน',
      iconType: 'sheet'
    };
  }

  // 4. Google Slides
  const slideMatch = url.match(GDOCS_SLIDE_REGEX);
  if (slideMatch) {
    const slideId = slideMatch[1];
    return {
      isGoogleDrive: true,
      type: 'slide',
      id: slideId,
      originalUrl: url,
      viewUrl: `https://docs.google.com/presentation/d/${slideId}/view`,
      previewEmbedUrl: `https://docs.google.com/presentation/d/${slideId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${slideId}&sz=w800`,
      downloadUrl: `https://docs.google.com/presentation/d/${slideId}/export/pdf`,
      label: 'Google Slides สไลด์บรรยาย/นำเสนอ',
      iconType: 'slide'
    };
  }

  // 5. Google Drive File (PDF, Image, Video, ZIP, etc.)
  const fileMatch = url.match(GDRIVE_FILE_REGEX);
  if (fileMatch) {
    const fileId = fileMatch[1];
    return {
      isGoogleDrive: true,
      type: 'file',
      id: fileId,
      originalUrl: url,
      viewUrl: `https://drive.google.com/file/d/${fileId}/view?usp=sharing`,
      previewEmbedUrl: `https://drive.google.com/file/d/${fileId}/preview`,
      thumbnailUrl: `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${fileId}`,
      label: 'ไฟล์หลักฐานบน Google Drive',
      iconType: 'file'
    };
  }

  return null;
}

/**
 * Creates a normalized evidence item object for an order from a Google Drive link
 */
export function createGoogleDriveEvidenceItem({
  url,
  title = '',
  description = '',
  date = ''
}) {
  const parsed = parseGoogleDriveUrl(url);
  if (!parsed) return null;

  const timestamp = new Date().toISOString().split('T')[0];
  const itemDate = date || timestamp;
  const isImageOrFile = parsed.type === 'file' || parsed.type === 'doc';

  const defaultTitle = parsed.type === 'folder'
    ? 'โฟลเดอร์หลักฐานภาพถ่ายและเอกสาร (Google Drive)'
    : (title || 'เอกสาร/ภาพถ่ายหลักฐาน (Google Drive)');

  return {
    id: `gdrive-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    name: title || defaultTitle,
    title: title || defaultTitle,
    url: parsed.viewUrl,
    rawUrl: parsed.originalUrl,
    thumbnailUrl: parsed.thumbnailUrl,
    embedUrl: parsed.previewEmbedUrl,
    downloadUrl: parsed.downloadUrl,
    fileId: parsed.id,
    type: 'gdrive',
    isGoogleDrive: true,
    gdriveType: parsed.type,
    size: parsed.type === 'folder' ? 'Cloud Folder' : 'Cloud Drive',
    uploadedAt: itemDate,
    description: description || 'คลังหลักฐานบน Google Drive คลาวด์ ไม่จำกัดพื้นที่',
    note: description || 'คลังหลักฐานบน Google Drive คลาวด์ ไม่จำกัดพื้นที่'
  };
}

/**
 * Formats a Google Drive sharing link instruction for university teachers
 */
export const GDRIVE_SHARING_INSTRUCTION = {
  title: 'วิธีแชร์ไฟล์/โฟลเดอร์จาก Google Drive มายังระบบ UniWorkload AI',
  steps: [
    'เปิด Google Drive ของท่าน (แนะนำให้ใช้บัญชีมหาวิทยาลัย เช่น @nsru.ac.th หรือ Gmail)',
    'คลิกขวาที่ไฟล์ภาพ, ไฟล์ PDF หรือโฟลเดอร์รูปภาพที่ต้องการ',
    'เลือกเมนู "แชร์" (Share) -> "คัดลอกลิงก์" (Copy link)',
    'ตรวจสอบให้สิทธิ์การเข้าถึงเป็น "ทุกคนที่มีลิงก์มีสิทธิ์ดู" (Anyone with the link can view)',
    'นำลิงก์มาวางในช่องนี้ ระบบจะแสดงพรีวิวและเชื่อมต่อทันทีโดยไม่กินพื้นที่โควตาเครื่อง'
  ],
  benefits: [
    'ความจุไม่จำกัด (Unlimited Storage) ตามโควตา Google Workspace',
    'ประหยัดพื้นที่เบราว์เซอร์ ไม่เกิดปัญหาแคชเต็มหรือ LocalStorage Quota Exceeded',
    'กรรมการประเมิน e-Portfolio สามารถคลิกเข้าไปดูภาพความละเอียดสูงต้นฉบับได้โดยตรง'
  ]
};
