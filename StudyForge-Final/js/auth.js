// Authentication Module
import { auth } from './firebase-config.js';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged,
    updateProfile
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

export let currentUser = null;

// Auth state observer
export function initAuth(callback) {
    onAuthStateChanged(auth, (user) => {
        currentUser = user;
        updateNavbar(user);
        if (callback) callback(user);
    });
}

// Sign up
export async function signup(email, password, displayName) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
            await updateProfile(userCredential.user, { displayName });
        }
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Login
export async function login(email, password) {
    try {
        await signInWithEmailAndPassword(auth, email, password);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Logout
export async function logout() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Update navbar based on auth state
function updateNavbar(user) {
    const navButtons = document.getElementById('navButtons');
    const userMenu = document.getElementById('userMenu');
    const userName = document.getElementById('userName');

    if (user) {
        if (navButtons) navButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (userName) userName.textContent = user.displayName || user.email;
    } else {
        if (navButtons) navButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
    }
}
