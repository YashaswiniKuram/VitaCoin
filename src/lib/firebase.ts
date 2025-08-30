import { initializeApp, getApps, getApp } from "firebase/app";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp,
  where,
  addDoc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { UserData, Transaction, QuizQuestion, QuizResult, Notification, Badge, QuizCategory, LeaderboardEntry } from './types';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "your-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "your-auth-domain",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "your-project-id",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "your-storage-bucket",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "your-messaging-sender-id",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "your-app-id",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// --- AUTH FUNCTIONS ---

export const signUp = async (email: string, password: string, displayName: string) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  
  // Update profile with display name
  await updateProfile(user, { displayName });
  
  // Set persistence for the auth session
  await setPersistence(auth, browserLocalPersistence);

  // Create user document in Firestore
  const userRef = doc(db, "users", user.uid);
  const initialUserData: Omit<UserData, 'uid' | 'email'> = {
    displayName: displayName,
    coins: 500, // Onboarding credit
    lastBonusClaimed: null,
    loginStreak: 0,
    lastLoginDate: null,
    quizStreaks: {
      math: 0,
      aptitude: 0,
      grammar: 0,
      programming: 0
    },
    lastQuizDates: {
      math: null,
      aptitude: null,
      grammar: null,
      programming: null
    },
    badges: [],
    totalQuizCorrect: {
      math: 0,
      aptitude: 0,
      grammar: 0,
      programming: 0
    },
    perfectDays: 0,
    perfectWeeks: 0,
    perfectMonths: 0,
    createdAt: serverTimestamp() as Timestamp,
  };
  await setDoc(userRef, { ...initialUserData, email: user.email, uid: user.uid });

  // Add initial transaction
  const transactionRef = doc(collection(db, `users/${user.uid}/transactions`));
  const initialTransaction: Omit<Transaction, 'id'> = {
      amount: 500,
      description: "Welcome bonus for joining VitaDash!",
      timestamp: serverTimestamp() as Timestamp,
      type: 'credit',
      category: 'welcome'
  };
  await setDoc(transactionRef, initialTransaction);

  return userCredential;
};

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  
  // Add these scopes if you need additional permissions
  provider.addScope('profile');
  provider.addScope('email');
  
  // Set the authentication persistence
  await setPersistence(auth, browserLocalPersistence);
  
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user is new
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // New user - create user document with initial data
      const userData = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'Anonymous',
        coins: 500, // Initial bonus
        lastBonusClaimed: null,
        loginStreak: 0,
        lastLoginDate: serverTimestamp(),
        quizStreaks: { math: 0, aptitude: 0, grammar: 0, programming: 0 },
        lastQuizDates: { math: null, aptitude: null, grammar: null, programming: null },
        badges: [],
        totalQuizCorrect: { math: 0, aptitude: 0, grammar: 0, programming: 0 },
        perfectDays: 0,
        perfectWeeks: 0,
        perfectMonths: 0,
        emailVerified: user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      await setDoc(doc(db, 'users', user.uid), userData);
      
      // Add welcome notification
      await addDoc(collection(db, 'users', user.uid, 'notifications'), {
        type: 'welcome',
        message: 'Welcome to VitaDash! You received 500 coins as a welcome bonus.',
        read: false,
        createdAt: serverTimestamp()
      });
      
      // Add welcome transaction
      const transactionRef = doc(collection(db, `users/${user.uid}/transactions`));
      await setDoc(transactionRef, {
        amount: 500,
        description: 'Welcome bonus for joining VitaDash!',
        timestamp: serverTimestamp(),
        type: 'credit',
        category: 'welcome'
      });
    } else if (!user.emailVerified) {
      // If email is not verified, update the user document
      await updateDoc(doc(db, 'users', user.uid), {
        emailVerified: user.emailVerified,
        updatedAt: serverTimestamp()
      });
    }
    
    return user;
  } catch (error: any) {
    console.error("Error signing in with Google:", error);
    
    // More specific error handling
    if (error.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is not authorized for OAuth operations. Please contact support.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('The sign-in popup was closed before completing the sign-in process.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('An account already exists with the same email but different sign-in credentials.');
    } else {
      throw new Error(error.message || 'Failed to sign in with Google. Please try again.');
    }
  }
};

