import React, { useState, useRef, useEffect } from 'react';
import { compressImageFile, FALLBACK_EVIDENCE_IMAGE } from '../utils/imageUtils';
import { 
  X, 
  UploadCloud, 
  Image as ImageIcon, 
  CheckCircle2, 
  FileText, 
  Calendar, 
  Tag, 
  Camera, 
  Sparkles,
  Clipboard,
  Plus,
  Trash2,
  Copy,
  Layers,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';

const PRESET_SAMPLES = [
  {
    name: "ภาพถ่ายขณะปฏิบัติหน้าที่วิทยากร/โสตทัศนูปกรณ์.jpg",
    url: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&auto=format&fit=crop&q=80",
    caption: "อาจารย์ธนภัทร ควบคุมระบบถ่ายทอดสดและแนะนำเทคโนโลยี AI แก่ผู้เข้าร่วม",
    size: "3.4 MB",
    type: "photo"
  },
  {
    name: "ภาพลงพื้นที่ภาคสนามสำรวจข้อมูลชุมชน.jpg",
    url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=900&auto=format&fit=crop&q=80",
    caption: "ถ่ายภาพร่วมกับตัวแทนชุมชนและทีมงานวิจัยภาคสนาม",
    size: "4.2 MB",
    type: "photo"
  },
  {
    name: "ภาพการประชุมคณะกรรมการและผู้ทรงคุณวุฒิ.jpg",
    url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=80",
    caption: "ร่วมประชุมพิจารณาร่างหลักสูตรและวิพากษ์แผนการสอนร่วมกับผู้ทรงคุณวุฒิ",
    size: "3.8 MB",
    type: "photo"
  },
  {
    name: "ภาพใบลงทะเบียนและเกียรติบัตรผู้เข้าร่วม.jpg",
    url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&auto=format&fit=crop&q=80",
    caption: "ใบลงทะเบียนผู้เข้าร่วมโครงการและหลักฐานหนังสือขอบคุณจากหน่วยงาน",
    size: "2.1 MB",
    type: "document"
  }
];

export default function EvidenceUploadModal({ isOpen, onClose, order, onSaveEvidence }) {
  if (!isOpen || !order) return null;

  const fileInputRef = useRef(null);
  const defaultDate = order.eventDate || new Date().toISOString().split('T')[0];

  // List of queued evidence items (starts clean without dummy defaults)
  const [queuedPhotos, setQueuedPhotos] = useState([]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(null);
  const [applyAllSuccess, setApplyAllSuccess] = useState(false);

  const [isCompressing, setIsCompressing] = useState(false);

  // Safely ensure activeIndex is valid
  const currentPhoto = queuedPhotos[activeIndex] || queuedPhotos[0] || null;

  // Global Clipboard Paste (Ctrl + V / Cmd + V) listener
  useEffect(() => {
    if (!isOpen) return;

    const handlePaste = (e) => {
      const clipboardData = e.clipboardData;
      if (!clipboardData) return;

      const items = clipboardData.items;
      if (!items || items.length === 0) return;

      // Extract all image items from clipboard
      const imageFiles = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const file = items[i].getAsFile();
          if (file) imageFiles.push(file);
        }
      }

      if (imageFiles.length > 0) {
        // Prevent default browser paste behavior for images
        e.preventDefault();
        processIncomingFiles(imageFiles, 'clipboard');
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isOpen, queuedPhotos.length, defaultDate]);

  // Flash notification timer
  useEffect(() => {
    if (pasteNotice) {
      const timer = setTimeout(() => setPasteNotice(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [pasteNotice]);

  // Read and process incoming files (from file dialog, drag-drop, or clipboard)
  const processIncomingFiles = async (files, source = 'local') => {
    if (!files || files.length === 0) return;

    setIsCompressing(true);
    const filesArray = Array.from(files);

    try {
      const processedItems = await Promise.all(filesArray.map(async (file, index) => {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
        const autoName = source === 'clipboard' 
          ? `ภาพถ่าย_Clipboard_${timestamp}_${index + 1}.jpg`
          : file.name;

        const isDoc = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');

        if (isDoc) {
          // Document file (PDF)
          const sizeFormatted = file.size > 1024 * 1024 
            ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
            : `${(file.size / 1024).toFixed(0)} KB`;
          
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
              resolve({
                id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
                name: autoName,
                url: e.target.result,
                size: sizeFormatted,
                type: 'document',
                uploadedAt: defaultDate,
                note: `เอกสารหลักฐาน: ${autoName.replace(/\.[^/.]+$/, '')}`,
                isPreset: false
              });
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
          });
        }

        // Image file -> compress to lightweight (~100-150KB) crisp JPEG
        try {
          const comp = await compressImageFile(file, 1200, 1200, 0.75);
          if (comp && comp.dataUrl) {
            return {
              id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              name: comp.name || autoName,
              url: comp.dataUrl,
              size: comp.size || '150 KB',
              type: 'photo',
              uploadedAt: defaultDate,
              note: `ภาพถ่ายหลักฐานการปฏิบัติหน้าที่: ${autoName.replace(/\.[^/.]+$/, '')}`,
              isPreset: false
            };
          }
        } catch (compErr) {
          console.warn('[EvidenceUploadModal] Compression failed, fallback to raw reader:', compErr);
        }

        // Fallback to standard reader
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              id: `ev-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
              name: autoName,
              url: e.target.result,
              size: `${Math.round(file.size / 1024)} KB`,
              type: 'photo',
              uploadedAt: defaultDate,
              note: `ภาพถ่ายหลักฐานการปฏิบัติหน้าที่: ${autoName.replace(/\.[^/.]+$/, '')}`,
              isPreset: false
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(file);
        });
      }));

      const validItems = processedItems.filter(Boolean);
      if (validItems.length > 0) {
        setQueuedPhotos((prev) => {
          const isOnlyDefaultPreset = prev.length === 1 && prev[0].isPreset;
          const updated = isOnlyDefaultPreset ? validItems : [...prev, ...validItems];
          setActiveIndex(isOnlyDefaultPreset ? 0 : prev.length);
          return updated;
        });

        if (source === 'clipboard') {
          setPasteNotice(`วางภาพจาก Clipboard สำเร็จ (${validItems.length} รายการ)`);
        } else {
          setPasteNotice(`เพิ่มรูปภาพสำเร็จ (${validItems.length} รายการ)`);
        }
      }
    } finally {
      setIsCompressing(false);
    }
  };

  // Local File Input Change
  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      processIncomingFiles(files, 'local');
      e.target.value = '';
    }
  };

  // Drag & Drop Handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      processIncomingFiles(files, 'drop');
    }
  };

  // Add a sample preset
  const addPresetSample = (preset) => {
    const newPresetItem = {
      id: `ev-sample-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: preset.name,
      url: preset.url,
      size: preset.size,
      type: preset.type,
      uploadedAt: defaultDate,
      note: preset.caption,
      isPreset: true
    };

    setQueuedPhotos((prev) => {
      const isOnlyDefaultPreset = prev.length === 1 && prev[0].isPreset;
      const updated = isOnlyDefaultPreset ? [newPresetItem] : [...prev, newPresetItem];
      setActiveIndex(updated.length - 1);
      return updated;
    });
    setPasteNotice(`เพิ่มภาพตัวอย่าง "${preset.name.slice(0, 20)}..." แล้ว`);
  };

  // Remove an item from the queue
  const handleRemoveItem = (indexToRemove, e) => {
    e?.stopPropagation();
    setQueuedPhotos((prev) => {
      const nextList = prev.filter((_, idx) => idx !== indexToRemove);
      if (nextList.length === 0) {
        setActiveIndex(0);
      } else if (activeIndex >= nextList.length) {
        setActiveIndex(nextList.length - 1);
      }
      return nextList;
    });
  };

  // Update current active photo metadata
  const updateCurrentPhoto = (fields) => {
    if (!currentPhoto) return;
    setQueuedPhotos((prev) =>
      prev.map((item, idx) => (idx === activeIndex ? { ...item, ...fields } : item))
    );
  };

  // Apply active note & date to all photos in the queue
  const handleApplyToAll = () => {
    if (!currentPhoto) return;
    setQueuedPhotos((prev) =>
      prev.map((item) => ({
        ...item,
        uploadedAt: currentPhoto.uploadedAt,
        note: currentPhoto.note,
        type: currentPhoto.type
      }))
    );
    setApplyAllSuccess(true);
    setTimeout(() => setApplyAllSuccess(false), 2000);
  };

  // Save all evidence items
  const handleSubmit = (e) => {
    e.preventDefault();
    if (queuedPhotos.length === 0) return;

    const safeOrderNum = (order?.orderNumber || 'order').replace(/[^a-zA-Z0-9ก-๙]/g, '_');

    const finalizedEvidences = queuedPhotos.map((item, idx) => {
      const fallbackTitle = item.type === 'photo'
        ? `ภาพถ่ายปฏิบัติงานจริง_${safeOrderNum}_${idx + 1}.jpg`
        : `หลักฐานลงทะเบียน_${safeOrderNum}_${idx + 1}.pdf`;

      return {
        id: item.id || `ev-photo-${Date.now()}-${idx}`,
        name: item.name || fallbackTitle,
        size: item.size || '3.0 MB',
        url: item.url,
        type: item.type || 'photo',
        uploadedAt: item.uploadedAt || defaultDate,
        note: item.note || 'หลักฐานบันทึกการปฏิบัติหน้าที่ตามคำสั่งราชการ มรภ.นครสวรรค์'
      };
    });

    onSaveEvidence(order.id, finalizedEvidences);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[94vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                <Camera className="w-3 h-3 text-emerald-600" />
                <span>แนบภาพถ่าย / เอกสารหลักฐานหน้างาน</span>
              </div>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-semibold">
                <Layers className="w-3 h-3 text-blue-600" />
                <span>พร้อมบันทึก {queuedPhotos.length} รายการ</span>
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              อัปโหลดหลักฐานการปฏิบัติงาน
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5 line-clamp-1">
              {order.orderNumber} — {order.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Paste Notification Toast Bar */}
        {pasteNotice && (
          <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-medium animate-in fade-in slide-in-from-top-1">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{pasteNotice}</span>
            </span>
            <button 
              type="button" 
              onClick={() => setPasteNotice(null)} 
              className="text-emerald-600 hover:text-emerald-800 text-[11px] font-bold cursor-pointer"
            >
              ปิด
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Upload Dropzone / Clipboard Visual Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700 flex items-center gap-1.5">
                <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                <span>วางภาพ (Ctrl+V) หรือเลือกไฟล์รูปภาพจากเครื่อง</span>
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เลือกไฟล์จากเครื่อง (เลือกได้หลายรูป)...</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drop & Paste Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/60 scale-[1.01]' 
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-xs">
                  <UploadCloud className="w-5 h-5" />
                </div>
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-xs">
                  <Clipboard className="w-5 h-5" />
                </div>
              </div>
              <p className="font-semibold text-slate-800 text-xs">
                ลากและวางรูปภาพที่นี่ หรือกดคลิกเพื่อเลือกไฟล์ (เลือกได้หลายรูปพร้อมกัน)
              </p>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 mt-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium">
                <Clipboard className="w-3 h-3 text-blue-600" />
                <span>หรือกด <strong>Ctrl + V</strong> (Cmd + V) เพื่อวางภาพจาก Clipboard ได้ทันที</span>
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                รองรับ JPG, PNG, WEBP, PDF (ไม่จำกัดจำนวนภาพ)
              </p>
            </div>

            {isCompressing && (
              <div className="flex items-center justify-center gap-2 p-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs text-blue-800 font-semibold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                <span>กำลังปรับขนาดและบีบอัดภาพเพื่อการบันทึกที่รวดเร็วและปลอดภัย...</span>
              </div>
            )}
          </div>

          {/* Quick Preset Samples */}
          <div>
            <div className="flex items-center justify-between text-slate-500 text-[11px] font-medium mb-2">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>หรือคลิกเพื่อเพิ่มภาพตัวอย่างกิจกรรม (1-Click Sample):</span>
              </span>
              <span className="text-[10px] text-slate-400">คลิกเพื่อเพิ่มลงในรายการ</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESET_SAMPLES.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addPresetSample(preset)}
                  className="group relative rounded-xl overflow-hidden border border-slate-200 hover:border-blue-400 opacity-80 hover:opacity-100 transition-all cursor-pointer text-left bg-slate-900"
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-14 object-cover group-hover:scale-105 transition-transform opacity-75 group-hover:opacity-90"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-1.5 justify-between">
                    <span className="text-[9px] text-white font-medium truncate drop-shadow-xs">
                      + {preset.name.split('.')[0].slice(0, 16)}...
                    </span>
                    <Plus className="w-3 h-3 text-white shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Queued Photos Carousel / Thumbnail Strip */}
          {queuedPhotos.length > 0 && (
            <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50/70 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800 text-[11px] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-blue-600" />
                  <span>รายการภาพที่เตรียมแนบ ({queuedPhotos.length} ภาพ):</span>
                </span>
                <span className="text-[10px] text-slate-500">
                  คลิกที่รูปเพื่อตรวจสอบและแก้ไขข้อมูล
                </span>
              </div>

              <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
                {queuedPhotos.map((photo, idx) => {
                  const isActive = idx === activeIndex;
                  return (
                    <div
                      key={photo.id || idx}
                      onClick={() => setActiveIndex(idx)}
                      className={`relative shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                        isActive
                          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-sm scale-[1.02]'
                          : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = FALLBACK_EVIDENCE_IMAGE;
                        }}
                      />
                      <span className="absolute top-1 left-1 bg-slate-900/80 text-white font-mono text-[9px] px-1 rounded-sm">
                        #{idx + 1}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => handleRemoveItem(idx, e)}
                        title="ลบรูปนี้ออกจากรายการ"
                        className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600/90 hover:bg-rose-700 text-white flex items-center justify-center transition-transform hover:scale-110"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                      <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[8px] text-slate-200 px-1 truncate">
                        {photo.size}
                      </div>
                    </div>
                  );
                })}

                {/* Quick Add Button in Strip */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
                  title="เพิ่มรูปภาพเพิ่มเติม"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-[9px] font-semibold">เพิ่มอีก</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Photo Inspector & Editor */}
          {currentPhoto ? (
            <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50 space-y-3">
              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                  <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                  <span>รายละเอียดภาพที่ {activeIndex + 1} จาก {queuedPhotos.length}:</span>
                </span>
                <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[10px]">
                  {currentPhoto.size || '3.2 MB'}
                </span>
              </div>

              <div className="relative rounded-xl overflow-hidden bg-slate-900 h-44 flex items-center justify-center shadow-inner">
                <img
                  src={currentPhoto.url}
                  alt={currentPhoto.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = FALLBACK_EVIDENCE_IMAGE;
                  }}
                />
                <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                  <span className="truncate">{currentPhoto.name || 'ภาพถ่ายปฏิบัติหน้าที่จริง.jpg'}</span>
                  <span className="text-emerald-400 text-[10px] font-semibold shrink-0 ml-2">✓ พร้อมแนบ</span>
                </div>
              </div>

              {/* Evidence Category Type for Active Photo */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ประเภทหลักฐาน
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'photo', label: 'ภาพถ่ายหน้างาน', icon: ImageIcon },
                    { id: 'attendance', label: 'ใบลงทะเบียน', icon: FileText },
                    { id: 'certificate', label: 'เกียรติบัตร/วุฒิบัตร', icon: Tag },
                    { id: 'report', label: 'สรุปผล/รายงาน', icon: CheckCircle2 }
                  ].map((item) => {
                    const Icon = item.icon;
                    const active = currentPhoto.type === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => updateCurrentPhoto({ type: item.id })}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                          active
                            ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold shadow-xs'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                        <span className="text-[10px]">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form details: Date & File title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    วันที่บันทึกภาพ / กิจกรรม
                  </label>
                  <div className="relative">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={currentPhoto.uploadedAt || defaultDate}
                      onChange={(e) => updateCurrentPhoto({ uploadedAt: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    ชื่อไฟล์หลักฐาน
                  </label>
                  <input
                    type="text"
                    value={currentPhoto.name || ''}
                    onChange={(e) => updateCurrentPhoto({ name: e.target.value })}
                    placeholder="เช่น ภาพถ่ายร่วมกับวิทยากร.jpg"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">
                    คำอธิบายภาพสำหรับ e-Portfolio (หน้าที่ / ผลลัพธ์)
                  </label>
                  {queuedPhotos.length > 1 && (
                    <button
                      type="button"
                      onClick={handleApplyToAll}
                      className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                      {applyAllSuccess ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">ใช้กับทุกภาพแล้ว</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>ใช้คำอธิบายนี้กับทุกภาพ</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={currentPhoto.note || ''}
                  onChange={(e) => updateCurrentPhoto({ note: e.target.value })}
                  placeholder="ระบุรายละเอียด เช่น อ.ธนภัทร สุขเกษม ควบคุมระบบถ่ายทอดสดและโสตทัศนูปกรณ์..."
                  className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                ></textarea>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 border border-slate-200 rounded-2xl text-slate-400">
              <AlertCircle className="w-8 h-8 mx-auto mb-1 text-slate-300" />
              <p className="text-xs">ยังไม่มีรูปภาพในรายการ</p>
              <p className="text-[11px] text-slate-400">กรุณากด Ctrl+V เพื่อวางภาพ หรือเลือกไฟล์จากเครื่อง</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              {queuedPhotos.length > 0 ? (
                <span>พร้อมบันทึก <strong className="text-blue-600">{queuedPhotos.length}</strong> รายการเข้าคำสั่ง</span>
              ) : (
                <span>กรุณาเพิ่มรูปภาพอย่างน้อย 1 รายการ</span>
              )}
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={queuedPhotos.length === 0}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {queuedPhotos.length > 1 
                    ? `บันทึกหลักฐานทั้งหมด (${queuedPhotos.length} ภาพ)` 
                    : 'บันทึกหลักฐานเข้าตู้ลิ้นชัก'}
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
