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
  X,
  LogOut,
  Crown,
  ShieldCheck,
  User
} from 'lucide-react';
import { canViewAllFaculties } from '../utils/auth';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  activeFaculty, 
  setActiveFaculty, 
  facultyList, 
  userRole, 
  setUserRole, 
  currentUser,
  orders = [],
  onLogout,
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

  const isSuperAdmin = currentUser?.isSuperAdmin || currentUser?.role === 'superadmin';
  const isCoAdmin = currentUser?.isCoAdmin || currentUser?.role === 'coadmin';
  const canSwitchFaculty = canViewAllFaculties(currentUser);

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

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Super Admin / Co-Admin Badge or Status */}
          {isSuperAdmin ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] sm:text-[11px] font-bold tracking-wide">
              <Crown className="w-3 h-3 text-amber-400 shrink-0" />
              <span>👑 Super Admin (tie)</span>
            </div>
          ) : isCoAdmin ? (
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] sm:text-[11px] font-bold tracking-wide">
              <ShieldCheck className="w-3 h-3 text-purple-300 shrink-0" />
              <span>🛡️ Co-Admin (Pimmy)</span>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ระบบออนไลน์</span>
            </div>
          )}

          {/* Switch View Mode button (Super Admin & Co-Admin) */}
          {canSwitchFaculty && (
            <button 
              onClick={() => setUserRole(userRole === 'faculty' ? 'admin' : 'faculty')}
              className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-sky-200 transition-colors cursor-pointer flex items-center gap-1"
              title="สลับมุมมองอาจารย์ / ธุรการ"
            >
              <RefreshCw className="w-3 h-3 text-sky-300" />
              <span className="hidden sm:inline">โหมด:</span>
              <span>{userRole === 'faculty' ? 'อาจารย์ผู้สอน' : 'ธุรการคณะ'}</span>
            </button>
          )}
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
                  AI v3.8.0
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

            {/* Unified Faculty / User Profile Menu */}
            <div className="relative" ref={profileMenuRef}>
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className={`flex items-center gap-2 p-1.5 pl-2 rounded-xl border transition-all cursor-pointer ${
                  isProfileMenuOpen 
                    ? 'bg-slate-100 border-slate-300 ring-2 ring-blue-500/20' 
                    : isSuperAdmin
                    ? 'bg-amber-50/50 hover:bg-amber-100/50 border-amber-300/80 ring-1 ring-amber-400/30'
                    : isCoAdmin
                    ? 'bg-purple-50/50 hover:bg-purple-100/50 border-purple-300/80 ring-1 ring-purple-400/30'
                    : 'bg-white hover:bg-slate-50 border-slate-200'
                }`}
                title="จัดการโปรไฟล์และบัญชีผู้ใช้งาน"
              >
                <div className="relative">
                  <img
                    src={currentUser?.avatar || activeFaculty?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                    alt={currentUser?.name || activeFaculty?.name || 'โปรไฟล์'}
                    className="w-7 h-7 rounded-lg ring-1 ring-slate-300 object-cover"
                  />
                  {isSuperAdmin ? (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] shadow-xs">
                      👑
                    </span>
                  ) : isCoAdmin ? (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center text-[9px] shadow-xs">
                      🛡️
                    </span>
                  ) : null}
                </div>
                
                <div className="hidden lg:block text-left pr-1">
                  <span className="text-xs font-semibold text-slate-800 block leading-tight truncate max-w-[120px]">
                    {currentUser?.name || activeFaculty?.name || 'อาจารย์'}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight truncate max-w-[120px]">
                    {isSuperAdmin ? '👑 Super Admin' : isCoAdmin ? '🛡️ Co-Admin' : (activeFaculty?.department ? activeFaculty.department.replace('สาขาวิชา', '') : 'มรภ.นว.')}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Popover */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  
                  {/* Logged in Account Info */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/80">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        บัญชีที่เข้าสู่ระบบ
                      </span>
                      {isSuperAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          <Crown className="w-3 h-3 text-amber-600" />
                          <span>Super Admin</span>
                        </span>
                      ) : isCoAdmin ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-300">
                          <ShieldCheck className="w-3 h-3 text-purple-600" />
                          <span>รองผู้ดูแลระบบ (Co-Admin)</span>
                        </span>
                      ) : null}
                    </div>
                    
                    <div className="flex items-center gap-2.5">
                      <img
                        src={currentUser?.avatar || activeFaculty?.avatar}
                        alt="User"
                        className="w-9 h-9 rounded-xl ring-2 ring-blue-500/30 object-cover"
                      />
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {currentUser?.name || activeFaculty?.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate font-mono">
                          {currentUser?.email || activeFaculty?.email}
                        </p>
                      </div>
                    </div>

                    {isSuperAdmin ? (
                      <div className="mt-2.5 p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-900 flex items-start gap-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                        <span>คุณมีสิทธิ์เข้าถึงและควบคุมตู้ลิ้นชักของอาจารย์ทุกคนในระบบ (สิทธิ์สูงสุด)</span>
                      </div>
                    ) : isCoAdmin ? (
                      <div className="mt-2.5 p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-900 flex items-start gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
                        <span>คุณมีสิทธิ์เข้าถึงและตรวจสอบตู้ลิ้นชักของอาจารย์ทุกคนในระบบ (สิทธิ์ระดับบริหาร)</span>
                      </div>
                    ) : null}
                  </div>

                  {/* Switch Active Faculty View (Super Admin & Co-Admin) */}
                  {canSwitchFaculty && (
                    <div className="px-2 py-2 border-b border-slate-100">
                      <span className="px-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                        สลับดูตู้ลิ้นชักอาจารย์ {isSuperAdmin ? '(Super Admin)' : '(Co-Admin)'}
                      </span>
                      <div className="max-h-44 overflow-y-auto space-y-0.5">
                        {facultyList.map((faculty) => {
                          const isSelected = faculty.id === activeFaculty?.id;
                          const facOrdersCount = (orders || []).filter(o => 
                            (o.facultyAssigned || []).some(f => f.id === faculty.id) || o.facultyId === faculty.id
                          ).length;

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
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                                  facOrdersCount > 0 
                                    ? 'bg-blue-100 text-blue-700 font-bold' 
                                    : 'bg-slate-100 text-slate-400'
                                }`}>
                                  {facOrdersCount} งาน
                                </span>
                                {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Action Shortcuts */}
                  <div className="p-2 space-y-1">
                    {canSwitchFaculty && (
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
                    )}

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

                    {/* Sign Out Button */}
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>ออกจากระบบ (Sign Out)</span>
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
