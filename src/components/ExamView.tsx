import React, { useState, useEffect } from 'react';
import { 
  Timer, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Bookmark, 
  Send, 
  BookOpen, 
  PenLine, 
  Grid, 
  X, 
  ArrowRight,
  Shuffle,
  HelpCircle
} from 'lucide-react';
import { TKAPackage, QuestionItem, StimulusGroup, MatchingPairItem } from '../data/defaultPackages';
import { UserExamState } from '../types';

interface ExamViewProps {
  pkg: TKAPackage;
  onSubmitExam: (examState: UserExamState) => void;
  onExitExam: () => void;
}

interface ExamQuestionItem {
  question: QuestionItem;
  stimulus: StimulusGroup;
  displayNumber: number; // 1..N randomized display number
}

// Fisher-Yates array shuffling algorithm
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const ExamView: React.FC<ExamViewProps> = ({
  pkg,
  onSubmitExam,
  onExitExam
}) => {
  // Flatten all questions and randomize their order for this student's exam session
  const [shuffledQuestions] = useState<ExamQuestionItem[]>(() => {
    const list: { question: QuestionItem; stimulus: StimulusGroup }[] = [];
    pkg.stimulusGroups.forEach((sg) => {
      sg.questions.forEach((q) => {
        list.push({ question: q, stimulus: sg });
      });
    });

    const randomized = shuffleArray(list);
    return randomized.map((item, idx) => ({
      question: item.question,
      stimulus: item.stimulus,
      displayNumber: idx + 1
    }));
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState((pkg.timeLimitMinutes || 45) * 60);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isMobileGridOpen, setIsMobileGridOpen] = useState(false);

  // Dedicated Mobile Mode: 'question' or 'stimulus' tab
  const [mobileTab, setMobileTab] = useState<'question' | 'stimulus'>('question');

  // Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentItem = shuffledQuestions[currentIndex];
  const currentQ = currentItem?.question;
  const currentStimulus = currentItem?.stimulus;

  // Question Answer helpers
  const handleSelectPG = (key: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.number]: key
    }));
  };

  const handleTogglePGK = (key: string) => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const currentList: string[] = Array.isArray(prev[currentQ.number])
        ? prev[currentQ.number]
        : [];
      const updated = currentList.includes(key)
        ? currentList.filter((k) => k !== key)
        : [...currentList, key];
      return {
        ...prev,
        [currentQ.number]: updated
      };
    });
  };

  const handleSelectMatrix = (stmtId: string, choice: string) => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const currentMatrix: Record<string, string> =
        typeof prev[currentQ.number] === 'object' && prev[currentQ.number] !== null && !Array.isArray(prev[currentQ.number])
          ? prev[currentQ.number]
          : {};
      return {
        ...prev,
        [currentQ.number]: {
          ...currentMatrix,
          [stmtId]: choice
        }
      };
    });
  };

  const handleSelectMatching = (pairId: string, rightVal: string) => {
    if (!currentQ) return;
    setAnswers((prev) => {
      const currentMap: Record<string, string> =
        typeof prev[currentQ.number] === 'object' && prev[currentQ.number] !== null && !Array.isArray(prev[currentQ.number])
          ? prev[currentQ.number]
          : {};
      return {
        ...prev,
        [currentQ.number]: {
          ...currentMap,
          [pairId]: rightVal
        }
      };
    });
  };

  const handleInputIsian = (val: string) => {
    if (!currentQ) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQ.number]: val
    }));
  };

  const handleToggleFlag = () => {
    if (!currentQ) return;
    setFlagged((prev) => ({
      ...prev,
      [currentQ.number]: !prev[currentQ.number]
    }));
  };

  const isAnswered = (qNum: number) => {
    const val = answers[qNum];
    if (val === undefined || val === null) return false;
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === 'object') {
      const keys = Object.keys(val);
      return keys.length > 0 && Object.values(val).some(v => Boolean(v));
    }
    return String(val).trim().length > 0;
  };

  const answeredCount = shuffledQuestions.filter((item) => isAnswered(item.question.number)).length;
  const unansweredCount = shuffledQuestions.length - answeredCount;

  const handleSubmit = () => {
    const timeSpent = (pkg.timeLimitMinutes * 60) - secondsRemaining;
    onSubmitExam({
      answers,
      flagged,
      timeSpentSeconds: Math.max(1, timeSpent),
      completedAt: new Date().toISOString()
    });
  };

  if (!currentQ || !currentStimulus) {
    return <div className="p-12 text-center text-slate-600 font-bold">Memuat naskah latihan soal...</div>;
  }

  // Check if current question has an active stimulus
  const hasStimulus = Boolean(
    currentStimulus &&
    currentStimulus.hasStimulus !== false &&
    currentStimulus.content &&
    currentStimulus.content.trim().length > 0 &&
    !currentStimulus.title.toLowerCase().includes('mandiri') &&
    !currentStimulus.title.toLowerCase().includes('tanpa stimulus')
  );

  // Automatically ensure mobile tab is on 'question' if current question has no stimulus
  useEffect(() => {
    if (!hasStimulus && mobileTab === 'stimulus') {
      setMobileTab('question');
    }
  }, [hasStimulus, mobileTab]);

  const isLowTime = secondsRemaining < 300; // less than 5 minutes

  // For matching type, gather unique right-hand choices
  const matchingChoices = (currentQ.matchingPairs || []).map(p => p.right);

  const renderDesktopNavigatorCard = () => (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-2 text-xs">
        <span className="font-bold text-slate-800">Daftar Nomor Soal</span>
        <span className="font-semibold text-blue-700">
          Terjawab: {answeredCount} / {shuffledQuestions.length}
        </span>
      </div>

      <div className="text-[10px] text-purple-700 font-semibold mb-3 flex items-center gap-1">
        <Shuffle className="w-3 h-3" />
        <span>Urutan disajikan secara acak untuk setiap siswa</span>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-3 text-[11px] text-slate-500 mb-3 pb-2 border-b border-slate-100">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-blue-600 inline-block" />
          <span>Dijawab</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-amber-500 inline-block" />
          <span>Ragu</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
          <span>Kosong</span>
        </div>
      </div>

      {/* Grid buttons */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-2">
        {shuffledQuestions.map((item, idx) => {
          const qNum = item.question.number;
          const isCurrent = idx === currentIndex;
          const answered = isAnswered(qNum);
          const isFlag = !!flagged[qNum];

          let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
          if (isFlag) bgClass = 'bg-amber-500 text-white border-amber-600';
          else if (answered) bgClass = 'bg-blue-600 text-white border-blue-700';

          return (
            <button
              key={item.displayNumber}
              onClick={() => setCurrentIndex(idx)}
              className={`h-9 rounded-lg font-bold text-xs border flex items-center justify-center transition-all ${bgClass} ${
                isCurrent ? 'ring-2 ring-blue-500 ring-offset-2 scale-105' : 'hover:opacity-90'
              }`}
            >
              {item.displayNumber}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto my-2 sm:my-6 px-2 sm:px-6 select-none no-print pb-20 lg:pb-8">
      
      {/* Top Floating Exam Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow shrink-0">
            {pkg.subjectCode || 'STS'}
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                {pkg.subject}
              </span>
              <span className="text-[10px] sm:text-xs text-slate-500 font-semibold">{pkg.grade}</span>
              {/* Anti-Cheating Random Badge */}
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
                <Shuffle className="w-3 h-3 text-purple-600" />
                <span>Urutan Soal Diacak Otomatis</span>
              </span>
            </div>
            <h2 className="text-xs sm:text-base font-bold text-slate-900 line-clamp-1">
              {pkg.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Timer pill */}
          <div
            className={`flex items-center gap-1 sm:gap-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border font-black text-xs sm:text-base shrink-0 ${
              isLowTime
                ? 'bg-red-50 text-red-700 border-red-300 animate-pulse'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
          >
            <Timer className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLowTime ? 'text-red-600' : 'text-blue-600'}`} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Kumpulkan button */}
          <button
            onClick={() => setIsSubmitModalOpen(true)}
            className="flex items-center gap-1 px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors shadow-sm shrink-0"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="hidden sm:inline">Kumpulkan</span>
            <span className="sm:hidden">Selesai</span>
          </button>
        </div>
      </div>

      {/* TAMPILAN KHUSUS HANDPHONE (TABS JIKA ADA STIMULUS ATAU BANNER SOAL MANDIRI) */}
      <div className="lg:hidden mb-3">
        <div className="flex items-center justify-between mb-1.5 px-1">
          <span className="text-[10px] font-bold text-purple-700 flex items-center gap-1">
            <Shuffle className="w-3 h-3" />
            <span>Mode Acak Anti-Contek</span>
          </span>
          <span className="text-[10px] text-slate-500 font-semibold">
            Terjawab: {answeredCount}/{shuffledQuestions.length}
          </span>
        </div>

        {hasStimulus ? (
          <div className="flex bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setMobileTab('stimulus')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'stimulus'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-700'
              }`}
            >
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>📖 Baca Stimulus</span>
            </button>

            <button
              onClick={() => setMobileTab('question')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                mobileTab === 'question'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-slate-700'
              }`}
            >
              <PenLine className="w-4 h-4 text-blue-600" />
              <span>✍️ Lembar Jawab (No. {currentItem.displayNumber})</span>
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-between shadow-xs">
            <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <span>⚡ Soal Mandiri Langsung (Tanpa Teks Bacaan)</span>
            </span>
            <span className="text-xs font-extrabold text-blue-700 bg-white px-2 py-0.5 rounded-md border border-amber-200">
              No. {currentItem.displayNumber}
            </span>
          </div>
        )}

        {/* Mobile Horizontal Quick Ribbon */}
        <div className="flex items-center gap-2 mt-2 px-1 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setIsMobileGridOpen(true)}
            className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-bold bg-slate-100 text-slate-800 rounded-lg border border-slate-300"
          >
            <Grid className="w-3.5 h-3.5 text-blue-600" />
            <span>Semua ({shuffledQuestions.length})</span>
          </button>

          {shuffledQuestions.map((item, idx) => {
            const qNum = item.question.number;
            const isCurrent = idx === currentIndex;
            const answered = isAnswered(qNum);
            const isFlag = !!flagged[qNum];

            let bg = 'bg-white text-slate-700 border-slate-300';
            if (isFlag) bg = 'bg-amber-500 text-white border-amber-600';
            else if (answered) bg = 'bg-blue-600 text-white border-blue-700';

            return (
              <button
                key={item.displayNumber}
                onClick={() => {
                  setCurrentIndex(idx);
                  setMobileTab('question');
                }}
                className={`w-8 h-8 shrink-0 rounded-lg text-xs font-bold border flex items-center justify-center transition-transform ${bg} ${
                  isCurrent ? 'ring-2 ring-blue-500 ring-offset-1 scale-105' : ''
                }`}
              >
                {item.displayNumber}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Layout Container (Desktop Split / Mobile Tab Switcher) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Stimulus Box (Only rendered if question has stimulus) */}
        {hasStimulus && (
          <div className={`lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 sm:p-7 shadow-sm sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto ${
            mobileTab === 'question' ? 'hidden lg:block' : 'block'
          }`}>
            
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <span className="text-[11px] sm:text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-900 uppercase tracking-wide">
                {currentStimulus.type}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
                Rujukan untuk Soal Nomor {currentItem.displayNumber}
              </span>
            </div>

            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 mb-2.5 leading-snug">
              {currentStimulus.title}
            </h3>

            <div className="text-xs sm:text-base leading-relaxed text-slate-800 whitespace-pre-line text-justify font-serif">
              {currentStimulus.content}
            </div>

            {/* SVG Diagram if provided */}
            {currentStimulus.svgDiagram && (
              <div 
                className="my-4 max-w-sm sm:max-w-md mx-auto overflow-hidden"
                dangerouslySetInnerHTML={{ __html: currentStimulus.svgDiagram }}
              />
            )}

            {/* Structured Table */}
            {currentStimulus.tableData && currentStimulus.tableData.length > 0 && (
              <div className="mt-4">
                <div className="lg:hidden text-[10px] text-blue-700 font-semibold mb-1">
                  ↔️ Geser tabel ke kanan/kiri untuk melihat kolom lengkap:
                </div>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-xs sm:text-sm text-left border-collapse min-w-[280px]">
                    <thead>
                      <tr className="bg-slate-100 text-slate-900">
                        {Object.keys(currentStimulus.tableData[0]).map((h) => (
                          <th key={h} className="p-2.5 font-bold border-b border-slate-200">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentStimulus.tableData.map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                          {Object.values(row).map((val: any, cIdx) => (
                            <td key={cIdx} className="p-2.5 border-b border-slate-100 text-slate-700 whitespace-nowrap">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Mobile button to jump back to question */}
            <div className="lg:hidden mt-6 pt-4 border-t border-slate-100">
              <button
                onClick={() => setMobileTab('question')}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <span>Sudah Membaca? Lanjut Jawab Soal No. {currentItem.displayNumber}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* Question Card Container (lg:col-span-5 with stimulus, or lg:col-span-8 for standalone questions) */}
        <div className={`${hasStimulus ? 'lg:col-span-5' : 'lg:col-span-8'} space-y-4 sm:space-y-6 ${
          mobileTab === 'stimulus' && hasStimulus ? 'hidden lg:block' : 'block'
        }`}>
          
          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm">
            
            {/* Question Header */}
            <div className="flex items-center justify-between pb-3 mb-3 sm:mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-base sm:text-lg text-blue-600">
                  Nomor {currentItem.displayNumber}
                </span>
                <span className="text-xs text-slate-400">dari {shuffledQuestions.length}</span>
                {!hasStimulus && (
                  <span className="text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                    ⚡ Soal Mandiri
                  </span>
                )}
              </div>

              <span className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                {currentQ.type === 'pg' ? 'Pilihan Ganda' :
                 currentQ.type === 'pgk' ? 'Pilihan Ganda Kompleks' :
                 currentQ.type === 'bs' ? 'Benar / Salah' :
                 currentQ.type === 'sts' ? 'Sesuai / Tidak Sesuai' :
                 currentQ.type === 'jodohkan' ? 'Menjodohkan' :
                 currentQ.type === 'isian' ? 'Isian Singkat' : 'Pertanyaan Standar'}
              </span>
            </div>

            {/* Prompt */}
            <div className="text-xs sm:text-base font-semibold text-slate-900 leading-snug mb-4 sm:mb-5 whitespace-pre-line">
              {currentQ.prompt}
            </div>

            {/* Quick stimulus preview button on mobile (Only if question has stimulus) */}
            {hasStimulus && (
              <button
                type="button"
                onClick={() => setMobileTab('stimulus')}
                className="lg:hidden w-full mb-3 py-2 px-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Lihat Teks Stimulus Soal Ini</span>
              </button>
            )}

            {/* 1. INPUT: Tipe PG (Single Choice) */}
            {currentQ.type === 'pg' && currentQ.options && (
              <div className="space-y-2 sm:space-y-2.5">
                {currentQ.options.map((opt) => {
                  const isSelected = answers[currentQ.number] === opt.key;
                  return (
                    <label
                      key={opt.key}
                      onClick={() => handleSelectPG(opt.key)}
                      className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all min-h-[46px] ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 text-blue-950 font-semibold shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${currentQ.number}`}
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500 shrink-0"
                      />
                      <span className="font-bold text-blue-700 min-w-5">{opt.key}.</span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 2. INPUT: Tipe PGK (Complex Checkboxes) */}
            {currentQ.type === 'pgk' && currentQ.options && (
              <div className="space-y-2 sm:space-y-2.5">
                <div className="text-[11px] font-bold text-blue-700 mb-1.5">
                  ℹ️ Pilih semua jawaban yang benar (jawaban lebih dari satu):
                </div>
                {currentQ.options.map((opt) => {
                  const selectedArr: string[] = Array.isArray(answers[currentQ.number])
                    ? answers[currentQ.number]
                    : [];
                  const isSelected = selectedArr.includes(opt.key);
                  return (
                    <label
                      key={opt.key}
                      onClick={() => handleTogglePGK(opt.key)}
                      className={`flex items-start gap-3 p-3 sm:p-3.5 rounded-xl border text-xs sm:text-sm font-medium cursor-pointer transition-all min-h-[46px] ${
                        isSelected
                          ? 'bg-blue-50/90 border-blue-500 text-blue-950 font-semibold shadow-sm ring-1 ring-blue-500'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="mt-0.5 text-blue-600 rounded focus:ring-blue-500 shrink-0"
                      />
                      <span className="font-bold text-slate-800">[{opt.key}]</span>
                      <span className="flex-1 leading-snug">{opt.text}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {/* 3. INPUT: Tipe Matrix (Benar/Salah, Sesuai/Tidak Sesuai) */}
            {(currentQ.type === 'bs' || currentQ.type === 'sts' || currentQ.statements) && currentQ.statements && currentQ.statements.length > 0 && (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-[11px] sm:text-xs border-collapse min-w-[260px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="p-2 sm:p-2.5 text-left font-bold">Pernyataan</th>
                      <th className="p-2 sm:p-2.5 text-center w-20 sm:w-24 font-bold">
                        {currentQ.type === 'bs' ? 'Benar' : currentQ.type === 'sts' ? 'Sesuai' : 'Mendukung'}
                      </th>
                      <th className="p-2 sm:p-2.5 text-center w-20 sm:w-24 font-bold">
                        {currentQ.type === 'bs' ? 'Salah' : currentQ.type === 'sts' ? 'Tdk Sesuai' : 'Tdk Mendukung'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentQ.statements.map((stmt) => {
                      const userMatrix = answers[currentQ.number] || {};
                      const choice = userMatrix[stmt.id];
                      const firstVal = currentQ.type === 'bs' ? 'Benar' : currentQ.type === 'sts' ? 'Sesuai' : 'Mendukung';
                      const secondVal = currentQ.type === 'bs' ? 'Salah' : currentQ.type === 'sts' ? 'Tidak Sesuai' : 'Tidak Mendukung';

                      return (
                        <tr key={stmt.id} className="border-t border-slate-100">
                          <td className="p-2 sm:p-2.5 text-slate-800 leading-snug">{stmt.text}</td>
                          <td className="p-2 sm:p-2.5 text-center bg-blue-50/20">
                            <input
                              type="radio"
                              name={`matrix-${currentQ.number}-${stmt.id}`}
                              checked={choice === firstVal}
                              onChange={() => handleSelectMatrix(stmt.id, firstVal)}
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                          <td className="p-2 sm:p-2.5 text-center bg-slate-50/40">
                            <input
                              type="radio"
                              name={`matrix-${currentQ.number}-${stmt.id}`}
                              checked={choice === secondVal}
                              onChange={() => handleSelectMatrix(stmt.id, secondVal)}
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {/* 4. INPUT: Tipe Menjodohkan (Jodohkan) */}
            {currentQ.type === 'jodohkan' && currentQ.matchingPairs && (
              <div className="space-y-3 pt-1">
                <div className="text-[11px] font-bold text-purple-800 bg-purple-50 p-2.5 rounded-xl border border-purple-200">
                  🔗 Pasangkan konsep kolom kiri dengan memilih jawaban yang tepat pada dropdown kolom kanan:
                </div>

                <div className="space-y-2.5">
                  {currentQ.matchingPairs.map((pair, pIdx) => {
                    const userMap = answers[currentQ.number] || {};
                    const selectedVal = userMap[pair.id] || '';

                    return (
                      <div key={pair.id} className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                            {pIdx + 1}
                          </span>
                          <span className="font-semibold text-xs sm:text-sm text-slate-800">{pair.left}</span>
                        </div>

                        <div className="pl-7">
                          <select
                            value={selectedVal}
                            onChange={(e) => handleSelectMatching(pair.id, e.target.value)}
                            className="w-full p-2 rounded-lg border border-purple-300 bg-white text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-purple-500"
                          >
                            <option value="">-- Pilih Pasangan Jawaban --</option>
                            {matchingChoices.map((choiceText, cIdx) => (
                              <option key={cIdx} value={choiceText}>
                                {choiceText}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 5. INPUT: Tipe Isian Singkat */}
            {currentQ.type === 'isian' && (
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  Tuliskan Jawaban Singkat Anda:
                </label>
                <input
                  type="text"
                  placeholder="Ketik jawaban singkat di sini..."
                  value={answers[currentQ.number] || ''}
                  onChange={(e) => handleInputIsian(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-xs"
                />
                <span className="text-[11px] text-slate-500 block">
                  * Ketikkan jawaban ringkas tanpa tanda baca berlebih.
                </span>
              </div>
            )}

            {/* Bottom Actions of Question Card */}
            <div className="flex items-center justify-between pt-4 sm:pt-5 mt-4 sm:mt-6 border-t border-slate-100 gap-2">
              <label className="flex items-center gap-1.5 cursor-pointer select-none text-[11px] sm:text-xs font-bold text-amber-800 bg-amber-50 px-2.5 sm:px-3 py-2 rounded-xl border border-amber-200">
                <input
                  type="checkbox"
                  checked={!!flagged[currentQ.number]}
                  onChange={handleToggleFlag}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <Bookmark className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Ragu-Ragu</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                  className="px-3 py-2 rounded-xl border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition-colors text-xs font-bold flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4 text-slate-700" />
                  <span className="hidden sm:inline">Sebelumnya</span>
                </button>

                <button
                  disabled={currentIndex === shuffledQuestions.length - 1}
                  onClick={() => setCurrentIndex((prev) => Math.min(shuffledQuestions.length - 1, prev + 1))}
                  className="px-3.5 py-2 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-40 transition-colors shadow-sm flex items-center gap-1"
                >
                  <span>Berikutnya</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>

          {/* Desktop Question Grid Navigator Card (under question when hasStimulus) */}
          {hasStimulus && (
            <div className="hidden lg:block">
              {renderDesktopNavigatorCard()}
            </div>
          )}

        </div>

        {/* Desktop Question Grid Navigator Card (right side column when !hasStimulus) */}
        {!hasStimulus && (
          <div className="hidden lg:block lg:col-span-4 sticky top-24">
            {renderDesktopNavigatorCard()}
          </div>
        )}

      </div>

      {/* Mobile Question Grid Modal */}
      {isMobileGridOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">Navigasi Nomor Soal</h4>
                <span className="text-[11px] text-blue-600 font-bold">Terjawab: {answeredCount} dari {shuffledQuestions.length}</span>
              </div>
              <button
                onClick={() => setIsMobileGridOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 overflow-y-auto p-1 flex-1">
              {shuffledQuestions.map((item, idx) => {
                const qNum = item.question.number;
                const isCurrent = idx === currentIndex;
                const answered = isAnswered(qNum);
                const isFlag = !!flagged[qNum];

                let bgClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isFlag) bgClass = 'bg-amber-500 text-white border-amber-600';
                else if (answered) bgClass = 'bg-blue-600 text-white border-blue-700';

                return (
                  <button
                    key={item.displayNumber}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setIsMobileGridOpen(false);
                      setMobileTab('question');
                    }}
                    className={`h-10 rounded-xl font-bold text-xs border flex items-center justify-center ${bgClass} ${
                      isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    }`}
                  >
                    {item.displayNumber}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsMobileGridOpen(false)}
              className="mt-3 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-5 sm:p-8 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mb-2">
              Konfirmasi Pengumpulan Ujian
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
              Anda telah menjawab <b>{answeredCount}</b> dari total <b>{shuffledQuestions.length}</b> butir soal.
              {unansweredCount > 0 && (
                <span className="block mt-2 text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 text-xs font-semibold">
                  ⚠️ Peringatan: Masih terdapat {unansweredCount} butir soal yang belum dijawab!
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200"
              >
                Periksa Lagi
              </button>
              <button
                onClick={() => {
                  setIsSubmitModalOpen(false);
                  handleSubmit();
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
              >
                Ya, Kumpulkan
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

