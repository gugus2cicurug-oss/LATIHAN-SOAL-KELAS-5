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

// Fallback helper across models to ensure high availability during demand spikes
async function generateWithGeminiFallback(prompt: string, mimeType = 'application/json'): Promise<{ text: string; model: string }> {
  const candidateModels = ['gemini-flash-latest', APP_CONFIG.geminiModel, 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: mimeType,
        },
      });
      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      console.warn(`Model ${model} unavailable, trying fallback:`, err?.message || err);
      lastError = err;
    }
  }
  throw lastError || new Error('Gagal memproses dengan model AI.');
}

// POST /api/generate-tka
app.post('/api/generate-tka', async (req: Request, res: Response): Promise<void> => {
  const {
    kisiKisi,
    subjectName = 'Otomatis',
    grade = 'Kelas 5 SD/MI',
    numStimulus = 4,
    numQuestions,
    questionTypes = 'campuran' // 'campuran' | 'pg' | 'pgk' | 'bs' | 'jodohkan' | 'isian'
  } = req.body;

  if (!kisiKisi || typeof kisiKisi !== 'string' || kisiKisi.trim().length === 0) {
    res.status(400).json({ error: 'Kisi-kisi materi wajib diisi.' });
    return;
  }

  // Calculate actual number of stimuli and target questions
  const totalTargetQuestions = numQuestions ? Math.max(3, Number(numQuestions)) : (numStimulus * 3);
  const calculatedStimulusCount = Math.max(1, Math.ceil(totalTargetQuestions / 3));

  // Check if AI is configured
  if (!ai || !apiKey) {
    res.status(503).json({
      error: 'GEMINI_API_KEY belum terkonfigurasi di server environment.',
      needsApiKey: true,
    });
    return;
  }

  try {
    let typeInstructions = `Variasikan tipe soal secara seimbang:
   - 'pg' : Pilihan Ganda biasa (1 jawaban benar dari pilihan A, B, C, D)
   - 'pgk' : Pilihan Ganda Kompleks (jawaban benar lebih dari satu, minimal 2 benar)
   - 'bs' : Benar / Salah (tabel dengan 3-4 baris pernyataan)
   - 'sts' : Sesuai / Tidak Sesuai
   - 'jodohkan' : Menjodohkan (pasangkan 3-4 konsep kiri dan kanan)
   - 'isian' : Isian Singkat berorientasi konsep/numerik`;

    if (questionTypes === 'pg') {
      typeInstructions = `Seluruh butir soal WAJIB berformat 'pg' (Pilihan Ganda biasa dengan opsi A, B, C, D dan 1 jawaban benar).`;
    } else if (questionTypes === 'pgk') {
      typeInstructions = `Seluruh butir soal WAJIB berformat 'pgk' (Pilihan Ganda Kompleks, opsi A, B, C, D dengan jawaban benar minimal 2).`;
    } else if (questionTypes === 'bs') {
      typeInstructions = `Seluruh butir soal WAJIB berformat 'bs' (Benar / Salah) dengan tabel 3-4 pernyataan.`;
    } else if (questionTypes === 'jodohkan') {
      typeInstructions = `Seluruh butir soal WAJIB berformat 'jodohkan' (Menjodohkan) dengan 3-4 pasangan premis kiri dan respon kanan.`;
    } else if (questionTypes === 'isian') {
      typeInstructions = `Seluruh butir soal WAJIB berformat 'isian' (Isian Singkat berorientasi kata kunci atau angka pasti).`;
    }

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
3. STRUKTUR KELOMPOK SOAL:
   - Hasilkan ${calculatedStimulusCount} kelompok stimulus (total = ${totalTargetQuestions} butir soal).
   - PRINSIP: 1 stimulus untuk sekitar 3 butir soal yang saling berurutan dan menguji kemampuan penalaran berbeda.
4. VARIASI TIPE SOAL:
   ${typeInstructions}
5. STIMULUS:
   - Untuk Matematika/IPAS: Berikan stimulus berupa narasi cerita kehidupan nyata, tabel data terstruktur, atau data statistik yang realistis.
   - Sediakan "svgDiagram" berupa kode SVG inline sederhana dan rapi jika soal matematika/geometri agar tampilan naskah memukau!
6. KUNCI DAN PEMBAHASAN:
   - Kunci jawaban harus diverifikasi 100% akurat.
   - Pembahasan wajib menyertakan langkah perhitungan matematis detail atau rujukan kalimat dalam stimulus.

Keluarkan dalam format JSON yang murni dan valid sesuai skema berikut tanpa tambahan komentar teks di luar JSON:
{
  "title": "Naskah Latihan TKA Pusmendik - ...",
  "subject": "Nama Mata Pelajaran Terdeteksi",
  "subjectCode": "MAT / IND / IPAS / dll",
  "grade": "${grade}",
  "academicYear": "2026/2027",
  "timeLimitMinutes": ${Math.max(25, totalTargetQuestions * 3)},
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
        }
      ]
    }
  ]
}
`;

    const geminiResult = await generateWithGeminiFallback(prompt);
    const parsedData = cleanJsonResponse(geminiResult.text);

    res.json({
      success: true,
      data: parsedData,
      generatedWithAI: true,
      modelUsed: geminiResult.model,
    });
  } catch (error: any) {
    console.error('Error generating TKA assessment with Gemini API:', error);
    res.status(500).json({
      error: error?.message || 'Gagal menghasilkan naskah asesmen TKA dari Gemini API.',
      details: error?.toString(),
    });
  }
});

// POST /api/transform-question (AI-assisted Question Type Converter)
app.post('/api/transform-question', async (req: Request, res: Response): Promise<void> => {
  const { question, targetType, stimulusContent = '', stimulusTitle = '' } = req.body;

  if (!question || !targetType) {
    res.status(400).json({ error: 'Data soal dan tipe target wajib diisi.' });
    return;
  }

  if (!ai || !apiKey) {
    res.status(503).json({
      error: 'GEMINI_API_KEY belum terkonfigurasi di server environment.',
      needsApiKey: true,
    });
    return;
  }

  try {
    const prompt = `
