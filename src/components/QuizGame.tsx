import React, { useState } from 'react';
import { QuizData, UserProfile } from '../types';
import { Sparkles, Trophy, Coins, CheckCircle, XCircle, ArrowRight, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { db, handleFirestoreError, OperationType } from '../firebaseConfig';
import { doc, updateDoc, setDoc, increment } from 'firebase/firestore';

interface QuizGameProps {
  quiz: QuizData;
  user: UserProfile | null;
  onFinish: () => void;
  onUpdateUserStats: (addedXp: number, addedCoins: number) => void;
}

export const QuizGame: React.FC<QuizGameProps> = ({
  quiz,
  user,
  onFinish,
  onUpdateUserStats,
}) => {
  const [phase, setPhase] = useState<'summary' | 'playing' | 'results'>('summary');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [xpEarned, setXpEarned] = useState(0);

  const questions = quiz.questions || [];
  const currentQ = questions[currentQuestionIndex];

  const handleStartQuiz = () => {
    setPhase('playing');
  };

  const handleSelectOption = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    const correct = index === currentQ.correctIndex;
    setIsCorrect(correct);

    if (correct) {
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 }
      });
      setScore(prev => prev + 1);
      setCoinsEarned(prev => prev + 25);
      setXpEarned(prev => prev + 50);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setPhase('results');
      saveSessionResult();
    }
  };

  const saveSessionResult = async () => {
    const finalCoins = score * 25 + 10;
    const finalXp = score * 50 + 20;

    onUpdateUserStats(finalXp, finalCoins);

    if (user) {
      try {
        const sessionId = 'session_' + Date.now();
        await setDoc(doc(db, 'study_sessions', sessionId), {
          id: sessionId,
          userId: user.uid,
          quizId: quiz.id,
          score,
          totalQuestions: questions.length,
          coinsEarned: finalCoins,
          xpEarned: finalXp,
          completedAt: new Date().toISOString()
        });

        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          xp: increment(finalXp),
          coins: increment(finalCoins),
          streak: increment(1),
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user?.uid}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 sm:p-8 pb-24 sm:pb-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        
        {/* Phase 1: Summary & Key Points */}
        {phase === 'summary' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center space-x-1.5 bg-amber-100 text-amber-900 px-3.5 py-1 rounded-full font-bold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>RESUMEN • {quiz.subject}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950 tracking-tight">
                {quiz.title}
              </h2>
            </div>

            {quiz.summary && (
              <div className="bg-sky-50/60 rounded-2xl p-4 border border-sky-100 text-slate-700 text-sm sm:text-base leading-relaxed font-medium">
                {quiz.summary}
              </div>
            )}

            {quiz.keyPoints && quiz.keyPoints.length > 0 && (
              <div className="space-y-2.5">
                <h3 className="text-sm font-black text-indigo-950 flex items-center space-x-1.5">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Puntos Clave:</span>
                </h3>
                <ul className="space-y-2">
                  {quiz.keyPoints.map((point, idx) => (
                    <li key={idx} className="bg-slate-50 rounded-xl p-3 flex items-start space-x-2.5 border border-slate-200 text-xs sm:text-sm font-medium text-slate-700">
                      <span className="bg-amber-200 text-amber-950 font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs">
                        {idx + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={handleStartQuiz}
              className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-3.5 rounded-2xl shadow-sm transition flex items-center justify-center space-x-2 text-base border border-amber-400"
            >
              <span>¡Comenzar Desafío! 🚀</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Phase 2: Playing Quiz */}
        {phase === 'playing' && currentQ && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-5">
            
            {/* Header info */}
            <div className="flex justify-between items-center bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200">
              <span className="text-slate-700 font-bold text-xs sm:text-sm">
                Pregunta {currentQuestionIndex + 1} de {questions.length}
              </span>
              <div className="flex items-center space-x-2">
                <div className="flex items-center text-amber-800 text-xs font-bold bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                  <Coins className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-400" />
                  <span>+{coinsEarned}</span>
                </div>
                <div className="flex items-center text-emerald-800 text-xs font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Star className="w-3.5 h-3.5 mr-1 text-emerald-500 fill-emerald-400" />
                  <span>+{xpEarned} XP</span>
                </div>
              </div>
            </div>

            {/* Question title */}
            <div className="text-center py-2">
              <h3 className="text-xl sm:text-2xl font-black text-indigo-950 tracking-tight">
                {currentQ.question}
              </h3>
            </div>

            {/* Options */}
            <div className="grid grid-cols-1 gap-2.5">
              {currentQ.options.map((opt, idx) => {
                let btnStyle = "bg-slate-50 hover:bg-sky-50 border-slate-200 text-slate-800";
                if (selectedOption !== null) {
                  if (idx === currentQ.correctIndex) {
                    btnStyle = "bg-emerald-100 border-emerald-400 text-emerald-950 font-black";
                  } else if (idx === selectedOption) {
                    btnStyle = "bg-rose-100 border-rose-300 text-rose-950";
                  } else {
                    btnStyle = "bg-slate-50 opacity-40 border-slate-200 text-slate-500";
                  }
                }

                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    disabled={selectedOption !== null}
                    className={`w-full p-3.5 rounded-2xl border font-bold text-left transition flex items-center justify-between text-sm shadow-2xs ${btnStyle}`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="w-7 h-7 rounded-xl bg-white border border-slate-200 flex items-center justify-center font-black text-slate-700 text-xs">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </div>
                    {selectedOption !== null && idx === currentQ.correctIndex && (
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    )}
                    {selectedOption !== null && idx === selectedOption && idx !== currentQ.correctIndex && (
                      <XCircle className="w-5 h-5 text-rose-600" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Explanation & Next */}
            {selectedOption !== null && (
              <div className="bg-sky-50/80 rounded-2xl p-4 border border-sky-100 space-y-3">
                <div className="flex items-center space-x-1.5">
                  {isCorrect ? (
                    <span className="text-emerald-700 font-black text-sm flex items-center">
                      <CheckCircle className="w-5 h-5 mr-1.5 text-emerald-600" /> ¡Correcto! ¡Excelente trabajo! 🎉
                    </span>
                  ) : (
                    <span className="text-amber-800 font-black text-sm flex items-center">
                      <XCircle className="w-5 h-5 mr-1.5 text-amber-600" /> ¡Casi! La respuesta correcta era la {String.fromCharCode(65 + currentQ.correctIndex)}.
                    </span>
                  )}
                </div>
                <p className="text-slate-600 text-xs sm:text-sm font-medium">
                  {currentQ.explanation}
                </p>
                <button
                  onClick={handleNextQuestion}
                  className="w-full bg-amber-300 hover:bg-amber-400 text-amber-950 font-black py-3 rounded-xl shadow-2xs flex items-center justify-center space-x-1.5 text-sm transition border border-amber-400"
                >
                  <span>{currentQuestionIndex + 1 < questions.length ? 'Siguiente Pregunta ➡️' : 'Ver Resultados Finales 🏆'}</span>
                </button>
              </div>
            )}

          </div>
        )}

        {/* Phase 3: Results */}
        {phase === 'results' && (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-5">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto shadow-sm border-2 border-amber-200">
              <Trophy className="w-10 h-10 text-amber-700" />
            </div>

            <div className="space-y-1">
              <h2 className="text-2xl sm:text-3xl font-black text-indigo-950">¡Misión Cumplida! 🌟</h2>
              <p className="text-slate-600 text-sm font-medium">
                Completaste el quiz de <span className="text-indigo-950 font-bold">{quiz.subject}</span>
              </p>
            </div>

            <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 max-w-xs mx-auto space-y-3">
              <div className="text-3xl font-black text-indigo-950">
                {score} / {questions.length}
              </div>
              <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Aciertos Correctos</p>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-200">
                <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  <div className="text-lg font-black text-amber-800">+{coinsEarned}</div>
                  <div className="text-[11px] text-amber-700 font-bold">Monedas 🪙</div>
                </div>
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <div className="text-lg font-black text-emerald-800">+{xpEarned}</div>
                  <div className="text-[11px] text-emerald-700 font-bold">Puntos XP ⭐</div>
                </div>
              </div>
            </div>

            <button
              onClick={onFinish}
              className="bg-amber-300 hover:bg-amber-400 text-amber-950 font-black px-6 py-3 rounded-2xl shadow-sm transition text-sm border border-amber-400"
            >
              Volver al Inicio 🚀
            </button>

          </div>
        )}

      </div>
    </div>
  );
};
