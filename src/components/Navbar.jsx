import React from 'react';
import { 
  Calendar, 
  Layers, 
  Sparkles, 
  FileText, 
  LayoutDashboard, 
  Smartphone, 
  PlusCircle, 
  UserCheck, 
  Building2,
  ChevronDown
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  activeFaculty, 
  setActiveFaculty, 
  facultyList, 
  userRole, 
  setUserRole, 
  onOpenIngest, 
  onOpenIcal,
  onOpenChatbot 
}) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Banner with University Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-sky-950 text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Building2 className="w-3.5 h-3.5 text-sky-400" />
          <span className="font-medium text-slate-200">
            คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)
          </span>
          <span className="text-slate-500">|</span>
          <span className="text-sky-300 font-mono text-[11px]">
            โครงงานพัฒนาระบบปฏิทินงานและจัดเก็บข้อมูลอัจฉริยะ (Senior Capstone)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>สถานะระบบ: AI OCR & Sync พร้อมใช้งาน</span>
          </div>
          <button 
            onClick={() => setUserRole(userRole === 'faculty' ? 'admin' : 'faculty')}
            className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-200 transition-colors cursor-pointer"
          >
            สลับโหมด: {userRole === 'faculty' ? 'มุมมองอาจารย์ผู้สอน' : 'มุมมองเจ้าหน้าที่ธุรการคณะ'}
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Calendar className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-slate-900 tracking-tight font-sans">UniWorkload</span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white font-semibold">
                  AI v2.0
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                ระบบปฏิทินภาระงานและจัดเก็บหลักฐานอัจฉริยะ
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="flex space-x-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>แดชบอร์ด</span>
            </button>

            <button
              onClick={() => setActiveTab('ingestion')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'ingestion'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-sky-500" />
              <span>นำเข้า & สกัด AI</span>
            </button>

            <button
              onClick={() => setActiveTab('drawer')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'drawer'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>ตู้ลิ้นชักหลักฐาน</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>ปฏิทินงาน</span>
            </button>

            <button
              onClick={() => setActiveTab('eportfolio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'eportfolio'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>e-Portfolio Copilot</span>
            </button>
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {/* Nohran AI Copilot button */}
            <button
              onClick={onOpenChatbot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-700/10 via-indigo-600/10 to-blue-600/10 hover:from-purple-700/20 hover:to-blue-600/20 text-purple-700 border border-purple-200 hover:border-purple-300 transition-all cursor-pointer shadow-2xs"
              title="เปิดผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">ถามโนห์รัน AI</span>
            </button>

            {/* Quick iCal button */}
            <button
              onClick={onOpenIcal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-sky-50 text-sky-700 border border-sky-200 hover:bg-sky-100 transition-colors cursor-pointer"
              title="ซิงค์ปฏิทินเข้า Google / Apple Calendar"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>ซิงค์มือถือ</span>
            </button>

            {/* Quick Ingest Button */}
            <button
              onClick={onOpenIngest}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-xs hover:from-blue-700 hover:to-sky-700 transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>อัปโหลดคำสั่ง</span>
            </button>

            {/* Profile / Faculty Picker */}
            <div className="relative border-l border-slate-200 pl-3">
              <div className="flex items-center gap-2">
                <img
                  src={activeFaculty.avatar}
                  alt={activeFaculty.name}
                  className="w-8 h-8 rounded-full ring-2 ring-blue-500/30 object-cover"
                />
                <div className="hidden lg:block text-left">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-slate-800 leading-tight">
                      {activeFaculty.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {activeFaculty.role.split(' ')[0]}
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={activeFaculty.id}
                    onChange={(e) => {
                      const found = facultyList.find(f => f.id === e.target.value);
                      if (found) setActiveFaculty(found);
                    }}
                    aria-label="เลือกอาจารย์ผู้ใช้งาน"
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  >
                    {facultyList.map(f => (
                      <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
