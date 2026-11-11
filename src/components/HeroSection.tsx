import React from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Calculator, 
  Download, 
  CheckCircle2, 
  ShieldCheck, 
  Upload, 
  LogIn, 
  User, 
  ArrowRight 
} from 'lucide-react';
import { RegisteredUser } from '../types';

interface HeroSectionProps {
  onStartCreate: () => void;
  onOpenPreset: (presetIndex: number) => void;
  onDownloadStandalone: () => void;
  onOpenUpload: () => void;
  onOpenLogin: () => void;
  currentUser: RegisteredUser | null;
  hasApiKey: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartCreate,
  onOpenPreset,
  onDownloadStandalone,
  onOpenUpload,
  onOpenLogin,
  currentUser,
  hasApiKey
}) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-blue-800 to-indigo-950 text-white rounded-3xl p-5 sm:p-10 lg:p-14 shadow-2xl border border-blue-700/50 mb-8 sm:mb-10 no-print">
      {/* Decorative light blur background */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl">
        
        {/* Accreditation and API status tag */}
        <div className="flex flex-wrap items-center gap-2 mb-4 sm:mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[11px] sm:text-xs font-bold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            STANDAR RESMI PUSMENDIK KEMENDIKDASMEN RI
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[11px] sm:text-xs font-semibold text-white/90 border border-white/20">
            <span className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-emerald-400 animate-pulse' : 'bg-blue-400'}`} />
            {hasApiKey ? 'Gemini 3.8 Flash AI Aktif' : 'Engine Generator Cerdas Aktif'}
          </div>

          {currentUser ? (
            <div 
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[11px] sm:text-xs font-bold cursor-pointer hover:bg-emerald-500/30 transition-colors"
            >
              <User className="w-3 h-3" />
              <span>Login: @{currentUser.username} ({currentUser.displayName.split(' ')[0]})</span>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/40 text-[11px] sm:text-xs font-bold hover:bg-amber-500/30 transition-colors"
            >
              <LogIn className="w-3 h-3" />
              <span>Masuk Akun Terdaftar</span>
            </button>
          )}
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight mb-3 sm:mb-4">
          Buat Naskah TKA Lebih Mudah <br className="hidden sm:inline" />
          dengan <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-sky-200 to-indigo-200">Kecerdasan Buatan (AI)</span>
        </h1>

        {/* Hero Description */}
        <p className="text-xs sm:text-base lg:text-lg text-blue-100/90 leading-relaxed mb-6 sm:mb-8 max-w-3xl font-normal">
          Platform EdTech otomasi asesmen untuk Guru & Siswa SD/MI. Cukup masukkan kisi-kisi atau upload naskah soal, AI menyusun stimulus orisinal, 
          merancang 3 butir soal bertingkat per stimulus, kunci jawaban, pembahasan ilmiah, serta menyiapkan lembar ujian cetak A4 dan simulasi interaktif.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5 mb-8 sm:mb-10">
          <button
            onClick={onStartCreate}
            className="flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 text-xs sm:text-base font-bold text-blue-950 bg-white rounded-xl hover:bg-blue-50 transition-all shadow-lg shadow-white/10 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            <span>Generate Naskah Baru</span>
            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
          </button>

          {/* Tombol Khusus Upload Naskah Soal */}
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 text-xs sm:text-base font-bold text-white bg-blue-600/90 hover:bg-blue-600 border border-blue-400/50 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
          >
            <Upload className="w-4 h-4 text-amber-300" />
            <span>Upload Naskah Soal</span>
          </button>

          <button
            onClick={() => onOpenPreset(0)}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
          >
            <Calculator className="w-4 h-4 text-sky-300" />
            <span>Contoh Matematika</span>
          </button>

          <button
            onClick={() => onOpenPreset(1)}
            className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-3.5 text-xs sm:text-sm font-semibold text-white bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all"
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            <span>Contoh Bahasa Indonesia</span>
          </button>

          <button
            onClick={onDownloadStandalone}
            className="hidden sm:flex items-center gap-2 px-3.5 py-3 text-xs sm:text-sm font-semibold text-blue-200 bg-blue-950/60 border border-blue-400/30 rounded-xl hover:bg-blue-900/60 transition-all"
            title="Unduh satu file HTML mandiri (offline)"
          >
            <Download className="w-4 h-4 text-blue-300" />
            <span>TKA_GURU.html</span>
          </button>
        </div>

        {/* 3 Value Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-5 sm:pt-6 border-t border-blue-700/60 text-xs sm:text-sm text-blue-100">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-sky-300 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">1 Stimulus = 3 Soal</strong>
              Kaidah standar asesmen Pusmendik untuk menguji penalaran bertingkat.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">5 Tipe Soal Variatif</strong>
              Pilihan Ganda biasa, Pilihan Ganda Kompleks, Benar/Salah, & Sesuai/Tidak Sesuai.
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-300 shrink-0 mt-0.5" />
            <div>
              <strong className="block text-white font-bold mb-0.5">Cetak A4 & Simulasi HP</strong>
              Tampilan khusus handphone nyaman, tidak berantakan, serta cetak naskah resmi.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
