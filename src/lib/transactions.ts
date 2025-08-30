import { db } from './firebase';
import { collection, addDoc, Timestamp, doc, getDoc } from 'firebase/firestore';

export interface Transaction {
  userId: string;
  amount: number;
  type: 'credit' | 'debit';
  category: 'quiz' | 'penalty' | 'login' | 'purchase' | 'other';
  description: string;
  timestamp: Date | Timestamp;
  balanceAfter?: number;
}

export async function addTransaction(transaction: Omit<Transaction, 'timestamp' | 'balanceAfter'>) {
  try {
    const transactionsRef = collection(db, `users/${transaction.userId}/transactions`);
    const newTransaction = {
      ...transaction,
      timestamp: Timestamp.now(),
      balanceAfter: await getUserBalance(transaction.userId, transaction.amount, transaction.type === 'debit')
    };
    
    await addDoc(transactionsRef, newTransaction);
    return newTransaction;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
}

async function getUserBalance(userId: string, amount: number, isDebit: boolean): Promise<number> {
  const userRef = doc(db, 'users', userId);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    throw new Error('User not found');
  }
  
  const currentBalance = userDoc.data().coins || 0;
  return isDebit ? currentBalance - amount : currentBalance + amount;
}