export const signIn = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const signOut = () => {
  return firebaseSignOut(auth);
};

export const onAuthStateChanged = (callback: (user: any) => void) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

// --- FIRESTORE FUNCTIONS ---

export const getUserData = async (uid: string): Promise<UserData | null> => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return userSnap.data() as UserData;
  }
  return null;
};

export const getLeaderboard = async (userLimit: number = 10): Promise<UserData[]> => {
  const usersRef = collection(db, "users");
  const q = query(usersRef, orderBy("coins", "desc"), limit(userLimit));
  const querySnapshot = await getDocs(q);
  
  // Deduplicate users by uid to prevent duplicate keys
  const users = querySnapshot.docs.map(doc => doc.data() as UserData);
  const uniqueUsers = users.filter((user, index, self) => 
    index === self.findIndex(u => u.uid === user.uid)
  );
  
  return uniqueUsers;
};

export const getTransactions = async (uid: string): Promise<Transaction[]> => {
    const transactionsRef = collection(db, `users/${uid}/transactions`);
    const q = query(transactionsRef, orderBy("timestamp", "desc"), limit(20));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const claimDailyBonus = async (uid: string) => {
    const batch = writeBatch(db);
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("User not found");
    const userData = userSnap.data() as UserData;
    
    // Calculate streak and bonus amount
    const today = new Date();
    const lastLogin = userData.lastLoginDate?.toDate();
    let newStreak = 1;
    
    if (lastLogin) {
      const daysDiff = Math.floor((today.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1) {
        newStreak = userData.loginStreak + 1;
      } else if (daysDiff > 1) {
        // Streak broken, apply penalty
        await applyPenalty(uid, 'missed_login', userData.loginStreak * 5);
        newStreak = 1;
      }
    }
    
    const bonusAmount = 100 + (newStreak - 1) * 5; // Day 1: 100, Day 2: 105, etc.
    
    batch.update(userRef, {
        coins: userData.coins + bonusAmount,
        lastBonusClaimed: serverTimestamp(),
        loginStreak: newStreak,
        lastLoginDate: serverTimestamp()
    });

    const transactionRef = doc(collection(db, `users/${uid}/transactions`));
    const newTransaction: Omit<Transaction, 'id'> = {
      amount: bonusAmount,
      description: `Daily login bonus (${newStreak} day streak)`,
      timestamp: serverTimestamp() as Timestamp,
      type: 'credit',
      category: 'bonus'
    };
    batch.set(transactionRef, newTransaction);
    
    await batch.commit();
    
    // Check for streak badges
    await checkAndAwardBadges(uid, 'streak', newStreak, 'login');
};

export const updateUserCoinsAfterQuiz = async (uid: string, coinsEarned: number) => {
    if (coinsEarned <= 0) return;

    const batch = writeBatch(db);
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) throw new Error("User not found");
    const userData = userSnap.data() as UserData;

    batch.update(userRef, {
        coins: userData.coins + coinsEarned,
    });

    const transactionRef = doc(collection(db, `users/${uid}/transactions`));
    const newTransaction: Omit<Transaction, 'id'> = {
      amount: coinsEarned,
      description: `Daily quiz reward`,
      timestamp: serverTimestamp() as Timestamp,
      type: 'credit',
      category: 'quiz'
    };
    batch.set(transactionRef, newTransaction);

    await batch.commit();
}

// --- QUIZ FUNCTIONS ---

export const getQuizQuestions = async (category: QuizCategory): Promise<QuizQuestion[]> => {
  const questionsRef = collection(db, 'quizQuestions');
  const q = query(questionsRef, where('category', '==', category), limit(5));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as QuizQuestion));
};

