/* global process */
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: 'AIzaSyBsb9CczXGGJ2u7cDI-Hcz3A6aHdK-ULsU',
  authDomain: 'hirezone-web.firebaseapp.com',
  projectId: 'hirezone-web',
  storageBucket: 'hirezone-web.firebasestorage.app',
  messagingSenderId: '78868931780',
  appId: '1:78868931780:web:8c366579754f9ed915d591',
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const credentials = [
  { email: "Sarah@hirezone.com", password: "Sarah@123" },
  { email: "navinhr@hirezone.com", password: "Navin@123" },
  { email: "naveen@hirezone.com", password: "Naveen@123" },
  { email: "abhi@hirezone.com", password: "Abhi@123" },
  { email: "nubaidh@hirezone.com", password: "Nubaidh@123" },
];

async function testAll() {
  for (const cred of credentials) {
    try {
      await signInWithEmailAndPassword(auth, cred.email, cred.password);
      console.log(`✅ SUCCESS: ${cred.email}`);
    } catch (e) {
      console.log(`❌ FAILED: ${cred.email} - ${e.code}`);
    }
  }
  process.exit(0);
}

testAll();
