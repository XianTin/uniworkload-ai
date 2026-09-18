import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Key, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle2, 
  Zap, 
  Server, 
  Cpu, 
  SlidersHorizontal,
  Layers,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { 
  getAiSettings, 
  saveAiSettings, 
  checkGeminiStatus, 
  AI_MODES 
} from '../utils/geminiClient';

// Predefined modern Gemini models
export const GEMINI_MODEL_PRESETS = [
  { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', tag: 'แนะนำ • รวดเร็วและฉลาดลึก', badge: 'Recommended' },
  { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash High', tag: 'ความฉลาดขั้นสูง • รุ่นล่าสุด', badge: 'Next-Gen' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'ความเร็วสูง • ประสิทธิภาพเด่น', badge: 'Fast' },
  { id: 'gemini-3.0-flash', name: 'Gemini 3.0 Flash', tag: 'เจเนอเรชัน 3.0 Flash', badge: 'Gen 3' },
  { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', tag: 'ฉลาดสูงสุด • วิเคราะห์เอกสารซับซ้อน', badge: 'Pro' },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'เจเนอเรชัน 2.0 • อเนกประสงค์', badge: 'Gen 2' },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', tag: 'เสถียร • โควตาฟรีกว้าง', badge: 'Stable' },
  { id: 'custom', name: 'กำหนดชื่อโมเดลเอง (Custom Model)', tag: 'ระบุรุ่นทดลองหรือรุ่นใหม่ล่าสุด...', badge: 'Custom' }
];

export default function AiSettingsModal({ isOpen, onClose, onNotify, onSaved }) {
  const [aiSettings, setAiSettings] = useState(() => getAiSettings());
  const [isCustomModel, setIsCustomModel] = useState(false);
  const [customModelName, setCustomModelName] = useState('');
  const [isTestingConn, setIsTestingConn] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({ online: false, message: '' });
  const [discoveredModels, setDiscoveredModels] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const current = getAiSettings();
      setAiSettings(current);
      
      const isPreset = GEMINI_MODEL_PRESETS.some(p => p.id !== 'custom' && p.id === current.model);
      if (!isPreset && current.model) {
        setIsCustomModel(true);
        setCustomModelName(current.model);
      } else {
        setIsCustomModel(false);
        setCustomModelName('');
      }

      // Initial quick status check
      checkGeminiStatus().then(res => {
        setConnectionStatus(res);
        if (res.modelsAvailable && res.modelsAvailable.length > 0) {
          setDiscoveredModels(res.modelsAvailable.filter(m => m.includes('gemini')));
        }
      }).catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const effectiveModel = isCustomModel && customModelName.trim() 
        ? customModelName.trim() 
        : aiSettings.model;
        
      // Temporarily save to test
      saveAiSettings({ ...aiSettings, model: effectiveModel });
      const res = await checkGeminiStatus();
      setConnectionStatus(res);
      if (res.modelsAvailable && res.modelsAvailable.length > 0) {
        const geminiMods = res.modelsAvailable.filter(m => m.includes('gemini'));
        setDiscoveredModels(geminiMods);
      }

      if (res.online) {
        if (onNotify) onNotify(`เชื่อมต่อสำเร็จ: ${res.message || 'พร้อมใช้งาน'}`, 'success');
      } else {
        if (onNotify) onNotify(res.message || 'ไม่สามารถเชื่อมต่อได้', 'error');
      }
    } catch (err) {
      setConnectionStatus({ online: false, message: 'เกิดข้อผิดพลาด: ' + err.message });
      if (onNotify) onNotify('ทดสอบไม่สำเร็จ: ' + err.message, 'error');
    } finally {
      setIsTestingConn(false);
    }
  };

  const handleSave = () => {
    const effectiveModel = isCustomModel && customModelName.trim()
      ? customModelName.trim()
      : (aiSettings.model || 'gemini-2.5-flash');

    const updated = {
      ...aiSettings,
      model: effectiveModel
    };

    saveAiSettings(updated);
    if (onSaved) onSaved(updated);
    if (onNotify) onNotify(`บันทึกการตั้งค่า AI สำเร็จ (โหมด: ${updated.mode === AI_MODES.GEMINI ? updated.model : 'Local Engine'})`, 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  ตั้งค่า AI Engine & โมเดลอัจฉริยะ
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                  v3.9.1
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                กำหนดสมองกลสำหรับ Nohran AI Copilot และการสกัดคำสั่งภาระงาน มรภ.นว.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-5 overflow-y-auto text-xs">
          {/* Engine Mode Selection */}
          <div className="space-y-2">
            <label className="font-semibold text-slate-800 block text-xs">
              เลือกโหมดการทำงานของระบบ AI:
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setAiSettings(prev => ({ ...prev, mode: AI_MODES.GEMINI }))}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  aiSettings.mode === AI_MODES.GEMINI
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 ring-2 ring-blue-100 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold">Google Gemini AI</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                  เชื่อมต่อ Gemini LLM ตอบคำถามฉลาดเป็นธรรมชาติ รองรับภาษาไทยสมบูรณ์แบบ
                </p>
              </button>

              <button
                type="button"
                onClick={() => setAiSettings(prev => ({ ...prev, mode: AI_MODES.LOCAL }))}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  aiSettings.mode === AI_MODES.LOCAL
                    ? 'border-blue-500 bg-blue-50/70 text-blue-950 ring-2 ring-blue-100 font-semibold shadow-xs'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Server className="w-4 h-4 text-slate-700" />
                  <span className="text-xs font-bold">Local Intelligence Engine</span>
                </div>
                <p className="text-[10.5px] text-slate-500 font-normal leading-relaxed">
                  ทำงานในเครื่อง 100% ไม่ต้องต่อเน็ต ใช้กฎและ Thai NLP กรองวันที่/หมวดภาระงาน
                </p>
              </button>
            </div>
          </div>

          {/* Gemini Configuration Section */}
          {aiSettings.mode === AI_MODES.GEMINI && (
            <div className="space-y-4 pt-3 border-t border-slate-100">
              {/* API Key Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Key className="w-3.5 h-3.5 text-blue-600" />
                    <span>Google Gemini API Key:</span>
                  </label>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <span>ขอรับ API Key ฟรี (Google AI Studio)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <input
                  type="password"
                  value={aiSettings.apiKey || ''}
                  onChange={(e) => setAiSettings(prev => ({ ...prev, apiKey: e.target.value.trim() }))}
                  placeholder="วางคีย์ AIzaSy... (หรือปล่อยว่างหากใช้ Serverless Secure Proxy)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-mono focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-hidden transition-all"
                />
                <div className="flex items-center justify-between text-[10.5px] text-slate-500">
                  <span>💡 ปลอดภัย: บันทึกเฉพาะในเบราว์เซอร์เครื่องคุณเท่านั้น</span>
                  {aiSettings.apiKey && (
                    <button
                      type="button"
                      onClick={() => setAiSettings(prev => ({ ...prev, apiKey: '' }))}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                    >
                      ล้างคีย์
                    </button>
                  )}
                </div>
              </div>

              {/* Model Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-800 flex items-center gap-1.5 text-xs">
                    <Cpu className="w-3.5 h-3.5 text-indigo-600" />
                    <span>เวอร์ชันโมเดล Gemini:</span>
                  </label>
                  <span className="text-[10px] text-slate-400">
                    เลือกโมเดลรุ่นใหม่ล่าสุดเพื่อการตอบที่ตรงและแม่นยำขึ้น
                  </span>
                </div>

                <select
                  value={isCustomModel ? 'custom' : (aiSettings.model || 'gemini-2.5-flash')}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === 'custom') {
                      setIsCustomModel(true);
                      if (!customModelName) setCustomModelName('gemini-2.5-flash');
                    } else {
                      setIsCustomModel(false);
                      setAiSettings(prev => ({ ...prev, model: val }));
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 font-medium focus:bg-white focus:border-blue-500 outline-hidden transition-all"
                >
                  {GEMINI_MODEL_PRESETS.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} — {preset.tag}
                    </option>
                  ))}

                  {/* Discovered models from API */}
                  {discoveredModels.length > 0 && (
                    <optgroup label="✨ โมเดลที่ตรวจพบบนบัญชีของคุณ">
                      {discoveredModels
                        .filter(m => !GEMINI_MODEL_PRESETS.some(p => p.id === m))
                        .map(m => (
                          <option key={m} value={m}>
                            {m} (ตรวจพบจาก Google API)
                          </option>
                        ))}
                    </optgroup>
                  )}
                </select>

                {/* Custom Model Text Input */}
                {isCustomModel && (
                  <div className="pt-1 animate-in fade-in slide-in-from-top-1 duration-150 space-y-1">
                    <input
                      type="text"
                      value={customModelName}
                      onChange={(e) => setCustomModelName(e.target.value.trim())}
                      placeholder="เช่น gemini-2.5-flash, gemini-3.0-flash, gemini-experimental"
                      className="w-full bg-white border border-indigo-300 rounded-xl px-3 py-2 text-xs font-mono text-indigo-950 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                    />
                    <p className="text-[10.5px] text-indigo-600">
                      พิมพ์รหัสโมเดลใดก็ได้ที่ Google Generative Language API รองรับ
                    </p>
                  </div>
                )}
              </div>

              {/* Connection Test Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-xs">สถานะการเชื่อมต่อ:</span>
                  <button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={isTestingConn}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3 h-3 ${isTestingConn ? 'animate-spin' : ''}`} />
                    <span>{isTestingConn ? 'กำลังทดสอบ...' : 'ทดสอบการเชื่อมต่อ'}</span>
                  </button>
                </div>

                <div className="text-[11.5px] flex items-start gap-2.5 pt-0.5">
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 mt-0.5 ${
                    connectionStatus.online ? 'bg-emerald-500 ring-4 ring-emerald-100' : 'bg-amber-500 ring-4 ring-amber-100'
                  }`} />
                  <div className="space-y-0.5 flex-1">
                    <p className={connectionStatus.online ? 'text-emerald-800 font-medium' : 'text-slate-700'}>
                      {connectionStatus.message || (connectionStatus.online ? 'เชื่อมต่อ Gemini สำเร็จ พร้อมใช้งาน' : 'ยังไม่ได้ระบุ API Key หรือยังไม่ได้เริ่มทดสอบ')}
                    </p>
                    {connectionStatus.endpoint && (
                      <p className="text-[10px] text-slate-400 font-mono">
                        Endpoint: {connectionStatus.endpoint} | Model: {connectionStatus.model || aiSettings.model}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 text-xs font-medium hover:bg-slate-100 transition-colors cursor-pointer"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>บันทึกการตั้งค่า</span>
          </button>
        </div>
      </div>
    </div>
  );
}
