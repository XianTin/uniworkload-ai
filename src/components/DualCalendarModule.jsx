import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Smartphone, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  List, 
  Grid3X3,
  CalendarDays,
  Sparkles,
  ExternalLink,
  Camera,
  Plus,
  Trash2,
  Maximize2,
  Search,
  Filter,
  AlertCircle,
  RotateCcw,
  FolderOpen,
  ArrowUpRight,
  Share2,
  Tag,
  Award
} from 'lucide-react';
import EvidenceUploadModal from './EvidenceUploadModal';
import EvidenceLightboxModal from './EvidenceLightboxModal';
import { FALLBACK_EVIDENCE_IMAGE } from '../utils/imageUtils';
import { createGoogleCalendarUrl, getDirectDrawerUrl } from '../utils/icalGenerator';
import { canViewAllFaculties } from '../utils/auth';
import { getOrderScore, getOrderWorkloadType, formatScore } from '../utils/workloadScoring';

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export default function DualCalendarModule({ 
  orders = [], 
  activeFaculty, 
  facultyList = [],
  currentUser,
  onSelectFaculty,
  onToggleStatus, 
  onSaveEvidence,
  onDeleteEvidence,
  onOpenIcal, 
  onJumpToEportfolio,
  onJumpToDrawer,
  onNotify
}) {
  const allowViewAll = canViewAllFaculties(currentUser);
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // all | upcoming | done
  const [viewAllFaculties, setViewAllFaculties] = useState(false);

  // Filter orders relevant to active faculty or all faculties
  const facultyOrders = useMemo(() => {
    if (allowViewAll && viewAllFaculties) return orders || [];
    return (orders || []).filter(o => 
      (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id
    );
  }, [orders, activeFaculty?.id, viewAllFaculties, allowViewAll]);

  // Find initial month: if faculty has orders, find the closest order date or default to Sep 2026 / current date
  const [currentDate, setCurrentDate] = useState(() => {
    const firstOrderWithDate = facultyOrders.find(o => o.eventDate);
    if (firstOrderWithDate?.eventDate) {
      const [y, m] = firstOrderWithDate.eventDate.split('-');
      if (y && m) return new Date(parseInt(y, 10), parseInt(m, 10) - 1, 1);
    }
    return new Date(2026, 8, 1); // Default September 2026
  });

  const [selectedOrderId, setSelectedOrderId] = useState(() => {
    return facultyOrders[0]?.id || (orders && orders[0]?.id) || null;
  });

  // Modals for direct evidence attachment and preview
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [lightboxData, setLightboxData] = useState(null);

  // Sync selected order id when faculty orders change
  useEffect(() => {
    if (!facultyOrders.some(o => o.id === selectedOrderId)) {
      setSelectedOrderId(facultyOrders[0]?.id || (orders && orders[0]?.id) || null);
    }
  }, [activeFaculty?.id, facultyOrders, selectedOrderId, orders]);

  // The active selected order object (always fresh from orders prop)
  const selectedOrder = useMemo(() => {
    if (!selectedOrderId) return facultyOrders[0] || (orders && orders[0]) || null;
    return orders?.find(o => o.id === selectedOrderId) || facultyOrders[0] || null;
  }, [selectedOrderId, orders, facultyOrders]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar math for current month
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-11
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const startDayOffset = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun, 1 = Mon ...
  const thaiMonthName = THAI_MONTHS[currentMonth];
  const thaiYear = currentYear + 543;

  // Filter faculty orders by search & category
  const filteredFacultyOrders = useMemo(() => {
    return facultyOrders.filter(order => {
      if (statusFilter === 'upcoming' && order.status !== 'upcoming') return false;
      if (statusFilter === 'done' && order.status !== 'done') return false;

      if (selectedCategoryFilter !== 'all') {
        const cat = order.category || '';
        if (cat !== selectedCategoryFilter && !cat.includes(selectedCategoryFilter)) {
          return false;
        }
      }

      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const matchTitle = (order.title || '').toLowerCase().includes(q);
        const matchNum = (order.orderNumber || '').toLowerCase().includes(q);
        const matchLoc = (order.location || '').toLowerCase().includes(q);
        return matchTitle || matchNum || matchLoc;
      }

      return true;
    });
  }, [facultyOrders, statusFilter, selectedCategoryFilter, searchTerm]);

  // Events on a given calendar day (supports multi-day date range)
  const getEventsForDay = (day) => {
    const mStr = String(currentMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    const targetDateStr = `${currentYear}-${mStr}-${dStr}`;
    return filteredFacultyOrders.filter(o => {
      if (!o.eventDate) return false;
      const start = o.eventDate;
      const end = o.eventEndDate || o.eventDate;
      return targetDateStr >= start && targetDateStr <= end;
    });
  };

  // Google Calendar 1-Click Sync
  const handleOpenGoogleCalendar = (order) => {
    if (!order) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://uniworkload-ai.vercel.app';
    const gcalUrl = createGoogleCalendarUrl(order, activeFaculty?.id, origin);
    window.open(gcalUrl, '_blank', 'noopener,noreferrer');
    onNotify?.(`เปิด Google Calendar เพื่อซิงค์คำสั่ง [${order.orderNumber}] แล้ว! 🎯`, 'success');
  };

  // Jump to Personal Drawer
  const handleJumpToDrawer = (order) => {
    if (onJumpToDrawer) {
      onJumpToDrawer(order.id);
    } else {
      onNotify?.(`เปิดคำสั่ง [${order.orderNumber}] ในตู้ลิ้นชักงาน`, 'info');
    }
  };

  // Category badge colors helper
  const getCategoryColor = (cat = '') => {
    if (cat.includes('วิชาการ') || cat.includes('บริการ')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (cat.includes('ประกันคุณภาพ')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (cat.includes('การเรียน') || cat.includes('สอน')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (cat.includes('บริหาร') || cat.includes('กรรมการ')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  const photoCount = (selectedOrder?.actualPhotos || []).length;
  const hasPhotos = photoCount > 0;

  return (
    <div className="space-y-6">
      {/* Modals for Direct Evidence Attachment & Lightbox from Calendar */}
      <EvidenceUploadModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        order={selectedOrder}
        onSaveEvidence={(orderId, newEvidence) => {
          onSaveEvidence?.(orderId, newEvidence);
          setIsEvidenceModalOpen(false);
        }}
      />

      <EvidenceLightboxModal
        photo={lightboxData?.photo}
        order={lightboxData?.order}
        onClose={() => setLightboxData(null)}
        onDeletePhoto={onDeleteEvidence}
        onNotify={onNotify}
      />

      {/* Top Header & Dual Calendar Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>โมดูลที่ 3: Smart Dual Calendar (Web & Google/Apple Sync)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              ปฏิทินภาระงานและตารางคำสั่งราชการ
            </h2>
            <p className="text-xs text-slate-500">
              ติดตามวาระงาน แนบภาพหลักฐานหน้างานได้ทันที พร้อมระบบ Google Calendar 1-Click Sync ที่มีลิงก์ตรงสู่ลิ้นชักงาน
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={onOpenIcal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-600 hover:from-blue-700 hover:to-sky-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              title="ซิงค์ปฏิทินเข้า Google Calendar / มือถือ (Auto-Sync 1-Click)"
            >
              <CalendarIcon className="w-4 h-4 text-sky-200" />
              <span>ซิงค์ Google Calendar (1-Click)</span>
            </button>

            {/* Faculty Scope Switcher (Only for Admin & Staff) */}
            {allowViewAll && (
              <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setViewAllFaculties(false)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    !viewAllFaculties ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>เฉพาะ {activeFaculty?.name?.split(' ')?.[0] || 'อาจารย์'} ({(orders || []).filter(o => (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id).length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewAllFaculties(true)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                    viewAllFaculties ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>รวมทุกคน ({orders?.length || 0})</span>
                </button>
              </div>
            )}

            {/* View switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองปฏิทินรายเดือน"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span>รายเดือน</span>
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  viewMode === 'agenda' ? 'bg-white text-blue-700 shadow-xs font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองวาระงาน (Agenda List)"
              >
                <List className="w-3.5 h-3.5" />
                <span>วาระงาน ({filteredFacultyOrders.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigation & Filters Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-3 border-t border-slate-100">
          {/* Month Stepper */}
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800 font-sans">
              {thaiMonthName} {thaiYear} ({new Date(currentYear, currentMonth).toLocaleString('en-US', { month: 'long', year: 'numeric' })})
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button 
                onClick={handlePrevMonth}
                className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors cursor-pointer"
                title="เดือนก่อนหน้า"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button 
                onClick={handleGoToToday}
                className="px-2 py-0.5 text-[11px] font-semibold text-blue-700 hover:bg-white rounded-md transition-colors cursor-pointer"
                title="ไปเดือนปัจจุบัน"
              >
                ปัจจุบัน
              </button>
              <button 
                onClick={handleNextMonth}
                className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors cursor-pointer"
                title="เดือนถัดไป"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหากิจกรรมในปฏิทิน..."
                className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-52"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-slate-400 hover:text-slate-600 text-xs absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  ×
                </button>
              )}
            </div>

            {/* Quick Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 outline-none cursor-pointer"
            >
              <option value="all">สถานะ: ทั้งหมด</option>
              <option value="upcoming">⏳ รอดำเนินการ</option>
              <option value="done">✓ ปฏิบัติงานแล้ว</option>
            </select>
          </div>
        </div>

        {/* Category Legend */}
        <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1">
          <span className="font-semibold text-slate-700">หมวดหมู่:</span>
          <button 
            onClick={() => setSelectedCategoryFilter('all')}
            className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              selectedCategoryFilter === 'all' ? 'bg-slate-800 text-white font-semibold' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            ทั้งหมด
          </button>
          <button 
            onClick={() => setSelectedCategoryFilter('วิชาการ')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              selectedCategoryFilter === 'วิชาการ' ? 'bg-emerald-600 text-white font-semibold' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>บริการวิชาการ</span>
          </button>
          <button 
            onClick={() => setSelectedCategoryFilter('ประกันคุณภาพ')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              selectedCategoryFilter === 'ประกันคุณภาพ' ? 'bg-blue-600 text-white font-semibold' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            <span>ประกันคุณภาพ</span>
          </button>
          <button 
            onClick={() => setSelectedCategoryFilter('การเรียนการสอน')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              selectedCategoryFilter === 'การเรียนการสอน' ? 'bg-amber-600 text-white font-semibold' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>การสอน/สหกิจ</span>
          </button>
          <button 
            onClick={() => setSelectedCategoryFilter('บริหาร')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
              selectedCategoryFilter === 'บริหาร' ? 'bg-purple-600 text-white font-semibold' : 'bg-purple-50 text-purple-800 hover:bg-purple-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>บริหาร/กรรมการ</span>
          </button>
        </div>
      </div>

      {/* Main Calendar Section & Details Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Calendar View (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
          {viewMode === 'month' ? (
            <div>
              {/* Day names header */}
              <div className="grid grid-cols-7 gap-1 text-center font-semibold text-slate-400 text-xs py-2 border-b border-slate-100">
                <span className="text-rose-500">อา.</span>
                <span>จ.</span>
                <span>อ.</span>
                <span>พ.</span>
                <span>พฤ.</span>
                <span>ศ.</span>
                <span className="text-blue-500">ส.</span>
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-1.5 mt-2">
                {/* Empty cells for offset */}
                {Array.from({ length: startDayOffset }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="h-24 p-1 rounded-xl bg-slate-50/40 border border-transparent"></div>
                ))}

                {/* Days of month */}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const events = getEventsForDay(day);
                  const todayObj = new Date();
                  const isToday = currentYear === todayObj.getFullYear() && currentMonth === todayObj.getMonth() && day === todayObj.getDate();
                  const hasSelectedEvent = events.some(e => e.id === selectedOrderId);

                  return (
                    <div
                      key={day}
                      onClick={() => {
                        if (events.length > 0) {
                          setSelectedOrderId(events[0].id);
                        }
                      }}
                      className={`min-h-24 p-1.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                        hasSelectedEvent
                          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/30 shadow-xs'
                          : isToday
                          ? 'border-blue-400 ring-1 ring-blue-400/20 bg-blue-50/10'
                          : events.length > 0
                          ? 'border-slate-200 hover:border-blue-300 bg-white hover:shadow-xs'
                          : 'border-slate-100 bg-white/60 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-medium ${
                          isToday 
                            ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px]' 
                            : 'text-slate-700'
                        }`}>
                          {day}
                        </span>
                        {events.length > 0 && (
                          <span className="inline-flex items-center gap-1">
                            {events.some(e => (e.actualPhotos || []).length > 0) && (
                              <Camera className="w-3 h-3 text-emerald-600" title="มีภาพถ่ายหลักฐานแล้ว" />
                            )}
                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          </span>
                        )}
                      </div>

                      {/* Event chips */}
                      <div className="space-y-1 overflow-hidden my-1">
                        {events.slice(0, 2).map((ev) => {
                          const isDone = ev.status === 'done';
                          const hasPhoto = (ev.actualPhotos || []).length > 0;
                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrderId(ev.id);
                              }}
                              className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-md truncate font-medium flex items-center justify-between gap-1 ${
                                ev.id === selectedOrderId
                                  ? 'bg-blue-600 text-white font-bold'
                                  : isDone
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-sky-50 text-sky-900 border border-sky-200'
                              }`}
                              title={ev.title}
                            >
                              <span className="truncate">{ev.title}</span>
                              {hasPhoto && (
                                <span className={`text-[8px] font-mono px-1 rounded ${ev.id === selectedOrderId ? 'bg-white/30 text-white' : 'bg-emerald-200 text-emerald-900'}`}>
                                  📷
                                </span>
                              )}
                            </div>
                          );
                        })}
                        {events.length > 2 && (
                          <div className="text-[9px] text-slate-400 font-mono text-center">
                            +{events.length - 2} กิจกรรม
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div className="space-y-3">
              {filteredFacultyOrders.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-2">
                  <CalendarIcon className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">ไม่พบคำสั่งราชการหรือวาระงานตามเงื่อนไข</p>
                  <p className="text-xs text-slate-400">ลองล้างช่องค้นหาหรือเปลี่ยนตัวกรอง</p>
                </div>
              ) : (
                filteredFacultyOrders.map((ev) => {
                  const isDone = ev.status === 'done';
                  const photos = ev.actualPhotos || [];
                  const isSelected = selectedOrderId === ev.id;

                  return (
                    <div
                      key={ev.id}
                      onClick={() => setSelectedOrderId(ev.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-start sm:items-center gap-3">
                        <div className="text-center font-mono bg-slate-100 px-3 py-2 rounded-xl border border-slate-200 shrink-0">
                          <span className="text-[10px] text-slate-500 block uppercase">
                            {ev.eventDate ? THAI_MONTHS[parseInt(ev.eventDate.split('-')[1], 10) - 1]?.slice(0, 3) || 'ก.ย.' : 'ก.ย.'}
                          </span>
                          <span className="text-base font-bold text-slate-800">
                            {ev.eventDate ? (ev.eventDate.split('-')[2] || '—') : '—'}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-bold border border-blue-100">
                              {ev.orderNumber}
                            </span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getCategoryColor(ev.category)}`}>
                              {ev.category}
                            </span>
                            <span 
                              className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-950 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 shadow-2xs"
                              title={`เกณฑ์คะแนนภาระงาน: ${getOrderWorkloadType(ev)} (+${formatScore(getOrderScore(ev))} คะแนน)`}
                            >
                              <Award className="w-3 h-3 text-amber-600" />
                              <span>+{formatScore(getOrderScore(ev))} คะแนน</span>
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                            <span>เวลา: {ev.eventTime}</span>
                            <span>•</span>
                            <span>สถานที่: {ev.location}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {/* Evidence Badge */}
                        {photos.length > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg font-medium">
                            <Camera className="w-3 h-3 text-emerald-600" />
                            <span>แนบแล้ว ({photos.length})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg font-medium">
                            <AlertCircle className="w-3 h-3 text-amber-600" />
                            <span>ยังไม่มีรูป</span>
                          </span>
                        )}

                        {/* Status Badge */}
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            เสร็จแล้ว
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full font-medium">
                            <Clock className="w-3.5 h-3.5" />
                            รอดำเนินการ
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Right Col: Selected Event Inspection & Direct Actions Pane (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          {selectedOrder ? (
            <div className="space-y-4">
              {/* Header */}
              <div className="border-b border-slate-100 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                      {selectedOrder.orderNumber}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-md border ${getCategoryColor(selectedOrder.category)}`}>
                      {selectedOrder.category}
                    </span>
                  </div>
                  <span 
                    className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-950 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-300 shadow-2xs"
                    title={`เกณฑ์คะแนนภาระงาน: ${getOrderWorkloadType(selectedOrder)} (+${formatScore(getOrderScore(selectedOrder))} คะแนน)`}
                  >
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>+{formatScore(getOrderScore(selectedOrder))} คะแนน</span>
                    <span className="text-amber-800 font-medium">({getOrderWorkloadType(selectedOrder)})</span>
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 leading-snug">
                  {selectedOrder.title}
                </h3>
              </div>

              {/* Status & Quick Toggle */}
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[11px] text-slate-500 block">สถานะการปฏิบัติหน้าที่:</span>
                  <span className={`text-xs font-bold ${selectedOrder.status === 'done' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {selectedOrder.status === 'done' ? '✓ ปฏิบัติงานแล้ว' : '⏳ รอจัดงาน / ดำเนินการ'}
                  </span>
                </div>
                <button
                  onClick={() => onToggleStatus(selectedOrder.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    selectedOrder.status === 'done'
                      ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                      : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  }`}
                >
                  {selectedOrder.status === 'done' ? 'เปลี่ยนเป็นยังไม่เสร็จ' : 'ยืนยันว่าปฏิบัติงานแล้ว'}
                </button>
              </div>

              {/* Event Metadata */}
              <div className="space-y-2 text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>
                    วันที่จัด: <strong>{selectedOrder.eventDate}{selectedOrder.eventEndDate && selectedOrder.eventEndDate !== selectedOrder.eventDate ? ` ถึง ${selectedOrder.eventEndDate}` : ''}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>เวลา: {selectedOrder.eventTime || 'ตามกำหนดการ'}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>สถานที่: {selectedOrder.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์'}</span>
                </div>
              </div>

              {/* Direct Evidence Photos Section (Uploaded directly from calendar) */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800">
                      ภาพถ่ายหลักฐานหน้างาน ({photoCount})
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEvidenceModalOpen(true)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>แนบรูป</span>
                  </button>
                </div>

                {hasPhotos ? (
                  <div className="grid grid-cols-3 gap-2">
                    {(selectedOrder.actualPhotos || []).map((photo, pIdx) => {
                      const photoObj = typeof photo === 'string'
                        ? { id: `photo-${pIdx}`, url: photo, name: `ภาพถ่าย_${pIdx + 1}.jpg` }
                        : photo;
                      return (
                        <div
                          key={photoObj.id || pIdx}
                          onClick={() => setLightboxData({ photo: photoObj, order: selectedOrder })}
                          className="group relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900 cursor-pointer shadow-2xs hover:shadow-md transition-all hover:scale-[1.03]"
                        >
                          <img
                            src={photoObj.url}
                            alt={photoObj.name || 'หลักฐาน'}
                            className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = FALLBACK_EVIDENCE_IMAGE;
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-1">
                            <span className="text-[8px] text-white truncate max-w-[80%]">
                              {photoObj.name}
                            </span>
                            <Maximize2 className="w-2.5 h-2.5 text-white shrink-0" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white rounded-lg p-3 border border-dashed border-slate-300 text-center space-y-1">
                    <AlertCircle className="w-4 h-4 text-amber-500 mx-auto" />
                    <p className="text-[11px] text-slate-600 font-medium">ยังไม่ได้แนบภาพถ่ายหน้างาน</p>
                    <p className="text-[10px] text-slate-400">กดปุ่ม "แนบรูป" ด้านบนเพื่อเพิ่มภาพถ่ายกิจกรรม</p>
                  </div>
                )}
              </div>

              {/* Assigned List */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-700 block mb-2">
                  ผู้รับผิดชอบตามคำสั่งราชการ:
                </span>
                <div className="space-y-1.5">
                  {(selectedOrder.facultyAssigned || []).map((f, i) => (
                    <div key={i} className="text-xs flex items-center justify-between text-slate-700">
                      <span className={f.id === activeFaculty?.id ? 'font-bold text-blue-700' : ''}>
                        {f.name || 'อาจารย์ผู้รับผิดชอบ'}
                      </span>
                      <span className="text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded-md border border-slate-200">
                        {(f.roleInOrder || 'กรรมการดำเนินงาน').slice(0, 25)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sync to Google Calendar & Deep Link Section */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => handleOpenGoogleCalendar(selectedOrder)}
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>เพิ่มลง Google Calendar (พร้อม Deep-Link)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-80" />
                </button>
                <p className="text-[10px] text-center text-slate-400">
                  * กิจกรรมใน Google Calendar จะมีลิงก์กดเปิดกลับมาที่ตู้ลิ้นชักคำสั่งนี้ทันที
                </p>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleJumpToDrawer(selectedOrder)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-semibold text-xs transition-colors cursor-pointer border border-purple-200"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-purple-600" />
                    <span>เปิดในตู้ลิ้นชัก</span>
                  </button>

                  <button
                    onClick={() => onJumpToEportfolio(selectedOrder)}
                    className="inline-flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer border border-blue-200"
                  >
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    <span>กรอก e-Portfolio</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <CalendarIcon className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <p className="text-xs">คลิกเลือกกิจกรรมในปฏิทินเพื่อดูรายละเอียด</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
