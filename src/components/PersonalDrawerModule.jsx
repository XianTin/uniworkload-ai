import React, { useState, useMemo } from 'react';
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
  UserCheck,
  CalendarRange,
  RotateCcw,
  Sparkles,
  Printer,
  Maximize2,
  Trash2,
  AlertCircle
} from 'lucide-react';
import EvidenceUploadModal from './EvidenceUploadModal';
import EvidenceLightboxModal from './EvidenceLightboxModal';
import DossierSummaryModal from './DossierSummaryModal';
import { WORKLOAD_CATEGORIES } from '../data/mockData';

// Helper function to format date into Thai Buddhist Era string
function formatThaiDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const thaiMonths = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];
  
  const day = date.getDate();
  const month = thaiMonths[date.getMonth()];
  const year = date.getFullYear() + 543;
  return `${day} ${month} ${year}`;
}

export default function PersonalDrawerModule({ 
  orders, 
  activeFaculty, 
  onToggleStatus, 
  onSaveEvidence, 
  onDeleteEvidence,
  onJumpToEportfolio,
  onNotify,
  onAddSampleOrder,
  onOpenAddFaculty
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | upcoming | done | missing_photo
  const [selectedCategory, setSelectedCategory] = useState('all'); // all | category name
  
  // Custom Date Range filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [selectedOrderForEvidence, setSelectedOrderForEvidence] = useState(null);
  const [lightboxData, setLightboxData] = useState(null); // { photo, order }
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  // Quick Preset Handlers
  const applyPresetDate = (preset) => {
    switch (preset) {
      case 'user_test_2567': // "1 มกราคม 2567 ถึง 25 มิถุนายน 2567"
        setStartDate('2024-01-01');
        setEndDate('2024-06-25');
        onNotify?.('เลือกช่วงวันที่: ๑ มกราคม ๒๕๖๗ – ๒๕ มิถุนายน ๒๕๖๗', 'info');
        break;
      case 'year_2567':
        setStartDate('2024-01-01');
        setEndDate('2024-12-31');
        onNotify?.('เลือกช่วงวันที่: ตลอดปี พ.ศ. ๒๕๖๗', 'info');
        break;
      case 'year_2568':
        setStartDate('2025-01-01');
        setEndDate('2025-12-31');
        onNotify?.('เลือกช่วงวันที่: ตลอดปี พ.ศ. ๒๕๖๘', 'info');
        break;
      case 'year_2569':
        setStartDate('2026-01-01');
        setEndDate('2026-12-31');
        onNotify?.('เลือกช่วงวันที่: ตลอดปี พ.ศ. ๒๕๖๙ (ปัจจุบัน)', 'info');
        break;
      case 'round1_2569':
        setStartDate('2025-10-01');
        setEndDate('2026-03-31');
        onNotify?.('เลือกช่วงรอบประเมินที่ ๑ / ๒๕๖๙ (๑ ต.ค. ๖๘ - ๓๑ มี.ค. ๖๙)', 'info');
        break;
      case 'round2_2569':
        setStartDate('2026-04-01');
        setEndDate('2026-09-30');
        onNotify?.('เลือกช่วงรอบประเมินที่ ๒ / ๒๕๖๙ (๑ เม.ย. ๖๙ - ๓๐ ก.ย. ๖๙)', 'info');
        break;
      case 'reset':
        setStartDate('');
        setEndDate('');
        onNotify?.('ล้างตัวกรองวันที่ แสดงคำสั่งทั้งหมด', 'info');
        break;
      default:
        break;
    }
  };

  // Base list of orders assigned to active faculty
  const assignedOrders = useMemo(() => {
    return orders.filter((order) => 
      order.facultyAssigned.some(f => f.id === activeFaculty.id)
    );
  }, [orders, activeFaculty.id]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: assignedOrders.length };
    assignedOrders.forEach((o) => {
      counts[o.category] = (counts[o.category] || 0) + 1;
    });
    return counts;
  }, [assignedOrders]);

  // Main filtered orders list
  const filteredOrders = useMemo(() => {
    return assignedOrders.filter((order) => {
      // Status filter
      if (filterStatus === 'upcoming' && order.status !== 'upcoming') return false;
      if (filterStatus === 'done' && order.status !== 'done') return false;
      if (filterStatus === 'missing_photo' && (order.actualPhotos?.length > 0)) return false;

      // Category filter
      if (selectedCategory !== 'all') {
        const matchesCategory = order.category === selectedCategory || 
          order.categoryCode === selectedCategory ||
          order.category.includes(selectedCategory);
        if (!matchesCategory) return false;
      }

      // Date range filter (using eventDate or signDate)
      const orderDate = order.eventDate || order.signDate;
      if (startDate && orderDate < startDate) return false;
      if (endDate && orderDate > endDate) return false;

      // Search term
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchNumber = order.orderNumber.toLowerCase().includes(q);
        const matchTitle = order.title.toLowerCase().includes(q);
        const matchCategory = order.category.toLowerCase().includes(q);
        const matchLocation = order.location?.toLowerCase().includes(q);
        return matchNumber || matchTitle || matchCategory || matchLocation;
      }

      return true;
    });
  }, [assignedOrders, filterStatus, selectedCategory, startDate, endDate, searchTerm]);

  // Calculate summary metrics for the currently filtered view
  const metrics = useMemo(() => {
    const total = filteredOrders.length;
    const completed = filteredOrders.filter(o => o.status === 'done').length;
    const withPhotos = filteredOrders.filter(o => o.actualPhotos && o.actualPhotos.length > 0).length;
    const photoCount = filteredOrders.reduce((sum, o) => sum + (o.actualPhotos?.length || 0), 0);
    const readyRate = total > 0 ? Math.round((withPhotos / total) * 100) : 0;
    return { total, completed, withPhotos, photoCount, readyRate };
  }, [filteredOrders]);

  const hasDateFilter = Boolean(startDate || endDate);
  const formattedRangeText = useMemo(() => {
    if (!startDate && !endDate) return 'คำสั่งทุกช่วงเวลา';
    if (startDate && endDate) return `${formatThaiDate(startDate)} ถึง ${formatThaiDate(endDate)}`;
    if (startDate) return `ตั้งแต่ ${formatThaiDate(startDate)} เป็นต้นไป`;
    return `จนถึง ${formatThaiDate(endDate)}`;
  }, [startDate, endDate]);

  const activeCategoryName = selectedCategory === 'all' 
    ? 'ทุกหมวดหมู่งาน' 
    : WORKLOAD_CATEGORIES.find(c => c.name === selectedCategory || c.id === selectedCategory)?.name || selectedCategory;

  return (
    <div className="space-y-6">
      {/* Modals */}
      <EvidenceUploadModal
        isOpen={Boolean(selectedOrderForEvidence)}
        onClose={() => setSelectedOrderForEvidence(null)}
        order={selectedOrderForEvidence}
        onSaveEvidence={onSaveEvidence}
      />

      <EvidenceLightboxModal
        photo={lightboxData?.photo}
        order={lightboxData?.order}
        onClose={() => setLightboxData(null)}
        onDeletePhoto={onDeleteEvidence}
        onNotify={onNotify}
      />

      <DossierSummaryModal
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        orders={filteredOrders}
        activeFaculty={activeFaculty}
        dateRangeText={formattedRangeText}
        activeCategoryName={activeCategoryName}
        onNotify={onNotify}
      />

      {/* Header & Controls Panel */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-1.5 border border-purple-100">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>โมดูลที่ ๒: Smart Dispatch & Personal Evidence Drawer</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>ตู้ลิ้นชักแฟ้มหลักฐานส่วนบุคคล:</span>
              <span className="text-blue-700">{activeFaculty.name}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              จำแนกคำสั่งตามหมวดหมู่ ก.พอ. กรองช่วงวันที่ประเมินอิสระ และแนบภาพถ่ายหน้างานพร้อมส่งต่อระบบ e-Portfolio
            </p>
          </div>

          {/* Quick Metrics & Dossier Action */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsDossierOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>พิมพ์ใบสรุปแฟ้มหลักฐาน (Dossier)</span>
            </button>
            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">คำสั่งที่พบ:</span>
                <span className="font-bold text-slate-800 font-mono">{metrics.total} ฉบับ</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">ภาพถ่ายแนบ:</span>
                <span className="font-bold text-emerald-600 font-mono">{metrics.photoCount} ภาพ</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Category Selector Bar --- */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-indigo-600" />
              <span>จำแนกตามหมวดหมู่งาน (Workload Category)</span>
            </span>
            <span className="text-[11px] text-slate-400">
              คลิกหมวดหมู่เพื่อกรองรายการ
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {WORKLOAD_CATEGORIES.map((cat) => {
              const count = cat.id === 'all' 
                ? categoryCounts.all 
                : (categoryCounts[cat.name] || 0);
              const isActive = selectedCategory === cat.id || selectedCategory === cat.name;

              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id === 'all' ? 'all' : cat.name)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white font-semibold shadow-xs shadow-blue-500/20'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* --- Custom Date Range Filter --- */}
        <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <CalendarRange className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800">
                  กำหนดช่วงวันที่แสดงผล (Custom Date Range Filter)
                </h4>
                <p className="text-[11px] text-slate-500">
                  เลือกวันเริ่มต้นและสิ้นสุดได้เองอย่างอิสระ หรือคลิกปุ่มลัดรอบการประเมิน
                </p>
              </div>
            </div>

            {hasDateFilter && (
              <button
                onClick={() => applyPresetDate('reset')}
                className="inline-flex items-center gap-1 text-[11px] text-rose-600 hover:text-rose-700 font-semibold bg-rose-50 hover:bg-rose-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ตช่วงวันที่</span>
              </button>
            )}
          </div>

          {/* Date pickers & Presets */}
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Pickers */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <span className="text-slate-400 text-[11px]">ตั้งแต่วันที่:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="text-xs text-slate-800 font-medium outline-hidden bg-transparent cursor-pointer"
                />
              </div>

              <span className="text-slate-400 font-semibold text-xs">ถึง</span>

              <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
                <span className="text-slate-400 text-[11px]">ถึงวันที่:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="text-xs text-slate-800 font-medium outline-hidden bg-transparent cursor-pointer"
                />
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Highlighted exact user requirement button */}
              <button
                onClick={() => applyPresetDate('user_test_2567')}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold transition-all border border-amber-300 shadow-2xs cursor-pointer"
                title="เลือกวันที่ 1 มกราคม 2567 ถึง 25 มิถุนายน 2567"
              >
                <Sparkles className="w-3 h-3 text-amber-700" />
                <span>ช่วงทดสอบ (1 ม.ค. 67 – 25 มิ.ย. 67)</span>
              </button>

              <button
                onClick={() => applyPresetDate('year_2567')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                ปี 2567
              </button>

              <button
                onClick={() => applyPresetDate('year_2568')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                ปี 2568
              </button>

              <button
                onClick={() => applyPresetDate('year_2569')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                ปี 2569
              </button>

              <button
                onClick={() => applyPresetDate('round2_2569')}
                className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200 transition-colors cursor-pointer"
              >
                รอบ 2/2569 (ปัจจุบัน)
              </button>
            </div>
          </div>

          {/* Active Range Notice Banner */}
          <div className="bg-white/80 border border-slate-200 rounded-xl px-3.5 py-2 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-slate-600 text-[11px]">
                กำลังแสดงผล: <strong className="text-slate-900">{formattedRangeText}</strong>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-blue-700 font-semibold text-[11px]">
                หมวด: {activeCategoryName}
              </span>
            </div>
            <span className="text-slate-500 text-[11px] font-mono">
              พบ {filteredOrders.length} รายการที่เข้าเงื่อนไข
            </span>
          </div>
        </div>

        {/* Search & Status Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาเลขคำสั่ง, ชื่อกิจกรรม, สถานที่..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              ทั้งหมด ({assignedOrders.length})
            </button>
            <button
              onClick={() => setFilterStatus('upcoming')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'upcoming'
                  ? 'bg-white text-amber-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              รอดำเนินการ
            </button>
            <button
              onClick={() => setFilterStatus('done')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'done'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              ปฏิบัติงานแล้ว
            </button>
            <button
              onClick={() => setFilterStatus('missing_photo')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                filterStatus === 'missing_photo'
                  ? 'bg-white text-rose-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 font-medium'
              }`}
            >
              ขาดรูปหลักฐาน
            </button>
          </div>
        </div>
      </div>

      {/* Orders Grid or Welcome Onboarding State */}
      {assignedOrders.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 rounded-3xl p-8 sm:p-12 text-center border border-blue-200 shadow-xs space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <Sparkles className="w-8 h-8" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              ยินดีต้อนรับอาจารย์ {activeFaculty.name} สู่ UniWorkload AI! 🎓
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ตู้ลิ้นชักแฟ้มงานส่วนบุคคลของท่านเปิดใช้งานเรียบร้อยแล้ว พร้อมระบบปฏิทิน iCal Feed และเชื่อมต่อระบบ AI OCR สกัดข้อมูลอัตโนมัติ
            </p>
          </div>

          <div className="max-w-lg mx-auto bg-white/90 rounded-2xl p-4 border border-blue-100 text-left space-y-2.5 text-xs text-slate-700 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ความพร้อมของบัญชีอาจารย์ท่านนี้:</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>iCal Feed ปฏิทิน:</strong> เชื่อมต่อกับ Apple Calendar / Google Calendar ได้ทันที</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>AI Entity Matcher:</strong> เมื่อฝ่ายธุรการสแกนคำสั่งแต่งตั้งที่มีชื่อท่าน คำสั่งจะวิ่งมาบรรจุที่ตู้นี้อัตโนมัติ</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>e-Portfolio Copilot:</strong> โนห์รัน AI พร้อมสรุปภาระงานและแปลงเป็นแบบประเมินทางการ มรภ.นครสวรรค์</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onAddSampleOrder && (
              <button
                onClick={onAddSampleOrder}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-semibold hover:from-sky-600 hover:to-blue-700 shadow-md shadow-sky-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>จำลองส่งคำสั่งราชการเข้าตู้ลิ้นชักนี้ทันที (1-Click)</span>
              </button>
            )}
            {onOpenAddFaculty && (
              <button
                onClick={onOpenAddFaculty}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>+ เพิ่มอาจารย์ท่านอื่น</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">
            ไม่พบคำสั่งราชการที่ตรงกับเงื่อนไข
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            ไม่พบข้อมูลในช่วงวันที่ <span className="font-semibold text-slate-700">{formattedRangeText}</span> หรือหมวดหมู่งานที่ระบุ ลองกดปุ่มรีเซ็ตหรือเปลี่ยนช่วงเวลา
          </p>
          <button
            onClick={() => {
              applyPresetDate('reset');
              setSelectedCategory('all');
              setFilterStatus('all');
              setSearchTerm('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>ล้างเงื่อนไขทั้งหมด</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredOrders.map((order) => {
            const myAssignment = order.facultyAssigned.find(f => f.id === activeFaculty.id);
            const isDone = order.status === 'done';
            const hasPhotos = order.actualPhotos && order.actualPhotos.length > 0;

            return (
              <div
                key={order.id}
                className={`bg-white rounded-3xl p-6 border transition-all duration-200 shadow-xs flex flex-col justify-between ${
                  isDone 
                    ? 'border-emerald-200/90 hover:border-emerald-300 bg-gradient-to-b from-white to-emerald-50/15' 
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                <div>
                  {/* Top Badge & Action */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] font-medium text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                        {order.category}
                      </span>
                    </div>

                    <button
                      onClick={() => onToggleStatus(order.id)}
                      className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                      }`}
                    >
                      <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
                      <span>{isDone ? 'ปฏิบัติงานแล้ว' : 'ทำเครื่องหมายว่าเสร็จ'}</span>
                    </button>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2.5">
                    {order.title}
                  </h3>

                  {/* Role in this order */}
                  {myAssignment && (
                    <div className="bg-sky-50/80 border border-sky-100 rounded-2xl p-3 mb-3 flex items-start gap-2.5">
                      <UserCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[11px] text-sky-950 font-semibold block">บทบาทตามคำสั่ง:</span>
                        <span className="text-xs text-slate-800 font-medium">{myAssignment.roleInOrder}</span>
                      </div>
                    </div>
                  )}

                  {/* Meta details */}
                  <div className="space-y-1.5 text-xs text-slate-600 mb-4 bg-slate-50/60 p-3 rounded-2xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>วันที่จัด: <strong>{formatThaiDate(order.eventDate)}</strong> ({order.eventTime || 'ตามกำหนดการ'})</span>
                    </div>
                    {order.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">สถานที่: {order.location}</span>
                      </div>
                    )}
                  </div>

                  {/* --- Evidence Attachments Section --- */}
                  <div className="border-t border-slate-100 pt-3.5 mb-3">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">
                          หลักฐานและภาพถ่าย ({order.evidenceFiles.length + (order.actualPhotos?.length || 0)} รายการ)
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForEvidence(order)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>แนบรูปเพิ่ม</span>
                      </button>
                    </div>

                    {/* Official PDF Document */}
                    <div className="space-y-2 mb-3">
                      {order.evidenceFiles.map((f) => (
                        <div
                          key={f.id}
                          className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200/80 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate font-medium">{f.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {f.size}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Photo Evidence Gallery (Thumbnails) */}
                    <div>
                      <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">
                        ภาพถ่ายการปฏิบัติงานจริง (คลิกเพื่อดูภาพขยาย):
                      </span>

                      {hasPhotos ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {order.actualPhotos.map((photo) => (
                            <div
                              key={photo.id}
                              onClick={() => setLightboxData({ photo, order })}
                              className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer aspect-video shadow-2xs hover:shadow-md transition-all hover:scale-[1.02]"
                            >
                              <img
                                src={photo.url}
                                alt={photo.name}
                                className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 justify-between">
                                <span className="text-[10px] text-white truncate max-w-[80%] font-medium">
                                  {photo.name}
                                </span>
                                <Maximize2 className="w-3 h-3 text-white shrink-0" />
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3 text-center">
                          <p className="text-xs text-amber-800 font-medium flex items-center justify-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>ยังไม่ได้แนบภาพถ่ายหน้างาน</span>
                          </p>
                          <p className="text-[11px] text-amber-600 mt-0.5">
                            กดปุ่ม "+ แนบรูปเพิ่ม" เพื่ออัปโหลดรูปภาพบันทึกการปฏิบัติหน้าที่
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer: e-Portfolio shortcut */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs mt-3">
                  <div className="flex items-center gap-1.5">
                    {hasPhotos ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        หลักฐานครบ (มีรูปหน้างาน)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                        รอภาพหลักฐาน
                      </span>
                    )}
                  </div>

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
      )}
    </div>
  );
}
