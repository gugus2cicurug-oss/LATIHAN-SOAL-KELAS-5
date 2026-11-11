import React from 'react';
import { 
  LayoutDashboard, 
  Sparkles, 
  Upload, 
  FileText, 
  PenTool, 
  BookOpen, 
  User, 
  LogIn 
} from 'lucide-react';
import { RegisteredUser } from '../types';

interface MobileBottomNavProps {
  activeView: 'dashboard' | 'create' | 'naskah' | 'exam' | 'result';
  setActiveView: (view: 'dashboard' | 'create' | 'naskah' | 'exam' | 'result') => void;
  openUploadModal: () => void;
  openLoginModal: () => void;
  currentUser: RegisteredUser | null;
  hasActivePackage: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeView,
  setActiveView,
  openUploadModal,
  openLoginModal,
  currentUser,
  hasActivePackage
}) => {
  const isAdminGuru = currentUser?.role === 'guru' || currentUser?.role === 'admin';

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-2xl no-print">
      <div className="flex items-center justify-around">
        
        {/* Tab 1: Beranda */}
        <button
          onClick={() => setActiveView('dashboard')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
            activeView === 'dashboard'
              ? 'text-blue-600 bg-blue-50/80 font-black'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {isAdminGuru ? <LayoutDashboard className="w-4 h-4 mb-0.5" /> : <BookOpen className="w-4 h-4 mb-0.5" />}
          <span>{isAdminGuru ? 'Dashboard' : 'Daftar Soal'}</span>
        </button>

        {/* Tab 2: Upload Naskah (Khusus Admin Guru) */}
        {isAdminGuru && (
          <button
            onClick={openUploadModal}
            className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <Upload className="w-4 h-4 mb-0.5 text-blue-600" />
            <span>Upload</span>
          </button>
        )}

        {/* Tab 3: Buat Naskah AI (Khusus Admin Guru) */}
        {isAdminGuru && (
          <button
            onClick={() => setActiveView('create')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'create'
                ? 'text-blue-600 bg-blue-50/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4 mb-0.5 text-amber-500" />
            <span>AI Buat</span>
          </button>
        )}

        {/* Tab 4: Ujian Siswa (Untuk Pengunjung & Guru) */}
        {hasActivePackage && (
          <button
            onClick={() => setActiveView('exam')}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold transition-colors ${
              activeView === 'exam'
                ? 'text-blue-600 bg-blue-50/80 font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenTool className="w-4 h-4 mb-0.5 text-indigo-600" />
            <span>{isAdminGuru ? 'Ujian' : 'Mulai Ujian'}</span>
          </button>
        )}

        {/* Tab 5: Akun / Login */}
        <button
          onClick={openLoginModal}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-xl text-[10px] font-bold text-slate-600 hover:text-blue-600 transition-colors"
        >
          {currentUser ? (
            <div className={`w-4 h-4 rounded-full text-white text-[9px] font-black flex items-center justify-center mb-0.5 ${
              isAdminGuru ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              {currentUser.avatar.slice(0, 1)}
            </div>
          ) : (
            <LogIn className="w-4 h-4 mb-0.5 text-blue-600" />
          )}
          <span>{currentUser ? currentUser.displayName.split(' ')[0] : 'Login Guru'}</span>
        </button>

      </div>
    </div>
  );
};