Bertindaklah sebagai Penyusun Asesmen Profesional Pusmendik Kemendikdasmen RI untuk platform "KELAS 5 JUARA - TKA GURU".
Tugas Anda adalah MENGUBAH / MEROMBAK bentuk soal berikut dari tipe "${question.type || 'pg'}" menjadi tipe "${targetType}" dengan tetap menguji kompetensi yang sama dan berlandaskan stimulus berikut:

[STIMULUS TERKAIT]:
Judul: ${stimulusTitle || '-'}
Isi: """${stimulusContent || '-'}"""

[SOAL ASAL]:
Nomor: ${question.number || 1}
Kompetensi: ${question.competency || 'Kompetensi Pokok'}
Level Kognitif: ${question.cognitiveLevel || 'L2 (Penerapan)'}
Pertanyaan Asal: "${question.prompt || ''}"
Opsi Asal: ${JSON.stringify(question.options || question.statements || question.matchingPairs || [])}
Kunci Asal: ${JSON.stringify(question.correctAnswer || '')}
Pembahasan Asal: "${question.explanation || ''}"

[ATURAN PERUBAHAN KE TIPE "${targetType}"]:
1. Jika target 'pg' (Pilihan Ganda Tunggal):
   - Redaksi pertanyaan lugas dengan 1 jawaban benar.
   - Sediakan "options": [{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}].
   - "correctAnswer": "A" (atau salah satu dari A, B, C, D).
2. Jika target 'pgk' (Pilihan Ganda Kompleks):
   - Redaksi prompt menyertakan instruksi: "Pilihlah semua jawaban yang benar (jawaban benar lebih dari satu):"
   - Sediakan "options": 4 opsi [{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}].
   - "correctAnswer": array minimal 2 kunci yang benar, misal ["A", "C"].
3. Jika target 'bs' (Benar/Salah) atau 'sts' (Sesuai/Tidak Sesuai):
   - Redaksi prompt: "Tentukan kebenaran dari setiap pernyataan berikut berdasarkan informasi pada stimulus!"
   - Sediakan "statements": 3-4 butir pernyataan [{"id":"s1","text":"..."},{"id":"s2","text":"..."},{"id":"s3","text":"..."}].
   - "correctAnswer": objek kesesuaian, misal {"s1": "Benar", "s2": "Salah", "s3": "Benar"} (atau Sesuai/Tidak Sesuai).
4. Jika target 'jodohkan' (Menjodohkan):
   - Redaksi prompt: "Pasangkan setiap konsep atau pernyataan pada kolom kiri dengan pasangan yang tepat pada kolom kanan!"
   - Sediakan "matchingPairs": 3-4 pasang [{"id":"m1","left":"Konsep / Premis A","right":"Pasangan Respon A"},{"id":"m2","left":"Konsep / Premis B","right":"Pasangan Respon B"},{"id":"m3","left":"Konsep / Premis C","right":"Pasangan Respon C"}].
   - "correctAnswer": objek pencocokan, misal {"m1": "Pasangan Respon A", "m2": "Pasangan Respon B", "m3": "Pasangan Respon C"}.
5. Jika target 'isian' (Isian Singkat):
   - Redaksi prompt terarah dan menuntut jawaban berupa kata kunci atau nilai numerik pasti.
   - "correctAnswer": string kunci jawaban ringkas.

6. Seluruh kunci jawaban harus 100% tepat dan sediakan "explanation" langkah solusi yang mudah dipahami siswa kelas 5 SD.

Keluarkan dalam format JSON murni:
{
  "number": ${question.number || 1},
  "type": "${targetType}",
  "competency": "${question.competency || 'Kompetensi Pokok'}",
  "cognitiveLevel": "${question.cognitiveLevel || 'L2 (Penerapan)'}",
  "prompt": "Redaksi pertanyaan baru...",
  "options": [...],
  "statements": [...],
  "matchingPairs": [...],
  "correctAnswer": ...,
  "explanation": "Penjelasan solusi..."
}
`;

    const geminiResult = await generateWithGeminiFallback(prompt);
    const transformed = cleanJsonResponse(geminiResult.text);

    res.json({
      success: true,
      question: transformed,
      modelUsed: geminiResult.model,
    });
  } catch (error: any) {
    console.error('Error transforming question with Gemini API:', error);
    res.status(500).json({
      error: error?.message || 'Gagal mengubah bentuk soal dengan AI.',
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