export const submitQuizResult = async (uid: string, category: QuizCategory, questions: QuizQuestion[], userAnswers: number[]) => {
  const correctAnswers = userAnswers.filter((answer, index) => answer === questions[index].correctAnswer).length;
  const score = (correctAnswers / questions.length) * 100;
  const coinsEarned = correctAnswers * 5; // 5 coins per correct answer
  
  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  let userData: UserData;
  
  if (!userSnap.exists()) {
    // Create user document if it doesn't exist
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (!currentUser) throw new Error("User not authenticated");
    
    const initialUserData: Omit<UserData, 'uid' | 'email'> = {
      displayName: currentUser.displayName || 'User',
      coins: 500,
      lastBonusClaimed: null,
      loginStreak: 0,
      lastLoginDate: null,
      quizStreaks: { math: 0, aptitude: 0, grammar: 0, programming: 0 },
      lastQuizDates: { math: null, aptitude: null, grammar: null, programming: null },
      badges: [],
      totalQuizCorrect: { math: 0, aptitude: 0, grammar: 0, programming: 0 },
      perfectDays: 0,
      perfectWeeks: 0,
      perfectMonths: 0,
      createdAt: serverTimestamp() as Timestamp,
    };
    
    userData = { ...initialUserData, email: currentUser.email || '', uid: currentUser.uid } as UserData;
    batch.set(userRef, userData);
    
    // Add welcome transaction
    const welcomeTransactionRef = doc(collection(db, `users/${uid}/transactions`));
    const welcomeTransaction: Omit<Transaction, 'id'> = {
      amount: 500,
      description: "Welcome bonus for joining VitaCoin!",
      timestamp: serverTimestamp() as Timestamp,
      type: 'credit',
      category: 'welcome'
    };
    batch.set(welcomeTransactionRef, welcomeTransaction);
  } else {
    userData = userSnap.data() as UserData;
  }
  
  // Calculate quiz streak
  const today = new Date();
  const lastQuizDate = userData.lastQuizDates?.[category]?.toDate();
  let newStreak = 1;
  
  if (lastQuizDate) {
    const daysDiff = Math.floor((today.getTime() - lastQuizDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      newStreak = (userData.quizStreaks?.[category] || 0) + 1;
    } else if (daysDiff > 1) {
      // Apply penalty for missed quiz
      await applyPenalty(uid, 'missed_quiz', (userData.quizStreaks?.[category] || 0) * 2);
      newStreak = 1;
    }
  }
  
  // Update user data
  const updates: any = {
    coins: userData.coins + coinsEarned,
    [`quizStreaks.${category}`]: newStreak,
    [`lastQuizDates.${category}`]: serverTimestamp(),
    [`totalQuizCorrect.${category}`]: (userData.totalQuizCorrect?.[category] || 0) + correctAnswers
  };
  
  // Check for perfect day (all categories completed with 100% score)
  if (score === 100) {
    const allCategoriesCompleted = await checkAllCategoriesCompletedToday(uid);
    if (allCategoriesCompleted) {
      updates.perfectDays = userData.perfectDays + 1;
    }
  }
  
  batch.update(userRef, updates);
  
  // Add transaction
  const transactionRef = doc(collection(db, `users/${uid}/transactions`));
  const newTransaction: Omit<Transaction, 'id'> = {
    amount: coinsEarned,
    description: `${category} quiz: ${correctAnswers}/${questions.length} correct`,
    timestamp: serverTimestamp() as Timestamp,
    type: 'credit',
    category: 'quiz'
  };
  batch.set(transactionRef, newTransaction);
  
  // Save quiz result
  const quizResultRef = doc(collection(db, `users/${uid}/quizResults`));
  const quizResult: Omit<QuizResult, 'id'> = {
    userId: uid,
    category,
    score,
    totalQuestions: questions.length,
    correctAnswers,
    coinsEarned,
    timestamp: serverTimestamp() as Timestamp,
    questions,
    userAnswers
  };
  batch.set(quizResultRef, quizResult);
  
  await batch.commit();
  
  // Check for badges
  await checkAndAwardBadges(uid, 'streak', newStreak, category);
  if (score === 100) {
    await checkAndAwardBadges(uid, 'perfect_score', 1, category);
  }
  
  return { score, coinsEarned, correctAnswers };
};

// --- BADGE FUNCTIONS ---

export const getBadges = async (): Promise<Badge[]> => {
  try {
    const badgesRef = collection(db, 'badges');
    const querySnapshot = await getDocs(badgesRef);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      // Ensure we have all required fields with proper types
      return {
        id: doc.id,
        name: data.name || 'Unnamed Badge',
        description: data.description || '',
        price: data.price || 0,
        icon: data.icon || 'award',
        color: data.color || 'gray',
        ...(data.requirement && { requirement: data.requirement })
      } as Badge;
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return [];
  }
};

export const purchaseBadge = async (uid: string, badgeId: string) => {
  try {
    const batch = writeBatch(db);
    const userRef = doc(db, "users", uid);
    const badgeRef = doc(db, "badges", badgeId);
    
    const [userSnap, badgeSnap] = await Promise.all([getDoc(userRef), getDoc(badgeRef)]);
    
    if (!userSnap.exists()) throw new Error("User not found");
    if (!badgeSnap.exists()) throw new Error("Badge not found");
    
    const userData = userSnap.data() as UserData;
    const badge = badgeSnap.data() as Badge;
    
    // Validate user data structure
    if (!userData || typeof userData !== 'object') throw new Error("Invalid user data");
    if (typeof userData.coins !== 'number' || userData.coins < 0) throw new Error("Invalid user coin balance");
    
    // Validate badge data structure
    if (!badge || typeof badge !== 'object') throw new Error("Invalid badge data");
    if (!badge.id || typeof badge.id !== 'string') throw new Error("Invalid badge ID");
    
    // Ensure badges array exists and is valid
    if (!userData.badges || !Array.isArray(userData.badges)) {
      userData.badges = [];
    }
    
    // Validate that badges array contains only strings
    if (!userData.badges.every(id => typeof id === 'string')) {
      userData.badges = userData.badges.filter(id => typeof id === 'string');
    }
    
    if (!badge.price || typeof badge.price !== 'number' || badge.price <= 0) throw new Error("Badge is not purchasable");
    if (userData.coins < badge.price) throw new Error("Insufficient coins");
    if (!userData.badges || userData.badges.includes(badgeId)) throw new Error("Badge already owned");
    
    batch.update(userRef, {
      coins: userData.coins - badge.price,
      badges: arrayUnion(badgeId)
    });
    
    const transactionRef = doc(collection(db, `users/${uid}/transactions`));
    const newTransaction: Omit<Transaction, 'id'> = {
      amount: -badge.price,
      description: `Purchased badge: ${badge.name || 'Unknown Badge'}`,
      timestamp: serverTimestamp() as Timestamp,
      type: 'debit',
      category: 'badge'
    };
    batch.set(transactionRef, newTransaction);
    
    await batch.commit();
  } catch (error) {
    console.error('Error purchasing badge:', error);
    throw error; // Re-throw for user feedback
  }
};

export const checkAndAwardBadges = async (uid: string, type: string, value: number, category?: string) => {
  try {
    const badges = await getBadges();
    if (!badges || badges.length === 0) return;
    
    const userRef = doc(db, "users", uid);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) return;
    const userData = userSnap.data() as UserData;
    
    // Ensure badges array exists
    if (!userData.badges) {
      userData.badges = [];
    }
    
    // Ensure badges array is valid and contains only strings
    if (!Array.isArray(userData.badges)) {
      userData.badges = [];
    } else if (!userData.badges.every(id => typeof id === 'string')) {
      userData.badges = userData.badges.filter(id => typeof id === 'string');
    }
    
    const eligibleBadges = badges.filter(badge => {
      // Validate badge structure
      if (!badge || typeof badge !== 'object') return false;
      if (!badge.id || typeof badge.id !== 'string') return false;
      if (!userData.badges || userData.badges.includes(badge.id)) return false;
      if (!badge.requirement || typeof badge.requirement !== 'object') return false;
      
      const req = badge.requirement;
      if (!req.type || req.type !== type) return false;
      if (category && req.category !== category) return false;
      if (typeof req.value !== 'number') return false;
      
      return value >= req.value;
    });
    
    if (eligibleBadges.length > 0) {
      const batch = writeBatch(db);
      const newBadgeIds = eligibleBadges.map(b => b.id).filter(Boolean);
      
      if (newBadgeIds.length > 0) {
        batch.update(userRef, {
          badges: arrayUnion(...newBadgeIds)
        });
        
        // Add notification for each badge
        for (const badge of eligibleBadges) {
          if (badge && badge.name && typeof badge.name === 'string') {
            const notificationRef = doc(collection(db, `users/${uid}/notifications`));
            const notification: Omit<Notification, 'id'> = {
              userId: uid,
              title: "New Badge Earned!",
              message: `You've earned the "${badge.name}" badge!`,
              type: 'achievement',
              read: false,
              timestamp: serverTimestamp() as Timestamp
            };
            batch.set(notificationRef, notification);
          }
        }
        
        await batch.commit();
      }
    }
  } catch (error) {
    console.error('Error checking and awarding badges:', error);
    // Don't throw error to prevent quiz submission from failing
  }
};

