import { RegisteredUser } from '../types';

const USERS_STORAGE_KEY = 'tka_guru_registered_users_v2';
const CURRENT_USER_KEY = 'tka_guru_current_user_v2';

export const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [
  {
    username: 'gugus2cicurug',
    displayName: 'Bpk. Ahmad Fauzi, S.Pd.',
    role: 'guru',
    schoolName: 'Gugus 2 Cicurug - SD Negeri 1',
    avatar: 'AF',
    examHistory: []
  },
  {
    username: 'guru_5a',
    displayName: 'Ibu Ratna Dewi, M.Pd.',
    role: 'guru',
    schoolName: 'SD Juara Prestasi',
    avatar: 'RD',
    examHistory: []
  },
  {
    username: 'siswa_arka',
    displayName: 'Arka Ramadhan (No. Absen 07)',
    role: 'siswa',
    schoolName: 'Kelas 5A SD Juara Prestasi',
    avatar: 'AR',
    examHistory: [
      {
        packageId: 'mat-kls5-paket1',
        packageTitle: 'Asesmen TKA Matematika - Koperasi Siswa',
        subject: 'Matematika',
        score: 85,
        gradeCategory: 'SANGAT MAHIR',
        completedAt: '2026-11-10'
      }
    ]
  },
  {
    username: 'siswa_bima',
    displayName: 'Bima Santoso (No. Absen 12)',
    role: 'siswa',
    schoolName: 'Kelas 5B SD Juara Prestasi',
    avatar: 'BS',
    examHistory: []
  },
  {
    username: 'admin_tka',
    displayName: 'Pengawas Kurikulum Kemendikdasmen',
    role: 'admin',
    schoolName: 'Dinas Pendidikan Wilayah',
    avatar: 'PK',
    examHistory: []
  }
];

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to get users from localStorage:', e);
  }
  // Initialize with defaults
  saveRegisteredUsers(DEFAULT_REGISTERED_USERS);
  return DEFAULT_REGISTERED_USERS;
}

export function saveRegisteredUsers(users: RegisteredUser[]) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (e) {
    console.error('Failed to save users to localStorage:', e);
  }
}

export function getCurrentUser(): RegisteredUser | null {
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Failed to get current user:', e);
  }
  return null; // Guest / Pengunjung (Belum Login)
}

export function isUserAdminGuru(user: RegisteredUser | null): boolean {
  return !!user && (user.role === 'guru' || user.role === 'admin');
}

export function saveCurrentUser(user: RegisteredUser | null) {
  try {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user:', e);
  }
}

export function loginWithUsername(username: string): RegisteredUser {
  const cleanUsername = username.trim().toLowerCase();
  const users = getRegisteredUsers();
  const matched = users.find(u => u.username.toLowerCase() === cleanUsername);
  if (!matched) {
    throw new Error(`Username "${username}" belum terdaftar. Silakan pilih dari daftar username terdaftar atau buat akun baru.`);
  }
  saveCurrentUser(matched);
  return matched;
}

export function registerNewUser(newUser: {
  username: string;
  displayName: string;
  role: 'guru' | 'siswa' | 'admin';
  schoolName: string;
}): RegisteredUser {
  const cleanUsername = newUser.username.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
  if (!cleanUsername) {
    throw new Error('Username hanya boleh berupa huruf, angka, atau garis bawah (_).');
  }

  const users = getRegisteredUsers();
  if (users.some(u => u.username.toLowerCase() === cleanUsername)) {
    throw new Error(`Username "${cleanUsername}" sudah digunakan. Gunakan username lain.`);
  }

  const avatar = newUser.displayName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'US';

  const user: RegisteredUser = {
    username: cleanUsername,
    displayName: newUser.displayName.trim(),
    role: newUser.role,
    schoolName: newUser.schoolName.trim() || 'SD Indonesia',
    avatar,
    examHistory: []
  };

  const updated = [...users, user];
  saveRegisteredUsers(updated);
  saveCurrentUser(user);
  return user;
}

export function addExamHistoryToCurrentUser(historyItem: {
  packageId: string;
  packageTitle: string;
  subject: string;
  score: number;
  gradeCategory: string;
}): RegisteredUser | null {
  const current = getCurrentUser();
  if (!current) return null;

  const item = {
    ...historyItem,
    completedAt: new Date().toISOString().split('T')[0]
  };

  const updatedUser: RegisteredUser = {
    ...current,
    examHistory: [item, ...(current.examHistory || [])]
  };

  const users = getRegisteredUsers();
  const updatedList = users.map(u => u.username === current.username ? updatedUser : u);
  saveRegisteredUsers(updatedList);
  saveCurrentUser(updatedUser);
  return updatedUser;
}
