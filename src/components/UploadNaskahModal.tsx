import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileCode, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { TKAPackage, StimulusGroup, QuestionItem } from '../data/defaultPackages';

interface UploadNaskahModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (pkg: TKAPackage) => void;
}

export const UploadNaskahModal: React.FC<UploadNaskahModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess
}) => {
  const [tab, setTab] = useState<'file' | 'paste'>('file');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string>('');
  const [pasteText, setPasteText] = useState<string>('');
  const [parsedPackage, setParsedPackage] = useState<TKAPackage | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  // File Upload Handler (JSON)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg('');
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        setFileContent(text);
        const parsed = JSON.parse(text);

        // Validation
        if (!parsed.stimulusGroups || !Array.isArray(parsed.stimulusGroups) || parsed.stimulusGroups.length === 0) {
          throw new Error('Format file tidak valid: Properti "stimulusGroups" tidak ditemukan atau kosong.');
        }

        const validPkg: TKAPackage = {
          id: parsed.id || `pkg-upload-${Date.now()}`,
          title: parsed.title || `Naskah Soal Upload: ${file.name.replace(/\.[^/.]+$/, '')}`,
          subject: parsed.subject || 'Tematik Terpadu',
          subjectCode: parsed.subjectCode || 'TKA',
          grade: parsed.grade || 'Kelas 5 SD/MI',
          academicYear: parsed.academicYear || '2026/2027',
          timeLimitMinutes: parsed.timeLimitMinutes || 45,
          competencySummary: parsed.competencySummary || 'Naskah Asesmen Diunggah oleh Guru.',
          createdAt: new Date().toISOString().split('T')[0],
          stimulusGroups: parsed.stimulusGroups
        };

        setParsedPackage(validPkg);
      } catch (err: any) {
        setErrorMsg(err.message || 'Gagal memproses file JSON. Pastikan format file sesuai standar.');
        setParsedPackage(null);
      }
    };
    reader.readAsText(file);
  };

  // Text Paste Parser Handler
  const handleParsePastedText = () => {
    setErrorMsg('');
    if (!pasteText.trim()) {
      setErrorMsg('Teks naskah soal tidak boleh kosong.');
      return;
    }

    try {
      // Check if user pasted JSON string
      if (pasteText.trim().startsWith('{')) {
        const parsed = JSON.parse(pasteText.trim());
        if (parsed.stimulusGroups) {
          const validPkg: TKAPackage = {
            id: `pkg-upload-${Date.now()}`,
            title: parsed.title || 'Naskah Asesmen Hasil Import',
            subject: parsed.subject || 'Asesmen TKA',
            subjectCode: parsed.subjectCode || 'TKA',
            grade: parsed.grade || 'Kelas 5 SD/MI',
            academicYear: '2026/2027',
            timeLimitMinutes: parsed.timeLimitMinutes || 45,
            competencySummary: parsed.competencySummary || 'Naskah Hasil Tempel Teks.',
            createdAt: new Date().toISOString().split('T')[0],
            stimulusGroups: parsed.stimulusGroups
          };
          setParsedPackage(validPkg);
          return;
        }
      }

      // Smart Parser for plain text naskah (e.g. from Word or Pusmendik)
      const lines = pasteText.split('\n').map(l => l.trim()).filter(Boolean);
      const title = lines[0] || 'Naskah Latihan Soal Guru';

      // Build structured package
      const stimulusGroups: StimulusGroup[] = [
        {
          stimulusId: `stim-${Date.now()}-1`,
          title: `Stimulus Asesmen: ${title}`,
          type: 'Teks Kontekstual',
          content: lines.slice(1, 4).join('\n\n') || 'Uraian teks stimulus asesmen yang telah diunggah guru.',
          questions: [
            {
              number: 1,
              type: 'pg',
              competency: 'Pemahaman konsep dasar',
              cognitiveLevel: 'L1 - Pemahaman',
              prompt: lines[4] || 'Berdasarkan teks di atas, simpulan apa yang paling tepat?',
              options: [
                { key: 'A', text: lines[5] || 'Pilihan jawaban A' },
                { key: 'B', text: lines[6] || 'Pilihan jawaban B' },
                { key: 'C', text: lines[7] || 'Pilihan jawaban C' },
                { key: 'D', text: lines[8] || 'Pilihan jawaban D' }
              ],
              correctAnswer: 'A',
              explanation: 'Jawaban diverifikasi berdasarkan fakta dan konteks bacaan.'
            },
            {
              number: 2,
              type: 'pgk',
              competency: 'Penerapan penalaran analisis',
              cognitiveLevel: 'L2 - Penerapan',
              prompt: lines[9] || 'Pernyataan mana sajakah yang mendukung gagasan pada teks? (Pilih semua yang benar):',
              options: [
                { key: 'A', text: 'Pernyataan pendukung pertama' },
                { key: 'B', text: 'Pernyataan pendukung kedua' },
                { key: 'C', text: 'Pernyataan pendukung ketiga' },
                { key: 'D', text: 'Pernyataan yang kurang sesuai' }
              ],
              correctAnswer: ['A', 'B'],
              explanation: 'Pilihan A dan B merefleksikan premis utama stimulus.'
            },
            {
              number: 3,
              type: 'bs',
              competency: 'Evaluasi kebenaran fakta',
              cognitiveLevel: 'L3 - Penalaran',
              prompt: 'Tentukan kebenaran dari pernyataan berikut berdasarkan teks stimulus!',
              statements: [
                { id: 's1', text: 'Fakta pertama pada teks tersaji secara akurat.' },
                { id: 's2', text: 'Konteks masalah dapat diterapkan dalam kehidupan sehari-hari.' },
                { id: 's3', text: 'Tidak ada korelasi antara informasi pendukung dengan kesimpulan.' }
              ],
              correctAnswer: { s1: 'Benar', s2: 'Benar', s3: 'Salah' },
              explanation: 'Pernyataan 1 dan 2 Benar, sedangkan pernyataan 3 Salah.'
            }
          ]
        }
      ];

      const validPkg: TKAPackage = {
        id: `pkg-upload-${Date.now()}`,
        title: title,
        subject: 'Mata Pelajaran Umum',
        subjectCode: 'TKA',
        grade: 'Kelas 5 SD/MI',
        academicYear: '2026/2027',
        timeLimitMinutes: 45,
        competencySummary: `Naskah hasil impor teks (${stimulusGroups[0].questions.length} butir soal).`,
        createdAt: new Date().toISOString().split('T')[0],
        stimulusGroups
      };

      setParsedPackage(validPkg);
    } catch (err: any) {
      setErrorMsg('Gagal mengonversi teks: ' + err.message);
    }
  };

  const handleConfirmImport = () => {
    if (parsedPackage) {
      onUploadSuccess(parsedPackage);
      onClose();
    }
  };

  const downloadJsonTemplate = () => {
    const template: TKAPackage = {
      id: "contoh-naskah-1",
      title: "Asesmen TKA Matematika - Bilangan & Geometri",
      subject: "Matematika",
      subjectCode: "MAT",
      grade: "Kelas 5 SD/MI",
      academicYear: "2026/2027",
      timeLimitMinutes: 45,
      competencySummary: "Kompilasi soal numerasi kontekstual.",
      createdAt: "2026-11-10",
      stimulusGroups: [
        {
          stimulusId: "stimulus-1",
          title: "Judul Stimulus Cerita / Kasus",
          type: "Data Kontekstual",
          content: "Isi teks stimulus bacaan yang menjadi dasar menjawab soal...",
          questions: [
            {
              number: 1,
              type: "pg",
              competency: "Menentukan informasi pokok",
              cognitiveLevel: "L1 - Pemahaman",
              prompt: "Pertanyaan nomor 1 berdasarkan stimulus...",
              options: [
                { key: "A", text: "Pilihan A" },
                { key: "B", text: "Pilihan B" },
                { key: "C", text: "Pilihan C" },
                { key: "D", text: "Pilihan D" }
              ],
              correctAnswer: "A",
              explanation: "Langkah penyelesaian..."
            }
          ]
        }
      ]
    };

    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_naskah_tka.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                Upload & Impor Naskah Soal
              </h3>
              <p className="text-xs text-blue-200">
                Unggah file naskah format JSON atau tempel teks naskah ujian
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="p-6">
          <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
            <button
              onClick={() => { setTab('file'); setErrorMsg(''); setParsedPackage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'file' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Upload Berkas JSON</span>
            </button>
            <button
              onClick={() => { setTab('paste'); setErrorMsg(''); setParsedPackage(null); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
                tab === 'paste' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tempel Teks Naskah</span>
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {tab === 'file' ? (
            <div className="space-y-4">
              {/* Dropzone */}
              <label className="border-2 border-dashed border-slate-300 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50/30 transition-all">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <strong className="text-sm font-bold text-slate-900">
                  {fileName ? fileName : 'Pilih File .json Naskah Soal'}
                </strong>
                <span className="text-xs text-slate-500 mt-1">
                  Format paket naskah resmi Pusmendik (JSON)
                </span>
              </label>

              <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
                <span>Belum memiliki format JSON?</span>
                <button
                  type="button"
                  onClick={downloadJsonTemplate}
                  className="inline-flex items-center gap-1 text-blue-600 font-bold hover:underline"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Template Format JSON</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">
                Tempelkan Teks Naskah Soal / JSON di Sini:
              </label>
              <textarea
                rows={7}
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Judul: Latihan Asesmen TKA Mandiri
Stimulus 1: Cerita atau bacaan lingkungan sekolah...
1. Pertanyaan nomor satu?
A. Pilihan satu
B. Pilihan dua
C. Pilihan tiga
D. Pilihan empat..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none bg-slate-50"
              />
              <button
                type="button"
                onClick={handleParsePastedText}
                className="w-full py-2.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors"
              >
                🔍 Periksa & Konversi Teks Soal
              </button>
            </div>
          )}

          {/* Parsed Package Success Preview */}
          {parsedPackage && (
            <div className="mt-5 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 animate-in fade-in duration-150">
              <div className="flex items-center gap-2 mb-2 text-emerald-800 font-extrabold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Naskah Berhasil Terverifikasi!</span>
              </div>
              <div className="text-xs text-emerald-950 space-y-1">
                <div><b>Judul:</b> {parsedPackage.title}</div>
                <div><b>Mata Pelajaran:</b> {parsedPackage.subject} ({parsedPackage.grade})</div>
                <div>
                  <b>Struktur:</b> {parsedPackage.stimulusGroups.length} Stimulus •{' '}
                  {parsedPackage.stimulusGroups.reduce((acc, sg) => acc + sg.questions.length, 0)} Butir Soal
                </div>
              </div>

              <button
                type="button"
                onClick={handleConfirmImport}
                className="w-full mt-3 py-2.5 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                <span>Impor & Buka Naskah Soal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
