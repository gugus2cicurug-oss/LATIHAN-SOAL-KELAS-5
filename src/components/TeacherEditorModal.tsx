import React, { useState } from 'react';
import { 
  X, 
  Save, 
  Trash2, 
  Plus, 
  Edit2, 
  Layers, 
  Check, 
  Sparkles, 
  Loader2, 
  ArrowRightLeft, 
  BookOpen, 
  CheckCircle2,
  ListPlus,
  HelpCircle
} from 'lucide-react';
import { TKAPackage, StimulusGroup, QuestionItem, OptionItem, StatementItem, MatchingPairItem } from '../data/defaultPackages';
import { transformQuestionWithAI } from '../utils/transformQuestion';

interface TeacherEditorModalProps {
  pkg: TKAPackage;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedPkg: TKAPackage) => void;
}

export const TeacherEditorModal: React.FC<TeacherEditorModalProps> = ({
  pkg,
  isOpen,
  onClose,
  onSave
}) => {
  const [editedPkg, setEditedPkg] = useState<TKAPackage>(() => JSON.parse(JSON.stringify(pkg)));
  const [selectedStimulusIdx, setSelectedStimulusIdx] = useState(0);
  const [transformingQNum, setTransformingQNum] = useState<number | null>(null);
  const [transformSuccessMsg, setTransformSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Ensure current stimulus index is valid
  const currentStimIdx = Math.min(selectedStimulusIdx, Math.max(0, editedPkg.stimulusGroups.length - 1));
  const currentGroup = editedPkg.stimulusGroups[currentStimIdx];

  // Total questions count calculation
  const totalQuestionsCount = editedPkg.stimulusGroups.reduce((acc, sg) => acc + sg.questions.length, 0);

  // Helper to renumber all questions across all stimulus groups
  const renumberAll = (groups: StimulusGroup[]) => {
    let counter = 1;
    groups.forEach((sg) => {
      sg.questions.forEach((q) => {
        q.number = counter++;
      });
    });
    return groups;
  };

  const handleUpdateStimulusField = (field: keyof StimulusGroup, val: any) => {
    const updated = { ...editedPkg };
    updated.stimulusGroups[currentStimIdx] = {
      ...updated.stimulusGroups[currentStimIdx],
      [field]: val
    };
    setEditedPkg(updated);
  };

  const handleUpdateQuestion = (qIdx: number, field: keyof QuestionItem, val: any) => {
    const updated = { ...editedPkg };
    const qList = [...updated.stimulusGroups[currentStimIdx].questions];
    qList[qIdx] = {
      ...qList[qIdx],
      [field]: val
    };
    updated.stimulusGroups[currentStimIdx].questions = qList;
    setEditedPkg(updated);
  };

  // Add a new question to current stimulus
  const handleAddNewQuestion = (type: QuestionItem['type'] = 'pg') => {
    const updated = { ...editedPkg };
    const group = updated.stimulusGroups[currentStimIdx];
    const newNum = totalQuestionsCount + 1;

    let newQ: QuestionItem;

    if (type === 'pg') {
      newQ = {
        number: newNum,
        type: 'pg',
        cognitiveLevel: 'L2 - Penalaran',
        competency: 'Pemahaman & Penerapan Konsep',
        prompt: 'Berdasarkan informasi stimulus di atas, manakah pernyataan yang paling tepat?',
        options: [
          { key: 'A', text: 'Pilihan jawaban A' },
          { key: 'B', text: 'Pilihan jawaban B' },
          { key: 'C', text: 'Pilihan jawaban C' },
          { key: 'D', text: 'Pilihan jawaban D' }
        ],
        correctAnswer: 'A',
        explanation: 'Analisis dan langkah penyelesaian berdasarkan data stimulus.'
      };
    } else if (type === 'pgk') {
      newQ = {
        number: newNum,
        type: 'pgk',
        cognitiveLevel: 'L3 - HOTS',
        competency: 'Analisis Multikriteria',
        prompt: 'Pilihlah semua pernyataan yang benar berdasarkan informasi di atas (Jawaban benar lebih dari satu):',
        options: [
          { key: 'A', text: 'Pernyataan benar pertama' },
          { key: 'B', text: 'Pernyataan salah kedua' },
          { key: 'C', text: 'Pernyataan benar ketiga' },
          { key: 'D', text: 'Pernyataan salah keempat' }
        ],
        correctAnswer: ['A', 'C'],
        explanation: 'Kriteria A dan C terbukti sesuai dengan informasi teks stimulus.'
      };
    } else if (type === 'bs' || type === 'sts') {
      const isBS = type === 'bs';
      const trueVal = isBS ? 'Benar' : 'Sesuai';
      const falseVal = isBS ? 'Salah' : 'Tidak Sesuai';
      newQ = {
        number: newNum,
        type,
        cognitiveLevel: 'L2 - Pemahaman',
        competency: 'Verifikasi Pernyataan',
        prompt: isBS 
          ? 'Tentukan apakah setiap pernyataan berikut bernilai BENAR atau SALAH berdasarkan stimulus!' 
          : 'Tentukan apakah setiap pernyataan berikut SESUAI atau TIDAK SESUAI dengan isi stimulus!',
        statements: [
          { id: 's1', text: 'Pernyataan pertama sesuai dengan isi teks.', answer: trueVal },
          { id: 's2', text: 'Pernyataan kedua bertentangan dengan informasi data.', answer: falseVal },
          { id: 's3', text: 'Pernyataan ketiga merupakan simpulan yang sah.', answer: trueVal }
        ],
        correctAnswer: { s1: trueVal, s2: falseVal, s3: trueVal },
        explanation: 'Pernyataan 1 dan 3 terbukti dalam teks, sedangkan pernyataan 2 berkebalikan.'
      };
    } else if (type === 'jodohkan') {
      newQ = {
        number: newNum,
        type: 'jodohkan',
        cognitiveLevel: 'L2 - Penerapan',
        competency: 'Menjodohkan Konsep',
        prompt: 'Pasangkanlah setiap unsur atau nilai pada kolom kiri dengan pasangan yang tepat pada kolom kanan!',
        matchingPairs: [
          { id: 'm1', left: 'Konsep A / Bagian 1', right: 'Pasangan Tepat A' },
          { id: 'm2', left: 'Konsep B / Bagian 2', right: 'Pasangan Tepat B' },
          { id: 'm3', left: 'Konsep C / Bagian 3', right: 'Pasangan Tepat C' }
        ],
        correctAnswer: {
          m1: 'Pasangan Tepat A',
          m2: 'Pasangan Tepat B',
          m3: 'Pasangan Tepat C'
        },
        explanation: 'Setiap konsep pada kolom kiri memiliki relasi langsung dengan pasangan di kolom kanan.'
      };
    } else {
      // isian
      newQ = {
        number: newNum,
        type: 'isian',
        cognitiveLevel: 'L2 - Penalaran',
        competency: 'Isian Singkat Mandiri',
        prompt: 'Berdasarkan teks di atas, tuliskan nilai atau kata kunci yang tepat untuk melengkapi pernyataan:',
        correctAnswer: 'Kunci Isian Singkat',
        explanation: 'Nilai/jawaban tersebut diperoleh langsung melalui analisis teks stimulus.'
      };
    }

    group.questions.push(newQ);
    updated.stimulusGroups = renumberAll(updated.stimulusGroups);
    setEditedPkg(updated);
  };

  // Toggle stimulus for current group
  const handleToggleStimulus = (enable: boolean) => {
    const updated = { ...editedPkg };
    const grp = updated.stimulusGroups[currentStimIdx];
    grp.hasStimulus = enable;
    if (!enable) {
      grp.content = '';
      grp.title = 'Soal Mandiri (Langsung Jawab)';
      grp.type = 'Soal Mandiri';
    } else {
      if (!grp.title || grp.title.includes('Mandiri')) {
        grp.title = `Stimulus ${currentStimIdx + 1}`;
      }
      if (!grp.type || grp.type.includes('Mandiri')) {
        grp.type = 'Teks Informasi & Analisis';
      }
    }
    setEditedPkg(updated);
  };

  // Add an entire new stimulus group with reading text
  const handleAddNewStimulusGroup = () => {
    const updated = { ...editedPkg };
    const newStimId = `stim-${Date.now()}`;
    const nextQNum = totalQuestionsCount + 1;

    const newGroup: StimulusGroup = {
      stimulusId: newStimId,
      hasStimulus: true,
      title: `Stimulus Baru ${updated.stimulusGroups.length + 1}`,
      type: 'Teks Informasi & Analisis',
      content: 'Tuliskan teks narasi, bacaan sastra, tabel data, atau studi kasus stimulus di sini.',
      questions: [
        {
          number: nextQNum,
          type: 'pg',
          cognitiveLevel: 'L2 - Penalaran',
          competency: 'Analisis Stimulus',
          prompt: 'Berdasarkan informasi stimulus di atas, apa kesimpulan utama yang dapat diambil?',
          options: [
            { key: 'A', text: 'Pilihan simpulan benar' },
            { key: 'B', text: 'Pilihan simpulan alternatif' },
            { key: 'C', text: 'Pilihan kurang tepat' },
            { key: 'D', text: 'Pilihan tidak relevan' }
          ],
          correctAnswer: 'A',
          explanation: 'Simpulan A didasarkan langsung pada data teks stimulus.'
        }
      ]
    };

    updated.stimulusGroups.push(newGroup);
    updated.stimulusGroups = renumberAll(updated.stimulusGroups);
    setEditedPkg(updated);
    setSelectedStimulusIdx(updated.stimulusGroups.length - 1);
  };

  // Add a standalone questions group (WITHOUT stimulus)
  const handleAddNewStandaloneGroup = () => {
    const updated = { ...editedPkg };
    const newStimId = `mandiri-${Date.now()}`;
    const nextQNum = totalQuestionsCount + 1;

    const newGroup: StimulusGroup = {
      stimulusId: newStimId,
      hasStimulus: false,
      title: 'Soal Mandiri (Langsung Jawab)',
      type: 'Soal Mandiri',
      content: '',
      questions: [
        {
          number: nextQNum,
          type: 'pg',
          cognitiveLevel: 'L2 - Penerapan',
          competency: 'Penguasaan Konsep Mandiri',
          prompt: 'Tuliskan pertanyaan soal mandiri di sini (langsung to the point tanpa stimulus):',
          options: [
            { key: 'A', text: 'Pilihan jawaban A' },
            { key: 'B', text: 'Pilihan jawaban B' },
            { key: 'C', text: 'Pilihan jawaban C' },
            { key: 'D', text: 'Pilihan jawaban D' }
          ],
          correctAnswer: 'A',
          explanation: 'Uraian dan langkah penyelesaian konsep.'
        }
      ]
    };

    updated.stimulusGroups.push(newGroup);
    updated.stimulusGroups = renumberAll(updated.stimulusGroups);
    setEditedPkg(updated);
    setSelectedStimulusIdx(updated.stimulusGroups.length - 1);
  };

  // Delete current stimulus group
  const handleDeleteCurrentStimulus = () => {
    if (editedPkg.stimulusGroups.length <= 1) {
      alert('Paket soal minimal harus memiliki 1 kelompok soal!');
      return;
    }
    const confirmDelete = window.confirm(
      `Yakin ingin menghapus Kelompok ${currentStimIdx + 1} berserta seluruh butir soalnya?`
    );
    if (!confirmDelete) return;

    const updated = { ...editedPkg };
    updated.stimulusGroups.splice(currentStimIdx, 1);
    updated.stimulusGroups = renumberAll(updated.stimulusGroups);
    setEditedPkg(updated);
    setSelectedStimulusIdx(Math.max(0, currentStimIdx - 1));
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (currentGroup.questions.length <= 1) {
      alert('Setiap kelompok wajib memiliki minimal 1 soal.');
      return;
    }
    const updated = { ...editedPkg };
    updated.stimulusGroups[currentStimIdx].questions.splice(qIdx, 1);
    updated.stimulusGroups = renumberAll(updated.stimulusGroups);
    setEditedPkg(updated);
  };

  // AI Transformation Handler
  const handleTransformQuestion = async (
    qIdx: number, 
    targetType: 'pg' | 'pgk' | 'bs' | 'sts' | 'jodohkan' | 'isian'
  ) => {
    const q = currentGroup.questions[qIdx];
    if (q.type === targetType) return;

    setTransformingQNum(q.number);
    setTransformSuccessMsg(null);

    try {
      const transformed = await transformQuestionWithAI(q, targetType, currentGroup);
      const updated = { ...editedPkg };
      updated.stimulusGroups[currentStimIdx].questions[qIdx] = transformed;
      setEditedPkg(updated);

      const typeLabel = 
        targetType === 'pg' ? 'Pilihan Ganda (PG)' :
        targetType === 'pgk' ? 'Pilihan Ganda Kompleks (PGK)' :
        targetType === 'bs' ? 'Benar / Salah (BS)' :
        targetType === 'sts' ? 'Sesuai / Tidak Sesuai (STS)' :
        targetType === 'jodohkan' ? 'Menjodohkan' : 'Isian Singkat';

      setTransformSuccessMsg(`✨ Soal No. ${q.number} berhasil diubah menjadi "${typeLabel}" oleh AI!`);
      setTimeout(() => setTransformSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(`Gagal merubah bentuk soal: ${err?.message || err}`);
    } finally {
      setTransformingQNum(null);
    }
  };

  const handleSaveAndClose = () => {
    onSave(editedPkg);
    onClose();
  };

  const isCurrentGroupWithStimulus = currentGroup.hasStimulus !== false && Boolean(
    (currentGroup.content && currentGroup.content.trim().length > 0) ||
    (currentGroup.title && !currentGroup.title.toLowerCase().includes('mandiri') && !currentGroup.title.toLowerCase().includes('tanpa stimulus'))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-xl font-bold flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-blue-400" />
                <span>Editor & Generator Soal Guru</span>
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30">
                Total {totalQuestionsCount} Soal • {editedPkg.stimulusGroups.length} Kelompok
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Atur jumlah soal, tambah soal mandiri atau dengan stimulus, serta ubah bentuk soal secara instan dengan AI.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Toolbar: Add Stimulus & Standalone Groups */}
        <div className="px-4 sm:px-6 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full scrollbar-none">
            {editedPkg.stimulusGroups.map((sg, idx) => {
              const hasStim = sg.hasStimulus !== false && Boolean(
                sg.content && sg.content.trim().length > 0 && !sg.title?.toLowerCase().includes('mandiri')
              );

              return (
                <button
                  key={sg.stimulusId}
                  onClick={() => setSelectedStimulusIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
                    currentStimIdx === idx
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  <span>{hasStim ? `📖 Stimulus ${idx + 1}` : `⚡ Mandiri ${idx + 1}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    currentStimIdx === idx ? 'bg-blue-800 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {sg.questions.length}
                  </span>
                </button>
              );
            })}

            {/* Quick add buttons */}
            <button
              onClick={handleAddNewStimulusGroup}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-300 flex items-center gap-1 shrink-0"
              title="Tambah Kelompok dengan Teks Stimulus"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Stimulus</span>
            </button>

            <button
              onClick={handleAddNewStandaloneGroup}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-300 flex items-center gap-1 shrink-0"
              title="Tambah Kelompok Soal Mandiri Langsung (Tanpa Teks Bacaan)"
            >
              <Plus className="w-3.5 h-3.5 text-amber-600" />
              <span>+ Soal Mandiri</span>
            </button>
          </div>

          {/* Action buttons for current stimulus */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleDeleteCurrentStimulus}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold px-2.5 py-1 rounded-lg hover:bg-rose-50 flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hapus Kelompok Ini</span>
            </button>
          </div>
        </div>

        {/* Notification Toast for AI Transform */}
        {transformSuccessMsg && (
          <div className="bg-emerald-600 text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{transformSuccessMsg}</span>
          </div>
        )}

        {/* Modal Body (Scrollable) */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 bg-slate-100/50">
          
          {/* Stimulus Editor Card with Toggle */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                  isCurrentGroupWithStimulus ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {isCurrentGroupWithStimulus ? '📖' : '⚡'}
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
                    {isCurrentGroupWithStimulus 
                      ? `Stimulus ${currentStimIdx + 1} (${currentGroup.questions.length} Soal Terhubung)`
                      : `Kelompok Soal Mandiri ${currentStimIdx + 1} (${currentGroup.questions.length} Soal)`}
                  </h4>
                  <div className="text-[11px] text-slate-500">
                    Rentang Butir: No. {currentGroup.questions[0]?.number || '-'} s/d No. {currentGroup.questions[currentGroup.questions.length - 1]?.number || '-'}
                  </div>
                </div>
              </div>

              {/* Toggle Stimulus Requirement */}
              <label className="flex items-center gap-2 cursor-pointer bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors select-none">
                <input
                  type="checkbox"
                  checked={isCurrentGroupWithStimulus}
                  onChange={(e) => handleToggleStimulus(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span className="text-xs font-bold text-slate-700">
                  {isCurrentGroupWithStimulus ? 'Gunakan Teks Stimulus' : 'Jadikan Soal Mandiri (Tanpa Stimulus)'}
                </span>
              </label>
            </div>

            {isCurrentGroupWithStimulus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Judul Stimulus:</label>
                    <input
                      type="text"
                      value={currentGroup.title}
                      onChange={(e) => handleUpdateStimulusField('title', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Tipe Stimulus:</label>
                    <input
                      type="text"
                      value={currentGroup.type}
                      onChange={(e) => handleUpdateStimulusField('type', e.target.value)}
                      placeholder="Misal: Teks Narasi / Infografis / Tabel"
                      className="w-full p-2.5 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Teks / Narasi Stimulus:</label>
                  <textarea
                    rows={4}
                    value={currentGroup.content}
                    onChange={(e) => handleUpdateStimulusField('content', e.target.value)}
                    placeholder="Tuliskan teks bacaan, paragraf, atau data stimulus di sini..."
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-mono leading-relaxed focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                <div className="font-extrabold flex items-center gap-1.5 text-amber-800 text-sm">
                  <span>⚡ Mode Soal Mandiri Langsung Aktif</span>
                </div>
                <p className="leading-relaxed text-slate-600">
                  Butir-butir soal pada kelompok ini <b>tidak memerlukan teks stimulus</b>. Siswa akan langsung membaca pertanyaan dan memilih/mengisi jawaban tanpa kolom bacaan di sebelah kiri.
                </p>
                <button
                  type="button"
                  onClick={() => handleToggleStimulus(true)}
                  className="mt-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg border border-blue-200"
                >
                  + Tambahkan Teks Bacaan / Stimulus ke Kelompok Ini
                </button>
              </div>
            )}
          </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <ListPlus className="w-4 h-4 text-blue-600" />
                <span>Daftar Soal pada Kelompok Ini ({currentGroup.questions.length} Butir):</span>
              </h4>

              {/* Add question with type picker */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-600">Tambah Soal:</span>
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion('pg')}
                  className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ PG</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion('pgk')}
                  className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ PGK</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion('bs')}
                  className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ B/S</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion('jodohkan')}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Jodohkan</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleAddNewQuestion('isian')}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ Isian</span>
                </button>
              </div>
            </div>

            {currentGroup.questions.map((q, qIdx) => {
              const isTransforming = transformingQNum === q.number;

              return (
                <div 
                  key={q.number} 
                  className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-4 transition-all hover:border-blue-300"
                >
                  {/* Question Header Card */}
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-100 gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                        {q.number}
                      </span>
                      <span className="font-extrabold text-sm text-slate-800">
                        Soal Nomor {q.number}
                      </span>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                        {q.cognitiveLevel || 'L2 - Penalaran'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {/* AI Transform Dropdown / Button */}
                      <div className="relative flex items-center gap-1">
                        <span className="text-[11px] font-bold text-slate-500">✨ Ubah Bentuk (AI):</span>
                        <select
                          disabled={isTransforming}
                          value={q.type}
                          onChange={(e) => handleTransformQuestion(qIdx, e.target.value as any)}
                          className="text-xs font-bold p-1.5 rounded-lg border border-purple-300 bg-purple-50 text-purple-900 cursor-pointer hover:bg-purple-100 focus:ring-2 focus:ring-purple-400"
                          title="Gunakan AI untuk merubah tipe soal secara otomatis"
                        >
                          <option value="pg">Pilihan Ganda (PG)</option>
                          <option value="pgk">Pilihan Ganda Kompleks (PGK)</option>
                          <option value="bs">Benar / Salah (B/S)</option>
                          <option value="sts">Sesuai / Tidak Sesuai (STS)</option>
                          <option value="jodohkan">Menjodohkan (Pasangan)</option>
                          <option value="isian">Isian Singkat</option>
                        </select>
                        {isTransforming && (
                          <div className="flex items-center gap-1 text-xs font-bold text-purple-700 animate-pulse">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Memproses AI...</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleDeleteQuestion(qIdx)}
                        className="text-rose-600 hover:text-rose-800 text-xs font-semibold px-2 py-1 rounded hover:bg-rose-50 flex items-center gap-1 transition-colors ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>

                  {/* Metadata: Indikator & Level Kognitif */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Indikator / Kompetensi:</label>
                      <input
                        type="text"
                        value={q.competency || ''}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'competency', e.target.value)}
                        placeholder="Contoh: Menginterpretasi data, Menemukan gagasan utama"
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">Level Kognitif:</label>
                      <select
                        value={q.cognitiveLevel || 'L2 - Penerapan'}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'cognitiveLevel', e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs text-slate-800 font-medium bg-white"
                      >
                        <option value="L1 - Pemahaman">L1 - Pemahaman (Knowing)</option>
                        <option value="L2 - Penerapan">L2 - Penerapan (Applying)</option>
                        <option value="L3 - Penalaran / HOTS">L3 - Penalaran / HOTS (Reasoning)</option>
                      </select>
                    </div>
                  </div>

                  {/* Prompt Editor */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Teks Pertanyaan / Instruksi Soal:</label>
                    <textarea
                      rows={2}
                      value={q.prompt}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'prompt', e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* 1. EDITOR TIPE PILIHAN GANDA (PG) */}
                  {q.type === 'pg' && q.options && (
                    <div className="space-y-2 pt-1 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between text-xs font-bold text-blue-900">
                        <span>Pilihan Jawaban (Pilih radio button untuk menentukan kunci benar):</span>
                        <span className="text-slate-500 text-[11px]">Kunci Saat Ini: {String(q.correctAnswer)}</span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => (
                          <div key={opt.key} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200">
                            <input
                              type="radio"
                              name={`kunci-pg-${q.number}`}
                              checked={q.correctAnswer === opt.key}
                              onChange={() => handleUpdateQuestion(qIdx, 'correctAnswer', opt.key)}
                              className="text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                              title="Jadikan sebagai kunci jawaban benar"
                            />
                            <span className="font-extrabold text-blue-700 text-xs min-w-4">{opt.key}.</span>
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const newOpts = [...q.options!];
                                newOpts[oIdx].text = e.target.value;
                                handleUpdateQuestion(qIdx, 'options', newOpts);
                              }}
                              className="flex-1 p-1 text-xs border-b border-transparent focus:border-blue-400 outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 2. EDITOR TIPE PILIHAN GANDA KOMPLEKS (PGK) */}
                  {q.type === 'pgk' && q.options && (
                    <div className="space-y-2 pt-1 bg-indigo-50/50 p-3 rounded-xl border border-indigo-200">
                      <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                        <span>Pilihan Ganda Kompleks (Centang semua kunci jawaban yang benar):</span>
                        <span className="text-slate-500 text-[11px]">
                          Kunci: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : 'Belum dipilih'}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, oIdx) => {
                          const currentArr: string[] = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
                          const isChecked = currentArr.includes(opt.key);

                          return (
                            <div key={opt.key} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-indigo-200">
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={(e) => {
                                  const newArr = e.target.checked
                                    ? [...currentArr, opt.key]
                                    : currentArr.filter(k => k !== opt.key);
                                  handleUpdateQuestion(qIdx, 'correctAnswer', newArr);
                                }}
                                className="text-indigo-600 focus:ring-indigo-500 rounded w-4 h-4 cursor-pointer"
                              />
                              <span className="font-bold text-indigo-700 text-xs min-w-6">[{opt.key}]</span>
                              <input
                                type="text"
                                value={opt.text}
                                onChange={(e) => {
                                  const newOpts = [...q.options!];
                                  newOpts[oIdx].text = e.target.value;
                                  handleUpdateQuestion(qIdx, 'options', newOpts);
                                }}
                                className="flex-1 p-1 text-xs border-b border-transparent focus:border-indigo-400 outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 3. EDITOR TIPE BENAR / SALAH ATAU SESUAI / TIDAK SESUAI (BS / STS) */}
                  {(q.type === 'bs' || q.type === 'sts') && q.statements && (
                    <div className="space-y-2 pt-1 bg-amber-50/50 p-3 rounded-xl border border-amber-200">
                      <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                        <span>Tabel Pernyataan & Kunci Kebenaran:</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newStmts = [...(q.statements || [])];
                            const newId = `s${newStmts.length + 1}`;
                            const isBS = q.type === 'bs';
                            newStmts.push({
                              id: newId,
                              text: `Pernyataan ke-${newStmts.length + 1}`,
                              answer: isBS ? 'Benar' : 'Sesuai'
                            });
                            const newAns = {
                              ...(typeof q.correctAnswer === 'object' && !Array.isArray(q.correctAnswer) ? q.correctAnswer : {}),
                              [newId]: isBS ? 'Benar' : 'Sesuai'
                            };
                            handleUpdateQuestion(qIdx, 'statements', newStmts);
                            handleUpdateQuestion(qIdx, 'correctAnswer', newAns);
                          }}
                          className="text-[11px] text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded font-bold"
                        >
                          + Tambah Pernyataan
                        </button>
                      </div>

                      <div className="space-y-2">
                        {q.statements.map((stmt, sIdx) => {
                          const isBS = q.type === 'bs';
                          const valTrue = isBS ? 'Benar' : 'Sesuai';
                          const valFalse = isBS ? 'Salah' : 'Tidak Sesuai';
                          const currAnsObj = (typeof q.correctAnswer === 'object' && !Array.isArray(q.correctAnswer)) ? q.correctAnswer : {};
                          const currentVal = currAnsObj[stmt.id] || stmt.answer || valTrue;

                          return (
                            <div key={stmt.id} className="flex items-center gap-2 bg-white p-2 rounded-lg border border-amber-200">
                              <span className="text-[11px] font-bold text-amber-800">{sIdx + 1}.</span>
                              <input
                                type="text"
                                value={stmt.text}
                                onChange={(e) => {
                                  const newStmts = [...q.statements!];
                                  newStmts[sIdx].text = e.target.value;
                                  handleUpdateQuestion(qIdx, 'statements', newStmts);
                                }}
                                className="flex-1 p-1 text-xs border-b border-transparent focus:border-amber-400 outline-none"
                              />
                              <div className="flex items-center gap-2 text-xs font-bold shrink-0">
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`stmt-${q.number}-${stmt.id}`}
                                    checked={currentVal === valTrue}
                                    onChange={() => {
                                      const newAns = { ...currAnsObj, [stmt.id]: valTrue };
                                      handleUpdateQuestion(qIdx, 'correctAnswer', newAns);
                                    }}
                                    className="text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-emerald-700 text-[11px]">{valTrue}</span>
                                </label>
                                <label className="flex items-center gap-1 cursor-pointer">
                                  <input
                                    type="radio"
                                    name={`stmt-${q.number}-${stmt.id}`}
                                    checked={currentVal === valFalse}
                                    onChange={() => {
                                      const newAns = { ...currAnsObj, [stmt.id]: valFalse };
                                      handleUpdateQuestion(qIdx, 'correctAnswer', newAns);
                                    }}
                                    className="text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                                  />
                                  <span className="text-rose-700 text-[11px]">{valFalse}</span>
                                </label>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* 4. EDITOR TIPE MENJODOHKAN (JODOHKAN) */}
                  {q.type === 'jodohkan' && (
                    <div className="space-y-2 pt-1 bg-purple-50/50 p-3 rounded-xl border border-purple-200">
                      <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                        <span>Pasangan Kolom Kiri & Kanan (Menjodohkan):</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newPairs = [...(q.matchingPairs || [])];
                            const newId = `m${newPairs.length + 1}`;
                            newPairs.push({
                              id: newId,
                              left: `Pernyataan / Konsep ${newPairs.length + 1}`,
                              right: `Jawaban Pasangan ${newPairs.length + 1}`
                            });
                            const newAns = {
                              ...(typeof q.correctAnswer === 'object' && !Array.isArray(q.correctAnswer) ? q.correctAnswer : {}),
                              [newId]: `Jawaban Pasangan ${newPairs.length + 1}`
                            };
                            handleUpdateQuestion(qIdx, 'matchingPairs', newPairs);
                            handleUpdateQuestion(qIdx, 'correctAnswer', newAns);
                          }}
                          className="text-[11px] text-purple-800 bg-purple-100 hover:bg-purple-200 px-2 py-0.5 rounded font-bold"
                        >
                          + Tambah Pasangan
                        </button>
                      </div>

                      <div className="space-y-2">
                        {(q.matchingPairs || []).map((pair, pIdx) => (
                          <div key={pair.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-white p-2 rounded-lg border border-purple-200 items-center">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-purple-700 min-w-5">{pIdx + 1}.</span>
                              <input
                                type="text"
                                placeholder="Kolom Kiri (Premis)"
                                value={pair.left}
                                onChange={(e) => {
                                  const newPairs = [...q.matchingPairs!];
                                  newPairs[pIdx].left = e.target.value;
                                  handleUpdateQuestion(qIdx, 'matchingPairs', newPairs);
                                }}
                                className="w-full p-1.5 rounded border border-slate-200 text-xs"
                              />
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-purple-500">➜</span>
                              <input
                                type="text"
                                placeholder="Kolom Kanan (Pasangan Benar)"
                                value={pair.right}
                                onChange={(e) => {
                                  const newPairs = [...q.matchingPairs!];
                                  newPairs[pIdx].right = e.target.value;
                                  const currAns = (typeof q.correctAnswer === 'object' && !Array.isArray(q.correctAnswer)) ? q.correctAnswer : {};
                                  const updatedAns = { ...currAns, [pair.id]: e.target.value };
                                  handleUpdateQuestion(qIdx, 'matchingPairs', newPairs);
                                  handleUpdateQuestion(qIdx, 'correctAnswer', updatedAns);
                                }}
                                className="w-full p-1.5 rounded border border-purple-200 bg-purple-50/50 text-xs font-bold text-purple-900"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 5. EDITOR TIPE ISIAN SINGKAT */}
                  {q.type === 'isian' && (
                    <div className="space-y-2 pt-1 bg-emerald-50/50 p-3 rounded-xl border border-emerald-200">
                      <label className="block text-xs font-bold text-emerald-900">
                        Kunci Jawaban Singkat Siswa:
                      </label>
                      <input
                        type="text"
                        value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''}
                        onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', e.target.value)}
                        placeholder="Masukkan kata kunci atau angka jawaban singkat..."
                        className="w-full p-2.5 rounded-lg border border-emerald-300 bg-white text-xs sm:text-sm font-bold text-emerald-800"
                      />
                      <p className="text-[11px] text-slate-500">
                        * Sistem akan mencocokkan teks jawaban siswa secara otomatis tanpa membedakan huruf besar/kecil.
                      </p>
                    </div>
                  )}

                  {/* Pembahasan & Solusi */}
                  <div className="pt-1">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Pembahasan & Solusi:</label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      placeholder="Uraian langkah kerja, analisis stimulus, dan alasan jawaban benar..."
                      className="w-full p-2.5 rounded-lg border border-slate-300 text-xs text-slate-700 bg-slate-50"
                    />
                  </div>

                </div>
              );
            })}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3">
          <div className="text-xs font-semibold text-slate-500 hidden sm:block">
            Semua perubahan akan disimpan ke sesi aktif dan siap disinkronkan ke Google Drive.
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleSaveAndClose}
              className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Naskah ({totalQuestionsCount} Soal)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

