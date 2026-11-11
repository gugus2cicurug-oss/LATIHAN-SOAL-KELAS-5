import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  CheckCircle, 
  Layers, 
  AlertCircle, 
  Check, 
  Cpu, 
  ArrowRight,
  SplitSquareVertical
} from 'lucide-react';
import { APP_CONFIG } from '../../appConfig.js';
import { detectSubjects, generateTKAPackageService, GENERATION_STEPS } from '../utils/generator';
import { TKAPackage } from '../data/defaultPackages';

interface GeneratorFormProps {
  onPackageGenerated: (pkg: TKAPackage, secondPkg?: TKAPackage) => void;
  prefilledSubjectId?: string | null;
  onCancel: () => void;
}

export const GeneratorForm: React.FC<GeneratorFormProps> = ({
  onPackageGenerated,
  prefilledSubjectId,
  onCancel
}) => {
  const [kisiKisi, setKisiKisi] = useState('');
  const [grade, setGrade] = useState('Kelas 5 SD/MI');
  const [numQuestions, setNumQuestions] = useState<number>(12);
  const [questionTypes, setQuestionTypes] = useState<string>('campuran');
  const [detectedSubjects, setDetectedSubjects] = useState<string[]>(['matematika']);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // If prefilledSubjectId is provided, fill textarea with authentic matrix
  useEffect(() => {
    if (prefilledSubjectId) {
      const matched = APP_CONFIG.subjects.find(s => s.id === prefilledSubjectId);
      if (matched && matched.sampleMatrix) {
        setKisiKisi(matched.sampleMatrix);
      }
    }
  }, [prefilledSubjectId]);

  // Update auto-detected subjects whenever text changes
  useEffect(() => {
    if (kisiKisi.trim().length > 10) {
      const detected = detectSubjects(kisiKisi);
      setDetectedSubjects(detected);
    }
  }, [kisiKisi]);

  const handleSelectPreset = (subjId: string) => {
    const matched = APP_CONFIG.subjects.find(s => s.id === subjId);
    if (matched && matched.sampleMatrix) {
      setKisiKisi(matched.sampleMatrix);
    }
  };

  const handleStartGenerate = async () => {
    if (!kisiKisi.trim()) {
      alert('Silakan masukkan kisi-kisi atau pilih salah satu matriks asesmen resmi di atas.');
      return;
    }

    setIsGenerating(true);
    setCurrentStepIndex(0);

    try {
      // Check if dual subjects detected
      if (detectedSubjects.length >= 2) {
        // Dual subjects mode: generate two distinct packages as requested!
        const firstSubj = detectedSubjects[0];
        const secondSubj = detectedSubjects[1];

        const pkg1 = await generateTKAPackageService(
          kisiKisi,
          firstSubj,
          grade,
          (step) => setCurrentStepIndex(step),
          numQuestions,
          questionTypes
        );

        const pkg2 = await generateTKAPackageService(
          kisiKisi,
          secondSubj,
          grade,
          undefined,
          numQuestions,
          questionTypes
        );

        setIsGenerating(false);
        onPackageGenerated(pkg1, pkg2);
      } else {
        // Single subject mode
        const primarySubj = detectedSubjects[0] || 'matematika';
        const pkg = await generateTKAPackageService(
          kisiKisi,
          primarySubj,
          grade,
          (step) => setCurrentStepIndex(step),
          numQuestions,
          questionTypes
        );

        setIsGenerating(false);
        onPackageGenerated(pkg);
      }
    } catch (err) {
      console.error('Generation error:', err);
      setIsGenerating(false);
      alert('Terjadi kendala saat menyusun asesmen. Silakan coba kembali.');
    }
  };

  const isDualSubject = detectedSubjects.length >= 2;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-xl max-w-4xl mx-auto my-6 no-print">
      
      {/* Header Form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-100 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            AI GENERATOR ASESMEN OTOMATIS
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Input Kisi-Kisi Materi TKA
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Guru cukup memasukkan kisi-kisi. AI melakukan analisis kompetensi, membuat stimulus naratif/diagram, dan menyusun soal bertingkat.
          </p>
        </div>
      </div>

      {/* 1-Click Preset Matrix Chips */}
      <div className="mb-6">
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Pilih Cepat Matriks Asesmen Pusmendik (1-Klik Isi):
        </label>
        <div className="flex flex-wrap gap-2">
          {APP_CONFIG.subjects.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => handleSelectPreset(s.id)}
              disabled={isGenerating}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                detectedSubjects[0] === s.id && kisiKisi.length > 0
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Textarea */}
      <div className="mb-5">
        <label className="block text-sm font-bold text-slate-800 mb-2">
          Teks Kisi-Kisi / Matriks Indikator Asesmen:
        </label>
        <textarea
          rows={9}
          value={kisiKisi}
          disabled={isGenerating}
          onChange={(e) => setKisiKisi(e.target.value)}
          placeholder="Tempelkan atau ketik kisi-kisi materi di sini. Contoh:
