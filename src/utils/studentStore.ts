import { StudentRecord } from '../types';

const STUDENTS_STORAGE_KEY = 'tka_guru_students_nisn_v1';

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    nisn: '0123456789',
    name: 'Arka Ramadhan',
    className: 'Kelas 5A',
    schoolName: 'SDN 1 Purwasari',
    registeredAt: '2026-11-10',
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
    nisn: '0123456790',
    name: 'Bima Santoso',
    className: 'Kelas 5B',
    schoolName: 'SDN 1 Purwasari',
    registeredAt: '2026-11-10',
    examHistory: []
  },
  {
    nisn: '0123456791',
    name: 'Citra Kirana',
    className: 'Kelas 5A',
    schoolName: 'SDN 1 Purwasari',
    registeredAt: '2026-11-10',
    examHistory: []
  },
  {
    nisn: '0123456792',
    name: 'Dimas Anggara',
    className: 'Kelas 5B',
    schoolName: 'SDN 1 Purwasari',
    registeredAt: '2026-11-10',
    examHistory: []
  },
  {
    nisn: '0123456793',
    name: 'Elsa Nurhaliza',
    className: 'Kelas 5A',
    schoolName: 'SDN 1 Purwasari',
    registeredAt: '2026-11-10',
    examHistory: []
  }
];

export function getRegisteredStudents(): StudentRecord[] {
  try {
    const raw = localStorage.getItem(STUDENTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(s => ({
          ...s,
          schoolName: s.schoolName && (s.schoolName.toLowerCase().includes('gugus') || s.schoolName.toLowerCase().includes('cicurug'))
            ? 'SDN 1 Purwasari'
            : s.schoolName || 'SDN 1 Purwasari'
        }));
      }
    }
  } catch (e) {
    console.error('Failed to load students from localStorage:', e);
  }
  // Initialize with default
  saveRegisteredStudents(INITIAL_STUDENTS);
  return INITIAL_STUDENTS;
}

