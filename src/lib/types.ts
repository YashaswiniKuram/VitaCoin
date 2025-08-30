import type { Timestamp } from 'firebase/firestore';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  coins: number;
  lastBonusClaimed: Timestamp | null;
  loginStreak: number;
  lastLoginDate: Timestamp | null;
  quizStreaks: {
    math: number;
    aptitude: number;
    grammar: number;
    programming: number;
  };
  lastQuizDates: {
    math: Timestamp | null;
    aptitude: Timestamp | null;
    grammar: Timestamp | null;
    programming: Timestamp | null;
  };
  badges: string[];
  totalQuizCorrect: {
    math: number;
    aptitude: number;
    grammar: number;
    programming: number;
  };
  perfectDays: number; // Days with all quizzes completed correctly
  perfectWeeks: number;
  totalQuizzesTaken: number;
  rank?: number; // User's rank on the leaderboard
  perfectMonths: number;
  createdAt: Timestamp;
  [key: string]: any; // Allow additional properties
}

export interface Transaction {
  id: string;
  amount: number;
  description: string;
  timestamp: Timestamp;
  type: 'credit' | 'debit';
  category?: 'bonus' | 'quiz' | 'penalty' | 'badge' | 'welcome';
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  price?: number; // For purchasable badges
  requirement?: {
    type: 'streak' | 'perfect' | 'coins';
    category?: 'login' | 'math' | 'aptitude' | 'grammar' | 'programming' | 'daily' | 'weekly' | 'monthly';
    value: number;
  };
  icon: string;
  color: string;
}

export interface QuizQuestion {
  id: string;
  category: 'math' | 'aptitude' | 'grammar' | 'programming';
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
}

export interface QuizResult {
  id: string;
  userId: string;
  category: 'math' | 'aptitude' | 'grammar' | 'programming';
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  coinsEarned: number;
  timestamp: Timestamp;
  questions: QuizQuestion[];
  userAnswers: number[];
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'leaderboard' | 'penalty' | 'achievement' | 'reminder';
  read: boolean;
  timestamp: Timestamp;
}

export interface LeaderboardEntry {
  uid: string;
  displayName: string;
  coins: number;
  badges: string[];
  rank: number;
  previousRank?: number;
}

export type QuizCategory = 'math' | 'aptitude' | 'grammar' | 'programming';

export interface DailyStats {
  date: string; // YYYY-MM-DD format
  coinsEarned: number;
  quizzesTaken: number;
  loginBonus: number;
  penalties: number;
  transactions: Array<{
    amount: number;
    type: 'credit' | 'debit';
    category?: 'bonus' | 'quiz' | 'penalty' | 'badge' | 'welcome';
    description: string;
    timestamp: Date | { toDate: () => Date };
  }>;
}
