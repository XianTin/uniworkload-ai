import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  FolderArchive,
  Info,
  ChevronRight,
  Search,
  User,
  Printer,
  Camera,
  ArrowUpRight,
  Calendar,
  AlertCircle,
  X,
  Award
} from 'lucide-react';
import { canViewAllFaculties } from '../utils/auth';
import EvidenceLightboxModal from './EvidenceLightboxModal';
import { 
  getOrderScore, 
  getOrderWorkloadType, 
  formatScore 
} from '../utils/workloadScoring';

export default function EportfolioCopilotModule({ 
  orders = [], 
  activeFaculty, 
  selectedOrderId, 
  currentUser,
  onNotify,
  onNavigateTab
}) {
  const allowViewAll = canViewAllFaculties(currentUser);
  const [viewAllFaculties, setViewAllFaculties] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedField, setCopiedField] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);

  // Compute available orders for this view
  const availableOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    if (allowViewAll && viewAllFaculties) return orders;
    return orders.filter(o => 
      (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id
    );
  }, [orders, activeFaculty?.id, viewAllFaculties, allowViewAll]);

  // Filter by search query
  const filteredOrders = useMemo(() => {
    if (!searchTerm) return availableOrders;
    const q = searchTerm.toLowerCase();
    return availableOrders.filter(o => 
      (o.orderNumber || '').toLowerCase().includes(q) ||
      (o.title || '').toLowerCase().includes(q) ||
      (o.category || '').toLowerCase().includes(q)
    );
  }, [availableOrders, searchTerm]);

  const [activeOrderId, setActiveOrderId] = useState(
    selectedOrderId || filteredOrders[0]?.id || (orders && orders[0]?.id) || null
  );

  // Sync activeOrderId when selectedOrderId, faculty, or scope changes
  useEffect(() => {
    if (selectedOrderId && filteredOrders.some(o => o.id === selectedOrderId)) {
      setActiveOrderId(selectedOrderId);
    } else if (!filteredOrders.some(o => o.id === activeOrderId)) {
      setActiveOrderId(filteredOrders[0]?.id || null);
    }
  }, [selectedOrderId, filteredOrders, activeOrderId]);

  const currentOrder = filteredOrders.find(o => o.id === activeOrderId) || filteredOrders[0] || null;

  const handleCopy = (fieldName, text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onNotify?.(`คัดลอก [${fieldName}] เรียบร้อยแล้ว`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!currentOrder) return;
    const ep = currentOrder.ePortfolio || {};
    const evFiles = (currentOrder.evidenceFiles || []).map(f => f.name || 'เอกสารคำสั่ง.pdf');
    const photos = (currentOrder.actualPhotos || []).map((p, i) => 
      typeof p === 'string' ? `ภาพถ่ายปฏิบัติงาน_${i + 1}.jpg` : (p.name || `ภาพถ่ายปฏิบัติงาน_${i + 1}.jpg`)
    );

    const criteriaType = getOrderWorkloadType(currentOrder);
    const criteriaScore = getOrderScore(currentOrder);
    const workloadRefText = ep.workloadRef || `ภาระงานด้าน${currentOrder.category || 'มหาวิทยาลัย'} | เกณฑ์: ${criteriaType} (${formatScore(criteriaScore)} คะแนน) — มหาวิทยาลัยราชภัฏนครสวรรค์`;

    const allText = `ปีการประเมิน: ${ep.year || '2569'}
รอบการประเมินที่: ${ep.round || 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)'}
หัวข้อ: ${ep.topic || currentOrder.title || ''}
อ้างอิงภาระงาน: ${workloadRefText}
เอกสารแนบ: ${evFiles.join(', ')}${photos.length ? ' และภาพถ่ายหน้างาน ' + photos.join(', ') : ''}
(จัดเตรียมข้อมูลโดยระบบ UniWorkload AI มหาวิทยาลัยราชภัฏนครสวรรค์)`;

    navigator.clipboard.writeText(allText);
    setCopiedField('all');
    onNotify?.('คัดลอกชุดข้อมูลฟอร์ม e-Portfolio ครบทั้ง 5 ช่องแล้ว!', 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  // Direct download for single evidence file (PDF or JPG)
  const handleDownloadSingleFile = async (fileUrl, fileName) => {
    const cleanFileName = fileName || 'evidence_attachment';
    if (!fileUrl) {
      const content = `เอกสารหลักฐานประกอบภาระงาน e-Portfolio มหาวิทยาลัยราชภัฏนครสวรรค์
คำสั่งเลขที่: ${currentOrder?.orderNumber || 'ยังไม่ระบุเลขคำสั่ง'}
เรื่อง: ${currentOrder?.title || ''}
วันที่จัด: ${currentOrder?.eventDate || ''}
สถานที่: ${currentOrder?.location || ''}
หมวดหมู่: ${currentOrder?.category || ''}
ผู้ปฏิบัติงาน: ${activeFaculty?.name || ''}`;
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${cleanFileName.replace(/\.[^/.]+$/, '')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onNotify?.(`ดาวน์โหลดเอกสารสรุป [${cleanFileName}] ตรงลงเครื่องสำเร็จ 🎯`, 'success');
      return;
    }

    try {
      if (fileUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        onNotify?.(`ดาวน์โหลดไฟล์ [${cleanFileName}] ตรงลงเครื่องสำเร็จ 🎯`, 'success');
        return;
      }

      // Try fetching as blob to enforce download filename in browser
      const res = await fetch(fileUrl);
      if (res.ok) {
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = cleanFileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
        onNotify?.(`ดาวน์โหลดไฟล์ [${cleanFileName}] ตรงลงเครื่องสำเร็จ 🎯`, 'success');
        return;
      }
    } catch (err) {
      console.warn('[Download] Blob fetch failed, falling back to direct link:', err);
    }

    // Direct fallback
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = cleanFileName;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify?.(`ดาวน์โหลดไฟล์ [${cleanFileName}] เรียบร้อยแล้ว 🎯`, 'success');
  };

  // Download all evidence files directly without forcing user to unzip
  const handleDownloadAllEvidenceFiles = () => {
    if (!currentOrder) return;
    const allFiles = [];
    (currentOrder.evidenceFiles || []).forEach((f, idx) => {
      allFiles.push({
        url: f.url,
        name: f.name || `คำสั่ง_${(currentOrder.orderNumber || 'order').replace(/[^a-zA-Z0-9ก-๙]/g, '_')}_${idx + 1}.pdf`
      });
    });

    // Deduplicate photos before queuing download
    const uniquePhotos = (currentOrder.actualPhotos || []).filter((photo, idx, arr) => {
      const pUrl = typeof photo === 'string' ? photo : (photo.url || photo.dataUrl);
      if (!pUrl) return true;
      return arr.findIndex(item => {
        const iUrl = typeof item === 'string' ? item : (item.url || item.dataUrl);
        return iUrl && pUrl && iUrl === pUrl;
      }) === idx;
    });

    uniquePhotos.forEach((p, idx) => {
      const pUrl = typeof p === 'string' ? p : p.url;
      const pName = (typeof p === 'object' && p.name) ? p.name : `ภาพถ่ายหลักฐาน_${idx + 1}.jpg`;
      allFiles.push({ url: pUrl, name: pName });
    });

    if (allFiles.length === 0) {
      onNotify?.('คำสั่งนี้ยังไม่มีไฟล์เอกสารหรือภาพถ่ายให้ดาวน์โหลด', 'warning');
      return;
    }

    allFiles.forEach((file, index) => {
      setTimeout(() => {
        handleDownloadSingleFile(file.url, file.name);
      }, index * 300);
    });

    onNotify?.(`กำลังเริ่มดาวน์โหลดไฟล์ทั้งหมด ${allFiles.length} รายการ ตรงเข้าเครื่อง (ไม่ต้องแตก zip)...`, 'success');
  };

  const handlePrintDossier = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold mb-1.5 border border-amber-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>โมดูลที่ 4: e-Portfolio Copilot (ถอดรหัสฟอร์มจริง มรภ.นครสวรรค์)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
              <span>ผู้ช่วยจัดเตรียมข้อมูลและคัดลอกลงระบบ e-Portfolio:</span>
              <span className="text-blue-700">{allowViewAll && viewAllFaculties ? 'รวมทุกท่านในระบบ' : (activeFaculty?.name || 'อาจารย์')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              หมดปัญหาการรื้อค้นคำสั่งย้อนหลัง ระบบจัดสรรข้อมูลให้ตรงตามฟอร์มจริง 5 ช่องของ มรภ.นครสวรรค์ พร้อมปุ่ม 1-Click Copy
            </p>

            {/* Scope Selector (Only for Admin & Staff) */}
            {allowViewAll && (
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs mt-3">
                <button
                  type="button"
                  onClick={() => setViewAllFaculties(false)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    !viewAllFaculties
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-blue-600" />
                  <span>เฉพาะ {activeFaculty?.name?.split(' ')?.[0] || 'อาจารย์'} ({(orders || []).filter(o => (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewAllFaculties(true)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    viewAllFaculties
                      ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 text-purple-600" />
                  <span>รวมทุกคน ({orders?.length || 0})</span>
                </button>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handlePrintDossier}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
              title="พิมพ์แบบฟอร์มรายงาน"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>พิมพ์แบบฟอร์ม (Print)</span>
            </button>

            <button
              onClick={handleCopyAll}
              disabled={!currentOrder}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50 ${
                copiedField === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/20'
              }`}
            >
              {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedField === 'all' ? 'คัดลอกครบทั้งฟอร์มแล้ว!' : '1-Click Copy ข้อมูลทั้งหมด'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Order Selector List with Search (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-800">
                เลือกคำสั่งเพื่อถอดแบบฟอร์ม:
              </h3>
              <span className="text-[10px] text-slate-500 font-mono bg-slate-100 px-2 py-0.5 rounded-md font-bold">
                {filteredOrders.length} ฉบับ
              </span>
            </div>

            {/* Search Filter Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาเลขคำสั่ง, ชื่อกิจกรรม..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Order Items List */}
            <div className="space-y-2 max-h-[540px] overflow-y-auto pr-1">
              {filteredOrders.length === 0 ? (
                <div className="py-10 text-center text-slate-400 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-slate-300" />
                  <p className="text-xs">ไม่พบคำสั่งราชการ</p>
                  {allowViewAll && orders.length > 0 && !viewAllFaculties && (
                    <button
                      type="button"
                      onClick={() => setViewAllFaculties(true)}
                      className="text-xs text-blue-600 hover:underline font-medium"
                    >
                      กดดูรวมทุกอาจารย์ ({orders.length} ฉบับ)
                    </button>
                  )}
                </div>
              ) : (
                filteredOrders.map((ord) => {
                  const isActive = ord.id === activeOrderId;
                  const photoCount = (ord.actualPhotos || []).length;
                  const isDone = ord.status === 'done';

                  return (
                    <div
                      key={ord.id}
                      onClick={() => setActiveOrderId(ord.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                        isActive
                          ? 'border-amber-500 bg-amber-50/50 shadow-xs ring-1 ring-amber-500/30'
                          : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1 gap-1">
                        <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100 truncate">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {(ord.ePortfolio?.round ? ord.ePortfolio.round.split(' ')[0] : 'รอบ 2')} {ord.ePortfolio?.year || '2569'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                        {ord.title}
                      </h4>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-950 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                          <Award className="w-2.5 h-2.5 text-amber-600" />
                          <span>+{formatScore(getOrderScore(ord))} คะแนน</span>
                          <span className="text-amber-800 font-normal">({getOrderWorkloadType(ord)})</span>
                        </span>
                      </div>
                      <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500 gap-1">
                        <span className="truncate text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                          {ord.category}
                        </span>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {photoCount > 0 ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                              <Camera className="w-2.5 h-2.5 text-emerald-600" />
                              <span>{photoCount}</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded font-medium">
                              รอรูป
                            </span>
                          )}
                          {isDone ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-[10px]">
                              <CheckCircle2 className="w-3 h-3" />
                              พร้อมส่ง
                            </span>
                          ) : (
                            <span className="text-slate-400 text-[10px]">รอตรวจ</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Col: NSRU 5-Field e-Portfolio Form Representation (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
              {/* Form Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3.5 gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-extrabold text-sm border border-blue-200 shadow-2xs">
                    5
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      แบบฟอร์มบันทึกภาระงาน e-Portfolio (เมนู: แฟ้มภาระงานอื่น ๆ)
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      ถอดแบบตามระบบสารสนเทศประเมินผลการปฏิบัติราชการ มหาวิทยาลัยราชภัฏนครสวรรค์
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={handleDownloadAllEvidenceFiles}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 transition-colors cursor-pointer shadow-2xs"
                    title="ดาวน์โหลดเอกสาร PDF และภาพถ่ายทั้งหมดตรงลงเครื่อง สะดวกในการอัปโหลดต่อใน e-Portfolio ไม่ต้องเสียเวลาแตก zip"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>ดาวน์โหลดไฟล์ทั้งหมด (ไฟล์ตรง ไม่ต้องแตก zip)</span>
                  </button>
                </div>
              </div>

              {/* Order Reference Badge Card */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                    คำสั่งอ้างอิง
                  </span>
                  <div className="font-bold text-slate-800 flex items-center gap-2">
                    <span className="font-mono text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {currentOrder.orderNumber}
                    </span>
                    <span>{currentOrder.title}</span>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                    currentOrder.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {currentOrder.status === 'done' ? '✓ ปฏิบัติงานแล้ว' : '⏳ รอดำเนินการ'}
                  </span>
                </div>
              </div>

              {/* 5 Form Fields with Individual 1-Click Copy */}
              <div className="space-y-3.5">
                {/* Field 1: Assessment Year */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ 1: ปีการประเมิน
                    </span>
                    <span className="text-sm font-semibold text-slate-900 font-mono">
                      {currentOrder.ePortfolio?.year || '2569'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (ระบบวิเคราะห์จาก พ.ศ. ของคำสั่งราชการให้อัตโนมัติ)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('ปีการประเมิน', currentOrder.ePortfolio?.year || '2569')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'ปีการประเมิน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedField === 'ปีการประเมิน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 2: Assessment Round */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ 2: รอบการประเมินที่
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {currentOrder.ePortfolio?.round || 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)'}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (คำนวณตามช่วงวันที่จัดกิจกรรม รอบ 1 หรือ รอบ 2)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('รอบการประเมินที่', currentOrder.ePortfolio?.round || 'รอบ 2')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'รอบการประเมินที่' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedField === 'รอบการประเมินที่' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 3: Topic */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-0.5 max-w-lg">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ 3: หัวข้อภาระงาน
                    </span>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {currentOrder.ePortfolio?.topic || currentOrder.title || 'คำสั่งราชการ'}
                    </p>
                    <span className="text-[11px] text-slate-500 block">
                      (สกัดบทบาทและชื่องานตามคำสั่งราชการอย่างกระชับและเป็นทางการ)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('หัวข้อภาระงาน', currentOrder.ePortfolio?.topic || currentOrder.title || '')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'หัวข้อภาระงาน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedField === 'หัวข้อภาระงาน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 4: Workload Reference */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1 max-w-lg">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ 4: อ้างอิงภาระงาน
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {currentOrder.ePortfolio?.workloadRef || `ภาระงานด้าน${currentOrder.category || 'มหาวิทยาลัย'} | เกณฑ์: ${getOrderWorkloadType(currentOrder)} (${formatScore(getOrderScore(currentOrder))} คะแนน) — มหาวิทยาลัยราชภัฏนครสวรรค์`}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-900 border border-amber-200 text-[10px] font-bold">
                        <Award className="w-3 h-3 text-amber-600" />
                        <span>เกณฑ์คะแนน: {getOrderWorkloadType(currentOrder)} (+{formatScore(getOrderScore(currentOrder))} คะแนน)</span>
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        (จับคู่กับ 15 เกณฑ์มาตรฐานและข้อบังคับมหาวิทยาลัย)
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleCopy('อ้างอิงภาระงาน', currentOrder.ePortfolio?.workloadRef || `ภาระงานด้าน${currentOrder.category || 'มหาวิทยาลัย'} | เกณฑ์: ${getOrderWorkloadType(currentOrder)} (${formatScore(getOrderScore(currentOrder))} คะแนน) — มหาวิทยาลัยราชภัฏนครสวรรค์`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs shrink-0"
                  >
                    {copiedField === 'อ้างอิงภาระงาน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedField === 'อ้างอิงภาระงาน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 5: Attachment Package with direct download */}
                <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 space-y-3 hover:bg-slate-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
                    <div>
                      <span className="text-[11px] font-bold text-slate-600 block uppercase tracking-wider">
                        ช่องที่ 5: แนบเอกสารหลักฐาน (Attachment)
                      </span>
                      <p className="text-[11px] text-slate-500">
                        กดดาวน์โหลดไฟล์ตรง (PDF / ภาพถ่าย JPG) เพื่อนำไปแนบในแบบฟอร์ม e-Portfolio ได้ทันที
                      </p>
                    </div>
                    <button
                      onClick={handleDownloadAllEvidenceFiles}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs shrink-0"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>ดาวน์โหลดทั้งหมด ({((currentOrder.evidenceFiles || []).length + (currentOrder.actualPhotos || []).length)} ไฟล์)</span>
                    </button>
                  </div>

                  {/* Individual File & Photo Pills with 1-click download */}
                  <div className="space-y-2">
                    {((currentOrder.evidenceFiles || []).length === 0 && (currentOrder.actualPhotos || []).length === 0) ? (
                      <p className="text-xs text-slate-400 italic py-1">
                        ยังไม่มีเอกสารหรือภาพถ่ายแนบในคำสั่งนี้ (สามารถอัปโหลดเพิ่มเติมได้ที่โมดูลลิ้นชักภาระงาน)
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {/* Evidence Files (PDF/Docs) */}
                        {(currentOrder.evidenceFiles || []).map((f, i) => {
                          const fileName = f.name || `คำสั่งราชการ_${i + 1}.pdf`;
                          return (
                            <div 
                              key={f.id || i} 
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-blue-200 transition-all group"
                            >
                              <div className="flex items-center gap-2 min-w-0 pr-2">
                                <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                                  <FileText className="w-4 h-4" />
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-800 truncate" title={fileName}>
                                    {fileName}
                                  </p>
                                  <span className="text-[10px] text-slate-400 block">เอกสารคำสั่ง / หนังสือราชการ</span>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => handleDownloadSingleFile(f.url, fileName)}
                                className="p-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-700 border border-slate-200/80 transition-colors cursor-pointer shrink-0"
                                title="ดาวน์โหลดไฟล์นี้ตรงลงเครื่อง"
                              >
                                <Download className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          );
                        })}

                        {/* Actual Photos (Deduplicated) */}
                        {(() => {
                          const uniquePhotos = (currentOrder.actualPhotos || []).filter((photo, idx, arr) => {
                            const pUrl = typeof photo === 'string' ? photo : (photo.url || photo.dataUrl);
                            if (!pUrl) return true;
                            return arr.findIndex(item => {
                              const iUrl = typeof item === 'string' ? item : (item.url || item.dataUrl);
                              return iUrl && pUrl && iUrl === pUrl;
                            }) === idx;
                          });

                          return uniquePhotos.map((p, i) => {
                            const photoObj = typeof p === 'string' ? { url: p, name: `ภาพถ่ายปฏิบัติงาน_${i + 1}.jpg` } : p;
                            const photoName = photoObj.name || `ภาพถ่ายปฏิบัติงาน_${i + 1}.jpg`;
                            return (
                            <div 
                              key={photoObj.id || i} 
                              className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-xl shadow-2xs hover:border-emerald-200 transition-all group"
                            >
                              <div 
                                className="flex items-center gap-2 min-w-0 pr-2 cursor-pointer"
                                onClick={() => setLightboxData({ photo: photoObj, order: currentOrder })}
                                title="คลิกเพื่อดูภาพขยาย"
                              >
                                {photoObj.url ? (
                                  <img 
                                    src={photoObj.url} 
                                    alt={photoName} 
                                    className="w-7 h-7 rounded-lg object-cover border border-slate-200 shrink-0" 
                                  />
                                ) : (
                                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                                    <Camera className="w-4 h-4" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-medium text-slate-800 truncate" title={photoName}>
                                    {photoName}
                                  </p>
                                  <span className="text-[10px] text-emerald-600 font-medium block">ภาพถ่ายหน้างาน (คลิกดูภาพ)</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={() => setLightboxData({ photo: photoObj, order: currentOrder })}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
                                  title="ดูรูปภาพขยาย"
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDownloadSingleFile(photoObj.url, photoName)}
                                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200/80 transition-colors cursor-pointer"
                                  title="ดาวน์โหลดรูปภาพตรงลงเครื่อง"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        });
                      })()}
                      </div>
                    )}
                  </div>

                  {/* Informative Tip Box */}
                  <div className="p-2.5 bg-blue-50/60 rounded-lg border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>ข้อแนะนำ:</strong> ระบบให้บริการดาวน์โหลดไฟล์ตรง (Direct Download) เพื่อให้อาจารย์สามารถแนบไฟล์เข้าช่องอัปโหลดของระบบ e-Portfolio มรภ.นครสวรรค์ ได้ทันทีโดยไม่ต้องแตกไฟล์ .ZIP
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-xs">กรุณาเลือกคำสั่งราชการจากรายการด้านซ้ายเพื่อดูแบบฟอร์ม</p>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Photo Preview */}
      <EvidenceLightboxModal
        photo={lightboxData?.photo}
        order={lightboxData?.order}
        onClose={() => setLightboxData(null)}
        onNotify={onNotify}
      />
    </div>
  );
}
