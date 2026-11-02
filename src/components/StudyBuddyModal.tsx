import React, { useState } from 'react';
import { X, Send, Bot, User } from 'lucide-react';

interface StudyBuddyModalProps {
  onClose: () => void;
}

export const StudyBuddyModal: React.FC<StudyBuddyModalProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string }>>([
    { sender: 'ai', text: '¡Hola! Soy RoboAmigo 🤖 tu compañero de estudio. ¿Tienes alguna duda con tu tarea o quieres que te explique algo?' }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage;
    setInputMessage('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const response = await fetch('/api/study-buddy-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, contextTopic: 'Estudios generales' })
      });

      if (!response.ok) throw new Error('Error al hablar con RoboAmigo');
      const data = await response.json();

      setMessages(prev => [...prev, { sender: 'ai', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: '¡Hola! Sigue practicando con entusiasmo. 🚀' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-sm w-full h-[500px] flex flex-col shadow-xl overflow-hidden text-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-100 to-indigo-100 p-4 border-b border-purple-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 bg-purple-200 rounded-full flex items-center justify-center text-purple-900 font-black shadow-2xs border border-purple-300">
              🤖
            </div>
            <div>
              <h3 className="font-black text-indigo-950 text-sm">RoboAmigo - Tutor IA</h3>
              <p className="text-[11px] text-slate-500">Siempre listo para explicarte</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/50 rounded-full text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-2 ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${msg.sender === 'user' ? 'bg-amber-300 text-amber-950' : 'bg-purple-600 text-white'}`}>
                {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>
              <div className={`max-w-[78%] p-3 rounded-2xl text-xs sm:text-sm font-medium shadow-2xs ${msg.sender === 'user' ? 'bg-amber-100 text-amber-950 rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-full bg-purple-600 flex items-center justify-center text-white">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="bg-white p-3 rounded-2xl text-xs text-slate-500 border border-slate-200 animate-pulse">
                RoboAmigo está pensando...
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Pregúntale algo a RoboAmigo..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 text-xs sm:text-sm placeholder-slate-400 font-medium focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            className="bg-amber-300 hover:bg-amber-400 text-amber-950 p-2.5 rounded-xl shadow-2xs transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
