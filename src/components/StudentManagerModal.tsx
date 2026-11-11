import React, { useState, useEffect } from 'react';
import { 
  X, 
  UserPlus, 
  Users, 
  FileSpreadsheet, 
  FolderKanban, 
  Search, 
  Trash2, 
  Download, 
  Upload, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  RefreshCw,
  Sparkles,
  School,
  GraduationCap
} from 'lucide-react';
import { StudentRecord } from '../types';
import { 
  getRegisteredStudents, 
  addStudent, 
  deleteStudent, 
  importStudentsFromSpreadsheet, 
  exportStudentsToCSV 
} from '../utils/studentStore';
import { 
  GOOGLE_DRIVE_FOLDER_ID, 
  GOOGLE_DRIVE_FOLDER_URL, 
  syncStudentsToDrive, 
  fetchStudentsFromDrive, 
  createOrUpdateGoogleSheetRoster,
  isGoogleAuthenticated,
  signInWithGoogleAccount 
} from '../utils/googleWorkspace';

interface StudentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudentManagerModal: React.FC<StudentManagerModalProps> = ({
  isOpen,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'daftar' | 'tambah' | 'import' | 'drive'>('daftar');
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Single Add form
  const [newNisn, setNewNisn] = useState('');
  const [newName, setNewName] = useState('');
  const [newClass, setNewClass] = useState('Kelas 5A');
  const [newSchool, setNewSchool] = useState('SDN 1 Purwasari');
  
  // Spreadsheet import
  const [pasteData, setPasteData] = useState('');
  const [importReport, setImportReport] = useState<{ added: number; updated: number; total: number; errors: string[] } | null>(null);

  // Status & feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [createdSheetUrl, setCreatedSheetUrl] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadStudents();
    }
  }, [isOpen]);

  const loadStudents = () => {
    const list = getRegisteredStudents();
    setStudents(list);
  };

  const showToast = (type: 'success' | 'error', text: string) => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 4000);
  };

  if (!isOpen) return null;

  // Handle Add Single Student
  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      addStudent({
        nisn: newNisn,
        name: newName,
        className: newClass,
        schoolName: newSchool
      });
      loadStudents();
      setNewNisn('');
      setNewName('');
      showToast('success', `Siswa ${newName} (NISN: ${newNisn}) berhasil didaftarkan!`);
      setActiveTab('daftar');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menambahkan siswa.');
    }
  };

  // Handle Delete
  const handleDeleteStudent = (nisn: string, name: string) => {
    if (confirm(`Hapus data siswa ${name} (NISN: ${nisn})? Siswa tidak akan dapat masuk ujian dengan NISN ini.`)) {
      deleteStudent(nisn);
      loadStudents();
      showToast('success', `Data siswa ${name} telah dihapus.`);
    }
  };

  // Handle Import from Spreadsheet Text
  const handleProcessImport = () => {
    if (!pasteData.trim()) {
      showToast('error', 'Silakan tempel data dari Excel atau Google Sheets terlebih dahulu.');
      return;
    }

    try {
      const report = importStudentsFromSpreadsheet(pasteData, newSchool);
      setImportReport(report);
      loadStudents();
      showToast('success', `Berhasil memproses data: ${report.added} siswa baru ditambahkan, ${report.updated} diperbarui!`);
      setPasteData('');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal memproses data spreadsheet.');
    }
  };

  // Handle Export CSV
  const handleExportCSV = () => {
    const csv = exportStudentsToCSV();
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `data_siswa_tka_kelas5_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showToast('success', 'File CSV data siswa berhasil diunduh.');
  };

  // Handle Sync to Google Drive
  const handleSyncToDrive = async () => {
    setIsSyncing(true);
    try {
      if (!isGoogleAuthenticated()) {
        await signInWithGoogleAccount();
      }
      const res = await syncStudentsToDrive(students);
      showToast('success', `Data ${students.length} siswa berhasil disinkronkan ke Google Drive!`);
      if (res.url) {
        setCreatedSheetUrl(res.url);
      }
    } catch (err: any) {
      showToast('error', err.message || 'Gagal menyinkronkan ke Google Drive.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Handle Create or Update real Google Sheet
  const handleCreateGoogleSheet = async () => {
    setIsSyncing(true);
    try {
      if (!isGoogleAuthenticated()) {
        await signInWithGoogleAccount();
      }
      const res = await createOrUpdateGoogleSheetRoster(students);
      setCreatedSheetUrl(res.spreadsheetUrl);
      showToast('success', 'Google Spreadsheet "DATA SISWA & NISN" berhasil dibuat di Drive!');
    } catch (err: any) {
      showToast('error', err.message || 'Gagal membuat Google Spreadsheet.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Filter students by search
  const filteredStudents = students.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.nisn.includes(searchQuery) ||
    s.className.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Users className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-lg sm:text-xl leading-tight">
                  Kelola Data Siswa & Akun NISN
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-400/20 text-blue-200 border border-blue-400/30 font-bold">
                  {students.length} Siswa Terdaftar
                </span>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                Daftarkan siswa agar dapat masuk ujian dengan NISN, atau impor langsung dari Google Sheets.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Alert */}
        {toastMessage && (
          <div className={`px-5 py-2.5 text-xs font-bold flex items-center justify-between shrink-0 ${
            toastMessage.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}>
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-xs underline">Tutup</button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="px-5 pt-4 bg-slate-50 border-b border-slate-200 flex gap-2 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('daftar')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'daftar'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Daftar Siswa ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tambah')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'tambah'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Siswa Baru</span>
          </button>

          <button
            onClick={() => setActiveTab('import')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>📥 Impor dari Spreadsheet</span>
          </button>

          <button
            onClick={() => setActiveTab('drive')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all border-b-2 flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'drive'
                ? 'bg-white text-blue-700 border-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent'
            }`}
          >
            <FolderKanban className="w-4 h-4 text-amber-600" />
            <span>📁 Google Drive & Sheets</span>
          </button>
        </div>

        {/* Modal Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-white">
          
          {/* TAB 1: DAFTAR SISWA */}
          {activeTab === 'daftar' && (
            <div className="space-y-4">
              
              {/* Search & Actions Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari nama siswa, NISN, atau kelas..."
                    className="w-full p-2.5 pl-9 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportCSV}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors cursor-pointer"
                    title="Unduh seluruh data siswa dalam format CSV / Excel"
                  >
                    <Download className="w-3.5 h-3.5 text-blue-600" />
                    <span>Export CSV</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('tambah')}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Tambah Siswa</span>
                  </button>
                </div>
              </div>

              {/* Table of Students */}
              <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="overflow-x-auto max-h-[50vh]">
                  <table className="w-full text-left text-xs sm:text-sm border-collapse">
                    <thead className="bg-slate-100 text-slate-700 uppercase text-[11px] font-extrabold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="p-3">No</th>
                        <th className="p-3">NISN (Kunci Masuk)</th>
                        <th className="p-3">Nama Lengkap Siswa</th>
                        <th className="p-3">Kelas</th>
                        <th className="p-3">Riwayat Ujian</th>
                        <th className="p-3 text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="p-8 text-center text-slate-500">
                            Tidak ada siswa yang cocok dengan pencarian atau belum ada siswa terdaftar.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s, idx) => {
                          const lastScore = s.examHistory && s.examHistory.length > 0 ? s.examHistory[0].score : null;
                          return (
                            <tr key={s.nisn} className="hover:bg-slate-50/80 transition-colors">
                              <td className="p-3 text-slate-400 font-mono text-xs">{idx + 1}</td>
                              <td className="p-3">
                                <span className="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {s.nisn}
                                </span>
                              </td>
                              <td className="p-3 font-bold text-slate-900">{s.name}</td>
                              <td className="p-3 text-slate-600 font-semibold">{s.className}</td>
                              <td className="p-3">
                                {lastScore !== null ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                    Skor: {lastScore} ({s.examHistory?.length}x)
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Belum ada ujian</span>
                                )}
                              </td>
                              <td className="p-3 text-center">
                                <button
                                  onClick={() => handleDeleteStudent(s.nisn, s.name)}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                  title="Hapus siswa ini"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: TAMBAH SISWA BARU */}
          {activeTab === 'tambah' && (
            <form onSubmit={handleAddStudent} className="max-w-xl mx-auto space-y-4 py-2">
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 space-y-1">
                <strong>💡 Informasi Pendaftaran Siswa:</strong>
                <p>
                  Siswa yang didaftarkan di sini dapat langsung login ke web dengan mengetikkan nomor <strong>NISN</strong> saja tanpa perlu password.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  Nomor Induk Siswa Nasional (NISN) * :
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={newNisn}
                  onChange={(e) => setNewNisn(e.target.value)}
                  placeholder="Contoh: 0123456789 (Hanya angka)"
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono font-bold text-sm sm:text-base focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                  Nama Lengkap Siswa * :
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Ahmad Rizky Ramadhan"
                  required
                  className="w-full p-3 rounded-xl border border-slate-300 font-semibold text-sm sm:text-base focus:border-blue-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    Kelas:
                  </label>
                  <input
                    type="text"
                    value={newClass}
                    onChange={(e) => setNewClass(e.target.value)}
                    placeholder="Contoh: Kelas 5A / 5B"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
                    Nama Sekolah:
                  </label>
                  <input
                    type="text"
                    value={newSchool}
                    onChange={(e) => setNewSchool(e.target.value)}
                    placeholder="Contoh: SDN 1 Purwasari"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('daftar')}
                  className="flex-1 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 cursor-pointer"
                >
                  Simpan & Daftarkan Siswa
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: IMPORT DARI SPREADSHEET */}
          {activeTab === 'import' && (
            <div className="space-y-4 max-w-2xl mx-auto py-2">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <strong className="block font-bold">📋 Salin & Tempel Langsung dari Excel / Google Sheets:</strong>
                <p>
                  Buka file spreadsheet siswa Anda di Excel atau Google Drive, pilih dan salin kolom <strong>NISN</strong>, <strong>Nama Siswa</strong>, dan <strong>Kelas</strong>, lalu tempelkan di kotak bawah ini.
                </p>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                  Tempel Baris Data Spreadsheet di Sini:
                </label>
                <textarea
                  rows={8}
                  value={pasteData}
                  onChange={(e) => setPasteData(e.target.value)}
                  placeholder={`Contoh format (bisa dipisahkan spasi tab atau koma):
0123456789\tAhmad Zaki\tKelas 5A
0123456790\tBunga Citra\tKelas 5A
0123456791\tCahyo Utomo\tKelas 5B`}
                  className="w-full p-3 rounded-2xl border border-slate-300 text-xs font-mono leading-relaxed focus:border-blue-600 focus:outline-none bg-slate-50"
                />
              </div>

              {importReport && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <div className="font-bold text-slate-900">
                    Laporan Hasil Impor: {importReport.added} siswa baru ditambah, {importReport.updated} diperbarui. Total: {importReport.total} siswa.
                  </div>
                  {importReport.errors.length > 0 && (
                    <div className="text-rose-700">
                      Beberapa baris dilewati: {importReport.errors.slice(0, 3).join(', ')}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={handleProcessImport}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Proses & Masukkan ke Data Siswa</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE DRIVE & SHEETS INTEGRATION */}
          {activeTab === 'drive' && (
            <div className="space-y-5 max-w-2xl mx-auto py-2">
              
              {/* Drive Folder Card */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl">
                      📁
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                        Folder Google Drive Penyimpanan Resmi
                      </h4>
                      <p className="text-xs text-slate-500 font-mono">
                        ID: {GOOGLE_DRIVE_FOLDER_ID}
                      </p>
                    </div>
                  </div>

                  <a
                    href={GOOGLE_DRIVE_FOLDER_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 shadow-xs"
                  >
                    <span>Buka Folder Drive</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Folder Google Drive ini digunakan untuk menyimpan berkas naskah soal TKA (`soal_tka_kelas5.json`), data kredensial guru terdaftar, dan spreadsheet daftar siswa.
                </p>
              </div>

              {/* Action Buttons: Sync JSON & Create Google Sheets */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-blue-600" />
                    <strong className="text-xs sm:text-sm text-slate-900">Sinkronkan Data ke Drive</strong>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Unggah cadangan seluruh data {students.length} siswa ke file `data_siswa_tka.json` di dalam folder Drive.
                  </p>
                  <button
                    onClick={handleSyncToDrive}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Menyinkronkan...' : 'Unggah ke Google Drive'}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 shadow-xs space-y-2.5">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <strong className="text-xs sm:text-sm text-emerald-950">Buat Google Spreadsheet</strong>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Buat spreadsheet resmi Google Sheets ("DATA SISWA & NISN") yang bisa diedit langsung di Drive Anda.
                  </p>
                  <button
                    onClick={handleCreateGoogleSheet}
                    disabled={isSyncing}
                    className="w-full py-2.5 px-3 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>{isSyncing ? 'Memproses...' : 'Buat / Update Google Sheets'}</span>
                  </button>
                </div>
              </div>

              {createdSheetUrl && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">📊</span>
                    <div>
                      <strong className="text-xs font-bold text-blue-900 block">Google Spreadsheet Berhasil Dibuat!</strong>
                      <span className="text-[11px] text-blue-700">File telah tersimpan di folder Google Drive Anda.</span>
                    </div>
                  </div>
                  <a
                    href={createdSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs inline-flex items-center gap-1.5"
                  >
                    <span>Buka Spreadsheet</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
