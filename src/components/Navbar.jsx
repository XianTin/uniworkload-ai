import React, { useState, useRef, useEffect } from 'react';
import { 
  Calendar, 
  Layers, 
  Sparkles, 
  FileText, 
  LayoutDashboard, 
  Smartphone, 
  PlusCircle, 
  Building2,
  ChevronDown,
  UserPlus,
  Check,
  UserCheck,
  RefreshCw,
  X
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
  onOpenChatbot,
  onOpenAddFaculty 
}) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Banner with University Identity */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white text-xs px-4 py-1.5 flex justify-between items-center">
        <div className="flex items-center gap-2 truncate">
          <Building2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span className="font-medium text-slate-200 truncate">
            คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-sky-300/90 font-mono text-[11px] hidden md:inline">
            UniWorkload AI Capstone Project
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>ระบบออนไลน์</span>
          </div>
          <button 
            onClick={() => setUserRole(userRole === 'faculty' ? 'admin' : 'faculty')}
            className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-200 transition-colors cursor-pointer flex items-center gap-1"
            title="สลับมุมมองอาจารย์ / ธุรการ"
          >
            <RefreshCw className="w-3 h-3 text-sky-300" />
            <span className="hidden sm:inline">โหมด:</span>
            <span>{userRole === 'faculty' ? 'อาจารย์ผู้สอน' : 'ธุรการคณะ'}</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & Title */}
          <div 
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-sky-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Calendar className="w-5 h-5 text-white stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-sans">
                  UniWorkload
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-gradient-to-r from-sky-500 to-blue-600 text-white font-bold">
                  AI v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-500 hidden xl:block -mt-0.5">
                ระบบปฏิทินภาระงานและจัดเก็บหลักฐานอัจฉริยะ
              </p>
            </div>
          </div>

          {/* Center Tabs Navigation */}
          <nav className="hidden md:flex space-x-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
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
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
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
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-indigo-500" />
              <span>ตู้ลิ้นชักหลักฐาน</span>
            </button>

            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'calendar'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-emerald-500" />
              <span>ปฏิทินงาน</span>
            </button>

            <button
              onClick={() => setActiveTab('eportfolio')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'eportfolio'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>e-Portfolio</span>
            </button>
          </nav>

          {/* Right Action Area - Clean & Well Grouped */}
          <div className="flex items-center gap-2">
            {/* Nohran AI Copilot Button */}
            <button
              onClick={onOpenChatbot}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 hover:from-purple-100 hover:to-blue-100 text-purple-700 border border-purple-200 hover:border-purple-300 transition-all cursor-pointer shadow-2xs active:scale-95"
              title="เปิดผู้ช่วยอัจฉริยะ โนห์รัน (Nohran AI Copilot)"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span className="hidden sm:inline">ถามโนห์รัน AI</span>
            </button>

            {/* Upload Order Button (Primary) */}
            <button
              onClick={onOpenIngest}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">อัปโหลดคำสั่ง</span>
            </button>

            {/* Unified Faculty Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-2 p-1.5 pl-2 rounded-xl border transition-all cursor-pointer ${
                  isProfileMenuOpen 
                    ? 'bg-slate-100 border-slate-300 ring-2 ring-blue-500/20' 
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
                title="จัดการโปรไฟล์และอาจารย์"
              >
                <img
                  src={activeFaculty?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                  alt={activeFaculty?.name || 'อาจารย์'}
                  className="w-7 h-7 rounded-lg ring-1 ring-slate-300 object-cover"
                />
                <div className="hidden lg:block text-left pr-1">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
                    {activeFaculty?.name || 'อาจารย์'}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight truncate max-w-[120px]">
                    {activeFaculty?.department ? activeFaculty.department.replace('สาขาวิชา', '') : 'มรภ.นว.'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* Current Faculty Info */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      กำลังใช้งานในนาม
                    </span>
                    <div className="flex items-center gap-2.5">
                      <img
                        src={activeFaculty?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                        alt={activeFaculty?.name || 'อาจารย์'}
                        className="w-9 h-9 rounded-xl ring-2 ring-blue-500/30 object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {activeFaculty?.name || 'อาจารย์'}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate">
                          {activeFaculty?.role || 'อาจารย์ประจำสาขา'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Switch Faculty Section */}
                  <div className="px-2 py-2 border-b border-slate-100">
                    <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      สลับอาจารย์ผู้ใช้งาน ({facultyList.length} ท่าน)
                    </span>
                    <div className="max-h-40 overflow-y-auto space-y-0.5">
                      {facultyList.map((faculty) => {
                        const isSelected = faculty.id === activeFaculty?.id;
                        return (
                          <button
                            key={faculty.id}
                            onClick={() => {
                              setActiveFaculty(faculty);
                              setIsProfileMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs text-left transition-colors cursor-pointer ${
                              isSelected 
                                ? 'bg-blue-50 text-blue-700 font-semibold' 
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <img
                                src={faculty.avatar}
                                alt={faculty.name}
                                className="w-5 h-5 rounded-full object-cover shrink-0"
                              />
                              <span className="truncate">{faculty.name}</span>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Action Shortcuts */}
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenAddFaculty();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-sky-700 hover:bg-sky-50 transition-colors cursor-pointer"
                    >
                      <UserPlus className="w-4 h-4 text-sky-600" />
                      <span>+ เพิ่มอาจารย์ท่านใหม่</span>
                    </button>

                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        onOpenIcal();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <Smartphone className="w-4 h-4 text-slate-500" />
                      <span>ซิงค์ปฏิทินมือถือ (iCal Feed)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Bar (visible only on small screens) */}
        <div className="flex md:hidden overflow-x-auto no-scrollbar py-2 border-t border-slate-100 space-x-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-3 py-1 rounded-lg text-xs shrink-0 font-medium ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            แดชบอร์ด
          </button>
          <button
            onClick={() => setActiveTab('ingestion')}
            className={`px-3 py-1 rounded-lg text-xs shrink-0 font-medium ${
              activeTab === 'ingestion' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            นำเข้า & สกัด AI
          </button>
          <button
            onClick={() => setActiveTab('drawer')}
            className={`px-3 py-1 rounded-lg text-xs shrink-0 font-medium ${
              activeTab === 'drawer' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            ตู้ลิ้นชักหลักฐาน
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`px-3 py-1 rounded-lg text-xs shrink-0 font-medium ${
              activeTab === 'calendar' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            ปฏิทินงาน
          </button>
          <button
            onClick={() => setActiveTab('eportfolio')}
            className={`px-3 py-1 rounded-lg text-xs shrink-0 font-medium ${
              activeTab === 'eportfolio' ? 'bg-blue-600 text-white' : 'text-slate-600 bg-slate-100'
            }`}
          >
            e-Portfolio
          </button>
        </div>
      </div>
    </header>
  );
}
