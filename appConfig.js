/**
 * KELAS 5 JUARA - TKA GURU
 * App Configuration & Pusmendik Assessment Matrices
 */

export const APP_CONFIG = {
  appName: "KELAS 5 JUARA",
  appSubtitle: "AI-Powered TKA Question Generator & Interactive Exam Platform",
  version: "2.5.0",
  targetGradeDefault: "Kelas 5 & 6 SD/MI",
  institution: "Pusat Asesmen Pendidikan (Pusmendik) Kemendikdasmen RI",
  geminiModel: "gemini-3.8-flash",
  subjects: [
    {
      id: "matematika",
      name: "Matematika",
      code: "MAT",
      color: "blue",
      badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
      icon: "Calculator",
      defaultQuestions: 40,
      description: "Bilangan cacah, pecahan, perbandingan, bangun datar/ruang, pengukuran, dan pengolahan data kontekstual.",
      sampleMatrix: `KISI-KISI / MATRIKS ASESMEN MATEMATIKA KELAS 5:
1. Bilangan Cacah & Desimal: Operasi hitung campuran bilangan cacah besar (hingga 100.000) dan desimal dalam masalah jual beli.
2. Pecahan & Persen: Penjumlahan, pengurangan, dan perkalian pecahan biasa, campuran, dan persen pada resep masakan & diskon belanja.
3. Perbandingan & Skala: Menghitung jarak sebenarnya dan skala denah lokasi/peta lingkungan sekolah.
4. Pengukuran Luas & Keliling: Keliling dan luas gabungan bangun datar (persegi panjang, segitiga, trapesium) pada denah kebun.
5. Bangun Ruang: Menentukan volume kubus dan balok pada kemasan wadah air dan kardus barang.
6. Pengolahan Data & Statistik: Membaca, menganalisis, dan menarik kesimpulan dari tabel frekuensi, diagram batang, dan diagram lingkaran penjualan koperasi.`
    },
    {
      id: "bahasa_indonesia",
      name: "Bahasa Indonesia",
      code: "IND",
      color: "emerald",
      badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
      icon: "BookOpen",
      defaultQuestions: 40,
      description: "Literasi membaca, menemukan informasi tersurat/tersirat, ide pokok, teks eksplanasi, prosedur, dan infografis.",
      sampleMatrix: `KISI-KISI / MATRIKS ASESMEN BAHASA INDONESIA KELAS 5:
1. Informasi Tersurat & Tersirat: Menemukan fakta spesifik dan menyimpulkan informasi tersembunyi dari teks narasi/cerita anak nusantara.
2. Ide Pokok & Gagasan Pendukung: Menentukan ide pokok paragraf utama pada teks eksplanasi fenomena alam (daur air dan gunung meletus).
3. Makna Kata & Ungkapan Kontekstual: Mengartikan istilah teknis dan ungkapan figuratif berdasarkan konteks kalimat.
4. Amanat & Nilai Kehidupan: Menganalisis keteladanan watak tokoh dan nilai moral dalam cerita fabel/cerpen budi pekerti.
5. Teks Prosedur & Petunjuk Kerja: Mengevaluasi urutan langkah-langkah pembuatan karya daur ulang sampah plastik.
6. Literasi Visual & Infografis: Menginterpretasikan hubungan data grafis dengan teks pendamping pada poster hemat energi dan pola hidup sehat.`
    },
    {
      id: "ipas",
      name: "IPAS (Sains & Sosial)",
      code: "IPAS",
      color: "teal",
      badgeColor: "bg-teal-100 text-teal-800 border-teal-200",
      icon: "Compass",
      defaultQuestions: 30,
      description: "Ekosistem, energi terbarukan, organ tubuh manusia, keragaman budaya nusantara, dan kegiatan ekonomi.",
      sampleMatrix: `KISI-KISI ASESMEN IPAS KELAS 5:
1. Harmoni dalam Ekosistem: Jaring-jaring makanan, rantai makanan, dan dampak perburuan liar terhadap keseimbangan habitat sawah/hutan.
2. Cahaya dan Bunyi: Sifat-sifat perambatan cahaya (pemantulan, pembiasan) serta mekanisme indra pendengaran manusia.
3. Peta dan Warisan Budaya: Menentukan letak geografis provinsi di Indonesia dan mengidentifikasi kearifan lokal rumah adat/tradisi daerah.
4. Kegiatan Ekonomi Masyarakat: Jenis usaha agraris, maritim, industri kreatif, serta peran Badan Usaha Milik Desa (BUMDes).`
    },
    {
      id: "pendidikan_pancasila",
      name: "Pendidikan Pancasila",
      code: "PAN",
      color: "amber",
      badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
      icon: "ShieldCheck",
      defaultQuestions: 30,
      description: "Penerapan sila-sila Pancasila, hak dan kewajiban warga negara, norma masyarakat, dan keberagaman NKRI.",
      sampleMatrix: `KISI-KISI ASESMEN PENDIDIKAN PANCASILA KELAS 5:
1. Nilai-Nilai Luhur Pancasila: Contoh penerapan Sila 1 s.d. Sila 5 dalam kehidupan bermusyawarah di lingkungan rukun tetangga dan kelas.
2. Norma dan Aturan: Membedakan norma agama, kesusilaan, kesopanan, dan hukum dalam kehidupan sehari-hari di sekolah dan masyarakat.
3. Hak dan Kewajiban: Keseimbangan hak dan kewajiban anak sebagai anggota keluarga, murid di sekolah, dan warga masyarakat.
4. Menghargai Keragaman: Sikap toleransi dan gotong royong menghadapi perbedaan suku, agama, dan latar belakang budaya di Indonesia.`
    },
    {
      id: "padb",
      name: "PADB (Agama & Budi Pekerti)",
      code: "AGM",
      color: "purple",
      badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
      icon: "HeartHandshake",
      defaultQuestions: 30,
      description: "Ketakwaan kepada Tuhan YME, akhlak terpuji, kisah teladan, kejujuran, dan persaudaraan sesama manusia.",
      sampleMatrix: `KISI-KISI ASESMEN PADB KELAS 5:
1. Keimanan & Rasa Syukur: Memahami keagungan ciptaan Tuhan melalui fenomena alam semesta dan nikmat kesehatan.
2. Akhlak Mulia (Budi Pekerti): Perilaku jujur dalam perkataan dan perbuatan, amanah menjaga titipan, serta sikap berbakti kepada orang tua dan guru.
3. Kisah Teladan: Mengambil ibrah dari kisah kepemimpinan yang adil dan perjuangan tokoh teladan dalam menebar kedamaian.
4. Moderasi Beragama: Menghormati teman yang berbeda keyakinan saat beribadah dan bekerja sama dalam kegiatan sosial kemanusiaan.`
    },
    {
      id: "bahasa_inggris",
      name: "Bahasa Inggris",
      code: "ENG",
      color: "indigo",
      badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
      icon: "Globe",
      defaultQuestions: 30,
      description: "Reading comprehension, daily routines, descriptive text, school activities, and functional notices.",
      sampleMatrix: `KISI-KISI ASESMEN BAHASA INGGRIS KELAS 5:
1. Daily Activities & Telling Time: Identifying specific information about daily morning routines and exact clock schedules.
2. Describing People & Animals: Understanding adjectives of appearance, personality traits, and physical characteristics in short descriptive passages.
3. Food, Beverages & Prices: Dialogue analysis about ordering healthy meals in a canteen and calculating small grocery bills.
4. School Environment & Short Notices: Reading functional signs, library rules, and simple classroom announcements.`
    },
    {
      id: "pjok",
      name: "PJOK",
      code: "PJK",
      color: "orange",
      badgeColor: "bg-orange-100 text-orange-800 border-orange-200",
      icon: "Activity",
      defaultQuestions: 30,
      description: "Gerak dasar lokomotor/non-lokomotor, kebugaran jasmani, permainan bola, senam lantai, dan kesehatan diri.",
      sampleMatrix: `KISI-KISI ASESMEN PJOK KELAS 5:
1. Pola Gerak Dasar Permainan Bola: Kombinasi gerak melempar, menangkap, dan menggiring bola pada sepak bola dan bola kasti.
2. Kebugaran Jasmani: Komponen kelenturan, daya tahan jantung, dan latihan kelincahan (shuttle run) serta pengukurannya.
3. Senam Lantai & Gerak Berirama: Langkah tegap, ayunan lengan, dan teknik berguling ke depan dengan awalan jongkok yang aman.
4. Pemeliharaan Kebersihan Diri & Gizi Seimbang: Mengenal makanan bergizi 4 sehat 5 sempurna dan bahaya jajan sembarangan.`
    },
    {
      id: "seni_rupa",
      name: "Seni Rupa",
      code: "SNR",
      color: "rose",
      badgeColor: "bg-rose-100 text-rose-800 border-rose-200",
      icon: "Palette",
      defaultQuestions: 30,
      description: "Unsur rupa (titik, garis, bidang, warna), prinsip proporsi, ragam hias nusantara, teknik melukis dan daur ulang.",
      sampleMatrix: `KISI-KISI ASESMEN SENI RUPA KELAS 5:
1. Unsur dan Prinsip Seni Rupa: Mengenal warna primer, sekunder, dan komplementer serta ritme/keseimbangan dalam komposisi visual.
2. Ragam Hias Tradisional Nusantara: Mengidentifikasi motif geometris dan flora-fauna pada kain batik serta ukiran daerah.
3. Menggambar Ilustrasi & Perspektif: Prinsip dasar proporsi tubuh dan sudut pandang benda di sekitar lingkungan sekolah.
4. Karya Kriya & Daur Ulang: Langkah-langkah pembuatan karya tiga dimensi (3D) dari bahan bubur kertas dan botol bekas.`
    },
    {
      id: "bahasa_sunda",
      name: "Bahasa Sunda",
      code: "SND",
      color: "cyan",
      badgeColor: "bg-cyan-100 text-cyan-800 border-cyan-200",
      icon: "Languages",
      defaultQuestions: 30,
      description: "Maca wacana carita pondok, pupuh/sajak Sunda, undak-usuk basa (lemes/loma), istilah tradisi, dan kawih.",
      sampleMatrix: `KISI-KISI ASESMEN BAHASA SUNDA KELAS 5:
1. Maham Eusi Carita: Nangtukeun fakta carita, watek palaku, jeung kasang tukang waktu/tempat dina carita babaturan sakola.
2. Undak-Usuk Basa Sunda: Ngalarapkeun ragam basa loma jeung basa hormat (lemes ka sorangan jeung lemes ka batur) dina kalimah.
3. Kaulinan Tradisional & Babasan: Mikawanoh rupa-rupa kaulinan barudak Sunda (oray-orayan, boy-boyan) jeung hartina babasan/paribasa.
4. Pupuh & Sajak: Nganalisis padalisan, guru lagu, guru wilangan pupuh Asmarandana/Kinanti sarta amanat eusi pupuh.`
    }
  ],
  questionTypes: [
    { id: "pg", label: "Pilihan Ganda Tunggal", desc: "1 jawaban benar dari 4 opsi (A, B, C, D)" },
    { id: "pgk", label: "Pilihan Ganda Kompleks", desc: "Bisa memilih lebih dari 1 jawaban yang benar" },
    { id: "bs", label: "Benar / Salah", desc: "Menilai kebenaran beberapa pernyataan berdasarkan stimulus" },
    { id: "sts", label: "Sesuai / Tidak Sesuai", desc: "Mengklasifikasikan kesesuaian data dengan bacaan" },
    { id: "mtm", label: "Mendukung / Tidak Mendukung", desc: "Mengevaluasi apakah argumen mendukung premis" }
  ]
};

export default APP_CONFIG;
