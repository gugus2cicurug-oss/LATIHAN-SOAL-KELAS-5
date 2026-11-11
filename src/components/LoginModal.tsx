import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserCheck, 
  UserPlus, 
  GraduationCap, 
  School, 
  ShieldCheck, 
  LogOut, 
  Check, 
  History, 
  Award,
  Sparkles
} from 'lucide-react';
import { RegisteredUser } from '../types';
import { getRegisteredUsers, loginWithUsername, registerNewUser } from '../utils/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: RegisteredUser | null;
  onUserChange: (user: RegisteredUser | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');
  const [selectedUsername, setSelectedUsername] = useState('');
  const [typedUsername, setTypedUsername] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Register form state
  const [regUsername, setRegUsername] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regRole, setRegRole] = useState<'guru' | 'siswa'>('guru');
  const [regSchool, setRegSchool] = useState('SD Negeri 1 Cicurug');

  if (!isOpen) return null;

  const registeredUsers = getRegisteredUsers();

  const handleLogin = (usernameToUse?: string) => {
    const target = usernameToUse || typedUsername || selectedUsername;
    if (!target) {
      setErrorMessage('Pilih atau ketik username yang terdaftar terlebih dahulu.');
      return;
    }

    try {
      setErrorMessage('');
      const user = loginWithUsername(target);
      onUserChange(user);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal masuk.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regUsername.trim() || !regDisplayName.trim()) {
      setErrorMessage('Username dan Nama Lengkap wajib diisi.');
      return;
    }

    try {
      setErrorMessage('');
      const newUser = registerNewUser({
        username: regUsername,
        displayName: regDisplayName,
        role: regRole,
        schoolName: regSchool
      });
      onUserChange(newUser);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal mendaftarkan akun baru.');
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
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg leading-tight">
                Portal Masuk Pengguna
              </h3>
              <p className="text-xs text-blue-200">
                Pilih atau masukkan username yang telah terdaftar
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

        {/* Current User Info Card if logged in */}
        {currentUser ? (
          <div className="p-6 space-y-6">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-extrabold text-lg flex items-center justify-center shrink-0 shadow">
                {currentUser.avatar}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                    currentUser.role === 'guru'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : currentUser.role === 'siswa'
                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                      : 'bg-purple-100 text-purple-800 border-purple-300'
                  }`}>
                    {currentUser.role === 'guru' ? '👨‍🏫 Guru / Pengajar' : currentUser.role === 'siswa' ? '🎒 Siswa / Peserta' : '🛡️ Administrator'}
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-500">
                    @{currentUser.username}
                  </span>
                </div>
                <h4 className="font-extrabold text-base text-slate-900">
                  {currentUser.displayName}
                </h4>
                <p className="text-xs text-slate-600 mt-0.5">
                  {currentUser.schoolName}
                </p>
              </div>
            </div>

            {/* Exam History for Student */}
            {currentUser.examHistory && currentUser.examHistory.length > 0 && (
              <div>
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                  <History className="w-3.5 h-3.5 text-blue-600" />
                  <span>Riwayat Ujian Tersimpan ({currentUser.examHistory.length})</span>
                </h5>
                <div className="space-y-2 max-h-36 overflow-y-auto">
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

            {/* Switch Account or Logout */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={() => setTab('login')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800"
              >
                Ganti Akun Lain
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar Akun (Logout)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6">
            
            {/* Tab Switcher */}
            <div className="flex bg-slate-100 p-1 rounded-xl mb-5">
              <button
                onClick={() => { setTab('login'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  tab === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                Pilih Username Terdaftar
              </button>
              <button
                onClick={() => { setTab('register'); setErrorMessage(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${
                  tab === 'register' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600'
                }`}
              >
                + Daftarkan Username Baru
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                ⚠️ {errorMessage}
              </div>
            )}

            {tab === 'login' ? (
              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-700">
                  Daftar Akun Terdaftar (Klik untuk Masuk Cepat):
                </label>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {registeredUsers.map((u) => {
                    const isSelected = selectedUsername === u.username;
                    return (
                      <div
                        key={u.username}
                        onClick={() => {
                          setSelectedUsername(u.username);
                          setTypedUsername(u.username);
                        }}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 shadow-sm ring-1 ring-blue-500'
                            : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                            {u.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <strong className="text-xs sm:text-sm text-slate-900">{u.displayName}</strong>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                                u.role === 'guru' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                              }`}>
                                {u.role === 'guru' ? 'Guru' : 'Siswa'}
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500 font-mono">@{u.username} • {u.schoolName}</span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLogin(u.username);
                          }}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-xs"
                        >
                          Pilih
                        </button>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Atau Ketik Username Manual:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={typedUsername}
                      onChange={(e) => setTypedUsername(e.target.value)}
                      placeholder="Contoh: gugus2cicurug / guru_5a"
                      className="flex-1 p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLogin()}
                      className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-sm"
                    >
                      Masuk
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Register Form */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Username Akun Baru (Tanpa Spasi):
                  </label>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="misal: guru_ahmad / siswa_zahra"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nama Lengkap & Gelar:
                  </label>
                  <input
                    type="text"
                    value={regDisplayName}
                    onChange={(e) => setRegDisplayName(e.target.value)}
                    placeholder="misal: Bpk. Ahmad Fauzi, S.Pd. atau Zahra Putri"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Peran Pengguna:
                    </label>
                    <select
                      value={regRole}
                      onChange={(e) => setRegRole(e.target.value as any)}
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white font-medium"
                    >
                      <option value="guru">👨‍🏫 Guru / Pengajar</option>
                      <option value="siswa">🎒 Siswa / Peserta</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Nama Sekolah / Gugus:
                    </label>
                    <input
                      type="text"
                      value={regSchool}
                      onChange={(e) => setRegSchool(e.target.value)}
                      placeholder="misal: SDN Gugus 2 Cicurug"
                      className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95"
                >
                  Daftarkan & Masuk Langsung
                </button>
              </form>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
