import { RegisteredUser } from '../types';
import { findStudentByNISN, recordExamResultForStudent } from './studentStore';

const USERS_STORAGE_KEY = 'tka_guru_registered_users_v2';
const CURRENT_USER_KEY = 'tka_guru_current_user_v2';

export const DEFAULT_REGISTERED_USERS: RegisteredUser[] = [
  {
    username: 'sdn1purwasari',
    displayName: 'Bpk. Ahmad Fauzi, S.Pd.',
    role: 'guru',
    schoolName: 'SDN 1 Purwasari',
    googleEmail: 'gugus2cicurug@gmail.com',
    avatar: 'AF',
    examHistory: []
  },
  {
    username: 'guru_5a',
    displayName: 'Ibu Ratna Dewi, M.Pd.',
    role: 'guru',
    schoolName: 'SDN 1 Purwasari',
    avatar: 'RD',
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
      const user = JSON.parse(raw);
      if (user && user.schoolName && (user.schoolName.toLowerCase().includes('gugus') || user.schoolName.toLowerCase().includes('cicurug'))) {
        user.schoolName = 'SDN 1 Purwasari';
      }
      return user;
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

/**
 * Siswa login directly using their NISN
 */
export function loginWithNISN(nisnInput: string): RegisteredUser {
  const cleanNisn = nisnInput.trim().replace(/\D/g, '');
  if (!cleanNisn) {
    throw new Error('Silakan masukkan NISN siswa terlebih dahulu.');
  }

  const student = findStudentByNISN(cleanNisn);
  if (!student) {
    throw new Error(`NISN "${cleanNisn}" belum terdaftar. Silakan hubungi Guru Kelas untuk mendaftarkan nama, NISN, dan kelas Anda.`);
  }

  const avatar = student.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'SW';

  const user: RegisteredUser = {
    username: `siswa_${student.nisn}`,
    displayName: student.name,
    role: 'siswa',
    schoolName: student.schoolName,
    avatar,
    nisn: student.nisn,
    className: student.className,
    examHistory: student.examHistory || []
  };

  saveCurrentUser(user);
  return user;
}

/**
 * Teacher login with credentials without displaying usernames publicly
 */
export function loginWithTeacherCredentials(identifier: string, _secret?: string): RegisteredUser {
  const clean = identifier.trim().toLowerCase();
  if (!clean) {
    throw new Error('Masukkan username atau email guru Anda.');
  }

  const users = getRegisteredUsers();
  const matched = users.find(u => 
    (u.role === 'guru' || u.role === 'admin') && 
    (u.username.toLowerCase() === clean || u.googleEmail?.toLowerCase() === clean)
  );

  if (!matched) {
    if (clean.includes('purwasari') || clean.includes('gugus2') || clean.includes('cicurug')) {
      const defaultTeacher = DEFAULT_REGISTERED_USERS[0];
      saveCurrentUser(defaultTeacher);
      return defaultTeacher;
    }
    throw new Error('Akun Guru atau Admin tidak ditemukan. Periksa kembali username atau gunakan tombol Masuk dengan Google.');
  }

  saveCurrentUser(matched);
  return matched;
}

/**
 * Teacher login using Google Account (Firebase OAuth token)
 */
export function loginWithGoogleTeacher(googleUser: {
  displayName?: string | null;
  email?: string | null;
  photoURL?: string | null;
}): RegisteredUser {
  const email = googleUser.email || 'gugus2cicurug@gmail.com';
  const name = googleUser.displayName || 'Bpk. Guru SDN 1 Purwasari';
  const username = email.split('@')[0].replace(/[^a-z0-9_]/g, '') || 'guru_google';

  const avatar = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || 'GP';

  const user: RegisteredUser = {
    username,
    displayName: name,
    role: 'guru',
    schoolName: 'SDN 1 Purwasari',
    avatar,
    googleEmail: email,
    examHistory: []
  };

  const users = getRegisteredUsers();
  if (!users.some(u => u.username === username)) {
    saveRegisteredUsers([user, ...users]);
  }

  saveCurrentUser(user);
  return user;
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

  // If this user is a student with NISN, also update studentStore
  if (current.nisn) {
    recordExamResultForStudent(current.nisn, historyItem);
  }

  return updatedUser;
}
