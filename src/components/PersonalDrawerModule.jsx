import React, { useState } from 'react';
import { 
  Layers, 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Calendar, 
  MapPin, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  ArrowUpRight, 
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import EvidenceUploadModal from './EvidenceUploadModal';

export default function PersonalDrawerModule({ 
  orders, 
  activeFaculty, 
  onToggleStatus, 
  onSaveEvidence, 
  onJumpToEportfolio,
  onNotify
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | upcoming | done
  const [selectedOrderForEvidence, setSelectedOrderForEvidence] = useState(null);

  // Filter orders relevant to this faculty member
  const facultyOrders = orders.filter((order) => {
    const isAssigned = order.facultyAssigned.some(f => f.id === activeFaculty.id);
    if (!isAssigned) return false;

    if (filterStatus === 'upcoming' && order.status !== 'upcoming') return false;
    if (filterStatus === 'done' && order.status !== 'done') return false;

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchTitle = order.title.toLowerCase().includes(q);
      const matchCategory = order.category.toLowerCase().includes(q);
      return matchNumber || matchTitle || matchCategory;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Search Filters */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-semibold mb-1.5">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>โมดูลที่ ๒: Smart Dispatch & Personal Drawer</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              ตู้ลิ้นชักแฟ้มหลักฐานส่วนบุคคล: {activeFaculty.name}
            </h2>
            <p className="text-xs text-slate-500">
              รวบรวมคำสั่งราชการที่ระบุชื่อของท่าน พร้อมพื้นที่แนบภาพถ่ายปฏิบัติงานจริง เพื่อใช้เป็นหลักฐานรอบประเมิน
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">ทั้งหมด:</span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg font-mono">
              {facultyOrders.length} รายการ
            </span>
          </div>
        </div>

        {/* Search & Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขคำสั่ง, ชื่อกิจกรรม, หมวดหมู่..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === 'upcoming'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รอดำเนินการ
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                filterStatus === 'done'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ปฏิบัติงานแล้ว (พร้อมส่ง SAR)
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {facultyOrders.map((order) => {
          const myAssignment = order.facultyAssigned.find(f => f.id === activeFaculty.id);
          const isDone = order.status === 'done';

          return (
            <div
              key={order.id}
              className={`bg-white rounded-2xl p-5 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                isDone 
                  ? 'border-emerald-200/80 hover:border-emerald-300 bg-gradient-to-b from-white to-emerald-50/20' 
                  : 'border-slate-200/90 hover:border-blue-300'
              }`}
            >
              <div>
                {/* Top Badge & Actions */}
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {order.orderNumber}
                    </span>
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                      {order.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onToggleStatus(order.id)}
                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
                    <span>{isDone ? 'ปฏิบัติงานแล้ว' : 'ทำเครื่องหมายว่าเสร็จแล้ว'}</span>
                  </button>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                  {order.title}
                </h3>

                {/* Role in this order */}
                {myAssignment && (
                  <div className="bg-sky-50/80 border border-sky-100 rounded-xl p-2.5 mb-3 flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-sky-600 shrink-0" />
                    <div>
                      <span className="text-[11px] text-sky-950 font-semibold block">บทบาทตามคำสั่ง:</span>
                      <span className="text-xs text-slate-800 font-medium">{myAssignment.roleInOrder}</span>
                    </div>
                  </div>
                )}

                {/* Meta details */}
                <div className="space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>กำหนดการ: <strong>{order.eventDate}</strong> ({order.eventTime})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">สถานที่: {order.location}</span>
                  </div>
                </div>

                {/* Evidence Attachments Section */}
                <div className="border-t border-slate-100 pt-3 mb-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      หลักฐานและเอกสารแนบ ({order.evidenceFiles.length + order.actualPhotos.length} รายการ)
                    </span>
                    <button
                      onClick={() => setSelectedOrderForEvidence(order)}
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>แนบรูปเพิ่ม</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* PDF Order */}
                    {order.evidenceFiles.map((f) => (
                      <span
                        key={f.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                        onClick={() => onNotify(`เปิดดูไฟล์: ${f.name}`, 'info')}
                      >
                        <FileText className="w-3 h-3 text-red-500" />
                        <span className="truncate max-w-[140px]">{f.name}</span>
                      </span>
                    ))}

                    {/* Actual Photos */}
                    {order.actualPhotos.map((p) => (
                      <span
                        key={p.id}
                        className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md transition-colors cursor-pointer border border-emerald-100"
                        onClick={() => onNotify(`เปิดดูภาพหลักฐาน: ${p.name}`, 'info')}
                      >
                        <ImageIcon className="w-3 h-3 text-emerald-600" />
                        <span className="truncate max-w-[140px]">{p.name}</span>
                      </span>
                    ))}

                    {order.actualPhotos.length === 0 && (
                      <span className="text-[11px] text-amber-600 italic">
                        * ยังไม่ได้แนบภาพถ่ายหน้างาน (กด "แนบรูปเพิ่ม" เมื่อเสร็จงาน)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Card Footer: e-Portfolio shortcut */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  ประเมิน: {order.ePortfolio.round.split(' ')[0]} {order.ePortfolio.year}
                </span>
                <button
                  onClick={() => onJumpToEportfolio(order)}
                  className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
                >
                  <span>จัดเตรียม e-Portfolio</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {facultyOrders.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center text-slate-400 border border-slate-200">
          <Layers className="w-12 h-12 mx-auto stroke-1 text-slate-300 mb-3" />
          <p className="text-sm font-semibold text-slate-700">ไม่พบคำสั่งราชการในเงื่อนไขนี้</p>
          <p className="text-xs text-slate-500 mt-1">
            ลองปรับเปลี่ยนคำค้นหา หรือสลับไปแท็บอื่น
          </p>
        </div>
      )}

      {/* Upload Modal */}
      <EvidenceUploadModal
        isOpen={!!selectedOrderForEvidence}
        order={selectedOrderForEvidence}
        onClose={() => setSelectedOrderForEvidence(null)}
        onSaveEvidence={onSaveEvidence}
      />
    </div>
  );
}
