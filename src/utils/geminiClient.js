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
  model: 'gemini-1.5-flash',
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
 * ระบบ Nohran AI Copilot ขับเคลื่อนด้วย Gemini Flash
 */
export async function askGeminiCopilot({ prompt, activeFaculty, orders = [], chatHistory = [] }) {
  const facultyOrders = orders.filter(o =>
    !activeFaculty || (o.facultyAssigned || []).some(f => f.id === activeFaculty.id)
  );

  const missingEvidence = facultyOrders.filter(o => !o.actualPhotos || o.actualPhotos.length === 0);
  const totalHours = facultyOrders.reduce((sum, o) => sum + (o.workloadHours || 3), 0);

  const ordersContext = facultyOrders.map((o, i) => 
    `${i + 1}. [${o.orderNumber}] "${o.title}" | วันที่: ${o.signDate || o.eventDate} | หมวด: ${o.category} (${o.workloadHours || 3} ชม.) | หลักฐานรูปถ่าย: ${o.actualPhotos?.length > 0 ? `แนบแล้ว (${o.actualPhotos.length} รูป)` : 'ยังไม่มีรูป'}`
  ).join('\n');

  const systemInstruction = `คุณคือ "ผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)" ประจำระบบ UniWorkload AI มหาวิทยาลัยราชภัฏนครสวรรค์
คุณกำลังสนทนาและให้คำปรึกษากับ:
- อาจารย์: ${activeFaculty?.name || 'อาจารย์'} (${activeFaculty?.role || 'อาจารย์ประจำหลักสูตร'})
- สังกัด: คณะวิทยาศาสตร์และเทคโนโลยี มหาวิทยาลัยราชภัฏนครสวรรค์
- สถิติภาระงานปัจจุบัน: รวม ${facultyOrders.length} คำสั่ง (${totalHours} ชั่วโมง กพอ.)
- คำสั่งที่ยังขาดรูปภาพหลักฐาน: ${missingEvidence.length} รายการ

รายการคำสั่งและภาระงานจริงของอาจารย์ในระบบ:
${ordersContext || 'ยังไม่มีข้อมูลคำสั่งในระบบ'}

หน้าที่ของคุณ:
1. ตอบคำถามอย่างสุภาพ มืออาชีพ และกระชับ (ใช้น้ำเสียงเป็นกันเอง แบบผู้ช่วย AI อัจฉริยะ มีอีโมจิ 🔮 นำหน้าตามเอกลักษณ์ Nohran)
2. เมื่ออาจารย์ถามเรื่อง "หลักฐานที่ขาด" ให้สรุปเฉพาะคำสั่งที่ยังไม่มีรูปถ่าย และแนะนำให้ไปแนบในตู้ลิ้นชัก
3. เมื่ออาจารย์ถามเรื่อง "สรุปภาระงาน" ให้แจกแจงตามหมวด กพอ. 1-6 และคำนวณชั่วโมงให้ครบถ้วน
4. เมื่ออาจารย์ขอให้ "ร่างบันทึกข้อความ" หรือ "ร่างเอกสาร" ให้ร่างข้อความแบบฟอร์มหนังสือราชการไทย (บันทึกข้อความ) ที่สมบูรณ์แบบ มีส่วนหัว ข้อความเรียน ความเป็นมา และข้อความสั่งการ
5. จัดรูปแบบคำตอบด้วย Markdown อย่างสวยงาม (ตัวหนา รายการข้อย่อย ตาราง หรือกล่องข้อความ)`;

  const messages = [
    { role: 'system', content: systemInstruction },
    ...chatHistory.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text
    })),
    { role: 'user', content: prompt }
  ];

  return await callGeminiApi({
    messages,
    temperature: 0.3,
    maxTokens: 1500
  });
}
