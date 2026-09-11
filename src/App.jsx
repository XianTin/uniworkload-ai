import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { 
  FACULTY_MEMBERS, 
  INITIAL_ORDERS 
} from './data/mockData';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import IngestionModule from './components/IngestionModule';
import PersonalDrawerModule from './components/PersonalDrawerModule';
import DualCalendarModule from './components/DualCalendarModule';
import EportfolioCopilotModule from './components/EportfolioCopilotModule';
import ICalModal from './components/ICalModal';
import NohranChatbot from './components/NohranChatbot';
import { 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  X, 
  Building2, 
  GraduationCap, 
  HeartHandshake,
  Calendar,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [facultyList] = useState(FACULTY_MEMBERS);
  const [activeFaculty, setActiveFaculty] = useState(FACULTY_MEMBERS[0]);
  const [userRole, setUserRole] = useState('faculty'); // 'faculty' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'ingestion' | 'drawer' | 'calendar' | 'eportfolio'
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedOrderIdForEportfolio, setSelectedOrderIdForEportfolio] = useState(null);
  const [isIcalOpen, setIsIcalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Add new order from AI Ingestion module
  const handleAddNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    
    // Confetti celebration
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // ignore
    }

    showToast(`สกัดข้อมูลและกระจายคำสั่ง [${newOrder.orderNumber}] สู่ลิ้นชักอาจารย์เรียบร้อยแล้ว!`, 'success');
    setActiveTab('drawer');
  };

  // Toggle order status done/upcoming
  const handleToggleStatus = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const nextStatus = ord.status === 'done' ? 'upcoming' : 'done';
          return {
            ...ord,
            status: nextStatus,
            ePortfolio: {
              ...ord.ePortfolio,
              status: nextStatus === 'done' ? 'completed' : 'ready_to_export'
            }
          };
        }
        return ord;
      })
    );
    showToast('อัปเดตสถานะการปฏิบัติงานเรียบร้อยแล้ว', 'info');
  };

  // Save additional evidence photo
  const handleSaveEvidence = (orderId, newEvidence) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            actualPhotos: [...ord.actualPhotos, newEvidence]
          };
        }
        return ord;
      })
    );
    showToast('แนบภาพถ่ายหลักฐานเข้าลิ้นชักเรียบร้อยแล้ว!', 'success');
  };

  // Delete evidence photo
  const handleDeleteEvidence = (orderId, photoId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            actualPhotos: (ord.actualPhotos || []).filter(p => p.id !== photoId)
          };
        }
        return ord;
      })
    );
    showToast('ลบภาพหลักฐานเรียบร้อยแล้ว', 'info');
  };

  // Jump from Drawer or Calendar to e-Portfolio Copilot
  const handleJumpToEportfolio = (order) => {
    setSelectedOrderIdForEportfolio(order.id);
    setActiveTab('eportfolio');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-blue-600 selection:text-white">
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activeFaculty={activeFaculty}
        setActiveFaculty={setActiveFaculty}
        facultyList={facultyList}
        userRole={userRole}
        setUserRole={setUserRole}
        onOpenIngest={() => setActiveTab('ingestion')}
        onOpenIcal={() => setIsIcalOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <StatsOverview
              activeFaculty={activeFaculty}
              onOpenIngest={() => setActiveTab('ingestion')}
              onNavigateTab={(tab) => setActiveTab(tab)}
            />
            {/* Quick Preview of Calendar & Drawer */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    คำสั่งล่าสุดในลิ้นชักส่วนบุคคล
                  </h3>
                  <button
                    onClick={() => setActiveTab('drawer')}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    ดูทั้งหมดในตู้ลิ้นชัก &rarr;
                  </button>
                </div>
                <PersonalDrawerModule
                  orders={orders.slice(0, 2)}
                  activeFaculty={activeFaculty}
                  onToggleStatus={handleToggleStatus}
                  onSaveEvidence={handleSaveEvidence}
                  onDeleteEvidence={handleDeleteEvidence}
                  onJumpToEportfolio={handleJumpToEportfolio}
                  onNotify={showToast}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    ตัวอย่างปฏิทินงาน 2 ทาง (Web + iCal)
                  </h3>
                  <button
                    onClick={() => setActiveTab('calendar')}
                    className="text-xs text-blue-600 font-semibold hover:underline cursor-pointer"
                  >
                    เปิดปฏิทินเต็มรูปแบบ &rarr;
                  </button>
                </div>
                <DualCalendarModule
                  orders={orders}
                  activeFaculty={activeFaculty}
                  onToggleStatus={handleToggleStatus}
                  onOpenIcal={() => setIsIcalOpen(true)}
                  onJumpToEportfolio={handleJumpToEportfolio}
                  onNotify={showToast}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ingestion' && (
          <div className="animate-in fade-in duration-300">
            <IngestionModule
              onAddNewOrder={handleAddNewOrder}
              onNotify={showToast}
            />
          </div>
        )}

        {activeTab === 'drawer' && (
          <div className="animate-in fade-in duration-300">
            <PersonalDrawerModule
              orders={orders}
              activeFaculty={activeFaculty}
              onToggleStatus={handleToggleStatus}
              onSaveEvidence={handleSaveEvidence}
              onDeleteEvidence={handleDeleteEvidence}
              onJumpToEportfolio={handleJumpToEportfolio}
              onNotify={showToast}
            />
          </div>
        )}

        {activeTab === 'calendar' && (
          <div className="animate-in fade-in duration-300">
            <DualCalendarModule
              orders={orders}
              activeFaculty={activeFaculty}
              onToggleStatus={handleToggleStatus}
              onOpenIcal={() => setIsIcalOpen(true)}
              onJumpToEportfolio={handleJumpToEportfolio}
              onNotify={showToast}
            />
          </div>
        )}

        {activeTab === 'eportfolio' && (
          <div className="animate-in fade-in duration-300">
            <EportfolioCopilotModule
              orders={orders}
              activeFaculty={activeFaculty}
              selectedOrderId={selectedOrderIdForEportfolio}
              onNotify={showToast}
            />
          </div>
        )}
      </main>

      {/* iCalendar Modal */}
      <ICalModal
        isOpen={isIcalOpen}
        onClose={() => setIsIcalOpen(false)}
        activeFaculty={activeFaculty}
        orders={orders}
        onNotify={showToast}
      />

      {/* Nohran AI Copilot Chatbot */}
      <NohranChatbot
        isOpen={isChatbotOpen}
        setIsOpen={setIsChatbotOpen}
        orders={orders}
        activeFaculty={activeFaculty}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onJumpToEportfolio={handleJumpToEportfolio}
        onNotify={showToast}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div className="fixed bottom-22 right-6 z-50 animate-in slide-in-from-bottom-5 duration-200">
          <div className={`px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-3 ${
            toast.type === 'success'
              ? 'bg-emerald-950 text-emerald-100 border-emerald-800'
              : toast.type === 'error'
              ? 'bg-rose-950 text-rose-100 border-rose-800'
              : 'bg-slate-900 text-slate-100 border-slate-800'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Info className="w-5 h-5 text-sky-400 shrink-0" />
            )}
            <span className="text-xs font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="p-1 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-6 text-slate-500 text-xs mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>
              <strong>UniWorkload AI</strong> — โครงงานพัฒนาระบบปฏิทินงานและจัดเก็บข้อมูลอัจฉริยะ (Capstone Project)
            </span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>สาขาวิชาเทคโนโลยีสารสนเทศ คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์</span>
            <span>•</span>
            <span className="font-mono text-slate-600 font-medium">Interactive Mockup v2.0.0</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
