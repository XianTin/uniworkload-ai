import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[UniWorkload ErrorBoundary Catch]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6 bg-slate-50">
          <div className="max-w-lg w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60 shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                พบข้อผิดพลาดชั่วคราวในการแสดงผลหน้านี้
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                ระบบตรวจพบความไม่สมบูรณ์ของโครงสร้างข้อมูล (เช่น ข้อมูลบางฟิลด์จากเซิร์ฟเวอร์ยังโหลดไม่ครบ) 
                ระบบได้กักกันข้อผิดพลาดไว้ไม่ให้หน้าจอขาวทั้งหมด
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-left text-[11px] font-mono overflow-x-auto max-h-32">
                <span className="text-rose-400 font-bold block mb-1">Error Trace:</span>
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>รีโหลดส่วนนี้ใหม่</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-all cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                <span>รีเฟรชทั้งหน้าเว็บ</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
