// src/scripts/listBadges.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { config } from 'dotenv';
config({ path: '.env' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function listBadges() {
  try {
    const badgesRef = collection(db, 'badges');
    const snapshot = await getDocs(badgesRef);
    
    console.log('Current badges in database:');
    snapshot.docs.forEach(doc => {
      console.log(`ID: ${doc.id}`, doc.data());
    });
  } catch (error) {
    console.error('Error listing badges:', error);
  } finally {
    process.exit(0);
  }
}

listBadges();