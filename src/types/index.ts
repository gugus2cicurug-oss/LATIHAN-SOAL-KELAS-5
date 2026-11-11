import { TKAPackage, StimulusGroup, QuestionItem, OptionItem, StatementItem } from '../data/defaultPackages';

export type { TKAPackage, StimulusGroup, QuestionItem, OptionItem, StatementItem };

export interface RegisteredUser {
  username: string;
  displayName: string;
  role: 'guru' | 'siswa' | 'admin';
  schoolName: string;
  avatar: string;
  nisn?: string;
  className?: string;
  googleEmail?: string;
  examHistory?: {
    packageId: string;
    packageTitle: string;
    subject: string;
    score: number;
    gradeCategory: string;
    completedAt: string;
  }[];
}

export interface StudentRecord {
  nisn: string;
  name: string;
  className: string;
  schoolName: string;
  registeredAt: string;
  examHistory?: {
    packageId: string;
    packageTitle: string;
    subject: string;
    score: number;
    gradeCategory: string;
    completedAt: string;
  }[];
}

export interface GoogleDriveSyncConfig {
  folderId: string;
  folderUrl: string;
  lastSyncedAt?: string;
  autoSync: boolean;
  sheetsId?: string;
  sheetsUrl?: string;
}

export interface SiteSettings {
  schoolName: string;
  heroTitle: string;
  heroSubtitle: string;
  announcement: string;
  showAnnouncement: boolean;
  allowGuestRetake: boolean;
  showAnswerExplanationToStudent: boolean;
  activeExamNotice: string;
  guestTheme: 'modern' | 'minimal' | 'formal';
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  schoolName: 'SDN 1 Purwasari',
  heroTitle: 'Simulasi STS/ASAS siap menghadapi Sumatif untuk SD/MI',
  heroSubtitle: 'Selamat datang di portal latihan dan asesmen resmi SD/MI. Pilih paket soal yang tersedia di bawah dan kerjakan secara mandiri.',
  announcement: '📢 PENGUMUMAN GURU: Soal latihan STS/ASAS siap menghadapi Sumatif resmi dibuka. Kerjakan dengan teliti dan jujur. Waktu pengerjaan sesuai alokasi tiap paket.',
  showAnnouncement: true,
  allowGuestRetake: true,
  showAnswerExplanationToStudent: true,
  activeExamNotice: 'Kerjakan soal secara berurutan. Stimulus bacaan dan data dapat dilihat langsung di samping atau melalui tab bacaan.',
  guestTheme: 'modern'
};

export interface UserExamState {
  answers: Record<number, string | string[] | Record<string, string>>;
  flagged: Record<number, boolean>;
  timeSpentSeconds: number;
  completedAt?: string;
}

export interface ExamEvaluation {
  packageId: string;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  score: number; // 0 - 100
  gradeCategory: 'SANGAT MAHIR' | 'MAHIR' | 'CAKAP' | 'PERLU BIMBINGAN';
  accuracyPercentage: number;
  durationSeconds: number;
  breakdown: {
    question: QuestionItem;
    stimulusTitle: string;
    userAnswer: any;
    isCorrect: boolean;
  }[];
  competencyStats: Record<string, { total: number; correct: number }>;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}
