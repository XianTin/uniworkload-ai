import React, { useState } from 'react';
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
  ChevronRight
} from 'lucide-react';

export default function EportfolioCopilotModule({ 
  orders, 
  activeFaculty, 
  selectedOrderId, 
  onNotify 
}) {
  // Filter orders for this faculty
  const facultyOrders = orders.filter(o => o.facultyAssigned.some(f => f.id === activeFaculty.id));
  const [activeOrderId, setActiveOrderId] = useState(
    selectedOrderId || facultyOrders[0]?.id || orders[0]?.id
  );
  const [copiedField, setCopiedField] = useState(null);

  const currentOrder = orders.find(o => o.id === activeOrderId) || facultyOrders[0];

  const handleCopy = (fieldName, text) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    onNotify(`คัดลอก [${fieldName}] เรียบร้อยแล้ว`, 'success');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCopyAll = () => {
    if (!currentOrder) return;
    const allText = `ปีการประเมิน: ${currentOrder.ePortfolio.year}
รอบการประเมินที่: ${currentOrder.ePortfolio.round}
หัวข้อ: ${currentOrder.ePortfolio.topic}
อ้างอิงภาระงาน: ${currentOrder.ePortfolio.workloadRef}
เอกสารแนบ: ${currentOrder.evidenceFiles.map(f => f.name).join(', ')}${currentOrder.actualPhotos.length ? ' และภาพถ่ายหน้างาน ' + currentOrder.actualPhotos.map(p => p.name).join(', ') : ''}
(จัดเตรียมข้อมูลโดยระบบ UniWorkload AI มรภ.นครสวรรค์)`;

    navigator.clipboard.writeText(allText);
    setCopiedField('all');
    onNotify('คัดลอกชุดข้อมูลฟอร์ม e-Portfolio ครบทั้ง 5 ช่องแล้ว!', 'success');
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleDownloadEvidencePackage = () => {
    onNotify(`ดาวน์โหลดชุดแฟ้มหลักฐาน (คำสั่ง PDF + รูปภาพปฏิบัติงาน) ของ ${currentOrder.orderNumber} สำเร็จ`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>โมดูลที่ ๔: e-Portfolio Copilot (ถอดรหัสฟอร์มจริง มรภ.นครสวรรค์)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              ผู้ช่วยจัดเตรียมข้อมูลและคัดลอกลงระบบ e-Portfolio
            </h2>
            <p className="text-xs text-slate-500">
              หมดปัญหาการรื้อค้นคำสั่งย้อนหลัง! ระบบจัดสรรข้อมูลให้ตรงตามฟอร์มจริงของมหาวิทยาลัย พร้อมปุ่ม 1-Click Copy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyAll}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                copiedField === 'all'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md shadow-amber-500/20'
              }`}
            >
              {copiedField === 'all' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedField === 'all' ? 'คัดลอกครบทั้งฟอร์มแล้ว' : '1-Click Copy ข้อมูลทั้งหมด'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Order Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 mb-3 flex items-center justify-between">
              <span>เลือกคำสั่งราชการเพื่อเตรียมข้อมูล:</span>
              <span className="text-[10px] text-slate-400 font-mono">{facultyOrders.length} รายการ</span>
            </h3>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1">
              {facultyOrders.map((ord) => {
                const isActive = ord.id === activeOrderId;
                return (
                  <div
                    key={ord.id}
                    onClick={() => setActiveOrderId(ord.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                      isActive
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                        {ord.orderNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {ord.ePortfolio.round.split(' ')[0]} {ord.ePortfolio.year}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 leading-snug line-clamp-2">
                      {ord.title}
                    </h4>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="truncate max-w-[170px]">{ord.category}</span>
                      {ord.status === 'done' ? (
                        <span className="text-emerald-600 font-semibold flex items-center gap-0.5 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          พร้อมส่ง
                        </span>
                      ) : (
                        <span className="text-amber-600 text-[10px]">รอดำเนินการ</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: NSRU 5-Field e-Portfolio Form Representation (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {currentOrder ? (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              {/* Form Banner */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
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

                <button
                  onClick={handleDownloadEvidencePackage}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                >
                  <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
                  <span>ดาวน์โหลดไฟล์แนบทั้งหมด (.ZIP)</span>
                </button>
              </div>

              {/* 5 Form Fields with Individual 1-Click Copy */}
              <div className="space-y-4">
                {/* Field 1: Assessment Year */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ ๑: ปีการประเมิน
                    </span>
                    <span className="text-sm font-semibold text-slate-900 font-mono">
                      {currentOrder.ePortfolio.year}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (ระบบวิเคราะห์จาก พ.ศ. ของคำสั่งราชการให้อัตโนมัติ)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('ปีการประเมิน', currentOrder.ePortfolio.year)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedField === 'ปีการประเมิน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'ปีการประเมิน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 2: Assessment Round */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ ๒: รอบการประเมินที่
                    </span>
                    <span className="text-sm font-semibold text-slate-900">
                      {currentOrder.ePortfolio.round}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (คำนวณตามช่วงวันที่จัดกิจกรรม รอบ 1 หรือ รอบ 2)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('รอบการประเมินที่', currentOrder.ePortfolio.round)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedField === 'รอบการประเมินที่' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'รอบการประเมินที่' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 3: Topic */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-lg">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ ๓: หัวข้อภาระงาน
                    </span>
                    <p className="text-xs font-semibold text-slate-900 leading-relaxed">
                      {currentOrder.ePortfolio.topic}
                    </p>
                    <span className="text-[11px] text-slate-500 block">
                      (สกัดบทบาทและชื่องานตามคำสั่งราชการอย่างกระชับและเป็นทางการ)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('หัวข้อภาระงาน', currentOrder.ePortfolio.topic)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedField === 'หัวข้อภาระงาน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'หัวข้อภาระงาน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 4: Workload Reference */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5 max-w-lg">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ ๔: อ้างอิงภาระงาน
                    </span>
                    <span className="text-xs font-semibold text-slate-900 block">
                      {currentOrder.ePortfolio.workloadRef}
                    </span>
                    <span className="text-[11px] text-slate-500 block">
                      (จับคู่กับหมวดหมู่ตามข้อบังคับมหาวิทยาลัย)
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy('อ้างอิงภาระงาน', currentOrder.ePortfolio.workloadRef)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    {copiedField === 'อ้างอิงภาระงาน' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'อ้างอิงภาระงาน' ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>

                {/* Field 5: Attachment Package */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <span className="text-[11px] font-bold text-slate-500 block uppercase">
                      ช่องที่ ๕: แนบเอกสารหลักฐาน (Attachment)
                    </span>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {currentOrder.evidenceFiles.map(f => (
                        <span key={f.id} className="text-xs bg-white border border-slate-300 px-2.5 py-1 rounded-md text-slate-800 font-medium">
                          {f.name}
                        </span>
                      ))}
                      {currentOrder.actualPhotos.map(p => (
                        <span key={p.id} className="text-xs bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md text-emerald-800 font-medium">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadEvidencePackage}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>ดาวน์โหลดไฟล์แนบ</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
              <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-2" />
              <p className="text-xs">กรุณาเลือกคำสั่งราชการจากรายการด้านซ้าย</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
