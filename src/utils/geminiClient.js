/**
 * Gemini AI Client for UniWorkload AI
 * รองรับทั้ง:
 * 1. Local Antigravity OpenAI Bridge (Port 8080: gemini-3.6-flash-high / gemini-3.8-flash-high)
 * 2. Direct Google Gemini API (gemini-1.5-flash / gemini-2.5-flash ผ่าน API Key)
 * 3. Fallback ออฟไลน์ไร้รอยต่อ (Zero Single Point of Failure)
 */

export const AI_MODES = {
  GEMINI: 'gemini',
  LOCAL: 'local'
};

export const SUPPORTED_MODELS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (เสถียร รวดเร็ว ฉลาดวิเคราะห์ลึก — แนะนำ)' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro (วิเคราะห์เอกสารซับซ้อน คิดเหตุผลระดับสูง)' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash (เวอร์ชัน 2.0 ความเร็วสูง)' },
  { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash Lite (ประหยัดโควตา ตอบสนองฉับไว)' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (เวอร์ชันคลาสสิก โควตากว้าง)' },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (เวอร์ชันโปร 1.5)' },
  { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash (Next-Gen Flash Preview)' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash (ความเร็วสูง ประสิทธิภาพเด่น Preview)' },
  { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash High (ความฉลาดขั้นสูง Antigravity Bridge)' }
];

const STORAGE_KEYS = {
  MODE: 'uniworkload_ai_engine_mode',
  API_KEY: 'uniworkload_gemini_api_key',
  BASE_URL: 'uniworkload_gemini_base_url',
  MODEL: 'uniworkload_gemini_model'
};

// ค่าเริ่มต้น
const DEFAULT_CONFIG = {
  mode: AI_MODES.GEMINI,
  baseUrl: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? '/ai-proxy/v1' : '',
  fallbackBaseUrl: 'http://127.0.0.1:8080/v1',
  model: 'gemini-2.5-flash',
  apiKey: ''
};

/**
 * ดึงการตั้งค่า AI ปัจจุบัน
 */
export function getAiSettings() {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  const storedKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
  const envKey = (typeof import.meta !== 'undefined' && import.meta.env) ? (import.meta.env.VITE_GEMINI_API_KEY || '') : '';
  const apiKey = storedKey || envKey || '';

  return {
    mode: localStorage.getItem(STORAGE_KEYS.MODE) || DEFAULT_CONFIG.mode,
    apiKey,
    baseUrl: localStorage.getItem(STORAGE_KEYS.BASE_URL) || DEFAULT_CONFIG.baseUrl,
    model: localStorage.getItem(STORAGE_KEYS.MODEL) || DEFAULT_CONFIG.model
  };
}

/**
 * บันทึกการตั้งค่า AI
 */
export function saveAiSettings({ mode, apiKey, baseUrl, model }) {
  if (typeof window === 'undefined') return;
  if (mode !== undefined) localStorage.setItem(STORAGE_KEYS.MODE, mode);
  if (apiKey !== undefined) localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
  if (baseUrl !== undefined) localStorage.setItem(STORAGE_KEYS.BASE_URL, baseUrl);
  if (model !== undefined) localStorage.setItem(STORAGE_KEYS.MODEL, model);
}

/**
 * ทดสอบการเชื่อมต่อกับ Gemini Engine (Serverless Secure Proxy, Direct Google API หรือ Local Bridge)
 */
