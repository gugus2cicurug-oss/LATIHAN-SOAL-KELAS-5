import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { TKAPackage } from '../data/defaultPackages';
import { StudentRecord } from '../types';

export const GOOGLE_DRIVE_FOLDER_ID = '1LkmjVSMEN8SelpFDj59ek0iDZD0rnfAO';
export const GOOGLE_DRIVE_FOLDER_URL = `https://drive.google.com/drive/folders/${GOOGLE_DRIVE_FOLDER_ID}?usp=sharing`;

// Initialize Firebase App singleton
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Provider with Drive and Sheets scopes
const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

// In-memory token storage (MANDATORY per skill: do NOT store in localStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

export const initGoogleAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user && cachedAccessToken) {
      if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
    } else {
      if (!isSigningIn && onAuthFailure) onAuthFailure();
    }
  });
};

export const signInWithGoogleAccount = async (): Promise<{ user: User; accessToken: string }> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getGoogleAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const signOutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

export const isGoogleAuthenticated = (): boolean => {
  return !!cachedAccessToken && !!auth.currentUser;
};

export const getGoogleCurrentUser = (): User | null => {
  return auth.currentUser;
};

// ==========================================
// GOOGLE DRIVE & SPREADSHEET SYNC OPERATIONS
// ==========================================

interface DriveFileMetadata {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
}

/**
 * Find a file by name inside the specified Google Drive folder
 */
export async function findFileInFolder(fileName: string, folderId: string = GOOGLE_DRIVE_FOLDER_ID): Promise<DriveFileMetadata | null> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Silakan login dengan Akun Google terlebih dahulu.');

  const q = encodeURIComponent(`'${folderId}' in parents and name = '${fileName}' and trashed = false`);
  const url = `https://www.googleapis.com/drive/v3/files?q=${q}&fields=files(id,name,mimeType,webViewLink)&pageSize=1`;

  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errText = await res.text();
    console.warn('Google Drive find error:', errText);
    return null;
  }

  const data = await res.json();
  if (data.files && data.files.length > 0) {
    return data.files[0];
  }
  return null;
}

/**
 * Upload or update a JSON file inside the Google Drive folder
 */
