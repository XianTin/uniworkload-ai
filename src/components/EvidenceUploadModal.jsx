import React, { useState, useRef } from 'react';
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
  AlertCircle
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
  const [evidenceType, setEvidenceType] = useState('photo'); // photo | attendance | certificate | report
  const [title, setTitle] = useState('');
  const [evidenceDate, setEvidenceDate] = useState(order.eventDate || new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState(PRESET_SAMPLES[0].url);
  const [fileSize, setFileSize] = useState('3.4 MB');
  const [isCustomUpload, setIsCustomUpload] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle local file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const processSelectedFile = (file) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewUrl(event.target.result);
      setTitle(file.name);
      setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
      setIsCustomUpload(true);
      if (!description) {
        setDescription(`ภาพถ่ายหลักฐานการปฏิบัติหน้าที่: ${file.name}`);
      }
    };
    reader.readAsDataURL(file);
  };

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
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processSelectedFile(file);
    }
  };

  const selectPreset = (preset) => {
    setPreviewUrl(preset.url);
    setTitle(preset.name);
    setDescription(preset.caption);
    setFileSize(preset.size);
    setIsCustomUpload(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const safeOrderNum = (order?.orderNumber || 'order').replace(/[^a-zA-Z0-9ก-๙]/g, '_');
    const finalTitle = title || (evidenceType === 'photo' 
      ? `ภาพถ่ายปฏิบัติงานจริง_${safeOrderNum}.jpg` 
      : `หลักฐานลงทะเบียน_${safeOrderNum}.pdf`);

    const newEvidence = {
      id: `ev-photo-${Date.now()}`,
      name: finalTitle,
      size: fileSize,
      url: previewUrl,
      type: evidenceType,
      uploadedAt: evidenceDate,
      note: description || 'หลักฐานบันทึกการปฏิบัติหน้าที่ตามคำสั่งราชการ มรภ.นครสวรรค์'
    };

    onSaveEvidence(order.id, newEvidence);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold mb-1">
              <Camera className="w-3 h-3 text-emerald-600" />
              <span>แนบภาพถ่าย / เอกสารหลักฐานหน้างาน</span>
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Evidence Category Type */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              ประเภทของหลักฐาน
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'photo', label: 'ภาพถ่ายหน้างาน', icon: ImageIcon },
                { id: 'attendance', label: 'ใบลงทะเบียน', icon: FileText },
                { id: 'certificate', label: 'เกียรติบัตร/วุฒิบัตร', icon: Tag },
                { id: 'report', label: 'สรุปผล/รายงาน', icon: CheckCircle2 }
              ].map((item) => {
                const Icon = item.icon;
                const active = evidenceType === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setEvidenceType(item.id)}
                    className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                      active
                        ? 'border-blue-600 bg-blue-50/80 text-blue-700 font-bold shadow-xs'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${active ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-[11px]">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Upload Dropzone / File Picker */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-semibold text-slate-700">
                เลือกไฟล์ภาพจากเครื่อง หรือเลือกภาพตัวอย่าง
              </label>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-blue-600 font-semibold hover:underline cursor-pointer flex items-center gap-1"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>เลือกไฟล์จากเครื่อง...</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            {/* Drop area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                isDragging 
                  ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
                  : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50/60 bg-slate-50/30'
              }`}
            >
              <UploadCloud className="w-8 h-8 text-blue-500 mx-auto mb-1.5" />
              <p className="font-medium text-slate-700 text-xs">
                ลากและวางรูปภาพที่นี่ หรือคลิกเพื่อเลือกไฟล์จากคอมพิวเตอร์ / มือถือ
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                รองรับ JPG, PNG, WEBP, PDF (ไม่เกิน 15 MB)
              </p>
            </div>
          </div>

          {/* Quick Preset Samples */}
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>หรือเลือกภาพตัวอย่างกิจกรรมสำหรับทดสอบระบบ (1-Click Sample):</span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {PRESET_SAMPLES.map((preset, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectPreset(preset)}
                  className={`group relative rounded-xl overflow-hidden border transition-all cursor-pointer ${
                    previewUrl === preset.url && !isCustomUpload
                      ? 'ring-2 ring-blue-600 ring-offset-1 border-transparent shadow-xs'
                      : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-full h-14 object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 group-hover:bg-slate-900/20 flex items-center justify-center p-1">
                    <span className="text-[9px] text-white font-medium text-center line-clamp-2 drop-shadow-xs">
                      {preset.name.split('.')[0].slice(0, 15)}...
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Preview Box */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-slate-50">
            <div className="flex items-center justify-between text-[11px] text-slate-600 mb-2">
              <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-600" />
                ภาพตัวอย่างหลักฐานที่จะถูกบันทึก:
              </span>
              <span className="bg-white border border-slate-200 px-2 py-0.5 rounded-md font-mono text-[10px]">
                {fileSize}
              </span>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-slate-900 h-48 flex items-center justify-center shadow-inner">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-950/75 backdrop-blur-xs text-white p-2 rounded-lg text-[11px] flex items-center justify-between">
                <span className="truncate">{title || 'ภาพถ่ายปฏิบัติหน้าที่จริง.jpg'}</span>
                <span className="text-emerald-400 text-[10px] font-semibold shrink-0 ml-2">✓ พร้อมแนบ</span>
              </div>
            </div>
          </div>

          {/* Form details: Date & Caption */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                วันที่บันทึกภาพ / กิจกรรม
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="date"
                  value={evidenceDate}
                  onChange={(e) => setEvidenceDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ชื่อไฟล์หลักฐาน
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="เช่น ภาพถ่ายร่วมกับวิทยากร.jpg"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              คำอธิบายภาพสำหรับ e-Portfolio (หน้าที่ / ผลลัพธ์)
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุรายละเอียด เช่น อ.ธนภัทร สุขเกษม ควบคุมระบบถ่ายทอดสดและโสตทัศนูปกรณ์..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
            ></textarea>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกหลักฐานเข้าตู้ลิ้นชัก</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
