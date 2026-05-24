// Flashcards Study Mode
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { shuffleArray } from '../utils/helpers.js';

let cards = [];
let currentIndex = 0;
let isShuffled = false;

export function render(setId) {
    return `
        <div id="flashcardsContent" class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
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
            document.getElementById('flashcardsContent').innerHTML = `
                <div class="container mx-auto px-4 py-20 text-center">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">Set Not Found</h1>
                    <button onclick="window.location.hash='/dashboard'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                        Back to Dashboard
                    </button>
                </div>
            `;
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
            document.getElementById('flashcardsContent').innerHTML = `
                <div class="container mx-auto px-4 py-20 text-center">
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">No Cards Found</h1>
                    <button onclick="window.location.hash='/set/${setId}'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                        Back to Set
                    </button>
                </div>
            `;
            return;
        }

        currentIndex = 0;
        renderFlashcards(setData, setId);
    } catch (error) {
        console.error('Error loading flashcards:', error);
        document.getElementById('flashcardsContent').innerHTML = `
            <div class="container mx-auto px-4 py-20 text-center">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Error Loading Cards</h1>
                <p class="text-gray-600 mb-4">${error.message}</p>
            </div>
        `;
    }
}

function renderFlashcards(setData, setId) {
    const content = `
        <div class="container mx-auto px-4 max-w-4xl">
            <!-- Header -->
            <div class="mb-8 flex items-center justify-between">
                <div>
                    <button onclick="window.location.hash='/set/${setId}'" class="text-gray-600 hover:text-gray-900 mb-2 flex items-center space-x-2">
                        <span>←</span>
                        <span>Back to Set</span>
                    </button>
                    <h1 class="text-3xl font-bold text-gray-900">${setData.title}</h1>
                </div>
                <button id="shuffleBtn" onclick="window.handleShuffle()" class="px-4 py-2 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition border border-gray-200">
                    🔀 ${isShuffled ? 'Unshuffle' : 'Shuffle'}
                </button>
            </div>

            <!-- Progress -->
            <div class="mb-6">
                <div class="flex justify-between text-sm text-gray-600 mb-2">
                    <span id="progressText">${currentIndex + 1} / ${cards.length}</span>
                    <span>${Math.round(((currentIndex + 1) / cards.length) * 100)}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-bar-fill" id="progressBar" style="width: ${((currentIndex + 1) / cards.length) * 100}%"></div>
                </div>
            </div>

            <!-- Flashcard -->
            <div class="flip-card mb-8" id="flashcard" onclick="window.flipCard()">
                <div class="flip-card-inner">
                    <div class="flip-card-front">
                        <div class="text-center">
                            <div class="text-sm text-gray-500 mb-4">TERM</div>
                            <div class="text-2xl font-bold text-gray-900" id="cardTerm">${cards[currentIndex].term}</div>
                            <div class="mt-8 text-gray-400 text-sm">Click to flip</div>
                        </div>
                    </div>
                    <div class="flip-card-back">
                        <div class="text-center">
                            <div class="text-sm text-white opacity-80 mb-4">DEFINITION</div>
                            <div class="text-2xl font-bold text-white" id="cardDefinition">${cards[currentIndex].definition}</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between items-center">
                <button id="prevBtn" onclick="window.prevCard()" ${currentIndex === 0 ? 'disabled' : ''} class="px-6 py-3 bg-white text-gray-700 rounded-lg shadow hover:shadow-md transition border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
                    ← Previous
                </button>
                <div class="text-gray-600">
                    Card ${currentIndex + 1} of ${cards.length}
                </div>
                <button id="nextBtn" onclick="window.nextCard()" ${currentIndex === cards.length - 1 ? 'disabled' : ''} class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed">
                    Next →
                </button>
            </div>

            <!-- Keyboard Hint -->
            <div class="mt-8 text-center text-sm text-gray-500">
                <p>💡 Tip: Use ← → arrow keys to navigate, Space to flip</p>
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

    // Remove flipped state
    flashcard.classList.remove('flipped');

    // Update content
    cardTerm.textContent = cards[currentIndex].term;
    cardDefinition.textContent = cards[currentIndex].definition;

    // Update progress
    progressText.textContent = `${currentIndex + 1} / ${cards.length}`;
    progressBar.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;

    // Update buttons
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === cards.length - 1;
}

function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentIndex > 0) {
            window.prevCard();
        } else if (e.key === 'ArrowRight' && currentIndex < cards.length - 1) {
            window.nextCard();
        } else if (e.key === ' ') {
            e.preventDefault();
            window.flipCard();
        }
    });
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
