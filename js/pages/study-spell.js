// Spell Mode - Audio pronunciation practice
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { shuffleArray } from '../utils/helpers.js';

let cards = [];
let currentIndex = 0;
let correctAnswers = 0;
let incorrectCards = [];

export function render(setId) {
    return `
        <div id="spellModeContent" class="min-h-screen bg-gray-50">
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
        cards = shuffleArray(cardsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data()
        })));

        if (cards.length === 0) {
            showError('No cards in this set');
            return;
        }

        // Treat as MCQ-only only when the set explicitly declares it, or when ALL cards have options
        if (setData.cardType === 'mcq' || (cards.length > 0 && cards.every(card => Array.isArray(card.options) && card.options.length > 0))) {
            showError('This set is MCQ-only. Open the Learn mode instead.');
            return;
        }

        currentIndex = 0;
        correctAnswers = 0;
        incorrectCards = [];

        renderSpellMode(setData, setId);
    } catch (error) {
        console.error('Error loading spell mode:', error);
        showError(error.message);
    }
}

function renderSpellMode(setData, setId) {
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
                        <div class="w-20"></div>
                    </div>
                    
                    <!-- Progress -->
                    <div class="mb-2">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span id="progressText">${currentIndex + 1} / ${cards.length}</span>
                            <span id="scoreText">${correctAnswers} correct</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" id="progressBar" style="width: ${((currentIndex + 1) / cards.length) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Question -->
            <div class="container mx-auto px-4 max-w-4xl py-12">
                <div id="questionContainer" class="animate-fade-in">
                    ${renderQuestion()}
                </div>
            </div>
        </div>
    `;

    document.getElementById('spellModeContent').innerHTML = content;
    focusInput();
}

function renderQuestion() {
    const card = cards[currentIndex];
    
    return `
        <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div class="text-center mb-8">
                <div class="mb-6">
                    <button 
                        onclick="window.playAudio()"
                        class="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto hover:scale-110 transition-transform shadow-lg"
                    >
                        <svg class="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/>
                        </svg>
                    </button>
                </div>
                <p class="text-gray-600 text-sm">Click to hear the definition</p>
            </div>

            <div class="mb-6">
                <label for="answer" class="block text-sm font-medium text-gray-700 mb-2">Spell the term</label>
                <input 
                    type="text" 
                    id="answer" 
                    class="w-full px-4 py-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 outline-none text-center"
                    placeholder="Type what you hear..."
                    onkeypress="if(event.key==='Enter') window.checkSpelling()"
                >
            </div>

            <div id="feedback" class="mb-6 hidden"></div>

            <div class="flex justify-between items-center">
                <button 
                    onclick="window.skipCard()"
                    class="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
                >
                    Don't Know
                </button>
                <button 
                    onclick="window.checkSpelling()"
                    class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                    Check
                </button>
            </div>
        </div>
    `;
}

function renderResults(setId) {
    const percentage = Math.round((correctAnswers / cards.length) * 100);

    const content = `
        <div class="container mx-auto px-4 max-w-4xl py-12 animate-fade-in">
            <div class="bg-white rounded-2xl p-12 shadow-lg text-center">
                <h2 class="text-4xl font-bold text-gray-900 mb-4">Spell Complete!</h2>
                
                <div class="results-score mb-8">
                    ${percentage}%
                </div>

                <div class="grid grid-cols-3 gap-6 mb-12 max-w-2xl mx-auto">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600 mb-2">${correctAnswers}</div>
                        <div class="text-gray-600">Correct</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-red-600 mb-2">${incorrectCards.length}</div>
                        <div class="text-gray-600">Incorrect</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-gray-900 mb-2">${cards.length}</div>
                        <div class="text-gray-600">Total</div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="window.location.reload()" class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                        Study Again
                    </button>
                    <button onclick="window.location.hash='/set/${setId}'" class="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
                        Back to Set
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('spellModeContent').innerHTML = content;
}

function focusInput() {
    setTimeout(() => {
        const input = document.getElementById('answer');
        if (input) input.focus();
    }, 100);
}

// Global functions
window.playAudio = () => {
    const card = cards[currentIndex];
    const utterance = new SpeechSynthesisUtterance(card.definition);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
};

window.checkSpelling = () => {
    const input = document.getElementById('answer');
    const userAnswer = input.value.trim();
    const correctAnswer = cards[currentIndex].term;

    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');

    input.disabled = true;

    if (isCorrect) {
        correctAnswers++;
        feedback.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div>
                    <div class="font-semibold text-green-900">Correct!</div>
                    <div class="text-green-700">${correctAnswer}</div>
                </div>
            </div>
        `;

        setTimeout(() => {
            nextCard();
        }, 1500);
    } else {
        incorrectCards.push(cards[currentIndex]);
        feedback.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start space-x-3 mb-3">
                    <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <div>
                        <div class="font-semibold text-red-900 mb-1">Incorrect</div>
                        <div class="text-red-700 mb-2">You spelled: <span class="line-through">${userAnswer}</span></div>
                        <div class="text-green-700">Correct spelling: <span class="font-semibold">${correctAnswer}</span></div>
                    </div>
                </div>
                <button onclick="window.nextCard()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 mt-2">
                    Continue
                </button>
            </div>
        `;
    }

    updateProgress();
};

window.skipCard = () => {
    incorrectCards.push(cards[currentIndex]);
    nextCard();
};

function nextCard() {
    currentIndex++;
    
    if (currentIndex >= cards.length) {
        const setId = window.location.hash.split('/')[2];
        renderResults(setId);
    } else {
        const setId = window.location.hash.split('/')[2];
        const setData = { title: document.querySelector('h1').textContent };
        renderSpellMode(setData, setId);
    }
}

function updateProgress() {
    document.getElementById('progressText').textContent = `${currentIndex + 1} / ${cards.length}`;
    document.getElementById('scoreText').textContent = `${correctAnswers} correct`;
    document.getElementById('progressBar').style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
}

function showError(message) {
    document.getElementById('spellModeContent').innerHTML = `
        <div class="container mx-auto px-4 py-20 text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Error</h1>
            <p class="text-gray-600 mb-6">${message}</p>
            <button onclick="window.location.hash='/dashboard'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Back to Dashboard
            </button>
        </div>
    `;
}
