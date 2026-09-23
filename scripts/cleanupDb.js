import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, updateDoc, setDoc, deleteDoc, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || "AIzaSyBsb9CczXGGJ2u7cDI-Hcz3A6aHdK-ULsU",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || "hirezone-web.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || "hirezone-web",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || "hirezone-web.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "78868931780",
  appId: process.env.VITE_FIREBASE_APP_ID || "1:78868931780:web:8c366579754f9ed915d591",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function cleanDatabase() {
  console.log("Authenticating as HR...");
  await signInWithEmailAndPassword(auth, "naveen@hirezone.com", "Naveen@123");

  // 1. Locate jobs
  const jobsSnapshot = await getDocs(collection(db, "jobs"));
  let qaJobDoc = jobsSnapshot.docs.find(d => d.data().title === "Quality Assurance Engineer") || jobsSnapshot.docs[0];
  
  if (!qaJobDoc) {
    console.error("No jobs found!");
    process.exit(1);
  }

  const qaJobId = qaJobDoc.id;
  const currentCandidates = qaJobDoc.data().candidates || [];
  const navinOriginal = currentCandidates.find(c => c.name && c.name.includes("Navin")) || {};
  const georgeOriginal = currentCandidates.find(c => c.name && c.name.includes("George Smith")) || {};

  const cleanNavin = {
    ...navinOriginal,
    id: "candidate-1790098023537-qdo92",
    name: "Navin Manathunga",
    email: "naveenmanathunga6@gmail.com",
    stage: "initial-interview",
    stageLabel: "Initial Interview",
    status: "Ready",
    hasSubmittedFeedback: false,
    score: 0,
    feedback: "",
    cvText: navinOriginal.cvText || "Experienced Software QA Engineer with automation testing skills in Playwright, Jest, CI/CD, and regression testing.",
  };

  const cleanGeorge = {
    ...georgeOriginal,
    id: "candidate-1790103551153-xv1k2",
    name: "George Smith",
    email: "nubaidhahamed2006@gmail.com",
    stage: "initial-interview",
    stageLabel: "Initial Interview",
    status: "Applied",
    hasSubmittedFeedback: false,
    score: 0,
    feedback: "",
    aiScore: 98,
    cvText: georgeOriginal.cvText || "Experienced Quality Assurance Engineer with Playwright, Selenium, and CI/CD test automation expertise.",
  };

  // Reset Quality Assurance Engineer candidates to clean canonical candidates
  // and clear candidate lists from other non-test jobs
  for (const jobDoc of jobsSnapshot.docs) {
    if (jobDoc.id === qaJobId) {
      await updateDoc(doc(db, "jobs", qaJobId), {
        candidates: [cleanNavin, cleanGeorge]
      });
    } else {
      await updateDoc(doc(db, "jobs", jobDoc.id), {
        candidates: []
      });
    }
  }

  // Ensure documents exist in candidates collection
  await setDoc(doc(db, "candidates", cleanNavin.id), cleanNavin, { merge: true });
  await setDoc(doc(db, "candidates", cleanGeorge.id), cleanGeorge, { merge: true });

  // Delete leftover test duplicate candidate documents
  const allCandDocs = await getDocs(collection(db, "candidates"));
  let deletedCount = 0;
  for (const d of allCandDocs.docs) {
    if (d.id !== cleanNavin.id && d.id !== cleanGeorge.id) {
      await deleteDoc(doc(db, "candidates", d.id)).catch(() => {});
      deletedCount++;
    }
  }

  console.log("Database cleaned successfully! Reset QA Engineer candidates (Navin & George) to Initial Interview (hasSubmittedFeedback: false). Removed duplicates: " + deletedCount);
  process.exit(0);
}

cleanDatabase().catch(err => {
  console.error("Cleanup failed:", err);
  process.exit(1);
});
