import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200/80 p-6 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>
            
            <h2 className="text-lg font-bold text-slate-900 mb-1">
              เกิดข้อผิดพลาดในการแสดงผล
            </h2>
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              ระบบตรวจพบคอนฟลิกต์ของการโหลดข้อมูลชั่วคราว สามารถกดปุ่มรีโหลดหน้าจอเพื่อโหลดใหม่ได้ทันทีครับ
            </p>

            {this.state.error && (
              <div className="mb-5 p-3 rounded-xl bg-slate-100 text-left font-mono text-[11px] text-slate-700 overflow-x-auto border border-slate-200/60 max-h-32">
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex gap-2.5 justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                รีโหลดหน้าจอ (Reload)
              </button>
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Home className="w-3.5 h-3.5" />
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
