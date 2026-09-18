import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Download, 
  Smartphone, 
  QrCode, 
  ExternalLink, 
  ShieldCheck, 
  Calendar, 
  Info,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  CheckCircle2
} from 'lucide-react';
import QRCode from 'qrcode';
import { 
  downloadICSFile, 
  getGoogleCalendarSubscribeUrl, 
  getWebcalUrl, 
  getIcalHttpUrl 
} from '../utils/icalGenerator';

export default function ICalModal({ isOpen, onClose, activeFaculty, orders, onNotify }) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [qrType, setQrType] = useState('webcal'); // 'webcal' | 'google'
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [isGeneratingQr, setIsGeneratingQr] = useState(true);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://uniworkload-ai.vercel.app';
  const facultyId = activeFaculty?.id || 'fac-1';
  const facultyName = activeFaculty?.name || 'อาจารย์';
  
  const icalUrl = getIcalHttpUrl(facultyId, origin);
  const webcalUrl = getWebcalUrl(facultyId, origin);
  const googleCalUrl = getGoogleCalendarSubscribeUrl(facultyId, origin);

  // Generate real dynamic QR code whenever qrType or urls change
  useEffect(() => {
    let isMounted = true;
    setIsGeneratingQr(true);

    const targetUrl = qrType === 'google' ? googleCalUrl : webcalUrl;

    QRCode.toDataURL(targetUrl, {
      width: 220,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setIsGeneratingQr(false);
        }
      })
      .catch((err) => {
        console.error('Failed to generate QR code', err);
        if (isMounted) setIsGeneratingQr(false);
      });

    return () => {
      isMounted = false;
    };
  }, [qrType, webcalUrl, googleCalUrl]);

  const handleCopy = () => {
    navigator.clipboard.writeText(icalUrl);
    setCopied(true);
    onNotify?.('คัดลอก iCalendar URL แล้ว! นำไปวางใน Google หรือ Apple Calendar ได้ทันที', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleOpenGoogleCalendar = () => {
    window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
    onNotify?.('เปิดหน้าสมัครรับ Google Calendar เรียบร้อย! กดปุ่ม "เพิ่ม" (Add) เพื่อเริ่มซิงค์อัตโนมัติ 🚀', 'success');
  };

  const handleDownload = () => {
    const facultyOrders = (orders || []).filter(o => 
      (o.facultyAssigned || []).some(f => f.id === facultyId) || o.facultyId === facultyId
    );
    downloadICSFile(facultyOrders, `uniworkload-${facultyId}.ics`, facultyId, origin);
    onNotify?.('ดาวน์โหลดไฟล์ .ics สำเร็จ! สามารถนำเข้าในคอมพิวเตอร์หรือโทรศัพท์ได้ทันที', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/45 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200/90 ring-1 ring-black/5 my-auto space-y-4">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-xs">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold mb-0.5">
                <Sparkles className="w-3 h-3 text-blue-600" />
                <span>Google & Apple Calendar 1-Click Sync</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 leading-snug">
                ซิงค์ปฏิทินภาระงานเข้า Google Calendar / สมาร์ตโฟน
              </h3>
              <p className="text-xs text-slate-500">
                สำหรับ: <strong className="text-slate-800">{facultyName}</strong> (RFC 5545 Live Feed)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Highlight Auto-Sync Banner */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200/80 text-emerald-950 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-bold text-emerald-900 flex items-center gap-1.5">
              <span>เพิ่มเพียง "ครั้งเดียวจบ" — อัปเดตงานใหม่อัตโนมัติ (Auto-Sync)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-emerald-200/70 text-emerald-800 font-semibold">ไม่ต้องกดเพิ่มซ้ำ</span>
            </div>
            <p className="text-emerald-800/90 text-[11px] leading-relaxed">
              เมื่อมีคำสั่งราชการใหม่ถูกสแกนหรือบันทึกเข้าระบบ UniWorkload AI กิจกรรมและวันเวลานัดหมายจะวิ่งเข้า Google Calendar / มือถือของท่านโดยอัตโนมัติ
            </p>
          </div>
        </div>

        {/* Hero Action Section: 1-Click Subscribe Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          
          {/* Card 1: Google Calendar 1-Click */}
          <div className="p-4 rounded-2xl border-2 border-blue-500/30 bg-blue-50/40 hover:bg-blue-50/70 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold shadow-2xs">
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>แนะนำมากที่สุด</span>
                </span>
                <span className="text-[10px] font-semibold text-blue-700 font-mono">1-Click</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                Google Calendar
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                คลิกเดียวเพื่อเปิด Google Calendar และกด <strong>"เพิ่ม" (Add)</strong> เพื่อสมัครรับปฏิทินทันที ไม่ต้องคัดลอกลิงก์
              </p>
            </div>

            <button
              onClick={handleOpenGoogleCalendar}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition-all cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>ซิงค์เข้า Google Calendar ทันที</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>

          {/* Card 2: Apple Calendar / Native Device (Webcal) */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-all flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  iPhone / iPad / Mac
                </span>
                <span className="text-[10px] font-semibold text-slate-500 font-mono">Webcal</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 mt-2">
                Apple / Device Calendar
              </h4>
              <p className="text-[11px] text-slate-600 leading-relaxed mt-1">
                เปิดแอปปฏิทินของเครื่องเพื่อกด <strong>"สมัครรับ" (Subscribe)</strong> อัปเดตแจ้งเตือนลงมือถืออัตโนมัติ
              </p>
            </div>

            <a
              href={webcalUrl}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md shadow-slate-900/15 transition-all cursor-pointer text-center"
            >
              <Smartphone className="w-4 h-4 text-emerald-400" />
              <span>เปิดในแอปปฏิทินของเครื่อง</span>
            </a>
          </div>

        </div>

        {/* 📱 Real Dynamic Scannable QR Code */}
        <div className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center gap-4">
          <div className="relative w-28 h-28 shrink-0 bg-slate-50 border border-slate-200 rounded-xl p-1.5 shadow-2xs flex items-center justify-center">
            {isGeneratingQr ? (
              <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
                <RefreshCw className="w-5 h-5 animate-spin mb-1 text-blue-500" />
                <span>สร้าง QR...</span>
              </div>
            ) : qrDataUrl ? (
              <img 
                src={qrDataUrl} 
                alt={`QR Code for ${qrType === 'google' ? 'Google Calendar' : 'Apple Calendar'} sync`} 
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <QrCode className="w-8 h-8 text-slate-300" />
            )}
          </div>

          <div className="flex-1 min-w-0 text-center sm:text-left space-y-1.5">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5 text-purple-600" />
                สแกนด้วยกล้องมือถือ
              </span>
              <div className="inline-flex p-0.5 bg-slate-100 rounded-lg border border-slate-200 text-[10px]">
                <button
                  type="button"
                  onClick={() => setQrType('webcal')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    qrType === 'webcal' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  iPhone / มือถือ
                </button>
                <button
                  type="button"
                  onClick={() => setQrType('google')}
                  className={`px-2 py-0.5 rounded-md font-semibold transition-all cursor-pointer ${
                    qrType === 'google' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Google Web
                </button>
              </div>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              เปิดแอปกล้องบน iPhone หรือ Android ส่องที่ QR Code นี้ เพื่อแตะเพิ่มปฏิทินภาระงานเข้าสู่เครื่องได้ทันที
            </p>
            <p className="text-[10px] text-slate-400">
              * ลิงก์ฟีด: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-600">{facultyId}.ics</code>
            </p>
          </div>
        </div>

        {/* 🔗 Direct Drawer Deep-Link Explanation */}
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50/70 border border-blue-200/80 text-blue-900 text-xs">
          <ExternalLink className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>ระบบ Google Calendar Deep-Link:</strong> ในทุกกิจกรรมบนปฏิทิน จะมีลิงก์ตรงกลับมายังตู้ลิ้นชักงานนี้ เมื่ออาจารย์แตะดูในมือถือ สามารถกดเปิดมาที่หน้าระบบและแนบภาพถ่ายหน้างานได้ทันที!
          </span>
        </div>

        {/* ⚙️ Advanced / Manual Options (Collapsible) */}
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-slate-500" />
              ตัวเลือกเพิ่มเติม: คัดลอก URL หรือดาวน์โหลดไฟล์ .ics
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4 text-slate-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {showAdvanced && (
            <div className="p-3.5 border-t border-slate-200 bg-white space-y-3 animate-in fade-in duration-150">
              
              {/* Copy URL */}
              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-slate-600">
                  URL ปฏิทิน iCal Feed ตรง:
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-700 select-all truncate">
                    {icalUrl}
                  </div>
                  <button
                    onClick={handleCopy}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs transition-all cursor-pointer shrink-0 ${
                      copied
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                    }`}
                  >
                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก'}</span>
                  </button>
                </div>
              </div>

              {/* Download .ics */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <div>
                  <div className="font-semibold text-slate-800 flex items-center gap-1">
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>ดาวน์โหลดไฟล์ .ics (Offline Import)</span>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    สำหรับนำเข้าไฟล์กิจกรรมทั้งหมดครั้งเดียวแบบออฟไลน์
                  </p>
                </div>
                <button
                  onClick={handleDownload}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-xs shadow-2xs transition-colors cursor-pointer"
                >
                  ดาวน์โหลด .ics
                </button>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
          <span className="text-[11px] flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            มาตรฐานความปลอดภัย RFC 5545
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
}