// --- PENALTY FUNCTIONS ---

export const applyPenalty = async (uid: string, type: 'missed_login' | 'missed_quiz', amount: number) => {
  if (amount <= 0) return;
  
  const batch = writeBatch(db);
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);
  
  if (!userSnap.exists()) return;
  const userData = userSnap.data() as UserData;
  
  const penaltyAmount = Math.min(amount, userData.coins); // Don't go below 0 coins
  
  batch.update(userRef, {
    coins: Math.max(0, userData.coins - penaltyAmount)
  });
  
  const transactionRef = doc(collection(db, `users/${uid}/transactions`));
  const newTransaction: Omit<Transaction, 'id'> = {
    amount: -penaltyAmount,
    description: type === 'missed_login' ? 'Penalty for missed daily login' : 'Penalty for missed daily quiz',
    timestamp: serverTimestamp() as Timestamp,
    type: 'debit',
    category: 'penalty'
  };
  batch.set(transactionRef, newTransaction);
  
  // Add motivational notification
  const notificationRef = doc(collection(db, `users/${uid}/notifications`));
  const motivationalMessages = [
    "Don't give up! Every expert was once a beginner.",
    "Consistency is key to success. You've got this!",
    "Small steps every day lead to big results.",
    "Your comeback is always stronger than your setback!",
    "Progress, not perfection. Keep going!"
  ];
  
  const notification: Omit<Notification, 'id'> = {
    userId: uid,
    title: "Stay Motivated!",
    message: motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)],
    type: 'penalty',
    read: false,
    timestamp: serverTimestamp() as Timestamp
  };
  batch.set(notificationRef, notification);
  
  await batch.commit();
};

