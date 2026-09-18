import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  RotateCcw, 
  Search, 
  Image, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Layers, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  Copy,
  Check,
  Cpu,
  Zap,
  Settings,
  Clock,
  MapPin,
  Tag,
  Key
} from 'lucide-react';
import { WORKLOAD_CATEGORIES } from '../data/mockData';
import { askGeminiCopilot, getAiSettings, saveAiSettings, AI_MODES } from '../utils/geminiClient';
import AiSettingsModal from './AiSettingsModal';

// Thai month dictionary for natural language query parsing
const THAI_MONTHS = [
  { idx: 1, full: 'มกราคม', short: 'ม.ค.', alt: 'มกรา', iso: '01' },
  { idx: 2, full: 'กุมภาพันธ์', short: 'ก.พ.', alt: 'กุมภา', iso: '02' },
  { idx: 3, full: 'มีนาคม', short: 'มี.ค.', alt: 'มีนา', iso: '03' },
  { idx: 4, full: 'เมษายน', short: 'เม.ย.', alt: 'เมษา', iso: '04' },
  { idx: 5, full: 'พฤษภาคม', short: 'พ.ค.', alt: 'พฤษภา', iso: '05' },
  { idx: 6, full: 'มิถุนายน', short: 'มิ.ย.', alt: 'มิถุนา', iso: '06' },
  { idx: 7, full: 'กรกฎาคม', short: 'ก.ค.', alt: 'กรกฎา', iso: '07' },
  { idx: 8, full: 'สิงหาคม', short: 'ส.ค.', alt: 'สิงหา', iso: '08' },
  { idx: 9, full: 'กันยายน', short: 'ก.ย.', alt: 'กันยา', iso: '09' },
  { idx: 10, full: 'ตุลาคม', short: 'ต.ค.', alt: 'ตุลา', iso: '10' },
  { idx: 11, full: 'พฤศจิกายน', short: 'พ.ย.', alt: 'พฤศจิกา', iso: '11' },
  { idx: 12, full: 'ธันวาคม', short: 'ธ.ค.', alt: 'ธันวา', iso: '12' }
];

