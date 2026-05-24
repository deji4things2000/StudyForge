// Firebase Configuration
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyDtkMV6xGucPcSqDmhJ1rQTfS_d6rB5ejM",
    authDomain: "studyforge-7d052.firebaseapp.com",
    projectId: "studyforge-7d052",
    storageBucket: "studyforge-7d052.firebasestorage.app",
    messagingSenderId: "409872221936",
    appId: "1:409872221936:web:789fc2c76b0626fb71e435",
    measurementId: "G-L551CH7XDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {

};
