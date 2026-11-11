import React, { useState } from 'react';
import { 
  Quote, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Star, 
  Sparkles,
  HelpCircle,
  FileCheck,
  Laptop,
  Printer
} from 'lucide-react';

export const TestimonialsAndFAQ: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const testimonials = [
    {
      name: "Dra. Hj. Siti Nurhasanah, M.Pd.",
      role: "Guru Penggerak & Wali Kelas 5 SD Teladan",
      content: "Platform KELAS 5 JUARA benar-benar mengubah cara kami menyiapkan asesmen. Sebelumnya kami butuh 3 hari membuat stimulus dan soal HOTS. Sekarang, cukup tempel kisi-kisi, naskah A4 berstandar Pusmendik langsung jadi dan siap cetak!",
      avatar: "SN",
      rating: 5
    },
    {
      name: "Bambang Sudarmono, S.Pd.",
      role: "Koordinator Kurikulum & Asesmen Nasional",
      content: "Kaidah 1 stimulus untuk 3 butir soal bertingkat dieksekusi dengan sangat presisi oleh AI. Format Pilihan Ganda Kompleks dan Benar/Salah persis seperti format resmi Asesmen Nasional Pusmendik Kemendikdasmen.",
      avatar: "BS",
      rating: 5
    },
    {
      name: "Raditya Pratama",
      role: "Siswa Kelas 5 SD Juara",
      content: "Mode ujian interaktifnya sangat asyik! Bacaan di samping kiri dan soal di kanan memudahkan saya membaca teks tanpa harus bolak-balik halaman. Pembahasan setelah ujian juga membantu saya paham letak salahnya.",
      avatar: "RP",
      rating: 5
    }
  ];

  const faqs = [
    {
      q: "Apa itu platform KELAS 5 JUARA - TKA GURU?",
      a: "KELAS 5 JUARA adalah platform otomasi penyusunan naskah Tes Kemampuan Akademik (TKA) berbasis kecerdasan buatan (AI) yang disesuaikan dengan regulasi dan standar mutu Pusat Asesmen Pendidikan (Pusmendik) Kemendikdasmen RI untuk jenjang SD/MI."
    },
    {
      q: "Bagaimana kaidah 1 stimulus untuk 3 butir soal bekerja?",
      a: "Sesuai standar asesmen nasional, setiap stimulus (berupa cerita narasi, data tabel, grafik SVG, atau teks eksplanasi ilmiah) digunakan untuk melandasi tepat 3 butir pertanyaan bertingkat: L1 (Pemahaman informasi tersurat), L2 (Penerapan konsep & perbandingan data), dan L3 (Penalaran tingkat tinggi/HOTS)."
    },
    {
      q: "Apa yang terjadi jika saya memasukkan kisi-kisi untuk 2 mata pelajaran sekaligus?",
      a: "Sistem AI kami otomatis mendeteksi kedua mata pelajaran tersebut (misalnya Matematika dan Bahasa Indonesia) dan akan menyusun 2 paket latihan terpisah secara otomatis, sehingga masing-masing paket memiliki alokasi waktu dan fokus indikator yang proporsional."
    },
    {
      q: "Bagaimana cara mencetak naskah soal menjadi dokumen A4 rapi?",
      a: "Buka 'Mode Naskah A4', lalu klik tombol 'Cetak Naskah A4'. Browser akan membuka dialog cetak yang sudah dioptimalkan untuk ukuran kertas A4 dengan margin standar, kop surat resmi, serta stimulus dan soal yang tidak terpotong secara canggung."
    },
    {
      q: "Apakah aplikasi ini bisa digunakan tanpa koneksi internet (offline)?",
      a: "Ya! Anda dapat mengunduh file 'TKA_GURU.html' mandiri melalui tombol unduh di bagian navigasi. File tersebut menggabungkan seluruh HTML, CSS, JavaScript, dan generator sintesis cerdas sehingga dapat dibuka langsung dengan klik dua kali di komputer tanpa instalasi aplikasi tambahan."
    }
  ];

  return (
    <section className="my-16 no-print space-y-16">
      
      {/* Visual Gallery / Feature Showcase Section */}
      <div>
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Fitur Terintegrasi Standar Emas
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Dirancang Sesuai Kebutuhan Nyata Sekolah
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Dari input kisi-kisi hingga cetak naskah dan evaluasi siswa, seluruh proses terintegrasi tanpa hambatan teknis.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 mb-4">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              Dokumen Naskah Cetak A4
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Dilengkapi Kop Surat resmi Pusmendik, kotak stimulus berbingkai, penomoran rapi, dan opsi cetak lembar kunci jawaban terpisah.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 mb-4">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              Simulasi Ujian Interaktif
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Siswa mengerjakan langsung di web dengan timer waktu nyata, panel stimulus berdampingan, dan penanda soal ragu-ragu.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-2">
              Analisis & Rekomendasi
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Perhitungan nilai instan, predikat juara, pemetaan penguasaan indikator, dan saran tindakan remedial guru.
            </p>
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div>
        <div className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Ulasan Pengguna Nyata
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Dipercaya oleh Guru & Siswa di Seluruh Indonesia
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, r) => (
                    <Star key={r} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6 font-serif">
                  "{t.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                  {t.avatar}
                </div>
                <div>
                  <h4 className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">{t.name}</h4>
                  <p className="text-[11px] text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Tanya Jawab Seputar TKA
          </span>
          <h2 className="text-2xl font-extrabold text-slate-900 mt-1">
            Pertanyaan yang Sering Diajukan (FAQ)
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, fIdx) => {
            const isOpen = openFaqIndex === fIdx;
            return (
              <div
                key={fIdx}
                className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-xs"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : fIdx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-blue-600 shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="px-4 pb-5 sm:px-5 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </section>
  );
};
