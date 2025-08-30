// Simple test data initialization script that works without environment variables
// This creates sample data directly in the component for testing

import { Badge, QuizQuestion } from "../lib/types";

export const sampleBadges: Badge[] = [
  // Purchasable Badges
  {
    id: 'bronze-collector',
    name: 'Bronze Collector',
    description: 'A shiny bronze badge for dedicated learners',
    price: 1000,
    icon: 'award',
    color: 'amber'
  },
  {
    id: 'silver-scholar',
    name: 'Silver Scholar',
    description: 'A prestigious silver badge for committed students',
    price: 2000,
    icon: 'star',
    color: 'gray'
  },
  {
    id: 'gold-master',
    name: 'Gold Master',
    description: 'An exclusive gold badge for top performers',
    price: 5000,
    icon: 'crown',
    color: 'yellow'
  },
  {
    id: 'platinum-elite',
    name: 'Platinum Elite',
    description: 'The ultimate platinum badge for VitaCoin legends',
    price: 10000,
    icon: 'trophy',
    color: 'blue'
  },
  {
    id: 'diamond-champion',
    name: 'Diamond Champion',
    description: 'The rarest diamond badge for true champions',
    price: 20000,
    icon: 'zap',
    color: 'purple'
  },

  // Achievement Badges
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Login for 1 consecutive day',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 1
    },
    icon: 'target',
    color: 'green'
  },
  {
    id: 'consistent-learner',
    name: 'Consistent Learner',
    description: 'Login for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 7
    },
    icon: 'target',
    color: 'blue'
  },
  {
    id: 'math-enthusiast',
    name: 'Math Enthusiast',
    description: 'Complete math quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'math',
      value: 7
    },
    icon: 'zap',
    color: 'blue'
  },
  {
    id: 'perfect-day',
    name: 'Perfect Day',
    description: 'Score 100% on all quiz categories in one day',
    requirement: {
      type: 'perfect',
      category: 'daily',
      value: 1
    },
    icon: 'star',
    color: 'yellow'
  }
];

export const sampleQuestions: QuizQuestion[] = [
  {
    id: 'math-1',
    category: 'math',
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    id: 'math-2',
    category: 'math',
    question: 'If x + 5 = 12, what is the value of x?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    id: 'aptitude-1',
    category: 'aptitude',
    question: 'If BOOK is coded as CPPL, how is WORD coded?',
    options: ['XPSE', 'XQSE', 'YPSE', 'XPSD'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 5
  },
  {
    id: 'grammar-1',
    category: 'grammar',
    question: 'What is the past participle of "swim"?',
    options: ['swam', 'swum', 'swimmed', 'swimming'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    id: 'programming-1',
    category: 'programming',
    question: 'What does "HTML" stand for?',
    options: [
      'Hypertext Markup Language',
      'High Tech Modern Language',
      'Home Tool Markup Language',
      'Hyperlink and Text Markup Language'
    ],
    correctAnswer: 0,
    difficulty: 'easy',
    points: 5
  }
];
