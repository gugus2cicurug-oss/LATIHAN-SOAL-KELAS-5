import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { APP_CONFIG } from './appConfig.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

const apiKey = process.env.GEMINI_API_KEY || '';
let ai = null;

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

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    appName: APP_CONFIG.appName,
    hasApiKey: !!process.env.GEMINI_API_KEY,
    geminiModel: APP_CONFIG.geminiModel,
    timestamp: new Date().toISOString(),
  });
});

function cleanJsonResponse(raw) {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '');
    cleaned = cleaned.replace(/\s*```$/i, '');
  }
  return JSON.parse(cleaned.trim());
}

app.post('/api/generate-tka', async (req, res) => {
  const {
    kisiKisi,
    grade = 'Kelas 5 SD/MI',
    numStimulus = 4,
  } = req.body;

  if (!kisiKisi || typeof kisiKisi !== 'string' || kisiKisi.trim().length === 0) {
    return res.status(400).json({ error: 'Kisi-kisi materi wajib diisi.' });
  }

  if (!ai || !apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY belum terkonfigurasi di server environment.',
      needsApiKey: true,
    });
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
1. Mata Pelajaran: Deteksi otomatis dari kisi-kisi (Matematika, Bahasa Indonesia, IPAS, Pendidikan Pancasila, PADB, Seni Rupa, PJOK, Bahasa Inggris, atau Bahasa Sunda).
2. Jenjang: ${grade}.
3. STRUKTUR: Hasilkan ${numStimulus} kelompok stimulus (total ${numStimulus * 3} soal). Tepat 1 stimulus untuk 3 butir soal!
4. TIPE SOAL: Variasikan PG (pilihan ganda), PGK (kompleks), BS (benar/salah), STS (sesuai/tidak sesuai).
5. KUNCI & PEMBAHASAN: Lengkapi dengan langkah hitung matematika atau rujukan kutipan teks.

Keluarkan dalam format JSON murni:
{
  "title": "Naskah Asesmen TKA...",
  "subject": "Nama Mapel",
  "subjectCode": "KODE",
  "grade": "${grade}",
  "academicYear": "2026/2027",
  "timeLimitMinutes": 45,
  "competencySummary": "Ringkasan...",
  "stimulusGroups": [
    {
      "stimulusId": "stim-1",
      "title": "Judul Stimulus",
      "type": "Teks Kontekstual / Masalah Nyata",
      "content": "Isi lengkap bacaan...",
      "questions": [
        {
          "number": 1,
          "type": "pg",
          "competency": "Kompetensi dasar",
          "cognitiveLevel": "L1 / L2 / L3",
          "prompt": "Pertanyaan...",
          "options": [
            {"key": "A", "text": "Pilihan A"},
            {"key": "B", "text": "Pilihan B"},
            {"key": "C", "text": "Pilihan C"},
            {"key": "D", "text": "Pilihan D"}
          ],
          "correctAnswer": "A",
          "explanation": "Pembahasan..."
        }
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: APP_CONFIG.geminiModel,
      contents: prompt,
      config: { responseMimeType: 'application/json' },
    });

    const parsedData = cleanJsonResponse(response.text || '');
    res.json({
      success: true,
      data: parsedData,
      generatedWithAI: true,
    });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: error.message || 'Gagal menghasilkan naskah asesmen dari Gemini API.' });
  }
});

app.post('/api/chat-assistant', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Pesan kosong.' });

  if (!ai || !apiKey) {
    return res.json({
      reply: 'Halo Guru Hebat! Asisten Konsultan AI KELAS 5 JUARA siap membantu Anda menyusun soal asesmen dan kiat sukses menghadapi TKA Pusmendik.',
    });
  }

  try {
    const prompt = `Anda adalah Konsultan Ahli Asesmen TKA Pusmendik Kemendikdasmen RI untuk SD/MI. Jawablah pertanyaan guru/siswa dengan ramah, suportif, dan edukatif:\n"${message}"`;
    const response = await ai.models.generateContent({
      model: APP_CONFIG.geminiModel,
      contents: prompt,
    });
    res.json({ reply: response.text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve dist in production
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[KELAS 5 JUARA] Server production berjalan di http://localhost:${PORT}`);
});
