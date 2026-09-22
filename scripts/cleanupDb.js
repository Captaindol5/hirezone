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

  const jobId = 'CoVZ0M5pVWA8AgErmWFz';
  const jobRef = doc(db, 'jobs', jobId);
  const jobSnap = await getDoc(jobRef);
  const currentCandidates = jobSnap.data().candidates || [];

  const navinOriginal = currentCandidates.find(c => c.name.includes('Navin')) || {};
  const georgeOriginal = currentCandidates.find(c => c.name.includes('George Smith')) || {};

  const cleanNavin = {
    ...navinOriginal,
    id: 'candidate-1790098023537-qdo92',
    name: 'Navin Manathunga',
    email: 'naveenmanathunga6@gmail.com',
    stage: 'initial-interview',
    stageLabel: 'Initial Interview',
    status: 'Ready',
    hasSubmittedFeedback: false,
    score: 0,
    feedback: '',
  };

  const cleanGeorge = {
    ...georgeOriginal,
    id: 'candidate-1790103551153-xv1k2',
    name: 'George Smith',
    email: 'nubaidhahamed2006@gmail.com',
    stage: 'initial-interview',
    stageLabel: 'Initial Interview',
    status: 'Applied',
    hasSubmittedFeedback: false,
    score: 0,
    feedback: '',
    aiScore: 98,
  };

  // Reset jobs candidates array to 2 canonical candidates
  await updateDoc(jobRef, {
    candidates: [cleanNavin, cleanGeorge]
  });

  // Ensure documents exist in candidates collection
  await setDoc(doc(db, 'candidates', cleanNavin.id), cleanNavin, { merge: true });
  await setDoc(doc(db, 'candidates', cleanGeorge.id), cleanGeorge, { merge: true });

  // Delete leftover test duplicates
  const allCandDocs = await getDocs(collection(db, 'candidates'));
  let deletedCount = 0;
  for (const d of allCandDocs.docs) {
    if (d.id !== cleanNavin.id && d.id !== cleanGeorge.id) {
      await deleteDoc(doc(db, 'candidates', d.id)).catch(() => {});
      deletedCount++;
    }
  }

  console.log(`Database cleaned successfully! Kept 2 canonical candidates (Navin & George). Removed ${deletedCount} duplicates.`);
  process.exit(0);
}

cleanDatabase().catch(err => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
