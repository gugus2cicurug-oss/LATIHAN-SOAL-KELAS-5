import { QuestionItem, StimulusGroup, OptionItem, StatementItem, MatchingPairItem } from '../data/defaultPackages';

/**
 * Transforms a question to a target type (PG, PGK, BS, STS, Jodohkan, Isian)
 * using the Gemini API backend, with intelligent local heuristic fallback.
 */
export async function transformQuestionWithAI(
  question: QuestionItem,
  targetType: 'pg' | 'pgk' | 'bs' | 'sts' | 'jodohkan' | 'isian',
  stimulus?: StimulusGroup
): Promise<QuestionItem> {
  // If already the same type, return copy
  if (question.type === targetType) {
    return JSON.parse(JSON.stringify(question));
  }

  try {
    const res = await fetch('/api/transform-question', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        targetType,
        stimulusContent: stimulus?.content || '',
        stimulusTitle: stimulus?.title || ''
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.question) {
        return {
          ...data.question,
          number: question.number
        };
      }
    }
  } catch (err) {
    console.warn('AI Transform endpoint unreachable or returned error, using local transformation engine:', err);
  }

  // Local Intelligent Fallback Transformation
  return transformQuestionLocally(question, targetType, stimulus);
}

/**
 * Intelligent client-side rule-based transformation when AI API is unavailable
 */
export function transformQuestionLocally(
  q: QuestionItem,
  targetType: 'pg' | 'pgk' | 'bs' | 'sts' | 'jodohkan' | 'isian',
  stimulus?: StimulusGroup
): QuestionItem {
  const base: QuestionItem = {
    ...JSON.parse(JSON.stringify(q)),
    type: targetType
  };

  // Extract text of the correct option if it was PG
  let correctOptionText = '';
  if (q.options && typeof q.correctAnswer === 'string') {
    const matched = q.options.find(o => o.key === q.correctAnswer);
    if (matched) correctOptionText = matched.text;
  }

  switch (targetType) {
    case 'pg': {
      base.prompt = q.prompt.replace(/^Pilihlah semua jawaban.*?:/i, '').replace(/^Tentukan kebenaran.*?:/i, '').trim();
      if (!base.options || base.options.length < 4) {
        base.options = [
          { key: 'A', text: correctOptionText || 'Pernyataan benar sesuai stimulus' },
          { key: 'B', text: 'Pernyataan alternatif yang kurang tepat' },
          { key: 'C', text: 'Pernyataan pengecoh logis' },
          { key: 'D', text: 'Pernyataan bertentangan dengan informasi' }
        ];
      }
      base.correctAnswer = 'A';
      delete base.statements;
      delete base.matchingPairs;
      break;
    }

    case 'pgk': {
      base.prompt = `Pilihlah semua jawaban yang benar berdasarkan informasi di atas (Jawaban benar lebih dari satu):\n${q.prompt}`;
      if (!base.options || base.options.length < 4) {
        base.options = [
          { key: 'A', text: correctOptionText || 'Kriteria pertama yang terbukti benar' },
          { key: 'B', text: 'Kriteria kedua yang tidak sesuai fakta' },
          { key: 'C', text: 'Kriteria ketiga yang juga terbukti benar' },
          { key: 'D', text: 'Kriteria keempat yang bertentangan' }
        ];
      }
      base.correctAnswer = ['A', 'C'];
      delete base.statements;
      delete base.matchingPairs;
      break;
    }

    case 'bs':
    case 'sts': {
      const isBS = targetType === 'bs';
      const trueLabel = isBS ? 'Benar' : 'Sesuai';
      const falseLabel = isBS ? 'Salah' : 'Tidak Sesuai';

      base.prompt = isBS
        ? `Tentukan apakah setiap pernyataan berikut bernilai BENAR atau SALAH berdasarkan stimulus di atas!`
        : `Tentukan apakah setiap pernyataan berikut SESUAI atau TIDAK SESUAI dengan isi teks di atas!`;

      base.statements = [
        {
          id: 's1',
          text: correctOptionText ? `Informasi bahwa ${correctOptionText} adalah tepat.` : `Pernyataan fakta pertama sesuai isi bacaan stimulus.`,
          answer: trueLabel
        },
        {
          id: 's2',
          text: `Data pendukung kedua yang berkebalikan dengan fakta bacaan.`,
          answer: falseLabel
        },
        {
          id: 's3',
          text: `Kesimpulan logis yang dapat dibuktikan dari teks stimulus.`,
          answer: trueLabel
        }
      ];

      base.correctAnswer = {
        s1: trueLabel,
        s2: falseLabel,
        s3: trueLabel
      };
      delete base.options;
      delete base.matchingPairs;
      break;
    }

    case 'jodohkan': {
      base.prompt = `Pasangkanlah setiap konsep atau nilai pada kolom sebelah kiri dengan pasangan yang tepat pada kolom sebelah kanan!`;
      base.matchingPairs = [
        { id: 'm1', left: 'Konsep / Nilai A', right: correctOptionText || 'Pasangan Fakta Utama' },
        { id: 'm2', left: 'Konsep / Nilai B', right: 'Karakteristik Kedua' },
        { id: 'm3', left: 'Konsep / Nilai C', right: 'Ukuran / Simpulan Logis' }
      ];
      base.correctAnswer = {
        m1: correctOptionText || 'Pasangan Fakta Utama',
        m2: 'Karakteristik Kedua',
        m3: 'Ukuran / Simpulan Logis'
      };
      delete base.options;
      delete base.statements;
      break;
    }

    case 'isian': {
      base.prompt = `${q.prompt.replace(/pilihlah|berikut ini/gi, '').trim()} (Tuliskan jawaban singkat Anda):`;
      base.correctAnswer = correctOptionText || 'Jawaban singkat yang tepat';
      delete base.options;
      delete base.statements;
      delete base.matchingPairs;
      break;
    }
  }

  base.explanation = `${q.explanation || 'Berdasarkan data dan teks stimulus, jawaban dapat dianalisis secara runtut.'}\n(Bentuk soal telah disesuaikan menjadi format ${targetType.toUpperCase()} standar Pusmendik).`;

  return base;
}
