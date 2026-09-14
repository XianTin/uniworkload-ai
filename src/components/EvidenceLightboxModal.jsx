import React from 'react';
import { X, Download, Trash2, Calendar, FileText, CheckCircle2, User, ExternalLink } from 'lucide-react';

export default function EvidenceLightboxModal({ 
  photo, 
  order, 
  onClose, 
  onDeletePhoto,
  onNotify 
}) {
  if (!photo) return null;

  const currentPhoto = typeof photo === 'string' 
    ? { id: 'photo-raw', url: photo, name: 'ภาพถ่ายหลักฐาน.jpg', size: '1.5 MB', uploadedAt: '-' } 
    : photo;

  const handleDownload = () => {
    // If it's a real base64 or URL, trigger download
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = currentPhoto.name || 'evidence-photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify?.(`เริ่มดาวน์โหลดภาพ: ${currentPhoto.name}`, 'success');
  };

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบภาพหลักฐาน "${currentPhoto.name}" หรือไม่?`)) {
      onDeletePhoto?.(order?.id, currentPhoto.id);
      onClose();
      onNotify?.(`ลบภาพหลักฐานเรียบร้อยแล้ว`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-4xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row max-h-[90vh]">
        {/* Left / Main: Photo Viewer */}
        <div className="flex-1 bg-black/90 flex items-center justify-center p-4 relative min-h-[300px] md:min-h-[500px]">
          <img
            src={currentPhoto.url}
            alt={currentPhoto.name}
            className="max-h-[75vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Right / Sidebar: Metadata & Actions */}
        <div className="w-full md:w-80 bg-slate-900 border-t md:border-t-0 md:border-l border-slate-800 p-6 flex flex-col justify-between text-white">
          <div className="space-y-4">
            {/* Top Close */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-800/50">
                หลักฐานภาพถ่ายปฏิบัติหน้าที่จริง
              </span>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Photo Title */}
            <div>
              <h4 className="text-sm font-bold text-slate-100 leading-snug">
                {currentPhoto.name}
              </h4>
              <p className="text-[11px] text-slate-400 mt-1 font-mono">
                ขนาด: {currentPhoto.size || '3.2 MB'} • บันทึกเมื่อ: {currentPhoto.uploadedAt || '-'}
              </p>
            </div>

            {/* Note / Caption */}
            {currentPhoto.note && (
              <div className="bg-slate-800/80 border border-slate-700/60 rounded-xl p-3 text-xs text-slate-300 space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                  คำอธิบายภาพหลักฐาน (e-Portfolio Note):
                </span>
                <p className="italic leading-relaxed">"{currentPhoto.note}"</p>
              </div>
            )}

            {/* Order Reference */}
            {order && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  อ้างอิงคำสั่งราชการ:
                </span>
                <div className="text-sky-400 font-mono font-bold text-[11px]">
                  {order.orderNumber}
                </div>
                <div className="text-slate-300 text-xs line-clamp-2">
                  {order.title}
                </div>
                <div className="text-slate-400 text-[11px] flex items-center gap-1.5 pt-1">
                  <Calendar className="w-3 h-3 text-slate-500" />
                  <span>วันจัดกิจกรรม: {order.eventDate}</span>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>ดาวน์โหลดภาพ</span>
            </button>
            <button
              onClick={handleDelete}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-300 text-slate-400 flex items-center justify-center transition-colors cursor-pointer border border-slate-700"
              title="ลบภาพหลักฐานนี้"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
