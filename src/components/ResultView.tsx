import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  Trophy, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  RotateCcw, 
  FileText, 
  ArrowRight, 
  BookOpen, 
  Target,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { TKAPackage } from '../data/defaultPackages';
import { ExamEvaluation } from '../types';

interface ResultViewProps {
  pkg: TKAPackage;
  evaluation: ExamEvaluation;
  onRetakeExam: () => void;
  onViewNaskah: () => void;
  onGoDashboard: () => void;
}

export const ResultView: React.FC<ResultViewProps> = ({
  pkg,
  evaluation,
  onRetakeExam,
  onViewNaskah,
  onGoDashboard
}) => {
  // Fire confetti if high score
  useEffect(() => {
    if (evaluation.score >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [evaluation.score]);

  const getPredicateColor = (cat: string) => {
    switch (cat) {
      case 'SANGAT MAHIR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'MAHIR':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'CAKAP':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m} Menit ${s} Detik`;
  };

  return (
    <div className="max-w-4xl mx-auto my-6 px-4 sm:px-6 no-print">
      
      {/* Score Banner Hero */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl p-8 sm:p-12 shadow-xl text-center relative overflow-hidden mb-8 border border-blue-700">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider mb-4 border border-white/20">
            <Trophy className="w-3.5 h-3.5 text-amber-300" />
            HASIL ASESMEN RESMI PUSMENDIK KEMENDIKDASMEN
          </div>

          <div className="mx-auto w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-white/10 border-4 border-white/30 flex flex-col items-center justify-center shadow-inner mb-4">
            <span className="text-4xl sm:text-5xl font-black tracking-tight text-white">
              {evaluation.score}
            </span>
            <span className="text-[11px] font-bold text-blue-200 uppercase tracking-widest">
              SKOR AKHIR
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            {pkg.title}
          </h2>

          <div className="inline-block mt-1">
            <span className={`px-4 py-1.5 rounded-full text-xs sm:text-sm font-extrabold border uppercase tracking-wider ${getPredicateColor(evaluation.gradeCategory)}`}>
              Predikat: {evaluation.gradeCategory}
            </span>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-8 pt-8 border-t border-white/20 max-w-2xl mx-auto text-left">
            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="block text-xs text-blue-200 font-medium">Jumlah Benar</span>
              <strong className="text-xl font-black text-emerald-300">{evaluation.correctCount} Soal</strong>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="block text-xs text-blue-200 font-medium">Jumlah Salah</span>
              <strong className="text-xl font-black text-rose-300">{evaluation.incorrectCount} Soal</strong>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="block text-xs text-blue-200 font-medium">Akurasi</span>
              <strong className="text-xl font-black text-amber-300">{evaluation.accuracyPercentage}%</strong>
            </div>

            <div className="bg-white/10 rounded-xl p-3 border border-white/10">
              <span className="block text-xs text-blue-200 font-medium">Waktu Ujian</span>
              <strong className="text-sm sm:text-base font-black text-white">{formatDuration(evaluation.durationSeconds)}</strong>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
            <button
              onClick={onRetakeExam}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-blue-900 hover:bg-blue-50 transition-colors shadow"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Kerjakan Ulang Ujian</span>
            </button>

            <button
              onClick={onViewNaskah}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <FileText className="w-4 h-4" />
              <span>Lihat Lembar Naskah A4</span>
            </button>

            <button
              onClick={onGoDashboard}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors border border-white/20"
            >
              <span>Dashboard Guru</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>

      {/* Competency Mastery Breakdown */}
      {Object.keys(evaluation.competencyStats).length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm mb-8">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Analisis Performa Berdasarkan Indikator Materi
            </h3>
          </div>

          <div className="space-y-3">
            {Object.entries(evaluation.competencyStats).map(([compName, stat]) => {
              const pct = Math.round((stat.correct / stat.total) * 100);
              return (
                <div key={compName} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5">
                    <span className="font-semibold text-slate-800 line-clamp-1">{compName}</span>
                    <span className="font-bold text-blue-700 ml-2">{stat.correct} / {stat.total} Benar ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        pct >= 75 ? 'bg-emerald-500' : pct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Remedial Recommendation Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 sm:p-6 mb-8 text-amber-950">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-sm sm:text-base text-amber-900 mb-1">
              Rekomendasi Tindak Lanjut Guru (Remedial & Pengayaan):
            </h4>
            <p className="text-xs sm:text-sm text-amber-800 leading-relaxed">
              {evaluation.score >= 85
                ? 'Siswa telah menunjukkan penguasaan penalaran HOTS yang luar biasa. Berikan materi pengayaan berupa pemecahan masalah multidisiplin dan eksplorasi proyek literasi sains.'
                : evaluation.score >= 70
                ? 'Siswa telah menguasai kompetensi dasar dengan baik. Lakukan penguatan pada butir soal penalaran kompleks (L3) dan verifikasi bukti rujukan stimulus.'
                : 'Diperlukan bimbingan remedial terbimbing pada materi operasional dan latihan membaca cermat teks stimulus sebelum menarik kesimpulan.'}
            </p>
          </div>
        </div>
      </div>

      {/* Comprehensive Question Review */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <h3 className="text-lg font-extrabold text-slate-900 mb-6 flex items-center justify-between">
          <span>Pembahasan Lengkap Tiap Butir Soal</span>
          <span className="text-xs font-semibold text-slate-500">
            {evaluation.breakdown.length} Butir Soal
          </span>
        </h3>

        <div className="space-y-6">
          {evaluation.breakdown.map((item) => {
            const q = item.question;
            const isCorrect = item.isCorrect;

            return (
              <div
                key={q.number}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80">
                  <div className="flex items-center gap-2">
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Jawaban Benar
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Jawaban Belum Tepat
                      </span>
                    )}
                    <span className="text-xs font-bold text-slate-800">
                      Soal Nomor {q.number}
                    </span>
                  </div>

                  <span className="text-xs font-semibold text-slate-500">
                    {q.cognitiveLevel}
                  </span>
                </div>

                {/* Prompt */}
                <p className="text-sm sm:text-base font-semibold text-slate-900 mb-3 leading-snug">
                  {q.prompt}
                </p>

                {/* Student answer vs Key */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 text-xs sm:text-sm">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="block font-bold text-slate-500 text-[11px] uppercase mb-0.5">
                      Jawaban Siswa:
                    </span>
                    <strong className={isCorrect ? 'text-emerald-700 font-extrabold' : 'text-rose-700 font-extrabold'}>
                      {item.userAnswer !== undefined && item.userAnswer !== null
                        ? typeof item.userAnswer === 'object'
                          ? JSON.stringify(item.userAnswer)
                          : String(item.userAnswer)
                        : '(Tidak Dijawab / Kosong)'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="block font-bold text-slate-500 text-[11px] uppercase mb-0.5">
                      Kunci Jawaban Resmi:
                    </span>
                    <strong className="text-blue-700 font-extrabold">
                      {typeof q.correctAnswer === 'object'
                        ? JSON.stringify(q.correctAnswer)
                        : String(q.correctAnswer)}
                    </strong>
                  </div>
                </div>

                {/* Step by step explanation */}
                <div className="p-3.5 rounded-xl bg-white border border-slate-200/90 text-xs sm:text-sm text-slate-700 leading-relaxed font-sans">
                  <strong className="block text-blue-900 font-bold mb-1">
                    Langkah Solusi & Rujukan Pembahasan:
                  </strong>
                  <div className="whitespace-pre-line">{q.explanation}</div>
                </div>

              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
