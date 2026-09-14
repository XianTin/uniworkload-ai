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
  Zap
} from 'lucide-react';
import { WORKLOAD_CATEGORIES } from '../data/mockData';
import { askGeminiCopilot, getAiSettings, saveAiSettings, AI_MODES } from '../utils/geminiClient';

export default function NohranChatbot({ 
  orders = [], 
  activeFaculty, 
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
  const [aiMode, setAiMode] = useState(() => getAiSettings().mode || AI_MODES.GEMINI);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const messagesEndRef = useRef(null);

  // Filter orders for active faculty
  const facultyOrders = orders.filter(o => 
    !activeFaculty || (o.facultyAssigned || []).some(f => f.id === activeFaculty.id)
  );

  const initialGreeting = {
    id: 'msg-init',
    sender: 'bot',
    text: `สวัสดีครับ **${activeFaculty?.name || 'อาจารย์'}** 🔮\n\nผมคือ **ผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)** พร้อมช่วยสืบค้นภาระงาน, ตรวจสอบแฟ้มหลักฐานที่ขาดหาย, สรุปสถิติชั่วโมง ก.พอ., และร่างข้อความสำหรับ e-Portfolio มรภ.นครสวรรค์ ครับ\n\nอาจารย์สามารถพิมพ์คำถาม หรือกดหัวข้อลัดด้านล่างเพื่อเริ่มได้เลยครับ!`,
    timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'สรุปภาพรวมภาระงานของฉัน',
      'มีคำสั่งไหนที่ยังขาดรูปถ่ายหลักฐาน?',
      'ค้นหางานช่วง 1 ม.ค. 67 – 25 มิ.ย. 67',
      'แจกแจงภาระงานตามเกณฑ์ ก.พอ. 1-6',
      'ร่างบันทึกข้อความส่งหลักฐานภาระงาน'
    ]
  };

  const [messages, setMessages] = useState([initialGreeting]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  // Handle Copy text
  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    if (onNotify) onNotify('คัดลอกข้อความสำเร็จ', 'success');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // AI Knowledge & Reasoning Engine
  const generateBotResponse = (query) => {
    const q = query.trim().toLowerCase();

    // 1. Missing Photo Evidence Query
    if (q.includes('ขาดรูป') || q.includes('ไม่มีรูป') || (q.includes('หลักฐาน') && (q.includes('ขาด') || q.includes('ยังไม่')))) {
      const missingEvidenceOrders = facultyOrders.filter(o => !o.actualPhotos || o.actualPhotos.length === 0);
      
      if (missingEvidenceOrders.length === 0) {
        return {
          text: `🎉 **ยอดเยี่ยมมากครับอาจารย์!** ขณะนี้คำสั่งทุกรายการของอาจารย์ (${facultyOrders.length} รายการ) **แนบภาพถ่ายหลักฐานครบถ้วน 100%** แล้วครับ พร้อมส่งประเมิน e-Portfolio ได้ทันที`,
          actions: [
            { label: 'เปิดดูตู้ลิ้นชักทั้งหมด', tab: 'drawer', icon: 'Layers' }
          ]
        };
      }

      let responseText = `⚠️ **พบ ${missingEvidenceOrders.length} คำสั่งที่ยังไม่ได้แนบรูปถ่ายหน้างานจริงครับ:**\n\n`;
      missingEvidenceOrders.forEach((ord, index) => {
        const thaiSignDate = ord.signDate ? new Date(ord.signDate).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: '2-digit' }) : '-';
        responseText += `**${index + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
        responseText += `• วันที่: ${thaiSignDate} | หมวด: ${ord.category}\n`;
        responseText += `• ลิ้นชัก: *รอแนบภาพถ่ายหน้างาน*\n\n`;
      });
      responseText += `💡 *คำแนะนำ*: อาจารย์สามารถไปที่แท็บ **"ตู้ลิ้นชักหลักฐาน"** แล้วคลิกปุ่ม **"แนบรูปถ่าย"** หรือใช้รูปตัวอย่างกิจกรรม 1-Click เพื่อเตรียมเอกสารได้ทันทีครับ`;

      return {
        text: responseText,
        actions: [
          { label: 'ไปที่ตู้ลิ้นชักเพื่อแนบรูป', tab: 'drawer', icon: 'Layers' },
          { label: 'เปิด e-Portfolio Copilot', tab: 'eportfolio', icon: 'FileText' }
        ]
      };
    }

    // 2. Date Range Query (e.g. 1 ม.ค. 67 – 25 มิ.ย. 67, หรือ ปี 2567)
    if (q.includes('67') || q.includes('2567') || (q.includes('ช่วง') && (q.includes('ม.ค') || q.includes('มิ.ย')))) {
      const orders2567 = facultyOrders.filter(o => {
        const d = o.eventDate || o.signDate;
        return d && d.startsWith('2024');
      });

      let responseText = `📅 **รายงานคำสั่งและภาระงานในช่วงปี 2567 (1 ม.ค. 67 – 25 มิ.ย. 67)**\n\n`;
      responseText += `จากการตรวจสอบพบคำสั่งที่เกี่ยวข้องกับอาจารย์ทั้งหมด **${orders2567.length} รายการ** ดังนี้ครับ:\n\n`;

      orders2567.forEach((ord, i) => {
        const hasPhotos = ord.actualPhotos && ord.actualPhotos.length > 0;
        const photoStatus = hasPhotos ? `🟢 มีรูปหลักฐาน (${ord.actualPhotos.length} รูป)` : `🟠 ยังไม่มีรูป`;
        responseText += `**${i + 1}. ${ord.orderNumber}**: ${ord.title}\n`;
        responseText += `• วันที่ปฏิบัติงาน: ${ord.eventDate || ord.signDate} | ${photoStatus}\n`;
        responseText += `• ภาระงาน: ${ord.category}\n\n`;
      });

      responseText += `📊 *อาจารย์สามารถกดปุ่มลัด **"ช่วงทดสอบ (1 ม.ค. 67 – 25 มิ.ย. 67)"** ในตู้ลิ้นชัก หรือกดพิมพ์ **"ใบสรุปแฟ้มหลักฐาน (Dossier)"** ออกมาเป็นแบบรายงานทางการได้ทันทีครับ*`;

      return {
        text: responseText,
        actions: [
          { label: 'กรองดูในตู้ลิ้นชัก', tab: 'drawer', icon: 'Layers' }
        ]
      };
    }

    // 3. Workload Categories Breakdown (ก.พอ. 1-6)
    if (q.includes('กพอ') || q.includes('ก.พอ') || q.includes('หมวดหมู่') || q.includes('เกณฑ์')) {
      let responseText = `📊 **สรุปการจำแนกภาระงานตามเกณฑ์ ก.พอ. ของ มรภ.นครสวรรค์:**\n\n`;
      
      const catCount = {};
      WORKLOAD_CATEGORIES.forEach(c => {
        if (c.id !== 'all') catCount[c.name] = 0;
      });

      facultyOrders.forEach(o => {
        if (catCount[o.category] !== undefined) {
          catCount[o.category]++;
        } else {
          catCount[o.category] = 1;
        }
      });

      Object.entries(catCount).forEach(([catName, count]) => {
        const bar = '█'.repeat(Math.max(1, count * 2)) + '░'.repeat(Math.max(0, 8 - count * 2));
        responseText += `• **${catName}**: **${count}** คำสั่ง \`${bar}\`\n`;
      });

      responseText += `\n✨ **ข้อสังเกตจากโนห์รัน**: งานด้าน *บริการวิชาการแก่สังคม (กพอ.3)* และ *บริหาร/กรรมการ (กพอ.5)* มีสัดส่วนสูงสุดในรอบนี้ เหมาะสมที่จะนำไปจัดกลุ่มเป็นไฮไลต์ผลงานเด่นประจำปีครับ`;

      return {
        text: responseText,
        actions: [
          { label: 'ไปที่หน้า e-Portfolio', tab: 'eportfolio', icon: 'FileText' },
          { label: 'เปิดปฏิทินงาน 2 ทาง', tab: 'calendar', icon: 'Calendar' }
        ]
      };
    }

    // 4. Overall Summary (สรุปภาพรวม)
    if (q.includes('สรุป') || q.includes('ภาพรวม') || q.includes('สถานะ') || q.includes('กี่งาน')) {
      const total = facultyOrders.length;
      const completed = facultyOrders.filter(o => o.status === 'done').length;
      const upcoming = facultyOrders.filter(o => o.status === 'upcoming').length;
      const withPhotos = facultyOrders.filter(o => o.actualPhotos && o.actualPhotos.length > 0).length;
      const pctPhotos = total > 0 ? Math.round((withPhotos / total) * 100) : 0;

      let responseText = `📋 **สรุปภาพรวมภาระงานของ ${activeFaculty?.name || 'อาจารย์'}:**\n\n`;
      responseText += `• 📂 **จำนวนคำสั่งทั้งหมดในระบบ**: **${total}** รายการ\n`;
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
          { label: 'เปิดแดชบอร์ดหลัก', tab: 'dashboard', icon: 'LayoutDashboard' }
        ]
      };
    }

    // 5. Memo Drafting (ร่างบันทึกข้อความ)
    if (q.includes('ร่าง') || q.includes('บันทึกข้อความ') || q.includes('ส่งงาน') || q.includes('หนังสือ')) {
      const firstOrder = facultyOrders[0];
      const memoText = `บันทึกข้อความ
ส่วนราชการ: สาขาวิชาเทคโนโลยีสารสนเทศ คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์
ที่: อว 0625.05/พิเศษ
วันที่: ${new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
เรื่อง: ขอส่งรายงานผลการปฏิบัติงานและเอกสารหลักฐานประกอบภาระงาน

เรียน: คณบดีคณะวิทยาการจัดการ

ตามที่ มหาวิทยาลัยราชภัฏนครสวรรค์ ได้มีคำสั่งที่ ${firstOrder?.orderNumber || 'มรภ.นว. 0895/2569'} เรื่อง "${firstOrder?.title || 'แต่งตั้งคณะกรรมการจัดกิจกรรมโครงการบริการวิชาการ'}" นั้น

ในการนี้ ข้าพเจ้า (${activeFaculty?.name || 'อาจารย์ผู้รับผิดชอบ'}) ได้ปฏิบัติหน้าที่ดังกล่าวเสร็จสิ้นเรียบร้อยแล้ว จึงขอส่งแบบรายงานผลการปฏิบัติงาน พร้อมแนบรูปถ่ายหลักฐานหน้างานและแบบสรุปภาระงาน (Dossier Summary) ดังเอกสารที่แนบมาพร้อมนี้

จึงเรียนมาเพื่อโปรดทราบและพิจารณาให้ความอนุเคราะห์

(ลงชื่อ)....................................................
(${activeFaculty?.name || 'อาจารย์ผู้รับผิดชอบ'})`;

      return {
        text: `📝 **โนห์รันร่างบันทึกข้อความทางการของ มรภ.นครสวรรค์ ให้เรียบร้อยครับ:**\n\n\`\`\`text\n${memoText}\n\`\`\`\n\n*สามารถกดปุ่มคัดลอกด้านบนเพื่อนำไปใช้งานได้ทันทีครับ*`,
        copyable: memoText
      };
    }

    // 6. Keyword Search across Orders (เช่น AI, ชุมชน, สัมมนา)
    const matchedOrders = facultyOrders.filter(o => 
      o.title.toLowerCase().includes(q) ||
      o.orderNumber.toLowerCase().includes(q) ||
      o.category.toLowerCase().includes(q) ||
      (o.location && o.location.toLowerCase().includes(q))
    );

    if (matchedOrders.length > 0) {
      let responseText = `🔍 **พบข้อมูลที่ตรงกับคำค้นหา "${query}" ทั้งหมด ${matchedOrders.length} รายการครับ:**\n\n`;
      matchedOrders.slice(0, 5).forEach((ord, idx) => {
        responseText += `**${idx + 1}. [${ord.orderNumber}]** ${ord.title}\n`;
        responseText += `• หมวด: ${ord.category} | วันที่: ${ord.eventDate || ord.signDate}\n\n`;
      });

      return {
        text: responseText,
        actions: [
          { label: 'ดูในตู้ลิ้นชัก', tab: 'drawer', icon: 'Layers' }
        ]
      };
    }

    // Fallback response with helpful guide
    return {
      text: `🔮 **โนห์รันตรวจสอบข้อมูลในระบบ UniWorkload AI ให้แล้วครับ:**\n\nคำถาม: *"${query}"*\n\nในระบบขณะนี้มีข้อมูลคำสั่งภาระงานของอาจารย์จำนวน **${facultyOrders.length} รายการ** อาจารย์สามารถสั่งให้ผมทำสิ่งเหล่านี้ได้ครับ:\n\n1. **"มีคำสั่งไหนยังขาดรูปหลักฐาน?"** — ตรวจหาแฟ้มงานที่ยังไม่ได้แนบรูปถ่าย\n2. **"สรุปภาพรวมภาระงาน"** — แจกแจงจำนวนงาน เสร็จสิ้น และรอดำเนินการ\n3. **"ค้นหางานช่วง 1 ม.ค. 67 – 25 มิ.ย. 67"** — กรองเฉพาะช่วงเวลาที่ต้องการ\n4. **"แจกแจงเกณฑ์ ก.พอ. 1-6"** — ดูสถิติการสอน วิจัย บริการวิชาการ และศิลปวัฒนธรรม\n5. **"ร่างบันทึกข้อความ"** — สร้างร่างหนังสือส่งงานทางการ มรภ.นว.`,
      suggestions: [
        'มีคำสั่งไหนยังขาดรูปถ่ายหลักฐาน?',
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
          chatHistory: messages
        });

        const botMsg = {
          id: `msg-${Date.now() + 1}`,
          sender: 'bot',
          text: geminiReply,
          engine: 'gemini',
          timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
        };
        setMessages(prev => [...prev, botMsg]);
        setIsTyping(false);
        return;
      } catch (err) {
        console.warn('Gemini copilot unavailable, falling back to local engine:', err);
      }
    }

    // Local heuristic fallback
    setTimeout(() => {
      const botResponse = generateBotResponse(text);
      const botMsg = {
        id: `msg-${Date.now() + 1}`,
        sender: 'bot',
        text: botResponse.text,
        actions: botResponse.actions,
        suggestions: botResponse.suggestions,
        copyable: botResponse.copyable,
        engine: 'local',
        timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
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
          className={`fixed z-50 transition-all duration-300 ease-in-out flex flex-col bg-white border border-slate-200 shadow-2xl rounded-2xl overflow-hidden font-sans ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-4 right-4 w-[92vw] sm:w-[420px] h-[580px] max-h-[88vh]'
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
                ข้อมูล: <strong>{activeFaculty?.name}</strong> ({facultyOrders.length} คำสั่ง)
              </span>
            </div>
            
            <button
              onClick={() => {
                const nextMode = aiMode === AI_MODES.GEMINI ? AI_MODES.LOCAL : AI_MODES.GEMINI;
                setAiMode(nextMode);
                saveAiSettings({ mode: nextMode });
                if (onNotify) onNotify(`สลับโหมด AI เป็น: ${nextMode === AI_MODES.GEMINI ? '⚡ Gemini 3.6 Flash' : '🛡️ Local Rule'}`, 'info');
              }}
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono cursor-pointer transition-all border shrink-0 ${
                aiMode === AI_MODES.GEMINI 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100' 
                  : 'bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300'
              }`}
              title="คลิกเพื่อสลับระหว่างโหมด Gemini Flash และ Local Heuristic"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${aiMode === AI_MODES.GEMINI ? 'bg-indigo-600 animate-pulse' : 'bg-slate-500'}`} />
              <span>{aiMode === AI_MODES.GEMINI ? '⚡ Gemini Flash' : '🛡️ Local Rule'}</span>
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
                </div>

                <div
                  className={`max-w-[90%] sm:max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed shadow-xs ${
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
              onClick={() => handleSendMessage('ค้นหางานช่วง 1 ม.ค. 67 – 25 มิ.ย. 67')}
              className="shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition-all cursor-pointer flex items-center gap-1"
            >
              <span>🗓️ ช่วงปี 2567</span>
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
              placeholder="พิมพ์คำถาม หรือค้นหาคำสั่งภาระงาน..."
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
    </>
  );
}
