import React from 'react';
import { ShieldCheck, Heart, Download } from 'lucide-react';
import { APP_CONFIG } from '../../appConfig.js';

interface FooterProps {
  onDownloadStandalone: () => void;
  onSelectSubject: (subjId: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onDownloadStandalone,
  onSelectSubject
}) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs sm:text-sm pt-14 pb-12 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-xl shadow">
                5J
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                KELAS 5 JUARA
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Platform AI Generator Soal Asesmen Tes Kemampuan Akademik (TKA) dan Ujian Interaktif SD/MI berstandar resmi Pusat Asesmen Pendidikan (Pusmendik) Kemendikdasmen RI.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-blue-300 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Standar Kurikulum Merdeka & HOTS Terverifikasi</span>
            </div>
          </div>

          {/* Col 2: Mapel Utama */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Mata Pelajaran Utama
            </h4>
            <ul className="space-y-2 text-xs">
              {APP_CONFIG.subjects.slice(0, 5).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onSelectSubject(s.id)}
                    className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Muatan & Sumber Daya */}
          <div>
            <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-3">
              Muatan & Sumber Daya
            </h4>
            <ul className="space-y-2 text-xs">
              {APP_CONFIG.subjects.slice(5).map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => onSelectSubject(s.id)}
                    className="hover:text-blue-400 transition-colors cursor-pointer text-left"
                  >
                    {s.name}
                  </button>
                </li>
              ))}
              <li className="pt-2">
                <button
                  onClick={onDownloadStandalone}
                  className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh TKA_GURU.html</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <div>
            © {new Date().getFullYear()} KELAS 5 JUARA — TKA Guru. Dikembangkan untuk Guru & Siswa Indonesia.
          </div>
          <div className="flex items-center gap-1">
            <span>Dibuat dengan dedikasi untuk Asesmen Berkualitas</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline ml-0.5" />
          </div>
        </div>

      </div>
    </footer>
  );
};
