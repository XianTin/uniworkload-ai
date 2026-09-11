import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ScanLine, 
  SlidersHorizontal,
  RefreshCw,
  Eye,
  FileSearch,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';
import { DEMO_RAW_ORDERS, WORKLOAD_CATEGORIES } from '../data/mockData';
import { extractTextFromDocument } from '../utils/ocrEngine';
import { parseThaiOfficialOrder, convertThaiNumerals } from '../utils/thaiDocumentParser';

export default function IngestionModule({ onAddNewOrder, onNotify, facultyList = [], activeFaculty = null }) {
  const [selectedChannel, setSelectedChannel] = useState('pdf'); // 'pdf' | 'photo' | 'chat' | 'text'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rawTextCopied, setRawTextCopied] = useState(false);
  const [showRawText, setShowRawText] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [previewUrl, setPreviewUrl] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  // Form State for Quick Verification Drawer
  const [formData, setFormData] = useState({
    orderNumber: '',
    title: '',
    signDate: '',
    eventDate: '',
    eventTime: '',
    location: '',
    category: 'บริการวิชาการแก่สังคม',
    categoryCode: 'service',
    facultyAssigned: []
  });

  const fileInputRef = useRef(null);

  // Trigger file selection based on channel
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Handle Real File Upload (PDF, Image, LINE Screenshot)
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processRealFile(file);
    // Reset file input so user can re-upload same file if needed
    e.target.value = '';
  };

  // Process Real File with OCR Engine
  const processRealFile = async (file) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage('กำลังเตรียมเอกสารเข้าสู่ระบบ AI OCR...');
    setScanResult(null);
    setActiveFile(file);

    // Create object URL for preview if it is an image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    try {
      const result = await extractTextFromDocument(file, (status) => {
        setScanProgress(status.progress || 30);
        if (status.message) setScanMessage(status.message);
      });

      setScanMessage('กำลังสกัดโครงสร้างคำสั่ง วันที่ เวลา สถานที่ และบุคลากร...');
      setScanProgress(95);

      // Parse Thai order structure
      const parsed = parseThaiOfficialOrder(result.text, file.name, facultyList);

      setTimeout(() => {
        setScanProgress(100);
        setIsScanning(false);
        setScanResult(parsed);
        setFormData({
          orderNumber: parsed.parsedData.orderNumber,
          title: parsed.parsedData.title,
          signDate: parsed.parsedData.signDate,
          eventDate: parsed.parsedData.eventDate,
          eventTime: parsed.parsedData.eventTime,
          location: parsed.parsedData.location,
          category: parsed.parsedData.category,
          categoryCode: parsed.parsedData.categoryCode,
          facultyAssigned: parsed.parsedData.facultyAssigned
        });
        onNotify(`AI OCR สกัดเอกสารจริง [${file.name}] สำเร็จ! พร้อมตรวจทาน`, 'success');
      }, 300);

    } catch (err) {
      console.error('OCR Error:', err);
      setIsScanning(false);
      onNotify('เกิดข้อผิดพลาดในการรัน OCR กรุณาลองใหม่อีกครั้ง หรือตรวจสอบไฟล์', 'error');
    }
  };

  // Handle Drag & Drop
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processRealFile(files[0]);
    }
  };

  // Handle Manual Text Parsing
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      onNotify('กรุณาวางข้อความคำสั่งก่อนเริ่มประมวลผล', 'warning');
      return;
    }

    setIsScanning(true);
    setScanProgress(30);
    setScanMessage('AI กำลังวิเคราะห์ข้อความคำสั่งราชการ...');
    setScanResult(null);
    setActiveFile(null);
    setPreviewUrl(null);

    setTimeout(() => {
      setScanProgress(90);
      const parsed = parseThaiOfficialOrder(pastedText, 'ข้อความจากแชตหรือบันทึก.txt', facultyList);
      setIsScanning(false);
      setScanProgress(100);
      setScanResult(parsed);
      setFormData({
        orderNumber: parsed.parsedData.orderNumber,
        title: parsed.parsedData.title,
        signDate: parsed.parsedData.signDate,
        eventDate: parsed.parsedData.eventDate,
        eventTime: parsed.parsedData.eventTime,
        location: parsed.parsedData.location,
        category: parsed.parsedData.category,
        categoryCode: parsed.parsedData.categoryCode,
        facultyAssigned: parsed.parsedData.facultyAssigned
      });
      onNotify('สกัดข้อมูลจากข้อความสำเร็จ! พร้อมตรวจทาน', 'success');
    }, 400);
  };

  // Pre-load demo simulation
  const handleStartDemoScan = (demoItem = DEMO_RAW_ORDERS[0]) => {
    setIsScanning(true);
    setScanProgress(15);
    setScanMessage('กำลังโหลดตัวอย่างคำสั่ง มรภ.นว. 1299/2569...');
    setScanResult(null);
    setActiveFile({
      name: demoItem.filename,
      size: 1800000,
      type: 'application/pdf'
    });
    setPreviewUrl(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanResult(demoItem);
            setFormData({
              orderNumber: demoItem.parsedData.orderNumber,
              title: demoItem.parsedData.title,
              signDate: demoItem.parsedData.signDate,
              eventDate: demoItem.parsedData.eventDate,
              eventTime: demoItem.parsedData.eventTime,
              location: demoItem.parsedData.location,
              category: demoItem.parsedData.category,
              categoryCode: 'service',
              facultyAssigned: demoItem.parsedData.facultyAssigned
            });
            onNotify('AI OCR โหลดและประมวลผลคำสั่งสำเร็จ! พร้อมตรวจสอบ', 'success');
          }, 350);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  // Copy raw text to clipboard
  const handleCopyRawText = () => {
    if (!scanResult?.detectedText) return;
    navigator.clipboard.writeText(scanResult.detectedText);
    setRawTextCopied(true);
    setTimeout(() => setRawTextCopied(false), 2000);
    onNotify('คัดลอกข้อความ OCR ดิบเรียบร้อยแล้ว', 'info');
  };

  // Add a faculty member to the assigned list
  const handleAddFaculty = (fac) => {
    if (formData.facultyAssigned.some(f => f.id === fac.id || f.name === fac.name)) return;
    setFormData(prev => ({
      ...prev,
      facultyAssigned: [
        ...prev.facultyAssigned,
        {
          id: fac.id,
          name: fac.name,
          roleInOrder: 'กรรมการดำเนินงาน'
        }
      ]
    }));
  };

  // Remove a faculty member
  const handleRemoveFaculty = (idx) => {
    setFormData(prev => ({
      ...prev,
      facultyAssigned: prev.facultyAssigned.filter((_, i) => i !== idx)
    }));
  };

  // Update role of an assigned faculty member
  const handleRoleChange = (idx, newRole) => {
    setFormData(prev => ({
      ...prev,
      facultyAssigned: prev.facultyAssigned.map((f, i) => i === idx ? { ...f, roleInOrder: newRole } : f)
    }));
  };

  // Confirm and Dispatch verified data
  const handleConfirmAndDispatch = () => {
    if (!formData.title || !formData.orderNumber) {
      onNotify('กรุณาระบุเลขที่คำสั่งและชื่อกิจกรรม', 'warning');
      return;
    }

    const newOrderObj = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: formData.orderNumber,
      title: formData.title,
      signDate: formData.signDate || new Date().toISOString().split('T')[0],
      eventDate: formData.eventDate || new Date().toISOString().split('T')[0],
      eventTime: formData.eventTime || '08:30 - 16:30 น.',
      location: formData.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์',
      category: formData.category,
      categoryCode: formData.categoryCode || 'service',
      categoryColor: 'emerald',
      facultyAssigned: formData.facultyAssigned.length > 0 ? formData.facultyAssigned : [
        {
          id: activeFaculty?.id || 'fac-1',
          name: activeFaculty?.name || 'อ.ธนภัทร สุขเกษม (tie)',
          roleInOrder: 'ผู้รับผิดชอบโครงการ / ประธานกรรมการ'
        }
      ],
      status: 'upcoming',
      evidenceFiles: [
        {
          id: `ev-${Date.now()}`,
          name: activeFile?.name || `${formData.orderNumber.replace(/[\/\s]/g, '_')}.pdf`,
          size: activeFile?.size ? `${(activeFile.size / (1024 * 1024)).toFixed(1)} MB` : '1.4 MB',
          type: activeFile?.type?.includes('image') ? 'image' : 'pdf',
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ],
      actualPhotos: previewUrl ? [
        {
          id: `photo-initial-${Date.now()}`,
          name: activeFile?.name || 'ภาพหลักฐานคำสั่งราชการ',
          caption: `ภาพหลักฐานคำสั่ง ${formData.orderNumber}`,
          previewUrl: previewUrl,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ] : [],
      ePortfolio: {
        year: '2569',
        round: 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
        topic: formData.title,
        workloadRef: `ภาระงานด้าน${formData.category} มหาวิทยาลัยราชภัฏนครสวรรค์`,
        status: 'ready_to_export'
      }
    };

    onAddNewOrder(newOrderObj);
    setScanResult(null);
    setScanProgress(0);
    setPreviewUrl(null);
    setActiveFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={
          selectedChannel === 'pdf' 
            ? '.pdf,application/pdf' 
            : selectedChannel === 'photo' || selectedChannel === 'chat'
              ? 'image/*,.png,.jpg,.jpeg,.webp'
              : '.pdf,image/*,.png,.jpg,.jpeg,.webp'
        }
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>โมดูลที่ 1: Multi-Channel Ingestion & Real Thai OCR Parser</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            ระบบนำเข้าและสกัดข้อมูลคำสั่งราชการจริง (Live OCR Engine)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ใส่เอกสารจริงได้ทันที ทั้งไฟล์ PDF ต้นฉบับ มรภ.นว., ภาพถ่ายคำสั่งจากกล้องมือถือ, หรือภาพแคปหน้าจอแชต LINE
          </p>
        </div>

        {/* Preset Sample Quick Button */}
        <button
          onClick={() => handleStartDemoScan(DEMO_RAW_ORDERS[0])}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50 shrink-0"
        >
          <ScanLine className="w-4 h-4 text-blue-600" />
          <span>โหลดตัวอย่างคำสั่งจริง (มรภ.นว. 1299/2569)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upload & Channel Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Channel Selectors */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedChannel('pdf')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'pdf'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ไฟล์ PDF</span>
            </button>
            <button
              onClick={() => setSelectedChannel('photo')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'photo'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>ภาพถ่าย</span>
            </button>
            <button
              onClick={() => setSelectedChannel('chat')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'chat'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>แคปแชต</span>
            </button>
            <button
              onClick={() => setSelectedChannel('text')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'text'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              <span>วางข้อความ</span>
            </button>
          </div>

          {/* Conditional Input Zone based on Channel */}
          {selectedChannel === 'text' ? (
            /* Text Paste Mode */
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-800">วางข้อความคำสั่งจาก LINE หรือเอกสาร:</span>
                <span className="text-[11px] text-slate-400 font-mono">Thai Natural Text</span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="วางข้อความที่นี่ เช่น: คำสั่งมหาวิทยาลัยราชภัฏนครสวรรค์ ที่ 1042/2569 เรื่อง แต่งตั้งคณะกรรมการ... วันที่ 18 กันยายน 2569 เวลา 08:30 น. ณ ห้องประชุม 14102..."
                rows={7}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden font-mono leading-relaxed"
              />
              <button
                onClick={handleProcessPastedText}
                disabled={isScanning || !pastedText.trim()}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm shadow-blue-500/20"
              >
                <Sparkles className="w-4 h-4" />
                <span>สกัดโครงสร้างคำสั่งด้วย AI</span>
              </button>
            </div>
          ) : (
            /* Real Drag and Drop Zone */
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={handleOpenFileDialog}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer relative group ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60'
              }`}
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500/15 to-blue-600/15 flex items-center justify-center text-blue-600 mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud className="w-7 h-7" />
              </div>
              <h4 className="text-sm font-bold text-slate-800">
                ลากไฟล์เอกสารจริงมาวางที่นี่
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
                หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ของคุณ
              </p>
              
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold border border-blue-200/60">
                  <ScanLine className="w-3 h-3" />
                  รองรับ PDF (Text & Scan), PNG, JPG, WebP
                </span>
              </div>

              <div className="mt-3 text-[11px] text-slate-400">
                ⚡ ระบบจะใช้ Tesseract Neural Network + PDF.js ประมวลผลบนเครื่องของคุณทันที
              </div>
            </div>
          )}

          {/* Guidelines and Feature Highlights */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-xs space-y-2 text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>ความสามารถของ Live Thai OCR Engine</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
              <li><strong className="text-slate-700">Digital PDF:</strong> สกัดข้อความภาษาไทยจากเลเยอร์ดิจิทัลโดยตรง แม่นยำ 100% ไร้ข้อผิดพลาด</li>
              <li><strong className="text-slate-700">ภาพถ่าย / Scanned PDF:</strong> แปลงเลขไทย (๑ ๒ ๓) เป็นอารบิก (1 2 3) อัตโนมัติ</li>
              <li><strong className="text-slate-700">Entity Matching:</strong> จับคู่ชื่ออาจารย์กับฐานข้อมูล มรภ.นว. และจำแนกหมวด กพอ. 1–6</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Live Scanning Status & Quick Verification Drawer (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-amber-500 animate-ping' : scanResult ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                <h3 className="text-sm font-bold text-slate-800">
                  หน้าต่างตรวจทานด่วน (Quick Verification Drawer)
                </h3>
              </div>
              {scanResult && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowRawText(!showRawText)}
                    className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-blue-600 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3 h-3" />
                    <span>{showRawText ? 'ซ่อนข้อความดิบ' : 'ดูข้อความ OCR ดิบ'}</span>
                  </button>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                    <CheckCircle2 className="w-3 h-3" />
                    ความแม่นยำ: {scanResult.detectedConfidence}%
                  </span>
                </div>
              )}
            </div>

            {/* In-progress scanning state */}
            {isScanning && (
              <div className="py-16 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center animate-pulse">
                    <ScanLine className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    {scanMessage || 'AI กำลังประมวลผลข้อความและสกัดข้อมูล...'}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    ระบบกำลังแปลงเลขไทย ตรวจจับเลขที่คำสั่ง วันที่ เวลา สถานที่ และรายชื่อคณาจารย์
                  </p>
                </div>
                <div className="max-w-xs mx-auto w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <div className="text-[11px] font-mono text-blue-600 font-semibold">
                  {scanProgress}%
                </div>
              </div>
            )}

            {/* Empty state before scanning */}
            {!isScanning && !scanResult && (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <h4 className="text-sm font-medium text-slate-700">
                  พร้อมสกัดข้อมูลเอกสารจริง
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ลากไฟล์ PDF หรือรูปถ่ายคำสั่งมาวาง หรือคลิกเลือกไฟล์เพื่อทดสอบระบบ OCR จริงได้ทันที
                </p>
              </div>
            )}

            {/* Result Extracted Ready for Quick Verification */}
            {!isScanning && scanResult && (
              <div className="mt-4 space-y-4 text-xs">
                {/* Active File Summary Badge */}
                <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-10 h-10 object-cover rounded-lg border border-slate-200 shadow-xs" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        PDF
                      </div>
                    )}
                    <div>
                      <div className="font-semibold text-slate-800 text-xs truncate max-w-xs sm:max-w-sm">
                        {scanResult.filename}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        แปลงเลขไทยเป็นอารบิกอัตโนมัติแล้ว • ตรวจสอบและแก้ไขด้านล่างได้ทันที
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleCopyRawText}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-300 text-[11px] font-medium text-slate-700 hover:bg-white transition-colors cursor-pointer"
                  >
                    {rawTextCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{rawTextCopied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
                  </button>
                </div>

                {/* Optional Raw OCR Snippet View */}
                {showRawText && (
                  <div className="bg-slate-900 text-slate-200 p-3.5 rounded-xl border border-slate-800 space-y-1.5 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>RAW EXTRACTED OCR TEXT</span>
                      <span>UTF-8</span>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-300 bg-slate-950/60 p-2.5 rounded-lg overflow-x-auto whitespace-pre-wrap max-h-36 leading-relaxed">
                      {scanResult.detectedText}
                    </pre>
                  </div>
                )}

                {/* Editable Extracted Fields for 5-10 Second Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      เลขที่คำสั่ง <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.orderNumber} 
                      onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                      placeholder="เช่น 1299/2569"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      หมวดหมู่ภาระงาน (กพอ. 1–6)
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => {
                        const matched = WORKLOAD_CATEGORIES.find(c => c.name === e.target.value);
                        setFormData({ 
                          ...formData, 
                          category: e.target.value,
                          categoryCode: matched?.id || 'service'
                        });
                      }}
                      className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden cursor-pointer"
                    >
                      <option value="การจัดการเรียนการสอน">การจัดการเรียนการสอน (กพอ.1)</option>
                      <option value="งานวิจัยและงานสร้างสรรค์">งานวิจัยและงานสร้างสรรค์ (กพอ.2)</option>
                      <option value="บริการวิชาการแก่สังคม">บริการวิชาการแก่สังคม (กพอ.3)</option>
                      <option value="ทำนุบำรุงศิลปวัฒนธรรม">ทำนุบำรุงศิลปวัฒนธรรม (กพอ.4)</option>
                      <option value="บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย">บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย (กพอ.5)</option>
                      <option value="ประกันคุณภาพการศึกษา">ประกันคุณภาพการศึกษา (กพอ.6)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      ชื่อคำสั่ง / กิจกรรม <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={formData.title} 
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                      placeholder="ชื่อคำสั่งหรือหัวข้อโครงการ"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      วันจัดกิจกรรม (ปฏิทิน/iCal)
                    </label>
                    <input 
                      type="date" 
                      value={formData.eventDate} 
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      เวลาจัดกิจกรรม
                    </label>
                    <input 
                      type="text" 
                      value={formData.eventTime} 
                      onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                      placeholder="เช่น 08:30 - 16:30 น."
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      สถานที่จัดงาน
                    </label>
                    <input 
                      type="text" 
                      value={formData.location} 
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                      placeholder="เช่น ห้องประชุม 14102 ชั้น 4 อาคาร 14"
                    />
                  </div>
                </div>

                {/* Assigned Faculty Detection & Dispatch Table */}
                <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200">
                  <div className="font-semibold text-sky-900 text-xs mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-sky-600" />
                      <span>บุคลากรที่ตรวจพบและเตรียมกระจายเข้าลิ้นชัก (Smart Dispatch):</span>
                    </span>
                    <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-md font-semibold">
                      {formData.facultyAssigned.length} ท่าน
                    </span>
                  </div>

                  {formData.facultyAssigned.length === 0 ? (
                    <div className="text-center py-2 text-slate-400 text-xs">
                      ยังไม่พบบุคลากร ระบบจะกำหนดให้อาจารย์ที่เข้าสู่ระบบปัจจุบันเป็นผู้รับผิดชอบ
                    </div>
                  ) : (
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {formData.facultyAssigned.map((f, idx) => (
                        <div key={idx} className="bg-white p-2 rounded-lg border border-sky-100 flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-800 truncate text-xs flex-1">
                            {f.name}
                          </span>
                          <input
                            type="text"
                            value={f.roleInOrder}
                            onChange={(e) => handleRoleChange(idx, e.target.value)}
                            className="text-[11px] bg-slate-50 border border-slate-200 rounded px-2 py-0.5 text-slate-700 w-36 sm:w-44 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-hidden"
                            placeholder="บทบาทในคำสั่ง"
                          />
                          <button
                            onClick={() => handleRemoveFaculty(idx)}
                            className="text-slate-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors cursor-pointer"
                            title="ลบรายชื่อ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add faculty shortcut chips if there are faculty not yet assigned */}
                  {facultyList.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-sky-200/60 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-sky-700 font-medium">+ เพิ่มอาจารย์:</span>
                      {facultyList.map(fac => {
                        const isAssigned = formData.facultyAssigned.some(f => f.id === fac.id || f.name === fac.name);
                        if (isAssigned) return null;
                        return (
                          <button
                            key={fac.id}
                            onClick={() => handleAddFaculty(fac)}
                            className="inline-flex items-center gap-1 text-[10px] bg-white border border-sky-200 text-sky-700 px-2 py-0.5 rounded-md hover:bg-sky-100 transition-colors cursor-pointer"
                          >
                            <Plus className="w-2.5 h-2.5" />
                            <span>{fac.name.split(' ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {scanResult && (
            <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => {
                  setScanResult(null);
                  setActiveFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAndDispatch}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันข้อมูล & กระจายเข้าลิ้นชักและปฏิทินทันที</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
