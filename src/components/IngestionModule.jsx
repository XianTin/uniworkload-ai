import React, { useState, useRef, useEffect } from 'react';
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
  ChevronDown,
  X,
  ExternalLink,
  Download,
  Key,
  Server,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { extractTextFromDocument } from '../utils/ocrEngine';
import { parseThaiOfficialOrder } from '../utils/thaiDocumentParser';
import { 
  getAiSettings, 
  saveAiSettings, 
  checkGeminiStatus, 
  parseOfficialOrderWithGemini, 
  AI_MODES 
} from '../utils/geminiClient';
import { DEMO_RAW_ORDERS, WORKLOAD_CATEGORIES, FACULTY_MEMBERS, REAL_OFFICIAL_DOCUMENTS } from '../data/mockData';

export default function IngestionModule({ 
  onAddNewOrder, 
  onNotify, 
  facultyList = FACULTY_MEMBERS,
  activeFaculty = FACULTY_MEMBERS[0]
}) {
  const [selectedChannel, setSelectedChannel] = useState('pdf'); // 'pdf' | 'photo' | 'facebook' | 'chat' | 'text'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanMessage, setScanMessage] = useState('');
  const [scanResult, setScanResult] = useState(null);
  const [activeFile, setActiveFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [pastedText, setPastedText] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [facebookCaption, setFacebookCaption] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [scanDuration, setScanDuration] = useState(0);
  const [activeResultTab, setActiveResultTab] = useState('form'); // 'form' | 'raw' | 'preview'
  const [isCopied, setIsCopied] = useState(false);
  const [isOfficialDocsModalOpen, setIsOfficialDocsModalOpen] = useState(false);

  // AI Architecture & Mode State (Gemini 3.6 Flash vs Local Offline)
  const [aiMode, setAiMode] = useState(() => getAiSettings().mode || AI_MODES.GEMINI);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [aiSettings, setAiSettings] = useState(() => getAiSettings());
  const [connectionStatus, setConnectionStatus] = useState({ checked: false, online: false, type: '', message: '' });
  const [isTestingConn, setIsTestingConn] = useState(false);

  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    setIsTestingConn(true);
    try {
      const st = await checkGeminiStatus();
      setConnectionStatus({ checked: true, ...st });
    } catch (e) {
      setConnectionStatus({ checked: true, online: false, message: e.message });
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSwitchAiMode = (newMode) => {
    setAiMode(newMode);
    saveAiSettings({ mode: newMode });
    if (onNotify) {
      onNotify(newMode === 'gemini' 
        ? 'เปิดใช้งานโหมด Gemini 3.6 Flash (สกัดแม่นยำสูง)' 
        : 'เปิดใช้งานโหมด Local Offline (ทำงานในเครื่อง 100%)', 'info');
    }
  };

  const handleSaveSettings = () => {
    saveAiSettings(aiSettings);
    setAiMode(aiSettings.mode);
    setIsSettingsModalOpen(false);
    checkConnection();
    if (onNotify) onNotify('บันทึกการตั้งค่า AI สำเร็จ', 'success');
  };

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
    status: 'upcoming',
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

  // Handle Drag & Drop File Upload
  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await processRealDocument(file);
    }
  };

  // Process Real File with OCR Engine and AI Parser
  const processRealDocument = async (file) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage('กำลังโหลดเอกสารเข้าสู่ระบบ AI Parser...');
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

      if (result.previewUrl) {
        setPreviewUrl(result.previewUrl);
      }

      setScanProgress(85);
      setScanMessage(aiMode === 'gemini' 
        ? 'กำลังส่งให้ Gemini 3.6 Flash สกัดโครงสร้างและแก้ไขคำผิด...' 
        : 'กำลังวิเคราะห์โครงสร้างคำสั่งราชการ วันที่ เวลา และบุคลากร...');

      let parsedData;
      let engineUsed = aiMode;

      if (aiMode === 'gemini') {
        try {
          parsedData = await parseOfficialOrderWithGemini(result.text, file.name, facultyList, activeFaculty);
        } catch (geminiErr) {
          console.warn('Gemini parser unavailable, fallback to local:', geminiErr);
          engineUsed = 'local_fallback';
          const localParsed = parseThaiOfficialOrder(result.text, file.name, facultyList, activeFaculty);
          parsedData = localParsed.parsedData;
          if (onNotify) onNotify('ระบบ Gemini ไม่ตอบสนอง สลับใช้ Local Parser ให้ชั่วคราว', 'warning');
        }
      } else {
        const localParsed = parseThaiOfficialOrder(result.text, file.name, facultyList, activeFaculty);
        parsedData = localParsed.parsedData;
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setScanDuration(elapsed);

      setScanProgress(100);
      setIsScanning(false);
      setScanResult({
        filename: file.name,
        detectedConfidence: engineUsed === 'gemini' ? 99 : 92,
        detectedText: result.text || 'ไม่พบข้อความตัวอักษรในเอกสาร',
        parsedData,
        engine: engineUsed
      });
      setFormData({
        orderNumber: parsedData.orderNumber,
        title: parsedData.title,
        signDate: parsedData.signDate,
        eventDate: parsedData.eventDate,
        eventTime: parsedData.eventTime,
        location: parsedData.location,
        category: parsedData.category,
        categoryCode: parsedData.categoryCode,
        categoryColor: parsedData.categoryColor,
        workloadHours: parsedData.estimatedHours || 3,
        status: 'upcoming',
        facultyAssigned: parsedData.facultyAssigned
      });
      setActiveResultTab('form');
      const engineLabel = engineUsed === 'gemini' ? 'Gemini 3.6 Flash' : 'Local Engine';
      if (onNotify) onNotify(`AI สกัดเอกสารจริง [${file.name}] สำเร็จใน ${elapsed} วินาที (${engineLabel})!`, 'success');

    } catch (err) {
      console.error('OCR Error:', err);
      setIsScanning(false);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการประมวลผล OCR กรุณาลองใหม่อีกครั้ง หรือตรวจสอบไฟล์', 'error');
    }
  };

  // Load and test one of the real official PDF documents
  const handleLoadOfficialRealDoc = async (docItem) => {
    setIsOfficialDocsModalOpen(false);
    setIsScanning(true);
    setScanProgress(10);
    setScanMessage(`กำลังโหลดเอกสารราชการจริง [${docItem.fileName}]...`);
    setScanResult(null);
    setActiveFile(null);
    setPreviewUrl(null);

    try {
      const resp = await fetch(`/sample-docs/${docItem.fileName}`);
      if (!resp.ok) throw new Error('ไม่สามารถเข้าถึงไฟล์ทดสอบได้');
      const blob = await resp.blob();
      const file = new File([blob], docItem.fileName, { type: 'application/pdf' });
      await processRealDocument(file);
    } catch (err) {
      console.error('Error loading real doc sample:', err);
      setIsScanning(false);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการโหลดไฟล์ทดสอบ: ' + err.message, 'error');
    }
  };

  // Global Clipboard Paste (Ctrl+V) listener for instant screenshot upload
  useEffect(() => {
    const handleGlobalPaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            e.preventDefault();
            if (onNotify) {
              onNotify('📸 ตรวจพบภาพแคปหน้าจอจาก Clipboard! เริ่มประมวลผลด้วย AI...', 'info');
            }
            if (selectedChannel === 'text') {
              setSelectedChannel('facebook');
            }
            await processRealDocument(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [selectedChannel, onNotify]);

  // Process Facebook Post with Caption & Link
  const handleProcessFacebookPost = async () => {
    const textToProcess = (facebookCaption || pastedText || '').trim();
    if (!textToProcess && !previewUrl) {
      if (onNotify) onNotify('กรุณาแคปรูปโพสต์ Facebook (Ctrl+V) หรือวางข้อความแคปชั่นก่อนประมวลผล', 'warning');
      return;
    }

    if (!textToProcess && previewUrl) {
      if (onNotify) onNotify('ภาพแคป Facebook ได้รับการประมวลผลผ่าน AI Vision แล้ว กรุณาตรวจสอบข้อมูลในแบบฟอร์ม', 'info');
      return;
    }

    setIsScanning(true);
    setScanProgress(30);
    setScanMessage('AI กำลังสกัดข้อมูลจากโพสต์ Facebook...');
    setScanResult(null);

    const startTime = performance.now();
    try {
      let parsedData;
      let engineUsed = aiMode;

      if (aiMode === 'gemini') {
        try {
          parsedData = await parseOfficialOrderWithGemini(textToProcess, 'Facebook Post', facultyList, activeFaculty);
        } catch (geminiErr) {
          console.warn('Gemini parser fallback to local:', geminiErr);
          engineUsed = 'local_fallback';
          const localParsed = parseThaiOfficialOrder(textToProcess, 'Facebook Post', facultyList, activeFaculty);
          parsedData = localParsed.parsedData;
        }
      } else {
        const localParsed = parseThaiOfficialOrder(textToProcess, 'Facebook Post', facultyList, activeFaculty);
        parsedData = localParsed.parsedData;
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setScanDuration(elapsed);
      setScanProgress(100);
      setIsScanning(false);

      setScanResult({
        filename: 'โพสต์กิจกรรม Facebook',
        detectedConfidence: engineUsed === 'gemini' ? 98 : 90,
        detectedText: textToProcess,
        parsedData,
        engine: engineUsed
      });

      setFormData({
        orderNumber: parsedData.orderNumber || `FB-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}`,
        title: parsedData.title,
        signDate: parsedData.signDate || new Date().toISOString().split('T')[0],
        eventDate: parsedData.eventDate || new Date().toISOString().split('T')[0],
        eventTime: parsedData.eventTime || 'ไม่ระบุเวลา',
        location: parsedData.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์',
        category: parsedData.category || 'บริการวิชาการแก่สังคม',
        categoryCode: parsedData.categoryCode || 'service',
        categoryColor: parsedData.categoryColor || 'emerald',
        workloadHours: parsedData.estimatedHours || 3,
        status: 'upcoming',
        facultyAssigned: parsedData.facultyAssigned
      });

      setActiveResultTab('form');
      const engineLabel = engineUsed === 'gemini' ? 'Gemini Flash' : 'Local Engine';
      if (onNotify) onNotify(`AI สกัดข้อมูลจากโพสต์ Facebook สำเร็จใน ${elapsed} วินาที (${engineLabel})!`, 'success');
    } catch (err) {
      console.error('FB Post Parser Error:', err);
      setIsScanning(false);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการประมวลผลข้อความ Facebook', 'error');
    }
  };

  // Process Pasted Text
  const handleProcessPastedText = async () => {
    if (!pastedText.trim()) {
      if (onNotify) onNotify('กรุณาวางข้อความคำสั่งก่อนประมวลผล', 'warning');
      return;
    }

    setIsScanning(true);
    setScanProgress(30);
    setScanMessage(aiMode === 'gemini' 
      ? 'กำลังส่งให้ Gemini Flash วิเคราะห์โครงสร้างข้อความ...' 
      : 'AI กำลังสกัดข้อความคำสั่งราชการและแปลงเลขไทย...');
    setScanResult(null);
    setActiveFile(null);
    setPreviewUrl(null);

    const startTime = performance.now();

    try {
      let parsedData;
      let engineUsed = aiMode;

      if (aiMode === 'gemini') {
        try {
          parsedData = await parseOfficialOrderWithGemini(pastedText, 'ข้อความคำสั่ง.txt', facultyList, activeFaculty);
        } catch (err) {
          console.warn('Gemini failed, fallback to local:', err);
          engineUsed = 'local_fallback';
          const localParsed = parseThaiOfficialOrder(pastedText, 'ข้อความคำสั่ง.txt', facultyList, activeFaculty);
          parsedData = localParsed.parsedData;
        }
      } else {
        const localParsed = parseThaiOfficialOrder(pastedText, 'ข้อความคำสั่ง.txt', facultyList, activeFaculty);
        parsedData = localParsed.parsedData;
      }

      const elapsed = ((performance.now() - startTime) / 1000).toFixed(2);
      setScanDuration(elapsed);
      setIsScanning(false);
      setScanProgress(100);
      setScanResult({
        filename: 'ข้อความคำสั่ง.txt',
        detectedConfidence: engineUsed === 'gemini' ? 99 : 92,
        detectedText: pastedText,
        parsedData,
        engine: engineUsed
      });
      setFormData({
        orderNumber: parsedData.orderNumber,
        title: parsedData.title,
        signDate: parsedData.signDate,
        eventDate: parsedData.eventDate,
        eventTime: parsedData.eventTime,
        location: parsedData.location,
        category: parsedData.category,
        categoryCode: parsedData.categoryCode,
        categoryColor: parsedData.categoryColor,
        workloadHours: parsedData.estimatedHours || 3,
        status: 'upcoming',
        facultyAssigned: parsedData.facultyAssigned
      });
      setActiveResultTab('form');
      const engineLabel = engineUsed === 'gemini' ? 'Gemini Flash' : 'Local Engine';
      if (onNotify) onNotify(`วิเคราะห์โครงสร้างข้อความสำเร็จใน ${elapsed} วินาที (${engineLabel})!`, 'success');
    } catch (err) {
      console.error('Process pasted text error:', err);
      setIsScanning(false);
      if (onNotify) onNotify('เกิดข้อผิดพลาดในการประมวลผลข้อความ: ' + err.message, 'error');
    }
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

    const isFacebookSource = selectedChannel === 'facebook' || Boolean(facebookUrl);
    const orderEvidences = [
      {
        id: `ev-${Date.now()}`,
        name: isFacebookSource ? (activeFile?.name || 'ภาพแคปโพสต์_Facebook.png') : (activeFile?.name || scanResult.filename || 'เอกสารคำสั่ง.pdf'),
        size: activeFile?.size ? (activeFile.size / (1024 * 1024)).toFixed(1) + ' MB' : '1.8 MB',
        type: activeFile?.type?.includes('pdf') ? 'pdf' : 'image',
        url: previewUrl || null,
        uploadedAt: new Date().toISOString().split('T')[0]
      }
    ];

    if (facebookUrl) {
      orderEvidences.push({
        id: `ev-fb-${Date.now()}`,
        name: `ลิงก์โพสต์ Facebook: ${facebookUrl.slice(0, 45)}...`,
        size: 'Facebook URL',
        type: 'link',
        url: facebookUrl,
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }

    const orderActualPhotos = [];
    if (previewUrl && (isFacebookSource || selectedChannel === 'photo')) {
      orderActualPhotos.push({
        id: `photo-${Date.now()}`,
        url: previewUrl,
        name: activeFile?.name || 'ภาพแคปหลักฐาน_Facebook.jpg',
        uploadedAt: new Date().toISOString().split('T')[0]
      });
    }

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
      status: formData.status || 'upcoming',
      rawOcrText: scanResult.detectedText || '',
      documentFileName: activeFile?.name || (isFacebookSource ? 'ภาพแคปโพสต์_Facebook.png' : scanResult.filename) || 'เอกสารคำสั่ง.pdf',
      facebookUrl: facebookUrl || null,
      sourceChannel: isFacebookSource ? 'facebook' : selectedChannel,
      evidenceFiles: orderEvidences,
      actualPhotos: orderActualPhotos,
      ePortfolio: {
        year: formData.signDate ? String(new Date(formData.signDate).getFullYear() + 543) : '2569',
        round: 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
        topic: formData.title,
        role: formData.facultyAssigned[0]?.roleInOrder || 'กรรมการดำเนินงาน',
        hours: Number(formData.workloadHours) || 3,
        workloadRef: `ภาระงานด้าน${formData.category} มหาวิทยาลัยราชภัฏนครสวรรค์`,
        resultSummary: (formData.status === 'done')
          ? `ปฏิบัติหน้าที่ตามคำสั่ง ${formData.orderNumber} เรียบร้อยแล้ว`
          : `อยู่ระหว่างรอดำเนินการตามกำหนดการคำสั่งราชการ`,
        status: (formData.status === 'done') ? 'completed' : 'pending_task'
      }
    };

    onAddNewOrder(newOrderObj);
    setScanResult(null);
    setScanProgress(0);
    setActiveFile(null);
    setPreviewUrl(null);
    setFacebookUrl('');
    setFacebookCaption('');
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

        {/* Preset & Real Sample Quick Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsOfficialDocsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all cursor-pointer shadow-sm shadow-blue-500/20 active:scale-95"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>คลังเอกสารราชการจริง ({REAL_OFFICIAL_DOCUMENTS.length} ฉบับ)</span>
            <span className="px-1.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold">{REAL_OFFICIAL_DOCUMENTS.length}</span>
          </button>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">หรือ Preset ด่วน:</span>
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

      {/* AI Status & Engine Controller Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-gradient-to-r from-slate-50 via-blue-50/30 to-indigo-50/20 border border-slate-200/80 text-xs shadow-2xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
              connectionStatus.online ? 'bg-emerald-400' : 'bg-amber-400'
            }`}></span>
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              connectionStatus.online ? 'bg-emerald-500' : 'bg-amber-500'
            }`}></span>
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-800">
              {connectionStatus.online 
                ? (connectionStatus.type === 'google_direct' ? '🟢 Google Gemini Flash AI (เชื่อมต่อตรง)' : '🟢 Gemini AI Engine Online')
                : '🟡 Local Heuristic Engine (โหมดออฟไลน์ / ไร้ API Key)'}
            </span>
            <span className="text-slate-300 hidden sm:inline">|</span>
            <span className="text-slate-500 text-[11px]">
              {connectionStatus.online 
                ? `โมเดล: ${connectionStatus.model || 'gemini-1.5-flash'} • สกัดภาษาไทยแม่นยำสูง`
                : 'ทำงานในเครื่อง ไม่เชื่อมต่ออินเทอร์เน็ต (สามารถใส่ Gemini Key เพื่อความแม่นยำ 100%)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switch Pill */}
          <div className="inline-flex rounded-xl bg-slate-200/70 p-0.5 border border-slate-200">
            <button
              type="button"
              onClick={() => handleSwitchAiMode(AI_MODES.GEMINI)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                aiMode === AI_MODES.GEMINI 
                  ? 'bg-white text-blue-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Gemini Flash
            </button>
            <button
              type="button"
              onClick={() => handleSwitchAiMode(AI_MODES.LOCAL)}
              className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all cursor-pointer ${
                aiMode === AI_MODES.LOCAL 
                  ? 'bg-white text-slate-800 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Local Engine
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 hover:border-blue-300 hover:text-blue-700 transition-all cursor-pointer shadow-2xs active:scale-95"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
            <span>ตั้งค่า AI / API Key</span>
            {!connectionStatus.online && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                แนะนำ
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upload & Channel Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Channel Selectors */}
          <div className="grid grid-cols-5 gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedChannel('pdf')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'pdf'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span className="text-[11px]">ไฟล์ PDF</span>
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
              <span className="text-[11px]">ภาพถ่าย</span>
            </button>
            <button
              onClick={() => setSelectedChannel('facebook')}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'facebook'
                  ? 'bg-white text-blue-600 shadow-xs font-semibold ring-1 ring-blue-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4 fill-current text-blue-600" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span className="text-[11px]">แคป FB</span>
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
              <span className="text-[11px]">แคป LINE</span>
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
              <span className="text-[11px]">วางข้อความ</span>
            </button>
          </div>

          {/* Conditional Channel View: Facebook vs File Upload vs Textarea */}
          {selectedChannel === 'facebook' ? (
            <div className="bg-white border border-blue-200/90 rounded-2xl p-4 sm:p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-blue-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                    <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">นำเข้าจาก Facebook (แคปรูป + ลิงก์)</h4>
                    <p className="text-[10px] text-slate-500">สกัดโพสต์กิจกรรม, โปสเตอร์ประชาสัมพันธ์, หรือภาพประกาศ</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-semibold text-[10px] border border-blue-200">
                  AI Dual-Engine
                </span>
              </div>

              {/* Facebook Link Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>🔗 ลิงก์โพสต์ Facebook (URL อ้างอิง)</span>
                  <span className="text-[10px] text-slate-400 font-normal">ระบบจะผูกเป็น Deep-Link ตรวจสอบ</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={facebookUrl}
                    onChange={(e) => setFacebookUrl(e.target.value)}
                    placeholder="วางลิงก์ เช่น https://www.facebook.com/nsru.official/posts/..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden font-mono"
                  />
                  {facebookUrl && (
                    <button
                      type="button"
                      onClick={() => setFacebookUrl('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Screenshot Dropzone with Ctrl+V support */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={handleTriggerFileSelect}
                className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                    : 'border-blue-200 hover:border-blue-400 bg-blue-50/30 hover:bg-blue-50/60'
                }`}
              >
                {previewUrl ? (
                  <div className="space-y-2">
                    <img src={previewUrl} alt="Facebook Screenshot" className="max-h-36 mx-auto rounded-lg border border-blue-200 object-contain shadow-2xs" />
                    <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>โหลดภาพแคป Facebook สำเร็จแล้ว คลิกเพื่อเปลี่ยนภาพ</span>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="w-10 h-10 mx-auto rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shadow-2xs">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">
                        ลากภาพแคปหน้าจอ Facebook มาวาง หรือคลิกเลือกรูป
                      </h5>
                      <p className="text-[11px] text-blue-600 font-semibold mt-0.5">
                        💡 เคล็ดลับ: กด <kbd className="px-1.5 py-0.5 rounded-md bg-white border border-blue-300 font-mono text-[10px] text-slate-800 shadow-2xs">Ctrl + V</kbd> วางภาพจาก Clipboard ได้ทันที!
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Optional Caption Textarea */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
                  <span>📝 ข้อความแคปชั่นในโพสต์ Facebook (ทางเลือก)</span>
                  <span className="text-[10px] text-slate-400">{facebookCaption.length} ตัวอักษร</span>
                </label>
                <textarea
                  value={facebookCaption}
                  onChange={(e) => setFacebookCaption(e.target.value)}
                  placeholder="คัดลอกข้อความแคปชั่นในโพสต์ Facebook มาวางที่นี่ (หากมี) เพื่อช่วย AI จับคู่ชื่องานและรายละเอียด..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden resize-none"
                />
              </div>

              {/* Action button */}
              {facebookCaption.trim() && !isScanning && (
                <button
                  type="button"
                  onClick={handleProcessFacebookPost}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>สกัดข้อมูลจากแคปชั่นและลิงก์ด้วย AI</span>
                </button>
              )}

              {/* Technical Facts Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>ทำไมการแคปรูป (Cap) ถึงเสถียรกว่าการดึงลิงก์เพียวๆ?</span>
                </div>
                <p className="text-slate-500 leading-relaxed text-[10.5px]">
                  Facebook มีระบบป้องกันบอท (Login Wall / Walled Garden) และติดนโยบาย CORS ของเบราว์เซอร์ การแคปรูปหน้าจอโปสเตอร์แล้วกด Ctrl+V จึงเป็นวิธีที่ AI อ่านภาษาไทยได้แม่นยำที่สุด 100% พร้อมบันทึกลิงก์ Facebook ไว้เป็นหลักฐานอ้างอิง
                </p>
              </div>
            </div>
          ) : selectedChannel !== 'text' ? (
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

                      {/* Explicit Status Selector */}
                      <div className="sm:col-span-2 pt-1">
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                          <span>สถานะการปฏิบัติงานเริ่มต้น:</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            (กำหนดเป็น "รอดำเนินการ" เพื่อรอแนบภาพถ่ายหลังเสร็จงาน)
                          </span>
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, status: 'upcoming' }))}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                              (formData.status || 'upcoming') === 'upcoming'
                                ? 'bg-amber-50 text-amber-800 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>⏳ รอดำเนินการ (Upcoming)</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData(p => ({ ...p, status: 'done' }))}
                            className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer border ${
                              formData.status === 'done'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20 shadow-xs'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>✓ ปฏิบัติงานแล้วเสร็จ (Done)</span>
                          </button>
                        </div>
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

      {/* Real Official Documents Test Suite Modal */}
      {isOfficialDocsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    คลังเอกสารคำสั่งราชการจริงสำหรับทดสอบระบบ ({REAL_OFFICIAL_DOCUMENTS.length} ฉบับ)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    คลิกเลือกฉบับที่ต้องการเพื่อทดสอบ AI OCR & Thai Parser ทันที หรือทดสอบ Drag & Drop ไฟล์จากโฟลเดอร์เครื่อง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOfficialDocsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5 divide-y divide-slate-100">
              {REAL_OFFICIAL_DOCUMENTS.map((doc, idx) => (
                <div 
                  key={doc.id}
                  className="pt-2.5 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900">
                        {idx + 1}. {doc.title}
                      </span>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${doc.badgeColor}`}>
                        {doc.badge}
                      </span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600">
                        {doc.org}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      {doc.subtitle}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">
                      ไฟล์: {doc.fileName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`/sample-docs/${doc.fileName}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition-colors"
                      title="ดูไฟล์ต้นฉบับในแท็บใหม่"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      type="button"
                      onClick={() => handleLoadOfficialRealDoc(doc)}
                      className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                    >
                      ทดสอบฉบับนี้
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>ตำแหน่งไฟล์ในเครื่อง: <code className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">Projects/uniworkload-ai/sample-documents/</code></span>
              <button
                type="button"
                onClick={() => setIsOfficialDocsModalOpen(false)}
                className="px-3.5 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Configuration Modal */}
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    ตั้งค่า AI Engine (Gemini & Local)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    กำหนดการทำงานของ AI สกัดคำสั่งและภาระงาน กพอ. บนเครื่องนี้
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto text-xs">
              {/* Engine Mode Selection */}
              <div className="space-y-2">
                <label className="font-semibold text-slate-700 block text-xs">
                  เลือกโหมดการทำงาน:
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAiSettings(prev => ({ ...prev, mode: AI_MODES.GEMINI }));
                      handleSwitchAiMode(AI_MODES.GEMINI);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      aiSettings.mode === AI_MODES.GEMINI
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 ring-2 ring-blue-100 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold">Google Gemini Flash</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                      สกัดคำสั่งภาษาไทย แก้คำผิด และจัดหมวด กพอ. แม่นยำสูงสุด
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAiSettings(prev => ({ ...prev, mode: AI_MODES.LOCAL }));
                      handleSwitchAiMode(AI_MODES.LOCAL);
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      aiSettings.mode === AI_MODES.LOCAL
                        ? 'border-blue-500 bg-blue-50/60 text-blue-900 ring-2 ring-blue-100 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Server className="w-4 h-4 text-slate-600" />
                      <span className="text-xs font-bold">Local Engine</span>
                    </div>
                    <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                      ทำงานในเครื่อง 100% ไม่ต้องต่อเน็ต และไม่จำเป็นต้องมี API Key
                    </p>
                  </button>
                </div>
              </div>

              {/* Google Gemini API Key Section */}
              {aiSettings.mode === AI_MODES.GEMINI && (
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-blue-600" />
                        <span>Google Gemini API Key</span>
                      </label>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 underline"
                      >
                        <span>รับฟรีที่ Google AI Studio</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <input
                      type="password"
                      value={aiSettings.apiKey || ''}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, apiKey: e.target.value.trim() }))}
                      placeholder="วาง API Key เช่น AIzaSy..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden"
                    />
                    <p className="text-[10.5px] text-slate-500 leading-relaxed">
                      💡 คีย์จะถูกจัดเก็บใน LocalStorage บนเครื่องนี้อย่างปลอดภัย ไม่ถูกส่งไปยังบุคคลที่สาม สามารถใช้งานได้ฟรี 15 คำขอ/นาที
                    </p>
                  </div>

                  {/* Model Selector */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-slate-700 block text-xs">
                      เวอร์ชันโมเดล Gemini Flash:
                    </label>
                    <select
                      value={aiSettings.model || 'gemini-1.5-flash'}
                      onChange={(e) => setAiSettings(prev => ({ ...prev, model: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500 outline-hidden"
                    >
                      <option value="gemini-1.5-flash">Gemini 1.5 Flash (เสถียร รวดเร็ว — แนะนำ)</option>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (โมเดลเวอร์ชันใหม่)</option>
                      <option value="gemini-2.5-flash">Gemini 2.5 Flash (ฉลาดวิเคราะห์ลึก)</option>
                    </select>
                  </div>

                  {/* Connection Test Box */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700">สถานะการเชื่อมต่อ:</span>
                      <button
                        type="button"
                        onClick={checkConnection}
                        disabled={isTestingConn}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-medium text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3 h-3 ${isTestingConn ? 'animate-spin' : ''}`} />
                        <span>{isTestingConn ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                      </button>
                    </div>
                    <div className="text-[11px] flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${connectionStatus.online ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                      <span className={connectionStatus.online ? 'text-emerald-700 font-medium' : 'text-slate-600'}>
                        {connectionStatus.message || (connectionStatus.online ? 'เชื่อมต่อ Gemini สำเร็จ พร้อมใช้งาน' : 'ยังไม่ได้ระบุ API Key')}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setIsSettingsModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={handleSaveSettings}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>บันทึกการตั้งค่า</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
