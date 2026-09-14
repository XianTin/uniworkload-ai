import React, { useState, useEffect } from 'react';
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
  ExternalLink
} from 'lucide-react';

export default function DualCalendarModule({ 
  orders, 
  activeFaculty, 
  onToggleStatus, 
  onOpenIcal, 
  onJumpToEportfolio,
  onNotify
}) {
  const [viewMode, setViewMode] = useState('month'); // 'month' | 'agenda'
  // Filter orders relevant to active faculty
  const facultyOrders = (orders || []).filter(o => 
    (o.facultyAssigned || []).some(f => f.id === activeFaculty?.id)
  );
  const [selectedOrder, setSelectedOrder] = useState(() => facultyOrders[0] || (orders && orders[0]) || null);

  // Sync selected order when faculty or orders change
  useEffect(() => {
    setSelectedOrder(facultyOrders[0] || (orders && orders[0]) || null);
  }, [activeFaculty?.id, orders]);

  // September 2026 calendar days simulation (Sep 1, 2026 was Tuesday)
  // Calendar days: 1 to 30.
  const daysInMonth = Array.from({ length: 30 }, (_, i) => i + 1);
  const startDayOffset = 2; // Tuesday is index 2 (Sunday=0, Monday=1, Tuesday=2)

  const getEventsForDay = (day) => {
    const dayStr = day < 10 ? `2026-09-0${day}` : `2026-09-${day}`;
    return facultyOrders.filter(o => o.eventDate === dayStr);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Dual Calendar Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-semibold mb-1.5">
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>โมดูลที่ 3: Smart Dual Calendar (Web & Mobile Sync)</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              ปฏิทินภาระงานและตารางคำสั่งราชการ
            </h2>
            <p className="text-xs text-slate-500">
              ผสานตารางงานบนเว็บ พร้อมเชื่อมโยงระบบแจ้งเตือนเข้าสู่ Google/Apple Calendar บนมือถืออัตโนมัติ
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenIcal}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold text-xs shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>ซิงค์เข้ามือถือ (iCal Feed)</span>
            </button>

            {/* View switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('month')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'month' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองปฏิทินรายเดือน"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`p-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  viewMode === 'agenda' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
                title="มุมมองวาระงาน (Agenda List)"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Month Navigation & Category Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <h3 className="text-base font-bold text-slate-800 font-sans">
              กันยายน 2569 (September 2026)
            </h3>
            <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5 border border-slate-200">
              <button className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors cursor-pointer">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1 hover:bg-white rounded-md text-slate-600 transition-colors cursor-pointer">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>วิชาการ/บริการวิชาการ</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span>ประกันคุณภาพการศึกษา</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span>การเรียนการสอน/สหกิจ</span>
            </span>
          </div>
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
                <span>อา.</span>
                <span>จ.</span>
                <span>อ.</span>
                <span>พ.</span>
                <span>พฤ.</span>
                <span>ศ.</span>
                <span>ส.</span>
              </div>

              {/* Day cells grid */}
              <div className="grid grid-cols-7 gap-1.5 mt-2">
                {/* Empty cells for offset */}
                {Array.from({ length: startDayOffset }).map((_, idx) => (
                  <div key={`offset-${idx}`} className="h-24 p-1 rounded-xl bg-slate-50/40 border border-transparent"></div>
                ))}

                {/* Days of month */}
                {daysInMonth.map((day) => {
                  const events = getEventsForDay(day);
                  const isToday = day === 11; // Simulated current date: 11 Sep 2026

                  return (
                    <div
                      key={day}
                      onClick={() => events.length > 0 && setSelectedOrder(events[0])}
                      className={`h-24 p-1.5 rounded-xl border transition-all text-left flex flex-col justify-between cursor-pointer ${
                        isToday
                          ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30'
                          : events.length > 0
                          ? 'border-slate-200 hover:border-blue-400 bg-white hover:shadow-xs'
                          : 'border-slate-100 bg-white/60 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-mono font-medium ${isToday ? 'bg-blue-600 text-white w-5 h-5 rounded-full flex items-center justify-center font-bold' : 'text-slate-700'}`}>
                          {day}
                        </span>
                        {events.length > 0 && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        )}
                      </div>

                      {/* Event chips */}
                      <div className="space-y-1 overflow-hidden">
                        {events.slice(0, 2).map((ev) => (
                          <div
                            key={ev.id}
                            className={`text-[10px] leading-tight px-1.5 py-0.5 rounded-md truncate font-medium ${
                              ev.status === 'done'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-sky-100 text-sky-900 border border-sky-200'
                            }`}
                          >
                            {ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Agenda List View */
            <div className="space-y-3">
              {facultyOrders.map((ev) => (
                <div
                  key={ev.id}
                  onClick={() => setSelectedOrder(ev)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    selectedOrder?.id === ev.id
                      ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-center font-mono bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                      <span className="text-[10px] text-slate-500 block uppercase">ก.ย.</span>
                      <span className="text-base font-bold text-slate-800">
                        {ev.eventDate ? (ev.eventDate.split('-')[2] || '—') : '—'}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{ev.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                          {ev.orderNumber}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                        <span>เวลา: {ev.eventTime}</span>
                        <span>•</span>
                        <span>{ev.location}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {ev.status === 'done' ? (
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
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Selected Event Inspection Pane (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
          {selectedOrder ? (
            <div className="space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <span className="text-[11px] font-mono text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-md">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-2 leading-snug">
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
                  {selectedOrder.status === 'done' ? 'เปลี่ยนเป็นยังไม่เสร็จ' : 'กดยืนยันว่าปฏิบัติงานแล้ว'}
                </button>
              </div>

              {/* Event Metadata */}
              <div className="space-y-2 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>วันที่จัด: <strong>{selectedOrder.eventDate}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>เวลา: {selectedOrder.eventTime}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>สถานที่: {selectedOrder.location}</span>
                </div>
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

              {/* Jump to e-Portfolio */}
              <div className="pt-2">
                <button
                  onClick={() => onJumpToEportfolio(selectedOrder)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-xs transition-colors cursor-pointer border border-blue-200"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>นำข้อมูลนี้ไปกรอก e-Portfolio</span>
                </button>
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
