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
  AlertCircle,
  ChevronDown,
  ChevronUp,
  X,
  Tag,
  ExternalLink,
  UploadCloud
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
  facultyList = [],
  currentUser,
  onSelectFaculty,
  highlightOrderId,
  onToggleStatus, 
  onSaveEvidence, 
  onDeleteEvidence,
  onDeleteOrder,
  onClearDrawer,
  onRestoreDemoOrders,
  onJumpToIngestion,
  onJumpToEportfolio,
  onNotify,
  onAddSampleOrder,
  onOpenAddFaculty
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | upcoming | done | missing_photo
  const [selectedCategory, setSelectedCategory] = useState('all'); // all | category name
  const [viewAllFaculties, setViewAllFaculties] = useState(false);
  
  // Custom Date Range filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Expandable filter panels toggle (tidy collapsible design)
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);
  const [isDatePanelOpen, setIsDatePanelOpen] = useState(false);

  // Modals state
  const [selectedOrderForEvidence, setSelectedOrderForEvidence] = useState(null);
  const [lightboxData, setLightboxData] = useState(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);

  // Quick Preset Handlers
  const applyPresetDate = (preset) => {
    switch (preset) {
      case 'user_test_2567':
        setStartDate('2024-01-01');
        setEndDate('2024-06-25');
        onNotify?.('เลือกช่วงวันที่: 1 มกราคม 2567 – 25 มิถุนายน 2567', 'info');
        break;
      case 'year_2567':
        setStartDate('2024-01-01');
        setEndDate('2024-12-31');
        onNotify?.('เลือกช่วงวันที่: ตลอดปี พ.ศ. 2567', 'info');
        break;
      case 'year_2568':
        setStartDate('2025-01-01');
        setEndDate('2025-12-31');
        onNotify?.('เลือกช่วงวันที่: ตลอดปี พ.ศ. 2568', 'info');
        break;
      case 'year_2569':
        setStartDate('2026-01-01');
        setEndDate('2026-12-31');
        onNotify?.('เลือกช่วงวันที่: ตลอดปี พ.ศ. 2569 (ปัจจุบัน)', 'info');
        break;
      case 'round2_2569':
        setStartDate('2026-04-01');
        setEndDate('2026-09-30');
        onNotify?.('เลือกช่วงรอบประเมินที่ 2 / 2569 (1 เม.ย. 69 - 30 ก.ย. 69)', 'info');
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

  // Base list of orders assigned to active faculty or all faculties
  const assignedOrders = useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    if (viewAllFaculties) return orders;
    return orders.filter((order) => 
      (order.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || order.facultyId === activeFaculty?.id
    );
  }, [orders, activeFaculty?.id, viewAllFaculties]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts = { all: assignedOrders.length };
    assignedOrders.forEach((o) => {
      const cat = o.category || 'อื่นๆ';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [assignedOrders]);

  // Main filtered orders list
  const filteredOrders = useMemo(() => {
    return assignedOrders.filter((order) => {
      if (filterStatus === 'upcoming' && order.status !== 'upcoming') return false;
      if (filterStatus === 'done' && order.status !== 'done') return false;
      if (filterStatus === 'missing_photo' && ((order.actualPhotos || []).length > 0)) return false;

      if (selectedCategory !== 'all') {
        const cat = order.category || '';
        const matchesCategory = cat === selectedCategory || 
          order.categoryCode === selectedCategory ||
          cat.includes(selectedCategory);
        if (!matchesCategory) return false;
      }

      const orderDate = order.eventDate || order.signDate;
      if (startDate && orderDate && orderDate < startDate) return false;
      if (endDate && orderDate && orderDate > endDate) return false;

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchNumber = (order.orderNumber || '').toLowerCase().includes(q);
        const matchTitle = (order.title || '').toLowerCase().includes(q);
        const matchCategory = (order.category || '').toLowerCase().includes(q);
        const matchLocation = (order.location || '').toLowerCase().includes(q);
        return matchNumber || matchTitle || matchCategory || matchLocation;
      }

      return true;
    });
  }, [assignedOrders, filterStatus, selectedCategory, startDate, endDate, searchTerm]);

  // Summary metrics
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

  // Handle highlightOrderId from URL deep-link or calendar jump
  React.useEffect(() => {
    if (highlightOrderId) {
      const targetInFaculty = assignedOrders.some(o => o.id === highlightOrderId);
      if (targetInFaculty) {
        const isVisible = filteredOrders.some(o => o.id === highlightOrderId);
        if (!isVisible) {
          setFilterStatus('all');
          setSelectedCategory('all');
          setStartDate('');
          setEndDate('');
          setSearchTerm('');
        }
      }

      const timer = setTimeout(() => {
        const el = document.getElementById(`order-card-${highlightOrderId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [highlightOrderId, assignedOrders, filteredOrders]);

  return (
    <div className="space-y-5">
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

      {/* Header Panel */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold mb-1.5 border border-purple-100">
              <Layers className="w-3.5 h-3.5 text-purple-600" />
              <span>โมดูลที่ 2: Smart Dispatch & Personal Evidence Drawer</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight flex flex-wrap items-center gap-2">
              <span>ตู้ลิ้นชักแฟ้มหลักฐานส่วนบุคคล:</span>
              <span className="text-blue-700">{viewAllFaculties ? 'รวมทุกอาจารย์ในระบบ' : (activeFaculty?.name || 'อาจารย์')}</span>
            </h2>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              {/* View Scope Segmented Pill */}
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-xs">
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
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {onClearDrawer && assignedOrders.length > 0 && (
              <button
                onClick={() => setIsClearModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                title="ล้างคำสั่งทั้งหมดออกจากตู้ลิ้นชักนี้"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                <span className="hidden sm:inline">ล้างตู้ลิ้นชัก</span>
              </button>
            )}

            <button
              onClick={() => setIsDossierOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-sky-400" />
              <span>พิมพ์ใบสรุปแฟ้ม (Dossier)</span>
            </button>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 flex items-center gap-3 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] block">คำสั่ง:</span>
                <span className="font-bold text-slate-800 font-mono">{metrics.total} ฉบับ</span>
              </div>
              <div className="w-px h-6 bg-slate-200"></div>
              <div>
                <span className="text-slate-400 text-[10px] block">ภาพถ่าย:</span>
                <span className="font-bold text-emerald-600 font-mono">{metrics.photoCount} ภาพ</span>
              </div>
            </div>
          </div>
        </div>

        {/* --- Unified Filter Toolbar --- */}
        <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาเลขคำสั่ง, ชื่อกิจกรรม, สถานที่..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Status Tabs & Filter Toggles */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Segmented Control */}
              <div className="inline-flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  onClick={() => setFilterStatus('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    filterStatus === 'all'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ทั้งหมด ({assignedOrders.length})
                </button>
                <button
                  onClick={() => setFilterStatus('upcoming')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    filterStatus === 'upcoming'
                      ? 'bg-white text-amber-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  รอดำเนินการ
                </button>
                <button
                  onClick={() => setFilterStatus('done')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    filterStatus === 'done'
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  เสร็จสิ้น
                </button>
                <button
                  onClick={() => setFilterStatus('missing_photo')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                    filterStatus === 'missing_photo'
                      ? 'bg-white text-rose-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚠️ ขาดรูป
                </button>
              </div>

              {/* Toggle Category Drawer */}
              <button
                onClick={() => setIsCategoryPanelOpen(!isCategoryPanelOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isCategoryPanelOpen || selectedCategory !== 'all'
                    ? 'bg-blue-50 text-blue-700 border-blue-200 shadow-2xs font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <Tag className="w-3.5 h-3.5" />
                <span>หมวดหมู่งาน</span>
                {selectedCategory !== 'all' && (
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                )}
                {isCategoryPanelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Toggle Date Range Drawer */}
              <button
                onClick={() => setIsDatePanelOpen(!isDatePanelOpen)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors cursor-pointer ${
                  isDatePanelOpen || hasDateFilter
                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-2xs font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <CalendarRange className="w-3.5 h-3.5" />
                <span>ช่วงวันที่</span>
                {hasDateFilter && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                )}
                {isDatePanelOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>

              {/* Clear Drawer Action */}
              {assignedOrders.length > 0 && onClearDrawer && (
                <button
                  onClick={() => setIsClearModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors cursor-pointer"
                  title="ล้างข้อมูลคำสั่งทั้งหมดออกจากตู้ลิ้นชักนี้"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>ล้างตู้ลิ้นชัก</span>
                </button>
              )}
            </div>
          </div>

          {/* Expandable Category Bar */}
          {isCategoryPanelOpen && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150 space-y-2">
              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">เลือกจำแนกตามเกณฑ์ ก.พอ. 1–6:</span>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-blue-600 hover:underline cursor-pointer"
                  >
                    ดูทุกหมวด
                  </button>
                )}
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
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        isActive
                          ? 'bg-blue-600 text-white font-semibold shadow-xs'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Expandable Date Range Panel */}
          {isDatePanelOpen && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 animate-in fade-in duration-150 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
                  <span>กำหนดช่วงวันที่เริ่มต้น - สิ้นสุด</span>
                </span>
                {hasDateFilter && (
                  <button
                    onClick={() => applyPresetDate('reset')}
                    className="text-[11px] text-rose-600 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>รีเซ็ตวันที่</span>
                  </button>
                )}
              </div>

              <div className="flex flex-col lg:flex-row lg:items-center gap-3">
                {/* Pickers */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                    <span className="text-slate-400 text-[11px]">ตั้งแต่:</span>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="text-xs text-slate-800 font-medium outline-hidden bg-transparent cursor-pointer"
                    />
                  </div>
                  <span className="text-slate-400 text-xs">ถึง</span>
                  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 shadow-2xs">
                    <span className="text-slate-400 text-[11px]">ถึงวันที่:</span>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="text-xs text-slate-800 font-medium outline-hidden bg-transparent cursor-pointer"
                    />
                  </div>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <button
                    onClick={() => applyPresetDate('user_test_2567')}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 text-[11px] font-bold border border-amber-300 transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3 text-amber-700" />
                    <span>1 ม.ค. 67 – 25 มิ.ย. 67</span>
                  </button>
                  <button
                    onClick={() => applyPresetDate('year_2567')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors cursor-pointer"
                  >
                    ปี 2567
                  </button>
                  <button
                    onClick={() => applyPresetDate('year_2568')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors cursor-pointer"
                  >
                    ปี 2568
                  </button>
                  <button
                    onClick={() => applyPresetDate('year_2569')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors cursor-pointer"
                  >
                    ปี 2569
                  </button>
                  <button
                    onClick={() => applyPresetDate('round2_2569')}
                    className="px-2 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-[11px] border border-slate-200 transition-colors cursor-pointer"
                  >
                    รอบ 2/2569
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Active Filter Indicators Bar */}
          {(hasDateFilter || selectedCategory !== 'all' || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-400 font-medium">ตัวกรองที่ใช้งานอยู่:</span>
              
              {hasDateFilter && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[11px] font-medium">
                  <span>ช่วง: {formattedRangeText}</span>
                  <button 
                    onClick={() => applyPresetDate('reset')}
                    className="hover:text-indigo-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-medium">
                  <span>หมวด: {activeCategoryName}</span>
                  <button 
                    onClick={() => setSelectedCategory('all')}
                    className="hover:text-blue-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-medium">
                  <span>ค้นหา: "{searchTerm}"</span>
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="hover:text-slate-900 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={() => {
                  applyPresetDate('reset');
                  setSelectedCategory('all');
                  setSearchTerm('');
                  setFilterStatus('all');
                }}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer ml-1"
              >
                ล้างทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Orders Grid or Welcome Onboarding State */}
      {assignedOrders.length === 0 ? (
        <div className="bg-gradient-to-br from-blue-50/70 via-white to-sky-50/50 rounded-2xl p-8 sm:p-12 text-center border border-blue-200 shadow-xs space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center mx-auto shadow-md shadow-sky-500/20">
            <Sparkles className="w-7 h-7" />
          </div>
          <div className="max-w-xl mx-auto space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-800">
              ตู้ลิ้นชักแฟ้มงานของอาจารย์ {activeFaculty?.name || 'อาจารย์'} ว่างเปล่าพร้อมใช้งาน! 🗄️
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              ไม่มีคำสั่งคงค้างในลิ้นชัก ท่านสามารถเริ่มนำเข้าคำสั่งใหม่ สแกนเอกสารจริง หรือแคปรูปภาพโพสต์จาก Facebook เพื่อให้ AI สกัดข้อมูลและจัดเก็บได้ทันที
            </p>
          </div>

          {/* Smart Cloud Orders Alert (When orders exist in other faculties) */}
          {orders && orders.length > 0 && !viewAllFaculties && (
            <div className="max-w-lg mx-auto p-4 rounded-2xl bg-amber-50/95 border border-amber-200 text-amber-900 text-xs text-left space-y-3 shadow-xs animate-in fade-in">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-950 text-xs sm:text-sm">
                    ตรวจพบข้อมูลคำสั่งปฏิบัติงาน {orders.length} ฉบับในระบบคลาวด์!
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                    ข้อมูลไม่ได้สูญหาย แต่ถูกบันทึกไว้ในตู้ลิ้นชักของอาจารย์ท่านอื่น ท่านสามารถกดดูรวมทุกคน หรือคลิกสลับไปดูตู้ของอาจารย์ที่มีคำสั่งได้ทันที
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-amber-200/80">
                <button
                  type="button"
                  onClick={() => setViewAllFaculties(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  🌐 ดูคำสั่งรวมทุกคน ({orders.length} ฉบับ)
                </button>
                {facultyList && facultyList.map(f => {
                  const count = (orders || []).filter(o => (o.facultyAssigned || []).some(fa => fa.id === f.id) || o.facultyId === f.id).length;
                  if (count === 0 || f.id === activeFaculty?.id) return null;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => onSelectFaculty && onSelectFaculty(f)}
                      className="px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 text-amber-900 hover:bg-amber-100 font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
                    >
                      📂 สลับไปดูตู้ {f.name?.split(' ')?.[0] || f.name} ({count})
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="max-w-lg mx-auto bg-white/90 rounded-xl p-4 border border-blue-100 text-left space-y-2.5 text-xs text-slate-700 shadow-2xs">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>ช่องทางนำเข้าข้อมูลสู่ตู้ลิ้นชัก:</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
              <span><strong>นำเข้าจาก Facebook & โซเชียล:</strong> แคปรูปโพสต์ Facebook แล้วกด Ctrl+V วาง หรือแปะลิงก์ AI จะสกัดข้อมูลให้อัตโนมัติ</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
              <span><strong>สแกน PDF / คำสั่งราชการ:</strong> ระบบ Gemini Dual-Engine OCR รองรับไฟล์ดิจิทัลและเอกสารสแกนจริง</span>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 shrink-0"></span>
              <span><strong>iCal Feed ปฏิทิน:</strong> ซิงค์ 2 ทางเข้า Google Calendar และ Apple Calendar</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {onJumpToIngestion && (
              <button
                onClick={onJumpToIngestion}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
              >
                <UploadCloud className="w-4 h-4" />
                <span>+ นำเข้าคำสั่ง / แคป Facebook ทันที</span>
              </button>
            )}
            {onAddSampleOrder && (
              <button
                onClick={onAddSampleOrder}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4 text-blue-600" />
                <span>จำลองส่งคำสั่ง 1 รายการ</span>
              </button>
            )}
            {onRestoreDemoOrders && (
              <button
                onClick={onRestoreDemoOrders}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
                title="โหลดชุดข้อมูลตัวอย่างคำสั่ง 42 รายการเพื่อการนำเสนอหรือสาธิตระบบ"
              >
                <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                <span>กู้คืนข้อมูลจำลองสาธิต (42 ฉบับ)</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-xs space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredOrders.map((order) => {
            const myAssignment = (order.facultyAssigned || []).find(f => f.id === activeFaculty?.id);
            const isDone = order.status === 'done';
            const hasPhotos = order.actualPhotos && order.actualPhotos.length > 0;
            const isHighlighted = highlightOrderId === order.id;

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className={`bg-white rounded-2xl p-5 border transition-all duration-300 shadow-xs flex flex-col justify-between ${
                  isHighlighted
                    ? 'ring-2 ring-blue-500 border-blue-500 bg-gradient-to-b from-blue-50/50 via-white to-white shadow-lg shadow-blue-500/15'
                    : isDone 
                    ? 'border-emerald-200/90 hover:border-emerald-300 bg-gradient-to-b from-white to-emerald-50/10' 
                    : 'border-slate-200/90 hover:border-blue-300'
                }`}
              >
                <div>
                  {isHighlighted && (
                    <div className="mb-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold flex items-center justify-between shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>เปิดจาก Google Calendar (ไฮไลต์คำสั่งนี้)</span>
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-md text-white font-mono">
                        Direct Deep-Link
                      </span>
                    </div>
                  )}

                  {/* Top Badge & Action */}
                  <div className="flex items-start justify-between gap-2 mb-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                        {order.orderNumber}
                      </span>
                      <span className="text-[10px] font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                        {order.category}
                      </span>
                      {viewAllFaculties && (
                        <span className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 flex items-center gap-1">
                          <User className="w-3 h-3 text-purple-600" />
                          <span>{order.facultyAssigned?.[0]?.name || 'อาจารย์'}</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onToggleStatus(order.id)}
                        className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200'
                        }`}
                      >
                        <CheckCircle2 className={`w-3.5 h-3.5 ${isDone ? 'text-emerald-600 fill-emerald-100' : 'text-slate-400'}`} />
                        <span>{isDone ? 'เสร็จสิ้น' : 'ทำเครื่องหมายว่าเสร็จ'}</span>
                      </button>

                      {onDeleteOrder && (
                        <button
                          onClick={() => setOrderToDelete(order)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                          title="ลบคำสั่งนี้ออกจากตู้ลิ้นชัก"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2">
                    {order.title}
                  </h3>

                  {/* Facebook / Social Reference Link Badge */}
                  {order.facebookUrl && (
                    <div className="mb-2.5">
                      <a
                        href={order.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[11px] font-semibold transition-colors"
                      >
                        <svg className="w-3.5 h-3.5 fill-blue-600 shrink-0" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                        <span>เปิดดูโพสต์ Facebook ต้นทาง</span>
                        <ExternalLink className="w-3 h-3 text-blue-500" />
                      </a>
                    </div>
                  )}

                  {/* Role in this order */}
                  {myAssignment && (
                    <div className="bg-sky-50/70 border border-sky-100 rounded-xl p-2.5 mb-2.5 flex items-start gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-sky-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] text-sky-950 font-semibold block">บทบาทหน้าที่:</span>
                        <span className="text-xs text-slate-800 font-medium">{myAssignment.roleInOrder}</span>
                      </div>
                    </div>
                  )}

                  {/* Meta details */}
                  <div className="space-y-1 text-xs text-slate-600 mb-3 bg-slate-50/60 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>วันที่จัด: <strong>{formatThaiDate(order.eventDate)}</strong> ({order.eventTime || 'ตามกำหนดการ'})</span>
                    </div>
                    {order.location && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">สถานที่: {order.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Evidence Attachments Section */}
                  <div className="border-t border-slate-100 pt-3 mb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-blue-600" />
                        <span className="text-xs font-bold text-slate-800">
                          หลักฐานและภาพถ่าย ({((order.evidenceFiles || []).length) + ((order.actualPhotos || []).length)})
                        </span>
                      </div>

                      <button
                        onClick={() => setSelectedOrderForEvidence(order)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>แนบรูปเพิ่ม</span>
                      </button>
                    </div>

                    {/* Official PDF Document */}
                    <div className="space-y-1.5 mb-2.5">
                      {(order.evidenceFiles || []).map((f, fIdx) => (
                        <div
                          key={f.id || `f-${fIdx}`}
                          className="flex items-center justify-between bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-lg border border-slate-200/80 transition-colors text-xs"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <FileText className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span className="truncate font-medium">{f.name || 'เอกสารคำสั่ง.pdf'}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono shrink-0 ml-2">
                            {f.size || '1.5 MB'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Photo Evidence Gallery */}
                    <div>
                      {hasPhotos ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {(order.actualPhotos || []).map((photo, pIdx) => {
                            const photoObj = typeof photo === 'string' 
                              ? { id: `photo-${pIdx}`, url: photo, name: `ภาพถ่ายปฏิบัติงาน_${pIdx + 1}.jpg` }
                              : photo;

                            return (
                              <div
                                key={photoObj.id || `p-${pIdx}`}
                                onClick={() => setLightboxData({ photo: photoObj, order })}
                                className="group relative rounded-lg overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer aspect-video shadow-2xs hover:shadow-md transition-all hover:scale-[1.02]"
                              >
                                <img
                                  src={photoObj.url}
                                  alt={photoObj.name || 'ภาพหลักฐาน'}
                                  className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-1.5 justify-between">
                                  <span className="text-[9px] text-white truncate max-w-[80%] font-medium">
                                    {photoObj.name || 'ภาพหลักฐาน'}
                                  </span>
                                  <Maximize2 className="w-3 h-3 text-white shrink-0" />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-2.5 text-center">
                          <p className="text-xs text-amber-800 font-medium flex items-center justify-center gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span>ยังไม่ได้แนบภาพถ่ายหน้างาน</span>
                          </p>
                          <p className="text-[10px] text-amber-600 mt-0.5">
                            กดปุ่ม "+ แนบรูปเพิ่ม" เพื่อบันทึกรูปภาพการปฏิบัติหน้าที่
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs mt-2">
                  <div className="flex items-center gap-1.5">
                    {hasPhotos ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        หลักฐานครบ
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

      {/* --- Modal: Confirm Clear Drawer --- */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                ยืนยันการล้างข้อมูลตู้ลิ้นชัก 🗄️
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                กรุณาเลือกรูปแบบการล้างข้อมูลคำสั่งราชการเพื่อเคลียร์พื้นที่ตู้ลิ้นชัก:
              </p>
            </div>

            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  onClearDrawer?.(activeFaculty?.id, false);
                  setIsClearModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>ล้างเฉพาะตู้ลิ้นชักของ {activeFaculty?.name} ({assignedOrders.length} ฉบับ)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClearDrawer?.(null, true);
                  setIsClearModalOpen(false);
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-4 h-4 text-amber-400" />
                <span>ลบคำสั่งทั้งหมดในระบบ (ทุกอาจารย์ รวม {orders.length} ฉบับ)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsClearModalOpen(false)}
                className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal: Confirm Delete Single Order --- */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                ยืนยันการลบคำสั่งราชการ 🗑️
              </h3>
              <p className="text-xs text-slate-600">
                คุณต้องการลบคำสั่งนี้ออกจากตู้ลิ้นชักและปฏิทินหรือไม่?
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-left mt-2">
                <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                  {orderToDelete.orderNumber}
                </span>
                <p className="text-xs font-semibold text-slate-800 mt-1 line-clamp-2">
                  {orderToDelete.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOrder?.(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                ยืนยันการลบ
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
