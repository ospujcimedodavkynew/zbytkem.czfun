
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Bot, User, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: 'Dobrý den! Jsem váš AI asistent pro Obytkem.cz. Jak vám mohu dnes pomoci s výběrem vozu nebo rezervací?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      // Získání API klíče (stejná logika jako v geminiService)
      const key = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || 
                  (import.meta.env.VITE_GEMINI_API_KEY) || 
                  '';

      if (!key) {
        setMessages(prev => [...prev, { role: 'bot', text: 'Omlouvám se, ale AI asistent není momentálně nakonfigurován (chybí API klíč).' }]);
        setIsLoading(false);
        return;
      }

      const ai = new GoogleGenAI({ apiKey: key });
      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction: `Jsi přátelský a profesionální asistent pro půjčovnu obytných vozů Obytkem.cz v Brně. 
          Tvým úkolem je pomáhat zákazníkům s dotazy. 
          
          Základní informace o nás:
          - Nabízíme vůz Ahorn Canada TU Plus (Model 2022).
          - Vůz je pro 5 osob na jízdu i spaní.
          - Cena se pohybuje od 2500 Kč do 3400 Kč za den dle sezóny.
          - Vratná kauce je 25 000 Kč.
          - Limit kilometrů je 300 km/den, nad limit se doplácí 5 Kč/km.
          - Místo předání: Obytkem.cz parkoviště Teslova Brno, po pravé straně od vjezdu. Odkaz na Google Mapy: https://share.google/6M5XW9rgNIyoFMlfq
          - Vybavení: kuchyňka, sprcha, WC, topení, markýza, držák na kola.
          
          Odpovídej stručně, jasně a česky. Pokud se zákazník ptá na něco, co nevíš, odkaž ho na telefonní kontakt nebo email pujcimedodavky@gmail.com.`,
        },
        history: messages.map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          parts: [{ text: m.text }],
        })),
      });

      const response = await chat.sendMessage({ message: userMessage });
      const text = response.text || 'Omlouvám se, ale nepodařilo se mi vygenerovat odpověď.';

      setMessages(prev => [...prev, { role: 'bot', text }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'bot', text: 'Omlouvám se, došlo k chybě při zpracování vašeho dotazu.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="hidden md:block fixed bottom-8 left-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-[350px] sm:w-[400px] h-[500px] flex flex-col overflow-hidden mb-4"
          >
            {/* Header */}
            <div className="bg-slate-900 p-4 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center">
                  <Bot size={18} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">Obytkem AI Asistent</h3>
                  <p className="text-slate-400 text-[10px] uppercase tracking-widest">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    m.role === 'user' 
                      ? 'bg-brand-primary text-white rounded-tr-none' 
                      : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                  }`}>
                    {m.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                    <Loader2 size={18} className="animate-spin text-brand-primary" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Zeptejte se na cokoliv..."
                  className="flex-grow bg-slate-100 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-brand-primary transition-all"
                />
                <button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-brand-primary text-white p-2 rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-11 h-11 rounded-full bg-brand-primary shadow-lg flex items-center justify-center text-white hover:bg-brand-secondary transition-all"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
};

export default AIChatbot;
