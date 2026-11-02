import React, { useState } from 'react';
import { UserProfile, QuizData } from '../types';
import { Camera, Upload, Sparkles, BookOpen, Globe, ArrowRight, Loader2 } from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';

interface HomeworkUploaderProps {
  user: UserProfile | null;
  onQuizReady: (quiz: QuizData) => void;
}

export const HomeworkUploader: React.FC<HomeworkUploaderProps> = ({ user, onQuizReady }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [textPrompt, setTextPrompt] = useState('');
  const [subject, setSubject] = useState('Ciencias');
  const [language, setLanguage] = useState('espanol');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);

  const loadingMessages = [
    "🤖 RoboAmigo está leyendo tu tarea con calma...",
    "✨ Extrayendo los puntos más importantes...",
    "🎮 Creando preguntas divertidas para ti...",
    "🌟 ¡Casi listo para comenzar el desafío!"
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setPreviewUrl(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcessHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile && !textPrompt.trim()) {
      alert('Por favor, sube una foto de tu tarea o escribe lo que necesitas estudiar.');
      return;
    }

    setLoading(true);
    const interval = setInterval(() => {
      setLoadingStep(prev => (prev + 1) % loadingMessages.length);
    }, 2500);

    try {
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;

      if (selectedFile && previewUrl) {
        const base64Data = previewUrl.split(',')[1];
        imageBase64 = base64Data;
        mimeType = selectedFile.type;
      }

      const response = await fetch('/api/parse-homework', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType,
          textPrompt,
          subject,
          language
        })
      });

      if (!response.ok) {
        throw new Error('Error al procesar la tarea con la IA.');
      }

      const aiData = await response.json();

      const quizId = 'quiz_' + Date.now();
      const newQuiz: QuizData = {
        id: quizId,
        userId: user ? user.uid : 'guest_user',
        title: aiData.title || `Tarea de ${subject}`,
        subject,
        language,
        sourceType: selectedFile ? 'homework_image' : 'homework_text',
        summary: aiData.summary,
        keyPoints: aiData.keyPoints,
        questions: aiData.questions || [],
        suggestedNextTopics: aiData.suggestedNextTopics,
        createdAt: new Date().toISOString()
      };

      if (user) {
        try {
          await setDoc(doc(db, 'quizzes', quizId), newQuiz);
        } catch (dbError) {
          handleFirestoreError(dbError, OperationType.CREATE, `quizzes/${quizId}`);
        }
      }

      clearInterval(interval);
      setLoading(false);
      onQuizReady(newQuiz);

    } catch (err: any) {
      clearInterval(interval);
      setLoading(false);
      console.error(err);
      alert(err.message || 'Ocurrió un error al procesar la tarea.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 pb-24 sm:pb-8">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-sky-100 to-indigo-100 rounded-3xl p-6 shadow-sm border border-sky-200 text-center">
          <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-2xs border border-sky-200">
            <Camera className="w-7 h-7 text-sky-700" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
            📸 Sube tu Tarea o Resumen
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md mx-auto font-medium">
            Toma una foto de tu cuaderno o escribe el tema. La IA creará un resumen claro y un juego de preguntas para ti.
          </p>
        </div>

        {/* Upload Form */}
        <form onSubmit={handleProcessHomework} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          
          {/* Subject & Language Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                <span>Materia Escolar</span>
              </label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="Ciencias">🔬 Ciencias Naturales</option>
                <option value="Matematicas">📐 Matemáticas</option>
                <option value="Historia">📜 Historia y Geografía</option>
                <option value="Literatura">📚 Literatura y Lectura</option>
                <option value="Ingles">🇬🇧 Idioma Inglés</option>
                <option value="General">🌟 Otro Tema</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center space-x-1">
                <Globe className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                <span>Idioma de Estudio</span>
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-bold text-sm focus:outline-none focus:border-amber-400"
              >
                <option value="espanol">🇪🇸 Español</option>
                <option value="ingles">🇬🇧 English (Inglés)</option>
                <option value="frances">🇫🇷 Français (Francés)</option>
              </select>
            </div>
          </div>

          {/* Image Uploader */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              📸 Foto de tu Tarea o Resumen
            </label>
            <div className="border-2 border-dashed border-sky-200 hover:border-sky-300 rounded-2xl p-5 text-center bg-sky-50/50 transition cursor-pointer relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              {previewUrl ? (
                <div className="space-y-2">
                  <img src={previewUrl} alt="Preview" className="max-h-40 mx-auto rounded-xl border border-slate-200 shadow-2xs object-contain" />
                  <p className="text-xs text-emerald-700 font-bold">¡Imagen cargada con éxito! Haz clic para cambiar.</p>
                </div>
              ) : (
                <div className="space-y-2 py-4">
                  <Upload className="w-10 h-10 text-sky-600 mx-auto" />
                  <p className="text-sm font-bold text-slate-700">Arrastra una foto aquí o haz clic para seleccionar</p>
                  <p className="text-xs text-slate-500">Soporta PNG, JPG o WEBP</p>
                </div>
              )}
            </div>
          </div>

          {/* Text Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ✍️ O escribe de qué trata tu tarea o lo que quieres estudiar
            </label>
            <textarea
              value={textPrompt}
              onChange={(e) => setTextPrompt(e.target.value)}
              placeholder="Ej: Las plantas y la fotosíntesis, el sistema solar, verbos en pasado en inglés..."
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-slate-800 placeholder-slate-400 font-medium text-sm focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-3.5 rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 text-base disabled:opacity-50 border border-amber-400"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analizando con IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>¡Crear Resumen y Quiz Mágico!</span>
              </>
            )}
          </button>

        </form>

        {/* Loading Overlay Modal */}
        {loading && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-xl">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto shadow-2xs border border-amber-200">
                <Sparkles className="w-8 h-8 text-amber-700 animate-spin-slow" />
              </div>
              <h3 className="text-xl font-black text-indigo-950">Preparando tu Aventura</h3>
              <p className="text-slate-600 font-medium text-xs sm:text-sm min-h-[50px] flex items-center justify-center">
                {loadingMessages[loadingStep]}
              </p>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                <div className="bg-amber-400 h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