export default function NohranChatbot({ 
  orders = [], 
  activeFaculty, 
  facultyList = [],
  currentUser,
  onNavigateTab, 
  onJumpToEportfolio,
  onNotify,
  isOpen: externalIsOpen,
  setIsOpen: externalSetIsOpen
}) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
  const setIsOpen = externalSetIsOpen !== undefined ? externalSetIsOpen : setInternalIsOpen;
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  
  const [aiSettings, setAiSettings] = useState(() => getAiSettings());
  const [aiMode, setAiMode] = useState(() => getAiSettings().mode || AI_MODES.GEMINI);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Filter orders for active faculty with robust multi-field matching
  const facultyOrders = orders.filter(o => 
    !activeFaculty || 
    (o.facultyAssigned || []).some(f => f.id === activeFaculty.id || f.name === activeFaculty.name) || 
    o.facultyId === activeFaculty.id ||
    o.faculty_id === activeFaculty.id
  );

  // Fallback to all orders if activeFaculty has none (for demo or admin convenience)
  const targetOrders = facultyOrders.length > 0 ? facultyOrders : orders;

  const initialGreeting = {
    id: 'msg-init',
    sender: 'bot',
    text: `สวัสดีครับ **${activeFaculty?.name || 'อาจารย์'}** 🔮\n\nผมคือ **ผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)** พร้อมช่วยสืบค้นภาระงานตามวัน/เดือน, ตรวจสอบแฟ้มหลักฐานที่ยังขาดรูปถ่าย, สรุปสถิติชั่วโมง ก.พอ., และร่างข้อความสำหรับ e-Portfolio มรภ.นครสวรรค์ ครับ\n\nอาจารย์สามารถพิมพ์คำถาม เช่น *"หางานวันที่ 12 สิงหาคม"*, *"งานไหนยังขาดรูป"*, หรือกดหัวข้อลัดด้านล่างเพื่อเริ่มได้เลยครับ!`,
    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'หางานวันที่ 12 สิงหาคม',
      'มีคำสั่งไหนที่ยังขาดรูปถ่ายหลักฐาน?',
      'สรุปภาพรวมภาระงานของฉัน',
      'ค้นหางานช่วง 1 ม.ค. 67 – 25 มิ.ย. 67',
      'แจกแจงภาระงานตามเกณฑ์ ก.พอ. 1-6'
    ]
  };

  const [messages, setMessages] = useState([initialGreeting]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    if (onNotify) onNotify('คัดลอกข้อความสำเร็จ', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  /**
   * ระบบ Local Intelligence & Thai NLP Engine สำหรับการตอบคำถามภาระงานอย่างชาญฉลาดรอบด้าน
   */
  const generateBotResponse = (query) => {
    const rawQ = query.trim();
    const q = rawQ.toLowerCase();

    // -------------------------------------------------------------
    // 0. Greetings & AI Personality (ทักทาย แนะนำตัว และรายงานสถานะทันที)
    // -------------------------------------------------------------
    if (q.includes('สวัสดี') || q.includes('หวัดดี') || q.includes('hello') || q.includes('hi') || 
        q.includes('โนห์รันคือใคร') || q.includes('คุณคือใคร') || q.includes('ทำอะไรได้บ้าง') || q.includes('ช่วยอะไรได้')) {
      const totalHrs = targetOrders.reduce((sum, o) => sum + (Number(o.workloadHours || o.score || 3)), 0);
      const missingPhotos = targetOrders.filter(o => !o.actualPhotos || o.actualPhotos.length === 0).length;
      return {
        text: `สวัสดีครับท่านอาจารย์ **${activeFaculty?.name || ''}** 🔮\n\nผมคือ **ผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)** สหายคู่คิดประจำระบบ UniWorkload AI มหาวิทยาลัยราชภัฏนครสวรรค์ ครับ\n\nขณะนี้ผมดูแลข้อมูลคำสั่งของอาจารย์อยู่ **${targetOrders.length} คำสั่ง** (ภาระงานรวม **${totalHrs} ชั่วโมง ก.พอ.**) โดยมีสถานะความพร้อมของภาพถ่ายหลักฐานดังนี้ครับ:\n• ✅ แนบภาพถ่ายครบถ้วน: **${targetOrders.length - missingPhotos}** คำสั่ง\n• ⚠️ ยังขาดภาพถ่ายหน้างาน: **${missingPhotos}** คำสั่ง\n\nอาจารย์สามารถสั่งให้ผมช่วยงานเหล่านี้ได้ทันทีครับ:\n1. 🔍 **สืบค้นคำสั่งเจาะจง**: เช่น พิมพ์เลขคำสั่ง *"1001"*, *"1042"* หรือ *"แห่เจ้าพ่อ"*\n2. 📸 **ตรวจเช็คหลักฐาน**: เช่น *"มีคำสั่งไหนยังขาดรูป?"*\n3. 🗓️ **ค้นหาตามกำหนดการ**: เช่น *"หางานวันที่ 12 สิงหาคม"*\n4. 📊 **สรุปสถิติ ก.พอ. 6 ด้าน**: เช่น *"แจกแจงเกณฑ์ ก.พอ. 1-6"*\n5. 📝 **ร่างหนังสือราชการ**: เช่น *"ร่างบันทึกข้อความส่งงาน"*\n6. 💼 **เตรียมข้อมูล e-Portfolio**: เช่น *"เตรียมข้อมูล 5 ช่อง"*`,
        suggestions: [
          'มีคำสั่งไหนที่ยังขาดรูปถ่ายหลักฐาน?',
          'หางานวันที่ 12 สิงหาคม',
          'สรุปภาพรวมภาระงานของฉัน',
          'แจกแจงภาระงานตามเกณฑ์ ก.พอ. 1-6',
          'ร่างบันทึกข้อความส่งหลักฐานภาระงาน'
        ]
      };
    }

    // -------------------------------------------------------------
    // 1. Specific Order Number Lookup (สืบค้นด้วยเลขคำสั่งโดยตรง เช่น 1001, 1002, 1042, 222, 0895)
    // -------------------------------------------------------------
    const thaiDigits = { '๐':'0', '๑':'1', '๒':'2', '๓':'3', '๔':'4', '๕':'5', '๖':'6', '๗':'7', '๘':'8', '๙':'9' };
    const normalizedDigits = rawQ.replace(/[๐-๙]/g, ch => thaiDigits[ch] || ch);
    const numberMatches = normalizedDigits.match(/\b\d{1,4}(?:\/\d{2,4})?\b/g);

    let matchedOrder = null;
    if (numberMatches) {
      for (const numStr of numberMatches) {
        const cleanNum = numStr.replace(/^0+/, '');
        matchedOrder = orders.find(o => {
          const oNum = (o.orderNumber || '').replace(/[๐-๙]/g, ch => thaiDigits[ch] || ch);
          return oNum.includes(numStr) || (cleanNum && oNum.includes(cleanNum));
        });
        if (matchedOrder) break;
      }
    }

    if (matchedOrder) {
      const ord = matchedOrder;
      const hasPhotos = ord.actualPhotos && ord.actualPhotos.length > 0;
      const photoCount = ord.actualPhotos ? ord.actualPhotos.length : 0;
      const assigned = ord.facultyAssigned || [];
      const roleObj = assigned.find(f => f.id === activeFaculty?.id);
      const role = roleObj ? (roleObj.roleInOrder || 'ผู้รับผิดชอบ') : (assigned[0]?.roleInOrder || 'ผู้รับผิดชอบ');
      const colleagues = assigned.map(f => `${f.name} (${f.roleInOrder || 'กรรมการ'})`).join(', ');
      const displayDate = ord.eventDateDisplay || ord.eventDate || ord.signDate || '-';

      let text = `📄 **รายละเอียดคำสั่ง [${ord.orderNumber}]**\n\n`;
      text += `**เรื่อง**: ${ord.title}\n\n`;
      if (ord.fullDescription && ord.fullDescription !== ord.title) {
        text += `• 📝 **สาระสำคัญ**: ${ord.fullDescription.slice(0, 160)}...\n`;
      }
      text += `• 💼 **หมวดภาระงาน**: ${ord.category} (${ord.workloadHours || ord.score || 3} ชั่วโมง)\n`;
      text += `• 🗓️ **กำหนดการจัดงาน**: ${displayDate} (${ord.eventTime || '08:30 - 16:30 น.'})\n`;
      if (ord.signDate && ord.signDate !== ord.eventDate) {
        text += `• 🟦 **วันลงนามคำสั่ง (Sign Date)**: ${ord.signDate}\n`;
      }
      text += `• 📍 **สถานที่จัดงาน**: ${ord.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์'}\n`;
      text += `• 👤 **บทบาทหน้าที่**: ${role}\n`;
      if (colleagues) text += `• 👥 **ผู้ร่วมปฏิบัติงาน**: ${colleagues}\n`;
      text += `• 📸 **หลักฐานรูปถ่าย**: ${hasPhotos ? `✅ แนบแล้ว (${photoCount} ภาพ)` : '⚠️ **ยังไม่ได้แนบรูปถ่ายหน้างานจริง**'}\n`;
      text += `• 📁 **เอกสารแนบ**: ${(ord.evidenceFiles || []).map(f => f.name).join(', ') || 'เอกสารคำสั่ง.pdf'}\n`;
      text += `• ⚡ **สถานะการปฏิบัติงาน**: ${ord.status === 'done' ? '✅ เสร็จสิ้นแล้ว' : '⏳ รอดำเนินการ/รอจัดกิจกรรม'}\n\n`;

      if (!hasPhotos) {
        text += `💡 *โนห์รันแนะนำให้อาจารย์กดปุ่มด้านล่างเพื่อเปิดตู้ลิ้นชักและแนบภาพถ่ายหน้างานจริงให้พร้อมสำหรับประเมิน e-Portfolio ครับ*`;
      } else {
        text += `🌟 *หลักฐานรายการนี้แนบครบถ้วน พร้อมสำหรับการจัดทำเล่มรายงานและประเมิน e-Portfolio ครับ!*`;
      }

      return {
        text,
        actions: [
          { label: 'เปิดดูในตู้ลิ้นชัก', tab: 'drawer', icon: 'Layers' },
          { label: 'ดูใน e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' },
          { label: 'ดูในปฏิทินงาน 2 ทาง', tab: 'calendar', icon: 'Calendar' }
        ]
      };
    }

    // -------------------------------------------------------------
    // 2. Missing Photo Evidence Query (ตรวจแฟ้มที่ยังขาดรูปถ่าย)
    // -------------------------------------------------------------
    if (q.includes('ขาดรูป') || q.includes('ไม่มีรูป') || q.includes('ยังไม่แนบ') || (q.includes('หลักฐาน') && (q.includes('ขาด') || q.includes('ยังไม่')))) {
      const missingEvidenceOrders = targetOrders.filter(o => !o.actualPhotos || o.actualPhotos.length === 0);
      
      if (missingEvidenceOrders.length === 0) {
        return {
          text: `🎉 **ยอดเยี่ยมมากครับอาจารย์!** ขณะนี้คำสั่งทุกรายการของอาจารย์ (${targetOrders.length} รายการ) **แนบภาพถ่ายหลักฐานครบถ้วน 100%** แล้วครับ พร้อมส่งประเมิน e-Portfolio ได้ทันที`,
          actions: [
            { label: 'เปิดดูตู้ลิ้นชักทั้งหมด', tab: 'drawer', icon: 'Layers' },
            { label: 'เปิด e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' }
          ]
        };
      }

      let responseText = `⚠️ **พบ ${missingEvidenceOrders.length} คำสั่งที่ยังไม่ได้แนบรูปถ่ายหน้างานจริงครับ:**\n\n`;
      missingEvidenceOrders.forEach((ord, index) => {
        const thaiDate = ord.eventDateDisplay || ord.eventDate || ord.signDate || '-';
        responseText += `**${index + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
        responseText += `• วันที่: ${thaiDate} | หมวด: ${ord.category}\n`;
        responseText += `• สถานะ: ⚠️ *รอแนบภาพถ่ายหน้างานจริง*\n\n`;
      });
      responseText += `💡 *คำแนะนำ*: อาจารย์สามารถไปที่แท็บ **"ตู้ลิ้นชักหลักฐาน"** แล้วคลิกปุ่ม **"แนบรูปถ่าย"** เพื่อแนบภาพกิจกรรมได้ทันทีครับ`;

      return {
        text: responseText,
        actions: [
          { label: 'ไปที่ตู้ลิ้นชักเพื่อแนบรูป', tab: 'drawer', icon: 'Layers' },
          { label: 'เปิด e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' }
        ]
      };
    }

    // -------------------------------------------------------------
    // 3. Intelligent Thai Date & Calendar Lookup (เช่น "12 สิงหาคม", "12 ส.ค.", "วันแม่")
    // -------------------------------------------------------------
    let detectedMonth = null;
    let detectedDay = null;

    if (q.includes('วันแม่') || q.includes('เฉลิมพระชนมพรรษา 12 สิงหา') || q.includes('12 สิงหา')) {
      detectedDay = 12;
      detectedMonth = THAI_MONTHS.find(m => m.idx === 8);
    } else if (q.includes('วันพ่อ')) {
      detectedDay = 5;
      detectedMonth = THAI_MONTHS.find(m => m.idx === 12);
    } else {
      for (const m of THAI_MONTHS) {
        if (q.includes(m.full) || q.includes(m.short) || q.includes(m.alt)) {
          detectedMonth = m;
          break;
        }
      }

      const dayMatch = q.match(/(?:วันที่\s*|วัน\s*|^|\s)([0-9]{1,2})(?:\s|[\/.-]|$)/);
      if (dayMatch) {
        const d = parseInt(dayMatch[1], 10);
        if (d >= 1 && d <= 31) {
          detectedDay = d;
        }
      }
    }

    if (detectedMonth || detectedDay) {
      const matches = targetOrders.filter(o => {
        const textToSearch = [
          o.fullDescription || '',
          o.location || '',
          o.eventDateDisplay || '',
          o.eventDate || '',
          o.signDate || '',
          o.title || ''
        ].join(' ').toLowerCase();

        let dayMatches = true;
        let monthMatches = true;

        if (detectedDay) {
          const dayStr = String(detectedDay);
          const dayPad = dayStr.padStart(2, '0');
          const hasDayInText = textToSearch.includes(` ${dayStr} `) || 
                              textToSearch.includes(`วันที่ ${dayStr}`) || 
                              textToSearch.includes(`${dayStr} ${detectedMonth ? detectedMonth.full : ''}`) ||
                              textToSearch.includes(`${dayStr} ${detectedMonth ? detectedMonth.short : ''}`) ||
                              textToSearch.includes(`${dayStr} ${detectedMonth ? detectedMonth.alt : ''}`) ||
                              (o.eventDate && (o.eventDate.endsWith(`-${dayPad}`) || o.eventDate.includes(`-${dayPad} `)));
          
          dayMatches = Boolean(hasDayInText);
        }

        if (detectedMonth) {
          const hasMonth = textToSearch.includes(detectedMonth.full) || 
                           textToSearch.includes(detectedMonth.short) || 
                           textToSearch.includes(detectedMonth.alt) ||
                           (o.eventDate && o.eventDate.includes(`-${detectedMonth.iso}-`)) ||
                           (o.signDate && o.signDate.includes(`-${detectedMonth.iso}-`));
          monthMatches = Boolean(hasMonth);
        }

        return dayMatches && monthMatches;
      });

      if (matches.length > 0) {
        const dateDesc = detectedDay && detectedMonth 
          ? `วันที่ ${detectedDay} ${detectedMonth.full}` 
          : (detectedMonth ? `เดือน${detectedMonth.full}` : `วันที่ ${detectedDay}`);

        let responseText = `📅 **โนห์รันสืบค้นพบคำสั่งภาระงานที่ตรงกับ "${dateDesc}" ทั้งหมด ${matches.length} รายการครับ:**\n\n`;
        
        matches.forEach((ord, idx) => {
          const hasPhotos = ord.actualPhotos && ord.actualPhotos.length > 0;
          const photoStatus = hasPhotos ? `🟢 มีรูปหลักฐานแล้ว (${ord.actualPhotos.length} รูป)` : `⚠️ ❌ ยังไม่มีรูปถ่ายหน้างาน`;
          const displayDate = ord.eventDateDisplay || ord.eventDate || ord.signDate || '-';
          
          responseText += `**${idx + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
          if (ord.fullDescription && ord.fullDescription !== ord.title) {
            responseText += `• *รายละเอียด*: ${ord.fullDescription.slice(0, 150)}...\n`;
          }
          responseText += `• 🗓️ **กำหนดการ**: ${displayDate} (${ord.eventTime || '08:30 - 16:30 น.'})\n`;
          if (ord.location) {
            responseText += `• 📍 **สถานที่**: ${ord.location.slice(0, 100)}\n`;
          }
          responseText += `• 💼 **หมวดภาระงาน**: ${ord.category} | ${photoStatus}\n\n`;
        });

        return {
          text: responseText,
          actions: [
            { label: 'ดูรายละเอียดในตู้ลิ้นชัก', tab: 'drawer', icon: 'Layers' },
            { label: 'เปิดปฏิทินภาระงาน', tab: 'calendar', icon: 'Calendar' }
          ]
        };
      } else if (detectedMonth) {
        const monthOnlyMatches = targetOrders.filter(o => {
          const textToSearch = [
            o.fullDescription || '',
            o.location || '',
            o.eventDateDisplay || '',
            o.eventDate || '',
            o.signDate || '',
            o.title || ''
          ].join(' ').toLowerCase();

          return textToSearch.includes(detectedMonth.full) || 
                 textToSearch.includes(detectedMonth.short) || 
                 textToSearch.includes(detectedMonth.alt) ||
                 (o.eventDate && o.eventDate.includes(`-${detectedMonth.iso}-`));
        });

        if (monthOnlyMatches.length > 0) {
          let responseText = `📅 **ในวันที่ ${detectedDay || ''} ${detectedMonth.full} ไม่พบคำสั่งภาระงานที่ระบุกำหนดจัดในวันดังกล่าวโดยตรงครับ**\n\n`;
          responseText += `อย่างไรก็ตาม ในช่วง**เดือน${detectedMonth.full}** ท่านอาจารย์มีภาระงานที่เกี่ยวข้องทั้งหมด **${monthOnlyMatches.length} รายการ** ดังนี้ครับ:\n\n`;
          
          monthOnlyMatches.slice(0, 5).forEach((ord, idx) => {
            const displayDate = ord.eventDateDisplay || ord.eventDate || ord.signDate || '-';
            responseText += `**${idx + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
            responseText += `• วันที่: ${displayDate} | หมวด: ${ord.category}\n\n`;
          });

          if (monthOnlyMatches.length > 5) {
            responseText += `*(และยังมีคำสั่งอื่นในเดือน${detectedMonth.full}อีก ${monthOnlyMatches.length - 5} รายการในตู้ลิ้นชัก)*\n`;
          }

          return {
            text: responseText,
            actions: [
              { label: `เปิดดูงานเดือน${detectedMonth.short}ในตู้ลิ้นชัก`, tab: 'drawer', icon: 'Layers' }
            ]
          };
        }
      }
    }

    // -------------------------------------------------------------
    // 4. Role Inquiries (ค้นหาภาระงานตามบทบาท เช่น วิทยากร, ประธาน, กรรมการ)
    // -------------------------------------------------------------
    if (q.includes('วิทยากร') || q.includes('ประธาน') || q.includes('กรรมการ') || q.includes('เลขา') || q.includes('ผู้รับผิดชอบ')) {
      let matchedRole = 'กรรมการ';
      if (q.includes('วิทยากร')) matchedRole = 'วิทยากร';
      else if (q.includes('ประธาน')) matchedRole = 'ประธาน';
      else if (q.includes('เลขา')) matchedRole = 'เลขานุการ';
      else if (q.includes('ผู้รับผิดชอบ')) matchedRole = 'ผู้รับผิดชอบ';

      const roleOrders = targetOrders.filter(o => {
        const assigned = o.facultyAssigned || [];
        const myRole = assigned.find(f => f.id === activeFaculty?.id)?.roleInOrder || '';
        return myRole.includes(matchedRole) || (o.fullDescription || '').includes(matchedRole) || (o.title || '').includes(matchedRole);
      });

      if (roleOrders.length > 0) {
        let text = `👤 **คำสั่งที่ท่านอาจารย์ปฏิบัติหน้าที่ในฐานะ "${matchedRole}" (พบ ${roleOrders.length} รายการ):**\n\n`;
        roleOrders.forEach((ord, i) => {
          const displayDate = ord.eventDateDisplay || ord.eventDate || ord.signDate || '-';
          text += `**${i + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
          text += `• วันที่: ${displayDate} | หมวด: ${ord.category} (${ord.workloadHours || ord.score || 3} ชม.)\n\n`;
        });

        return {
          text,
          actions: [
            { label: 'เปิดดูในตู้ลิ้นชัก', tab: 'drawer', icon: 'Layers' },
            { label: 'ดูใน e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' }
          ]
        };
      }
    }

    // -------------------------------------------------------------
    // 5. Faculty Colleague Inquiries (ค้นหาภาระงานของอาจารย์ท่านอื่น)
    // -------------------------------------------------------------
    const colleague = (FACULTY_MEMBERS || []).find(f => 
      f.id !== activeFaculty?.id && (
        q.includes(f.name.toLowerCase()) || 
        (f.name.includes('พิมรา') && q.includes('พิมรา')) ||
        (f.name.includes('ธนภัทร') && q.includes('ธนภัทร')) ||
        (f.name.includes('สมชาย') && q.includes('สมชาย')) ||
        (f.name.includes('วรัญญา') && q.includes('วรัญญา')) ||
        (f.name.includes('กฤษณะ') && q.includes('กฤษณะ'))
      )
    );

    if (colleague) {
      const colleagueOrders = orders.filter(o => 
        (o.facultyAssigned || []).some(f => f.id === colleague.id || f.name === colleague.name) ||
        o.facultyId === colleague.id
      );

      let text = `👤 **ข้อมูลภาระงานของ ${colleague.name} (${colleague.role || 'อาจารย์'}):**\n\n`;
      text += `• สังกัด: ${colleague.department || 'คณะวิทยาการจัดการ'} ${colleague.faculty || ''}\n`;
      text += `• จำนวนคำสั่งที่เกี่ยวข้องในระบบ: **${colleagueOrders.length}** รายการ\n\n`;

      if (colleagueOrders.length > 0) {
        text += `**รายการคำสั่งสำคัญ:**\n`;
        colleagueOrders.slice(0, 4).forEach((ord, i) => {
          text += `${i + 1}. [${ord.orderNumber}] ${ord.title} (${ord.category})\n`;
        });
      } else {
        text += `*(ขณะนี้ยังไม่มีคำสั่งที่มอบหมายให้ท่านอาจารย์ในระบบฐานข้อมูล)*\n`;
      }

      return {
        text,
        actions: [{ label: 'เปิดดูตู้ลิ้นชักคำสั่งรวม', tab: 'drawer', icon: 'Layers' }]
      };
    }

    // -------------------------------------------------------------
    // 6. Dual Calendar & iCal System
    // -------------------------------------------------------------
    if (q.includes('ปฏิทิน') || q.includes('calendar') || q.includes('ical') || q.includes('สองทาง') || q.includes('dual')) {
      let text = `🗓️ **ระบบปฏิทินภาระงาน 2 ทาง (Dual Calendar Innovation):**\n\n`;
      text += `UniWorkload AI แก้ไขปัญหาความสับสนของวันสั่งการและวันจัดกิจกรรมด้วยการแยก 2 เลเยอร์ชัดเจน:\n\n`;
      text += `• 🟦 **เลเยอร์สีน้ำเงิน (Sign Date)**: วันที่มหาวิทยาลัยออกคำสั่ง (ใช้อ้างอิงราชการ)\n`;
      text += `• 🟩 **เลเยอร์สีเขียว (Event Date)**: วันที่อาจารย์ต้องไปปฏิบัติหน้าที่จริงหน้างาน\n\n`;
      text += `📲 **การเชื่อมต่อ iCal Feed**: อาจารย์สามารถกดปุ่ม **"iCal Feed"** ด้านล่าง หรือในหน้าปฏิทิน เพื่อนำลิงก์ไป Subscribe ใน Google Calendar หรือ iPhone Calendar ได้ทันทีครับ`;

      return {
        text,
        actions: [
          { label: 'เปิดปฏิทินภาระงาน 2 ทาง', tab: 'calendar', icon: 'Calendar' }
        ]
      };
    }

    // -------------------------------------------------------------
    // 7. e-Portfolio & Dossier Explanation
    // -------------------------------------------------------------
    if (q.includes('พอร์ต') || q.includes('e-portfolio') || q.includes('eportfolio') || q.includes('5 ช่อง') || q.includes('dossier')) {
      let text = `💼 **ระบบ e-Portfolio Copilot & Dossier Summary:**\n\n`;
      text += `UniWorkload AI ออกแบบมาเพื่อเตรียมข้อมูล 5 ช่องเข้าสู่ระบบ e-Portfolio มรภ.นครสวรรค์ ให้อัตโนมัติ:\n\n`;
      text += `1. **ปีการประเมิน**: เช่น 2569\n`;
      text += `2. **รอบการประเมิน**: เช่น รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)\n`;
      text += `3. **หัวข้อ**: ชื่อเรื่องคำสั่งราชการเต็ม\n`;
      text += `4. **อ้างอิงภาระงาน**: หมวด ก.พอ. พร้อมคำนวณสัดส่วนชั่วโมง\n`;
      text += `5. **เอกสารแนบ**: ไฟล์ PDF คำสั่ง และภาพถ่ายหน้างานจริง\n\n`;
      text += `💡 *อาจารย์สามารถกดปุ่มลัด **"คัดลอกทั้งหมด 5 ช่อง"** ในหน้า e-Portfolio แล้วนำไปวางได้ทันทีภายในคลิกเดียวครับ*`;

      return {
        text,
        actions: [
          { label: 'ไปที่หน้า e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' }
        ]
      };
    }

    // -------------------------------------------------------------
    // 8. Workload Categories Breakdown (ก.พอ. 1-6)
    // -------------------------------------------------------------
    if (q.includes('กพอ') || q.includes('ก.พอ') || q.includes('หมวดหมู่') || q.includes('เกณฑ์') || q.includes('ชั่วโมง')) {
      let responseText = `📊 **สรุปการจำแนกภาระงานตามเกณฑ์ ก.พอ. ของ มรภ.นครสวรรค์:**\n\n`;
      
      const catCount = {};
      let totalHours = 0;
      WORKLOAD_CATEGORIES.forEach(c => {
        if (c.id !== 'all') catCount[c.name] = { count: 0, hours: 0 };
      });

      targetOrders.forEach(o => {
        const cat = o.category || 'อื่นๆ';
        const hrs = Number(o.workloadHours || o.score || 3);
        totalHours += hrs;
        if (!catCount[cat]) catCount[cat] = { count: 0, hours: 0 };
        catCount[cat].count++;
        catCount[cat].hours += hrs;
      });

      Object.entries(catCount).forEach(([catName, data]) => {
        if (data.count > 0) {
          const bar = '█'.repeat(Math.min(8, Math.max(1, data.count))) + '░'.repeat(Math.max(0, 8 - data.count));
          responseText += `• **${catName}**: **${data.count}** คำสั่ง (${data.hours} ชม.) \`${bar}\`\n`;
        }
      });

      responseText += `\n🎯 **ภาระงานรวมทั้งสิ้น**: **${totalHours} ชั่วโมง ก.พอ.** จาก ${targetOrders.length} คำสั่ง\n`;
      responseText += `✨ *โนห์รันแนะนำให้อาจารย์ตรวจสอบสัดส่วนชั่วโมงให้ครบตามเกณฑ์สำหรับรอบการประเมินนี้ครับ*`;

      return {
        text: responseText,
        actions: [
          { label: 'ไปที่หน้า e-Portfolio', tab: 'eportfolio', icon: 'FileText' },
          { label: 'เปิดปฏิทินงาน 2 ทาง', tab: 'calendar', icon: 'Calendar' }
        ]
      };
    }

    // -------------------------------------------------------------
    // 9. Overall Summary (สรุปภาพรวม)
    // -------------------------------------------------------------
    if (q.includes('สรุป') || q.includes('ภาพรวม') || q.includes('สถานะ') || q.includes('กี่งาน')) {
      const total = targetOrders.length;
      const completed = targetOrders.filter(o => o.status === 'done').length;
      const upcoming = targetOrders.filter(o => o.status !== 'done').length;
      const withPhotos = targetOrders.filter(o => o.actualPhotos && o.actualPhotos.length > 0).length;
      const pctPhotos = total > 0 ? Math.round((withPhotos / total) * 100) : 0;
      const totalHrs = targetOrders.reduce((sum, o) => sum + (Number(o.workloadHours || o.score || 3)), 0);

      let responseText = `📋 **สรุปภาพรวมภาระงานของ ${activeFaculty?.name || 'อาจารย์'}:**\n\n`;
      responseText += `• 📂 **จำนวนคำสั่งทั้งหมดในระบบ**: **${total}** รายการ\n`;
      responseText += `• ⏱️ **ชั่วโมงภาระงานสะสมรวม**: **${totalHrs}** ชั่วโมง ก.พอ.\n`;
      responseText += `• ✅ **ดำเนินการเสร็จสิ้นแล้ว**: **${completed}** รายการ (${total > 0 ? Math.round((completed/total)*100) : 0}%)\n`;
      responseText += `• ⏳ **อยู่ระหว่างดำเนินการ/รอจัดงาน**: **${upcoming}** รายการ\n`;
      responseText += `• 📸 **ความสมบูรณ์ของภาพถ่ายหลักฐาน**: **${withPhotos}/${total}** รายการ (**${pctPhotos}%**)\n\n`;
      
      if (pctPhotos < 100) {
        responseText += `💡 *โนห์รันแนะนำให้อาจารย์แนบภาพถ่ายให้ครบอีก ${total - withPhotos} รายการก่อนสิ้นสุดรอบการประเมินครับ*`;
      } else {
        responseText += `🌟 *สถานะแฟ้มหลักฐานสมบูรณ์แบบ 100% พร้อมสำหรับการประเมินเลื่อนขั้นเงินเดือนรอบนี้ครับ!*`;
      }

      return {
        text: responseText,
        actions: [
          { label: 'เปิดตู้ลิ้นชักหลักฐาน', tab: 'drawer', icon: 'Layers' },
          { label: 'เปิด e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' }
        ]
      };
    }

    // -------------------------------------------------------------
    // 10. Memo Drafting (ร่างบันทึกข้อความราชการ)
    // -------------------------------------------------------------
    if (q.includes('ร่าง') || q.includes('บันทึกข้อความ') || q.includes('ส่งงาน') || q.includes('หนังสือ')) {
      const firstOrder = targetOrders[0] || (orders && orders[0]);
      const memoText = `บันทึกข้อความ
ส่วนราชการ: ${activeFaculty?.department || 'สาขาวิชาเทคโนโลยีสารสนเทศ'} ${activeFaculty?.faculty || 'คณะวิทยาการจัดการ'} มหาวิทยาลัยราชภัฏนครสวรรค์
ที่: อว 0625.05/พิเศษ                                    วันที่: ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
เรื่อง: ขอส่งรายงานผลการปฏิบัติงานและเอกสารหลักฐานประกอบภาระงาน

เรียน: คณบดี${activeFaculty?.faculty || 'คณะวิทยาการจัดการ'}

ตามที่ มหาวิทยาลัยราชภัฏนครสวรรค์ ได้มีคำสั่งที่ ${firstOrder?.orderNumber || 'มรภ.นว. 1001/2569'} เรื่อง "${firstOrder?.title || 'ปฏิบัติหน้าที่ราชการตามภาระงาน'}" นั้น

ในการนี้ ข้าพเจ้า (${activeFaculty?.name || 'อาจารย์ผู้รับผิดชอบ'}) ได้ปฏิบัติหน้าที่ดังกล่าวเสร็จสิ้นเรียบร้อยแล้ว จึงขอส่งแบบรายงานผลการปฏิบัติงาน พร้อมแนบรูปถ่ายหลักฐานหน้างานและแบบสรุปภาระงาน (Dossier Summary) ดังเอกสารที่แนบมาพร้อมนี้

จึงเรียนมาเพื่อโปรดทราบและพิจารณาให้ความอนุเคราะห์

(ลงชื่อ)....................................................
(${activeFaculty?.name || 'อาจารย์ผู้รับผิดชอบ'})`;

      return {
        text: `📝 **โนห์รันร่างบันทึกข้อความทางการของ มรภ.นครสวรรค์ ให้เรียบร้อยครับ:**\n\n\`\`\`text\n${memoText}\n\`\`\`\n\n*สามารถกดปุ่มคัดลอกด้านบนเพื่อนำไปใช้งานได้ทันทีครับ*`,
        copyable: memoText
      };
    }

    // -------------------------------------------------------------
    // 11. Smart Keyword Token Match (สืบค้นด้วยคีย์เวิร์ด ตัด Stopwords ภาษาไทย)
    // -------------------------------------------------------------
    const thaiStopwords = ['หางาน', 'ช่วยหา', 'ค้นหา', 'ค้น', 'หา', 'มีงานอะไรบ้าง', 'มีอะไรบ้าง', 'ให้หน่อย', 'ช่วยดู', 'หน่อย', 'งาน', 'วันที่', 'วัน', 'ของ', 'ใน', 'ที่', 'ครับ', 'ค่ะ', 'คะ', 'นะ', 'อยากได้'];
    let cleanQuery = q;
    thaiStopwords.forEach(sw => {
      cleanQuery = cleanQuery.replaceAll(sw, ' ');
    });
    const queryTokens = cleanQuery.split(/\s+/).map(t => t.trim()).filter(t => t.length >= 2);

    if (queryTokens.length > 0) {
      const scoredOrders = targetOrders.map(ord => {
        let score = 0;
        const fullText = [
          ord.orderNumber || '',
          ord.title || '',
          ord.fullDescription || '',
          ord.location || '',
          ord.category || '',
          ord.eventDateDisplay || '',
          (ord.facultyAssigned || []).map(f => `${f.name} ${f.roleInOrder}`).join(' ')
        ].join(' ').toLowerCase();

        queryTokens.forEach(token => {
          if (fullText.includes(token)) {
            score += token.length >= 4 ? 3 : 1;
            if ((ord.title || '').toLowerCase().includes(token)) score += 2;
            if ((ord.orderNumber || '').toLowerCase().includes(token)) score += 3;
          }
        });

        return { order: ord, score };
      }).filter(item => item.score > 0);

      scoredOrders.sort((a, b) => b.score - a.score);

      if (scoredOrders.length > 0) {
        let responseText = `🔍 **โนห์รันพบข้อมูลที่เกี่ยวข้องกับ "${rawQ}" ทั้งหมด ${scoredOrders.length} รายการครับ:**\n\n`;
        scoredOrders.slice(0, 5).forEach((item, idx) => {
          const ord = item.order;
          const displayDate = ord.eventDateDisplay || ord.eventDate || ord.signDate || '-';
          responseText += `**${idx + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
          responseText += `• 🗓️ วันที่: ${displayDate} | 💼 หมวด: ${ord.category}\n`;
          if (ord.location) {
            responseText += `• 📍 สถานที่: ${ord.location.slice(0, 90)}\n`;
          }
          responseText += `\n`;
        });

        return {
          text: responseText,
          actions: [
            { label: 'ดูในตู้ลิ้นชักหลักฐาน', tab: 'drawer', icon: 'Layers' }
          ]
        };
      }
    }

    // -------------------------------------------------------------
    // Fallback response with helpful guide
    // -------------------------------------------------------------
    return {
      text: `🔮 **โนห์รันตรวจสอบข้อมูลในระบบ UniWorkload AI ให้แล้วครับ:**\n\nคำถาม: *"${rawQ}"*\n\nไม่พบข้อมูลคำสั่งที่ตรงกับเงื่อนไขข้างต้นโดยตรงครับ ในตู้ลิ้นชักของอาจารย์ขณะนี้มีข้อมูลคำสั่งภาระงาน **${targetOrders.length} รายการ** อาจารย์สามารถสั่งให้ผมทำสิ่งเหล่านี้ได้ครับ:\n\n1. **"หางานวันที่ 12 สิงหาคม"** — ค้นหาภาระงานตามวันและเดือนจัดกิจกรรมจริง\n2. **"มีคำสั่งไหนยังขาดรูปหลักฐาน?"** — ตรวจหาแฟ้มงานที่ยังไม่ได้แนบรูปถ่าย\n3. **"สรุปภาพรวมภาระงาน"** — แจกแจงจำนวนงาน เสร็จสิ้น และรอดำเนินการ\n4. **"แจกแจงเกณฑ์ ก.พอ. 1-6"** — ดูสถิติการสอน วิจัย บริการวิชาการ และศิลปวัฒนธรรม\n5. **"ร่างบันทึกข้อความ"** — สร้างร่างหนังสือส่งงานทางการ มรภ.นว.`,
      suggestions: [
        'หางานวันที่ 12 สิงหาคม',
        'มีคำสั่งไหนที่ยังขาดรูปถ่ายหลักฐาน?',
        'สรุปภาพรวมภาระงานของฉัน',
        'แจกแจงภาระงานตามเกณฑ์ ก.พอ. 1-6'
      ]
    };
  };

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputMessage;
    if (!text.trim()) return;

    const userMsg = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    const currentSettings = getAiSettings();
    const activeEngine = currentSettings.mode || aiMode;

    if (activeEngine === AI_MODES.GEMINI) {
      try {
        const geminiReply = await askGeminiCopilot({
          prompt: text,
          activeFaculty,
          orders,
          facultyList,
          chatHistory: messages
        });

        if (geminiReply && geminiReply.trim()) {
          // Detect appropriate actions based on Gemini response and user prompt
          const inferredActions = [];
          const lowerReply = (geminiReply + ' ' + text).toLowerCase();
          if (lowerReply.includes('ลิ้นชัก') || lowerReply.includes('รูปถ่าย') || lowerReply.includes('ขาดรูป') || lowerReply.includes('แนบรูป')) {
            inferredActions.push({ label: 'เปิดตู้ลิ้นชักหลักฐาน', tab: 'drawer', icon: 'Layers' });
          }
          if (lowerReply.includes('eportfolio') || lowerReply.includes('e-portfolio') || lowerReply.includes('พอร์ต') || lowerReply.includes('5 ช่อง')) {
            inferredActions.push({ label: 'เปิด e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' });
          }
          if (lowerReply.includes('ปฏิทิน') || lowerReply.includes('วันจัดงาน') || lowerReply.includes('calendar') || lowerReply.includes('ical')) {
            inferredActions.push({ label: 'เปิดปฏิทินงาน 2 ทาง', tab: 'calendar', icon: 'Calendar' });
          }
          if (lowerReply.includes('นำเข้า') || lowerReply.includes('ocr') || lowerReply.includes('สแกนคำสั่ง')) {
            inferredActions.push({ label: 'นำเข้าคำสั่งใหม่ (AI OCR)', tab: 'ingestion', icon: 'Sparkles' });
          }

          let copyableText = null;
          if (geminiReply.includes('```')) {
            const match = geminiReply.match(/```(?:text)?([\s\S]*?)```/);
            if (match && match[1]) copyableText = match[1].trim();
          }

          const botMsg = {
            id: `msg-${Date.now() + 1}`,
            sender: 'bot',
            text: geminiReply,
            actions: inferredActions.length > 0 ? inferredActions.slice(0, 2) : undefined,
            copyable: copyableText,
            engine: 'gemini',
            model: currentSettings.model || 'gemini-2.5-flash',
            timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, botMsg]);
          setIsTyping(false);
          return;
        }
      } catch (err) {
        console.warn('Gemini copilot unavailable, falling back to local engine:', err);
      }
    }

    // Local heuristic fallback with intelligent responses
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      const isFallback = activeEngine === AI_MODES.GEMINI;

      let finalText = botResponse.text;
      if (isFallback) {
        finalText += `\n\n*(💡 กำลังตอบด้วย Local Intelligence Engine: สามารถกดไอคอน ⚙️ ด้านบนเพื่อตั้งค่า Gemini API Key สำหรับการวิเคราะห์ภาษาขั้นสูง)*`;
      }

      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: finalText,
        actions: botResponse.actions,
        suggestions: botResponse.suggestions,
        copyable: botResponse.copyable,
        engine: 'local',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 350);
  };

  const handleResetChat = () => {
    setMessages([initialGreeting]);
    if (onNotify) onNotify('รีเซ็ตการสนทนากับโนห์รันเรียบร้อย', 'info');
  };

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-3 px-4 py-3 rounded-full bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-600 text-white shadow-xl shadow-blue-600/30 hover:shadow-2xl hover:shadow-blue-600/40 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-white/20"
          >
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-sky-200 animate-pulse" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-blue-900 animate-ping" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full ring-2 ring-blue-900" />
            </div>

            <div className="text-left pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold tracking-wide">โนห์รัน AI Copilot</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 font-mono">
                  Online
                </span>
              </div>
              <p className="text-[10px] text-blue-100/80">ผู้ช่วยภาระงาน & ค้นหาหลักฐาน</p>
            </div>
          </button>
        </div>
      )}

      {/* Main Chatbot Window */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-white shadow-2xl border border-slate-200 overflow-hidden ${
            isExpanded
              ? 'inset-4 md:inset-10 rounded-3xl'
              : 'bottom-6 right-6 w-[92vw] sm:w-[460px] h-[640px] max-h-[88vh] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-indigo-950 text-white p-3.5 flex items-center justify-between border-b border-blue-900/50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-sky-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                    🔮 โนห์รัน (Nohran AI Copilot)
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                    Active Knowledge
                  </span>
                </div>
                <p className="text-[11px] text-slate-300">
                  ระบบถาม-ตอบภาระงาน & ตรวจสอบหลักฐาน มรภ.นครสวรรค์
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="ตั้งค่า AI Engine & โมเดล Gemini"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="ล้างการสนทนา"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer hidden sm:block"
                title={isExpanded ? 'ย่อหน้าต่าง' : 'ขยายหน้าต่าง'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Context Ribbon */}
          <div className="bg-slate-100/90 border-b border-slate-200 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-600">
            <div className="flex items-center gap-2 truncate">
              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
              <span className="truncate">
                ข้อมูล: <strong>{activeFaculty?.name}</strong> ({targetOrders.length} คำสั่ง)
              </span>
            </div>
            
            <button
              onClick={() => setIsSettingsModalOpen(true)}
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-all border shrink-0 ${
                aiMode === AI_MODES.GEMINI 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                  : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
              }`}
              title="คลิกเพื่อตั้งค่า AI Engine หรือสลับโมเดล"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${aiMode === AI_MODES.GEMINI ? 'bg-indigo-600 animate-pulse' : 'bg-slate-500'}`} />
              <span>{aiMode === AI_MODES.GEMINI ? `⚡ ${aiSettings.model || 'Gemini 2.5 Flash'}` : '🛡️ Local Rule'}</span>
            </button>
          </div>

          {/* Message History Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
            {messages.map((msg, idx) => (
              <div
                key={msg.id || idx}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} space-y-1`}
              >
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 px-1">
                  <span>{msg.sender === 'user' ? 'ท่านอาจารย์' : '🔮 โนห์รัน'}</span>
                  <span>•</span>
                  <span>{msg.timestamp}</span>
                  {msg.engine && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      msg.engine === 'gemini' 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-slate-200 text-slate-600'
                    }`}>
                      {msg.engine === 'gemini' ? (msg.model || 'Gemini 2.5') : 'Local'}
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[92%] sm:max-w-[88%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
                    msg.sender === 'user'
                      ? 'bg-blue-600 text-white rounded-tr-xs'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-slate-200/50'
                  }`}
                >
                  {/* Markdown-style Content Formatting */}
                  <div className="space-y-2 whitespace-pre-wrap">
                    {msg.text.split('\n\n').map((paragraph, pIdx) => {
                      if (paragraph.startsWith('```')) {
                        const cleanCode = paragraph.replace(/```(text)?/g, '').trim();
                        return (
                          <div key={pIdx} className="relative my-2 p-2.5 bg-slate-900 text-slate-100 rounded-xl font-mono text-[11px] overflow-x-auto border border-slate-800">
                            <button
                              onClick={() => handleCopy(cleanCode, pIdx)}
                              className="absolute top-2 right-2 px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedIndex === pIdx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedIndex === pIdx ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                            </button>
                            <pre className="whitespace-pre-wrap">{cleanCode}</pre>
                          </div>
                        );
                      }

                      return (
                        <p key={pIdx}>
                          {paragraph.split('**').map((chunk, cIdx) => 
                            cIdx % 2 === 1 ? <strong key={cIdx} className="font-semibold">{chunk}</strong> : chunk
                          )}
                        </p>
                      );
                    })}
                  </div>

                  {/* Action Buttons if provided */}
                  {msg.actions && msg.actions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5">
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => {
                            if (onNavigateTab) onNavigateTab(act.tab);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] border border-blue-200 transition-colors cursor-pointer active:scale-95"
                        >
                          {act.icon === 'Layers' && <Layers className="w-3 h-3" />}
                          {act.icon === 'FileText' && <FileText className="w-3 h-3" />}
                          {act.icon === 'Calendar' && <Calendar className="w-3 h-3" />}
                          {act.icon === 'LayoutDashboard' && <Sparkles className="w-3 h-3" />}
                          <span>{act.label}</span>
                          <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Suggestion Chips */}
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 mb-1.5 font-medium">คำถามที่แนะนำ:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.suggestions.map((sug, sIdx) => (
                          <button
                            key={sIdx}
                            onClick={() => handleSendMessage(sug)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 hover:border-blue-200 transition-all cursor-pointer text-left"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-1">
                <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600 animate-spin" />
                </div>
                <span className="text-[11px]">โนห์รันกำลังสืบค้นฐานข้อมูลภาระงาน...</span>
                <div className="flex space-x-1">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-white border-t border-slate-200/80 overflow-x-auto no-scrollbar flex gap-1.5">
            <button
              onClick={() => handleSendMessage('หางานวันที่ 12 สิงหาคม')}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🗓️ 12 สิงหาคม</span>
            </button>
            <button
              onClick={() => handleSendMessage('สรุปภาพรวมภาระงานของฉัน')}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 border border-slate-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>📊 สรุปภาพรวม</span>
            </button>
            <button
              onClick={() => handleSendMessage('มีคำสั่งไหนที่ยังขาดรูปถ่ายหลักฐาน?')}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>⚠️ ขาดรูปหลักฐาน</span>
            </button>
            <button
              onClick={() => handleSendMessage('แจกแจงภาระงานตามเกณฑ์ ก.พอ. 1-6')}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>💼 เกณฑ์ ก.พอ.</span>
            </button>
            <button
              onClick={() => handleSendMessage('ร่างบันทึกข้อความส่งหลักฐานภาระงาน')}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>📝 ร่างหนังสือ</span>
            </button>
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="พิมพ์คำถาม เช่น หางานวันที่ 12 สิงหาคม, ขาดรูปงานไหน..."
              className="flex-1 bg-slate-100 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-xs active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* Reusable AI Settings Modal */}
      <AiSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onNotify={onNotify}
        onSaved={(newCfg) => {
          setAiSettings(newCfg);
          setAiMode(newCfg.mode);
        }}
      />
    </>
  );
}
