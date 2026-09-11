import * as pdfjsLib from 'pdfjs-dist';
import { createWorker } from 'tesseract.js';

// กำหนด Worker สำหรับ PDF.js
try {
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();
} catch (e) {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version || '4.10.38'}/build/pdf.worker.min.mjs`;
}

/**
 * สกัดข้อความจากเอกสารจริง (PDF, ภาพถ่าย, แคปแชต LINE)
 * @param {File} file 
 * @param {Function} onProgress callback (statusObj)
 * @returns {Promise<{ text: string, type: string, pageCount?: number }>}
 */
export async function extractTextFromDocument(file, onProgress = () => {}) {
  const fileName = file.name.toLowerCase();
  const isPdf = file.type === 'application/pdf' || fileName.endsWith('.pdf');

  if (isPdf) {
    onProgress({
      phase: 'pdf_reading',
      progress: 20,
      message: 'กำลังอ่านไฟล์ PDF และตรวจสอบเลเยอร์ข้อความ (Digital Text Layer)...'
    });

    const arrayBuffer = await file.arrayBuffer();
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;

    let extractedText = '';
    for (let pageNum = 1; pageNum <= Math.min(numPages, 5); pageNum++) {
      onProgress({
        phase: 'pdf_reading',
        progress: 20 + Math.round((pageNum / Math.min(numPages, 5)) * 40),
        message: `กำลังสกัดข้อความหน้า ${pageNum} จากทั้งหมด ${numPages} หน้า...`
      });

      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageStrings = textContent.items.map(item => item.str).join(' ');
      extractedText += `\n--- หน้า ${pageNum} ---\n` + pageStrings;
    }

    // หากพบข้อความในเลเยอร์มากกว่า 40 ตัวอักษร แสดงว่าเป็น Digital PDF สมบูรณ์
    if (extractedText.replace(/--- หน้า \d+ ---|\s/g, '').length > 40) {
      onProgress({
        phase: 'complete',
        progress: 100,
        message: `สกัดข้อความภาษาไทยจาก Digital PDF สำเร็จ (${numPages} หน้า)`
      });
      return {
        text: extractedText,
        type: 'digital_pdf',
        pageCount: numPages
      };
    }

    // หากเป็น Scanned PDF (ไม่มีเลเยอร์ข้อความ) ให้แปลงหน้าแรกเป็นภาพแล้วรัน Tesseract OCR
    onProgress({
      phase: 'pdf_rasterize',
      progress: 65,
      message: 'เอกสารเป็นแบบสแกนภาพ (Scanned PDF) กำลังเรนเดอร์หน้าเอกสารเข้าสู่ Tesseract OCR...'
    });

    const firstPage = await pdfDoc.getPage(1);
    const viewport = firstPage.getViewport({ scale: 2.0 }); // 2x เพื่อความคมชัด
    const canvas = document.createElement('canvas');
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    await firstPage.render({ canvasContext: ctx, viewport }).promise;

    const ocrText = await runTesseractOcr(canvas, onProgress);
    return {
      text: ocrText,
      type: 'scanned_pdf_ocr',
      pageCount: numPages
    };
  }

  // หากเป็นไฟล์ภาพ (PNG, JPG, JPEG, WebP, แคป LINE)
  return {
    text: await runTesseractOcr(file, onProgress),
    type: 'image_ocr',
    pageCount: 1
  };
}

/**
 * รัน Tesseract.js OCR ภาษาไทย + อังกฤษ
 */
async function runTesseractOcr(imageSource, onProgress = () => {}) {
  onProgress({
    phase: 'tesseract_init',
    progress: 15,
    message: 'กำลังเริ่มต้นโมเดล AI OCR (Tesseract Neural Network)...'
  });

  const worker = await createWorker(['tha', 'eng'], 1, {
    logger: (m) => {
      if (m.status === 'loading tesseract core') {
        onProgress({ phase: 'init', progress: 25, message: 'กำลังโหลดแกนประมวลผล OCR WebAssembly...' });
      } else if (m.status === 'loading language traineddata') {
        onProgress({ phase: 'lang', progress: 45, message: 'กำลังโหลดโมเดลภาษาไทย (Thai Language Model)...' });
      } else if (m.status === 'recognizing text') {
        const pct = Math.round(50 + (m.progress || 0) * 45);
        onProgress({
          phase: 'recognizing',
          progress: pct,
          message: `กำลังตรวจจับตัวอักษรและเลขไทย (${Math.round((m.progress || 0) * 100)}%)...`
        });
      }
    }
  });

  try {
    const { data: { text } } = await worker.recognize(imageSource);
    await worker.terminate();
    onProgress({
      phase: 'complete',
      progress: 100,
      message: 'OCR ประมวลผลภาพถ่ายเสร็จสมบูรณ์!'
    });
    return text;
  } catch (err) {
    await worker.terminate();
    throw err;
  }
}