1. Bilangan cacah dan pecahan desimal dalam konteks jual beli pasar tradisional
2. Menghitung keliling dan luas gabungan bangun datar (taman sekolah)
3. Membaca dan menganalisis tabel data frekuensi penjualan koperasi..."
          className="w-full p-4 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono text-sm leading-relaxed text-slate-800 shadow-inner bg-slate-50/50"
        />
      </div>

      {/* Detection info & Grade Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Jenjang Sasaran:
          </label>
          <select
            value={grade}
            disabled={isGenerating}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full p-3 rounded-xl border border-slate-300 bg-white font-medium text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="Kelas 5 SD/MI">Kelas 5 SD/MI (Rekomendasi Utama Fase C)</option>
            <option value="Kelas 6 SD/MI">Kelas 6 SD/MI (Persiapan Kelulusan & TKA)</option>
            <option value="Kelas 4 SD/MI">Kelas 4 SD/MI (Fase B Awal)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5 uppercase tracking-wide">
            Deteksi Otomatis Mata Pelajaran:
          </label>
          <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">
                {detectedSubjects.map(s => {
                  const found = APP_CONFIG.subjects.find(sub => sub.id === s);
                  return found?.name || s;
                }).join(' + ')}
              </span>
            </div>
            {isDualSubject && (
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                <SplitSquareVertical className="w-3 h-3 text-amber-700" />
                2 Paket Terpisah
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Question Count & Question Type Configuration */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide flex items-center justify-between">
            <span>🎯 Target Jumlah Soal:</span>
            <span className="text-blue-700 font-extrabold">{numQuestions} Butir Soal</span>
          </label>
          <select
            value={numQuestions}
            disabled={isGenerating}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value={3}>3 Soal (1 Stimulus Ringkas)</option>
            <option value={6}>6 Soal (2 Stimulus)</option>
            <option value={9}>9 Soal (3 Stimulus)</option>
            <option value={12}>12 Soal (4 Stimulus - Rekomendasi Cepat)</option>
            <option value={15}>15 Soal (5 Stimulus)</option>
            <option value={18}>18 Soal (6 Stimulus - Standar Penuh)</option>
            <option value={24}>24 Soal (8 Stimulus)</option>
            <option value={30}>30 Soal (10 Stimulus - Ujian Lengkap)</option>
          </select>
          <span className="text-[11px] text-slate-500 mt-1 block">
            AI menyusun ~{Math.ceil(numQuestions / 3)} kelompok stimulus konteks nyata.
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-800 mb-1.5 uppercase tracking-wide">
            📝 Bentuk / Jenis Soal yang Dibuat:
          </label>
          <select
            value={questionTypes}
            disabled={isGenerating}
            onChange={(e) => setQuestionTypes(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 bg-white font-bold text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-blue-600 focus:outline-none"
          >
            <option value="campuran">🌟 Kombinasi Variatif (PG, PGK, B/S, Isian)</option>
            <option value="pg">🔘 Pilihan Ganda Tunggal (Semua PG)</option>
            <option value="pgk">☑️ Pilihan Ganda Kompleks (Jawaban &gt; 1)</option>
            <option value="bs">⚖️ Pernyataan Benar / Salah</option>
            <option value="jodohkan">🔗 Menjodohkan (Pasangan Premis)</option>
            <option value="isian">✏️ Isian Singkat</option>
          </select>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dapat dirubah menjadi bentuk lain sewaktu-waktu dengan AI di editor.
          </span>
        </div>
      </div>

      {/* Dual Subject Notice if applicable */}
      {isDualSubject && (
        <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong>Deteksi 2 Mata Pelajaran Sekaligus:</strong> Kisi-kisi Anda mengandung materi untuk{' '}
            <b>{detectedSubjects.map(s => APP_CONFIG.subjects.find(sub => sub.id === s)?.name).join(' & ')}</b>.{' '}
            Sistem otomatis menyusun <b>2 paket latihan terpisah</b> masing-masing dengan kaidah 1 stimulus untuk 3 butir soal bertingkat.
          </div>
        </div>
      )}

      {/* Generation Progress Indicator (Active when isGenerating) */}
      {isGenerating && (
        <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 shadow-inner">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-blue-900 font-extrabold text-base">
              <Cpu className="w-5 h-5 text-blue-600 animate-spin" />
              <span>Memproses Asesmen: {GENERATION_STEPS[currentStepIndex]?.label}</span>
            </div>
            <span className="text-sm font-black text-blue-700">
              {Math.round(((currentStepIndex + 1) / GENERATION_STEPS.length) * 100)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full h-3 bg-blue-200/60 rounded-full overflow-hidden mb-5">
            <div
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${((currentStepIndex + 1) / GENERATION_STEPS.length) * 100}%` }}
            />
          </div>

          {/* Steps Timeline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
            {GENERATION_STEPS.map((s, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div
                  key={s.step}
                  className={`flex items-start gap-2 p-2 rounded-lg transition-colors ${
                    isCurrent
                      ? 'bg-white font-bold text-blue-900 shadow-sm border border-blue-200'
                      : isPast
                      ? 'text-emerald-700 font-medium'
                      : 'opacity-50'
                  }`}
                >
                  {isPast ? (
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : isCurrent ? (
                    <div className="w-4 h-4 rounded-full border-2 border-blue-600 border-t-transparent animate-spin shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      {s.step}
                    </div>
                  )}
                  <div>
                    <div>{s.label}</div>
                    <div className="text-[11px] text-slate-500 font-normal">{s.detail}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={isGenerating}
          onClick={handleStartGenerate}
          className="flex items-center gap-2 px-7 py-3.5 text-sm sm:text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-all shadow-lg shadow-blue-500/25 active:scale-95 cursor-pointer"
        >
          <Sparkles className="w-5 h-5 text-amber-300" />
          <span>{isGenerating ? 'AI Sedang Menyusun Naskah...' : 'Generate Naskah Soal & Ujian Sekarang'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={isGenerating}
          onClick={onCancel}
          className="px-5 py-3.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Batal
        </button>
      </div>

    </div>
  );
};
