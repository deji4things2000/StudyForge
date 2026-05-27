// Main App Module
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
    // Navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.innerHTML = `
            <div class="gradient-primary text-white shadow-lg">
                <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="#/" class="text-2xl font-bold cursor-pointer hover:opacity-80 transition flex items-center space-x-2">
                        <span>📚</span>
                        <span>StudyForge</span>
                    </a>
                    <div id="navButtons">
                        <button onclick="window.location.hash='/login'" class="px-4 py-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition">Login</button>
                        <button onclick="window.location.hash='/signup'" class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition ml-2 font-semibold shadow">Sign Up</button>
                    </div>
                    <div id="userMenu" class="hidden flex items-center space-x-4">
                        <a href="#/dashboard" class="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition">Dashboard</a>
                        <span id="userName" class="font-medium"></span>
                        <button onclick="window.handleLogout()" class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition">Logout</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Footer
    const footer = document.getElementById('footer');
    if (footer) {
        footer.innerHTML = `
            <div class="bg-gray-800 text-white mt-auto py-8">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-4">
                        <p class="text-gray-400 mb-2">© 2025 StudyForge · Open-source learning platform</p>
                        <div class="flex justify-center space-x-6 mb-4">
                            <a href="https://github.com/deji4things2000/StudyForge" target="_blank" class="text-gray-400 hover:text-white transition">GitHub</a>
                            <!-- Sponsor link removed -->
                        </div>
                    </div>
                    <div class="text-center text-sm text-gray-500">
                        <p>Made with ❤️ for students everywhere</p>
                    </div>
                </div>
            </div>
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