export function saveRegisteredStudents(students: StudentRecord[]) {
  try {
    localStorage.setItem(STUDENTS_STORAGE_KEY, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage:', e);
  }
}

export function findStudentByNISN(nisn: string): StudentRecord | null {
  const clean = nisn.trim().replace(/\D/g, '');
  if (!clean) return null;
  const list = getRegisteredStudents();
  return list.find(s => s.nisn === clean) || null;
}

export function addStudent(newStudent: {
  nisn: string;
  name: string;
  className: string;
  schoolName?: string;
}): StudentRecord {
  const cleanNisn = newStudent.nisn.trim().replace(/\D/g, '');
  if (!cleanNisn || cleanNisn.length < 4) {
    throw new Error('NISN harus berupa angka (minimal 4 digit atau 10 digit NISN standar).');
  }
  if (!newStudent.name.trim()) {
    throw new Error('Nama siswa wajib diisi.');
  }

  const list = getRegisteredStudents();
  if (list.some(s => s.nisn === cleanNisn)) {
    throw new Error(`NISN ${cleanNisn} sudah terdaftar atas nama siswa lain.`);
  }

  const student: StudentRecord = {
    nisn: cleanNisn,
    name: newStudent.name.trim(),
    className: newStudent.className.trim() || 'Kelas 5',
    schoolName: newStudent.schoolName?.trim() || 'SDN 1 Purwasari',
    registeredAt: new Date().toISOString().split('T')[0],
    examHistory: []
  };

  const updated = [student, ...list];
  saveRegisteredStudents(updated);
  return student;
}

export function updateStudent(nisn: string, updatedData: Partial<StudentRecord>): void {
  const list = getRegisteredStudents();
  const updated = list.map(s => {
    if (s.nisn === nisn) {
      return { ...s, ...updatedData };
    }
    return s;
  });
  saveRegisteredStudents(updated);
}

export function deleteStudent(nisn: string): void {
  const list = getRegisteredStudents();
  const updated = list.filter(s => s.nisn !== nisn);
  saveRegisteredStudents(updated);
}

export function recordExamResultForStudent(nisn: string, historyItem: {
  packageId: string;
  packageTitle: string;
  subject: string;
  score: number;
  gradeCategory: string;
}): void {
  const list = getRegisteredStudents();
  const updated = list.map(s => {
    if (s.nisn === nisn) {
      const history = s.examHistory || [];
      return {
        ...s,
        examHistory: [
          {
            ...historyItem,
            completedAt: new Date().toISOString().split('T')[0]
          },
          ...history
        ]
      };
    }
    return s;
  });
  saveRegisteredStudents(updated);
}

/**
 * Import students by parsing raw text copied from Excel or Google Sheets (Tab or Comma separated)
 * Formats supported:
 * 1. NISN <tab> Nama <tab> Kelas
 * 2. Nama <tab> NISN <tab> Kelas
 */
export function importStudentsFromSpreadsheet(rawText: string, defaultSchool: string = 'SDN 1 Purwasari'): {
  added: number;
  updated: number;
  total: number;
  errors: string[];
} {
  const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
  const list = getRegisteredStudents();
  const studentMap = new Map<string, StudentRecord>();
  list.forEach(s => studentMap.set(s.nisn, s));

  let added = 0;
  let updated = 0;
  const errors: string[] = [];

  lines.forEach((line, lineIdx) => {
    // Skip header line if detected
    const lower = line.toLowerCase();
    if (lower.includes('nisn') && lower.includes('nama')) return;

    // Split by tab, semicolon, or comma
    const delimiter = line.includes('\t') ? '\t' : line.includes(';') ? ';' : ',';
    const parts = line.split(delimiter).map(p => p.trim().replace(/^["']|["']$/g, ''));

    if (parts.length < 2) {
      errors.push(`Baris ${lineIdx + 1}: Format tidak sesuai (minimal NISN dan Nama)`);
      return;
    }

    let nisn = '';
    let name = '';
    let className = 'Kelas 5';

    // Auto-detect which column is NISN (numeric)
    const p0Digits = parts[0].replace(/\D/g, '');
    const p1Digits = parts[1].replace(/\D/g, '');

    if (p0Digits.length >= 4 && p1Digits.length < 4) {
      // Column 0 is NISN, Column 1 is Name
      nisn = p0Digits;
      name = parts[1];
      className = parts[2] || className;
    } else if (p1Digits.length >= 4 && p0Digits.length < 4) {
      // Column 0 is Name, Column 1 is NISN
      name = parts[0];
      nisn = p1Digits;
      className = parts[2] || className;
    } else {
      // Fallback
      nisn = parts[0].replace(/\D/g, '');
      name = parts[1];
      className = parts[2] || className;
    }

    if (!nisn || !name) {
      errors.push(`Baris ${lineIdx + 1}: NISN atau Nama kosong`);
      return;
    }

    if (studentMap.has(nisn)) {
      const existing = studentMap.get(nisn)!;
      studentMap.set(nisn, {
        ...existing,
        name,
        className
      });
      updated++;
    } else {
      const newRecord: StudentRecord = {
        nisn,
        name,
        className,
        schoolName: defaultSchool,
        registeredAt: new Date().toISOString().split('T')[0],
        examHistory: []
      };
      studentMap.set(nisn, newRecord);
      added++;
    }
  });

  const finalList = Array.from(studentMap.values());
  saveRegisteredStudents(finalList);

  return {
    added,
    updated,
    total: finalList.length,
    errors
  };
}

/**
 * Generate CSV text for exporting to Excel or Google Sheets
 */
export function exportStudentsToCSV(): string {
  const students = getRegisteredStudents();
  const headers = ['NISN', 'Nama Siswa', 'Kelas', 'Sekolah', 'Tanggal Daftar', 'Jumlah Ujian', 'Skor Terakhir', 'Predikat'];
  const rows = students.map(s => {
    const lastExam = s.examHistory && s.examHistory.length > 0 ? s.examHistory[0] : null;
    return [
      `"${s.nisn}"`,
      `"${s.name}"`,
      `"${s.className}"`,
      `"${s.schoolName}"`,
      `"${s.registeredAt}"`,
      s.examHistory?.length || 0,
      lastExam ? lastExam.score : '-',
      lastExam ? `"${lastExam.gradeCategory}"` : '-'
    ].join(',');
  });

  return [headers.join(','), ...rows].join('\n');
}
