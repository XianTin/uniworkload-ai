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
  X
} from 'lucide-react';

export default function EportfolioCopilotModule({ 
  orders = [], 
  activeFaculty, 
  selectedOrderId, 
  onNotify,
  onNavigateTab
}) {
  const [viewAllFaculties, setViewAllFaculties] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedField, setCopiedField] = useState(null);

  // Compute available orders for this view
  const availableOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    if (viewAllFaculties) return orders;
    return orders.filter(o => 
      (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id
    );
  }, [orders, activeFaculty?.id, viewAllFaculties]);

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

    const allText = `ปีการประเมิน: ${ep.year || '2569'}
รอบการประเมินที่: ${ep.round || 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)'}
หัวข้อ: ${ep.topic || currentOrder.title || ''}
อ้างอิงภาระงาน: ${ep.workloadRef || `ภาระงานด้าน${currentOrder.category || 'มหาวิทยาลัย'} มรภ.นครสวรรค์`}
เอกสารแนบ: ${evFiles.join(', ')}${photos.length ? ' และภาพถ่ายหน้างาน ' + photos.join(', ') : ''}
(จัดเตรียมข้อมูลโดยระบบ UniWorkload AI มหาวิทยาลัยราชภัฏนครสวรรค์)`;

    navigator.clipboard.writeText(allText);
    setCopiedField('all');
    onNotify?.('คัดลอกชุดข้อมูลฟอร์ม e-Portfolio ครบทั้ง 5 ช่องแล้ว!', 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDownloadEvidencePackage = () => {
    onNotify?.(`ดาวน์โหลดชุดแฟ้มหลักฐาน (คำสั่ง PDF + รูปภาพปฏิบัติงาน) ของ ${currentOrder?.orderNumber || ''} สำเร็จ`, 'success');
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
              <span className="text-blue-700">{viewAllFaculties ? 'รวมทุกท่านในระบบ' : (activeFaculty?.name || 'อาจารย์')}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              หมดปัญหาการรื้อค้นคำสั่งย้อนหลัง ระบบจัดสรรข้อมูลให้ตรงตามฟอร์มจริง 5 ช่องของ มรภ.นครสวรรค์ พร้อมปุ่ม 1-Click Copy
            </p>

            {/* Scope Selector */}
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
                  {orders.length > 0 && !viewAllFaculties && (
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
                      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 gap-1">
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
                    onClick={handleDownloadEvidencePackage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
                    <span>ดาวน์โหลดไฟล์แนบ (.ZIP)</span>
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
                  <div className="space-y-0.5 max-w-lg">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ 4: อ้างอิงภาระงาน
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {currentOrder.ePortfolio?.workloadRef || `ภาระงานด้าน${currentOrder.category || 'มหาวิทยาลัย'} มหาวิทยาลัยราชภัฏนครสวรรค์`}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (จับคู่กับหมวดหมู่ตามเกณฑ์ ก.พอ. และข้อบังคับมหาวิทยาลัย)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('อ้างอิงภาระงาน', currentOrder.ePortfolio?.workloadRef || `ภาระงานด้าน${currentOrder.category || 'มหาวิทยาลัย'}`)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                  >
                    {copiedField === 'อ้างอิงภาระงาน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{copiedField === 'อ้างอิงภาระงาน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 5: Attachment Package */}
                <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ 5: แนบเอกสารหลักฐาน (Attachment)
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {(currentOrder.evidenceFiles || []).map((f, i) => (
                        <span key={f.id || i} className="text-xs bg-white border border-slate-300 px-2.5 py-1 rounded-md text-slate-800 font-medium flex items-center gap-1">
                          <FileText className="w-3 h-3 text-rose-500" />
                          <span>{f.name || 'เอกสารคำสั่ง.pdf'}</span>
                        </span>
                      ))}
                      {(currentOrder.actualPhotos || []).map((p, i) => {
                        const name = typeof p === 'string' ? `ภาพถ่ายหลักฐาน_${i + 1}.jpg` : (p.name || `ภาพถ่ายหลักฐาน_${i + 1}.jpg`);
                        return (
                          <span key={p.id || i} className="text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-emerald-800 font-medium flex items-center gap-1">
                            <Camera className="w-3 h-3 text-emerald-600" />
                            <span>{name}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadEvidencePackage}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลด</span>
                  </button>
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
    </div>
  );
}
