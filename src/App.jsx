import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  FACULTY_MEMBERS, 
  INITIAL_ORDERS 
} from './data/mockData';
import { 
  fetchFacultiesFromSupabase, 
  fetchOrdersFromSupabase, 
  saveOrderToSupabase, 
  updateOrderStatusInSupabase, 
  saveFacultyToSupabase 
} from './utils/supabaseClient';
import Navbar from './components/Navbar';
import StatsOverview from './components/StatsOverview';
import DashboardOverview from './components/DashboardOverview';
import IngestionModule from './components/IngestionModule';
import PersonalDrawerModule from './components/PersonalDrawerModule';
import DualCalendarModule from './components/DualCalendarModule';
import EportfolioCopilotModule from './components/EportfolioCopilotModule';
import ICalModal from './components/ICalModal';
import NohranChatbot from './components/NohranChatbot';
import AddFacultyModal from './components/AddFacultyModal';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './components/LoginPage';
import { getStoredSession, storeSession, clearSession } from './utils/auth';
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
  const [currentUser, setCurrentUser] = useState(() => getStoredSession());
  const [facultyList, setFacultyList] = useState(FACULTY_MEMBERS);
  const [activeFaculty, setActiveFaculty] = useState(FACULTY_MEMBERS[0]);
  const [userRole, setUserRole] = useState('faculty'); // 'faculty' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'ingestion' | 'drawer' | 'calendar' | 'eportfolio'
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [selectedOrderIdForEportfolio, setSelectedOrderIdForEportfolio] = useState(null);
  const [highlightOrderId, setHighlightOrderId] = useState(null);
  const [isIcalOpen, setIsIcalOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [isAddFacultyOpen, setIsAddFacultyOpen] = useState(false);
  const [toast, setToast] = useState(null);

  // Sync with Supabase on mount
  useEffect(() => {
    async function syncFromSupabase() {
      try {
        const [facs, ords] = await Promise.all([
          fetchFacultiesFromSupabase(FACULTY_MEMBERS),
          fetchOrdersFromSupabase(INITIAL_ORDERS)
        ]);
        if (facs && facs.length > 0) {
          setFacultyList(facs);
          // If logged in as specific faculty, retain that faculty
          if (currentUser?.facultyId) {
            const matched = facs.find(f => f.id === currentUser.facultyId);
            if (matched) setActiveFaculty(matched);
            else setActiveFaculty(facs[0]);
          } else {
            setActiveFaculty(facs[0]);
          }
        }
        if (ords && ords.length > 0) {
          setOrders(ords);
        }
      } catch (err) {
        console.warn('[Supabase Sync] Operating with local state fallback:', err);
      }
    }
    syncFromSupabase();
  }, []);

  // URL Deep-link listener (e.g. from Google Calendar, email, notifications)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!currentUser) return; // Only process deep link when authenticated

    const handleDeepLink = () => {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      const orderIdParam = params.get('orderId') || params.get('order') || params.get('drawer');
      const facultyParam = params.get('faculty');

      if (facultyParam && facultyList?.length > 0) {
        const foundFaculty = facultyList.find(f => f.id === facultyParam);
        if (foundFaculty) setActiveFaculty(foundFaculty);
      } else if (orderIdParam && orders?.length > 0) {
        // Switch to assigned faculty if needed
        const targetOrder = orders.find(o => o.id === orderIdParam);
        if (targetOrder?.facultyAssigned?.length > 0) {
          const targetFacId = targetOrder.facultyAssigned[0].id;
          const foundFaculty = facultyList.find(f => f.id === targetFacId);
          if (foundFaculty && foundFaculty.id !== activeFaculty?.id) {
            setActiveFaculty(foundFaculty);
          }
        }
      }

      if (orderIdParam) {
        setActiveTab('drawer');
        setHighlightOrderId(orderIdParam);
        const targetOrder = (orders || []).find(o => o.id === orderIdParam);
        const label = targetOrder ? targetOrder.orderNumber : orderIdParam;
        showToast(`เปิดตู้ลิ้นชักงานคำสั่ง [${label}] จากลิงก์ Google Calendar สำเร็จ! 🎯`, 'success');
      } else if (tabParam && ['dashboard', 'ingestion', 'drawer', 'calendar', 'eportfolio'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    };

    handleDeepLink();
    window.addEventListener('popstate', handleDeepLink);
    return () => window.removeEventListener('popstate', handleDeepLink);
  }, [facultyList, orders, currentUser]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Auth Handlers
  const handleLoginSuccess = (user, rememberMe = true) => {
    if (rememberMe) {
      storeSession(user);
    } else {
      clearSession();
    }
    setCurrentUser(user);

    // If user has specific faculty assigned, activate it
    if (user.facultyId && facultyList?.length > 0) {
      const matched = facultyList.find(f => f.id === user.facultyId);
      if (matched) setActiveFaculty(matched);
    }

    if (user.isSuperAdmin || user.role === 'admin') {
      setUserRole('admin');
    } else {
      setUserRole('faculty');
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    showToast(`ยินดีต้อนรับคุณ ${user.name} เข้าสู่ระบบ UniWorkload AI! 🎯`, 'success');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    showToast('ออกจากระบบเรียบร้อยแล้ว', 'info');
  };

  // Add new faculty member
  const handleAddFaculty = (newFaculty, addSampleOrder = true) => {
    setFacultyList((prev) => [...prev, newFaculty]);
    setActiveFaculty(newFaculty);

    // Persist faculty to Supabase
    saveFacultyToSupabase(newFaculty);

    if (addSampleOrder) {
      const sampleOrder = {
        id: `ord-${Date.now().toString().slice(-4)}`,
        orderNumber: `คก. 1055/2569`,
        title: `แต่งตั้งคณะกรรมการพัฒนาระบบเทคโนโลยีดิจิทัลและนวัตกรรม ประจำปีการศึกษา 2569`,
        signDate: new Date().toISOString().split('T')[0],
        eventDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
        eventTime: "09:00 - 16:30 น.",
        location: "ห้องประชุมวิชาการ คณะวิทยาการจัดการ มหาวิทยาลัยราชภัฏนครสวรรค์",
        category: "บริหาร/กรรมการ/ภารกิจมหาวิทยาลัย",
        categoryCode: "admin",
        categoryColor: "purple",
        facultyAssigned: [
          { id: newFaculty.id, name: newFaculty.name, roleInOrder: "กรรมการและเลขานุการฝ่ายพัฒนาระบบดิจิทัล" }
        ],
        status: "upcoming",
        evidenceFiles: [],
        actualPhotos: [],
        ePortfolio: {
          year: "2569",
          round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
          topic: "กรรมการพัฒนาระบบเทคโนโลยีดิจิทัลและนวัตกรรม ประจำปีการศึกษา 2569",
          role: "กรรมการและเลขานุการ",
          hours: 6,
          workloadRef: "ภาระงานด้านบริหาร/กรรมการ/ภารกิจมหาวิทยาลัย มหาวิทยาลัยราชภัฏนครสวรรค์",
          resultSummary: "วางแผนและพัฒนาระบบดิจิทัลเพื่อสนับสนุนการบริหารจัดการภายในคณะ",
          status: "ready_to_export"
        }
      };
      setOrders((prev) => [sampleOrder, ...prev]);
      saveOrderToSupabase(sampleOrder, newFaculty.id);
    }

    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    showToast(`ลงทะเบียนและเปิดใช้งานตู้ลิ้นชักของ "${newFaculty.name}" เรียบร้อยแล้ว!`, 'success');
    setActiveTab('drawer');
  };

  // Add new order from AI Ingestion module
  const handleAddNewOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    saveOrderToSupabase(newOrder, activeFaculty?.id || 'fac-1');
    
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
    let nextStatus = 'done';
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          nextStatus = ord.status === 'done' ? 'upcoming' : 'done';
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
    updateOrderStatusInSupabase(orderId, nextStatus);
    showToast('อัปเดตสถานะการปฏิบัติงานเรียบร้อยแล้ว', 'info');
  };

  // Save additional evidence photo
  const handleSaveEvidence = (orderId, newEvidence) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            actualPhotos: [...(ord.actualPhotos || []), newEvidence]
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

  // Simulate adding sample order for active faculty
  const handleAddSampleOrderForActiveFaculty = () => {
    const sampleOrder = {
      id: `ord-${Date.now().toString().slice(-4)}`,
      orderNumber: `คก. 1066/2569`,
      title: `แต่งตั้งคณะกรรมการพัฒนานวัตกรรมการจัดการเรียนรู้ในศตวรรษที่ 21 ประจำปีการศึกษา 2569`,
      signDate: new Date().toISOString().split('T')[0],
      eventDate: new Date(Date.now() + 86400000 * 4).toISOString().split('T')[0],
      eventTime: "09:00 - 16:30 น.",
      location: "ห้องปฏิบัติการคอมพิวเตอร์และสื่อสารดิจิทัล มหาวิทยาลัยราชภัฏนครสวรรค์",
      category: "การจัดการเรียนการสอน",
      categoryCode: "teaching",
      categoryColor: "amber",
      facultyAssigned: [
        { id: activeFaculty?.id || 'fac-1', name: activeFaculty?.name || 'อาจารย์', roleInOrder: "กรรมการดำเนินงานและวิทยากรประจำกลุ่ม" }
      ],
      status: "upcoming",
      evidenceFiles: [],
      actualPhotos: [],
      ePortfolio: {
        year: "2569",
        round: "รอบ 2 (1 เม.ย. - 30 ก.ย. 2569)",
        topic: "พัฒนานวัตกรรมการจัดการเรียนรู้ในศตวรรษที่ 21 ประจำปีการศึกษา 2569",
        role: "กรรมการดำเนินงานและวิทยากรประจำกลุ่ม",
        hours: 6,
        workloadRef: "ภาระงานด้านการจัดการเรียนการสอน มหาวิทยาลัยราชภัฏนครสวรรค์",
        resultSummary: "จัดกิจกรรมอบรมเชิงปฏิบัติการเพื่อส่งเสริมสมรรถนะดิจิทัลแก่นักศึกษา",
        status: "ready_to_export"
      }
    };
    setOrders((prev) => [sampleOrder, ...prev]);
    showToast(`จำลองส่งคำสั่งแต่งตั้ง [${sampleOrder.orderNumber}] เข้าตู้ลิ้นชักอาจารย์เรียบร้อยแล้ว!`, 'success');
  };

  // Jump directly to e-portfolio tab for a specific order
  const handleJumpToEportfolio = (order) => {
    const targetId = typeof order === 'object' && order !== null ? order.id : order;
    setSelectedOrderIdForEportfolio(targetId);
    setActiveTab('eportfolio');
  };

  // Unauthenticated: Render Login Page
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-950 font-sans selection:bg-sky-500 selection:text-white">
        <LoginPage
          onLoginSuccess={handleLoginSuccess}
          facultyList={facultyList}
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
      </div>
    );
  }

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
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenIngest={() => setActiveTab('ingestion')}
        onOpenIcal={() => setIsIcalOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        onOpenAddFaculty={() => setIsAddFacultyOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ErrorBoundary onReset={() => setActiveTab('dashboard')}>
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <StatsOverview
                activeFaculty={activeFaculty}
                currentUser={currentUser}
                onOpenIngest={() => setActiveTab('ingestion')}
                onNavigateTab={(tab) => setActiveTab(tab)}
              />
              <DashboardOverview
                orders={orders}
                activeFaculty={activeFaculty}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onToggleStatus={handleToggleStatus}
                onJumpToEportfolio={handleJumpToEportfolio}
                onOpenIcal={() => setIsIcalOpen(true)}
                onOpenIngest={() => setActiveTab('ingestion')}
              />
            </div>
          )}

          {activeTab === 'ingestion' && (
            <div className="animate-in fade-in duration-300">
              <IngestionModule
                onAddNewOrder={handleAddNewOrder}
                onNotify={showToast}
                facultyList={facultyList}
                activeFaculty={activeFaculty}
              />
            </div>
          )}

          {activeTab === 'drawer' && (
            <div className="animate-in fade-in duration-300">
              <PersonalDrawerModule
                orders={orders}
                activeFaculty={activeFaculty}
                highlightOrderId={highlightOrderId}
                onToggleStatus={handleToggleStatus}
                onSaveEvidence={handleSaveEvidence}
                onDeleteEvidence={handleDeleteEvidence}
                onJumpToEportfolio={handleJumpToEportfolio}
                onNotify={showToast}
                onAddSampleOrder={handleAddSampleOrderForActiveFaculty}
                onOpenAddFaculty={() => setIsAddFacultyOpen(true)}
              />
            </div>
          )}

          {activeTab === 'calendar' && (
            <div className="animate-in fade-in duration-300">
              <DualCalendarModule
                orders={orders}
                activeFaculty={activeFaculty}
                onToggleStatus={handleToggleStatus}
                onSaveEvidence={handleSaveEvidence}
                onDeleteEvidence={handleDeleteEvidence}
                onOpenIcal={() => setIsIcalOpen(true)}
                onJumpToEportfolio={handleJumpToEportfolio}
                onJumpToDrawer={(orderId) => {
                  setHighlightOrderId(orderId);
                  setActiveTab('drawer');
                }}
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
        </ErrorBoundary>
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

      {/* Add New Faculty Modal */}
      <AddFacultyModal
        isOpen={isAddFacultyOpen}
        onClose={() => setIsAddFacultyOpen(false)}
        onAddFaculty={handleAddFaculty}
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
              <strong>UniWorkload AI</strong> — โครงงานพัฒนาระบบปฏิทินภาระงานและจัดเก็บหลักฐานอัจฉริยะ (Capstone Project)
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
