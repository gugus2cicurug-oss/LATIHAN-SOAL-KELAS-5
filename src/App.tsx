/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { SubjectGrid } from './components/SubjectGrid';
import { GeneratorForm } from './components/GeneratorForm';
import { NaskahView } from './components/NaskahView';
import { ExamView } from './components/ExamView';
import { ResultView } from './components/ResultView';
import { TeacherEditorModal } from './components/TeacherEditorModal';
import { AIChatDrawer } from './components/AIChatDrawer';
import { LoginModal } from './components/LoginModal';
import { UploadNaskahModal } from './components/UploadNaskahModal';
import { MobileBottomNav } from './components/MobileBottomNav';
import { TestimonialsAndFAQ } from './components/TestimonialsAndFAQ';
import { Footer } from './components/Footer';

import { TKAPackage, DEFAULT_PACKAGES } from './data/defaultPackages';
import { loadSavedPackages, savePackages } from './utils/generator';
import { UserExamState, ExamEvaluation, RegisteredUser, SiteSettings } from './types';
import { getCurrentUser, addExamHistoryToCurrentUser, isUserAdminGuru } from './utils/auth';
import { getSiteSettings, saveSiteSettings } from './utils/settings';
import { AdminWebControls } from './components/AdminWebControls';
import { StudentHomeView } from './components/StudentHomeView';

