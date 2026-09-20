import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  FileEdit, 
  Calendar, 
  Clock, 
  MapPin, 
  Tag, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { WORKLOAD_CATEGORIES } from '../data/mockData';
import { 
  WORKLOAD_SCORING_CRITERIA, 
  getWorkloadCriteriaByName, 
  determineWorkloadCriteria,
  formatScore 
} from '../utils/workloadScoring';

// Helper to format date range for preview
function formatRangeSummary(startStr, endStr) {
  if (!startStr) return '';
  if (!endStr || endStr === startStr) {
    const d = new Date(startStr);
    return `${d.getDate()} ${['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'][d.getMonth()]} ${d.getFullYear() + 543}`;
  }
  const s = new Date(startStr);
  const e = new Date(endStr);
  const diffDays = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  
  if (s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear()) {
    return `${s.getDate()} - ${e.getDate()} ${monthNames[s.getMonth()]} ${s.getFullYear() + 543} (${diffDays > 1 ? `กิจกรรมต่อเนื่อง ${diffDays} วัน` : '1 วัน'})`;
  }
  return `${s.getDate()} ${monthNames[s.getMonth()]} - ${e.getDate()} ${monthNames[e.getMonth()]} ${e.getFullYear() + 543} (${diffDays > 1 ? `กิจกรรมต่อเนื่อง ${diffDays} วัน` : '1 วัน'})`;
}

