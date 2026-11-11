import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserCheck, 
  LogOut, 
  History, 
  ShieldCheck, 
  GraduationCap, 
  Lock, 
  KeyRound, 
  FolderKanban, 
  ArrowRight,
  Sparkles,
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { RegisteredUser } from '../types';
import { loginWithNISN, loginWithTeacherCredentials, loginWithGoogleTeacher } from '../utils/auth';
import { signInWithGoogleAccount, GOOGLE_DRIVE_FOLDER_URL, GOOGLE_DRIVE_FOLDER_ID } from '../utils/googleWorkspace';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegisteredUser | null;
  onUserChange: (user: RegisteredUser | null) => void;
  onOpenStudentManager?: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  onOpenStudentManager
}) => {
  const [activeTab, setActiveTab] = useState<'siswa' | 'guru'>('siswa');
  
  // Siswa state
  const [nisnInput, setNisnInput] = useState('');
  
  // Guru state
  const [teacherIdentifier, setTeacherIdentifier] = useState('');
  const [teacherPassword, setTeacherPassword] = useState('');
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Handle student login with NISN
  const handleStudentLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!nisnInput.trim()) {
      setErrorMessage('Silakan masukkan NISN Anda terlebih dahulu.');
      return;
    }

    try {
      const user = loginWithNISN(nisnInput);
      setSuccessMessage(`Selamat datang, ${user.displayName}!`);
      setTimeout(() => {
        onUserChange(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'NISN tidak terdaftar.');
    }
  };

  // Handle teacher login with credentials
  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!teacherIdentifier.trim()) {
      setErrorMessage('Masukkan username atau email guru Anda.');
      return;
    }

    try {
      const user = loginWithTeacherCredentials(teacherIdentifier, teacherPassword);
      setSuccessMessage(`Selamat datang, ${user.displayName}!`);
      setTimeout(() => {
        onUserChange(user);
        onClose();
      }, 500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk akun guru.');
    }
  };

  // Handle teacher Google sign-in (connects with Google Drive & Sheets)
  const handleGoogleSignIn = async () => {
    setErrorMessage('');
    setIsGoogleLoading(true);
    try {
      const { user: googleUser } = await signInWithGoogleAccount();
      const teacherUser = loginWithGoogleTeacher(googleUser);
      setSuccessMessage(`Terhubung dengan Google Drive: ${googleUser.email}`);
      setTimeout(() => {
        onUserChange(teacherUser);
        onClose();
      }, 600);
    } catch (err: any) {
      console.error('Google Auth failure:', err);
      setErrorMessage(err.message || 'Gagal masuk dengan Google. Pastikan jendela pop-up diizinkan.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleLogout = () => {
    onUserChange(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs no-print">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md font-bold">
              {currentUser ? currentUser.avatar : <Lock className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                {currentUser ? 'Profil Akun Terdaftar' : 'Portal Masuk Pengguna'}
              </h3>
              <p className="text-xs text-blue-200">
                {currentUser ? currentUser.schoolName : 'Masuk aman menggunakan NISN Siswa atau Akun Guru'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CURRENT USER LOGGED IN VIEW */}
        {currentUser ? (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    currentUser.role === 'guru' || currentUser.role === 'admin'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-blue-100 text-blue-800 border-blue-300'
                  }`}>
                    {currentUser.role === 'guru' || currentUser.role === 'admin' ? '👨‍🏫 Admin Guru' : '🎒 Siswa'}
                  </span>
                  {currentUser.nisn && (
                    <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                      NISN: {currentUser.nisn}
                    </span>
                  )}
                  {currentUser.className && (
                    <span className="text-xs font-bold text-slate-600">
                      {currentUser.className}
                    </span>
                  )}
                </div>
                <h4 className="font-extrabold text-base text-slate-900">
                  {currentUser.displayName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentUser.schoolName}
                </p>
              </div>
            </div>

            {/* Google Drive Status for Teachers */}
            {(currentUser.role === 'guru' || currentUser.role === 'admin') && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-base">📁</span>
                  <div>
                    <span className="font-bold text-slate-900 block">Folder Google Drive Terhubung</span>
                    <span className="text-slate-500 font-mono text-[10px]">ID: {GOOGLE_DRIVE_FOLDER_ID.slice(0, 15)}...</span>
                  </div>
                </div>
                <a
                  href={GOOGLE_DRIVE_FOLDER_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg font-bold text-blue-700 text-xs"
                >
                  Buka Drive
                </a>
              </div>
            )}

            {/* Exam History */}
            {currentUser.examHistory && currentUser.examHistory.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  <span>Riwayat Ujian Siswa ({currentUser.examHistory.length})</span>
                </h5>
                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {currentUser.examHistory.map((item, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <strong className="block text-slate-900 line-clamp-1">{item.packageTitle}</strong>
                        <span className="text-slate-500">{item.completedAt} • {item.subject}</span>
                      </div>
                      <span className="font-extrabold text-blue-700 bg-white px-2.5 py-1 rounded-md border border-slate-200">
                        Skor: {item.score}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions: Manage students if teacher, or logout */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              {(currentUser.role === 'guru' || currentUser.role === 'admin') && onOpenStudentManager ? (
                <button
                  onClick={() => {
                    onClose();
                    onOpenStudentManager();
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
                  <span>Kelola Data Siswa & NISN</span>
                </button>
              ) : (
                <div />
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>
        ) : (
          /* LOGIN FORM (CLEAN, NO PUBLIC USERNAMES DISPLAYED) */
          <div className="p-6">
            
            {/* Tab Switcher: Siswa (NISN) vs Admin Guru */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
              <button
                type="button"
                onClick={() => { setActiveTab('siswa'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'siswa' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Masuk Siswa (Dengan NISN)</span>
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('guru'); setErrorMessage(''); setSuccessMessage(''); }}
                className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'guru' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>Masuk Admin Guru</span>
              </button>
            </div>

            {/* Error or Success notification */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold leading-relaxed animate-in fade-in">
                ⚠️ {errorMessage}
              </div>
            )}
            {successMessage && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed animate-in fade-in">
                ✅ {successMessage}
              </div>
            )}

            {/* TAB 1: MASUK SISWA DENGAN NISN */}
            {activeTab === 'siswa' ? (
              <form onSubmit={handleStudentLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-1.5">
                    Nomor Induk Siswa Nasional (NISN):
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={nisnInput}
                      onChange={(e) => setNisnInput(e.target.value)}
                      placeholder="Ketik 10 digit NISN Anda (Contoh: 0123456789)"
                      autoFocus
                      className="w-full p-3 pl-4 rounded-xl border-2 border-slate-300 text-sm sm:text-base font-mono font-bold tracking-wider text-slate-900 focus:border-blue-600 focus:outline-none bg-slate-50/50"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed">
                    ℹ️ Masukkan nomor NISN yang telah didaftarkan oleh Guru Kelas. Siswa tidak perlu menghafal kata sandi.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Masuk Portal Ujian Siswa</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-200 text-[11px] text-blue-900 space-y-1">
                  <strong>💡 Belum memiliki NISN atau belum terdaftar?</strong>
                  <p className="text-blue-800">
                    Silakan hubungi Bapak/Ibu Guru Kelas Anda untuk mendaftarkan nama dan NISN ke dalam data ujian.
                  </p>
                </div>
              </form>
            ) : (
              /* TAB 2: MASUK ADMIN GURU */
              <div className="space-y-5">
                
                {/* Option A: Official Google Sign-In connecting to Drive folder */}
                <div>
                  <span className="block text-xs font-extrabold text-slate-800 uppercase tracking-wide mb-2">
                    Masuk dengan Akun Google (Google Drive & Sheets):
                  </span>
                  
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full py-3 px-4 rounded-xl bg-white border-2 border-slate-300 hover:border-blue-500 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 text-xs sm:text-sm font-extrabold text-slate-700 shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    </svg>
                    <span>{isGoogleLoading ? 'Menghubungkan ke Google...' : 'Masuk dengan Akun Google Guru'}</span>
                  </button>

                  <p className="text-[11px] text-slate-500 mt-1.5">
                    📁 Terhubung langsung ke folder Google Drive Anda untuk menyimpan naskah soal & spreadsheet data siswa.
                  </p>
                </div>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-3 text-[11px] font-bold text-slate-400 uppercase">Atau Masuk Kredensial</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                {/* Option B: Manual Teacher Login Form */}
                <form onSubmit={handleTeacherLogin} className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Username / Email Guru:
                    </label>
                    <input
                      type="text"
                      value={teacherIdentifier}
                      onChange={(e) => setTeacherIdentifier(e.target.value)}
                      placeholder="misal: sdn1purwasari / guru_5a"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Kata Sandi / PIN Guru:
                    </label>
                    <input
                      type="password"
                      value={teacherPassword}
                      onChange={(e) => setTeacherPassword(e.target.value)}
                      placeholder="Masukkan kata sandi guru"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    Masuk Sebagai Admin Guru
                  </button>
                </form>

              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
