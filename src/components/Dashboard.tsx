import React from 'react';
import { UserProfile, AppView, QuizData } from '../types';
import { Camera, Globe, Sparkles, ShoppingBag, Trophy, Flame, Star, ArrowRight, Play, BookOpen } from 'lucide-react';

interface DashboardProps {
  user: UserProfile | null;
  quizzes: QuizData[];
  onNavigate: (view: AppView) => void;
  onSelectQuiz: (quiz: QuizData) => void;
  onOpenAuth: () => void;
  onOpenStudyBuddy: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  user,
  quizzes,
  onNavigate,
  onSelectQuiz,
  onOpenAuth,
  onOpenStudyBuddy,
}) => {
  const currentXP = user?.xp || 0;
  const currentLevel = user?.level || 1;
  const xpNeededForNextLevel = currentLevel * 100;
  const xpProgress = Math.min(100, (currentXP / xpNeededForNextLevel) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 pb-24 sm:pb-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Hero Welcome Banner */}
        <div className="relative bg-gradient-to-r from-sky-100 via-purple-100 to-amber-100 rounded-3xl p-6 sm:p-8 shadow-sm border border-purple-200 overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center md:text-left">
              <div className="inline-flex items-center space-x-2 bg-amber-200 text-amber-900 px-3.5 py-1 rounded-full font-bold text-xs shadow-2xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>NIVEL {currentLevel} • EXPLORADOR ESTELAR</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-indigo-950 tracking-tight">
                ¡Hola, {user ? user.displayName : 'Aventurero'}! 🌟
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-xl font-medium leading-relaxed">
                ¿Qué misión cumpliremos hoy? Sube tu tarea, aprende idiomas o pon a prueba tu mente con quizzes divertidos.
              </p>
              
              {!user && (
                <button
                  onClick={onOpenAuth}
                  className="mt-2 bg-amber-300 hover:bg-amber-400 text-amber-950 font-black px-5 py-2.5 rounded-2xl shadow-sm transition inline-flex items-center space-x-2 text-sm border border-amber-400"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>¡Inicia sesión para guardar tu progreso!</span>
                </button>
              )}
            </div>

            {/* Avatar & Level Card */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 border border-purple-100 text-center flex flex-col items-center w-full sm:w-56 shadow-sm">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-200 to-amber-300 rounded-2xl flex items-center justify-center text-3xl shadow-xs mb-2 border-2 border-white">
                {user?.avatarConfig?.base || '🦁'}
              </div>
              <span className="font-extrabold text-sm text-indigo-950 truncate max-w-[180px]">
                {user ? user.displayName : 'Invitado'}
              </span>
              <div className="w-full mt-2">
                <div className="flex justify-between text-[11px] font-bold mb-1 text-slate-500">
                  <span>EXP: {currentXP}</span>
                  <span>Meta: {xpNeededForNextLevel}</span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-200">
                  <div 
                    className="bg-gradient-to-r from-amber-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${xpProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Action Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          
          {/* Card 1: Subir Tarea con IA */}
          <div 
            onClick={() => onNavigate('homework')}
            className="group bg-white hover:bg-sky-50 rounded-3xl p-6 shadow-sm border border-sky-100 cursor-pointer transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center mb-4 border border-sky-200 group-hover:scale-105 transition">
                <Camera className="w-6 h-6 text-sky-700" />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-2">📸 Sube tu Tarea</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Toma una foto a tu cuaderno o resumen. La IA creará un resumen claro y un juego de preguntas interactivo.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-sky-700 font-bold text-xs">
              <span>Probar IA</span>
              <div className="w-7 h-7 bg-sky-100 rounded-full flex items-center justify-center group-hover:translate-x-1 transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 2: Idiomas y Inglés */}
          <div 
            onClick={() => onNavigate('language')}
            className="group bg-white hover:bg-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-100 cursor-pointer transition duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4 border border-emerald-200 group-hover:scale-105 transition">
                <Globe className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-2">🌍 Idiomas (Inglés)</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Practica vocabulario, pronunciación y divertidas conversaciones en inglés, francés y español.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-emerald-700 font-bold text-xs">
              <span>Explorar Idiomas</span>
              <div className="w-7 h-7 bg-emerald-100 rounded-full flex items-center justify-center group-hover:translate-x-1 transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

          {/* Card 3: Tienda de Avatares */}
          <div 
            onClick={() => onNavigate('shop')}
            className="group bg-white hover:bg-amber-50 rounded-3xl p-6 shadow-sm border border-amber-100 cursor-pointer transition duration-200 flex flex-col justify-between sm:col-span-2 lg:col-span-1"
          >
            <div>
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-4 border border-amber-200 group-hover:scale-105 transition">
                <ShoppingBag className="w-6 h-6 text-amber-700" />
              </div>
              <h3 className="text-xl font-black text-indigo-950 mb-2">🎒 Tienda Mágica</h3>
              <p className="text-slate-600 text-xs sm:text-sm font-medium leading-relaxed">
                Gasta tus monedas ganadas estudiando para desbloquear sombreros, gafas y accesorios geniales.
              </p>
            </div>
            <div className="mt-5 flex items-center justify-between text-amber-700 font-bold text-xs">
              <span>Visitar Tienda</span>
              <div className="w-7 h-7 bg-amber-100 rounded-full flex items-center justify-center group-hover:translate-x-1 transition">
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>

        </div>

        {/* Quizzes / Study History Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-indigo-950 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <span>Tus Quizzes Guardados ({quizzes.length})</span>
            </h3>
            <button
              onClick={() => onOpenStudyBuddy()}
              className="bg-purple-100 hover:bg-purple-200 text-purple-900 px-3.5 py-2 rounded-xl text-xs font-bold shadow-2xs flex items-center space-x-1 transition"
            >
              <span>🤖 RoboAmigo</span>
            </button>
          </div>

          {quizzes.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-100">
              <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-indigo-950">Aún no hay quizzes guardados</h4>
              <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto font-medium">
                Sube tu primera foto de tarea o resumen arriba para crear tu primer desafío.
              </p>
              <button
                onClick={() => onNavigate('homework')}
                className="mt-3 bg-amber-300 hover:bg-amber-400 text-amber-950 font-black px-5 py-2 rounded-xl text-xs shadow-sm transition"
              >
                Subir Primera Tarea
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="bg-slate-50 hover:bg-amber-50/50 rounded-2xl p-4 border border-slate-200 transition flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="bg-amber-100 text-amber-900 font-bold text-[11px] px-2.5 py-0.5 rounded-full uppercase">
                        {quiz.subject || 'Estudio'}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {quiz.questions?.length || 0} preguntas
                      </span>
                    </div>
                    <h4 className="font-extrabold text-base text-indigo-950 line-clamp-2 mb-1.5">
                      {quiz.title}
                    </h4>
                    <p className="text-slate-600 text-xs line-clamp-2 mb-4 font-medium">
                      {quiz.summary || 'Resumen listo para repasar.'}
                    </p>
                  </div>
                  <button
                    onClick={() => onSelectQuiz(quiz)}
                    className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-2.5 rounded-xl shadow-2xs flex items-center justify-center space-x-1.5 text-xs transition"
                  >
                    <Play className="w-3.5 h-3.5 fill-amber-950" />
                    <span>¡Jugar Quiz!</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
