/**
 * Default Exemplar TKA Packages for All 9 Subjects
 * Adhering strictly to Pusmendik Kemendikdasmen standards:
 * 1 Stimulus for 3 Questions, diverse question types (PG, PGK, BS, STS, MTM),
 * complete keys, and step-by-step mathematical/literacy reasoning.
 */

export interface OptionItem {
  key: string;
  text: string;
}

export interface StatementItem {
  id: string;
  text: string;
  answer?: string; // 'Benar'|'Salah' or 'Sesuai'|'Tidak Sesuai' or 'Mendukung'|'Tidak Mendukung'
}

export interface MatchingPairItem {
  id: string;
  left: string;
  right: string;
}

export interface QuestionItem {
  number: number;
  type: 'pg' | 'pgk' | 'bs' | 'sts' | 'mtm' | 'jodohkan' | 'isian';
  competency: string;
  cognitiveLevel: string; // 'L1 - Pemahaman', 'L2 - Penerapan', 'L3 - Penalaran/HOTS'
  prompt: string;
  options?: OptionItem[];
  statements?: StatementItem[];
  matchingPairs?: MatchingPairItem[];
  correctAnswer: string | string[] | Record<string, string>;
  explanation: string;
}

export interface StimulusGroup {
  stimulusId: string;
  title: string;
  type: string;
  content: string;
  hasStimulus?: boolean; // false jika butir soal mandiri (tanpa teks bacaan/stimulus)
  tableData?: Record<string, any>[];
  svgDiagram?: string;
  questions: QuestionItem[];
}

export interface TKAPackage {
  id: string;
  title: string;
  subject: string;
  subjectCode: string;
  grade: string;
  academicYear: string;
  timeLimitMinutes: number;
  competencySummary: string;
  createdAt: string;
  isPublished?: boolean;
  isFeatured?: boolean;
  stimulusGroups: StimulusGroup[];
}

