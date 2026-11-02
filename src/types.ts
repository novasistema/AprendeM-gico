export interface UserProfile {
  uid: string;
  displayName: string;
  email?: string;
  xp: number;
  coins: number;
  level: number;
  streak: number;
  avatarConfig: {
    base: string;
    hat: string;
    glasses: string;
    color: string;
  };
  unlockedItems: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizData {
  id: string;
  userId: string;
  title: string;
  subject: string;
  language: string;
  sourceType: 'homework_image' | 'homework_text' | 'topic_generator' | 'language_practice';
  summary?: string;
  keyPoints?: string[];
  questions: Question[];
  suggestedNextTopics?: string[];
  createdAt: string;
}

export interface StudySession {
  id: string;
  userId: string;
  quizId?: string;
  score: number;
  totalQuestions: number;
  coinsEarned: number;
  xpEarned: number;
  completedAt: string;
}

export type AppView = 'dashboard' | 'homework' | 'quiz' | 'language' | 'shop' | 'stats';
