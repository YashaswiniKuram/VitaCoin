import { signInWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { handleSuccessfulLogin } from './penaltyService';

export async function signIn(email: string, password: string) {
  try {
    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userId = userCredential.user.uid;
    
    // Check for and apply any penalties for missed logins
    await handleSuccessfulLogin(userId);
    
    return { success: true, userId };
  } catch (error: any) {
    console.error('Error signing in:', error);
    return { success: false, error: error.message };
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
    return { success: true };
  } catch (error: any) {
    console.error('Error signing out:', error);
    return { success: false, error: error.message };
  }
}

export function onAuthStateChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Update last seen timestamp
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        lastSeen: serverTimestamp()
      });
    }
    callback(user);
  });
}
