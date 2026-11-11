import React, { useState } from 'react';
import { 
  PenTool, 
  BookOpen, 
  Timer, 
  Calendar, 
  Star, 
  Megaphone, 
  ShieldCheck, 
  CheckCircle2, 
  Lock, 
  ArrowRight,
  LogIn
} from 'lucide-react';
import { TKAPackage } from '../data/defaultPackages';
import { SiteSettings } from '../types';

interface StudentHomeViewProps {
  packages: TKAPackage[];
  siteSettings: SiteSettings;
  onStartExam: (pkg: TKAPackage) => void;
  onViewNaskah: (pkg: TKAPackage) => void;
  onOpenLogin: () => void;
}

export const StudentHomeView: React.FC<StudentHomeViewProps> = ({
  packages,
  siteSettings,
  onStartExam,
  onViewNaskah,
  onOpenLogin
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string>('all');

  // Filter only published packages
  const publishedPackages = packages.filter(p => p.isPublished !== false);

  const subjectsList = Array.from(new Set(publishedPackages.map(p => p.subject)));

  const filteredPackages = selectedSubject === 'all'
    ? publishedPackages
    : publishedPackages.filter(p => p.subject === selectedSubject);

  return (
    <div className="space-y-6 sm:space-y-8 no-print pb-16 lg:pb-8">
      
      {/* Teacher's Live Announcement Banner (Configured by Admin Guru) */}
      {siteSettings.showAnnouncement && siteSettings.announcement && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3 shadow-xs animate-in fade-in duration-150">
          <Megaphone className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
          <div className="flex-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 block mb-0.5">
              PENGUMUMAN DARI GURU
            </span>
            <div className="text-xs sm:text-sm font-semibold leading-relaxed">
              {siteSettings.announcement}
            </div>
          </div>
        </div>
      )}

      {/* Student Friendly Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-700/50">
        <div className="relative z-10 max-w-3xl">
          
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-200 text-[11px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
              PORTAL UJIAN SISWA • {siteSettings.schoolName}
            </span>

            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white/10 text-[11px] font-semibold text-white/90">
              {publishedPackages.length} Paket Ujian Siap Dikerjakan
            </span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-2.5">
            {siteSettings.heroTitle}
          </h1>

          <p className="text-xs sm:text-base text-blue-100/90 leading-relaxed max-w-2xl font-normal mb-6">
            {siteSettings.heroSubtitle}
          </p>

          <div className="p-3 rounded-xl bg-white/10 border border-white/20 text-xs sm:text-sm flex items-center justify-between gap-3 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-semibold text-white">Status: Mode Pengunjung / Siswa Aktif</span>
            </div>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1 text-xs font-bold text-sky-200 hover:text-white underline"
            >
              <Lock className="w-3 h-3" />
              <span>Login Guru</span>
            </button>
          </div>

        </div>
      </div>

      {/* Filter by Subject Chips if multiple */}
      {subjectsList.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider shrink-0">
            Mata Pelajaran:
          </span>
          <button
            onClick={() => setSelectedSubject('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${
              selectedSubject === 'all'
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            Semua ({publishedPackages.length})
          </button>
          {subjectsList.map((subj) => (
            <button
              key={subj}
              onClick={() => setSelectedSubject(subj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors whitespace-nowrap ${
                selectedSubject === subj
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {subj}
            </button>
          ))}
        </div>
      )}

      {/* Published Packages Grid (HANYA PAKET YANG DI-PUBLISH GURU) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
            Pilih Paket Ujian yang Akan Dikerjakan:
          </h2>
        </div>

        {filteredPackages.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-xl">
              📝
            </div>
            <h3 className="font-bold text-slate-800 text-base">Belum Ada Soal yang Dipublikasikan</h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
              Bapak/Ibu Guru belum mengaktifkan naskah soal untuk sesi latihan ini. Silakan hubungi guru kelas atau login sebagai admin guru.
            </p>
            <button
              onClick={onOpenLogin}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Login Admin Guru</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredPackages.map((pkg) => {
              const totalQ = pkg.stimulusGroups.reduce((acc, sg) => acc + sg.questions.length, 0);
              const isFeatured = !!pkg.isFeatured;

              return (
                <div
                  key={pkg.id}
                  className={`bg-white rounded-3xl border p-5 sm:p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                    isFeatured ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200 hover:border-blue-400'
                  }`}
                >
                  <div>
                    
                    {/* Badges */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                        {pkg.subject}
                      </span>

                      {isFeatured ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                          <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                          <span>Ujian Utama Hari Ini</span>
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{pkg.grade}</span>
                        </span>
                      )}
                    </div>

                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 line-clamp-2 mb-2 leading-snug">
                      {pkg.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4">
                      {pkg.competencySummary}
                    </p>

                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 mb-5">
                      <span className="text-blue-700">📝 {totalQ} Butir Soal</span>
                      <span>•</span>
                      <span className="text-emerald-700">⏱️ {pkg.timeLimitMinutes} Menit</span>
                      <span>•</span>
                      <span>{pkg.stimulusGroups.length} Stimulus</span>
                    </div>

                  </div>

                  {/* Big Action Buttons (Optimized for Mobile Touch) */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => onStartExam(pkg)}
                      className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <PenTool className="w-4 h-4" />
                      <span>Mulai Kerjakan Ujian Sekarang</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onViewNaskah(pkg)}
                      className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-xs border border-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                      <span>Lihat Kisi-Kisi & Teks Naskah</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
