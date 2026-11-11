import React, { useState } from 'react';
import { X, Save, Trash2, Plus, Edit2, Layers, Check } from 'lucide-react';
import { TKAPackage, StimulusGroup, QuestionItem } from '../data/defaultPackages';

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
  const [editedPkg, setEditedPkg] = useState<TKAPackage>(JSON.parse(JSON.stringify(pkg)));
  const [selectedStimulusIdx, setSelectedStimulusIdx] = useState(0);

  if (!isOpen) return null;

  const currentGroup = editedPkg.stimulusGroups[selectedStimulusIdx];

  const handleUpdateStimulusField = (field: keyof StimulusGroup, val: any) => {
    const updated = { ...editedPkg };
    updated.stimulusGroups[selectedStimulusIdx] = {
      ...updated.stimulusGroups[selectedStimulusIdx],
      [field]: val
    };
    setEditedPkg(updated);
  };

  const handleUpdateQuestion = (qIdx: number, field: keyof QuestionItem, val: any) => {
    const updated = { ...editedPkg };
    const group = updated.stimulusGroups[selectedStimulusIdx];
    const qList = [...group.questions];
    qList[qIdx] = {
      ...qList[qIdx],
      [field]: val
    };
    updated.stimulusGroups[selectedStimulusIdx].questions = qList;
    setEditedPkg(updated);
  };

  const handleDeleteQuestion = (qIdx: number) => {
    if (currentGroup.questions.length <= 1) {
      alert("Setiap stimulus wajib memiliki minimal 1 soal.");
      return;
    }
    const updated = { ...editedPkg };
    updated.stimulusGroups[selectedStimulusIdx].questions.splice(qIdx, 1);
    // Renumber all questions sequentially
    let counter = 1;
    updated.stimulusGroups.forEach(sg => {
      sg.questions.forEach(q => {
        q.number = counter++;
      });
    });
    setEditedPkg(updated);
  };

  const handleSaveAndClose = () => {
    onSave(editedPkg);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-lg sm:text-xl font-bold flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-blue-400" />
              <span>Editor Naskah Soal Guru</span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Edit langsung narasi stimulus, redaksi pertanyaan, opsi pilihan, kunci, dan pembahasan.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stimulus Tab Selector */}
        <div className="px-6 py-3 bg-slate-100 border-b border-slate-200 flex items-center gap-2 overflow-x-auto">
          {editedPkg.stimulusGroups.map((sg, idx) => (
            <button
              key={sg.stimulusId}
              onClick={() => setSelectedStimulusIdx(idx)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedStimulusIdx === idx
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-200'
              }`}
            >
              Stimulus {idx + 1} ({sg.questions.length} Soal)
            </button>
          ))}
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Stimulus Editor */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
            <h4 className="font-extrabold text-sm text-blue-900 uppercase tracking-wide">
              Data Stimulus {selectedStimulusIdx + 1}
            </h4>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Judul Stimulus:</label>
              <input
                type="text"
                value={currentGroup.title}
                onChange={(e) => handleUpdateStimulusField('title', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Teks / Narasi Stimulus:</label>
              <textarea
                rows={4}
                value={currentGroup.content}
                onChange={(e) => handleUpdateStimulusField('content', e.target.value)}
                className="w-full p-3 rounded-lg border border-slate-300 bg-white text-xs sm:text-sm font-mono leading-relaxed"
              />
            </div>
          </div>

          {/* Questions Editor for this Stimulus */}
          <div className="space-y-4">
            <h4 className="font-extrabold text-sm text-slate-900 uppercase tracking-wide">
              Daftar Soal pada Stimulus Ini:
            </h4>

            {currentGroup.questions.map((q, qIdx) => (
              <div key={q.number} className="p-5 rounded-2xl border border-slate-200 bg-white shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="font-bold text-sm text-blue-600">
                    Soal Nomor {q.number} ({q.cognitiveLevel})
                  </span>
                  <button
                    onClick={() => handleDeleteQuestion(qIdx)}
                    className="text-rose-600 hover:text-rose-800 text-xs font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus Soal</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Teks Pertanyaan:</label>
                  <textarea
                    rows={2}
                    value={q.prompt}
                    onChange={(e) => handleUpdateQuestion(qIdx, 'prompt', e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Options if PG */}
                {q.type === 'pg' && q.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {q.options.map((opt, oIdx) => (
                      <div key={opt.key} className="flex items-center gap-2">
                        <span className="font-bold text-blue-700 min-w-5">{opt.key}.</span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => {
                            const newOpts = [...q.options!];
                            newOpts[oIdx].text = e.target.value;
                            handleUpdateQuestion(qIdx, 'options', newOpts);
                          }}
                          className="flex-1 p-2 rounded-lg border border-slate-200 text-xs bg-slate-50"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* Correct Answer & Explanation */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Kunci Jawaban:</label>
                    <input
                      type="text"
                      value={typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'correctAnswer', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs font-bold text-emerald-700 bg-emerald-50/50"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-600 mb-1">Pembahasan & Solusi:</label>
                    <textarea
                      rows={2}
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(qIdx, 'explanation', e.target.value)}
                      className="w-full p-2 rounded-lg border border-slate-300 text-xs text-slate-700"
                    />
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100"
          >
            Batal
          </button>
          <button
            onClick={handleSaveAndClose}
            className="flex items-center gap-1.5 px-5 py-2 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan</span>
          </button>
        </div>

      </div>
    </div>
  );
};
