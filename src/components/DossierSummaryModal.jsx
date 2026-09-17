import React from 'react';
import { X, Printer, CheckCircle2, Download, FileText, Calendar, Layers, Image as ImageIcon, FolderOpen } from 'lucide-react';
import { FALLBACK_EVIDENCE_IMAGE } from '../utils/imageUtils';

export default function DossierSummaryModal({ 
  isOpen, 
  onClose, 
  orders, 
  activeFaculty, 
  dateRangeText,
  activeCategoryName,
  onNotify 
}) {
  if (!isOpen) return null;

  const totalPhotos = orders.reduce((sum, ord) => sum + (ord.actualPhotos?.length || 0), 0);
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.status === 'done').length;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col justify-between space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                เอกสารสรุปแฟ้มสะสมหลักฐานการปฏิบัติงาน (Dossier Evidence Summary)
              </h3>
              <p className="text-xs text-slate-500">
                สำหรับแนบรายงานประเมินผลการปฏิบัติราชการและรายงาน SAR มหาวิทยาลัยราชภัฏนครสวรรค์
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

        {/* Printable Report Body */}
        <div className="overflow-y-auto pr-1 space-y-6 flex-1 text-slate-800 text-xs">
          {/* Official Letterhead */}
          <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/70 space-y-3">
            <div className="text-center space-y-1">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
                มหาวิทยาลัยราชภัฏนครสวรรค์ • คณะวิทยาการจัดการ
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                แบบรายงานสรุปภาระงานและหลักฐานการปฏิบัติหน้าที่ตามคำสั่งราชการ
              </h4>
              <p className="text-xs text-slate-600 font-medium">
                ช่วงเวลาที่ประเมิน: <span className="font-semibold text-blue-800">{dateRangeText}</span>
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-200/80 text-[11px]">
              <div>
                <span className="text-slate-500">ผู้รับการประเมิน: </span>
                <strong className="text-slate-900">{activeFaculty?.name || 'อาจารย์'}</strong>
              </div>
              <div>
                <span className="text-slate-500">สังกัด: </span>
                <span className="text-slate-800">{activeFaculty?.department || 'สาขาวิชาเทคโนโลยีสารสนเทศ'} {activeFaculty?.faculty || 'คณะวิทยาการจัดการ'}</span>
              </div>
              <div>
                <span className="text-slate-500">หมวดหมู่ภาระงาน: </span>
                <span className="font-semibold text-indigo-700">{activeCategoryName}</span>
              </div>
              <div>
                <span className="text-slate-500">สถิติความสมบูรณ์: </span>
                <span className="font-semibold text-emerald-700">
                  {completedOrders}/{totalOrders} คำสั่ง (มีภาพถ่ายแนบ {totalPhotos} ภาพ)
                </span>
              </div>
            </div>
          </div>

          {/* Table of Orders & Evidence */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 text-slate-700 text-[11px] font-bold border-b border-slate-200">
                  <th className="py-2.5 px-3 w-10 text-center">ลำดับ</th>
                  <th className="py-2.5 px-3 w-36">เลขคำสั่ง / วันที่</th>
                  <th className="py-2.5 px-3">ชื่อกิจกรรม / ภาระงาน</th>
                  <th className="py-2.5 px-3 w-40">บทบาทตามคำสั่ง</th>
                  <th className="py-2.5 px-3 w-32 text-center">หลักฐานภาพถ่าย</th>
                  <th className="py-2.5 px-3 w-20 text-center">สถานะ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      ไม่พบรายการคำสั่งในช่วงเวลาและหมวดหมู่ที่เลือก
                    </td>
                  </tr>
                ) : (
                  orders.map((order, idx) => {
                    const assignment = (order.facultyAssigned || []).find(f => f.id === activeFaculty?.id);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3 text-center text-slate-400 font-mono text-[11px]">
                          {idx + 1}
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-mono font-bold text-blue-700 text-[11px]">
                            {order.orderNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            จัดเมื่อ: {order.eventDate}
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-slate-900 leading-snug">
                            {order.title}
                          </div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            หมวด: {order.category}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-medium">
                          {assignment ? assignment.roleInOrder : '-'}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {order.actualPhotos?.length > 0 ? (
                            <div className="flex items-center justify-center gap-1">
                              {(order.actualPhotos || []).slice(0, 2).map((photo, pIdx) => {
                                const photoObj = typeof photo === 'string' ? { url: photo } : photo;
                                const isGDrive = photoObj?.isGoogleDrive || photoObj?.type === 'gdrive' || (photoObj?.url && (photoObj.url.includes('drive.google.com') || photoObj.url.includes('docs.google.com')));
                                const photoName = photoObj?.name || (isGDrive ? 'Google Drive' : 'ภาพถ่ายหลักฐาน');

                                if (isGDrive) {
                                  return (
                                    <a
                                      key={photoObj?.id || `photo-${pIdx}`}
                                      href={photoObj.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-500/40 text-emerald-300 flex flex-col items-center justify-center shadow-2xs hover:scale-110 transition-transform"
                                      title={`Google Drive: ${photoName}`}
                                    >
                                      <FolderOpen className="w-4 h-4" />
                                    </a>
                                  );
                                }

                                return (
                                  <img
                                    key={photoObj?.id || `photo-${pIdx}`}
                                    src={photoObj?.url || ''}
                                    alt={photoName}
                                    className="w-8 h-8 rounded-lg object-cover border border-slate-200 shadow-2xs"
                                    title={photoName}
                                    onError={(e) => {
                                      e.currentTarget.onerror = null;
                                      e.currentTarget.src = FALLBACK_EVIDENCE_IMAGE;
                                    }}
                                  />
                                );
                              })}
                              {(order.actualPhotos || []).length > 2 && (
                                <span className="text-[10px] bg-slate-100 text-slate-600 px-1 py-0.5 rounded-md font-mono">
                                  +{(order.actualPhotos || []).length - 2}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-[10px] text-amber-600 italic">ยังไม่มีภาพ</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {order.status === 'done' ? (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-2.5 h-2.5" /> เสร็จสิ้น
                            </span>
                          ) : (
                            <span className="text-[10px] text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                              รอดำเนินการ
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">
            ระบบ UniWorkload AI • รายงานอัจฉริยะสำหรับภาระงาน มรภ.นครสวรรค์
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              ปิด
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์เอกสาร / ส่งออก PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
