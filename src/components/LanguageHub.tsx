import React, { useState } from 'react';
import { UserProfile, QuizData } from '../types';
import { Globe, Volume2, ArrowRight, Loader2 } from 'lucide-react';

interface LanguageHubProps {
  user: UserProfile | null;
  onQuizReady: (quiz: QuizData) => void;
}

export const LanguageHub: React.FC<LanguageHubProps> = ({ user, onQuizReady }) => {
  const [selectedLanguage, setSelectedLanguage] = useState('ingles');
  const [loading, setLoading] = useState(false);

  const presetTopics = {
    ingles: [
      { title: '👋 Saludos y Presentaciones', desc: 'Aprende a decir hola, cómo estás y presentarte en inglés.' },
      { title: '🐶 Animales y Mascotas', desc: 'Vocabulario de animales terrestres, marinos y aves.' },
      { title: '🍔 Comida y Bebidas', desc: 'Frutas, verduras y platos deliciosos en inglés.' },
      { title: '🏃 Acciones y Verbos', desc: 'Verbos comunes para describir lo que hacemos cada día.' }
    ],
    frances: [
      { title: '🥐 Bonjour y Saludos', desc: 'Frases cortas y amables en francés.' },
      { title: '🎨 Colores y Formas', desc: 'Describe el mundo de colores en francés.' },
      { title: '🔢 Los Números Mágicos', desc: 'Cuenta del 1 al 20 con pronunciación.' }
    ],
    espanol: [
      { title: '✍️ Ortografía Divertida', desc: 'Reglas de acentuación y palabras con B y V.' },
      { title: '📚 Lectura Comprensiva', desc: 'Cuentos cortos y preguntas de comprensión.' }
    ]
  };

  const handleGenerateLanguageQuiz = async (topicTitle: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/generate-topic-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicTitle,
          subject: 'Idiomas',
          language: selectedLanguage,
          difficulty: 'normal'
        })
      });

      if (!response.ok) throw new Error('Error generando quiz de idiomas');
      const aiData = await response.json();

      const quizId = 'lang_quiz_' + Date.now();
      const newQuiz: QuizData = {
        id: quizId,
        userId: user ? user.uid : 'guest_user',
        title: aiData.title || `Práctica de ${selectedLanguage}: ${topicTitle}`,
        subject: `Idiomas (${selectedLanguage.toUpperCase()})`,
        language: selectedLanguage,
        sourceType: 'language_practice',
        summary: aiData.summary,
        questions: aiData.questions || [],
        createdAt: new Date().toISOString()
      };

      setLoading(false);
      onQuizReady(newQuiz);
    } catch (err: any) {
      setLoading(false);
      alert(err.message || 'Error al generar actividad de idiomas.');
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = selectedLanguage === 'ingles' ? 'en-US' : selectedLanguage === 'frances' ? 'fr-FR' : 'es-ES';
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Tu navegador no soporta lectura de voz.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 pb-24 sm:pb-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-emerald-200 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-emerald-200">
            <Globe className="w-7 h-7 text-emerald-700" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
            🌍 Academia de Idiomas Interactivos
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md mx-auto font-medium">
            ¡Domina nuevos idiomas jugando! Selecciona un idioma, escucha la pronunciación y pon a prueba tus conocimientos.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex justify-center space-x-2 sm:space-x-3">
          {[
            { id: 'ingles', label: '🇬🇧 Inglés' },
            { id: 'frances', label: '🇫🇷 Francés' },
            { id: 'espanol', label: '🇪🇸 Español' }
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => setSelectedLanguage(lang.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition shadow-2xs border ${
                selectedLanguage === lang.id
                  ? 'bg-amber-300 text-amber-950 border-amber-400 font-black'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {((presetTopics as any)[selectedLanguage] || []).map((topic: any, idx: number) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-200 transition"
            >
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="bg-emerald-100 text-emerald-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                    {selectedLanguage}
                  </span>
                  <button
                    onClick={() => speakText(topic.title)}
                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-700 transition"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 className="w-4 h-4 text-emerald-700" />
                  </button>
                </div>
                <h3 className="text-lg font-black text-indigo-950 mb-1.5">{topic.title}</h3>
                <p className="text-slate-600 text-xs sm:text-sm mb-5 font-medium">{topic.desc}</p>
              </div>

              <button
                onClick={() => handleGenerateLanguageQuiz(topic.title)}
                disabled={loading}
                className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-2.5 rounded-xl shadow-2xs flex items-center justify-center space-x-1.5 text-xs sm:text-sm transition border border-amber-400"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>¡Iniciar Desafío! 🚀</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
