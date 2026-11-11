# KELAS 5 JUARA — TKA GURU
### AI-Powered TKA Question Generator & Interactive Exam Platform
**Standar Resmi Pusat Asesmen Pendidikan (Pusmendik) Kemendikdasmen RI**

---

## 🌟 Tentang Aplikasi
**KELAS 5 JUARA** adalah platform berbasis AI terdepan yang dirancang khusus untuk membantu guru SD/MI menyusun naskah latihan Tes Kemampuan Akademik (TKA) berstandar HOTS (High Order Thinking Skills) secara otomatis hanya dengan memasukkan kisi-kisi materi.

Mendukung 9 mata pelajaran lengkap:
1. **Matematika** (Numerasi kontekstual, operasi hitung, pecahan, geometri, data)
2. **Bahasa Indonesia** (Literasi membaca, teks eksplanasi, prosedur, infografis)
3. **PADB** (Pendidikan Agama dan Budi Pekerti)
4. **Pendidikan Pancasila** (Norma, hak/kewajiban, musyawarah, toleransi NKRI)
5. **IPAS** (Ilmu Pengetahuan Alam dan Sosial)
6. **Seni Rupa** (Unsur rupa, ragam hias nusantara, kriya 3D)
7. **PJOK** (Pola gerak dasar, kebugaran jasmani, kesehatan gizi)
8. **Bahasa Inggris** (Reading comprehension, daily routines, notices)
9. **Bahasa Sunda** (Carita pondok, pupuh, undak-usuk basa lemes/loma)

### Fitur Unggulan:
- **Kaidah Emas Pusmendik**: 1 Stimulus bermakna untuk 3 butir pertanyaan bertingkat.
- **Variasi Tipe Soal Terpadu**: Pilihan Ganda (PG), Pilihan Ganda Kompleks (PGK), Benar/Salah (B/S), Sesuai/Tidak Sesuai (STS), dan Mendukung/Tidak Mendukung (MTM).
- **Deteksi Otomatis & Pemisahan Ganda**: Jika memasukkan kisi-kisi 2 mata pelajaran sekaligus, sistem otomatis memisahkan menjadi 2 paket ujian independen.
- **Mode Naskah Cetak A4**: Format dokumen PDF resmi siap cetak lengkap dengan Kop Surat Kemendikdasmen dan opsi kunci jawaban terpisah.
- **Mode Ujian Interaktif Siswa**: Dilengkapi timer waktu nyata, navigasi nomor soal, penanda ragu-ragu, dan panel stimulus berdampingan.
- **Analisis & Pembahasan Otomatis**: Menampilkan skor, predikat juara, langkah hitung matematika, rujukan teks, dan rekomendasi program remediasi.
- **File HTML Mandiri (Offline Ready)**: File `TKA_GURU.html` dapat dibuka langsung tanpa instalasi apapun di browser manapun.

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### Prasyarat
- **Node.js** (Versi 18 atau lebih baru)
- **NPM** atau **PNPM** / **Yarn**

### Langkah-Langkah:
1. **Clone atau Ekstrak Proyek**
   ```bash
   git clone <repo-url>
   cd kelas-5-juara
   ```

2. **Instal Dependensi**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment**
   Salin file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   Buka file `.env` dan masukkan API Key Gemini Anda:
   ```env
   GEMINI_API_KEY="AIzaSy..."
   PORT=3000
   ```
   *(Catatan: Aplikasi tetap dapat berjalan dengan mesin sintesis cerdas bawaan jika API Key belum dipasang).*

4. **Jalankan Server Development**
   ```bash
   npm run dev
   ```
   Akses aplikasi di browser melalui: `http://localhost:3000`.

5. **Build untuk Produksi**
   ```bash
   npm run build
   npm start
   ```

---

## 🌐 Panduan Deployment di cPanel (Satelitweb / Cloud Hosting)

Terdapat 2 metode deployment di cPanel Satelitweb:

### Metode 1: Upload File Mandiri `TKA_GURU.html` (Paling Cepat & Mudah)
1. Login ke cPanel hosting Anda (misal: `namadomain.com:2083`).
2. Masuk ke menu **File Manager** -> buka folder `public_html`.
3. Buat folder baru, misalnya `tka` atau `ujian` (atau langsung di root `public_html`).
4. Upload file `TKA_GURU.html` ke dalam folder tersebut.
5. Ubah nama file menjadi `index.html` jika ingin langsung diakses di `https://namadomain.com/tka/`.
6. Selesai! Aplikasi sudah online 100% dan dapat diakses siswa maupun guru kapan saja.

---

### Metode 2: Deployment Full-Stack Node.js di cPanel (Fitur Lengkap Gemini AI)
Jika paket hosting Satelitweb Anda mendukung **Setup Node.js App** di cPanel:

1. **Persiapan Build di Komputer Lokal:**
   ```bash
   npm run build
   ```
2. **Setup Node.js App di cPanel:**
   - Di dashboard cPanel, cari dan klik menu **Setup Node.js App**.
   - Klik tombol **Create Application**.
   - Atur konfigurasi:
     - **Node.js version**: Pilih versi terbaru (v18.x atau v20.x).
     - **Application mode**: `Production`.
     - **Application root**: `kelas5juara` (atau nama folder yang diinginkan).
     - **Application URL**: subdomain atau subpath domain Anda.
     - **Application startup file**: `server.js` (atau `server.ts`).
   - Klik **Create**.

3. **Upload Berkas Aplikasi:**
   - Buka **File Manager** cPanel, tuju folder root aplikasi yang baru dibuat (`/home/username/kelas5juara/`).
   - Kompres (zip) folder proyek lokal (kecuali folder `node_modules`):
     - `package.json`
     - `server.ts` / `server.js`
     - `appConfig.js`
     - Folder `dist/` (hasil build Vite)
     - `.env`
   - Upload file ZIP ke folder cPanel, lalu klik **Extract**.

4. **Install Dependensi di cPanel:**
   - Kembali ke menu **Setup Node.js App**.
   - Di bagian baris perintah (Enter to the virtual environment), salin perintah aktivasi terminal atau klik tombol **Run NPM Install**.
   - Pastikan variabel environment `GEMINI_API_KEY` ditambahkan pada menu **Environment variables**.

5. **Restart Aplikasi:**
   - Klik tombol **Restart** pada aplikasi Node.js cPanel.
   - Buka URL website Anda. Aplikasi siap melayani guru dan siswa di sekolah!

---

## 📄 Lisensi & Hak Cipta
Dikembangkan untuk mendukung kemajuan pendidikan Indonesia berbasis Kurikulum Merdeka dan standar Asesmen Nasional Pusmendik Kemendikdasmen RI.
*Bebas digunakan dan dimodifikasi untuk kepentingan pendidikan nirlaba.*