export async function uploadJsonToDriveFolder(
  fileName: string,
  jsonData: any,
  folderId: string = GOOGLE_DRIVE_FOLDER_ID
): Promise<{ id: string; webViewLink?: string }> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Token Google tidak tersedia. Silakan login Akun Google.');

  const existing = await findFileInFolder(fileName, folderId);
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const metadata = {
    name: fileName,
    mimeType: 'application/json',
    ...(existing ? {} : { parents: [folderId] })
  };

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    JSON.stringify(jsonData, null, 2) +
    closeDelimiter;

  let url = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink';
  let method = 'POST';

  if (existing) {
    url = `https://www.googleapis.com/upload/drive/v3/files/${existing.id}?uploadType=multipart&fields=id,webViewLink`;
    method = 'PATCH';
  }

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartRequestBody
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gagal menyimpan ke Google Drive: ${err}`);
  }

  return await res.json();
}

/**
 * Download JSON content of a file from Google Drive
 */
export async function downloadJsonFromDriveFile(fileId: string): Promise<any> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Token Google tidak tersedia.');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    throw new Error('Gagal mengunduh file dari Google Drive.');
  }

  return await res.json();
}

/**
 * Save all assessment packages to Google Drive folder (soal_tka_kelas5.json)
 */
export async function syncPackagesToDrive(packages: TKAPackage[]): Promise<{ fileId: string; url?: string }> {
  const result = await uploadJsonToDriveFolder('soal_tka_kelas5.json', {
    updatedAt: new Date().toISOString(),
    totalPackages: packages.length,
    packages
  });
  return { fileId: result.id, url: result.webViewLink };
}

/**
 * Load assessment packages from Google Drive folder
 */
export async function fetchPackagesFromDrive(): Promise<TKAPackage[] | null> {
  const file = await findFileInFolder('soal_tka_kelas5.json');
  if (!file) return null;
  const data = await downloadJsonFromDriveFile(file.id);
  if (data && Array.isArray(data.packages)) {
    return data.packages;
  }
  return null;
}

/**
 * Sync Student Roster to Google Drive (data_siswa_tka.json)
 */
export async function syncStudentsToDrive(students: StudentRecord[]): Promise<{ fileId: string; url?: string }> {
  const result = await uploadJsonToDriveFolder('data_siswa_tka.json', {
    updatedAt: new Date().toISOString(),
    totalStudents: students.length,
    students
  });
  return { fileId: result.id, url: result.webViewLink };
}

/**
 * Fetch Student Roster from Google Drive (data_siswa_tka.json)
 */
export async function fetchStudentsFromDrive(): Promise<StudentRecord[] | null> {
  const file = await findFileInFolder('data_siswa_tka.json');
  if (!file) return null;
  const data = await downloadJsonFromDriveFile(file.id);
  if (data && Array.isArray(data.students)) {
    return data.students;
  }
  return null;
}

/**
 * Create or Update a Google Spreadsheet directly in the Drive folder
 * for student roster & exam scores
 */
export async function createOrUpdateGoogleSheetRoster(students: StudentRecord[]): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> {
  const token = getGoogleAccessToken();
  if (!token) throw new Error('Token Google tidak tersedia. Silakan login akun Google.');

  const sheetTitle = 'DATA SISWA & NISN - KELAS 5 JUARA';
  const existing = await findFileInFolder(sheetTitle);

  let spreadsheetId = existing?.id;
  let spreadsheetUrl = existing?.webViewLink || '';

  if (!spreadsheetId) {
    // 1. Create Spreadsheet via Google Sheets API
    const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        properties: {
          title: sheetTitle
        },
        sheets: [
          {
            properties: {
              title: 'Data Siswa Terdaftar',
              gridProperties: {
                rowCount: Math.max(100, students.length + 10),
                columnCount: 8
              }
            }
          }
        ]
      })
    });

    if (!createRes.ok) {
      const err = await createRes.text();
      throw new Error(`Gagal membuat Google Spreadsheet: ${err}`);
    }

    const created = await createRes.json();
    spreadsheetId = created.spreadsheetId;
    spreadsheetUrl = created.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

    // Move spreadsheet into the user's specific Google Drive folder
    try {
      await fetch(`https://www.googleapis.com/drive/v3/files/${spreadsheetId}?addParents=${GOOGLE_DRIVE_FOLDER_ID}&fields=id,parents`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (moveErr) {
      console.warn('Could not move sheet to parents folder (permission dependent):', moveErr);
    }
  }

  // 2. Format values for Google Sheets
  const rows = [
    ['NISN', 'Nama Siswa', 'Kelas', 'Sekolah', 'Tanggal Terdaftar', 'Jumlah Ujian Selesai', 'Skor Terakhir', 'Predikat Capaian'],
    ...students.map(s => {
      const lastExam = s.examHistory && s.examHistory.length > 0 ? s.examHistory[0] : null;
      return [
        s.nisn,
        s.name,
        s.className,
        s.schoolName,
        s.registeredAt,
        s.examHistory?.length || 0,
        lastExam ? lastExam.score : '-',
        lastExam ? lastExam.gradeCategory : '-'
      ];
    })
  ];

  // 3. Write rows to Google Sheet via Sheets API values.update
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/A1:H${rows.length}?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        range: `A1:H${rows.length}`,
        majorDimension: 'ROWS',
        values: rows
      })
    }
  );

  if (!updateRes.ok) {
    const err = await updateRes.text();
    console.warn('Sheets update note:', err);
  }

  return {
    spreadsheetId: spreadsheetId!,
    spreadsheetUrl: spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`
  };
}
