import React, { useState } from 'react';
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
  Award,
  Crown,
  Zap,
  Target,
  X,
  ChevronRight,
  BarChart3
} from 'lucide-react';
import { 
  WORKLOAD_SCORING_CRITERIA, 
  calculateTotalScore, 
  calculateScoreBreakdown, 
  formatScore 
} from '../utils/workloadScoring';

export default function StatsOverview({ activeFaculty, currentUser, orders = [], onOpenIngest, onNavigateTab }) {
  const isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.role === 'superadmin';
  const isCoAdmin = currentUser?.isCoAdmin || currentUser?.role === 'coadmin';

  const [showCriteriaModal, setShowCriteriaModal] = useState(false);

  // Compute live stats for active faculty directly from current orders
  const facultyOrders = React.useMemo(() => {
    if (!orders || !Array.isArray(orders)) return [];
    return orders.filter((o) =>
      (o.facultyAssigned || []).some((f) => f.id === activeFaculty?.id) || o.facultyId === activeFaculty?.id
    );
  }, [orders, activeFaculty?.id]);

  const scoringBreakdown = React.useMemo(() => {
    return calculateScoreBreakdown(facultyOrders);
  }, [facultyOrders]);

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
      totalScore: scoringBreakdown.totalScore,
      evidenceReadyPct
    };
  }, [facultyOrders, scoringBreakdown]);

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
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>ผู้ดูแลระบบสูงสุด (tie)</span>
                </span>
              ) : isCoAdmin ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  <span>รองผู้ดูแลระบบสูงสุด (Pimmy)</span>
                </span>
              ) : null}
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white flex items-center gap-2 flex-wrap">
              <span>ยินดีต้อนรับ, {isSuperAdmin ? (currentUser?.name || 'นายศุภกร คงไข่ (tie)') : isCoAdmin ? (currentUser?.name || 'พิมมี่ (Pimmy)') : (activeFaculty?.name || 'อาจารย์')}</span>
            </h1>
            
            {isSuperAdmin && activeFaculty ? (
              <p className="text-xs text-amber-200/90 font-medium bg-amber-950/40 border border-amber-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>สิทธิ์ Super Admin: กำลังตรวจสอบตู้ลิ้นชักของ <strong className="text-white">{activeFaculty.name}</strong> ({activeFaculty.department || 'มรภ.นว.'}) — สามารถสลับดูอาจารย์ท่านอื่นได้ตลอดเวลา</span>
              </p>
            ) : isCoAdmin && activeFaculty ? (
              <p className="text-xs text-purple-200/90 font-medium bg-purple-950/40 border border-purple-500/20 px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                <span>สิทธิ์ Co-Admin: กำลังตรวจสอบตู้ลิ้นชักของ <strong className="text-white">{activeFaculty.name}</strong> ({activeFaculty.department || 'มรภ.นว.'}) — สามารถสลับดูอาจารย์ท่านอื่นได้</span>
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

      {/* 5 Quick Stat Cards including Workload Points */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
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
            <span className="text-xs text-slate-500">ฉบับ (ในรอบนี้)</span>
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
            คงเหลืออีก {stats.pendingOrders} ภารกิจ
          </div>
        </div>

        {/* Card 3: ภาระงานสะสม (ชั่วโมง กพอ.) */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ชั่วโมงภาระงานสะสม</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{stats.totalHours}</span>
            <span className="text-xs text-slate-500">ชม. กพอ.</span>
          </div>
          <div className="mt-2 text-xs text-emerald-600 font-medium">
            ✓ ผ่านเกณฑ์ขั้นต่ำ 35 ชม./สัปดาห์
          </div>
        </div>

        {/* Card 4: คะแนนภาระงานสะสม (15 เกณฑ์ NSRU) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white rounded-xl p-5 border border-amber-300/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-950 flex items-center gap-1">
              <span>คะแนนภาระงานสะสม</span>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            </span>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-xs">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700 font-mono tracking-tight">{formatScore(stats.totalScore)}</span>
            <span className="text-xs text-slate-500 font-medium">คะแนน</span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowCriteriaModal(true)}
              className="text-[11px] font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1 cursor-pointer hover:underline"
            >
              <span>15 เกณฑ์ประเมิน NSRU</span>
              <ChevronRight className="w-3 h-3 text-amber-600" />
            </button>
          </div>
        </div>

        {/* Card 5: ความพร้อมหลักฐาน e-Portfolio */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">ความพร้อมหลักฐาน</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-700 font-mono">{stats.evidenceReadyPct}%</span>
            <span className="text-xs text-slate-500">ไฟล์ & ภาพครบ</span>
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

      {/* 🎯 15-Criteria Workload Scoring Reference & Breakdown Modal */}
      {showCriteriaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold border border-amber-200">
                    <Award className="w-3.5 h-3.5 text-amber-600" />
                    <span>เกณฑ์การให้คะแนนภาระงาน (15 เกณฑ์มาตรฐาน NSRU)</span>
                  </span>
                  <span className="text-xs text-slate-400">|</span>
                  <span className="text-xs font-semibold text-slate-600">มรภ.นครสวรรค์</span>
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  คู่มือและสรุปคะแนนภาระงาน: {activeFaculty?.name || 'อาจารย์'}
                </h3>
              </div>
              <button
                onClick={() => setShowCriteriaModal(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Total Points Header Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white shadow-md shadow-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs text-amber-100 font-medium block">คะแนนภาระงานสะสมปัจจุบัน</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black font-mono">{formatScore(stats.totalScore)}</span>
                  <span className="text-sm font-semibold text-amber-100">คะแนนประเมิน</span>
                </div>
                <span className="text-xs text-amber-100/90 mt-0.5 block">
                  คำนวณจากคำสั่งราชการและกิจกรรมทั้งหมด {facultyOrders.length} รายการในตู้ลิ้นชัก
                </span>
              </div>

              <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-2 rounded-xl border border-white/20">
                <Target className="w-5 h-5 text-amber-200" />
                <div className="text-xs">
                  <p className="font-bold text-white">ครอบคลุม 15 เกณฑ์</p>
                  <p className="text-amber-100 text-[10px]">วิชาการ • พื้นที่ • วิทยากร • พัฒนาตนเอง</p>
                </div>
              </div>
            </div>

            {/* 15 Criteria Table / Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-blue-600" />
                <span>จำแนกคะแนนตาม 15 เกณฑ์การประเมิน (Official Criteria Breakdown)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {WORKLOAD_SCORING_CRITERIA.map((c) => {
                  const breakdownItem = scoringBreakdown.items.find(it => it.criteria.name === c.name);
                  const orderCount = breakdownItem?.count || 0;
                  const earnedScore = breakdownItem?.totalScore || 0;

                  return (
                    <div 
                      key={c.id}
                      className={`p-3 rounded-xl border transition-all ${
                        orderCount > 0 
                          ? 'bg-amber-50/40 border-amber-300/80 shadow-2xs' 
                          : 'bg-slate-50/60 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">{c.name}</span>
                            <span className="text-[10px] text-slate-400">({c.group})</span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{c.description}</p>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-mono font-bold text-xs shrink-0 border border-amber-200">
                          {formatScore(c.score)} คะแนน
                        </span>
                      </div>

                      <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                        <span className="text-slate-500">
                          ปฏิบัติงาน: <strong className={orderCount > 0 ? "text-slate-900" : "text-slate-400"}>{orderCount} คำสั่ง</strong>
                        </span>
                        <span className={orderCount > 0 ? "font-bold text-amber-800 font-mono" : "text-slate-400 font-mono"}>
                          +{formatScore(earnedScore)} คะแนน
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Action */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                ระบบคำนวณและจับคู่เกณฑ์ให้อัตโนมัติด้วย AI สามารถแก้ไขคะแนนรายคำสั่งได้ที่ตู้ลิ้นชัก
              </span>
              <button
                type="button"
                onClick={() => setShowCriteriaModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
