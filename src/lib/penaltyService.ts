import { db } from './firebase';
import { collection, doc, getDoc, setDoc, updateDoc, getDocs, query, where, Timestamp, writeBatch } from 'firebase/firestore';

const PENALTY_AMOUNT = 10; // Coins to deduct per missed day
const MAX_PENALTY_DAYS = 30; // Maximum days to check for penalties

export async function checkAndApplyPenalties(userId: string) {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      console.error('User not found');
      return;
    }

    const userData = userDoc.data();
    const lastLogin = userData.lastLogin?.toDate();
    const now = new Date();
    
    // If user has never logged in, no penalties to apply
    if (!lastLogin) {
      console.log('No previous login found. No penalties to apply.');
      return;
    }

    // Reset time to compare dates only
    const lastLoginDate = new Date(
      lastLogin.getFullYear(),
      lastLogin.getMonth(),
      lastLogin.getDate()
    );
    
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const timeDiff = today.getTime() - lastLoginDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // If same day or future date, no penalties
    if (daysDiff <= 0) {
      console.log('User logged in today. No penalties to apply.');
      return;
    }

    // Calculate number of days to apply penalties (capped at MAX_PENALTY_DAYS)
    const daysToPenalize = Math.min(daysDiff, MAX_PENALTY_DAYS);
    
    if (daysToPenalize > 0) {
      await applyPenalties(userId, userData, lastLoginDate, daysToPenalize);
    }
  } catch (error) {
    console.error('Error in checkAndApplyPenalties:', error);
    throw error;
  }
}

async function applyPenalties(
  userId: string, 
  userData: any, 
  lastLoginDate: Date, 
  daysToPenalize: number
) {
  const batch = writeBatch(db);
  const userRef = doc(db, 'users', userId);
  const totalPenalty = daysToPenalize * PENALTY_AMOUNT;
  const newBalance = Math.max(0, (userData.coins || 0) - totalPenalty);
  
  // Update user's coin balance and reset streak
  batch.update(userRef, {
    coins: newBalance,
    lastPenaltyCheck: Timestamp.now(),
    loginStreak: 0, // Reset login streak
    lastLoginDate: Timestamp.now() // Update last login to now to prevent multiple penalties
  });

  // Create penalty records for each missed day
  for (let i = 1; i <= daysToPenalize; i++) {
    const penaltyDate = new Date(lastLoginDate);
    penaltyDate.setDate(penaltyDate.getDate() + i);
    
    const penaltyRef = doc(collection(db, `users/${userId}/penalties`));
    batch.set(penaltyRef, {
      amount: PENALTY_AMOUNT,
      date: Timestamp.fromDate(penaltyDate),
      processedAt: Timestamp.now(),
      type: 'login_missed'
    });
    
    // Add transaction for each penalty
    const transactionRef = doc(collection(db, `users/${userId}/transactions`));
    batch.set(transactionRef, {
      amount: PENALTY_AMOUNT,
      type: 'debit',
      category: 'penalty',
      description: `Missed login penalty - streak reset (${penaltyDate.toLocaleDateString()})`,
      timestamp: Timestamp.fromDate(penaltyDate),
      balanceAfter: newBalance - ((daysToPenalize - i) * PENALTY_AMOUNT),
      metadata: {
        streakReset: true,
        previousStreak: userData.loginStreak || 0
      }
    });
  }

  try {
    await batch.commit();
    console.log(`Successfully applied penalties for ${daysToPenalize} missed days`);
  } catch (error) {
    console.error('Error applying penalties:', error);
    throw error;
  }
}

// Call this function right after successful login
export async function handleSuccessfulLogin(userId: string) {
  try {
    await checkAndApplyPenalties(userId);
    
    // Update last login time
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      lastLogin: Timestamp.now()
    });
    
  } catch (error) {
    console.error('Error handling successful login:', error);
    throw error;
  }
}
