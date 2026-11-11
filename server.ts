import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { APP_CONFIG } from './appConfig.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Shared Gemini AI client initialization
const apiKey = process.env.GEMINI_API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: APP_CONFIG.appName,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    geminiModel: APP_CONFIG.geminiModel,
    timestamp: new Date().toISOString(),
  });
});

// Serve Standalone TKA_GURU.html
app.get('/TKA_GURU.html', (_req: Request, res: Response) => {
  res.sendFile(path.resolve(__dirname, 'TKA_GURU.html'));
});

// Helper to sanitize JSON string from AI response
function cleanJsonResponse(raw: string): any {
  let cleaned = raw.trim();
  // Strip Markdown code fences if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
}

// POST /api/generate-tka
app.post('/api/generate-tka', async (req: Request, res: Response): Promise<void> => {
  const {
    kisiKisi,
    subjectName = 'Otomatis',
    grade = 'Kelas 5 SD/MI',
    numStimulus = 6, // default to 6 stimuli -> 18 questions (or 10 stimuli -> 30 questions)
  } = req.body;

  if (!kisiKisi || typeof kisiKisi !== 'string' || kisiKisi.trim().length === 0) {
    res.status(400).json({ error: 'Kisi-kisi materi wajib diisi.' });
    return;
  }

  // Check if AI is configured
  if (!ai || !apiKey) {
    res.status(503).json({
      error: 'GEMINI_API_KEY belum terkonfigurasi di server environment.',
      needsApiKey: true,
    });
    return;
  }

  try {
    const prompt = `
Bertindaklah sebagai Penyusun Asesmen Profesional Pusat Asesmen Pendidikan (Pusmendik) Kemendikdasmen RI untuk platform "KELAS 5 JUARA - TKA GURU".
Tugas Anda adalah menghasilkan paket naskah soal Tes Kemampuan Akademik (TKA) lengkap, valid, berbobot HOTS (High Order Thinking Skills), kontekstual, dan siap uji berdasarkan kisi-kisi berikut:

[KISI-KISI / MATRIKS ASESMEN]:
"""
${kisiKisi.trim()}
"""

[KETENTUAN UTAMA]:
1. Mata Pelajaran: Deteksi otomatis dari kisi-kisi jika belum ditentukan (bisa Matematika, Bahasa Indonesia, IPAS, Pendidikan Pancasila, PADB, Seni Rupa, PJOK, Bahasa Inggris, atau Bahasa Sunda).
2. Jenjang: ${grade}.
3. STRUKTUR KELOMPOK SOAL (STANDAR EMAS PUSMENDIK):
   - Hasilkan ${numStimulus} kelompok stimulus (total = ${numStimulus * 3} soal).
   - PRINSIP: Tepat 1 stimulus untuk 3 butir soal!
   - Ketiga butir soal menguji kemampuan penalaran yang berbeda dan harus secara nyata merujuk pada isi stimulus.
4. VARIASI TIPE SOAL:
   Jangan hanya membuat pilihan ganda biasa! Variasikan dengan tipe:
   - 'pg' : Pilihan Ganda biasa (1 jawaban benar dari pilihan A, B, C, D)
   - 'pgk' : Pilihan Ganda Kompleks (jawaban benar lebih dari satu, minimal 2 benar)
   - 'bs' : Benar / Salah (tabel dengan 3-4 baris pernyataan yang harus dinilai siswa)
   - 'sts' : Sesuai / Tidak Sesuai (tabel pernyataan kesesuaian fakta dengan teks)
   - 'mtm' : Mendukung / Tidak Mendukung (evaluasi argumen)
5. STIMULUS:
   - Untuk Matematika/IPAS: Berikan stimulus berupa narasi cerita kehidupan nyata, tabel data terstruktur, atau data statistik yang realistis.
   - Untuk Bahasa Indonesia/Agama/Pancasila/Sunda/Inggris: Berikan teks naratif, cerita inspiratif, teks eksplanasi ilmiah, atau infografis deskriptif.
   - Sediakan "svgDiagram" berupa kode SVG inline sederhana dan rapi jika soal matematika (misal denah bangun datar, grafik batang, pie chart, balok/kubus) agar tampilan naskah memukau!
6. KUNCI DAN PEMBAHASAN:
   - Kunci jawaban harus diverifikasi 100% akurat.
   - Untuk matematika: Pembahasan wajib menyertakan langkah perhitungan matematis detail.
   - Untuk literasi/teks: Pembahasan wajib menyertakan rujukan kalimat atau bukti konkret dalam stimulus.

Keluarkan dalam format JSON yang murni dan valid sesuai skema berikut tanpa tambahan komentar teks di luar JSON:
{
  "title": "Naskah Latihan TKA Pusmendik - ...",
  "subject": "Nama Mata Pelajaran Terdeteksi",
  "subjectCode": "MAT / IND / IPAS / dll",
  "grade": "${grade}",
  "academicYear": "2026/2027",
  "timeLimitMinutes": ${Math.max(30, numStimulus * 10)},
  "competencySummary": "Ringkasan kompetensi yang diuji dalam paket ini...",
  "stimulusGroups": [
    {
      "stimulusId": "stimulus-1",
      "title": "Judul Stimulus Menarik",
      "type": "Teks Eksplanasi / Masalah Kontekstual / Cerita Fabel / Tabel Data",
      "content": "Isi lengkap stimulus bacaan atau deskripsi data numerik...",
      "tableData": [
        {"kolom1": "...", "kolom2": "..."}
      ],
      "svgDiagram": "<svg ...>...</svg>",
      "questions": [
        {
          "number": 1,
          "type": "pg",
          "competency": "Menentukan informasi tersurat / Operasi hitung bilangan",
          "cognitiveLevel": "L1 (Pemahaman) / L2 (Penerapan) / L3 (Penalaran)",
          "prompt": "Pertanyaan nomor 1 berdasarkan stimulus...",
          "options": [
            {"key": "A", "text": "Pilihan A"},
            {"key": "B", "text": "Pilihan B"},
            {"key": "C", "text": "Pilihan C"},
            {"key": "D", "text": "Pilihan D"}
          ],
          "correctAnswer": "A",
          "explanation": "Pembahasan rinci langkah solusi..."
        },
        {
          "number": 2,
          "type": "pgk",
          "competency": "Analisis data / ide pendukung",
          "cognitiveLevel": "L2 (Penerapan)",
          "prompt": "Pilihlah semua pernyataan yang benar (Jawaban lebih dari satu):",
          "options": [
            {"key": "A", "text": "Pernyataan A"},
            {"key": "B", "text": "Pernyataan B"},
            {"key": "C", "text": "Pernyataan C"},
            {"key": "D", "text": "Pernyataan D"}
          ],
          "correctAnswer": ["A", "C"],
          "explanation": "Pembahasan mengapa A dan C benar..."
        },
        {
          "number": 3,
          "type": "bs",
          "competency": "Evaluasi dan refleksi / Menarik kesimpulan",
          "cognitiveLevel": "L3 (Penalaran)",
          "prompt": "Tentukan kebenaran dari setiap pernyataan berikut berdasarkan informasi di atas!",
          "statements": [
            {"id": "s1", "text": "Pernyataan 1...", "answer": "Benar"},
            {"id": "s2", "text": "Pernyataan 2...", "answer": "Salah"},
            {"id": "s3", "text": "Pernyataan 3...", "answer": "Benar"}
          ],
          "correctAnswer": {"s1": "Benar", "s2": "Salah", "s3": "Benar"},
          "explanation": "Pembahasan analisis kebenaran tiap pernyataan..."
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: APP_CONFIG.geminiModel,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const rawText = response.text || '';
    const parsedData = cleanJsonResponse(rawText);

    res.json({
      success: true,
      data: parsedData,
      generatedWithAI: true,
      modelUsed: APP_CONFIG.geminiModel,
    });
  } catch (error: any) {
    console.error('Error generating TKA assessment with Gemini API:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghasilkan naskah asesmen TKA dari Gemini API.',
      details: error?.toString(),
    });
  }
});

// POST /api/chat-assistant
app.post('/api/chat-assistant', async (req: Request, res: Response): Promise<void> => {
  const { message, history = [], currentPackageContext = null } = req.body;

  if (!message || typeof message !== 'string') {
    res.status(400).json({ error: 'Pesan tidak boleh kosong.' });
    return;
  }

  if (!ai || !apiKey) {
    // Graceful helpful response if API key is not yet set
    res.json({
      reply: `Halo Guru Hebat! Saya adalah Asisten AI KELAS 5 JUARA. Saya siap membantu Anda menyusun naskah TKA standar Pusmendik, menganalisis kisi-kisi HOTS, maupun memberikan saran pengayaan materi untuk siswa. (Status: API Key belum diisi di Secrets, gunakan naskah latihan bawaan atau tambahkan kunci di menu Secrets).`,
    });
    return;
  }

  try {
    let contextPrompt = `Anda adalah "Guru Konsultan AI KELAS 5 JUARA", pakar penyusun asesmen pendidikan terkemuka standar Pusmendik Kemendikdasmen RI untuk SD/MI.
Bicaralah dengan ramah, suportif, berwawasan mendalam, profesional, dan gunakan Bahasa Indonesia yang baik dan santun.
Bantu guru atau siswa dalam memahami materi, kisi-kisi asesmen, indikator soal HOTS, taksonomi Bloom revisi, kisi-kisi numerasi & literasi, serta tips menghadapi TKA.`;

    if (currentPackageContext) {
      contextPrompt += `\n\nNaskah yang sedang dibuka saat ini:
Judul: ${currentPackageContext.title || '-'}
Mata Pelajaran: ${currentPackageContext.subject || '-'}
Jenjang: ${currentPackageContext.grade || 'Kelas 5 SD/MI'}
Ringkasan: ${currentPackageContext.competencySummary || '-'}`;
    }

    const conversationPrompt = `${contextPrompt}\n\nPertanyaan Pengguna: "${message}"\n\nBerikan jawaban yang jelas, terstruktur, praktis, dan memotivasi guru/siswa.`;

    const response = await ai.models.generateContent({
      model: APP_CONFIG.geminiModel,
      contents: conversationPrompt,
    });

    res.json({
      reply: response.text || 'Maaf, saya tidak dapat memproses jawaban saat ini.',
    });
  } catch (err: any) {
    console.error('Chat Assistant error:', err);
    res.status(500).json({
      error: err?.message || 'Terjadi kesalahan pada layanan AI Chat Assistant.',
    });
  }
});

// Serve frontend in production or integrate with Vite dev server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    // In dev, use Vite's connect instance as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // In production, serve dist folder
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[KELAS 5 JUARA] Server aktif berjalan di http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