export async function checkGeminiStatus() {
  const config = getAiSettings();

  // 1. ตรวจสอบ Direct Google API Key ก่อน หากผู้ใช้กรอกไว้เองในหน้าบ้าน
  if (config.apiKey && (config.apiKey.startsWith('AIza') || config.apiKey.length >= 25)) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${config.apiKey}`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        const availableModels = (data.models || []).map(m => m.name.replace('models/', ''));
        return {
          online: true,
          type: 'google_direct',
          endpoint: 'generativelanguage.googleapis.com',
          model: config.model || 'gemini-1.5-flash',
          message: 'เชื่อมต่อ Google Gemini Flash API ตรงสำเร็จ',
          modelsAvailable: availableModels
        };
      } else {
        const errJson = await res.json().catch(() => ({}));
        return {
          online: false,
          type: 'google_direct_error',
          message: errJson.error?.message || `API Key ไม่ถูกต้อง (${res.status})`
        };
      }
    } catch (err) {
      return {
        online: false,
        type: 'network_error',
        message: 'ไม่สามารถติดต่อ Google Gemini API: ' + err.message
      };
    }
  }

  // 2. ตรวจสอบ Serverless Secure AI Proxy (/api/ai/gemini)
  if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      const res = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'ping' }],
          maxTokens: 5
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          online: true,
          type: 'serverless_proxy',
          endpoint: '/api/ai/gemini (Cloud Secure)',
          model: config.model || 'gemini-1.5-flash',
          message: 'เชื่อมต่อ Google Gemini ผ่าน Serverless Secure Proxy สำเร็จ (กุญแจปลอดภัยบนคลาวด์)'
        };
      }
    } catch {
      // continue to local check
    }
  }

  // 3. หากทำงานบน Localhost ตรวจสอบ Local Bridge (Port 8080)
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocalHost && config.baseUrl) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${config.baseUrl}/models`, {
        headers: { 'Authorization': `Bearer ${config.apiKey || 'sk-antigravity'}` },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          online: true,
          type: 'local_bridge',
          endpoint: config.baseUrl,
          model: config.model,
          message: 'เชื่อมต่อ Local Antigravity Bridge (Port 8080) สำเร็จ'
        };
      }
    } catch {
      // ลองต่อตรง 8080
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('http://127.0.0.1:8080/v1/models', {
          headers: { 'Authorization': `Bearer ${config.apiKey || 'sk-antigravity'}` },
          signal: controller.signal
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          return {
            online: true,
            type: 'local_bridge_direct',
            endpoint: 'http://127.0.0.1:8080/v1',
            model: config.model,
            message: 'เชื่อมต่อ Local Port 8080 ตรงสำเร็จ'
          };
        }
      } catch {
        // Offline
      }
    }
  }

  return {
    online: false,
    type: 'not_configured',
    message: 'ยังไม่ได้ระบุ Gemini API Key (กำลังใช้งาน Local Heuristic Engine สำรอง)'
  };
}

/**
 * ส่งคำขอ Chat Completion เข้าสู่ Gemini ผ่าน Serverless Secure Proxy, Direct Google API หรือ Local Bridge
 */
async function callGeminiApi({ messages, temperature = 0.2, maxTokens = 2000, timeoutMs = 35000 }) {
  const config = getAiSettings();

  // 1. Google Direct API (หากผู้ใช้ระบุคีย์ตรงในเครื่อง)
  if (config.apiKey && (config.apiKey.startsWith('AIza') || config.apiKey.length >= 25)) {
    return callGoogleDirectApi({ 
      messages, 
      apiKey: config.apiKey, 
      temperature,
      model: config.model || 'gemini-1.5-flash'
    });
  }

  // 2. Serverless Secure Proxy (/api/ai/gemini)
  if (typeof window !== 'undefined' && window.location.protocol.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch('/api/ai/gemini', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          temperature,
          maxTokens,
          model: config.model || 'gemini-1.5-flash'
        }),
        signal: controller.signal
      });
      clearTimeout(timer);

      if (response.ok) {
        const data = await response.json();
        if (data.content) return data.content;
      }
    } catch (err) {
      console.warn('[GeminiClient] Serverless proxy call skipped/failed, trying local bridge...', err);
    }
  }

  // 3. Local Antigravity Bridge (เฉพาะเครื่องที่มี port 8080 รันอยู่)
  const isLocalHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  if (isLocalHost || (config.apiKey && config.apiKey.startsWith('sk-'))) {
    const endpointsToTry = Array.from(new Set([
      config.baseUrl,
      'http://127.0.0.1:8080/v1'
    ])).filter(Boolean);

    for (const endpoint of endpointsToTry) {
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        const response = await fetch(`${endpoint}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${config.apiKey || 'sk-antigravity'}`
          },
          body: JSON.stringify({
            model: config.model || 'gemini-1.5-flash',
            messages,
            temperature,
            max_tokens: maxTokens
          }),
          signal: controller.signal
        });
        clearTimeout(timer);

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content || '';
          if (content) return content;
        }
      } catch (err) {
        // try next
      }
    }
  }

  throw new Error('ไม่พบ Gemini API Key หรือเครื่องนี้ไม่สามารถเข้าถึง Local Port 8080 ได้ กรุณาระบุ Gemini API Key ในการตั้งค่า AI');
}