// --- NOTIFICATION FUNCTIONS ---

export const getNotifications = async (uid: string): Promise<Notification[]> => {
  const notificationsRef = collection(db, `users/${uid}/notifications`);
  const q = query(notificationsRef, orderBy("timestamp", "desc"), limit(20));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
};

export const markNotificationAsRead = async (uid: string, notificationId: string) => {
  const notificationRef = doc(db, `users/${uid}/notifications`, notificationId);
  await updateDoc(notificationRef, { read: true });
};

export const checkLeaderboardChanges = async () => {
  const currentLeaderboard = await getLeaderboard(10);
  const previousLeaderboardRef = doc(db, 'system', 'previousLeaderboard');
  const previousSnap = await getDoc(previousLeaderboardRef);
  
  if (previousSnap.exists()) {
    const previousLeaderboard = previousSnap.data().data as LeaderboardEntry[];
    
    // Check for rank changes
    for (let i = 0; i < currentLeaderboard.length; i++) {
      const currentUser = currentLeaderboard[i];
      const previousUser = previousLeaderboard.find(u => u.uid === currentUser.uid);
      
      if (previousUser && previousUser.rank !== i + 1) {
        // Rank changed, send notification
        const notificationRef = doc(collection(db, `users/${currentUser.uid}/notifications`));
        const notification: Omit<Notification, 'id'> = {
          userId: currentUser.uid,
          title: "Leaderboard Update!",
          message: `You moved from rank ${previousUser.rank} to rank ${i + 1}!`,
          type: 'leaderboard',
          read: false,
          timestamp: serverTimestamp() as Timestamp
        };
        await setDoc(notificationRef, notification);
      }
    }
  }
  
  // Update previous leaderboard
  const leaderboardData = currentLeaderboard.map((user, index) => ({
    ...user,
    rank: index + 1
  }));
  
  await setDoc(previousLeaderboardRef, { data: leaderboardData });
};

