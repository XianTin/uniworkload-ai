import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  Trash2, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  User, 
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Layers
} from 'lucide-react';

export default function EvidenceLightboxModal({ 
  photo, 
  order, 
  onClose, 
  onDeletePhoto,
  onNotify 
}) {
  if (!photo) return null;

  // Find photos list from order if available
  const allPhotos = (order?.actualPhotos && order.actualPhotos.length > 0)
    ? order.actualPhotos
    : [photo];

  // Initial index matching the passed photo
  const initialIndex = Math.max(
    0,
    allPhotos.findIndex((p) => {
      const pId = typeof p === 'string' ? p : p.id;
      const targetId = typeof photo === 'string' ? photo : photo.id;
      return pId === targetId;
    })
  );

  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Sync index if photo prop changes
  useEffect(() => {
    const idx = allPhotos.findIndex((p) => {
      const pId = typeof p === 'string' ? p : p.id;
      const targetId = typeof photo === 'string' ? photo : photo.id;
      return pId === targetId;
    });
    if (idx !== -1) setCurrentIndex(idx);
  }, [photo, order]);

  // Active photo object
  const rawActive = allPhotos[currentIndex] || photo;
  const currentPhoto = typeof rawActive === 'string' 
    ? { id: `photo-${currentIndex}`, url: rawActive, name: `ภาพถ่ายหลักฐาน_${currentIndex + 1}.jpg`, size: '1.5 MB', uploadedAt: '-' } 
    : rawActive;

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrev();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, allPhotos.length]);

  const goToPrev = () => {
    if (allPhotos.length <= 1) return;
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const goToNext = () => {
    if (allPhotos.length <= 1) return;
    setCurrentIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = currentPhoto.url;
    link.download = currentPhoto.name || `evidence-photo-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onNotify?.(`เริ่มดาวน์โหลดภาพ: ${currentPhoto.name}`, 'success');
  };

  const handleDelete = () => {
    if (confirm(`คุณต้องการลบภาพหลักฐาน "${currentPhoto.name}" หรือไม่?`)) {
      onDeletePhoto?.(order?.id, currentPhoto.id);
      if (allPhotos.length <= 1) {
        onClose();
      } else {
        goToNext();
      }
      onNotify?.(`ลบภาพหลักฐานเรียบร้อยแล้ว`, 'info');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 rounded-3xl max-w-5xl w-full overflow-hidden shadow-2xl border border-slate-800 flex flex-col md:flex-row max-h-[92vh]">
        
        {/* Left / Main: Photo Viewer with Next/Prev & Thumbnail Carousel */}
        <div className="flex-1 bg-black/95 flex flex-col justify-between p-4 relative min-h-[320px] md:min-h-[520px]">
          
          {/* Top Indicator */}
          <div className="flex items-center justify-between z-10">
            {allPhotos.length > 1 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 text-white text-xs font-mono border border-slate-700 backdrop-blur-xs">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                <span>ภาพที่ {currentIndex + 1} / {allPhotos.length}</span>
              </span>
            ) : <div />}

            <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
              (ใช้ปุ่มลูกศร ซ้าย-ขวา บนคีย์บอร์ดเพื่อเลื่อนดูภาพ)
            </span>
          </div>

          {/* Central Image & Navigation Arrows */}
          <div className="flex-1 flex items-center justify-center relative my-2 overflow-hidden">
            {allPhotos.length > 1 && (
              <button
                type="button"
                onClick={goToPrev}
                className="absolute left-2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg"
                title="ภาพก่อนหน้า (ลูกศรซ้าย)"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            <img
              src={currentPhoto.url}
              alt={currentPhoto.name}
              className="max-h-[60vh] md:max-h-[68vh] w-auto max-w-full object-contain rounded-lg shadow-2xl transition-all"
            />

            {allPhotos.length > 1 && (
              <button
                type="button"
                onClick={goToNext}
                className="absolute right-2 z-20 w-10 h-10 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/80 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shadow-lg"
                title="ภาพถัดไป (ลูกศรขวา)"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Thumbnail Strip at bottom for multiple photos */}
          {allPhotos.length > 1 && (
            <div className="flex items-center justify-center gap-2 overflow-x-auto py-1 z-10 scrollbar-thin">
              {allPhotos.map((p, idx) => {
                const itemObj = typeof p === 'string' ? { url: p, id: idx } : p;
                const isActive = idx === currentIndex;
                return (
                  <button
                    key={itemObj.id || idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-12 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      isActive 
                        ? 'border-blue-500 ring-2 ring-blue-400/40 scale-105' 
                        : 'border-slate-700 opacity-60 hover:opacity-90 hover:border-slate-500'
                    }`}
                  >
                    <img
                      src={itemObj.url}
                      alt={`Thumb ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 right-0 bg-slate-950/80 text-[8px] font-mono text-white px-0.5">
                      #{idx + 1}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
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
