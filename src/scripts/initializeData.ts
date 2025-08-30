// Run this script to initialize sample quiz questions and badges in Firebase
// Usage: npx tsx src/scripts/initializeData.ts

import { config } from 'dotenv';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, writeBatch, getDocs } from "firebase/firestore";
import { QuizQuestion, Badge } from "../lib/types";

// Load environment variables from .env
config({ path: '.env' });

// Validate environment variables
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    console.log('Please create a .env.local file with your Firebase configuration.');
    process.exit(1);
  }
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const sampleQuestions: Omit<QuizQuestion, 'id'>[] = [
  // Math Questions
  {
    category: 'math',
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'math',
    question: 'If x + 5 = 12, what is the value of x?',
    options: ['5', '6', '7', '8'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'math',
    question: 'What is the area of a circle with radius 4?',
    options: ['12π', '16π', '8π', '4π'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'math',
    question: 'Solve: 2x² - 8 = 0',
    options: ['x = ±2', 'x = ±4', 'x = ±1', 'x = ±3'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'math',
    question: 'What is the derivative of x³?',
    options: ['x²', '2x²', '3x²', '4x²'],
    correctAnswer: 2,
    difficulty: 'hard',
    points: 5
  },

  // Aptitude Questions
  {
    category: 'aptitude',
    question: 'If BOOK is coded as CPPL, how is WORD coded?',
    options: ['XPSE', 'XQSE', 'YPSE', 'XPSD'],
    correctAnswer: 0,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'Complete the series: 2, 6, 12, 20, ?',
    options: ['28', '30', '32', '34'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'A train travels 60 km in 45 minutes. What is its speed in km/h?',
    options: ['75', '80', '85', '90'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'If all roses are flowers and some flowers are red, which conclusion is correct?',
    options: ['All roses are red', 'Some roses are red', 'No roses are red', 'Cannot be determined'],
    correctAnswer: 3,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'aptitude',
    question: 'What comes next in the pattern: A1, C3, E5, G7, ?',
    options: ['H8', 'I9', 'J10', 'K11'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },

  // Grammar Questions
  {
    category: 'grammar',
    question: 'Choose the correct sentence:',
    options: [
      'Neither John nor his friends was present.',
      'Neither John nor his friends were present.',
      'Neither John or his friends were present.',
      'Neither John and his friends were present.'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'grammar',
    question: 'What is the past participle of "swim"?',
    options: ['swam', 'swum', 'swimmed', 'swimming'],
    correctAnswer: 1,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Identify the type of sentence: "What a beautiful day!"',
    options: ['Declarative', 'Interrogative', 'Imperative', 'Exclamatory'],
    correctAnswer: 3,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Choose the correct form: "I wish I _____ taller."',
    options: ['am', 'was', 'were', 'will be'],
    correctAnswer: 2,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'grammar',
    question: 'Which sentence uses the subjunctive mood correctly?',
    options: [
      'If I was rich, I would travel.',
      'If I were rich, I would travel.',
      'If I am rich, I would travel.',
      'If I will be rich, I would travel.'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },

  // Programming Questions
  {
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
  },
  {
    category: 'programming',
    question: 'Which of these is NOT a JavaScript data type?',
    options: ['string', 'boolean', 'integer', 'undefined'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  },
  {
    category: 'programming',
    question: 'What is the time complexity of binary search?',
    options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'],
    correctAnswer: 1,
    difficulty: 'medium',
    points: 5
  },
  {
    category: 'programming',
    question: 'In Python, what does the "yield" keyword do?',
    options: [
      'Returns a value and exits the function',
      'Creates a generator function',
      'Raises an exception',
      'Imports a module'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    points: 5
  },
  {
    category: 'programming',
    question: 'Which SQL command is used to retrieve data from a database?',
    options: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'],
    correctAnswer: 2,
    difficulty: 'easy',
    points: 5
  }
];

// Define badge data without IDs
interface BaseBadge extends Omit<Badge, 'id'> {}

const baseBadges: BaseBadge[] = [
  // Purchasable Badges
  {
    name: 'Bronze Collector',
    description: 'A shiny bronze badge for dedicated learners',
    price: 1000,
    icon: 'award',
    color: 'amber'
  },
  {
    name: 'Silver Scholar',
    description: 'A prestigious silver badge for committed students',
    price: 2000,
    icon: 'star',
    color: 'gray'
  },
  {
    name: 'Gold Master',
    description: 'An exclusive gold badge for top performers',
    price: 5000,
    icon: 'crown',
    color: 'yellow'
  },
  {
    name: 'Platinum Elite',
    description: 'The ultimate platinum badge for VitaCoin legends',
    price: 10000,
    icon: 'trophy',
    color: 'blue'
  },
  {
    name: 'Diamond Champion',
    description: 'The rarest diamond badge for true champions',
    price: 20000,
    icon: 'zap',
    color: 'purple'
  },

  // Streak Badges - Login
  {
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
    name: 'Dedicated Student',
    description: 'Login for 30 consecutive days',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 30
    },
    icon: 'target',
    color: 'purple'
  },
  {
    name: 'Login Legend',
    description: 'Login for 100 consecutive days',
    requirement: {
      type: 'streak',
      category: 'login',
      value: 100
    },
    icon: 'crown',
    color: 'yellow'
  },

  // Quiz Streak Badges
  {
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
    name: 'Logic Master',
    description: 'Complete aptitude quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'aptitude',
      value: 7
    },
    icon: 'zap',
    color: 'purple'
  },
  {
    name: 'Grammar Guru',
    description: 'Complete grammar quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'grammar',
      value: 7
    },
    icon: 'zap',
    color: 'green'
  },
  {
    name: 'Code Warrior',
    description: 'Complete programming quizzes for 7 consecutive days',
    requirement: {
      type: 'streak',
      category: 'programming',
      value: 7
    },
    icon: 'zap',
    color: 'orange'
  },

  // Perfect Score Badges
  {
    name: 'Perfect Day',
    description: 'Score 100% on all quiz categories in one day',
    requirement: {
      type: 'perfect',
      category: 'daily',
      value: 1
    },
    icon: 'star',
    color: 'yellow'
  },
  {
    name: 'Perfect Week',
    description: 'Score 100% on all quizzes for 7 consecutive days',
    requirement: {
      type: 'perfect',
      category: 'weekly',
      value: 7
    },
    icon: 'crown',
    color: 'purple'
  },
  {
    name: 'Perfect Month',
    description: 'Score 100% on all quizzes for 30 consecutive days',
    requirement: {
      type: 'perfect',
      category: 'monthly',
      value: 30
    },
    icon: 'trophy',
    color: 'gold'
  }
];

async function initializeQuestions() {
  console.log('Initializing quiz questions...');
  
  for (const question of sampleQuestions) {
    const docRef = doc(collection(db, 'quizQuestions'));
    await setDoc(docRef, question);
  }
  
  console.log(`✅ Added ${sampleQuestions.length} quiz questions`);
}

const initializeBadges = async () => {
  try {
    const batch = writeBatch(db);
    const badgesRef = collection(db, 'badges');
    
    // First, check if badges already exist
    const snapshot = await getDocs(badgesRef);
    if (!snapshot.empty) {
      console.log('Deleting existing badges before reinitialization...');
      // Delete existing badges to avoid duplicates
      const deleteBatch = writeBatch(db);
      snapshot.docs.forEach((doc: any) => {
        deleteBatch.delete(doc.ref);
      });
      await deleteBatch.commit();
    }

    console.log('Initializing badges...');
    
    // Add each badge with its ID as the document ID
    const badgesToCreate = baseBadges.map((badge, index) => ({
      id: `badge-${index + 1}`,
      ...badge
    }));
    
    badgesToCreate.forEach(badge => {
      const badgeRef = doc(db, 'badges', badge.id);
      batch.set(badgeRef, {
        id: badge.id,
        name: badge.name,
        description: badge.description,
        price: badge.price || 0,
        icon: badge.icon || 'award',
        color: badge.color || 'gray',
        ...(badge.requirement && { requirement: badge.requirement }),
        createdAt: new Date().toISOString()
      });
    });
    
    await batch.commit();
    console.log(`✅ Successfully initialized ${badgesToCreate.length} badges`);
  } catch (error) {
    console.error('❌ Error initializing badges:', error);
    throw error;
  }
};

async function main() {
  try {
    console.log('🚀 Starting VitaCoin data initialization...');
    
    await initializeQuestions();
    await initializeBadges();
    
    console.log('🎉 VitaCoin data initialization completed successfully!');
    console.log('\nYour VitaCoin app now has:');
    console.log(`- ${sampleQuestions.length} quiz questions across 4 categories`);
    console.log('\nUsers can now:');
    console.log('- Take daily quizzes in Math, Aptitude, Grammar, and Programming');
    console.log('- Earn coins and maintain streaks');
    console.log('- Purchase badges and earn achievement badges');
    console.log('- View analytics and receive notifications');
    
  } catch (error) {
    console.error('❌ Error initializing data:', error);
    process.exit(1);
  }
}

main();
