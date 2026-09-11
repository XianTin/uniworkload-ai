import React, { useState } from 'react';
import { X, UploadCloud, Image as ImageIcon, CheckCircle2, FileText } from 'lucide-react';

export default function EvidenceUploadModal({ isOpen, onClose, order, onSaveEvidence }) {
  if (!isOpen || !order) return null;

  const [evidenceType, setEvidenceType] = useState('photo'); // photo | attendance | certificate
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState(
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=600&auto=format&fit=crop&q=80'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvidence = {
      id: `ev-photo-${Date.now()}`,
      name: evidenceType === 'photo' ? 'ภาพถ่ายการเข้าร่วมกิจกรรมจริง.jpg' : 'ใบลงทะเบียนผู้เข้าร่วม.pdf',
      size: '2.5 MB',
      url: previewUrl,
      uploadedAt: new Date().toISOString().split('T')[0],
      note: description || 'หลักฐานบันทึกการปฏิบัติหน้าที่ตามคำสั่งราชการ'
    };
    onSaveEvidence(order.id, newEvidence);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              แนบหลักฐานปฏิบัติงานจริง (Evidence)
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {order.orderNumber} — {order.title.slice(0, 45)}...
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
          <div>
            <label className="block font-semibold text-slate-700 mb-1">ประเภทหลักฐาน</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setEvidenceType('photo')}
                className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                  evidenceType === 'photo'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ภาพถ่ายหน้างาน
              </button>
              <button
                type="button"
                onClick={() => setEvidenceType('attendance')}
                className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                  evidenceType === 'attendance'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                ใบลงทะเบียน
              </button>
              <button
                type="button"
                onClick={() => setEvidenceType('certificate')}
                className={`py-2 px-3 rounded-lg border text-center transition-colors cursor-pointer ${
                  evidenceType === 'certificate'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                เกียรติบัตร/สรุป
              </button>
            </div>
          </div>

          {/* Upload preview */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 text-center">
            <img
              src={previewUrl}
              alt="Evidence preview"
              className="w-full h-40 object-cover rounded-lg mb-2 shadow-xs"
            />
            <p className="text-[11px] text-slate-500">
              ตัวอย่างไฟล์หลักฐาน: ภาพถ่ายการปฏิบัติงาน ณ มหาวิทยาลัยราชภัฏนครสวรรค์
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">บันทึกเพิ่มเติม (ถ้ามี)</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="ระบุหน้าที่ หรือคำอธิบายสำหรับแนบในรายงาน e-Portfolio..."
              className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
            ></textarea>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>บันทึกหลักฐานเข้าลิ้นชัก</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