import { 
  Plus, 
  Trash2, 
  Copy, 
  FileText, 
  PenTool, 
  Calendar, 
  Sparkles, 
  Upload, 
  User, 
  LogIn, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

export default function App() {
  const [packages, setPackages] = useState<TKAPackage[]>([]);
  const [activePackage, setActivePackage] = useState<TKAPackage | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'create' | 'naskah' | 'exam' | 'result'>('dashboard');
  
  const [prefilledSubjectId, setPrefilledSubjectId] = useState<string | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<RegisteredUser | null>(null);
  const [examEvaluation, setExamEvaluation] = useState<ExamEvaluation | null>(null);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(getSiteSettings());
  const [previewAsStudent, setPreviewAsStudent] = useState(false);

  const isRealAdminGuru = isUserAdminGuru(currentUser);
  const isAdminGuru = isRealAdminGuru && !previewAsStudent;

  // Initialize saved packages, user session & check server health
  useEffect(() => {
    const saved = loadSavedPackages();
    setPackages(saved);
    if (saved.length > 0) {
      setActivePackage(saved[0]);
    }

    const user = getCurrentUser();
    setCurrentUser(user);

    // Health check
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.hasApiKey) {
          setHasApiKey(true);
        }
      })
      .catch((e) => {
        console.log('Server health check non-blocking note:', e);
      });
  }, []);

  // Save packages on change
  const updatePackagesState = (newPackages: TKAPackage[]) => {
    setPackages(newPackages);
    savePackages(newPackages);
  };

  const handleOpenPreset = (index: number) => {
    const target = packages[index] || DEFAULT_PACKAGES[index] || packages[0];
    if (target) {
      setActivePackage(target);
      setActiveView('naskah');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSelectSubjectMatrix = (subjId: string) => {
    setPrefilledSubjectId(subjId);
    setActiveView('create');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePackageGenerated = (pkg: TKAPackage, secondPkg?: TKAPackage) => {
    const updated = [pkg];
    if (secondPkg) {
      updated.push(secondPkg);
    }
    const combined = [...updated, ...packages.filter(p => p.id !== pkg.id)];
    updatePackagesState(combined);
    setActivePackage(pkg);
    setActiveView('naskah');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUploadSuccess = (uploadedPkg: TKAPackage) => {
    const updated = [uploadedPkg, ...packages.filter(p => p.id !== uploadedPkg.id)];
    updatePackagesState(updated);
    setActivePackage(uploadedPkg);
    setActiveView('naskah');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeletePackage = (id: string) => {
    if (packages.length <= 1) {
      alert('Minimal sisakan satu paket asesmen.');
      return;
    }
    if (confirm('Apakah Anda yakin ingin menghapus paket naskah ini?')) {
      const filtered = packages.filter((p) => p.id !== id);
      updatePackagesState(filtered);
      if (activePackage?.id === id) {
        setActivePackage(filtered[0] || null);
      }
    }
  };

  const handleDuplicatePackage = (pkgToDup: TKAPackage) => {
    const duplicated: TKAPackage = {
      ...JSON.parse(JSON.stringify(pkgToDup)),
      id: `pkg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title: `${pkgToDup.title} (Salinan Baru)`,
      createdAt: new Date().toISOString().split('T')[0]
    };
    const updated = [duplicated, ...packages];
    updatePackagesState(updated);
    setActivePackage(duplicated);
    alert('Paket berhasil digandakan!');
  };

  const handleSaveEditedPackage = (updatedPkg: TKAPackage) => {
    const updated = packages.map((p) => (p.id === updatedPkg.id ? updatedPkg : p));
    updatePackagesState(updated);
    setActivePackage(updatedPkg);
  };

  // Exam Evaluation Logic
  const handleSubmitExam = (examState: UserExamState) => {
    if (!activePackage) return;

    let correctCount = 0;
    let totalQuestions = 0;
    const breakdown: ExamEvaluation['breakdown'] = [];
    const compStats: Record<string, { total: number; correct: number }> = {};

    activePackage.stimulusGroups.forEach((sg) => {
      sg.questions.forEach((q) => {
        totalQuestions++;
        const userAns = examState.answers[q.number];
        let isCorrect = false;

        // Scoring based on question type
        if (q.type === 'pg') {
          isCorrect = userAns === q.correctAnswer;
        } else if (q.type === 'pgk') {
          if (Array.isArray(userAns) && Array.isArray(q.correctAnswer)) {
            const sortedU = [...userAns].sort();
            const sortedK = [...q.correctAnswer].sort();
            isCorrect = JSON.stringify(sortedU) === JSON.stringify(sortedK);
          }
        } else if (q.statements && typeof q.correctAnswer === 'object' && !Array.isArray(q.correctAnswer)) {
          if (typeof userAns === 'object' && userAns !== null && !Array.isArray(userAns)) {
            let allMatch = true;
            const userAnsMap = userAns as Record<string, string>;
            const correctMap = q.correctAnswer as Record<string, string>;
            Object.keys(correctMap).forEach((stmtKey) => {
              if (userAnsMap[stmtKey] !== correctMap[stmtKey]) {
                allMatch = false;
              }
            });
            isCorrect = allMatch;
          }
        }

        if (isCorrect) correctCount++;

        // Competency stats
        const comp = q.competency || 'Kompetensi Pokok';
        if (!compStats[comp]) {
          compStats[comp] = { total: 0, correct: 0 };
        }
        compStats[comp].total++;
        if (isCorrect) compStats[comp].correct++;

        breakdown.push({
          question: q,
          stimulusTitle: sg.title,
          userAnswer: userAns,
          isCorrect
        });
      });
    });

    const score = Math.round((correctCount / totalQuestions) * 100);
    const accuracy = score;

    let gradeCategory: ExamEvaluation['gradeCategory'] = 'PERLU BIMBINGAN';
    if (score >= 85) gradeCategory = 'SANGAT MAHIR';
    else if (score >= 70) gradeCategory = 'MAHIR';
    else if (score >= 55) gradeCategory = 'CAKAP';

    const evaluation: ExamEvaluation = {
      packageId: activePackage.id,
      totalQuestions,
      correctCount,
      incorrectCount: totalQuestions - correctCount,
      unansweredCount: totalQuestions - Object.keys(examState.answers).length,
      score,
      gradeCategory,
      accuracyPercentage: accuracy,
      durationSeconds: examState.timeSpentSeconds,
      breakdown,
      competencyStats: compStats
    };

    // Save to user history if logged in
    if (currentUser) {
      const updatedUser = addExamHistoryToCurrentUser({
        packageId: activePackage.id,
        packageTitle: activePackage.title,
        subject: activePackage.subject,
        score,
        gradeCategory
      });
      if (updatedUser) {
        setCurrentUser(updatedUser);
      }
    }

    setExamEvaluation(evaluation);
    setActiveView('result');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Download Standalone HTML
  const handleDownloadStandalone = () => {
    const link = document.createElement('a');
    link.href = '/TKA_GURU.html';
    link.download = 'TKA_GURU.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans pb-16 lg:pb-0">
      
      {/* Navbar with Login & Upload buttons */}
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        openAiDrawer={() => setIsAiDrawerOpen(true)}
        openLoginModal={() => setIsLoginModalOpen(true)}
        openUploadModal={() => setIsUploadModalOpen(true)}
        currentUser={currentUser}
        hasActivePackage={!!activePackage}
        onDownloadStandalone={handleDownloadStandalone}
      />

      {/* Teacher Preview Banner (When Admin tests as student) */}
      {previewAsStudent && (
        <div className="bg-amber-500 text-slate-950 px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-between no-print sticky top-16 sm:top-20 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="text-base">👁️</span>
            <span>Mode Pratinjau Siswa Aktif: Menampilkan persis tampilan pengunjung/siswa tanpa hak akses admin.</span>
          </div>
          <button
            onClick={() => setPreviewAsStudent(false)}
            className="px-3 py-1 bg-slate-900 text-white rounded-lg hover:bg-black text-xs font-black shadow-xs cursor-pointer"
          >
            ✕ Keluar Pratinjau (Kembali ke Panel Guru)
          </button>
        </div>
      )}

      {/* Main App Content View Switcher */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* VIEW 1: DASHBOARD */}
        {activeView === 'dashboard' && (
          !isAdminGuru ? (
            /* PORTAL SISWA / PENGUNJUNG: HANYA BISA MENGERJAKAN SOAL YANG DIPUBLIKASIKAN */
            <StudentHomeView
              packages={packages}
              siteSettings={siteSettings}
              onStartExam={(pkg) => {
                setActivePackage(pkg);
                setActiveView('exam');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onViewNaskah={(pkg) => {
                setActivePackage(pkg);
                setActiveView('naskah');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              onOpenLogin={() => setIsLoginModalOpen(true)}
            />
          ) : (
            /* PORTAL ADMIN GURU: PENGATURAN TAMPILAN WEB & KELOLA SOAL */
            <div className="space-y-6 sm:space-y-10">
              
              {/* User Greeting & Status Banner */}
              {currentUser && (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0">
                      {currentUser.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900">
                          Selamat Datang, {currentUser.displayName}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${
                          currentUser.role === 'guru' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-blue-50 text-blue-800 border-blue-200'
                        }`}>
                          @{currentUser.username}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-500">
                        {currentUser.schoolName} • Panel Pengaturan Admin Guru & Bank Soal TKA
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsUploadModalOpen(true)}
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Upload Soal</span>
                    </button>
                    <button
                      onClick={() => setIsLoginModalOpen(true)}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 px-2 py-1"
                    >
                      Profil
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Web Controls for Managing Questions & Appearance */}
              <AdminWebControls
                packages={packages}
                siteSettings={siteSettings}
                onUpdatePackages={(updated) => updatePackagesState(updated)}
                onUpdateSettings={(newSettings) => {
                  setSiteSettings(newSettings);
                  saveSiteSettings(newSettings);
                }}
                onOpenEditorForPackage={(pkg) => {
                  setActivePackage(pkg);
                  setIsEditorOpen(true);
                }}
                onStartCreate={() => {
                  setPrefilledSubjectId(null);
                  setActiveView('create');
                }}
                onOpenUpload={() => setIsUploadModalOpen(true)}
                onPreviewAsStudent={() => {
                  setPreviewAsStudent(true);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />

              {/* Hero Section */}
            <HeroSection
              onStartCreate={() => {
                setPrefilledSubjectId(null);
                setActiveView('create');
              }}
              onOpenPreset={handleOpenPreset}
              onDownloadStandalone={handleDownloadStandalone}
              onOpenUpload={() => setIsUploadModalOpen(true)}
              onOpenLogin={() => setIsLoginModalOpen(true)}
              currentUser={currentUser}
              hasApiKey={hasApiKey}
            />

            {/* Saved Packages List */}
            <section className="no-print">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-200 gap-2.5">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Daftar Naskah Asesmen Tersimpan
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
                    Paket soal TKA lengkap dengan dokumen cetak A4, kunci jawaban, dan modul simulasi ujian siswa.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
                    {packages.length} Paket
                  </span>

                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload Naskah</span>
                  </button>

                  <button
                    onClick={() => {
                      setPrefilledSubjectId(null);
                      setActiveView('create');
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Buat Baru</span>
                  </button>
                </div>
              </div>

              {/* Grid of Packages */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {packages.map((pkg) => {
                  let qCount = 0;
                  pkg.stimulusGroups.forEach(sg => { qCount += sg.questions.length; });

                  return (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2 sm:mb-3">
                          <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                            {pkg.subject}
                          </span>
                          <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {pkg.createdAt}
                          </span>
                        </div>

                        <h3 className="font-bold text-sm sm:text-lg text-slate-900 line-clamp-2 mb-1.5">
                          {pkg.title}
                        </h3>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3 sm:mb-4">
                          {pkg.competencySummary}
                        </p>

                        <div className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-[11px] sm:text-xs font-semibold text-slate-700 mb-4 sm:mb-5">
                          <span className="text-blue-700 font-bold">{qCount} Butir Soal</span>
                          <span>•</span>
                          <span>{pkg.stimulusGroups.length} Stimulus</span>
                          <span>•</span>
                          <span>{pkg.timeLimitMinutes} Menit</span>
                        </div>
                      </div>

                      {/* Package Card Actions */}
                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <button
                            onClick={() => {
                              setActivePackage(pkg);
                              setActiveView('naskah');
                            }}
                            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-slate-600" />
                            <span>Naskah</span>
                          </button>

                          <button
                            onClick={() => {
                              setActivePackage(pkg);
                              setActiveView('exam');
                            }}
                            className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <PenTool className="w-3.5 h-3.5 text-blue-600" />
                            <span>Uji Siswa</span>
                          </button>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDuplicatePackage(pkg)}
                            title="Duplikasi Naskah"
                            className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeletePackage(pkg.id)}
                            title="Hapus Naskah"
                            className="p-1.5 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </section>

            {/* 9 Subjects Catalog Grid */}
            <SubjectGrid onSelectSubjectMatrix={handleSelectSubjectMatrix} />

            {/* Testimonials & FAQs */}
            <TestimonialsAndFAQ />
          </div>
          )
        )}

        {/* VIEW 2: CREATE / GENERATOR FORM (KHUSUS ADMIN GURU) */}
        {activeView === 'create' && (
          isRealAdminGuru ? (
            <GeneratorForm
              onPackageGenerated={handlePackageGenerated}
              prefilledSubjectId={prefilledSubjectId}
              onCancel={() => setActiveView('dashboard')}
            />
          ) : (
            <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto text-2xl font-black">
                🔒
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                Akses Khusus Admin Guru
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                Pembuatan naskah latihan baru berbasis AI dan analisis kisi-kisi hanya dapat dilakukan oleh Admin Guru terdaftar (misal: akun <strong className="text-slate-900 font-bold">@gugus2cicurug</strong> atau <strong className="text-slate-900 font-bold">@guru_5a</strong>).
              </p>
              <p className="text-xs text-slate-500">
                Pengunjung dan siswa dipersilakan mengerjakan paket ujian yang telah dipublikasikan guru di beranda depan.
              </p>
              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs sm:text-sm font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 cursor-pointer"
                >
                  🔐 Login Akun Admin Guru
                </button>
                <button
                  onClick={() => setActiveView('dashboard')}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold hover:bg-slate-200 cursor-pointer"
                >
                  Kembali ke Portal Soal Siswa
                </button>
              </div>
            </div>
          )
        )}

        {/* VIEW 3: MODE NASKAH (CETAK A4 - KUNCI & EDIT TERKUNCI JIKA PENGUNJUNG) */}
        {activeView === 'naskah' && activePackage && (
          <NaskahView
            pkg={activePackage}
            onStartExam={() => setActiveView('exam')}
            onOpenEditor={() => setIsEditorOpen(true)}
            onOpenUpload={() => setIsUploadModalOpen(true)}
            onDownloadStandalone={handleDownloadStandalone}
            isAdminGuru={isRealAdminGuru}
          />
        )}

        {/* VIEW 4: MODE UJIAN SISWA (OPTIMAL HP) */}
        {activeView === 'exam' && activePackage && (
          <ExamView
            pkg={activePackage}
            onSubmitExam={handleSubmitExam}
            onExitExam={() => setActiveView('dashboard')}
          />
        )}

        {/* VIEW 5: HASIL & PEMBAHASAN */}
        {activeView === 'result' && activePackage && examEvaluation && (
          <ResultView
            pkg={activePackage}
            evaluation={examEvaluation}
            onRetakeExam={() => setActiveView('exam')}
            onViewNaskah={() => setActiveView('naskah')}
            onGoDashboard={() => setActiveView('dashboard')}
          />
        )}

      </main>

      {/* Teacher Editor Modal */}
      {activePackage && isEditorOpen && (
        <TeacherEditorModal
          pkg={activePackage}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveEditedPackage}
        />
      )}

      {/* Floating AI Consultant Assistant Drawer */}
      <AIChatDrawer
        isOpen={isAiDrawerOpen}
        onClose={() => setIsAiDrawerOpen(false)}
        activePackage={activePackage || undefined}
      />

      {/* Login & Registered Users Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentUser={currentUser}
        onUserChange={(newUser) => setCurrentUser(newUser)}
      />

      {/* Upload Naskah Modal */}
      <UploadNaskahModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Dedicated Mobile Bottom Navigation (Visible on phone/tablet screens) */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        openUploadModal={() => setIsUploadModalOpen(true)}
        openLoginModal={() => setIsLoginModalOpen(true)}
        currentUser={currentUser}
        hasActivePackage={!!activePackage}
      />

      {/* Footer */}
      <Footer
        onDownloadStandalone={handleDownloadStandalone}
        onSelectSubject={handleSelectSubjectMatrix}
      />

    </div>
  );
}
