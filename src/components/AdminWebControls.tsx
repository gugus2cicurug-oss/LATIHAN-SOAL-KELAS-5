import React, { useState } from 'react';
import { 
  Settings, 
  Eye, 
  EyeOff, 
  Star, 
  Check, 
  Save, 
  Sliders, 
  Megaphone, 
  Globe, 
  Layers, 
  CheckCircle2, 
  AlertCircle,
  HelpCircle,
  Edit2,
  Trash2,
  Plus,
  Upload
} from 'lucide-react';
import { TKAPackage } from '../data/defaultPackages';
import { SiteSettings } from '../types';

interface AdminWebControlsProps {
  packages: TKAPackage[];
  siteSettings: SiteSettings;
  onUpdatePackages: (updated: TKAPackage[]) => void;
  onUpdateSettings: (settings: SiteSettings) => void;
  onOpenEditorForPackage: (pkg: TKAPackage) => void;
  onStartCreate: () => void;
  onOpenUpload: () => void;
  onPreviewAsStudent: () => void;
}

export const AdminWebControls: React.FC<AdminWebControlsProps> = ({
  packages,
  siteSettings,
  onUpdatePackages,
  onUpdateSettings,
  onOpenEditorForPackage,
  onStartCreate,
  onOpenUpload,
  onPreviewAsStudent
}) => {
  const [activeTab, setActiveTab] = useState<'soal' | 'tampilan'>('soal');
  const [localSettings, setLocalSettings] = useState<SiteSettings>(siteSettings);
  const [saveToast, setSaveToast] = useState(false);

  // Toggle package publish status
  const togglePublish = (pkgId: string) => {
    const updated = packages.map(p => {
      if (p.id === pkgId) {
        return { ...p, isPublished: p.isPublished === false ? true : false };
      }
      return p;
    });
    onUpdatePackages(updated);
  };

  // Set package as featured
  const toggleFeatured = (pkgId: string) => {
    const updated = packages.map(p => ({
      ...p,
      isFeatured: p.id === pkgId ? !p.isFeatured : false
    }));
    onUpdatePackages(updated);
  };

  // Save site settings
  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(localSettings);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 2500);
  };

  const publishedCount = packages.filter(p => p.isPublished !== false).length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm mb-10 no-print">
      
      {/* Admin Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold mb-2">
            <Sliders className="w-3.5 h-3.5 text-blue-600" />
            <span>PANEL PENGATURAN ADMIN GURU</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Kelola Tampilan Web & Soal Siswa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Atur naskah mana yang boleh dikerjakan oleh pengunjung/siswa, serta sesuaikan teks sambutan & pengumuman di beranda.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreviewAsStudent}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 transition-colors shadow-xs"
            title="Lihat persis bagaimana tampilan di mata siswa yang tidak login"
          >
            <Eye className="w-3.5 h-3.5 text-blue-600" />
            <span>👁️ Pratinjau Tampilan Siswa</span>
          </button>
        </div>
      </div>

      {/* Admin Nav Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl mb-6 max-w-md">
        <button
          onClick={() => setActiveTab('soal')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'soal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-600" />
          <span>Atur Soal yang Ditampilkan ({publishedCount}/{packages.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('tampilan')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'tampilan' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600" />
          <span>Atur Teks Web & Pengumuman</span>
        </button>
      </div>

      {/* TAB 1: KELOLA SOAL YANG DITAMPILKAN */}
      {activeTab === 'soal' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-800">Status Publikasi:</span>
              <span className="text-blue-700 font-bold bg-blue-100 px-2.5 py-0.5 rounded-full">
                {publishedCount} naskah ditampilkan ke siswa
              </span>
              <span className="text-slate-500 font-medium">
                ({packages.length - publishedCount} naskah disimpan sebagai draf rahasia guru)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onStartCreate}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Buat Soal AI</span>
              </button>
              <button
                onClick={onOpenUpload}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100"
              >
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload JSON</span>
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {packages.map((pkg, idx) => {
              const isPublished = pkg.isPublished !== false;
              const isFeatured = !!pkg.isFeatured;
              const totalQ = pkg.stimulusGroups.reduce((acc, sg) => acc + sg.questions.length, 0);

              return (
                <div
                  key={pkg.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isPublished 
                      ? 'bg-white border-slate-200 hover:border-blue-300 shadow-xs' 
                      : 'bg-slate-50/70 border-dashed border-slate-300 opacity-80'
                  }`}
                >
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>

                    <div className="space-y-1 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                          {pkg.subject}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {pkg.grade} • {totalQ} Butir Soal • {pkg.timeLimitMinutes} Menit
                        </span>

                        {isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Tampil ke Siswa</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
                            <EyeOff className="w-3 h-3" />
                            <span>Draf Rahasia (Disembunyikan)</span>
                          </span>
                        )}

                        {isFeatured && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300">
                            <Star className="w-3 h-3 text-amber-600 fill-amber-500" />
                            <span>Ujian Utama Hari Ini</span>
                          </span>
                        )}
                      </div>

                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug">
                        {pkg.title}
                      </h4>

                      <p className="text-xs text-slate-500 line-clamp-1">
                        {pkg.competencySummary}
                      </p>
                    </div>
                  </div>

                  {/* Actions for this package */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                    
                    {/* Toggle Publish button */}
                    <button
                      onClick={() => togglePublish(pkg.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all ${
                        isPublished
                          ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                          : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                      }`}
                      title={isPublished ? 'Klik untuk menyembunyikan dari siswa' : 'Klik untuk menampilkan ke siswa'}
                    >
                      {isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      <span>{isPublished ? 'Terbuka untuk Siswa' : 'Sembunyikan (Draf)'}</span>
                    </button>

                    {/* Featured star toggle */}
                    <button
                      onClick={() => toggleFeatured(pkg.id)}
                      className={`p-2 rounded-xl border transition-colors ${
                        isFeatured
                          ? 'bg-amber-50 border-amber-300 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-400 hover:text-amber-500'
                      }`}
                      title="Jadikan ujian unggulan di beranda depan siswa"
                    >
                      <Star className={`w-4 h-4 ${isFeatured ? 'fill-amber-500' : ''}`} />
                    </button>

                    {/* Edit questions */}
                    <button
                      onClick={() => onOpenEditorForPackage(pkg)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                      title="Edit butir soal & stimulus"
                    >
                      <Edit2 className="w-4 h-4 text-slate-700" />
                    </button>

                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: ATUR TAMPILAN WEB & PENGUMUMAN SISWA */}
      {activeTab === 'tampilan' && (
        <form onSubmit={handleSaveSettings} className="space-y-5 max-w-3xl">
          
          {saveToast && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pengaturan tampilan berhasil diperbarui & disimpan!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Nama Sekolah / Gugus di Header Siswa:
            </label>
            <input
              type="text"
              value={localSettings.schoolName}
              onChange={(e) => setLocalSettings({ ...localSettings, schoolName: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Judul Utama Halaman Pengunjung / Siswa:
            </label>
            <input
              type="text"
              value={localSettings.heroTitle}
              onChange={(e) => setLocalSettings({ ...localSettings, heroTitle: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-1">
              Teks Sambutan / Deskripsi Beranda Siswa:
            </label>
            <textarea
              rows={2}
              value={localSettings.heroSubtitle}
              onChange={(e) => setLocalSettings({ ...localSettings, heroSubtitle: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm"
            />
          </div>

          {/* Announcement banner settings */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-amber-600" />
                <span className="font-extrabold text-xs text-amber-900 uppercase">
                  Papan Pengumuman Guru untuk Siswa
                </span>
              </div>
              <label className="flex items-center gap-2 text-xs font-bold text-amber-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={localSettings.showAnnouncement}
                  onChange={(e) => setLocalSettings({ ...localSettings, showAnnouncement: e.target.checked })}
                  className="rounded text-amber-600 focus:ring-amber-500"
                />
                <span>Tampilkan di Beranda</span>
              </label>
            </div>

            <textarea
              rows={2}
              value={localSettings.announcement}
              onChange={(e) => setLocalSettings({ ...localSettings, announcement: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-amber-300 text-xs sm:text-sm bg-white"
              placeholder="Ketik pengumuman guru di sini..."
            />
          </div>

          {/* Permissions / Rules */}
          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.showAnswerExplanationToStudent}
                onChange={(e) => setLocalSettings({ ...localSettings, showAnswerExplanationToStudent: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Tampilkan Pembahasan & Langkah Hitung kepada Siswa Setelah Ujian Selesai</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={localSettings.allowGuestRetake}
                onChange={(e) => setLocalSettings({ ...localSettings, allowGuestRetake: e.target.checked })}
                className="rounded text-blue-600 focus:ring-blue-500"
              />
              <span>Izinkan Siswa / Pengunjung Mengulang Ujian (Retake)</span>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Pengaturan Web</span>
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
