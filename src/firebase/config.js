import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyBsb9CczXGGJ2u7cDI-Hcz3A6aHdK-ULsU',
  authDomain: 'hirezone-web.firebaseapp.com',
  projectId: 'hirezone-web',
  storageBucket: 'hirezone-web.firebasestorage.app',
  messagingSenderId: '78868931780',
  appId: '1:78868931780:web:8c366579754f9ed915d591',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;