import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, Sparkles, MessageSquare, Lightbulb } from 'lucide-react';
import { ChatMessage } from '../types';
import { TKAPackage } from '../data/defaultPackages';

interface AIChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activePackage?: TKAPackage;
}

export const AIChatDrawer: React.FC<AIChatDrawerProps> = ({
  isOpen,
  onClose,
  activePackage
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: `Halo Guru Hebat & Adik-adik Juara! 👋 

Saya adalah **Konsultan AI Asesmen TKA Pusmendik Kemendikdasmen**. Saya siap membantu Anda:
1. Menganalisis kisi-kisi dan indikator materi HOTS.
2. Memberikan ide stimulus kontekstual & pembuatan diagram/tabel.
3. Menjelaskan rubrik penskoran Pilihan Ganda Kompleks atau Benar/Salah.
4. Memberikan tips belajar dan strategi pengerjaan soal asesmen nasional.

Ada yang bisa saya bantu hari ini?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    "Bagaimana cara membuat stimulus HOTS numerasi kontekstual?",
    "Apa perbedaan level kognitif L1, L2, dan L3?",
    "Bagaimana rubrik penskoran Pilihan Ganda Kompleks?",
    "Beri tips mengatasi anak yang gugup saat ujian TKA"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          currentPackageContext: activePackage ? {
            title: activePackage.title,
            subject: activePackage.subject,
            grade: activePackage.grade,
            competencySummary: activePackage.competencySummary
          } : null
        })
      });

      if (res.ok) {
        const data = await res.json();
        const replyText = data.reply || 'Maaf, saya tidak dapat memproses jawaban saat ini.';
        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          sender: 'assistant',
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages((prev) => [...prev, botMsg]);
      } else {
        throw new Error('Gagal menghubungi server');
      }
    } catch (err) {
      // Intelligent pedagogical fallback
      const fallbackReplies: Record<string, string> = {
        hots: "Untuk menyusun soal HOTS (Higher Order Thinking Skills):\n1. Gunakan stimulus berbasis situasi nyata (kontekstual) yang belum pernah dilihat siswa di buku teks umum.\n2. Tuntut siswa menganalisis (C4), mengevaluasi (C5), atau mengkreasi (C6).\n3. Pastikan kunci jawaban tidak dapat ditebak hanya dengan mencocokkan kata semata.",
        rubrik: "Rubrik Penskoran Pilihan Ganda Kompleks (PGK) Standar Pusmendik:\n- Seluruh jawaban benar dipilih tanpa ada opsi salah terpilih = Skor Penuh (1.0)\n- Sebagian jawaban benar dipilih tanpa opsi salah = Skor Parsial (0.5)\n- Memilih opsi yang keliru = Skor 0.",
        default: `Konsultan AI Asesmen Pusmendik:\nPenyusunan asesmen berkualitas memerlukan keseimbangan antara stimulus yang bermakna dan pertanyaan yang mengukur kedalaman kognitif. Pastikan selalu memverifikasi kunci jawaban dan langkah matematis sebelum naskah diujikan kepada siswa!`
      };

      let selectedReply = fallbackReplies.default;
      const lower = text.toLowerCase();
      if (lower.includes('hots') || lower.includes('stimulus')) selectedReply = fallbackReplies.hots;
      else if (lower.includes('rubrik') || lower.includes('skor') || lower.includes('pgk')) selectedReply = fallbackReplies.rubrik;

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: selectedReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages((prev) => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs no-print">
      <div className="bg-white w-full max-w-lg h-full flex flex-col shadow-2xl border-l border-slate-200 animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Konsultan AI TKA Pusmendik
              </h3>
              <p className="text-[11px] text-blue-200 font-medium">
                Pakar Asesmen Pendidikan Kemendikdasmen RI
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="p-3 bg-blue-50/60 border-b border-blue-100 flex items-center gap-1.5 overflow-x-auto text-xs">
          <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 ml-1" />
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(p)}
              className="px-2.5 py-1 rounded-full bg-white text-slate-700 border border-slate-200 hover:border-blue-400 hover:text-blue-800 transition-colors whitespace-nowrap text-[11px] font-medium"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Messages List Area */}
        <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-3 text-xs sm:text-sm ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {m.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-br-xs'
                    : 'bg-white text-slate-800 border border-slate-200 shadow-xs rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-line">{m.text}</div>
                <div
                  className={`text-[10px] mt-1.5 text-right font-medium ${
                    m.sender === 'user' ? 'text-blue-200' : 'text-slate-400'
                  }`}
                >
                  {m.timestamp}
                </div>
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-2 items-center text-xs text-blue-700 bg-blue-100/60 p-2.5 rounded-xl w-fit">
              <Bot className="w-4 h-4 animate-spin text-blue-600" />
              <span>AI Konsultan sedang menganalisis jawaban...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Tanyakan analisis kisi-kisi atau tips TKA..."
              className="flex-1 p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xs sm:text-sm bg-slate-50"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
