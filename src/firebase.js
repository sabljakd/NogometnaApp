import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, getDoc, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyAf60Xd5zZWlOsgjugOQFmNqKQoPoPCxTE",
    authDomain: "nogometnaapp.firebaseapp.com",
    projectId: "nogometnaapp",
    storageBucket: "nogometnaapp.firebasestorage.app",
    messagingSenderId: "220317980061",
    appId: "1:220317980061:web:c8874aa5e888fb8a7b8b74"
  };

// Inicijalizacija Firebase-a
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth, collection, addDoc, getDocs, getDoc, onSnapshot, deleteDoc, doc, updateDoc, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut };









