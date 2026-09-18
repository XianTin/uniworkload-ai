import React from 'react';
import { 
  Layers, 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Image as ImageIcon, 
  Smartphone, 
  Sparkles, 
  FileText,
  UploadCloud,
  Bell,
  AlertTriangle,
  Camera
} from 'lucide-react';

function formatThaiDate(dateStr) {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  
  const thaiMonths = [
    'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
  ];
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} ${date.getFullYear() + 543}`;
}

export default function DashboardOverview({ 
  orders, 
  activeFaculty, 
  onNavigateTab, 
  onToggleStatus, 
  onJumpToEportfolio,
  onOpenIcal,
  onOpenIngest
}) {
  // Orders assigned to this faculty
  const facultyOrders = (orders || []).filter(o => 
    (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id
  );

  // Recent 3 orders
  const recentOrders = facultyOrders.slice(0, 3);

  // Smart Missing Evidence Reminder (Orders where event date has passed, but lacks actual evidence photos)
  const missingPhotoOverdueOrders = facultyOrders.filter(o => {
    const hasPhotos = o.actualPhotos && o.actualPhotos.length > 0;
    if (hasPhotos) return false;
    if (!o.eventDate) return false;
    const eventTime = new Date(o.eventDate).getTime();
    if (isNaN(eventTime)) return false;
    const nowTime = new Date().getTime();
    return eventTime <= nowTime;
  });

  // Upcoming events
  const upcomingEvents = facultyOrders
    .filter(o => o.eventDate)
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* 🔔 Smart Missing-Evidence Reminder Banner */}
      {missingPhotoOverdueOrders.length > 0 && (
        <div className="rounded-2xl border border-amber-200/90 bg-gradient-to-r from-amber-50/90 via-orange-50/70 to-rose-50/60 p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-start gap-3">
            <div className="relative shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Bell className="w-5 h-5 text-white animate-bounce" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white animate-pulse" />
            </div>

            <div className="space-y-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-200/70 text-amber-900 font-bold text-[10px] tracking-wide">
                  <AlertTriangle className="w-3 h-3 text-amber-800" />
                  <span>ระบบสะกิดเตือนหลักฐานอัจฉริยะ (Smart Evidence Reminder)</span>
                </span>
                <span className="text-[10px] text-amber-800 font-semibold">
                  {missingPhotoOverdueOrders.length} คำสั่งรอแนบรูป
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                กิจกรรมผ่านพ้นไปแล้ว แต่ยังไม่ได้แนบภาพถ่ายหน้างานจริง
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                อาจารย์มีกิจกรรมที่จัดเสร็จสิ้นแล้วแต่ยังขาดภาพถ่ายหลักฐานสำหรับใช้ประกอบรายงาน SAR และแบบฟอร์ม e-Portfolio
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('drawer')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold shadow-md shadow-amber-600/25 transition-all cursor-pointer shrink-0"
          >
            <Camera className="w-4 h-4" />
            <span>ไปที่ตู้ลิ้นชักเพื่อแนบรูป</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      )}

      {/* 2-Column Balanced Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Recent Orders in Drawer */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    คำสั่งล่าสุดในตู้ลิ้นชัก
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    คำสั่งราชการที่กระจายมายัง {activeFaculty?.name || 'อาจารย์'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('drawer')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                <span>เปิดตู้ลิ้นชัก</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentOrders.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs space-y-2">
                <p>ยังไม่มีคำสั่งที่ระบุชื่อ {activeFaculty?.name || 'อาจารย์'} ในตู้ลิ้นชักนี้</p>
                {orders && orders.length > 0 && (
                  <button
                    onClick={() => onNavigateTab('drawer')}
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-semibold underline cursor-pointer"
                  >
                    <span>ตรวจพบคำสั่งรวมในระบบ {orders.length} ฉบับ (คลิกเปิดตู้ลิ้นชัก)</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const hasPhotos = order.actualPhotos && order.actualPhotos.length > 0;
                  const isDone = order.status === 'done';

                  return (
                    <div
                      key={order.id}
                      className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                              {order.orderNumber}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700 font-medium">
                              {order.category}
                            </span>
                          </div>
                          <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                            {order.title}
                          </h4>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-slate-400" />
                              {formatThaiDate(order.eventDate || order.signDate)}
                            </span>
                            {order.location && (
                              <span className="flex items-center gap-1 truncate max-w-[200px]">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                {order.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 flex flex-col items-end gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            isDone 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-amber-100 text-amber-700'
                          }`}>
                            {isDone ? '✓ เสร็จสิ้น' : '⏳ รอดำเนินการ'}
                          </span>

                          <span className={`text-[10px] flex items-center gap-1 ${
                            hasPhotos ? 'text-emerald-600 font-medium' : 'text-slate-400'
                          }`}>
                            <ImageIcon className="w-3 h-3" />
                            {hasPhotos ? `${order.actualPhotos.length} ภาพ` : 'ยังไม่มีรูป'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-slate-200/50 flex items-center justify-between text-[11px]">
                        <button
                          onClick={() => onToggleStatus(order.id)}
                          className="text-slate-600 hover:text-slate-900 cursor-pointer transition-colors"
                        >
                          {isDone ? 'ทำเครื่องหมายว่ายังไม่เสร็จ' : '✓ ปฏิบัติงานแล้วเสร็จ'}
                        </button>
                        <button
                          onClick={() => onJumpToEportfolio(order)}
                          className="font-medium text-amber-700 hover:text-amber-800 cursor-pointer transition-colors flex items-center gap-1"
                        >
                          <span>ส่ง e-Portfolio</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>แสดง 3 รายการล่าสุดจากทั้งหมด {facultyOrders.length} รายการ</span>
            <button
              onClick={() => onNavigateTab('drawer')}
              className="text-blue-600 font-medium hover:underline cursor-pointer"
            >
              จัดการแฟ้มหลักฐานทั้งหมด &rarr;
            </button>
          </div>
        </div>

        {/* Right Column: Upcoming Schedule & iCal Sync */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    กำหนดการและกิจกรรมเร็วๆ นี้
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ปฏิทินงานสกัดจากคำสั่งราชการ มรภ.นครสวรรค์
                  </p>
                </div>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline cursor-pointer"
              >
                <span>เปิดปฏิทินเต็ม</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                ไม่มีกำหนดการเร็วๆ นี้
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt) => {
                  const eventDate = evt.eventDate ? new Date(evt.eventDate) : null;
                  const isValidDate = eventDate && !isNaN(eventDate.getTime());
                  const day = isValidDate ? eventDate.getDate() : '—';
                  const thaiMonths = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
                  const month = isValidDate ? thaiMonths[eventDate.getMonth()] : 'ก.ย.';

                  return (
                    <div
                      key={evt.id}
                      className="flex items-start gap-3 p-3 rounded-xl border border-slate-200/70 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      {/* Date Pill */}
                      <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex flex-col items-center justify-center shrink-0 shadow-xs">
                        <span className="text-base font-bold leading-none">{day}</span>
                        <span className="text-[10px] text-blue-100 leading-tight mt-0.5">{month}</span>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold text-slate-800 line-clamp-1">
                          {evt.title}
                        </h4>
                        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {evt.eventTime || 'ตามเวลาราชการ'}
                          </span>
                          {evt.location && (
                            <span className="flex items-center gap-1 truncate max-w-[220px]">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {evt.location}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Quick Mobile iCal Sync Card */}
          <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-200/70 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  ซิงค์ Google Calendar (1-Click)
                </h4>
                <p className="text-[10px] text-slate-500">
                  เพิ่มครั้งเดียว อัปเดตงานใหม่อัตโนมัติ (RFC 5545 Live Feed)
                </p>
              </div>
            </div>
            <button
              onClick={onOpenIcal}
              className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              ซิงค์ 1-Click
            </button>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards: 4 Core Modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigateTab('ingestion')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center mb-2.5 group-hover:bg-sky-600 group-hover:text-white transition-colors">
            <UploadCloud className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            โมดูลที่ 1: นำเข้า & สกัด AI
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            อัปโหลดคำสั่งสแกน/รูปถ่าย สกัดชื่ออาจารย์และวันเวลานัดหมายอัตโนมัติ
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('drawer')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-2.5 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            โมดูลที่ 2: ตู้ลิ้นชักแฟ้มหลักฐาน
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            แนบภาพถ่ายหน้างานจริง กรองช่วงวันที่อิสระ และพิมพ์ใบสรุป Dossier
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('calendar')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Calendar className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            โมดูลที่ 3: ปฏิทินภาระงาน 2 ทาง
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            มุมมองปฏิทินเดือน/วาระงาน ซิงค์แจ้งเตือนมือถือตามมาตรฐาน RFC 5545
          </p>
        </button>

        <button
          onClick={() => onNavigateTab('eportfolio')}
          className="p-4 rounded-xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-left group cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-2.5 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FileText className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            โมดูลที่ 4: e-Portfolio Copilot
          </h4>
          <p className="text-[11px] text-slate-500 mt-1">
            ถอดรหัสแบบฟอร์มจริง มรภ.นครสวรรค์ ครบ 5 ช่อง พร้อม 1-Click Copy
          </p>
        </button>
      </div>
    </div>
  );
}
