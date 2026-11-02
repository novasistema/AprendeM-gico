import React, { useState, useEffect } from 'react';
import { UserProfile, AppView, QuizData } from './types';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { HomeworkUploader } from './components/HomeworkUploader';
import { QuizGame } from './components/QuizGame';
import { LanguageHub } from './components/LanguageHub';
import { AvatarShop } from './components/AvatarShop';
import { StatsModal } from './components/StatsModal';
import { AuthModal } from './components/AuthModal';
import { StudyBuddyModal } from './components/StudyBuddyModal';
import { auth, db, handleFirestoreError, OperationType } from './firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, getDocs, doc, getDoc } from 'firebase/firestore';

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [quizzes, setQuizzes] = useState<QuizData[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizData | null>(null);
  
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showStudyBuddyModal, setShowStudyBuddyModal] = useState(false);

  // Auth state observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userRef = doc(db, 'users', firebaseUser.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            setUser(userSnap.data() as UserProfile);
          }
        } catch (err) {
          handleFirestoreError(err, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const qRef = collection(db, 'quizzes');
        const snap = await getDocs(qRef);
        const list: QuizData[] = [];
        snap.forEach(docSnap => {
          list.push(docSnap.data() as QuizData);
        });
        setQuizzes(list);
      } catch (err) {
        console.warn('Could not fetch quizzes, using local state or empty:', err);
      }
    };
    fetchQuizzes();
  }, [user]);

  const handleSelectQuiz = (quiz: QuizData) => {
    setActiveQuiz(quiz);
    setCurrentView('quiz');
  };

  const handleUpdateUserStats = (addedXp: number, addedCoins: number) => {
    if (user) {
      const newXp = user.xp + addedXp;
      const newCoins = user.coins + addedCoins;
      const newLevel = Math.floor(newXp / 100) + 1;
      setUser({
        ...user,
        xp: newXp,
        coins: newCoins,
        level: newLevel
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setCurrentView('dashboard');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-indigo-950 font-sans selection:bg-yellow-400 selection:text-indigo-950">
      
      {/* Navbar */}
      <Navbar
        user={user}
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== 'quiz') setActiveQuiz(null);
        }}
        onOpenAuth={() => setShowAuthModal(true)}
        onOpenStats={() => setShowStatsModal(true)}
        onOpenStudyBuddy={() => setShowStudyBuddyModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Main Content Router */}
      <main>
        {currentView === 'dashboard' && (
          <Dashboard
            user={user}
            quizzes={quizzes}
            onNavigate={setCurrentView}
            onSelectQuiz={handleSelectQuiz}
            onOpenAuth={() => setShowAuthModal(true)}
            onOpenStudyBuddy={() => setShowStudyBuddyModal(true)}
          />
        )}

        {currentView === 'homework' && (
          <HomeworkUploader
            user={user}
            onQuizReady={(quiz) => {
              setQuizzes(prev => [quiz, ...prev]);
              setActiveQuiz(quiz);
              setCurrentView('quiz');
            }}
          />
        )}

        {currentView === 'quiz' && activeQuiz && (
          <QuizGame
            quiz={activeQuiz}
            user={user}
            onFinish={() => setCurrentView('dashboard')}
            onUpdateUserStats={handleUpdateUserStats}
          />
        )}

        {currentView === 'language' && (
          <LanguageHub
            user={user}
            onQuizReady={(quiz) => {
              setQuizzes(prev => [quiz, ...prev]);
              setActiveQuiz(quiz);
              setCurrentView('quiz');
            }}
          />
        )}

        {currentView === 'shop' && (
          <AvatarShop
            user={user}
            onUpdateUser={(updated) => setUser(updated)}
          />
        )}
      </main>

      {/* Modals */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(profile) => setUser(profile)}
        />
      )}

      {showStatsModal && (
        <StatsModal
          user={user}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {showStudyBuddyModal && (
        <StudyBuddyModal
          onClose={() => setShowStudyBuddyModal(false)}
        />
      )}

    </div>
  );
}
