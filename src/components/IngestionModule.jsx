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
  Camera,
  Copy,
  Check,
  Calendar,
  Clock,
  MapPin,
  Users,
  Plus,
  Trash2,
  FileCheck,
  ChevronDown
} from 'lucide-react';
import { extractTextFromDocument } from '../utils/ocrEngine';
import { parseThaiOfficialOrder } from '../utils/thaiDocumentParser';
import { DEMO_RAW_ORDERS, WORKLOAD_CATEGORIES, FACULTY_MEMBERS } from '../data/mockData';

export default function IngestionModule({ 
  onAddNewOrder, 
  onNotify, 
  facultyList = FACULTY_MEMBERS,
  activeFaculty = FACULTY_MEMBERS[0]
}) {
  const [selectedChannel, setSelectedChannel] = useState('pdf'); // 'pdf' | 'photo' | 'chat' | 'text'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [scanDuration, setScanDuration] = useState(0);
  const [activeResultTab, setActiveResultTab] = useState('form'); // 'form' | 'raw' | 'preview'
  const [isCopied, setIsCopied] = useState(false);

  // Verification Form State
  const [formData, setFormData] = useState({
    orderNumber: '',
    title: '',
    signDate: '',
    eventDate: '',
    eventTime: '08:30 - 16:30 น.',
    location: '',
    category: 'บริการวิชาการแก่สังคม',
    categoryCode: 'service',
    categoryColor: 'emerald',
    workloadHours: 3,
    facultyAssigned: []
  });

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Trigger file selection
  const handleTriggerFileSelect = () => {
    if (fileInputRef.current) fileInputRef.current.click();
  };

  // Trigger camera capture
  const handleTriggerCamera = () => {
    if (cameraInputRef.current) cameraInputRef.current.click();
  };

  // Handle Real File Selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processRealDocument(file);
    e.target.value = '';
  };

  // Process Real File with OCR Engine
  const processRealDocument = async (file) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage('กำลังโหลดเอกสารเข้าสู่ระบบ AI OCR Parser...');
    setScanResult(null);
    setActiveFile(file);

    const startTime = performance.now();

    // Create preview URL if image
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }

    try {
      const result = await extractTextFromDocument(file, (status) => {
        setScanProgress(status.progress || 35);
        if (status.message) setScanMessage(status.message);
      });

      setScanMessage('กำลังวิเคราะห์โครงสร้างคำสั่งราชการ วันที่ เวลา และบุคลากร...');
      setScanProgress(92);

      // Parse with Thai Official Order Parser
      const parsed = parseThaiOfficialOrder(result.text, file.name, facultyList);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setScanDuration(elapsed);

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
          categoryColor: parsed.parsedData.categoryColor,
          workloadHours: parsed.parsedData.estimatedHours || 3,
          facultyAssigned: parsed.parsedData.facultyAssigned
        });
        setActiveResultTab('form');
        onNotify(`AI OCR สกัดเอกสารจริง [${file.name}] สำเร็จใน ${elapsed} วินาที!`, 'success');
      }, 300);

    } catch (err) {
      console.error('OCR Error:', err);
      setIsScanning(false);
      onNotify('เกิดข้อผิดพลาดในการประมวลผล OCR กรุณาลองใหม่อีกครั้ง หรือตรวจสอบไฟล์', 'error');
    }
  };

  // Process Drag & Drop
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      await processRealDocument(files[0]);
    }
  };

  // Process Pasted Text
  const handleProcessPastedText = () => {
    if (!pastedText.trim()) {
      onNotify('กรุณาวางข้อความคำสั่งก่อนประมวลผล', 'warning');
      return;
    }

    setIsScanning(true);
    setScanProgress(30);
    setScanMessage('AI กำลังสกัดข้อความคำสั่งราชการและแปลงเลขไทย...');
    setScanResult(null);
    setActiveFile(null);
    setPreviewUrl(null);

    const startTime = performance.now();

    setTimeout(() => {
      setScanProgress(95);
      const parsed = parseThaiOfficialOrder(pastedText, 'ข้อความจากบันทึก_แชต.txt', facultyList);
      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setScanDuration(elapsed);
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
        categoryColor: parsed.parsedData.categoryColor,
        workloadHours: parsed.parsedData.estimatedHours || 3,
        facultyAssigned: parsed.parsedData.facultyAssigned
      });
      setActiveResultTab('form');
      onNotify(`วิเคราะห์โครงสร้างข้อความสำเร็จใน ${elapsed} วินาที!`, 'success');
    }, 400);
  };

  // Load Preset Sample
  const handleLoadSample = (sample = DEMO_RAW_ORDERS[0]) => {
    setIsScanning(true);
    setScanProgress(25);
    setScanMessage(`กำลังโหลดเอกสารตัวอย่าง [${sample.filename}]...`);
    setScanResult(null);
    setActiveFile({
      name: sample.filename,
      size: 1850000,
      type: 'application/pdf'
    });
    setPreviewUrl(null);

    const startTime = performance.now();

    setTimeout(() => {
      setScanProgress(90);
      setTimeout(() => {
        setIsScanning(false);
        setScanProgress(100);
        setScanResult(sample);
        setFormData({
          orderNumber: sample.parsedData.orderNumber,
          title: sample.parsedData.title,
          signDate: sample.parsedData.signDate,
          eventDate: sample.parsedData.eventDate,
          eventTime: sample.parsedData.eventTime,
          location: sample.parsedData.location,
          category: sample.parsedData.category,
          categoryCode: sample.parsedData.categoryCode,
          categoryColor: sample.parsedData.categoryColor || 'emerald',
          workloadHours: 3,
          facultyAssigned: sample.parsedData.facultyAssigned
        });
        const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
        setScanDuration(elapsed);
        setActiveResultTab('form');
        onNotify(`โหลดตัวอย่างคำสั่งจริง (${sample.parsedData.orderNumber}) สำเร็จ!`, 'success');
      }, 350);
    }, 400);
  };

  // Copy raw OCR text
  const handleCopyText = () => {
    if (!scanResult?.detectedText) return;
    navigator.clipboard.writeText(scanResult.detectedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Faculty Assignment changes
  const handleRemoveFaculty = (id) => {
    setFormData((prev) => ({
      ...prev,
      facultyAssigned: prev.facultyAssigned.filter((f) => f.id !== id)
    }));
  };

  const handleAddFacultyToOrder = (facultyId) => {
    const target = facultyList.find((f) => f.id === facultyId);
    if (!target) return;
    if (formData.facultyAssigned.some((f) => f.id === target.id)) {
      onNotify('อาจารย์ท่านนี้อยู่ในรายชื่อผู้ปฏิบัติงานแล้ว', 'warning');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      facultyAssigned: [
        ...prev.facultyAssigned,
        { id: target.id, name: target.name, roleInOrder: 'กรรมการดำเนินงาน' }
      ]
    }));
  };

  // Confirm and dispatch to drawers & calendar
  const handleConfirmAndDispatch = () => {
    if (!scanResult) return;

    const newOrderId = `ord-${Date.now().toString().slice(-4)}`;
    const categoryInfo = WORKLOAD_CATEGORIES.find(c => c.name === formData.category) || {
      name: formData.category,
      code: formData.categoryCode,
      color: formData.categoryColor
    };

    const newOrderObj = {
      id: newOrderId,
      orderNumber: formData.orderNumber,
      title: formData.title,
      signDate: formData.signDate,
      eventDate: formData.eventDate,
      eventTime: formData.eventTime,
      location: formData.location,
      category: formData.category,
      categoryCode: categoryInfo.code,
      categoryColor: categoryInfo.color,
      workloadHours: Number(formData.workloadHours) || 3,
      role: formData.facultyAssigned[0]?.roleInOrder || 'กรรมการ',
      facultyAssigned: formData.facultyAssigned,
      status: 'upcoming',
      rawOcrText: scanResult.detectedText || '',
      documentFileName: activeFile?.name || scanResult.filename || 'เอกสารคำสั่ง.pdf',
      evidenceFiles: [
        {
          id: `ev-${Date.now()}`,
          name: activeFile?.name || scanResult.filename || 'เอกสารคำสั่ง.pdf',
          size: activeFile?.size ? (activeFile.size / (1024 * 1024)).toFixed(1) + ' MB' : '1.8 MB',
          type: activeFile?.type?.includes('pdf') ? 'pdf' : 'image',
          url: previewUrl || null,
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ],
      actualPhotos: previewUrl ? [previewUrl] : [],
      ePortfolio: {
        year: '2569',
        round: 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
        topic: formData.title,
        role: formData.facultyAssigned[0]?.roleInOrder || 'กรรมการดำเนินงาน',
        hours: Number(formData.workloadHours) || 3,
        workloadRef: `ภาระงานด้าน${formData.category} มหาวิทยาลัยราชภัฏนครสวรรค์`,
        resultSummary: `ดำเนินงานตามคำสั่ง ${formData.orderNumber} ${formData.title} เรียบร้อยสมบูรณ์`,
        status: 'ready_to_export'
      }
    };

    onAddNewOrder(newOrderObj);
    setScanResult(null);
    setScanProgress(0);
    setActiveFile(null);
    setPreviewUrl(null);
  };

  return (
    <div className="space-y-6">
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".pdf,image/png,image/jpeg,image/jpg,image/webp" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={cameraInputRef} 
        onChange={handleFileChange} 
        accept="image/*" 
        capture="environment" 
        className="hidden" 
      />

      {/* Module Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>โมดูลที่ 1: Multi-Channel Ingestion & AI Thai OCR Parser (ใช้งานได้จริง)</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            ระบบนำเข้าและสกัดข้อมูลคำสั่งราชการอัจฉริยะ
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            ขับเคลื่อนด้วยโมเดล AI OCR ภาษาไทย สกัดข้อความจากเอกสาร PDF, ภาพถ่ายสมาร์ตโฟน และแคปแชต แปลงเลขไทยอัตโนมัติ 100%
          </p>
        </div>

        {/* Preset Sample Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">ตัวอย่างคำสั่งจริง:</span>
          {DEMO_RAW_ORDERS.map((sample, idx) => (
            <button
              key={sample.id}
              onClick={() => handleLoadSample(sample)}
              disabled={isScanning}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ScanLine className="w-3.5 h-3.5 text-blue-600" />
              <span>{sample.parsedData.orderNumber}</span>
            </button>
          ))}
        </div>
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
              <span>แคป LINE</span>
            </button>
            <button
              onClick={() => setSelectedChannel('text')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'text'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>วางข้อความ</span>
            </button>
          </div>

          {/* Conditional Channel View: File Upload vs Textarea */}
          {selectedChannel !== 'text' ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={handleTriggerFileSelect}
              className={`border-2 border-dashed rounded-2xl p-7 text-center transition-all cursor-pointer ${
                isDragging
                  ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                  : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60'
              }`}
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-600/20 flex items-center justify-center text-blue-600 mb-3.5 shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-semibold text-slate-800">
                ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์จริง
              </h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                รองรับไฟล์เอกสารจริง <span className="font-semibold text-slate-700">.PDF</span>, ภาพถ่าย <span className="font-semibold text-slate-700">.PNG, .JPG</span>
              </p>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTriggerFileSelect(); }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition-colors shadow-xs"
                >
                  เลือกไฟล์จากเครื่อง
                </button>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleTriggerCamera(); }}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors inline-flex items-center gap-1"
                >
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>ถ่ายภาพเอกสาร</span>
                </button>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>AI Thai Neural Network + PDF Digital Layer พร้อมทำงาน</span>
              </div>
            </div>
          ) : (
            /* Direct Text Paste Area */
            <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
                <span>วางข้อความประกาศ / บันทึกข้อความ / แชตกลุ่ม</span>
                <span className="text-[11px] text-slate-400 font-normal">{pastedText.length} ตัวอักษร</span>
              </div>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="วางข้อความคำสั่งราชการ เช่น คำสั่งมหาวิทยาลัยราชภัฏนครสวรรค์ ที่ 1299/2569 เรื่อง แต่งตั้ง... กำหนดจัดขึ้นในวันที่ 28 กันยายน 2569 เวลา 09.00 น. ณ..."
                rows={7}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none font-mono"
              />
              <button
                type="button"
                onClick={handleProcessPastedText}
                disabled={!pastedText.trim() || isScanning}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>ประมวลผลข้อความด้วย AI Thai Parser</span>
              </button>
            </div>
          )}

          {/* Ingestion Engine Spec Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>ความสามารถของโมเดล AI OCR ในระบบ</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
              <li><strong className="text-slate-700">Digital & Scanned PDF:</strong> สกัดผ่านเลเยอร์ข้อความดิจิทัลทันที หรือเรนเดอร์สแกนเข้าสู่ OCR</li>
              <li><strong className="text-slate-700">Thai Numeral Normalization:</strong> แปลงเลขไทย (๑ ๒ ๓) สู่เลขอารบิกสำหรับฐานข้อมูลและปฏิทิน</li>
              <li><strong className="text-slate-700">G.P.O 1-6 Classification:</strong> จัดหมวดหมู่ภาระงาน กพอ. (วิจัย, บริการวิชาการ, การสอน, ทำนุบำรุง, บริหาร, ประกันคุณภาพ)</li>
              <li><strong className="text-slate-700">Smart Faculty Matching:</strong> จับคู่ชื่ออาจารย์ในสังกัด มรภ.นว. และคำนวณชั่วโมงภาระงานตามบทบาท</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Live Scanning Simulation & Verification Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${isScanning ? 'bg-amber-500 animate-ping' : scanResult ? 'bg-emerald-500' : 'bg-blue-600'}`}></span>
                <h3 className="text-sm font-bold text-slate-800">
                  หน้าต่างตรวจทานด่วน (Quick Verification Drawer)
                </h3>
              </div>
              {scanResult && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    เวลา: {scanDuration}s
                  </span>
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
                    AI OCR กำลังประมวลผลเอกสารจริง...
                  </h4>
                  <p className="text-xs text-blue-600 font-medium mt-1">
                    {scanMessage || 'โมเดล Neural Network กำลังตรวจจับตัวอักษรภาษาไทยและเลขไทย'}
                  </p>
                </div>
                <div className="max-w-xs mx-auto w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-sky-500 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">{scanProgress}% ดำเนินการ</span>
              </div>
            )}

            {/* Empty state before scanning */}
            {!isScanning && !scanResult && (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  ยังไม่มีเอกสารที่กำลังสกัดข้อมูล กรุณาเลือกไฟล์ PDF, อัปโหลดภาพถ่าย หรือคลิกเลือกตัวอย่างคำสั่งจริงด้านบนเพื่อเริ่มทดสอบ
                </p>
              </div>
            )}

            {/* Result Extracted Ready for Verification */}
            {!isScanning && scanResult && (
              <div className="mt-4 space-y-4 text-xs">
                {/* Result Tabs (Form / Raw Text / Preview) */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveResultTab('form')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeResultTab === 'form'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      แบบฟอร์มตรวจสอบ (Verification)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveResultTab('raw')}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                        activeResultTab === 'raw'
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      ข้อความสกัดดิบ (Raw OCR)
                    </button>
                    {previewUrl && (
                      <button
                        type="button"
                        onClick={() => setActiveResultTab('preview')}
                        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          activeResultTab === 'preview'
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        ภาพเอกสารจริง
                      </button>
                    )}
                  </div>

                  <span className="text-[11px] font-mono text-slate-400 truncate max-w-[180px]">
                    {activeFile?.name || scanResult.filename}
                  </span>
                </div>

                {/* TAB 1: FORM VIEW */}
                {activeResultTab === 'form' && (
                  <div className="space-y-3.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          เลขที่คำสั่ง
                        </label>
                        <input 
                          type="text" 
                          value={formData.orderNumber}
                          onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          หมวดหมู่ภาระงาน กพอ.
                        </label>
                        <select
                          value={formData.category}
                          onChange={(e) => {
                            const cat = WORKLOAD_CATEGORIES.find(c => c.name === e.target.value);
                            setFormData({
                              ...formData,
                              category: e.target.value,
                              categoryCode: cat?.code || 'service',
                              categoryColor: cat?.color || 'emerald'
                            });
                          }}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                        >
                          {WORKLOAD_CATEGORIES.filter(c => c.id !== 'all').map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          ชื่อคำสั่ง / กิจกรรม
                        </label>
                        <textarea 
                          rows={2}
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          วันจัดกิจกรรม (ค.ศ. สำหรับปฏิทิน)
                        </label>
                        <input 
                          type="date" 
                          value={formData.eventDate}
                          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          เวลา
                        </label>
                        <input 
                          type="text" 
                          value={formData.eventTime}
                          onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          สถานที่จัดงาน
                        </label>
                        <input 
                          type="text" 
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                        />
                      </div>
                    </div>

                    {/* Assigned Faculty Detection List */}
                    <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-200/80">
                      <div className="font-semibold text-sky-950 text-xs mb-2 flex items-center justify-between">
                        <span>บุคลากรที่ตรวจพบและเตรียมกระจายเข้าลิ้นชัก (Smart Dispatch):</span>
                        <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-md font-mono">
                          {formData.facultyAssigned.length} ท่าน
                        </span>
                      </div>

                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {formData.facultyAssigned.map((f, idx) => (
                          <div key={idx} className="bg-white p-2 rounded-lg border border-sky-100 flex items-center justify-between">
                            <div>
                              <span className="font-medium text-slate-800">{f.name}</span>
                              <span className="ml-2 text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                                {f.roleInOrder}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveFaculty(f.id)}
                              className="text-slate-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                              title="ลบอาจารย์ออกจากคำสั่งนี้"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Quick Add Faculty Dropdown */}
                      <div className="mt-2.5 pt-2 border-t border-sky-200/60 flex items-center gap-2">
                        <span className="text-[11px] text-sky-800 font-medium">เพิ่มอาจารย์:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleAddFacultyToOrder(e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="bg-white border border-sky-300 rounded-lg px-2 py-1 text-xs text-slate-700 outline-hidden cursor-pointer"
                        >
                          <option value="" disabled>เลือกอาจารย์ที่ต้องการเพิ่ม...</option>
                          {facultyList
                            .filter(fac => !formData.facultyAssigned.some(f => f.id === fac.id))
                            .map(fac => (
                              <option key={fac.id} value={fac.id}>{fac.name}</option>
                            ))}
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: RAW OCR TEXT */}
                {activeResultTab === 'raw' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>ข้อความที่ AI OCR สกัดได้จากเอกสาร (แปลงเลขไทยเป็นเลขอารบิกแล้ว):</span>
                      <button
                        type="button"
                        onClick={handleCopyText}
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                      >
                        {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{isCopied ? 'คัดลอกแล้ว' : 'คัดลอกข้อความ'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] font-mono text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap max-h-72 leading-relaxed">
                      {scanResult.detectedText}
                    </pre>
                  </div>
                )}

                {/* TAB 3: DOCUMENT PREVIEW */}
                {activeResultTab === 'preview' && previewUrl && (
                  <div className="space-y-2">
                    <div className="text-[11px] text-slate-500">
                      ภาพตัวอย่างเอกสารที่อัปโหลดเข้าสู่โมเดล OCR:
                    </div>
                    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-900/5 max-h-72 flex items-center justify-center p-2">
                      <img 
                        src={previewUrl} 
                        alt="Scanned Document Preview" 
                        className="max-h-68 object-contain rounded-lg shadow-xs"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Footer */}
          {scanResult && (
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  setScanResult(null);
                  setActiveFile(null);
                  setPreviewUrl(null);
                }}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก / เริ่มใหม่
              </button>
              <button
                type="button"
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