// --- HELPER FUNCTIONS ---

export const checkAllCategoriesCompletedToday = async (uid: string): Promise<boolean> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const categories: QuizCategory[] = ['math', 'aptitude', 'grammar', 'programming'];
  
  for (const category of categories) {
    const quizResultsRef = collection(db, `users/${uid}/quizResults`);
    // Use only single field query to avoid composite index requirement
    const q = query(
      quizResultsRef,
      where('category', '==', category),
      limit(20)
    );
    const querySnapshot = await getDocs(q);
    
    // Check client-side for today's perfect scores
    const todayPerfectScore = querySnapshot.docs.some(doc => {
      const data = doc.data();
      const timestamp = data.timestamp?.toDate();
      return timestamp && 
             timestamp >= today && 
             data.score === 100;
    });
    
    if (!todayPerfectScore) {
      return false;
    }
  }
  
  return true;
};

export const getDailyStats = async (uid: string, startDate?: Date, endDate: Date = new Date()) => {
  const stats = [];
  
  // If no startDate is provided, default to 30 days ago
  if (!startDate) {
    startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
  }
  
  // Clone dates to avoid modifying the original references
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Set start date to beginning of the day
  start.setHours(0, 0, 0, 0);
  // Set end date to end of the day
  end.setHours(23, 59, 59, 999);
  
  // Calculate the number of days between start and end dates
  const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  
  // Get all transactions in the date range in a single query
  const transactionsRef = collection(db, `users/${uid}/transactions`);
  const q = query(
    transactionsRef,
    where('timestamp', '>=', start),
    where('timestamp', '<=', end),
    orderBy('timestamp', 'desc')
  );
  
  const querySnapshot = await getDocs(q);
  const allTransactions = querySnapshot.docs.map(doc => ({
    ...doc.data() as Transaction,
    // Convert Firestore Timestamp to Date if needed
    timestamp: (doc.data() as any).timestamp?.toDate?.() || (doc.data() as any).timestamp
  }));
  
  // Initialize stats for each day in the range
  for (let i = 0; i <= daysDiff; i++) {
    const currentDate = new Date(endDate);
    currentDate.setDate(currentDate.getDate() - i);
    const dateStr = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
    // Create date strings in local timezone for comparison
    const currentDateStr = currentDate.toLocaleDateString('en-CA'); // YYYY-MM-DD format
    
    // Create start and end of day in local timezone
    const startOfDay = new Date(currentDateStr + 'T00:00:00');
    const endOfDay = new Date(currentDateStr + 'T23:59:59.999');
    
    // Filter transactions for this specific day
    const dayTransactions = allTransactions.filter(t => {
      let transactionDate = t.timestamp instanceof Date ? t.timestamp : t.timestamp.toDate();
      // Convert to local date string for comparison
      const transactionDateStr = transactionDate.toLocaleDateString('en-CA');
      return transactionDateStr === currentDateStr;
    });
    
    // Calculate stats for the day
    const coinsEarned = dayTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const penalties = dayTransactions
      .filter(t => t.category === 'penalty')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    
    const quizzesTaken = dayTransactions
      .filter(t => t.category === 'quiz').length;
    
    const loginBonus = dayTransactions
      .filter(t => t.category === 'bonus')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Only include days with activity or within the last 7 days
    if (coinsEarned > 0 || penalties > 0 || quizzesTaken > 0 || loginBonus > 0 || i >= (daysDiff - 7)) {
      stats.push({
        date: dateStr,
        coinsEarned,
        quizzesTaken,
        loginBonus,
        penalties,
        transactions: dayTransactions.map(t => ({
          amount: t.amount,
          type: t.type,
          category: t.category,
          description: t.description,
          timestamp: t.timestamp
        }))
      });
    }
  }
  
  // Sort by date (oldest first)
  return stats.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};
