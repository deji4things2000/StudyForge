// Flashcards Study Mode - Professional
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { shuffleArray } from '../utils/helpers.js';

let cards = [];
let currentIndex = 0;
let isShuffled = false;

export function render(setId) {
    return `
        <div id="flashcardsContent" class="min-h-screen bg-gray-50">
            <div class="flex items-center justify-center min-h-screen">
                <div class="loading-spinner"></div>
            </div>
        </div>
    `;
}

export async function init(setId) {
    if (!currentUser) {
        window.location.hash = '/login';
        return;
    }

    try {
        const setDoc = await getDoc(doc(db, 'studySets', setId));
        if (!setDoc.exists()) {
            showError('Set not found');
            return;
        }

        const setData = { id: setDoc.id, ...setDoc.data() };
        
        const cardsQuery = query(
            collection(db, 'studySets', setId, 'cards'),
            orderBy('order', 'asc')
        );
        const cardsSnapshot = await getDocs(cardsQuery);
        cards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (cards.length === 0) {
            showError('No cards in this set');
            return;
        }

        if (setData.cardType === 'mcq' || cards.some(card => Array.isArray(card.options) && card.options.length > 0)) {
            showError('This set is MCQ-only. Open the Learn mode instead.');
            return;
        }

        currentIndex = 0;
        renderFlashcards(setData, setId);
    } catch (error) {
        console.error('Error loading flashcards:', error);
        showError(error.message);
    }
}

function renderFlashcards(setData, setId) {
    const content = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="study-mode-header bg-white border-b border-gray-200 py-4">
                <div class="container mx-auto px-4 max-w-4xl">
                    <div class="flex items-center justify-between mb-4">
                        <button onclick="window.location.hash='/set/${setId}'" class="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            <span>Back</span>
                        </button>
                        <h1 class="text-xl font-semibold text-gray-900">${setData.title}</h1>
                        <button id="shuffleBtn" onclick="window.handleShuffle()" class="px-4 py-2 bg-white text-gray-700 rounded-lg shadow-sm hover:shadow-md transition border border-gray-200">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Progress -->
                    <div class="mb-2">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span id="progressText">${currentIndex + 1} / ${cards.length}</span>
                            <span>${Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" id="progressBar" style="width: ${((currentIndex + 1) / cards.length) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Flashcard -->
            <div class="container mx-auto px-4 max-w-4xl py-12">
                <div class="flip-card mb-8" id="flashcard" onclick="window.flipCard()">
                    <div class="flip-card-inner">
                        <div class="flip-card-front">
                            <div class="text-center">
                                <div class="text-sm text-gray-500 mb-4 font-medium tracking-wide">TERM</div>
                                <div class="text-3xl font-semibold text-gray-900" id="cardTerm">${cards[currentIndex].term}</div>
                                <div class="mt-8 text-gray-400 text-sm">Click to flip</div>
                            </div>
                        </div>
                        <div class="flip-card-back">
                            <div class="text-center">
                                <div class="text-sm text-white opacity-80 mb-4 font-medium tracking-wide">DEFINITION</div>
                                <div class="text-3xl font-semibold text-white" id="cardDefinition">${cards[currentIndex].definition}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Navigation -->
                <div class="flex justify-between items-center">
                    <button id="prevBtn" onclick="window.prevCard()" ${currentIndex === 0 ? 'disabled' : ''} class="px-6 py-3 bg-white text-gray-700 rounded-xl shadow-sm hover:shadow-md transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                        </svg>
                        <span>Previous</span>
                    </button>
                    <div class="text-gray-600 font-medium">
                        Card ${currentIndex + 1} of ${cards.length}
                    </div>
                    <button id="nextBtn" onclick="window.nextCard()" ${currentIndex === cards.length - 1 ? 'disabled' : ''} class="px-6 py-3 bg-blue-600 text-white rounded-xl shadow-sm hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2">
                        <span>Next</span>
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                        </svg>
                    </button>
                </div>

                <!-- Keyboard Shortcuts -->
                <div class="mt-8 text-center">
                    <div class="inline-flex items-center space-x-6 text-sm text-gray-500 bg-white px-6 py-3 rounded-full border border-gray-200">
                        <div class="flex items-center space-x-2">
                            <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">←</kbd>
                            <span>Previous</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">→</kbd>
                            <span>Next</span>
                        </div>
                        <div class="flex items-center space-x-2">
                            <kbd class="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono">Space</kbd>
                            <span>Flip</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    document.getElementById('flashcardsContent').innerHTML = content;
    setupKeyboardNavigation();
}

function updateCard() {
    const flashcard = document.getElementById('flashcard');
    const cardTerm = document.getElementById('cardTerm');
    const cardDefinition = document.getElementById('cardDefinition');
    const progressText = document.getElementById('progressText');
    const progressBar = document.getElementById('progressBar');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    flashcard.classList.remove('flipped');

    cardTerm.textContent = cards[currentIndex].term;
    cardDefinition.textContent = cards[currentIndex].definition;

    progressText.textContent = `${currentIndex + 1} / ${cards.length}`;
    progressBar.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
}

function setupKeyboardNavigation() {
    const handleKeyPress = (e) => {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            window.prevCard();
        } else if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
            window.nextCard();
        } else if (e.key === ' ') {
            e.preventDefault();
            window.flipCard();
        }
    };
    
    document.removeEventListener('keydown', handleKeyPress);
    document.addEventListener('keydown', handleKeyPress);
}

// Global functions
window.flipCard = () => {
    document.getElementById('flashcard').classList.toggle('flipped');
};

window.nextCard = () => {
    if (currentIndex < cards.length - 1) {
        currentIndex++;
        updateCard();
    }
};

window.prevCard = () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateCard();
    }
};

window.handleShuffle = () => {
    isShuffled = !isShuffled;
    if (isShuffled) {
        cards = shuffleArray(cards);
    } else {
        cards.sort((a, b) => a.order - b.order);
    }
    currentIndex = 0;
    const setId = window.location.hash.split('/')[2];
    const setData = { title: document.querySelector('h1').textContent };
    renderFlashcards(setData, setId);
};

function showError(message) {
    document.getElementById('flashcardsContent').innerHTML = `
        <div class="container mx-auto px-4 py-20 text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Error</h1>
            <p class="text-gray-600 mb-6">${message}</p>
            <button onclick="window.location.hash='/dashboard'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Back to Dashboard
            </button>
        </div>
    `;
}
