import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, getDocs, getDoc, deleteDoc, updateDoc } from "firebase/firestore";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBoFQfUOiAJdO8MYp_je8R0NztFoQSRMh8",
  authDomain: "quiz-pro-db.firebaseapp.com",
  projectId: "quiz-pro-db",
  storageBucket: "quiz-pro-db.firebasestorage.app",
  messagingSenderId: "19877031394",
  appId: "1:19877031394:web:7b2b94b2a4d569b7a65dbb",
  measurementId: "G-8P9QX39LF4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
