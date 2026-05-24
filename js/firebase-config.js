// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAZTnJSeh_IirA4Pxb8zPBk1TMrkGtX_dk",
    authDomain: "ai-agents-488209.firebaseapp.com",
    projectId: "ai-agents-488209",
    storageBucket: "ai-agents-488209.firebasestorage.app",
    messagingSenderId: "911913488937",
    appId: "1:911913488937:web:4a96ed9f2591eeb9448238",
    measurementId: "G-K83FQC655J" 
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
