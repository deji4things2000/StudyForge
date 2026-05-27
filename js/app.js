// Premium App Module
import { initAuth, currentUser } from './auth.js';
import { initRouter, navigateTo } from './router.js';
import { db } from './firebase-config.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initComponents();
    initAuth((user) => {
        if (user) {
            if (window.location.hash === '' || window.location.hash === '#/') {
                navigateTo('/dashboard');
            }
        }
    });
    initRouter();
});

// Initialize navbar and footer
function initComponents() {
    // Premium Navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.innerHTML = `
            <nav class="glass sticky top-0 z-50 border-b border-gray-200 shadow-sm">
                <div class="container mx-auto px-6 py-4">
                    <div class="flex justify-between items-center">
                        <a href="#/" class="flex items-center space-x-3 group">
                            <div class="text-3xl group-hover:scale-110 transition-transform duration-300">📚</div>
                            <span class="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">StudyForge</span>
                        </a>
                        
                        <div id="navButtons" class="flex items-center space-x-4">
                            <button onclick="window.location.hash='/login'" class="px-6 py-2.5 text-gray-700 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-all font-medium">
                                Login
                            </button>
                            <button onclick="window.location.hash='/signup'" class="px-6 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:scale-105 duration-300">
                                Sign Up
                            </button>
                        </div>
                        
                        <div id="userMenu" class="hidden flex items-center space-x-6">
                            <a href="#/dashboard" class="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                                Dashboard
                            </a>
                            <div class="flex items-center space-x-4">
                                <span id="userName" class="text-gray-700 font-medium"></span>
                                <button onclick="window.handleLogout()" class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-all font-medium">
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        `;
    }

    // Premium Footer
    const footer = document.getElementById('footer');
    if (footer) {
        footer.innerHTML = `
            <footer class="bg-gray-900 text-white mt-auto">
                <div class="container mx-auto px-6 py-12">
                    <div class="text-center">
                        <div class="flex items-center justify-center space-x-3 mb-6">
                            <div class="text-4xl">📚</div>
                            <span class="text-2xl font-bold">StudyForge</span>
                        </div>
                        <p class="text-gray-400 mb-6 text-lg">Open-source learning platform built for students</p>
                        <div class="flex justify-center space-x-8 mb-8">
                            <a href="https://github.com/deji4things2000/StudyForge" target="_blank" class="text-gray-400 hover:text-white transition-colors flex items-center space-x-2">
                                <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                                </svg>
                                <span>GitHub</span>
                            </a>
                            <!-- Sponsor link removed -->
                        </div>
                        <div class="border-t border-gray-800 pt-8">
                            <p class="text-gray-500">© 2025 StudyForge · Made with ❤️ for students everywhere</p>
                        </div>
                    </div>
                </div>
            </footer>
        `;
    }
}

// Global logout handler
window.handleLogout = async () => {
    const { logout } = await import('./auth.js');
    await logout();
    window.location.hash = '/';
};

// Open study options modal when user clicks "Study Now"
window.openStudyOptions = async (setId) => {
    try {
        const setDoc = await getDoc(doc(db, 'studySets', setId));
        if (!setDoc.exists()) {
            window.location.hash = `/set/${setId}`;
            return;
        }

        const setData = { id: setDoc.id, ...setDoc.data() };
        const cardsQuery = query(collection(db, 'studySets', setId, 'cards'), orderBy('order', 'asc'));
        const cardsSnapshot = await getDocs(cardsQuery);
        const cards = cardsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }));

        const hasMcqImported = setData.cardType === 'mcq' || cards.some(c => Array.isArray(c.options) && c.options.length > 0);

        if (!hasMcqImported) {
            // Not an MCQ-capable set — go to flashcards as before
            window.location.hash = `/study/${setId}/flashcards`;
            return;
        }

        // Build modal
        const existing = document.getElementById('studyOptionsModal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'studyOptionsModal';
        modal.className = 'fixed inset-0 z-50 flex items-center justify-center p-4';
        modal.innerHTML = `
            <div class="fixed inset-0 bg-black/40"></div>
            <div class="bg-white rounded-2xl shadow-2xl max-w-2xl w-full z-10 p-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-semibold">Choose Study Mode</h3>
                    <button id="closeStudyOptions" class="text-gray-500 hover:text-gray-700">✕</button>
                </div>
                <div class="grid md:grid-cols-2 gap-4">
                    <button id="mcPracticeBtn" class="p-6 border rounded-xl text-left hover:shadow-lg transition">
                        <div class="text-4xl mb-2">🧩</div>
                        <div class="font-semibold">Multiple Choice</div>
                        <div class="text-sm text-gray-600 mt-2">Practice with distractors built from the other answers in this set</div>
                    </button>
                    <button id="mcqTestBtn" class="p-6 border rounded-xl text-left bg-blue-50 hover:shadow-lg transition">
                        <div class="text-2xl mb-2">✅</div>
                        <div class="font-semibold">MCQ Test</div>
                        <div class="text-sm text-gray-600 mt-2">Use imported Question + Option_A-D CSVs. The quiz randomizes the answer order and shows a full review at the end.</div>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById('closeStudyOptions').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        document.getElementById('mcPracticeBtn').addEventListener('click', () => {
            modal.remove();
            window.location.hash = `/study/${setId}/learn`;
        });

        document.getElementById('mcqTestBtn').addEventListener('click', () => {
            modal.remove();
            window.location.hash = `/study/${setId}/mcq`;
        });
    } catch (error) {
        console.error('Error opening study options:', error);
        window.location.hash = `/study/${setId}/flashcards`;
    }
};
