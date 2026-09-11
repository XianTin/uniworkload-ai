import React, { useState } from 'react';
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
  Info 
} from 'lucide-react';
import { downloadICSFile } from '../utils/icalGenerator';

export default function ICalModal({ isOpen, onClose, activeFaculty, orders, onNotify }) {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);
  const icalUrl = activeFaculty.icalFeedUrl || `webcal://uniworkload.nsru.ac.th/api/v1/ical/${activeFaculty.id}.ics`;

  const handleCopy = () => {
    navigator.clipboard.writeText(icalUrl);
    setCopied(true);
    onNotify('คัดลอก iCalendar URL แล้ว! สามารถนำไป Subscribe ใน Google/Apple Calendar ได้ทันที', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const facultyOrders = orders.filter(o => o.facultyAssigned.some(f => f.id === activeFaculty.id));
    downloadICSFile(facultyOrders, `uniworkload-${activeFaculty.id}.ics`);
    onNotify('ดาวน์โหลดไฟล์ .ics สำเร็จ! สามารถเปิดในคอมพิวเตอร์หรือโทรศัพท์ได้ทันที', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                ซิงค์ปฏิทินเข้าสมาร์ตโฟน (iCalendar Feed Sync)
              </h3>
              <p className="text-xs text-slate-500">
                มาตรฐาน RFC 5545 รองรับ Google Calendar, Apple Calendar, Outlook
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

        {/* URL Card with 1-Click Copy */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-slate-700">
            URL ปฏิทินเฉพาะบุคคลสำหรับ {activeFaculty.name}
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all truncate">
              {icalUrl}
            </div>
            <button
              onClick={handleCopy}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold text-xs transition-all cursor-pointer ${
                copied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
              }`}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'คัดลอกแล้ว' : 'คัดลอก URL'}</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-500">
            * ระบบจะอัปเดตกิจกรรมอัตโนมัติลงในมือถือเมื่อมีคำสั่งใหม่ โดยไม่ต้องล็อกอินซ้ำ
          </p>
        </div>

        {/* Download File Option & QR Code Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-600" />
              ดาวน์โหลดไฟล์ปฏิทิน (.ics)
            </h4>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              หากต้องการนำเข้ากิจกรรมทั้งหมดแบบไฟล์ครั้งเดียว (Offline Import)
            </p>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 text-xs font-medium transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>ดาวน์โหลด .ics (มาตรฐานสากล)</span>
            </button>
          </div>

          <div className="space-y-1 text-center sm:text-left sm:border-l sm:border-slate-200 sm:pl-4">
            <h4 className="text-xs font-bold text-slate-800 flex items-center justify-center sm:justify-start gap-1.5">
              <QrCode className="w-3.5 h-3.5 text-purple-600" />
              สแกนด้วยกล้องมือถือ
            </h4>
            <div className="w-24 h-24 mx-auto sm:mx-0 bg-white border border-slate-200 rounded-lg p-1 shadow-xs flex items-center justify-center">
              {/* SVG QR Code Pattern Representation */}
              <svg viewBox="0 0 100 100" className="w-full h-full fill-slate-900">
                <rect x="10" y="10" width="25" height="25" fill="none" stroke="#1e293b" strokeWidth="6" />
                <rect x="18" y="18" width="9" height="9" fill="#1e293b" />
                <rect x="65" y="10" width="25" height="25" fill="none" stroke="#1e293b" strokeWidth="6" />
                <rect x="73" y="18" width="9" height="9" fill="#1e293b" />
                <rect x="10" y="65" width="25" height="25" fill="none" stroke="#1e293b" strokeWidth="6" />
                <rect x="18" y="73" width="9" height="9" fill="#1e293b" />
                <rect x="42" y="15" width="10" height="10" fill="#0284c7" />
                <rect x="45" y="45" width="12" height="12" fill="#0284c7" />
                <rect x="68" y="68" width="14" height="14" fill="#0284c7" />
                <rect x="45" y="70" width="8" height="8" fill="#1e293b" />
                <rect x="70" y="42" width="10" height="10" fill="#1e293b" />
              </svg>
            </div>
            <p className="text-[10px] text-slate-400">เปิดแอปกล้องเพื่อเพิ่มปฏิทินทันที</p>
          </div>
        </div>

        {/* 3 Step Guides for Faculty */}
        <div className="space-y-2 text-xs text-slate-600">
          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-600" />
            วิธีตั้งค่าใน 30 วินาที:
          </div>
          <div className="space-y-1.5 pl-2 text-[11px] text-slate-500">
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-700">Google Calendar:</span>
              <span>กดเครื่องหมาย + ตรง 'ปฏิทินอื่นๆ' ➔ เลือก 'จาก URL' ➔ วางลิงก์นี้</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="font-bold text-slate-700">iPhone / iPad:</span>
              <span>ไปที่ การตั้งค่า ➔ ปฏิทิน ➔ บัญชี ➔ เพิ่มบัญชี ➔ อื่นๆ ➔ เพิ่มการสมัครรับปฏิทิน (Subscribed Calendar)</span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
}
