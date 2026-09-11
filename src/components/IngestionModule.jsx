import React, { useState } from 'react';
import { 
  UploadCloud, 
  Sparkles, 
  FileText, 
  Image as ImageIcon, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  ScanLine, 
  SlidersHorizontal,
  RefreshCw,
  Eye
} from 'lucide-react';
import { DEMO_RAW_ORDERS } from '../data/mockData';

export default function IngestionModule({ onAddNewOrder, onNotify }) {
  const [selectedChannel, setSelectedChannel] = useState('pdf'); // 'pdf' | 'photo' | 'chat'
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanResult, setScanResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Pre-load demo simulation
  const handleStartDemoScan = (demoItem = DEMO_RAW_ORDERS[0]) => {
    setIsScanning(true);
    setScanProgress(10);
    setScanResult(null);

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setIsScanning(false);
            setScanResult(demoItem);
            onNotify('AI OCR ประมวลผลเอกสารสำเร็จ! พร้อมตรวจสอบความถูกต้อง', 'success');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleConfirmAndDispatch = () => {
    if (!scanResult) return;
    const newOrderObj = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: scanResult.parsedData.orderNumber,
      title: scanResult.parsedData.title,
      signDate: scanResult.parsedData.signDate,
      eventDate: scanResult.parsedData.eventDate,
      eventTime: scanResult.parsedData.eventTime,
      location: scanResult.parsedData.location,
      category: scanResult.parsedData.category,
      categoryColor: 'emerald',
      facultyAssigned: scanResult.parsedData.facultyAssigned,
      status: 'upcoming',
      evidenceFiles: [
        {
          id: `ev-${Date.now()}`,
          name: scanResult.filename,
          size: '1.8 MB',
          type: 'pdf',
          uploadedAt: new Date().toISOString().split('T')[0]
        }
      ],
      actualPhotos: [],
      ePortfolio: {
        year: '2569',
        round: 'รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)',
        topic: scanResult.parsedData.title,
        workloadRef: 'ภาระงานด้านบริการวิชาการและงานวิจัย มหาวิทยาลัยราชภัฏนครสวรรค์',
        status: 'ready_to_export'
      }
    };

    onAddNewOrder(newOrderObj);
    setScanResult(null);
    setScanProgress(0);
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-sky-50 text-sky-700 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>โมดูลที่ ๑: Multi-Channel Ingestion & AI Thai OCR Parser</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            ระบบนำเข้าและสกัดข้อมูลคำสั่งราชการอัจฉริยะ
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            รองรับทั้งไฟล์ PDF ต้นฉบับจากงานสารบรรณ, ภาพถ่ายจากสมาร์ตโฟน และภาพแคปหน้าจอแชตกลุ่ม LINE
          </p>
        </div>

        {/* Preset Sample Quick Button */}
        <button
          onClick={() => handleStartDemoScan(DEMO_RAW_ORDERS[0])}
          disabled={isScanning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold hover:bg-blue-100 transition-colors cursor-pointer disabled:opacity-50"
        >
          <ScanLine className="w-4 h-4 text-blue-600" />
          <span>โหลดตัวอย่างคำสั่งจริง (มรภ.นว. ๑๒๙๙/๒๕๖๙)</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upload & Channel Picker (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Channel Selectors */}
          <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setSelectedChannel('pdf')}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'pdf'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>ไฟล์ PDF คำสั่ง</span>
            </button>
            <button
              onClick={() => setSelectedChannel('photo')}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'photo'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              <span>ภาพถ่ายเอกสาร</span>
            </button>
            <button
              onClick={() => setSelectedChannel('chat')}
              className={`flex flex-col items-center gap-1 py-2.5 px-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                selectedChannel === 'chat'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>แคปแชท LINE</span>
            </button>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              handleStartDemoScan();
            }}
            onClick={() => handleStartDemoScan()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-blue-500 bg-blue-50/50 scale-[0.99]'
                : 'border-slate-300 hover:border-blue-400 bg-white hover:bg-slate-50/60'
            }`}
          >
            <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-sky-500/20 to-blue-500/20 flex items-center justify-center text-blue-600 mb-4">
              <UploadCloud className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-800">
              ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกไฟล์
            </h4>
            <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
              รองรับ .PDF, .PNG, .JPG (ระบบ AI Vision พร้อมตรวจจับภาษาไทยและเลขไทยอัตโนมัติ)
            </p>
            <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px]">
              <span>จำลองไฟล์: คำสั่งโครงการวิจัยชุมชน ๒๕๖๙</span>
            </div>
          </div>

          {/* Ingestion Guidelines card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2 text-slate-600">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
              <span>เทคโนโลยีการสกัดข้อมูล (AI Parser Spec)</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-slate-500 text-[11px]">
              <li>แปลงเลขไทย (๑ ๒ ๓) เป็นเลขอารบิกสำหรับฐานข้อมูลและปฏิทิน</li>
              <li>ตรวจจับคำนำหน้า (ศ., รศ., ผศ., อ., ดร.) และจับคู่บัญชีอาจารย์อัตโนมัติ</li>
              <li>คำนวณวัน-เวลา และปักหมุด iCal Feed ให้อาจารย์โดยไม่ต้องคีย์ซ้ำ</li>
            </ul>
          </div>
        </div>

        {/* Right Col: Live Scanning Simulation & Verification Panel (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                <h3 className="text-sm font-bold text-slate-800">
                  หน้าต่างตรวจทานด่วน (Quick Verification Drawer)
                </h3>
              </div>
              {scanResult && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3 h-3" />
                  ความแม่นยำ: {scanResult.detectedConfidence}%
                </span>
              )}
            </div>

            {/* In-progress scanning state */}
            {isScanning && (
              <div className="py-16 text-center space-y-4">
                <div className="relative w-16 h-16 mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center animate-pulse">
                    <ScanLine className="w-8 h-8 text-blue-600 animate-spin" />
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-800">
                    AI กำลังสกัดข้อความภาษาไทยและรายชื่อบุคลากร...
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    OCR Vision Model กำลังสกัดเลขที่คำสั่ง วันที่ เวลา สถานที่ และผู้ปฏิบัติงาน
                  </p>
                </div>
                <div className="max-w-xs mx-auto w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Empty state before scanning */}
            {!isScanning && !scanResult && (
              <div className="py-16 text-center text-slate-400 space-y-3">
                <FileText className="w-12 h-12 mx-auto stroke-1 text-slate-300" />
                <p className="text-xs text-slate-500">
                  ยังไม่มีเอกสารที่กำลังสกัดข้อมูล กรุณาอัปโหลดเอกสารหรือคลิกปุ่ม "โหลดตัวอย่างคำสั่งจริง" ด้านบน
                </p>
              </div>
            )}

            {/* Result Extracted Ready for Verification */}
            {!isScanning && scanResult && (
              <div className="mt-4 space-y-4 text-xs">
                {/* Visual Document Snippet & Extracted Form Side by Side */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                    <span className="font-semibold text-slate-700">ข้อความที่ OCR ตรวจพบในเอกสาร:</span>
                    <span className="font-mono text-blue-600">{scanResult.filename}</span>
                  </div>
                  <pre className="text-[11px] font-mono text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/80 overflow-x-auto whitespace-pre-wrap max-h-32">
                    {scanResult.detectedText}
                  </pre>
                </div>

                {/* Extracted Fields Form for 5-10 Sec Quick Verification */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">เลขที่คำสั่ง</label>
                    <input 
                      type="text" 
                      defaultValue={scanResult.parsedData.orderNumber} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">หมวดหมู่ภาระงาน</label>
                    <input 
                      type="text" 
                      defaultValue={scanResult.parsedData.category} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">ชื่อคำสั่ง / กิจกรรม</label>
                    <input 
                      type="text" 
                      defaultValue={scanResult.parsedData.title} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">วันจัดกิจกรรม (แปลงเป็น ค.ศ.)</label>
                    <input 
                      type="date" 
                      defaultValue={scanResult.parsedData.eventDate} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">เวลา</label>
                    <input 
                      type="text" 
                      defaultValue={scanResult.parsedData.eventTime} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">สถานที่จัดงาน</label>
                    <input 
                      type="text" 
                      defaultValue={scanResult.parsedData.location} 
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-hidden"
                    />
                  </div>
                </div>

                {/* Assigned Faculty Detection List */}
                <div className="bg-sky-50/60 p-3 rounded-xl border border-sky-200/80">
                  <div className="font-semibold text-sky-900 text-xs mb-2 flex items-center justify-between">
                    <span>บุคลากรที่ตรวจพบและเตรียมกระจายเข้าลิ้นชักส่วนบุคคล (Smart Dispatch):</span>
                    <span className="text-[10px] bg-sky-200 text-sky-800 px-2 py-0.5 rounded-md font-mono">
                      {scanResult.parsedData.facultyAssigned.length} ท่าน
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {scanResult.parsedData.facultyAssigned.map((f, idx) => (
                      <div key={idx} className="bg-white p-2 rounded-lg border border-sky-100 flex items-center justify-between">
                        <span className="font-medium text-slate-800">{f.name}</span>
                        <span className="text-slate-500 text-[11px] bg-slate-100 px-2 py-0.5 rounded-md">
                          {f.roleInOrder}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Footer */}
          {scanResult && (
            <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setScanResult(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors cursor-pointer"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleConfirmAndDispatch}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xs shadow-md shadow-emerald-500/20 hover:from-emerald-700 hover:to-teal-700 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>ยืนยันข้อมูล & กระจายเข้าลิ้นชักและปฏิทินทันที</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
