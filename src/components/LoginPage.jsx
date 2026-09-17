import React, { useState } from 'react';
import { 
  Calendar, 
  Lock, 
  User, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Sparkles, 
  Building2, 
  AlertCircle,
  Shield,
  Layers,
  FileCheck,
  Crown,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { authenticateUser, DEMO_PRESET_ACCOUNTS } from '../utils/auth';

export default function LoginPage({ onLoginSuccess, facultyList }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    const cleanId = (identifier || '').trim();
    const cleanPass = (password || '').trim();

    if (!cleanId || !cleanPass) {
      setErrorMsg('กรุณากรอกชื่อผู้ใช้และรหัสผ่านให้ครบถ้วน');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const result = authenticateUser(cleanId, cleanPass, facultyList);
      setIsLoading(false);

      if (result.success) {
        onLoginSuccess(result.user, rememberMe);
      } else {
        setErrorMsg(result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง');
      }
    }, 450);
  };

  const handleSelectPreset = (preset, autoSubmit = true) => {
    setIdentifier(preset.username);
    setPassword(preset.passwordHint);
    setErrorMsg(null);

    if (autoSubmit) {
      setIsLoading(true);
      setTimeout(() => {
        const result = authenticateUser(preset.username, preset.passwordHint, facultyList);
        setIsLoading(false);
        if (result.success) {
          onLoginSuccess(result.user, rememberMe);
        } else {
          setErrorMsg(result.error || 'เข้าสู่ระบบไม่สำเร็จ');
        }
      }, 350);
    }
  };

  const handleGuestLogin = () => {
    const guestUser = {
      id: 'user-guest',
      username: 'guest',
      email: 'guest@nsru.ac.th',
      name: 'ผู้เยี่ยมชมระบบ (Guest Preview)',
      role: 'guest',
      roleLabel: 'ผู้เยี่ยมชมระบบ (Guest)',
      department: 'สาขาวิชาเทคโนโลยีสารสนเทศ',
      faculty: 'คณะวิทยาการจัดการ',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      facultyId: 'fac-1',
      isSuperAdmin: false,
      isCoAdmin: false,
      canSwitchFaculty: true,
      permissions: ['view_own_drawer', 'view_all_drawers']
    };
    onLoginSuccess(guestUser, false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 text-slate-100 selection:bg-sky-500 selection:text-white relative overflow-hidden">
      {/* Dynamic Background Ambient Glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none animate-pulse-subtle"></div>
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top University Branding Bar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur-md px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="text-xs sm:text-sm font-medium text-slate-200">
              มหาวิทยาลัยราชภัฏนครสวรรค์ (NSRU)
            </span>
            <span className="text-slate-600 hidden md:inline">|</span>
            <span className="text-xs text-slate-400 hidden md:inline">
              คณะวิทยาการจัดการ & คณะวิทยาศาสตร์และเทคโนโลยี
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>ระบบความปลอดภัยเข้มงวด (Protected)</span>
            </span>
          </div>
        </div>
      </header>

      {/* Main Authentication Section */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Hero / System Highlights (Visible on desktop) */}
          <div className="lg:col-span-6 space-y-6 text-left hidden lg:block">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-xs font-semibold text-sky-300">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>UniWorkload AI Portal v3.7.0</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                ระบบปฏิทินภาระงาน <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-300 to-indigo-300">
                  และจัดเก็บหลักฐานอัจฉริยะ
                </span>
              </h1>
              <p className="text-sm text-slate-300 leading-relaxed">
                ยกระดับการบริหารคำสั่งราชการสู่ตู้ลิ้นชักภาระงานส่วนบุคคล สกัดด้วย AI Gemini Dual-Engine ซิงค์ Google Calendar แบบสองทาง และจัดทำ e-Portfolio พร้อมรับการประเมิน
              </p>
            </div>

            {/* Feature Badges */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>ระบบความปลอดภัยสถาบัน</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  ควบคุมสิทธิ์การเข้าถึงข้อมูลตามบทบาทหน้าที่ (Role-Based Access Control)
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-1">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Calendar className="w-4 h-4" />
                  <span>Google Calendar Deep-Link</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  ซิงค์ภาระงานและเข้าถึงตู้ลิ้นชักคำสั่งโดยตรงได้อย่างแม่นยำ
                </p>
              </div>
            </div>

            {/* Identity / Assurance Box */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 to-slate-900/50 border border-blue-500/20 text-xs text-slate-300 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-600/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0">
                <Building2 className="w-4 h-4 text-sky-400" />
              </div>
              <p className="text-xs text-slate-300">
                มหาวิทยาลัยราชภัฏนครสวรรค์ — ระบบบริหารจัดการภาระงานและหลักฐานอิเล็กทรอนิกส์
              </p>
            </div>
          </div>

          {/* Right Card: Login Card */}
          <div className="lg:col-span-6 w-full">
            <div className="bg-slate-900/85 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/60 relative">
              
              {/* Card Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center text-white shadow-lg shadow-sky-500/30">
                    <Calendar className="w-6 h-6 text-white stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>ลงชื่อเข้าใช้งาน</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-300 font-semibold border border-blue-500/30">
                        NSRU SSO
                      </span>
                    </h2>
                    <p className="text-xs text-slate-400">
                      ระบบยืนยันตัวตน UniWorkload AI
                    </p>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-mono text-slate-400">Secure Access</span>
                </div>
              </div>

              {/* Error Alert Box */}
              {errorMsg && (
                <div className="mb-5 p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-start gap-2.5 text-xs text-rose-200 animate-in fade-in slide-in-from-top-2 duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold block mb-0.5">เข้าสู่ระบบไม่สำเร็จ</span>
                    <span>{errorMsg}</span>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username/Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    ชื่อผู้ใช้ หรือ อีเมลสถาบัน (@nsru.ac.th)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder="ระบุชื่อผู้ใช้ หรือ อีเมล"
                      required
                      autoComplete="username"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    รหัสผ่าน (Password)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="ระบุรหัสผ่านเข้าใช้งาน"
                      required
                      autoComplete="current-password"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/60 border border-slate-700/80 text-white placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                      title={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>จดจำการเข้าสู่ระบบบนเครื่องนี้</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full mt-2 py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-sky-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-70"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>กำลังตรวจสอบสิทธิ์ความปลอดภัย...</span>
                    </>
                  ) : (
                    <>
                      <span>เข้าสู่ระบบ (Sign In)</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Demo Access & Testing Profiles (Collapsible) */}
              <div className="mt-5 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-sky-300 transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>⚡ เข้าใช้งานด่วนสำหรับการทดสอบ (1-Click Demo)</span>
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400 font-normal">
                    <span>{showDemoAccounts ? 'ซ่อน' : 'แสดงบัญชี'}</span>
                    {showDemoAccounts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </button>

                {showDemoAccounts && (
                  <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <p className="text-[10px] text-slate-400 px-1">
                      คลิกเพื่อทดสอบระบบตามบทบาทหน้าที่ได้ทันที (จำลองการสาธิต):
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {DEMO_PRESET_ACCOUNTS.map((preset) => {
                        const isSuper = preset.username === 'admin';
                        const isCo = preset.username === 'pimmy';

                        return (
                          <button
                            key={preset.username}
                            type="button"
                            onClick={() => handleSelectPreset(preset, true)}
                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2.5 group ${
                              isSuper 
                                ? 'bg-amber-950/25 hover:bg-amber-900/40 border-amber-500/30 hover:border-amber-400/50'
                                : isCo
                                ? 'bg-purple-950/25 hover:bg-purple-900/40 border-purple-500/30 hover:border-purple-400/50'
                                : 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20'
                            }`}
                          >
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                              isSuper ? 'bg-amber-500/20 text-amber-300' : isCo ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-sky-300'
                            }`}>
                              {isSuper ? <Crown className="w-4 h-4 text-amber-400" /> : <User className="w-3.5 h-3.5" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <span className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                                  {preset.label}
                                </span>
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-slate-300 shrink-0">
                                  {preset.passwordHint}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                {preset.sublabel}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* Guest Direct Entry */}
                    <button
                      type="button"
                      onClick={handleGuestLogin}
                      className="w-full mt-2 py-2 px-3 rounded-xl bg-sky-950/40 hover:bg-sky-900/50 border border-sky-500/20 text-xs text-sky-200 flex items-center justify-center gap-1.5 transition-colors cursor-pointer font-medium"
                    >
                      <span>เข้าชมในโหมดผู้เยี่ยมชมชั่วคราว (Guest Preview Mode)</span>
                      <ExternalLink className="w-3 h-3 text-sky-400" />
                    </button>
                  </div>
                )}
              </div>

              {/* Institutional Security Notice */}
              <div className="mt-6 pt-5 border-t border-white/10 space-y-2 text-center text-[11px] text-slate-400">
                <div className="flex items-center justify-center gap-1.5 text-slate-400">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  <span>ระบบความปลอดภัยสารสนเทศสถาบัน (Institutional Security)</span>
                </div>
                <p className="text-slate-500 leading-relaxed">
                  สงวนสิทธิ์การเข้าใช้งานเฉพาะบุคลากรและอาจารย์ที่ได้รับอนุญาตเท่านั้น หากมีข้อสงสัยโปรดติดต่อฝ่ายสารสนเทศ
                </p>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer System Status */}
      <footer className="relative z-10 border-t border-white/10 bg-slate-950/70 backdrop-blur-md px-4 py-3 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[11px]">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span>ระบบรักษาความปลอดภัยสารสนเทศตามมาตรฐานสถาบันอุดมศึกษา มรภ.นครสวรรค์</span>
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Auth Engine: RBAC Multi-Tier
          </div>
        </div>
      </footer>
    </div>
  );
}
