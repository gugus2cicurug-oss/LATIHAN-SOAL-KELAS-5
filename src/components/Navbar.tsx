import React from 'react';
import { 
  FileText, 
  PenTool, 
  LayoutDashboard, 
  Bot, 
  Sparkles, 
  Upload, 
  LogIn, 
  Sliders, 
  BookOpen, 
  ShieldCheck, 
  User 
} from 'lucide-react';
import { RegisteredUser } from '../types';

interface NavbarProps {
  activeView: 'dashboard' | 'create' | 'naskah' | 'exam' | 'result';
  setActiveView: (view: 'dashboard' | 'create' | 'naskah' | 'exam' | 'result') => void;
  openAiDrawer: () => void;
  openLoginModal: () => void;
  openUploadModal: () => void;
  currentUser: RegisteredUser | null;
  hasActivePackage: boolean;
  onDownloadStandalone: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  setActiveView,
  openAiDrawer,
  openLoginModal,
  openUploadModal,
  currentUser,
  hasActivePackage
}) => {
  const isAdminGuru = currentUser?.role === 'guru' || currentUser?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo High Contrast */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
            onClick={() => setActiveView('dashboard')}
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 flex items-center justify-center text-white font-extrabold text-xl sm:text-2xl shadow-md group-hover:scale-105 transition-transform shrink-0">
              5J
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-extrabold text-lg sm:text-2xl tracking-tight text-slate-900 leading-tight">
                  KELAS 5 JUARA
                </span>
                <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isAdminGuru ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-blue-100 text-blue-800 border-blue-200'
                }`}>
                  {isAdminGuru ? '👨‍🏫 ADMIN GURU' : '🎒 MODE SISWA'}
                </span>
              </div>
              <p className="text-[10px] sm:text-xs font-semibold text-blue-600 tracking-wider uppercase leading-none mt-0.5">
                {isAdminGuru ? 'Panel Guru • Pusmendik Kemendikdasmen' : 'Portal Ujian Siswa SD/MI'}
              </p>
            </div>
          </div>

          {/* Navigation Links Desktop - SEPARATED BY ROLE */}
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            {isAdminGuru ? (
              /* ADMIN GURU NAV ITEMS */
              <>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>Dashboard Guru</span>
                </button>

                <button
                  onClick={() => setActiveView('create')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeView === 'create'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>Input Kisi-Kisi AI</span>
                </button>

                {hasActivePackage && (
                  <button
                    onClick={() => setActiveView('naskah')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      activeView === 'naskah'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <FileText className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mode Naskah A4</span>
                  </button>
                )}

                {hasActivePackage && (
                  <button
                    onClick={() => setActiveView('exam')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      activeView === 'exam'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Uji Siswa</span>
                  </button>
                )}
              </>
            ) : (
              /* PENGUNJUNG / SISWA NAV ITEMS (HANYA BISA MENGERJAKAN SOAL) */
              <>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    activeView === 'dashboard'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                  <span>Daftar Soal Siswa</span>
                </button>

                {hasActivePackage && (
                  <button
                    onClick={() => setActiveView('exam')}
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                      activeView === 'exam'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <PenTool className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Mulai Ujian</span>
                  </button>
                )}
              </>
            )}
          </nav>

          {/* Action Buttons Right Header */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Hanya Guru yang melihat tombol Upload Naskah */}
            {isAdminGuru && (
              <button
                onClick={openUploadModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-all shadow-xs"
                title="Upload naskah soal dari berkas JSON atau teks"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Upload Naskah</span>
                <span className="sm:hidden">Upload</span>
              </button>
            )}

            {/* AI Consultant (Khusus Guru/Admin) */}
            {isAdminGuru && (
              <button
                onClick={openAiDrawer}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <Bot className="w-3.5 h-3.5 text-blue-600" />
                <span>Konsultan AI</span>
              </button>
            )}

            {/* Tombol Login / Profil Pengguna */}
            {currentUser ? (
              <button
                onClick={openLoginModal}
                className={`flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 text-xs font-bold rounded-xl border transition-all ${
                  isAdminGuru
                    ? 'bg-amber-50 hover:bg-amber-100 border-amber-300 text-amber-950'
                    : 'bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-950'
                }`}
                title={`Akun: @${currentUser.username} (${currentUser.role})`}
              >
                <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                  isAdminGuru ? 'bg-amber-600' : 'bg-blue-600'
                }`}>
                  {currentUser.avatar}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="font-extrabold text-[12px] leading-tight line-clamp-1 max-w-[110px]">
                    {currentUser.displayName.split(' ')[0]}
                  </div>
                  <div className={`text-[10px] font-bold uppercase tracking-wide ${
                    isAdminGuru ? 'text-amber-700' : 'text-blue-600'
                  }`}>
                    {isAdminGuru ? 'Admin Guru' : 'Siswa'}
                  </div>
                </div>
              </button>
            ) : (
              /* PENGUNJUNG YANG BELUM LOGIN */
              <button
                onClick={openLoginModal}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-500/20 active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>🔐 Login Admin Guru</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
