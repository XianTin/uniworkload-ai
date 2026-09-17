import React from 'react';
import { 
  FileText, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  UploadCloud, 
  Smartphone, 
  CalendarDays,
  Award
} from 'lucide-react';

export default function StatsOverview({ activeFaculty, currentUser, orders = [], onOpenIngest, onNavigateTab }) {
  const isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.role === 'superadmin';
  const isCoAdmin = currentUser?.isCoAdmin || currentUser?.role === 'coadmin';

  // Compute live stats for active faculty directly from current orders
  const facultyOrders = React.useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter((o) =>
      (o.facultyAssigned || []).some((f) => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id
    );
  }, [orders, activeFaculty?.id]);

  const stats = React.useMemo(() => {
    const totalOrders = facultyOrders.length;
    const completedOrders = facultyOrders.filter((o) => o.status === 'done').length;
    const pendingOrders = facultyOrders.filter((o) => o.status !== 'done').length;
    const totalHours = facultyOrders.reduce((sum, o) => sum + (Number(o.workloadHours) || 0), 0);
    const withPhotos = facultyOrders.filter((o) => o.actualPhotos && o.actualPhotos.length > 0).length;
    const evidenceReadyPct = totalOrders > 0 ? Math.round((withPhotos / totalOrders) * 100) : 0;
    return {
      totalOrders,
      completedOrders,
      pendingOrders,
      totalHours: Number(totalHours.toFixed(1)),
      evidenceReadyPct
    };
  }, [facultyOrders]);

  return (
    <div className="space-y-6">
      {/* Welcome & Context Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 rounded-full bg-sky-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute top-0 right-1/4 w-40 h-40 rounded-full bg-indigo-500/10 blur-2xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-sky-300 text-xs font-medium backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                <span>รอบการประเมินปัจจุบัน: รอบที่ 2 / 2569 (1 เม.ย. – 30 ก.ย. 2569)</span>
              </div>
              {isSuperAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold">
                  <span>👑 ผู้ดูแลระบบสูงสุด (tie)</span>
                </span>
              ) : isCoAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  <span>🛡️ รองผู้ดูแลระบบสูงสุด (Pimmy)</span>
                </span>
              ) : null}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>ยินดีต้อนรับ, {isSuperAdmin ? (currentUser?.name || 'นายศุภกร คงไข่ (tie)') : isCoAdmin ? (currentUser?.name || 'พิมมี่ (Pimmy)') : (activeFaculty?.name || 'อาจารย์')}</span>
            </h1>
            
            {isSuperAdmin && activeFaculty ? (
              <p className="text-xs text-amber-200/90 font-medium bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-xl inline-block">
                ⚡ สิทธิ์ Super Admin: กำลังตรวจสอบตู้ลิ้นชักของ <strong className="text-white">{activeFaculty.name}</strong> ({activeFaculty.department || 'มรภ.นว.'}) — สามารถสลับดูอาจารย์ท่านอื่นได้ตลอดเวลา
              </p>
            ) : isCoAdmin && activeFaculty ? (
              <p className="text-xs text-purple-200/90 font-medium bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-xl inline-block">
                ⚡ สิทธิ์ Co-Admin: กำลังตรวจสอบตู้ลิ้นชักของ <strong className="text-white">{activeFaculty.name}</strong> ({activeFaculty.department || 'มรภ.นว.'}) — สามารถสลับดูอาจารย์ท่านอื่นได้
              </p>
            ) : null}

            <p className="text-slate-300 text-sm leading-relaxed">
              ระบบ UniWorkload AI ช่วยรวบรวมคำสั่งราชการ สกัดวันเวลานัดหมายลงปฏิทินมือถือ 
              และเตรียมหลักฐานพร้อมส่งต่อระบบ e-Portfolio ของมหาวิทยาลัยราชภัฏนครสวรรค์ครบจบในที่เดียว
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={onOpenIngest}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-400 to-blue-500 text-slate-950 font-semibold text-sm shadow-lg shadow-sky-500/25 hover:from-sky-300 hover:to-blue-400 transition-all cursor-pointer active:scale-95"
            >
              <UploadCloud className="w-4 h-4" />
              <span>อัปโหลดคำสั่งใหม่ (AI OCR)</span>
            </button>
            <button
              onClick={() => onNavigateTab('calendar')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-medium text-sm backdrop-blur-md border border-white/15 transition-all cursor-pointer"
            >
              <CalendarDays className="w-4 h-4 text-sky-300" />
              <span>ดูปฏิทินงานสัปดาห์นี้</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">คำสั่งราชการที่เกี่ยวข้อง</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{stats.totalOrders}</span>
            <span className="text-xs text-slate-500">ฉบับ (ในรอบประเมินนี้)</span>
          </div>
          <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
            <span>แบ่งตามคณะและมหาวิทยาลัย</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ปฏิบัติงานแล้วเสร็จ</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 font-mono">{stats.completedOrders}</span>
            <span className="text-xs text-slate-500">/ {stats.totalOrders} รายการ</span>
          </div>
          <div className="mt-2 text-xs text-slate-500">
            คงเหลืออีก {stats.pendingOrders} ภารกิจที่กำลังจะถึง
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ภาระงานสะสมโดยประมาณ</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{stats.totalHours}</span>
            <span className="text-xs text-slate-500">ชม. (เฉลี่ยรายสัปดาห์)</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            ✓ ผ่านเกณฑ์ขั้นต่ำ 35 ชม./สัปดาห์
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ความพร้อมหลักฐาน e-Portfolio</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 font-mono">{stats.evidenceReadyPct}%</span>
            <span className="text-xs text-slate-500">มีไฟล์คำสั่ง & รูปถ่ายครบ</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div 
              className="bg-purple-600 h-1.5 rounded-full transition-all duration-500" 
              style={{ width: `${stats.evidenceReadyPct}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* System 5-Step Workflow Banner (matching Capstone Onepage) */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              กระบวนการทำงานอัจฉริยะ (End-to-End System Workflow)
            </h3>
            <p className="text-xs text-slate-500">
              วิเคราะห์และออกแบบตามสถาปัตยกรรมโครงงานปริญญาตรี คณะวิทยาการจัดการ มรภ.นครสวรรค์
            </p>
          </div>
          <button 
            onClick={() => onNavigateTab('ingestion')}
            className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>ทดลองนำเข้าข้อมูล</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center hover:border-blue-300 transition-colors">
            <div className="w-7 h-7 mx-auto rounded-lg bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center mb-2">1</div>
            <p className="text-xs font-semibold text-slate-800">นำเข้าเอกสาร</p>
            <p className="text-[11px] text-slate-500 mt-1">PDF รวมคำสั่ง / ถ่ายรูปเอกสาร / แคปแชท LINE</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center hover:border-sky-300 transition-colors">
            <div className="w-7 h-7 mx-auto rounded-lg bg-sky-100 text-sky-700 font-bold text-xs flex items-center justify-center mb-2">2</div>
            <p className="text-xs font-semibold text-slate-800">AI OCR สกัดข้อมูล</p>
            <p className="text-[11px] text-slate-500 mt-1">ดึงเลขคำสั่ง, วันที่, เวลา, สถานที่ และรายชื่อบุคลากร</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center hover:border-emerald-300 transition-colors">
            <div className="w-7 h-7 mx-auto rounded-lg bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center mb-2">3</div>
            <p className="text-xs font-semibold text-slate-800">จัดสรรเข้าลิ้นชัก</p>
            <p className="text-[11px] text-slate-500 mt-1">กระจายเอกสารเข้าตู้บัญชีอาจารย์แต่ละท่านอัตโนมัติ</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center hover:border-indigo-300 transition-colors">
            <div className="w-7 h-7 mx-auto rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center mb-2">4</div>
            <p className="text-xs font-semibold text-slate-800">ลงปฏิทิน & Sync มือถือ</p>
            <p className="text-[11px] text-slate-500 mt-1">แสดงบนเว็บ & ซิงค์เข้า Google Calendar ผ่าน iCal</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-center hover:border-amber-300 transition-colors">
            <div className="w-7 h-7 mx-auto rounded-lg bg-amber-100 text-amber-700 font-bold text-xs flex items-center justify-center mb-2">5</div>
            <p className="text-xs font-semibold text-slate-800">1-Click e-Portfolio</p>
            <p className="text-[11px] text-slate-500 mt-1">คัดลอกข้อความ 5 ช่องตามฟอร์มจริงพร้อมแนบไฟล์</p>
          </div>
        </div>
      </div>
    </div>
  );
}
