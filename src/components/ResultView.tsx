import React, { useEffect, useState, useMemo } from 'react';
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
  BarChart3,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  HelpCircle,
  Layers
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ReferenceLine
} from 'recharts';
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
  const [chartMode, setChartMode] = useState<'persentase' | 'soal'>('persentase');

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

  // Build chart dataset and competency diagnostics for teacher evaluation
  const { chartData, weakCompetencies, strongCompetencies } = useMemo(() => {
    const sourceMap: Record<string, { total: number; correct: number; questionNumbers: number[] }> = {};

    // Group questions by competency from breakdown
    evaluation.breakdown.forEach((item) => {
      const comp = item.question.competency || 'Kompetensi Pokok';
      if (!sourceMap[comp]) {
        sourceMap[comp] = { total: 0, correct: 0, questionNumbers: [] };
      }
      sourceMap[comp].total++;
      if (item.isCorrect) sourceMap[comp].correct++;
      sourceMap[comp].questionNumbers.push(item.question.number);
    });

    // If breakdown was empty, fallback to evaluation.competencyStats
    if (Object.keys(sourceMap).length === 0 && evaluation.competencyStats) {
      Object.entries(evaluation.competencyStats).forEach(([comp, stat]) => {
        sourceMap[comp] = { total: stat.total, correct: stat.correct, questionNumbers: [] };
      });
    }

    const data = Object.entries(sourceMap).map(([compName, stat]) => {
      const scorePct = stat.total > 0 ? Math.round((stat.correct / stat.total) * 100) : 0;
      const isWeak = scorePct < 60;
      const isStrong = scorePct >= 75;

      return {
        name: compName,
        displayName: compName.length > 20 ? compName.substring(0, 18) + '…' : compName,
        score: scorePct,
        benar: stat.correct,
        salah: Math.max(0, stat.total - stat.correct),
        total: stat.total,
        questionNumbers: stat.questionNumbers,
        status: isStrong ? 'Mahir' : scorePct >= 60 ? 'Cukup' : 'Perlu Bimbingan',
        fillColor: isStrong ? '#10b981' : scorePct >= 60 ? '#f59e0b' : '#ef4444'
      };
    });

    const weak = data.filter((d) => d.score < 60);
    const strong = data.filter((d) => d.score >= 75);

    return { chartData: data, weakCompetencies: weak, strongCompetencies: strong };
  }, [evaluation]);

  // Custom Recharts Tooltip for in-depth teacher inspection
  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl shadow-2xl border border-slate-700 text-xs max-w-xs space-y-1.5 z-50">
          <p className="font-extrabold text-amber-300 text-sm leading-snug">{data.name}</p>
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 pt-1">
            <span className="text-slate-400">Skor Penguasaan:</span>
            <span className="font-black text-emerald-400 text-sm">{data.score}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Jawaban Benar:</span>
            <span className="font-bold text-white">{data.benar} dari {data.total} Butir</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Jawaban Salah:</span>
            <span className="font-bold text-rose-400">{data.salah} Butir</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <span className="text-slate-400">Status Capaian:</span>
            <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
              data.score >= 75
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : data.score >= 60
                ? 'bg-amber-950 text-amber-300 border border-amber-800'
                : 'bg-rose-950 text-rose-300 border border-rose-800'
            }`}>
              {data.status}
            </span>
          </div>
          {data.questionNumbers && data.questionNumbers.length > 0 && (
            <div className="text-[11px] text-slate-300 pt-1">
              Nomor Soal: <strong className="text-white font-mono">{data.questionNumbers.join(', ')}</strong>
            </div>
          )}
          {data.score < 60 && (
            <div className="text-[11px] text-rose-200 bg-rose-950/80 p-2 rounded-xl border border-rose-800/60 mt-1 flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
              <span>Prioritas Remedial: Butuh penjelasan ulang dan bimbingan terarah guru.</span>
            </div>
          )}
        </div>
      );
    }
    return null;
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

      {/* Competency Mastery & Recharts Visualization */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm mb-8 space-y-6">
          
          {/* Header & Chart Mode Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
                <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
                <span>VISUALISASI DATA RECHARTS</span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                Grafik Skor Siswa Berdasarkan Kategori Kompetensi
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluasi tingkat pemahaman materi untuk mendeteksi kelemahan siswa dan menentukan prioritas remedial guru.
              </p>
            </div>

            {/* Toggle Mode Button */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200">
              <button
                type="button"
                onClick={() => setChartMode('persentase')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'persentase'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📊 % Penguasaan
              </button>
              <button
                type="button"
                onClick={() => setChartMode('soal')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  chartMode === 'soal'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                📋 Benar vs Salah
              </button>
            </div>
          </div>

          {/* Recharts Bar Chart Container */}
          <div className="w-full pt-2">
            <div className="h-80 sm:h-96 w-full">
              <ResponsiveContainer width="100%" height="100%">
                {chartMode === 'persentase' ? (
                  <BarChart
                    data={chartData}
                    margin={{ top: 25, right: 20, left: -10, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="displayName"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      unit="%"
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <ReferenceLine
                      y={75}
                      stroke="#2563eb"
                      strokeDasharray="4 4"
                      label={{
                        value: 'Target KKM (75%)',
                        position: 'insideTopRight',
                        fill: '#1d4ed8',
                        fontSize: 11,
                        fontWeight: 700
                      }}
                    />
                    <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={50}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fillColor} />
                      ))}
                    </Bar>
                  </BarChart>
                ) : (
                  <BarChart
                    data={chartData}
                    margin={{ top: 25, right: 20, left: -10, bottom: 45 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="displayName"
                      tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
                      interval={0}
                      angle={-15}
                      textAnchor="end"
                    />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748b' }}
                      allowDecimals={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Legend
                      verticalAlign="top"
                      wrapperStyle={{ paddingBottom: '12px', fontSize: '12px', fontWeight: 700 }}
                    />
                    <Bar dataKey="benar" name="Jawaban Benar" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="salah" name="Jawaban Salah" stackId="a" fill="#ef4444" radius={[8, 8, 0, 0]} maxBarSize={50} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>

            {/* Chart Legend / Color Indicator */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-4 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-500 shrink-0" />
                <span className="text-slate-700 font-semibold">Mahir (≥ 75%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-500 shrink-0" />
                <span className="text-slate-700 font-semibold">Cukup (60% - 74%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-rose-500 shrink-0" />
                <span className="text-slate-700 font-semibold">Perlu Bimbingan / Lemah (&lt; 60%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 border-t-2 border-dashed border-blue-600 shrink-0" />
                <span className="text-blue-800 font-bold">Garis Target Standar (75%)</span>
              </div>
            </div>
          </div>

          {/* Diagnostic Teacher Evaluation Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            
            {/* Weakness Detection Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/80 border border-rose-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-900 font-black text-xs sm:text-sm">
                  <TrendingDown className="w-4 h-4 text-rose-600" />
                  <span>Kelemahan Siswa (Perlu Remedial)</span>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-rose-200/80 text-rose-900">
                  {weakCompetencies.length} Kategori
                </span>
              </div>

              {weakCompetencies.length === 0 ? (
                <div className="p-3 bg-white/80 rounded-xl border border-rose-200 text-xs text-slate-700 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Hebat! Tidak ditemukan indikator di bawah 60%. Siswa telah melampaui batas ambang minimum.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {weakCompetencies.map((w) => (
                    <div key={w.name} className="p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 line-clamp-1">{w.name}</span>
                        <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          {w.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Capaian: <strong className="text-slate-800">{w.benar}</strong> dari {w.total} soal benar (salah {w.salah} butir).
                      </p>
                      {w.questionNumbers && w.questionNumbers.length > 0 && (
                        <p className="text-[11px] text-rose-700 font-medium">
                          Pelajari kembali pembahasan pada <strong className="font-mono">Soal #{w.questionNumbers.join(', #')}</strong>.
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mastery & Strength Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/80 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-900 font-black text-xs sm:text-sm">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Kekuatan Siswa (Telah Dikuasai)</span>
                </div>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-emerald-200/80 text-emerald-900">
                  {strongCompetencies.length} Kategori
                </span>
              </div>

              {strongCompetencies.length === 0 ? (
                <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-slate-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Belum ada indikator yang mencapai kategori Mahir (≥ 75%). Perlu latihan soal penguatan secara rutin.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {strongCompetencies.map((s) => (
                    <div key={s.name} className="p-3 bg-white rounded-xl border border-emerald-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 line-clamp-1">{s.name}</span>
                        <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {s.score}%
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Capaian: <strong className="text-slate-800">{s.benar}</strong> dari {s.total} soal terjawab sempurna.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* Detailed Progress Bars List */}
          <div className="pt-2">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Rincian Capaian per Indikator Pembelajaran:
            </h4>
            <div className="space-y-2.5">
              {chartData.map((d) => (
                <div key={d.name} className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex justify-between items-center text-xs sm:text-sm mb-1.5">
                    <span className="font-semibold text-slate-800 line-clamp-1">{d.name}</span>
                    <span className={`font-bold ml-2 ${
                      d.score >= 75 ? 'text-emerald-700' : d.score >= 60 ? 'text-amber-700' : 'text-rose-700'
                    }`}>
                      {d.benar} / {d.total} Benar ({d.score}%) • {d.status}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        d.score >= 75 ? 'bg-emerald-500' : d.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${d.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
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
            const parentGroup = pkg.stimulusGroups?.find((g) => g.questions?.some((iq) => iq.number === q.number));
            const isStandalone = parentGroup ? (parentGroup.hasStimulus === false || !parentGroup.content || parentGroup.content.trim().length === 0) : false;

            return (
              <div
                key={q.number}
                className={`p-5 rounded-2xl border transition-all ${
                  isCorrect
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-rose-50/40 border-rose-200'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200/80 flex-wrap gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
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
                    {isStandalone ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        ⚡ Soal Mandiri
                      </span>
                    ) : parentGroup?.title ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 line-clamp-1 max-w-[200px]">
                        📖 {parentGroup.title}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {q.type === 'pg' ? 'Pilihan Ganda' :
                       q.type === 'pgk' ? 'PG Kompleks' :
                       q.type === 'bs' ? 'Benar/Salah' :
                       q.type === 'sts' ? 'Sesuai/Tdk Sesuai' :
                       q.type === 'jodohkan' ? 'Menjodohkan' :
                       q.type === 'isian' ? 'Isian' : 'Standar'}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {q.cognitiveLevel}
                    </span>
                  </div>
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
                        ? Array.isArray(item.userAnswer)
                          ? item.userAnswer.join(', ')
                          : typeof item.userAnswer === 'object'
                          ? Object.entries(item.userAnswer).map(([k, v]) => `${k} ➜ ${v}`).join('; ')
                          : String(item.userAnswer)
                        : '(Tidak Dijawab / Kosong)'}
                    </strong>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="block font-bold text-slate-500 text-[11px] uppercase mb-0.5">
                      Kunci Jawaban Resmi:
                    </span>
                    <strong className="text-blue-700 font-extrabold">
                      {Array.isArray(q.correctAnswer)
                        ? q.correctAnswer.join(', ')
                        : typeof q.correctAnswer === 'object' && q.correctAnswer !== null
                        ? Object.entries(q.correctAnswer).map(([k, v]) => `${k} ➜ ${v}`).join('; ')
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