/**
 * เรียก Google Generative AI REST API แบบตรง (CORS Support 100% จากเบราว์เซอร์)
 */
async function callGoogleDirectApi({ messages, apiKey, temperature = 0.2, model = 'gemini-1.5-flash' }) {
  const systemMsg = messages.find(m => m.role === 'system')?.content || '';
  const contents = messages
    .filter(m => m.role !== 'system')
    .map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

  const requestBody = {
    contents,
    generationConfig: {
      temperature
    }
  };
  if (systemMsg) {
    requestBody.systemInstruction = { parts: [{ text: systemMsg }] };
  }

  // ลำดับโมเดลสำรองถ้าโมเดลแรกไม่พบ
  const modelsToTry = Array.from(new Set([
    model,
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ])).filter(Boolean);

  let lastError = null;

  for (const m of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${m}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (response.ok) {
        const data = await response.json();
        const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (candidate) return candidate;
      } else {
        const errorText = await response.text();
        lastError = new Error(`Google Gemini API (${m}): ${response.status} ${errorText}`);
      }
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error('Google Gemini API ไม่สามารถประมวลผลได้');
}

/**
 * ให้ Gemini สกัดและแปลงข้อมูลคำสั่งราชการเป็น JSON ที่ถูกต้อง 100%
 */
export async function parseOfficialOrderWithGemini(rawOcrText, filename = '', facultyList = [], activeFaculty = null) {
  const facultyNames = facultyList.map(f => f.name).join(', ');

  const systemPrompt = `คุณคือ AI ผู้เชี่ยวชาญการวิเคราะห์และตรวจสอบเอกสารคำสั่งราชการภาษาไทย โพสต์ประชาสัมพันธ์ และหนังสือราชการ (มหาวิทยาลัยราชภัฏนครสวรรค์) สำหรับระบบบริหารภาระงานอาจารย์ UniWorkload AI
หน้าที่ของคุณคือรับข้อความ OCR ดิบ หรือข้อความโพสต์/แคปชั่น แล้วสกัดเป็น Structured JSON เท่านั้น

กฎสำคัญในการสกัดข้อมูล:
1. แก้อักขระที่ผิดเพี้ยนจากการสแกน OCR ให้เป็นภาษาไทยทางการที่ถูกต้อง 100% (เช่น "คําสัง" -> "คำสั่ง", "แต่งตัง" -> "แต่งตั้ง", "ปการศึกษา" -> "ปีการศึกษา", "เรือง" หรือ "เรื อง" -> "เรื่อง")
2. สกัด "title" (เรื่อง/ชื่อโครงการ/กิจกรรม) ให้สมบูรณ์และชัดเจน หากไม่มีคำว่าเรื่อง ให้นำหัวข้อหรือประโยคสำคัญของกิจกรรมมาตั้งเป็นชื่อเรื่อง
3. สกัด "orderNumber" เช่น "222/2569", "๐๐๒/๒๕๖๙", "087/2567" หากไม่มีเลขคำสั่งในข้อความ ให้ระบุเป็น "รอระบุเลขที่คำสั่ง" (ห้ามแต่งเลขมั่วเด็ดขาด)
4. แปลงวันที่ พ.ศ. เป็น ค.ศ. ในฟอร์แมต ISO YYYY-MM-DD:
   - "signDate" คือ วันที่สั่งการหรือลงประกาศ
   - "eventDate" คือ วันที่จัดกิจกรรมหรือเริ่มปฏิบัติหน้าที่ (ถ้าไม่มีให้ใช้วันเดียวกับ signDate)
   - "eventEndDate" คือ วันสิ้นสุดกิจกรรม กรณีจัดต่อเนื่องหลายวัน เช่น ระหว่างวันที่ 17 ถึง 20 กันยายน ให้ระบุวันสิ้นสุด (หากจัดวันเดียวให้ส่งวันเดียวกับ eventDate)
5. ระบุเวลา "eventTime" (เช่น "08:30 - 16:30 น." หรือหากไม่ระบุในข้อความให้ส่ง "ไม่ระบุเวลา")
6. ระบุสถานที่ "location" (หากไม่ระบุให้ส่ง "มหาวิทยาลัยราชภัฏนครสวรรค์ (รอระบุสถานที่)")
7. จำแนกหมวดหมู่ กพอ. ให้ตรง 1 ใน 6 หมวด:
   - "การจัดการเรียนการสอน" (categoryCode: "teaching", categoryColor: "amber")
   - "งานวิจัยและงานสร้างสรรค์" (categoryCode: "research", categoryColor: "indigo")
   - "บริการวิชาการแก่สังคม" (categoryCode: "service", categoryColor: "emerald")
   - "ทำนุบำรุงศิลปวัฒนธรรม" (categoryCode: "arts", categoryColor: "rose")
   - "ประกันคุณภาพการศึกษา" (categoryCode: "qa", categoryColor: "blue")
   - "บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย" (categoryCode: "admin", categoryColor: "purple")
8. จับคู่รายชื่ออาจารย์ใน "facultyAssigned" พร้อมระบุบทบาท (roleInOrder) เช่น ประธานกรรมการ, กรรมการ, กรรมการและเลขานุการ, วิทยากร
   (รายชื่ออาจารย์ในระบบที่ควรพิจารณาเป็นพิเศษ: ${facultyNames})
9. คำนวณชั่วโมงภาระงานประมาณการ "estimatedHours" (ประธาน/วิทยากร = 6 ชม., เลขานุการ = 4 ชม., กรรมการ = 3 ชม.)
10. สรุปสาระสำคัญสั้นๆ 1-2 ประโยคใน "summary"

รูปแบบ JSON ที่ต้องส่งกลับ (ห้ามมีข้อความอื่นนอกเหนือจาก JSON):
{
  "orderNumber": "...",
  "title": "...",
  "signDate": "YYYY-MM-DD",
  "eventDate": "YYYY-MM-DD",
  "eventEndDate": "YYYY-MM-DD",
  "eventTime": "...",
  "location": "...",
  "category": "...",
  "categoryCode": "...",
  "categoryColor": "...",
  "estimatedHours": 3,
  "facultyAssigned": [
    { "name": "...", "roleInOrder": "..." }
  ],
  "summary": "..."
}`;

  // จำกัดความยาวของ OCR text ไม่ให้เกิน 3,500 ตัวอักษรเพื่อความเร็วสูงสุด
  const truncatedText = (rawOcrText || '').slice(0, 3500);
  const userPrompt = `ชื่อไฟล์: ${filename}\n\nข้อความสกัดดิบจากเอกสาร:\n${truncatedText}`;

  const responseText = await callGeminiApi({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1
  });

  // ทำความสะอาด JSON block
  let cleanedJson = responseText.trim();
  const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleanedJson = jsonMatch[0];
  } else if (cleanedJson.includes('```json')) {
    cleanedJson = cleanedJson.split('```json')[1].split('```')[0].trim();
  } else if (cleanedJson.includes('```')) {
    cleanedJson = cleanedJson.split('```')[1].split('```')[0].trim();
  }

  const parsed = JSON.parse(cleanedJson);

  // เชื่อมโยง Faculty ID กับระบบ (รองรับทั้ง object และ string)
  const enrichedFacultyAssigned = (parsed.facultyAssigned || []).map((assigned, idx) => {
    const assignedName = typeof assigned === 'string' ? assigned : (assigned.name || '');
    const assignedRole = typeof assigned === 'string' ? 'กรรมการดำเนินงาน' : (assigned.roleInOrder || 'กรรมการดำเนินงาน');

    const matched = facultyList.find(f => {
      const cleanName = f.name.replace(/\([^)]*\)/g, '').trim();
      const lastName = cleanName.split(/\s+/).slice(1).join(' ');
      const firstName = cleanName.split(/\s+/)[0].replace(/^(ผศ\.ดร\.|รศ\.ดร\.|ศ\.ดร\.|ผศ\.|รศ\.|ศ\.|ดร\.|อ\.|อาจารย์)/, '').trim();
      return (firstName && assignedName.includes(firstName)) || (lastName && assignedName.includes(lastName));
    });

    return {
      id: matched ? matched.id : `gemini-fac-${idx + 1}`,
      name: matched ? matched.name : assignedName,
      roleInOrder: assignedRole
    };
  });

  return {
    orderNumber: parsed.orderNumber || 'รอระบุเลขที่คำสั่ง',
    title: parsed.title || (filename && !filename.includes('ข้อความคำสั่ง') ? filename.replace(/\.[^/.]+$/, '') : 'กิจกรรมและภาระงาน (รอระบุชื่อเรื่อง)'),
    signDate: parsed.signDate || new Date().toISOString().split('T')[0],
    eventDate: parsed.eventDate || parsed.signDate || new Date().toISOString().split('T')[0],
    eventEndDate: parsed.eventEndDate || parsed.eventDate || parsed.signDate || new Date().toISOString().split('T')[0],
    eventTime: parsed.eventTime || 'ไม่ระบุเวลา',
    location: parsed.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์ (รอระบุสถานที่)',
    category: parsed.category || 'บริการวิชาการแก่สังคม',
    categoryCode: parsed.categoryCode || 'service',
    categoryColor: parsed.categoryColor || 'emerald',
    estimatedHours: parsed.estimatedHours || 3,
    facultyAssigned: enrichedFacultyAssigned.length > 0 ? enrichedFacultyAssigned : [{
      id: activeFaculty?.id || facultyList[0]?.id || 'fac-1',
      name: activeFaculty?.name || facultyList[0]?.name || 'อาจารย์ผู้รับผิดชอบ',
      roleInOrder: 'ผู้รับผิดชอบโครงการ'
    }],
    summary: parsed.summary || ''
  };
}

