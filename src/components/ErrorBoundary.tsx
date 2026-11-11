import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in KELAS 5 JUARA applet:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('tka_guru_site_settings_v1');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans text-slate-800">
          <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xl text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-3xl font-black">
              ⚠️
            </div>
            <h1 className="text-xl font-black text-slate-900">
              Terjadi Kendala Memuat Aplikasi
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Aplikasi KELAS 5 JUARA mengalami kendala saat memuat data di peramban Anda. Silakan muat ulang halaman.
            </p>
            {this.state.error && (
              <pre className="p-3 bg-slate-100 rounded-xl text-[11px] text-slate-700 text-left overflow-x-auto max-h-32">
                {this.state.error.message}
              </pre>
            )}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleReset}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-bold cursor-pointer"
              >
                Reset Pengaturan & Muat Ulang
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
