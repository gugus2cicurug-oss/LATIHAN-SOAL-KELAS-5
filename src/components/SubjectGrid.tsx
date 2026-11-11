import React from 'react';
import { 
  Calculator, 
  BookOpen, 
  Compass, 
  ShieldCheck, 
  HeartHandshake, 
  Globe, 
  Activity, 
  Palette, 
  Languages, 
  ArrowRight, 
  FileText 
} from 'lucide-react';
import { APP_CONFIG } from '../../appConfig.js';

interface SubjectGridProps {
  onSelectSubjectMatrix: (subjectId: string) => void;
}

export const SubjectGrid: React.FC<SubjectGridProps> = ({ onSelectSubjectMatrix }) => {
  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Calculator': return <Calculator className="w-6 h-6 text-blue-600" />;
      case 'BookOpen': return <BookOpen className="w-6 h-6 text-emerald-600" />;
      case 'Compass': return <Compass className="w-6 h-6 text-teal-600" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6 text-amber-600" />;
      case 'HeartHandshake': return <HeartHandshake className="w-6 h-6 text-purple-600" />;
      case 'Globe': return <Globe className="w-6 h-6 text-indigo-600" />;
      case 'Activity': return <Activity className="w-6 h-6 text-orange-600" />;
      case 'Palette': return <Palette className="w-6 h-6 text-rose-600" />;
      case 'Languages': return <Languages className="w-6 h-6 text-cyan-600" />;
      default: return <FileText className="w-6 h-6 text-blue-600" />;
    }
  };

  return (
    <section className="mb-12 no-print">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6">
        <div>
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Katalog Kurikulum Terakreditasi
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            9 Mata Pelajaran Asesmen TKA SD/MI
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pilih mata pelajaran untuk otomatis memuat matriks asesmen standar Pusmendik Kemendikdasmen RI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {APP_CONFIG.subjects.map((subj) => (
          <div
            key={subj.id}
            className="group relative bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center group-hover:scale-110 transition-transform">
                  {getSubjectIcon(subj.icon)}
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${subj.badgeColor}`}>
                  {subj.code} • {subj.defaultQuestions} Soal
                </span>
              </div>

              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-700 transition-colors">
                {subj.name}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 mt-1.5 line-clamp-3 leading-relaxed">
                {subj.description}
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">
                Pusmendik Matriks Ready
              </span>
              <button
                onClick={() => onSelectSubjectMatrix(subj.id)}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors group-hover:translate-x-1"
              >
                <span>Pakai Matriks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