/**
 * ระบบ Nohran AI Copilot ขับเคลื่อนด้วย Gemini Flash & Pro (Next-Gen Reasoning)
 */
export async function askGeminiCopilot({ prompt, activeFaculty, orders = [], facultyList = [], chatHistory = [] }) {
  // กรองคำสั่งของอาจารย์ที่กำลังเลือก (ทั้งที่ได้รับมอบหมายตรง หรือเป็นเจ้าของหลัก)
  const facultyOrders = orders.filter(o =>
    !activeFaculty || 
    (o.facultyAssigned || []).some(f => f.id === activeFaculty.id) || 
    o.facultyId === activeFaculty.id
  );

  const missingEvidence = facultyOrders.filter(o => !o.actualPhotos || o.actualPhotos.length === 0);
  const completedOrders = facultyOrders.filter(o => o.status === 'done');
  const upcomingOrders = facultyOrders.filter(o => o.status !== 'done');
  const totalHours = facultyOrders.reduce((sum, o) => sum + (Number(o.workloadHours || o.score || 3)), 0);

  // คำนวณชั่วโมงแยก 6 หมวด ก.พอ. ของ activeFaculty
  const categorySummary = {};
  facultyOrders.forEach(o => {
    const cat = o.category || 'ภาระงานทั่วไป';
    const hrs = Number(o.workloadHours || o.score || 3);
    categorySummary[cat] = (categorySummary[cat] || 0) + hrs;
  });

  const categoryBreakdownText = Object.entries(categorySummary)
    .map(([cat, hrs]) => `  - ${cat}: ${hrs} ชม.`)
    .join('\n');

  // สรุปข้อมูลคำสั่งของอาจารย์ active แบบละเอียด
  const ordersContext = facultyOrders.map((o, i) => {
    const hasPhotos = o.actualPhotos && o.actualPhotos.length > 0;
    const photoCount = o.actualPhotos ? o.actualPhotos.length : 0;
    const assigned = o.facultyAssigned || [];
    const myRoleObj = assigned.find(f => f.id === activeFaculty?.id);
    const myRole = myRoleObj ? (myRoleObj.roleInOrder || 'ผู้รับผิดชอบ') : 'ผู้รับผิดชอบ';
    const allColleagues = assigned.map(f => `${f.name} (${f.roleInOrder || 'กรรมการ'})`).join(', ');
    const files = (o.evidenceFiles || []).map(f => f.name).join(', ');

    return `[คำสั่งของ ${activeFaculty?.name || 'อาจารย์'} รายการที่ ${i + 1}]
- เลขที่คำสั่ง: ${o.orderNumber || 'รอระบุเลขที่คำสั่ง'}
- เรื่อง: ${o.title}
- หมวด ก.พอ.: ${o.category} [รหัส: ${o.categoryCode || 'admin'}] | ภาระงาน: ${o.workloadHours || o.score || 3} ชม.
- วันที่สั่งการ: ${o.signDate || '-'} | วันที่จัดกิจกรรม: ${o.eventDate || o.signDate || '-'} ${o.eventEndDate ? `ถึง ${o.eventEndDate}` : ''}
- เวลา/สถานที่: ${o.eventTime || 'ไม่ระบุเวลา'} ณ ${o.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์'}
- บทบาท: ${myRole}
- คณะกรรมการทั้งหมดในคำสั่ง: ${allColleagues || 'ปฏิบัติหน้าที่เดี่ยว'}
- สถานะ: ${o.status === 'done' ? '✅ เสร็จสิ้นแล้ว' : '⏳ รอดำเนินการ/รอจัดกิจกรรม'}
- รูปถ่ายหลักฐาน: ${hasPhotos ? `📸 แนบแล้ว (${photoCount} รูป)` : '⚠️ ❌ ยังไม่แนบภาพถ่ายหน้างานจริง'}
- เอกสารแนบ: ${files || 'เอกสารคำสั่ง.pdf'}
- รายละเอียด: ${o.fullDescription || o.summary || o.title}`;
  }).join('\n\n');

  // สรุปภาพรวมอาจารย์ทุกท่านในหลักสูตร/คณะ (Faculty Directory)
  const facultyDirectory = (facultyList || []).map(fac => {
    const cleanName = fac.name.replace(/^(ผศ\.ดร\.|รศ\.ดร\.|ดร\.|อ\.|อาจารย์)/, '').trim();
    const facOrders = orders.filter(o => 
      (o.facultyAssigned || []).some(f => f.id === fac.id || (f.name && f.name.includes(cleanName))) ||
      o.facultyId === fac.id
    );
    const hrs = facOrders.reduce((sum, o) => sum + (Number(o.workloadHours || o.score || 3)), 0);
    const withPhotos = facOrders.filter(o => o.actualPhotos && o.actualPhotos.length > 0).length;
    return `• ${fac.name} (${fac.role || 'อาจารย์'} - ${fac.department || ''}): มี ${facOrders.length} คำสั่ง (รวม ${hrs} ชม. กพอ., รูปครบ ${withPhotos}/${facOrders.length})`;
  }).join('\n');

  // ฐานข้อมูลคำสั่งทั้งหมดในระบบ (รวมทุกท่านในคณะ)
  const allOrdersCatalog = orders.map((o, i) => {
    const committee = (o.facultyAssigned || []).map(f => `${f.name} [${f.roleInOrder || 'กรรมการ'}]`).join(', ');
    const photoCount = o.actualPhotos ? o.actualPhotos.length : 0;
    return `[คำสั่ง #${i + 1}]
- เลขที่: ${o.orderNumber || '-'} | เรื่อง: ${o.title}
- วันที่: ${o.eventDate || o.signDate || '-'} ${o.eventEndDate ? `ถึง ${o.eventEndDate}` : ''} | เวลา: ${o.eventTime || '-'}
- สถานที่: ${o.location || 'มรภ.นครสวรรค์'}
- หมวด กพอ.: ${o.category} (${o.workloadHours || o.score || 3} ชม.) | สถานะ: ${o.status === 'done' ? 'เสร็จสิ้น' : 'รอดำเนินการ'}
- กรรมการ/ผู้รับผิดชอบ: ${committee || 'ไม่ระบุ'}
- หลักฐานรูปภาพ: ${photoCount > 0 ? `มีรูป (${photoCount} รูป)` : 'ยังไม่มีรูป'}
- รายละเอียด: ${(o.fullDescription || o.summary || o.title || '').slice(0, 200)}`;
  }).join('\n\n');

  const nowThai = new Date().toLocaleDateString('th-TH', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const systemInstruction = `คุณคือ "ผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)" สหายปัญญาประดิษฐ์อัจฉริยะประจำระบบ UniWorkload AI มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)
คุณมีความรู้รอบตัวขั้นสูงและเข้าใจบริบทมหาวิทยาลัยอย่างลึกซึ้ง:
1. บริหารปฏิทินภาระงาน 2 ทาง (Dual Calendar): วันลงนามคำสั่งราชการ (Sign Date) vs วันจัดกิจกรรมจริง (Event Date) ซิงค์กับ Google Calendar / iCal
2. ภาระงานอาจารย์ตามเกณฑ์ ก.พอ. 6 ด้าน:
   1) การจัดการเรียนการสอน (teaching)
   2) งานวิจัยและงานสร้างสรรค์ (research)
   3) บริการวิชาการแก่สังคม (service)
   4) ทำนุบำรุงศิลปวัฒนธรรม (arts)
   5) บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย (admin)
   6) ประกันคุณภาพการศึกษา (qa)
3. การตรวจเช็คแฟ้มหลักฐาน (Dossier Summary) และการเตรียมข้อมูล 5 ช่องเข้าสู่ระบบ e-Portfolio ของ มรภ.นครสวรรค์

ข้อมูลระบบและสถานการณ์ปัจจุบัน:
- วันที่ปัจจุบัน: ${nowThai} (ค.ศ. ${new Date().toISOString().split('T')[0]})
- อาจารย์ผู้กำลังใช้งาน (Active User): ท่าน${activeFaculty?.name || 'อาจารย์'} (${activeFaculty?.role || 'อาจารย์ประจำหลักสูตร'})
- สังกัด: ${activeFaculty?.department || 'สาขาวิชาเทคโนโลยีสารสนเทศ'} ${activeFaculty?.faculty || 'คณะวิทยาการจัดการ'} มรภ.นครสวรรค์
- สถิติของ ${activeFaculty?.name || 'อาจารย์'}: รวม ${facultyOrders.length} คำสั่ง (${totalHours} ชม. กพอ.), เสร็จสิ้น ${completedOrders.length}, รอดำเนินการ ${upcomingOrders.length}, ขาดรูปถ่าย ${missingEvidence.length} รายการ
- สรุปชั่วโมงแยกหมวดของอาจารย์:
${categoryBreakdownText || '  (ยังไม่มีข้อมูลหมวดงาน)'}

รายชื่อและภาระงานของอาจารย์ทุกท่านในคณะ (Faculty Directory):
${facultyDirectory || '  (ไม่มีข้อมูลรายชื่อ)'}

ฐานข้อมูลคำสั่งภาระงานจริงทั้งหมดในระบบ (${orders.length} รายการ):
${allOrdersCatalog || 'ขณะนี้ยังไม่มีคำสั่งในระบบ'}

กฎเหล็กในการตอบคำถามของโนห์รัน:
1. **ตอบตรงคำถามอย่างชาญฉลาดและเฉียบคม (Direct & Factual)**:
   - อย่ายกเทมเพลตซ้ำซากมาตอบ ให้อ่านจากฐานข้อมูลจริงข้างบนแล้วตอบตรงประเด็นทันที
   - หากถามถึงอาจารย์ท่านอื่นในคณะ (เช่น อ.กฤษณะ, ผศ.ดร.สมชาย, อ.วรัญญา, อ.พิมรา ฯลฯ) ให้ดึงข้อมูลจาก Faculty Directory และคำสั่งทั้งหมดมาตอบว่ามีงานอะไรบ้าง ทำหน้าที่อะไร และมีกี่ชั่วโมง
   - หากถามถึงคำสั่งใด (เช่น "คำสั่ง 1001", "งานปากน้ำโพ", "งาน AI", "งานวันที่ 5 สิงหา") ให้ดึงเลขที่คำสั่ง, เรื่อง, วันที่จัด, สถานที่, กรรมการผู้รับผิดชอบ และสถานะรูปภาพมาตอบให้ครบถ้วน
   - หากถามว่า "ใครเป็นประธาน" หรือ "ใครมีหน้าที่อะไร" ให้ดูจากรายชื่อกรรมการในคำสั่งนั้นแล้วตอบอย่างแม่นยำ
2. **การตรวจจับหลักฐานที่ขาด (Missing Evidence)**:
   - หากถามเรื่อง "ขาดรูป" หรือ "หลักฐาน" ให้สรุปเฉพาะคำสั่งที่ "ยังไม่มีรูป" ชัดเจน พร้อมระบุเลขคำสั่งและชื่อเรื่อง แล้วแนะนำให้กดเข้าไปที่แท็บ "ตู้ลิ้นชักหลักฐาน" เพื่ออัปโหลด
3. **การจัดกิจกรรมและปฏิทิน (Upcoming & Calendar)**:
   - เปรียบเทียบกับวันที่ปัจจุบัน (${nowThai}) เพื่อระบุว่ากิจกรรมใดกำลังจะมาถึงในสัปดาห์นี้หรือเดือนนี้ และกิจกรรมใดผ่านพ้นไปแล้ว
4. **การร่างหนังสือราชการ (Official Memo Drafting)**:
   - หากขอให้ร่างบันทึกข้อความ ให้เขียนฟอร์มบันทึกข้อความมาตรฐานราชการไทยของ มรภ.นครสวรรค์ โดยนำชื่อคำสั่งจริงและข้อมูลจริงมาเติมใส่ฟอร์มให้สมบูรณ์พร้อมคัดลอกไปใช้
5. **น้ำเสียงและบุคลิกภาพ**:
   - สุภาพ นอบน้อม มั่นใจ เฉลียวฉลาด สะท้อนความเป็น AI Companion ผู้พิทักษ์อาจารย์ มีอีโมจิ 🔮 นำหน้าตามเอกลักษณ์ Nohran
   - ใช้ Markdown เช่น หัวข้อตัวหนา, ลิสต์รายการ, ตาราง หรือ Quote Block ให้อ่านง่าย สบายตา`;

  const messages = [
    { role: 'system', content: systemInstruction },
    ...chatHistory.slice(-8).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: prompt }
  ];

  return await callGeminiApi({
    messages,
    temperature: 0.25,
    maxTokens: 2000
  });
}
