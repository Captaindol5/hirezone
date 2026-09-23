import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc, deleteDoc, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || 'AIzaSyBsb9CczXGGJ2u7cDI-Hcz3A6aHdK-ULsU',
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || 'hirezone-web.firebaseapp.com',
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'hirezone-web',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || 'hirezone-web.firebasestorage.app',
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '78868931780',
  appId: process.env.VITE_FIREBASE_APP_ID || '1:78868931780:web:8c366579754f9ed915d591',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function cleanDatabase() {
  console.log('Authenticating as HR...');
  await signInWithEmailAndPassword(auth, 'naveen@hirezone.com', 'Naveen@123');

  try {
    const jobsSnapshot = await getDocs(collection(db, 'jobs'));
    
    // Wipe all candidates from all jobs
    for (const docSnap of jobsSnapshot.docs) {
      try {
        await updateDoc(doc(db, 'jobs', docSnap.id), { candidates: [] });
      } catch (e) {
        console.error(`Failed to update job ${docSnap.id}:`, e.message);
      }
    }
  } catch (e) {
    console.error('Failed to get jobs:', e.message);
  }

  // Delete all candidate docs
  let deletedCount = 0;
  try {
    const allCandDocs = await getDocs(collection(db, 'candidates'));
    for (const d of allCandDocs.docs) {
      try {
        await deleteDoc(doc(db, 'candidates', d.id));
        deletedCount++;
      } catch (e) {}
    }
  } catch (e) {
    console.error('Failed to clear candidates:', e.message);
  }

  // Wipe all notifications
  try {
    const allNotifs = await getDocs(collection(db, 'notifications'));
    for (const n of allNotifs.docs) {
      try {
        await deleteDoc(doc(db, 'notifications', n.id));
      } catch (e) {}
    }
  } catch (e) {
    console.error('Failed to clear notifications:', e.message);
  }

  console.log(`Database cleaned successfully! Cleared all candidates from jobs and removed ${deletedCount} candidate profiles.`);
  process.exit(0);
}

cleanDatabase().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
