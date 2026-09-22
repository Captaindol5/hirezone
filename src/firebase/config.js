import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBsb9CczXGGJ2u7cDI-Hcz3A6aHdK-ULsU',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'hirezone-web.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'hirezone-web',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'hirezone-web.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '78868931780',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:78868931780:web:8c366579754f9ed915d591',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