export const DEFAULT_PACKAGES: TKAPackage[] = [
  // 1. MATEMATIKA KELAS 5
  {
    id: "mat-kls5-paket1",
    title: "Asesmen TKA Matematika - Numerasi Kontekstual & Pemecahan Masalah",
    subject: "Matematika",
    subjectCode: "MAT",
    grade: "Kelas 5 & 6 SD/MI",
    academicYear: "2026/2027",
    timeLimitMinutes: 60,
    competencySummary: "Operasi hitung campuran bilangan cacah, pecahan, perbandingan skala, keliling/luas bangun datar, volume kubus/balok, dan interpretasi diagram batang.",
    createdAt: "2026-11-10",
    stimulusGroups: [
      {
        stimulusId: "stimulus-mat-1",
        title: "Koperasi Siswa Mandiri dan Penjualan Alat Tulis",
        type: "Data Kontekstual & Tabel Penjualan",
        content: `Koperasi Sekolah 'Siswa Mandiri' SD Juara mencatat transaksi penjualan alat tulis selama sepekan dalam rangka menyambut tahun ajaran baru. Pengurus koperasi memberikan paket bundling hemat untuk membantu siswa mendapatkan perlengkapan belajar yang terjangkau.

Setiap paket 'Cerdas Hemat' berisi 3 buku tulis seharga Rp12.000, 2 pulpen seharga Rp6.000, dan 1 penggaris seharga Rp3.000. Jika dibeli terpisah per satuan, harga 1 buku tulis adalah Rp4.500, 1 pulpen Rp3.500, dan 1 penggaris Rp3.500. Seluruh keuntungan penjualan didonasikan untuk beasiswa perlengkapan sekolah siswa prasejahtera.`,
        tableData: [
          { "Hari": "Senin", "Paket Cerdas Hemat": "25 paket", "Total Penjualan Satuan": "15 item" },
          { "Hari": "Selasa", "Paket Cerdas Hemat": "30 paket", "Total Penjualan Satuan": "20 item" },
          { "Hari": "Rabu", "Paket Cerdas Hemat": "40 paket", "Total Penjualan Satuan": "12 item" },
          { "Hari": "Kamis", "Paket Cerdas Hemat": "35 paket", "Total Penjualan Satuan": "18 item" },
          { "Hari": "Jumat", "Paket Cerdas Hemat": "50 paket", "Total Penjualan Satuan": "25 item" }
        ],
        svgDiagram: `<svg viewBox="0 0 400 180" class="w-full max-w-md mx-auto my-2 rounded bg-blue-50/50 p-2 border border-blue-200">
          <text x="200" y="22" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e3a8a">Grafik Penjualan Paket Koperasi (Senin - Jumat)</text>
          <line x1="50" y1="140" x2="370" y2="140" stroke="#64748b" stroke-width="2"/>
          <line x1="50" y1="35" x2="50" y2="140" stroke="#64748b" stroke-width="2"/>
          <!-- Senin: 25 -->
          <rect x="70" y="90" width="35" height="50" fill="#3b82f6" rx="3"/>
          <text x="87" y="85" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e40af">25</text>
          <text x="87" y="155" text-anchor="middle" font-size="10" fill="#475569">Senin</text>
          <!-- Selasa: 30 -->
          <rect x="130" y="80" width="35" height="60" fill="#3b82f6" rx="3"/>
          <text x="147" y="75" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e40af">30</text>
          <text x="147" y="155" text-anchor="middle" font-size="10" fill="#475569">Selasa</text>
          <!-- Rabu: 40 -->
          <rect x="190" y="60" width="35" height="80" fill="#2563eb" rx="3"/>
          <text x="207" y="55" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e40af">40</text>
          <text x="207" y="155" text-anchor="middle" font-size="10" fill="#475569">Rabu</text>
          <!-- Kamis: 35 -->
          <rect x="250" y="70" width="35" height="70" fill="#3b82f6" rx="3"/>
          <text x="267" y="65" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e40af">35</text>
          <text x="267" y="155" text-anchor="middle" font-size="10" fill="#475569">Kamis</text>
          <!-- Jumat: 50 -->
          <rect x="310" y="40" width="35" height="100" fill="#1d4ed8" rx="3"/>
          <text x="327" y="35" text-anchor="middle" font-size="10" font-weight="bold" fill="#1e40af">50</text>
          <text x="327" y="155" text-anchor="middle" font-size="10" fill="#475569">Jumat</text>
        </svg>`,
        questions: [
          {
            number: 1,
            type: "pg",
            competency: "Menghitung selisih harga dan efisiensi pengeluaran (Operasi Hitung)",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Berapakah jumlah uang yang berhasil dihemat oleh seorang siswa jika ia memutuskan untuk membeli 1 Paket Cerdas Hemat dibandingkan membeli semua barang tersebut secara terpisah?",
            options: [
              { key: "A", text: "Rp2.000,00" },
              { key: "B", text: "Rp3.000,00" },
              { key: "C", text: "Rp4.000,00" },
              { key: "D", text: "Rp5.000,00" }
            ],
            correctAnswer: "B",
            explanation: `Langkah Penyelesaian:
1. Hitung harga beli terpisah:
   - 3 buku tulis = 3 x Rp4.500 = Rp13.500
   - 2 pulpen = 2 x Rp3.500 = Rp7.000
   - 1 penggaris = 1 x Rp3.500 = Rp3.500
   Total terpisah = Rp13.500 + Rp7.000 + Rp3.500 = Rp24.000,00
2. Harga Paket Cerdas Hemat:
   - Rp12.000 (buku) + Rp6.000 (pulpen) + Rp3.000 (penggaris) = Rp21.000,00
3. Selisih penghematan = Rp24.000,00 - Rp21.000,00 = Rp3.000,00.
Kunci Jawaban: B.`
          },
          {
            number: 2,
            type: "pgk",
            competency: "Analisis statistik data frekuensi penjualan sepekan",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Berdasarkan grafik dan tabel penjualan paket, manakah pernyataan berikut yang BENAR? (Pilihlah semua jawaban yang tepat):",
            options: [
              { key: "A", text: "Total paket Cerdas Hemat yang terjual dari hari Senin hingga Jumat adalah 180 paket." },
              { key: "B", text: "Kenaikan penjualan paket Cerdas Hemat tertinggi terjadi dari hari Kamis ke hari Jumat." },
              { key: "C", text: "Rata-rata penjualan paket Cerdas Hemat per hari selama lima hari tersebut adalah 36 paket." },
              { key: "D", text: "Penjualan paket pada hari Rabu sama dengan jumlah penjualan pada hari Senin dan Selasa digabungkan." }
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: `Analisis Pernyataan:
- Opsi A: Total paket = 25 + 30 + 40 + 35 + 50 = 180 paket. (BENAR)
- Opsi B: Kenaikan Kamis (35) ke Jumat (50) adalah 15 paket, merupakan lonjakan kenaikan tertinggi dibandingkan hari lain. (BENAR)
- Opsi C: Rata-rata = 180 / 5 = 36 paket per hari. (BENAR)
- Opsi D: Penjualan Senin (25) + Selasa (30) = 55 paket, sedangkan Rabu hanya 40 paket (SALAH).
Jadi jawaban yang benar adalah A, B, dan C.`
          },
          {
            number: 3,
            type: "bs",
            competency: "Evaluasi data keuangan koperasi",
            cognitiveLevel: "L3 - Penalaran",
            prompt: "Tentukan kebenaran pernyataan matematis berikut berdasarkan informasi penjualan Paket Cerdas Hemat!",
            statements: [
              { id: "s1", text: "Pendapatan kotor dari penjualan paket pada hari Jumat adalah Rp1.050.000,00.", answer: "Benar" },
              { id: "s2", text: "Rasio penjualan paket hari Senin terhadap hari Jumat adalah 1 : 3.", answer: "Salah" },
              { id: "s3", text: "Jika target mingguan adalah 200 paket, maka target tersebut telah tercapai sebesar 90%.", answer: "Benar" }
            ],
            correctAnswer: { "s1": "Benar", "s2": "Salah", "s3": "Benar" },
            explanation: `Pembahasan Pernyataan:
1. Hari Jumat terjual 50 paket. Harga 1 paket = Rp21.000. Maka pendapatan = 50 x Rp21.000 = Rp1.050.000,00 (BENAR).
2. Rasio Senin (25) : Jumat (50) = 25 : 50 = 1 : 2, bukan 1 : 3 (SALAH).
3. Terjual 180 dari target 200 paket = (180 / 200) x 100% = 90% (BENAR).`
          }
        ]
      },
      {
        stimulusId: "stimulus-mat-2",
        title: "Pembuatan Kebun Hidroponik Sekolah Berkelanjutan",
        type: "Geometri Bangun Datar & Pengukuran",
        content: `SD Juara memanfaatkan lahan kosong di belakang sekolah untuk membuat taman hidroponik dan kolam ikan gurami. Lahan berukuran panjang 12 meter dan lebar 8 meter. 

Di bagian tengah lahan dibuat kolam berbentuk lingkaran dengan diameter 4 meter (gunakan π = 3,14). Sisa lahan di luar kolam akan dipasang paving block persegi ramah lingkungan berukuran 40 cm x 40 cm. Di sekeliling seluruh tepian lahan luar akan dipasang pagar kawat pelindung.`,
        svgDiagram: `<svg viewBox="0 0 360 200" class="w-full max-w-sm mx-auto my-2 rounded bg-emerald-50/50 p-2 border border-emerald-200">
          <text x="180" y="20" text-anchor="middle" font-size="12" font-weight="bold" fill="#065f46">Denah Lahan Kebun Sekolah (12 m x 8 m)</text>
          <!-- Outer Rectangle -->
          <rect x="40" y="35" width="280" height="140" fill="#a7f3d0" stroke="#059669" stroke-width="2.5" rx="4"/>
          <!-- Dimensions labels -->
          <text x="180" y="30" text-anchor="middle" font-size="11" fill="#047857" font-weight="bold">Panjang = 12 meter</text>
          <text x="25" y="110" text-anchor="middle" font-size="11" fill="#047857" font-weight="bold" transform="rotate(-90 25 110)">Lebar = 8 meter</text>
          <!-- Inner Pond Circle -->
          <circle cx="180" cy="105" r="45" fill="#38bdf8" stroke="#0284c7" stroke-width="2"/>
          <text x="180" y="102" text-anchor="middle" font-size="10" font-weight="bold" fill="#0369a1">Kolam Ikan</text>
          <text x="180" y="118" text-anchor="middle" font-size="9" fill="#075985">d = 4 m</text>
        </svg>`,
        questions: [
          {
            number: 4,
            type: "pg",
            competency: "Menghitung luas daerah di luar lingkaran (Geometri)",
            cognitiveLevel: "L3 - Penalaran",
            prompt: "Berapakah luas area lahan yang akan dipasangi paving block (luas lahan di luar kolam lingkaran)?",
            options: [
              { key: "A", text: "83,44 m²" },
              { key: "B", text: "84,56 m²" },
              { key: "C", text: "96,00 m²" },
              { key: "D", text: "12,56 m²" }
            ],
            correctAnswer: "A",
            explanation: `Langkah Penyelesaian:
1. Luas total lahan persegi panjang = panjang x lebar = 12 m x 8 m = 96 m².
2. Diameter kolam d = 4 m, maka jari-jari r = 2 m.
   Luas kolam lingkaran = π x r² = 3,14 x 2² = 3,14 x 4 = 12,56 m².
3. Luas area paving block = Luas total - Luas kolam
   = 96 m² - 12,56 m² = 83,44 m².
Kunci Jawaban: A.`
          },
          {
            number: 5,
            type: "pgk",
            competency: "Perhitungan keliling dan kebutuhan paving block",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Pilihlah seluruh pernyataan berikut yang SESUAI dengan rancangan kebun sekolah (Jawaban benar lebih dari satu):",
            options: [
              { key: "A", text: "Panjang kawat pagar yang diperlukan untuk mengelilingi tepian luar lahan adalah 40 meter." },
              { key: "B", text: "Luas satu keping paving block berukuran 40 cm x 40 cm adalah 0,16 m²." },
              { key: "C", text: "Keliling kolam ikan lingkaran di bagian tengah adalah 12,56 meter." },
              { key: "D", text: "Total paving block yang diperlukan adalah kurang dari 400 keping." }
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: `Analisis:
- A: Keliling luar = 2 x (12 + 8) = 2 x 20 = 40 meter. (BENAR)
- B: Ukuran paving 40 cm = 0,4 m. Luas = 0,4 x 0,4 = 0,16 m². (BENAR)
- C: Keliling lingkaran = π x d = 3,14 x 4 m = 12,56 meter. (BENAR)
- D: Kebutuhan paving = 83,44 m² / 0,16 m² ≈ 522 keping (lebih dari 400, maka opsi D SALAH).
Jawaban benar: A, B, C.`
          },
          {
            number: 6,
            type: "sts",
            competency: "Klasifikasi pernyataan operasional proyek",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Tentukan apakah pernyataan mengenai kebutuhan anggaran proyek kebun berikut SESUAI atau TIDAK SESUAI dengan data!",
            statements: [
              { id: "s1", text: "Jika harga kawat pagar Rp35.000/meter, maka total biaya kawat pagar luar adalah Rp1.400.000,00.", answer: "Sesuai" },
              { id: "s2", text: "Kebutuhan paving block untuk area 83,44 m² mencapai lebih dari 500 keping.", answer: "Sesuai" },
              { id: "s3", text: "Luas kolam ikan lebih besar daripada seperempat luas total lahan.", answer: "Tidak Sesuai" }
            ],
            correctAnswer: { "s1": "Sesuai", "s2": "Sesuai", "s3": "Tidak Sesuai" },
            explanation: `Pembahasan:
- s1: 40 m x Rp35.000 = Rp1.400.000,00 (Sesuai).
- s2: 83,44 / 0,16 = 521,5 -> butuh setidaknya 522 keping (Sesuai).
- s3: Seperempat lahan = 96 / 4 = 24 m². Kolam hanya 12,56 m², jadi lebih kecil bukan lebih besar (Tidak Sesuai).`
          }
        ]
      }
    ]
  },

  // 2. BAHASA INDONESIA KELAS 5
  {
    id: "ind-kls5-paket1",
    title: "Asesmen TKA Bahasa Indonesia - Literasi Membaca & Teks Informasi",
    subject: "Bahasa Indonesia",
    subjectCode: "IND",
    grade: "Kelas 5 & 6 SD/MI",
    academicYear: "2026/2027",
    timeLimitMinutes: 60,
    competencySummary: "Menemukan informasi tersurat & tersirat, ide pokok paragraf, makna ungkapan figuratif, amanat cerita fabel, dan analisis infografis kesehatan.",
    createdAt: "2026-11-10",
    stimulusGroups: [
      {
        stimulusId: "stimulus-ind-1",
        title: "Perjuangan Arka dan Perpustakaan Apung di Muara Sungai",
        type: "Teks Narasi Cerita Anak",
        content: `Matahari pagi belum genap menyinari muara Sungai Barito ketika Arka (11 tahun) telah bersiap di perahu kayunya. Di bagian haluan perahu, tersusun rapi puluhan buku cerita bergambar, ensiklopedia sains anak, dan majalah edukasi yang dibungkus plastik bening kedap air. Perahu sederhana itu dijuluki anak-anak pesisir sebagai 'Perpustakaan Apung Bahari'.

Setiap hari Sabtu, Arka bersama kakeknya mendayung perahu menyusuri perkampungan nelayan yang terpencil dari perpustakaan umum kota. Anak-anak di dermaga kayu menyambut kedatangan perahu Arka dengan sorak gembira. Mereka rela meninggalkan permainan gasing demi membaca kisah penjelajah samudra dan misteri antariksa.

"Membaca buku adalah jendela melihat megahnya dunia dari atas perahu kecil kita," ucap Arka seraya menyerahkan buku fabel kepada seorang anak pemalu bernama Bima. Arka tidak pernah memungut biaya sepeser pun. Baginya, melihat binar mata sahabat-sahabatnya saat berhasil membaca lancar adalah upah yang tak ternilai harganya.`,
        questions: [
          {
            number: 1,
            type: "pg",
            competency: "Menentukan informasi tersurat dalam cerita naratif",
            cognitiveLevel: "L1 - Pemahaman",
            prompt: "Berdasarkan kutipan teks di atas, mengapa buku-buku di perahu Arka dibungkus menggunakan plastik bening kedap air?",
            options: [
              { key: "A", text: "Agar tampak mewah dan disukai anak-anak pesisir" },
              { key: "B", text: "Untuk melindungi buku dari cipratan air saat perahu berlayar di muara sungai" },
              { key: "C", text: "Supaya buku tidak mudah dipinjam oleh anak-anak dermaga" },
              { key: "D", text: "Sebagai penanda bahwa buku-buku tersebut adalah buku baru yang dijual" }
            ],
            correctAnswer: "B",
            explanation: `Informasi Tersurat:
Buku dibungkus plastik bening kedap air karena dioperasikan di atas perahu kayu di muara sungai yang rawan terkena cipratan air. Pilihan B secara tepat merefleksikan fungsi kedap air di lingkungan air/muara.
Kunci Jawaban: B.`
          },
          {
            number: 2,
            type: "pgk",
            competency: "Menganalisis watak dan nilai karakter tokoh",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Sikap dan nilai kebajikan apa sajakah yang dapat diteladani dari sosok Arka? (Pilihlah semua jawaban yang benar):",
            options: [
              { key: "A", text: "Rela berkorban waktu dan tenaga demi mencerdaskan anak-anak di lingkungannya" },
              { key: "B", text: "Ikhlas menolong sesama tanpa mengharapkan imbalan materi" },
              { key: "C", text: "Memiliki rasa cinta literasi yang tinggi dan mau membagikannya" },
              { key: "D", text: "Memanfaatkan minat baca anak-anak untuk mencari keuntungan komersial" }
            ],
            correctAnswer: ["A", "B", "C"],
            explanation: `Analisis Nilai Moral:
Arka digambarkan tidak memungut biaya (ikhlas - B), mengorbankan hari Sabtu untuk mendayung perahu (rela berkorban - A), dan menyebarkan kecintaan membaca (cinta literasi - C). Opsi D bertentangan dengan isi bacaan.
Jawaban Benar: A, B, C.`
          },
          {
            number: 3,
            type: "sts",
            competency: "Klasifikasi kesesuaian informasi berdasarkan teks",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Tentukan apakah pernyataan berikut SESUAI atau TIDAK SESUAI dengan isi cerita!",
            statements: [
              { id: "s1", text: "Perahu pustaka Arka berlayar menyusuri daerah perkampungan nelayan setiap hari Sabtu.", answer: "Sesuai" },
              { id: "s2", text: "Anak-anak pesisir menolak membaca dan lebih memilih terus bermain gasing di dermaga.", answer: "Tidak Sesuai" },
              { id: "s3", text: "Arka didampingi oleh kakeknya ketika mendayung perahu perpustakaan apung.", answer: "Sesuai" }
            ],
            correctAnswer: { "s1": "Sesuai", "s2": "Tidak Sesuai", "s3": "Sesuai" },
            explanation: `Verifikasi Fakta:
- s1: Sesuai, disebutkan pada paragraf 2: 'Setiap hari Sabtu, Arka bersama kakeknya mendayung perahu...'
- s2: Tidak Sesuai, teks menyebutkan: 'Mereka rela meninggalkan permainan gasing demi membaca...'
- s3: Sesuai, disebutkan Arka bersama kakeknya.`
          }
        ]
      },
      {
        stimulusId: "stimulus-ind-2",
        title: "Infografis Pedoman 'Isi Piringku' untuk Daya Tahan Tubuh Siswa",
        type: "Teks Informasi & Infografis Kesehatan",
        content: `Kementerian Kesehatan Republik Indonesia mengampanyekan pedoman makan sehat bergizi seimbang bertajuk 'Isi Piringku'. Pedoman ini menggantikan konsep lama 4 Sehat 5 Sempurna dengan membagi satu piring makan menjadi porsi seimbang:

1. Makanan Pokok (2/3 dari setengah piring): Sumber karbohidrat kompleks seperti nasi merah, jagung, ubi, atau singkong sebagai penghasil energi utama belajar.
2. Lauk Pauk (1/3 dari setengah piring): Sumber protein hewani dan nabati seperti ikan kembung, telur, tempe, tahu, atau daging untuk pertumbuhan sel dan kecerdasan otak.
3. Sayur-Sayuran (2/3 dari setengah piring): Sumber serat, vitamin A, C, dan mineral untuk menjaga saluran cerna dan imunitas tubuh.
4. Buah-Buahan (1/3 dari setengah piring): Sumber antioksidan alami seperti pisang, pepaya, jeruk, atau apel.

Disertai dengan minum air putih minimal 8 gelas per hari, mencuci tangan memakai sabun selama 20 detik, dan melakukan aktivitas fisik aktif minimal 30 menit setiap hari.`,
        svgDiagram: `<svg viewBox="0 0 320 200" class="w-full max-w-xs mx-auto my-2 rounded bg-amber-50/50 p-2 border border-amber-200">
          <text x="160" y="22" text-anchor="middle" font-size="12" font-weight="bold" fill="#92400e">Komposisi Piring Sehat Siswa</text>
          <!-- Outer Plate Circle -->
          <circle cx="160" cy="110" r="75" fill="#fef3c7" stroke="#d97706" stroke-width="3"/>
          <line x1="85" y1="110" x2="235" y2="110" stroke="#b45309" stroke-width="2"/>
          <line x1="160" y1="110" x2="215" y2="55" stroke="#b45309" stroke-width="1.5"/>
          <line x1="160" y1="110" x2="105" y2="165" stroke="#b45309" stroke-width="1.5"/>
          <!-- Labels -->
          <text x="125" y="85" font-size="10" font-weight="bold" fill="#047857">Sayuran (33%)</text>
          <text x="195" y="85" font-size="9" fill="#c2410c">Buah (17%)</text>
          <text x="110" y="140" font-size="10" font-weight="bold" fill="#b45309">Makanan Pokok</text>
          <text x="180" y="140" font-size="9" fill="#1d4ed8">Lauk Pauk</text>
        </svg>`,
        questions: [
          {
            number: 4,
            type: "pg",
            competency: "Menemukan ide pokok teks eksplanasi ilmiah",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Apakah gagasan pokok yang ingin disampaikan melalui pedoman 'Isi Piringku' di atas?",
            options: [
              { key: "A", text: "Imbauan agar siswa berhenti mengonsumsi nasi dan beralih ke roti" },
              { key: "B", text: "Panduan pembagian proporsi porsi makan seimbang dan pola hidup bersih bagi kesehatan tubuh" },
              { key: "C", text: "Aturan bahwa lauk pauk hewani harus selalu lebih banyak daripada sayuran" },
              { key: "D", text: "Kewajiban membeli buah-buahan impor setiap sarapan pagi" }
            ],
            correctAnswer: "B",
            explanation: `Gagasan Pokok:
Pedoman Isi Piringku menyampaikan proporsi pembagian piring makan (makanan pokok, sayur, lauk pauk, buah) yang seimbang serta pendukung gaya hidup sehat (air putih, cuci tangan, aktivitas fisik).
Kunci Jawaban: B.`
          },
          {
            number: 5,
            type: "pgk",
            competency: "Interpretasi rincian nutrisi berdasarkan teks",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Berdasarkan pedoman tersebut, manakah menu sarapan siswa yang MEMENUHI proporsi seimbang? (Pilihlah semua yang tepat):",
            options: [
              { key: "A", text: "Nasi ubi, sayur bayam bening, sepotong ikan kembung bakar, dan pisang kepok" },
              { key: "B", text: "Mie instan kuah campur nasi putih tanpa sayuran dan tanpa buah" },
              { key: "C", text: "Nasi merah, tumis buncis wortel, tempe goreng bacem, telur rebus, dan sepotong pepaya" },
              { key: "D", text: "Tiga mangkuk kerupuk udang saja dengan teh manis" }
            ],
            correctAnswer: ["A", "C"],
            explanation: `Kesesuaian Nutrisi:
- Opsi A dan C memenuhi seluruh komponen (karbohidrat komplek, sayur, protein, dan buah).
- Opsi B dan D hanya karbohidrat/lemak tanpa sayuran dan protein seimbang.
Jawaban Benar: A dan C.`
          },
          {
            number: 6,
            type: "mtm",
            competency: "Mengevaluasi apakah argumen mendukung klaim kesehatan",
            cognitiveLevel: "L3 - Penalaran",
            prompt: "Evaluasi apakah setiap argumen siswa berikut MENDUKUNG atau TIDAK MENDUKUNG prinsip pedoman 'Isi Piringku'!",
            statements: [
              { id: "s1", text: "Mencuci tangan 20 detik sebelum makan mencegah kuman patogen masuk ke saluran pencernaan.", answer: "Mendukung" },
              { id: "s2", text: "Menghilangkan porsi sayuran dan menggantinya dengan suplemen pil instan setiap hari.", answer: "Tidak Mendukung" },
              { id: "s3", text: "Meluangkan waktu 30 menit jalan santai atau bersepeda setiap sore memperlancar metabolisme tubuh.", answer: "Mendukung" }
            ],
            correctAnswer: { "s1": "Mendukung", "s2": "Tidak Mendukung", "s3": "Mendukung" },
            explanation: `Analisis Argumen:
- s1: Mendukung kebersihan sanitasi yang dianjurkan.
- s2: Tidak mendukung karena sayuran asli memberikan serat alami dan fitonutrien yang tidak dapat digantikan sempurna oleh pil.
- s3: Mendukung anjuran aktivitas fisik minimal 30 menit.`
          }
        ]
      }
    ]
  },

  // 3. IPAS KELAS 5
  {
    id: "ipas-kls5-paket1",
    title: "Asesmen TKA IPAS - Rantai Makanan & Energi Ekosistem Nusantara",
    subject: "IPAS",
    subjectCode: "IPAS",
    grade: "Kelas 5 & 6 SD/MI",
    academicYear: "2026/2027",
    timeLimitMinutes: 45,
    competencySummary: "Keseimbangan ekosistem sawah, peran produsen, konsumen primer, sekunder, puncak, serta dekomposer.",
    createdAt: "2026-11-10",
    stimulusGroups: [
      {
        stimulusId: "stimulus-ipas-1",
        title: "Dilema Petani Desa Sukamaju: Hilangnya Ular Sawah dan Serangan Tikus",
        type: "Kasus Ekosistem Kontekstual",
        content: `Petani di Desa Sukamaju mengalami gagal panen padi dalam dua musim terakhir akibat ledakan populasi hama tikus. Berdasarkan penelusuran penyuluh pertanian, penurunan drastis populasi ular sawah dan burung hantu di daerah tersebut menjadi pemicu utama. 

Sebelumnya, sebagian warga memburu ular sawah secara berlebihan untuk dijual kulitnya dan menangkap burung hantu untuk dipelihara. Rantai makanan alami di sawah tersebut semula berjalan seimbang: Tanaman Padi (Produsen) dimakan oleh Tikus (Konsumen I), Tikus dimangsa oleh Ular Sawah (Konsumen II), dan Ular dimangsa oleh Elang Jawa atau Burung Hantu (Konsumen Puncak). Sisa kotoran dan bangkai diuraikan oleh bakteri tanah (Pengurai) menjadi unsur hara yang menyuburkan padi kembali.`,
        questions: [
          {
            number: 1,
            type: "pg",
            competency: "Menentukan peran organisme dalam rantai makanan",
            cognitiveLevel: "L1 - Pemahaman",
            prompt: "Berdasarkan stimulus di atas, apakah peran utama tanaman padi dan bakteri tanah dalam jaring-jaring kehidupan sawah?",
            options: [
              { key: "A", text: "Padi sebagai konsumen puncak dan bakteri sebagai produsen" },
              { key: "B", text: "Padi sebagai produsen dan bakteri sebagai dekomposer (pengurai)" },
              { key: "C", text: "Padi sebagai parasit dan bakteri sebagai konsumen primer" },
              { key: "D", text: "Padi dan bakteri sama-sama berperan sebagai predator alami" }
            ],
            correctAnswer: "B",
            explanation: `Padi mampu berfotosintesis menghasilkan makanan sendiri (Produsen), sedangkan bakteri tanah menguraikan sisa zat organik menjadi mineral tanah (Pengurai / Dekomposer). Kunci Jawaban: B.`
          },
          {
            number: 2,
            type: "pgk",
            competency: "Memprediksi dampak ketidakseimbangan rantai makanan",
            cognitiveLevel: "L3 - Penalaran",
            prompt: "Langkah pelestarian ramah lingkungan apa sajakah yang tepat dilakukan petani untuk memulihkan ekosistem sawah tanpa racun kimia berbahaya? (Pilihlah semua yang tepat):",
            options: [
              { key: "A", text: "Membangun rumah burung hantu (rubuha) di sekitar area persawahan sebagai predator alami tikus" },
              { key: "B", text: "Membuat peraturan desa yang melarang perburuan liar satwa pemangsa seperti ular sawah" },
              { key: "C", text: "Menyemprotkan racun kimia berkadar tinggi yang dapat meracuni air irigasi desa" },
              { key: "D", text: "Melakukan gropyokan tikus secara gotong royong dan menjaga kebersihan pematang sawah" }
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: `Solusi Ekologis:
Membangun rumah burung hantu (A), regulasi larangan berburu predator (B), dan gropyokan mekanis gotong royong (D) adalah metode PHT (Pengendalian Hama Terpadu) yang aman. Penggunaan racun kimia pekat (C) merusak air dan tanah.
Jawaban Benar: A, B, D.`
          },
          {
            number: 3,
            type: "bs",
            competency: "Evaluasi prinsip energi ekosistem",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Tentukan kebenaran pernyataan ekologis berikut berdasarkan stimulus ekosistem sawah!",
            statements: [
              { id: "s1", text: "Populasi tikus meningkat drastis karena pemangsa alaminya (ular sawah dan burung hantu) berkurang.", answer: "Benar" },
              { id: "s2", text: "Jika elang jawa punah, maka populasi tanaman padi akan langsung otomatis meningkat berkali-kali lipat.", answer: "Salah" },
              { id: "s3", text: "Energi kimia dalam rantai makanan tersebut mengalir dari padi ke tikus, lalu ke ular sawah.", answer: "Benar" }
            ],
            correctAnswer: { "s1": "Benar", "s2": "Salah", "s3": "Benar" },
            explanation: `Pembahasan:
- s1: Benar, hilangnya kontrol populasi menyebabkan ledakan hama.
- s2: Salah, kepunahan predator puncak tidak langsung menaikkan tanaman padi, justru menurunkan padi jika tikus makin tak terkendali.
- s3: Benar, aliran energi bergerak dari tingkat trofik produsen ke konsumen berikutnya.`
          }
        ]
      }
    ]
  },

  // 4. PENDIDIKAN PANCASILA
  {
    id: "pan-kls5-paket1",
    title: "Asesmen TKA Pendidikan Pancasila - Norma, Hak, dan Toleransi NKRI",
    subject: "Pendidikan Pancasila",
    subjectCode: "PAN",
    grade: "Kelas 5 & 6 SD/MI",
    academicYear: "2026/2027",
    timeLimitMinutes: 45,
    competencySummary: "Penerapan sila Pancasila dalam musyawarah, pemenuhan hak dan kewajiban anak, serta keragaman budaya.",
    createdAt: "2026-11-10",
    stimulusGroups: [
      {
        stimulusId: "stimulus-pan-1",
        title: "Musyawarah Pemilihan Ketua Kelas 5 SD Kebangsaan",
        type: "Studi Kasus Kehidupan Sekolah",
        content: `Di kelas 5 SD Kebangsaan, murid-murid bersama wali kelas Ibu Ratna mengadakan musyawarah mufakat untuk memilih ketua kelas baru. Terdapat dua calon yang diusulkan oleh teman-temannya, yaitu Wayan yang berasal dari Bali dan Siti yang berasal dari Jawa Barat. 

Sebelum pemungutan suara, kedua calon memaparkan ide program kelas, seperti piket kebersihan taman dan pojok baca. Ketika musyawarah berlangsung, seluruh siswa diberikan kesempatan berbicara secara sopan tanpa disela. Setelah melalui pertimbangan bersama, seluruh kelas menyepakati Siti sebagai ketua kelas dan Wayan sebagai wakil ketua kelas. Seluruh siswa menerima hasil keputusan tersebut dengan lapang dada dan berkomitmen menjalankan tugas bersama.`,
        questions: [
          {
            number: 1,
            type: "pg",
            competency: "Mengidentifikasi pengamalan sila Pancasila",
            cognitiveLevel: "L1 - Pemahaman",
            prompt: "Kegiatan musyawarah mufakat dengan mendengarkan pendapat teman secara santun merupakan pencerminan luhur dari sila Pancasila ke-...",
            options: [
              { key: "A", text: "Pertama (Ketuhanan Yang Maha Esa)" },
              { key: "B", text: "Kedua (Kemanusiaan yang Adil dan Beradab)" },
              { key: "C", text: "Ketiga (Persatuan Indonesia)" },
              { key: "D", text: "Keempat (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan dalam Permusyawaratan/Perwakilan)" }
            ],
            correctAnswer: "D",
            explanation: `Musyawarah mufakat untuk mengambil keputusan bersama demi kepentingan kolektif adalah nilai inti dari Sila Ke-4 Pancasila. Kunci: D.`
          },
          {
            number: 2,
            type: "pgk",
            competency: "Menganalisis sikap demokratis dan berjiwa besar",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Sikap positif apa sajakah yang ditunjukkan oleh para siswa kelas 5 SD Kebangsaan? (Pilih semua jawaban benar):",
            options: [
              { key: "A", text: "Menghormati hak bicara teman saat menyampaikan pendapat" },
              { key: "B", text: "Menerima hasil keputusan musyawarah dengan ikhlas dan penuh tanggung jawab" },
              { key: "C", text: "Hanya mau berteman dengan calon yang berasal dari suku daerah yang sama" },
              { key: "D", text: "Bekerja sama menyukseskan program kelas tanpa membeda-bedakan latar belakang" }
            ],
            correctAnswer: ["A", "B", "D"],
            explanation: `Sikap menghormati hak bicara (A), menerima keputusan mufakat (B), dan kerja sama inklusif (D) mencerminkan kebajikan Pancasila. Opsi C adalah sikap diskriminatif yang bertentangan dengan semboyan Bhinneka Tunggal Ika.`
          },
          {
            number: 3,
            type: "bs",
            competency: "Hak dan kewajiban warga kelas",
            cognitiveLevel: "L2 - Penerapan",
            prompt: "Tentukan kebenaran pernyataan mengenai hak dan kewajiban di lingkungan sekolah berikut!",
            statements: [
              { id: "s1", text: "Menyampaikan pendapat dalam musyawarah adalah salah satu bentuk pemenuhan hak siswa di kelas.", answer: "Benar" },
              { id: "s2", text: "Melaksanakan tugas piket kebersihan kelas dengan penuh tanggung jawab adalah kewajiban setiap siswa.", answer: "Benar" },
              { id: "s3", text: "Siswa yang pendapatnya tidak terpilih dalam musyawarah berhak menolak menjalankan keputusan bersama.", answer: "Salah" }
            ],
            correctAnswer: { "s1": "Benar", "s2": "Benar", "s3": "Salah" },
            explanation: `Pembahasan:
- s1: Hak setiap anggota musyawarah untuk berpendapat (Benar).
- s2: Kewajiban menjaga kebersihan fasilitas bersama (Benar).
- s3: Salah, asas musyawarah mewajibkan semua pihak menghormati dan menjalankan keputusan bersama.`
          }
        ]
      }
    ]
  }
];
