import React, { useState } from 'react';
import { 
  Printer, 
  FileDown, 
  Eye, 
  EyeOff, 
  PenTool, 
  Edit3, 
  Share2, 
  Check, 
  HelpCircle, 
  BookOpen, 
  Sparkles,
  Layers
} from 'lucide-react';
import { TKAPackage } from '../data/defaultPackages';

interface NaskahViewProps {
  pkg: TKAPackage;
  onStartExam: () => void;
  onOpenEditor: () => void;
  onDownloadStandalone: () => void;
  onOpenUpload?: () => void;
  isAdminGuru?: boolean;
}

export const NaskahView: React.FC<NaskahViewProps> = ({
  pkg,
  onStartExam,
  onOpenEditor,
  onDownloadStandalone,
  onOpenUpload,
  isAdminGuru = false
}) => {
  const [showAnswerKey, setShowAnswerKey] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrintExamOnly = () => {
    const wasKeyVisible = showAnswerKey;
    setShowAnswerKey(false);
    setTimeout(() => {
      window.print();
      setShowAnswerKey(wasKeyVisible);
    }, 150);
  };

  const handlePrintKeyOnly = () => {
    setShowAnswerKey(true);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  // Calculate total questions
  let totalQuestions = 0;
  pkg.stimulusGroups.forEach(sg => {
    totalQuestions += sg.questions.length;
  });

  return (
    <div className="max-w-5xl mx-auto my-6 px-4 sm:px-6">
      
      {/* Action Toolbar Header (Hidden in Print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 mb-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">
              {pkg.subject} • {pkg.grade}
            </span>
            <span className="text-xs text-slate-500 font-medium">
              {totalQuestions} Butir Soal • {pkg.stimulusGroups.length} Stimulus
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 line-clamp-1">
            {pkg.title}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {isAdminGuru ? (
            <>
              <button
                onClick={() => setShowAnswerKey(!showAnswerKey)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
              >
                {showAnswerKey ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-blue-600" />}
                <span>{showAnswerKey ? 'Sembunyikan Kunci' : 'Tampilkan Kunci & Pembahasan'}</span>
              </button>

              <button
                onClick={onOpenEditor}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                title="Edit stimulus, pertanyaan, opsi, dan kunci jawaban"
              >
                <Edit3 className="w-4 h-4 text-amber-600" />
                <span>Edit Soal Guru</span>
              </button>

              {onOpenUpload && (
                <button
                  onClick={onOpenUpload}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  title="Upload naskah soal baru"
                >
                  <span>📤 Upload Naskah</span>
                </button>
              )}
            </>
          ) : (
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-2 rounded-lg border border-slate-200">
              🔒 Kunci Jawaban & Pembahasan Disimpan Guru
            </span>
          )}

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-semibold rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
            title="Salin tautan latihan untuk dibagikan ke siswa"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
            <span>{copiedLink ? 'Tersalin!' : 'Bagikan'}</span>
          </button>

          <button
            onClick={handlePrintExamOnly}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-lg border border-slate-300 bg-slate-900 text-white hover:bg-black transition-colors shadow-sm"
          >
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Cetak Naskah A4</span>
          </button>

          <button
            onClick={onStartExam}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
          >
            <PenTool className="w-4 h-4" />
            <span>Mulai Ujian Siswa</span>
          </button>
        </div>
      </div>

      {/* Official A4 Assessment Sheet Container */}
      <article className="bg-white border border-slate-300 shadow-xl rounded-2xl print:border-none print:shadow-none print:rounded-none p-4 sm:p-10 lg:p-16 max-w-4xl mx-auto print:p-0">
        
        {/* Official Kop Surat Header */}
        <div className="border-b-4 border-double border-slate-900 pb-4 mb-6 text-center select-none">
          <div className="text-xs sm:text-sm font-bold tracking-widest text-slate-900 uppercase">
            KEMENTERIAN PENDIDIKAN DASAR DAN MENENGAH REPUBLIK INDONESIA
          </div>
          <div className="text-[11px] sm:text-xs font-semibold text-slate-600 tracking-wider uppercase mt-0.5">
            PUSAT ASESMEN PENDIDIKAN (PUSMENDIK) • KELAS 5 JUARA
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-2 uppercase">
            LEMBAR ASESMEN TES KEMAMPUAN AKADEMIK (TKA)
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 text-xs sm:text-sm text-slate-800 font-semibold mt-3 pt-2 border-t border-slate-300">
            <div>Mata Pelajaran: <span className="font-bold underline">{pkg.subject}</span></div>
            <div>Jenjang: <span className="font-bold underline">{pkg.grade}</span></div>
            <div>Tahun Ajaran: <span className="font-bold underline">{pkg.academicYear}</span></div>
            <div>Alokasi Waktu: <span className="font-bold underline">{pkg.timeLimitMinutes} Menit</span></div>
          </div>
        </div>

        {/* Petunjuk Pengerjaan */}
        <div className="mb-8 p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs sm:text-[13px] text-slate-700 leading-relaxed avoid-break">
          <strong className="block font-bold text-slate-900 mb-1">PETUNJUK PENGERJAAN:</strong>
          <ol className="list-decimal list-inside space-y-0.5 pl-1">
            <li>Bacalah teks, cerita, data statistik, atau grafik stimulus secara saksama sebelum menjawab pertanyaan.</li>
            <li>Satu stimulus digunakan untuk menjawab 3 (tiga) butir soal yang saling berurutan.</li>
            <li>Untuk soal Pilihan Ganda Tunggal, pilihlah satu jawaban yang paling tepat (A, B, C, atau D).</li>
            <li>Untuk soal Pilihan Ganda Kompleks, pilihlah seluruh opsi yang benar (jawaban benar lebih dari satu).</li>
            <li>Untuk tipe Benar/Salah atau Sesuai/Tidak Sesuai, berilah tanda centang pada kolom yang sesuai.</li>
          </ol>
        </div>

        {/* Stimulus & Questions Loop */}
        <div className="space-y-10">
          {pkg.stimulusGroups.map((group, groupIdx) => {
            const firstNum = group.questions[0]?.number || 1;
            const lastNum = group.questions[group.questions.length - 1]?.number || 3;

            return (
              <section key={group.stimulusId} className="space-y-6">
                
                {/* Stimulus Box (Bordered, authentic document style) */}
                <div className="p-5 sm:p-6 rounded-xl bg-slate-50/80 border-2 border-slate-300 avoid-break print:bg-white print:border-slate-400">
                  <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-200 uppercase tracking-wide">
                      Stimulus {groupIdx + 1} • {group.type}
                    </span>
                    <span className="text-xs font-bold text-slate-600 italic">
                      (Untuk menjawab Soal No. {firstNum} s.d. {lastNum})
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-2.5">
                    {group.title}
                  </h3>

                  <div className="text-sm sm:text-[15px] leading-relaxed text-slate-800 whitespace-pre-line text-justify font-serif">
                    {group.content}
                  </div>

                  {/* SVG Diagram if present */}
                  {group.svgDiagram && (
                    <div 
                      className="my-4 max-w-md mx-auto overflow-hidden flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: group.svgDiagram }}
                    />
                  )}

                  {/* Structured Table if present */}
                  {group.tableData && group.tableData.length > 0 && (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full text-xs sm:text-sm border-collapse border border-slate-300 text-left">
                        <thead>
                          <tr className="bg-slate-200/80 text-slate-900">
                            {Object.keys(group.tableData[0]).map((headerKey) => (
                              <th key={headerKey} className="border border-slate-300 px-3 py-2 font-bold">
                                {headerKey}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {group.tableData.map((row, rIdx) => (
                            <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                              {Object.values(row).map((val: any, cIdx) => (
                                <td key={cIdx} className="border border-slate-300 px-3 py-2">
                                  {val}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* 3 Questions for this Stimulus */}
                <div className="space-y-6 pl-2 sm:pl-4">
                  {group.questions.map((q) => (
                    <div key={q.number} className="avoid-break space-y-3 pt-2">
                      <div className="flex items-start gap-3">
                        <span className="font-extrabold text-base text-slate-900 min-w-7 text-right">
                          {q.number}.
                        </span>
                        <div className="flex-1">
                          <div className="text-sm sm:text-base font-semibold text-slate-900 leading-snug">
                            {q.prompt}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 font-medium">
                            <span>Tingkat: {q.cognitiveLevel}</span>
                            <span>•</span>
                            <span>Kompetensi: {q.competency}</span>
                          </div>

                          {/* Render Options: PG (Single) */}
                          {q.type === 'pg' && q.options && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 pt-1">
                              {q.options.map((opt) => (
                                <div key={opt.key} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                                  <span className="font-bold text-blue-700 min-w-5">
                                    {opt.key}.
                                  </span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Render Options: PGK (Complex Multiple Answers) */}
                          {q.type === 'pgk' && q.options && (
                            <div className="space-y-2 mt-3 pt-1">
                              {q.options.map((opt) => (
                                <div key={opt.key} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-800">
                                  <span className="inline-block w-4 h-4 border-2 border-slate-400 rounded-sm mt-0.5 shrink-0" />
                                  <span className="font-bold text-slate-700">[{opt.key}]</span>
                                  <span>{opt.text}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Render Matrix Table: Benar/Salah, Sesuai/Tidak Sesuai, Mendukung/Tidak */}
                          {q.statements && q.statements.length > 0 && (
                            <div className="mt-3 overflow-x-auto">
                              <table className="w-full text-xs sm:text-sm border-collapse border border-slate-300">
                                <thead>
                                  <tr className="bg-slate-100 text-slate-800">
                                    <th className="border border-slate-300 p-2 text-left font-bold">
                                      Pernyataan
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center w-28 font-bold">
                                      {q.type === 'bs' ? 'Benar' : q.type === 'sts' ? 'Sesuai' : 'Mendukung'}
                                    </th>
                                    <th className="border border-slate-300 p-2 text-center w-28 font-bold">
                                      {q.type === 'bs' ? 'Salah' : q.type === 'sts' ? 'Tidak Sesuai' : 'Tidak Mendukung'}
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {q.statements.map((stmt) => (
                                    <tr key={stmt.id}>
                                      <td className="border border-slate-300 p-2 text-slate-800">
                                        {stmt.text}
                                      </td>
                                      <td className="border border-slate-300 p-2 text-center text-slate-400">
                                        [ &nbsp; ]
                                      </td>
                                      <td className="border border-slate-300 p-2 text-center text-slate-400">
                                        [ &nbsp; ]
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}

                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </section>
            );
          })}
        </div>

        {/* Answer Key & Explanation Section (Toggleable or printed on separate page - ONLY FOR ADMIN GURU) */}
        {isAdminGuru && showAnswerKey && (
          <div className="mt-14 pt-8 border-t-4 border-slate-900 avoid-break">
            <div className="text-center mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-blue-700">
                DOKUMEN KUNCI JAWABAN & PEDOMAN PENSKORAN
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 uppercase mt-1">
                KUNCI DAN PEMBAHASAN LENGKAP ASESMEN TKA
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {pkg.title} • {pkg.subject}
              </p>
            </div>

            <div className="space-y-4">
              {pkg.stimulusGroups.flatMap(sg => sg.questions).map((q) => (
                <div 
                  key={q.number}
                  className="p-4 rounded-xl bg-slate-50 border-l-4 border-blue-600 border border-slate-200 text-xs sm:text-sm"
                >
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span className="text-slate-900">Nomor {q.number} ({q.cognitiveLevel})</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Kunci: {typeof q.correctAnswer === 'object' ? JSON.stringify(q.correctAnswer) : q.correctAnswer}
                    </span>
                  </div>
                  <div className="text-slate-600 font-medium mb-1.5">{q.prompt}</div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700 leading-relaxed">
                    <strong className="text-blue-900">Pembahasan & Langkah Solusi: </strong>
                    <span className="whitespace-pre-line">{q.explanation}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer of the page */}
        <div className="mt-12 pt-4 border-t border-slate-300 flex items-center justify-between text-[11px] text-slate-500">
          <span>KELAS 5 JUARA • Standar Asesmen Pusmendik Kemendikdasmen</span>
          <span>Halaman Resmi Asesmen TKA</span>
        </div>

      </article>

    </div>
  );
};
