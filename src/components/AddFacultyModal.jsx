import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Sparkles, 
  GraduationCap, 
  Building2, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  FolderPlus,
  ShieldCheck,
  Zap
} from 'lucide-react';

const PRESET_NEW_FACULTIES = [
  {
    prefix: 'ผศ.ดร.',
    firstName: 'กฤษณะ',
    lastName: 'มีสุข',
    role: 'อาจารย์ประจำหลักสูตรวิทยาการคอมพิวเตอร์',
    department: 'สาขาวิชาวิทยาการคอมพิวเตอร์',
    faculty: 'คณะวิทยาการจัดการ',
    email: 'kritsana.m@nsru.ac.th',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'ผศ.',
    firstName: 'พิมพ์ชนก',
    lastName: 'สุวรรณเวช',
    role: 'อาจารย์ประจำหลักสูตรการตลาดดิจิทัล',
    department: 'สาขาวิชาการตลาด',
    faculty: 'คณะวิทยาการจัดการ',
    email: 'pimchanok.s@nsru.ac.th',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    prefix: 'อ.',
    firstName: 'ธีรภัทร',
    lastName: 'วัฒนศิลป์',
    role: 'อาจารย์ประจำหลักสูตรนวัตกรรมดิจิทัล',
    department: 'สาขาวิชาเทคโนโลยีสารสนเทศ',
    faculty: 'คณะวิทยาการจัดการ',
    email: 'theeraphat.w@nsru.ac.th',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
  }
];

export default function AddFacultyModal({ isOpen, onClose, onAddFaculty, onNotify }) {
  if (!isOpen) return null;

  const [prefix, setPrefix] = useState('อ.');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [department, setDepartment] = useState('สาขาวิชาเทคโนโลยีสารสนเทศ');
  const [role, setRole] = useState('อาจารย์ประจำหลักสูตร');
  const [faculty, setFaculty] = useState('คณะวิทยาการจัดการ');
  const [email, setEmail] = useState('');
  const [addSampleOrder, setAddSampleOrder] = useState(true);

  // Quick preset loader
  const handleApplyPreset = (preset) => {
    setPrefix(preset.prefix);
    setFirstName(preset.firstName);
    setLastName(preset.lastName);
    setDepartment(preset.department);
    setRole(preset.role);
    setFaculty(preset.faculty);
    setEmail(preset.email);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      onNotify('กรุณาระบุชื่อและนามสกุลอาจารย์', 'error');
      return;
    }

    const fullName = `${prefix}${firstName.trim()} ${lastName.trim()}`;
    const cleanEmail = email.trim() || `${firstName.toLowerCase()}.${lastName.slice(0, 1).toLowerCase()}@nsru.ac.th`;
    const newId = `fac-${Date.now().toString().slice(-5)}`;
    const icalFeedUrl = `webcal://uniworkload.nsru.ac.th/api/v1/ical/${firstName.toLowerCase()}-${newId.slice(-4)}.ics`;

    const newFacultyObj = {
      id: newId,
      name: fullName,
      role: role.trim() || `อาจารย์ประจำ${department}`,
      department: department.trim(),
      faculty: faculty.trim(),
      email: cleanEmail,
      avatar: `https://images.unsplash.com/photo-${1535713875000 + Math.floor(Math.random() * 5000)}?w=150&auto=format&fit=crop&q=80`,
      icalFeedUrl: icalFeedUrl,
      stats: {
        totalOrders: addSampleOrder ? 1 : 0,
        completedOrders: 0,
        pendingOrders: addSampleOrder ? 1 : 0,
        totalHours: addSampleOrder ? 6.0 : 0.0,
        evidenceReadyPct: 0
      }
    };

    onAddFaculty(newFacultyObj, addSampleOrder);
    onNotify(`ลงทะเบียน "${fullName}" เข้าสู่ระบบเรียบร้อยแล้ว!`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200/90 ring-1 ring-black/5 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <UserPlus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                เพิ่มอาจารย์ / บุคลากรท่านใหม่
              </h3>
              <p className="text-xs text-slate-500">
                ระบบจะสร้างตู้ลิ้นชัก ปฏิทิน iCal Feed และบรรจุเข้า AI Name Matcher ทันที
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Presets (1-Click Test) */}
        <div className="bg-sky-50/80 rounded-xl p-3 border border-sky-100">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-800 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>ปุ่มลัดสุ่มข้อมูลอาจารย์ตัวอย่าง (คลิกเดียวเพื่อทดสอบ):</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_NEW_FACULTIES.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className="text-[11px] bg-white hover:bg-sky-100 text-sky-700 font-medium px-2.5 py-1 rounded-lg border border-sky-200 transition-all shadow-2xs hover:shadow-xs cursor-pointer flex items-center gap-1"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span>{p.prefix}{p.firstName} {p.lastName}</span>
                <span className="text-[10px] text-slate-400">({p.department.replace('สาขาวิชา', '')})</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row: Prefix & Name */}
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-4 sm:col-span-3">
              <label className="block font-medium text-slate-700 mb-1">คำนำหน้า / วุฒิ</label>
              <select
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-2.5 py-2 bg-slate-50 text-slate-800 font-medium focus:ring-2 focus:ring-sky-500 focus:outline-none"
              >
                <option value="อ.">อ.</option>
                <option value="ดร.">ดร.</option>
                <option value="ผศ.">ผศ.</option>
                <option value="ผศ.ดร.">ผศ.ดร.</option>
                <option value="รศ.">รศ.</option>
                <option value="รศ.ดร.">รศ.ดร.</option>
                <option value="ศ.">ศ.</option>
                <option value="ศ.ดร.">ศ.ดร.</option>
              </select>
            </div>
            <div className="col-span-8 sm:col-span-4">
              <label className="block font-medium text-slate-700 mb-1">ชื่อจริง *</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="เช่น กฤษณะ"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div className="col-span-12 sm:col-span-5">
              <label className="block font-medium text-slate-700 mb-1">นามสกุล *</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="เช่น มีสุข"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row: Department & Faculty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">สาขาวิชา / หลักสูตร</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="เช่น สาขาวิชาเทคโนโลยีสารสนเทศ"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">คณะสังกัด</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
                placeholder="เช่น คณะวิทยาการจัดการ"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row: Email & Position Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">อีเมลสถาบัน (@nsru.ac.th)</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="เช่น firstname.l@nsru.ac.th"
                  className="w-full border border-slate-300 rounded-lg pl-8 pr-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">ตำแหน่งหน้าที่</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="เช่น อาจารย์ประจำหลักสูตร"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          {/* System Auto-Provisioning Features */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <span className="font-semibold text-slate-700 block">สิ่งที่จะเกิดขึ้นโดยอัตโนมัติ (Automated Provisioning):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>เปิดตู้ลิ้นชักภาระงานส่วนตัว (Personal Drawer)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>สร้าง URL ปฏิทิน iCal Feed (RFC 5545)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>บรรจุชื่อเข้าสู่ AI OCR Entity Matcher</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>เชื่อมต่อกับแชทบอท โนห์รัน AI Copilot</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 mt-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={addSampleOrder}
                  onChange={(e) => setAddSampleOrder(e.target.checked)}
                  className="rounded text-sky-600 focus:ring-sky-500 h-3.5 w-3.5"
                />
                <span className="text-[11px] text-slate-700 font-medium">
                  สร้างคำสั่งทดสอบเบื้องต้น (1 รายการ) เข้าตู้ลิ้นชักอาจารย์ทันที เพื่อความพร้อมในการสาธิต
                </span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-semibold shadow-md shadow-sky-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>ลงทะเบียนอาจารย์ใหม่</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