export default function EditOrderModal({ 
  isOpen, 
  onClose, 
  order, 
  onSave 
}) {
  if (!isOpen || !order) return null;

  const getScoringFromOrder = (ord) => {
    if (!ord) return { type: 'งานมหาลัย', score: 1.0 };
    if (ord.workloadType && (ord.workloadScore !== undefined || ord.score !== undefined)) {
      return {
        type: ord.workloadType,
        score: ord.workloadScore !== undefined ? Number(ord.workloadScore) : Number(ord.score)
      };
    }
    const detected = determineWorkloadCriteria({
      title: ord.title || '',
      text: ord.fullDescription || ord.rawOcrText || '',
      location: ord.location || '',
      category: ord.category || '',
      role: ord.role || ord.facultyAssigned?.[0]?.roleInOrder || ''
    });
    return { type: detected.name, score: detected.score };
  };

  const initialScoring = getScoringFromOrder(order);

  const [formData, setFormData] = useState({
    orderNumber: order.orderNumber || '',
    title: order.title || '',
    category: order.category || 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
    workloadType: initialScoring.type,
    workloadScore: initialScoring.score,
    signDate: order.signDate || '',
    eventDate: order.eventDate || '',
    eventEndDate: order.eventEndDate || order.eventDate || '',
    eventTime: order.eventTime || '08:30 - 16:30 น.',
    location: order.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์',
    role: order.role || order.facultyAssigned?.[0]?.roleInOrder || 'กรรมการดำเนินงาน',
    workloadHours: order.workloadHours || 3,
    status: order.status || 'upcoming',
    topic: order.ePortfolio?.topic || order.title || '',
    round: order.ePortfolio?.round || 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
    year: order.ePortfolio?.year || '2569',
    workloadRef: order.ePortfolio?.workloadRef || ''
  });

  // Sync state if order changes
  useEffect(() => {
    if (order) {
      const scoring = getScoringFromOrder(order);
      setFormData({
        orderNumber: order.orderNumber || '',
        title: order.title || '',
        category: order.category || 'บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย',
        workloadType: scoring.type,
        workloadScore: scoring.score,
        signDate: order.signDate || '',
        eventDate: order.eventDate || '',
        eventEndDate: order.eventEndDate || order.eventDate || '',
        eventTime: order.eventTime || '08:30 - 16:30 น.',
        location: order.location || 'มหาวิทยาลัยราชภัฏนครสวรรค์',
        role: order.role || order.facultyAssigned?.[0]?.roleInOrder || 'กรรมการดำเนินงาน',
        workloadHours: order.workloadHours || 3,
        status: order.status || 'upcoming',
        topic: order.ePortfolio?.topic || order.title || '',
        round: order.ePortfolio?.round || 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
        year: order.ePortfolio?.year || '2569',
        workloadRef: order.ePortfolio?.workloadRef || `ภาระงานด้าน${order.category || 'มหาวิทยาลัย'} (${scoring.type} ${scoring.score} คะแนน) มหาวิทยาลัยราชภัฏนครสวรรค์`
      });
    }
  }, [order]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const selectedCategoryObj = WORKLOAD_CATEGORIES.find(c => c.name === formData.category) || {
      code: order.categoryCode || 'admin',
      color: order.categoryColor || 'purple'
    };

    const finalOrderNumber = (formData.orderNumber || '').trim();
    const isPendingOrder = !finalOrderNumber || finalOrderNumber.includes('รอระบุ');

    const scoreVal = Number(formData.workloadScore) || 0;
    const typeVal = formData.workloadType || 'งานมหาลัย';

    const updatedOrder = {
      ...order,
      orderNumber: isPendingOrder ? 'รอระบุเลขที่คำสั่ง' : finalOrderNumber,
      title: formData.title,
      category: formData.category,
      categoryCode: selectedCategoryObj.code,
      categoryColor: selectedCategoryObj.color,
      workloadType: typeVal,
      workloadScore: scoreVal,
      score: scoreVal,
      signDate: formData.signDate,
      eventDate: formData.eventDate,
      eventEndDate: formData.eventEndDate || formData.eventDate,
      eventTime: formData.eventTime,
      location: formData.location,
      role: formData.role,
      workloadHours: Number(formData.workloadHours) || 3,
      status: formData.status,
      facultyAssigned: (order.facultyAssigned || []).map((f, idx) => 
        idx === 0 ? { ...f, roleInOrder: formData.role } : f
      ),
      ePortfolio: {
        ...order.ePortfolio,
        year: formData.year,
        round: formData.round,
        topic: formData.topic || formData.title,
        role: formData.role,
        hours: Number(formData.workloadHours) || 3,
        workloadType: typeVal,
        workloadScore: scoreVal,
        score: scoreVal,
        workloadRef: formData.workloadRef || `ภาระงานด้าน${formData.category} (${typeVal} ${scoreVal} คะแนน) มหาวิทยาลัยราชภัฏนครสวรรค์`,
        status: formData.status === 'done' ? 'completed' : (order.ePortfolio?.status || 'ready_to_export')
      }
    };

    onSave(updatedOrder);
    onClose();
  };

  const isPendingOrderNumber = !formData.orderNumber || formData.orderNumber.includes('รอระบุ');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                <FileEdit className="w-3.5 h-3.5 text-blue-600" />
                <span>แก้ไขข้อมูลคำสั่ง & ภาระงานในตู้ลิ้นชัก</span>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                formData.status === 'done' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
              }`}>
                {formData.status === 'done' ? '✓ ปฏิบัติงานแล้ว' : '⏳ รอดำเนินการ'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              แก้ไขรายละเอียดคำสั่งปฏิบัติงาน
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ท่านสามารถปรับปรุงเลขคำสั่ง, วันที่จัดกิจกรรม (1 วัน หรือ หลายวัน), สถานที่ และหัวข้อประเมินได้ตลอดเวลา
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Order Number & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>เลขที่คำสั่ง</span>
                </label>
                {isPendingOrderNumber && (
                  <span className="text-[10px] text-amber-600 font-medium bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                    ยังไม่มีเลขคำสั่ง
                  </span>
                )}
              </div>
              <input
                type="text"
                value={formData.orderNumber}
                placeholder="เช่น คก. 1055/2569 (หรือเว้นว่างถ้ายังไม่มี)"
                onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
              />
              <p className="text-[10px] text-slate-400 mt-1">
                💡 หากยังไม่มีเลขคำสั่งอย่างเป็นทางการ สามารถใส่ "รอระบุเลขที่คำสั่ง" หรือเว้นว่างไว้ได้ โดยไม่มีผลต่อการเก็บหลักฐาน
              </p>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                หมวดหมู่ภาระงาน
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  const newCat = e.target.value;
                  setFormData({
                    ...formData,
                    category: newCat,
                    workloadRef: `ภาระงานด้าน${newCat} มหาวิทยาลัยราชภัฏนครสวรรค์`
                  });
                }}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
              >
                {WORKLOAD_CATEGORIES.map((cat) => (
                  <option key={cat.name} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              ชื่อคำสั่ง / ชื่อกิจกรรมและโครงการ
            </label>
            <textarea
              rows={2}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value, topic: e.target.value })}
              required
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden resize-none"
            />
          </div>

          {/* Event Date Range (Key Feature for Multi-day events: e.g. 17 - 20) */}
          <div className="p-3.5 bg-slate-50/80 rounded-2xl border border-slate-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                <span>วันจัดกิจกรรม (รองรับงาน 1 วัน หรือหลายวันต่อเนื่อง เช่น 17 - 20)</span>
              </span>
              {formData.eventDate && (
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {formatRangeSummary(formData.eventDate, formData.eventEndDate)}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  วันเริ่มจัดกิจกรรม (Start Date)
                </label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setFormData(prev => ({
                      ...prev,
                      eventDate: newStart,
                      // If end date is empty or before start date, sync it
                      eventEndDate: (!prev.eventEndDate || prev.eventEndDate < newStart) ? newStart : prev.eventEndDate
                    }));
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-600 font-medium mb-1">
                  วันสิ้นสุดกิจกรรม (End Date — หากจัดหลายวัน)
                </label>
                <input
                  type="date"
                  min={formData.eventDate}
                  value={formData.eventEndDate}
                  onChange={(e) => setFormData({ ...formData, eventEndDate: e.target.value })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Time & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>เวลาจัดกิจกรรม</span>
              </label>
              <input
                type="text"
                value={formData.eventTime}
                placeholder="เช่น 08:30 - 16:30 น."
                onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>สถานที่จัดงาน</span>
              </label>
              <input
                type="text"
                value={formData.location}
                placeholder="เช่น ห้องประชุมวิชาการ หรือ มรภ.นครสวรรค์"
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>
          </div>

          {/* Workload Scoring Criteria Section (15 Criteria) */}
          <div className="p-3.5 bg-gradient-to-r from-amber-50/70 via-blue-50/50 to-indigo-50/60 rounded-2xl border border-amber-200/90 space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                <span>เกณฑ์การให้คะแนนภาระงาน (15 เกณฑ์มาตรฐาน NSRU)</span>
              </label>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500 text-white text-[11px] font-bold shadow-2xs">
                <span>🎯</span>
                <span>+{formatScore(formData.workloadScore)} คะแนน</span>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  ประเภทเกณฑ์การประเมิน
                </label>
                <select
                  value={formData.workloadType}
                  onChange={(e) => {
                    const found = WORKLOAD_SCORING_CRITERIA.find(c => c.name === e.target.value);
                    if (found) {
                      setFormData({
                        ...formData,
                        workloadType: found.name,
                        workloadScore: found.score,
                        workloadRef: `ภาระงานด้าน${formData.category} (${found.name} ${found.score} คะแนน) มหาวิทยาลัยราชภัฏนครสวรรค์`
                      });
                    }
                  }}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden cursor-pointer"
                >
                  {WORKLOAD_SCORING_CRITERIA.map(c => (
                    <option key={c.id} value={c.name}>
                      {c.name} — {formatScore(c.score)} คะแนน ({c.group})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  คะแนนที่ได้รับ (แก้ไขได้)
                </label>
                <input
                  type="number"
                  step="0.25"
                  min="0"
                  max="10"
                  value={formData.workloadScore}
                  onChange={(e) => setFormData({ ...formData, workloadScore: Number(e.target.value) || 0 })}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Role & Hours & Status Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                บทบาทหน้าที่ตามคำสั่ง
              </label>
              <input
                type="text"
                value={formData.role}
                placeholder="เช่น กรรมการดำเนินงาน, วิทยากร"
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                จำนวนชั่วโมงภาระงาน
              </label>
              <input
                type="number"
                min={1}
                max={40}
                value={formData.workloadHours}
                onChange={(e) => setFormData({ ...formData, workloadHours: Number(e.target.value) || 3 })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                สถานะการปฏิบัติงาน
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-blue-500 outline-hidden"
              >
                <option value="upcoming">⏳ รอดำเนินการ (Upcoming)</option>
                <option value="done">✓ เสร็จสิ้นแล้ว (Completed)</option>
              </select>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Save className="w-3.5 h-3.5" />
              <span>บันทึกการแก้ไข</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
