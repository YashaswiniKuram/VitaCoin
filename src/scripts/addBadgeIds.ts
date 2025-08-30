// src/scripts/addBadgeIds.ts
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, writeBatch, doc } from 'firebase/firestore';
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

async function addBadgeIds() {
  try {
    const badgesRef = collection(db, 'badges');
    const snapshot = await getDocs(badgesRef);
    const batch = writeBatch(db);

    snapshot.docs.forEach((docSnapshot) => {
      const badgeData = docSnapshot.data();
      // Only add ID if it doesn't exist
      if (!badgeData.id) {
        const badgeRef = doc(db, 'badges', docSnapshot.id);
        batch.update(badgeRef, { 
          id: docSnapshot.id, // Use document ID as the badge ID
          updatedAt: new Date().toISOString() 
        });
      }
    });

    await batch.commit();
    console.log('✅ Successfully added IDs to all badges');
  } catch (error) {
    console.error('❌ Error updating badges:', error);
  } finally {
    process.exit(0);
  }
}

addBadgeIds();