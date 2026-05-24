// Learn Mode - Quizlet Style with Checkpoints
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { shuffleArray } from '../utils/helpers.js';

let cards = [];
let currentRound = [];
let currentIndex = 0;
let completedRounds = 0;
let totalRounds = 0;
let masteredCards = [];
let currentQuestion = null;
let isMcqSet = false;

export function render(setId) {
    return `
        <div id="learnModeContent" class="min-h-screen bg-gray-50">
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
        isMcqSet = setData.cardType === 'mcq';
        
        const cardsQuery = query(
            collection(db, 'studySets', setId, 'cards'),
            orderBy('order', 'asc')
        );
        const cardsSnapshot = await getDocs(cardsQuery);
        cards = cardsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            attempts: 0,
            correctCount: 0,
            isMastered: false
        }));

        if (!isMcqSet) {
            isMcqSet = cards.some(card => Array.isArray(card.options) && card.options.length > 0);
        }

        if (cards.length === 0) {
            showError('No cards in this set');
            return;
        }

        totalRounds = Math.ceil(cards.length / 7);
        completedRounds = 0;
        masteredCards = [];

        startNewRound();
        renderLearnMode(setData, setId);
    } catch (error) {
        console.error('Error loading learn mode:', error);
        showError(error.message);
    }
}

function startNewRound() {
    const unmastered = cards.filter(c => !c.isMastered);
    
    if (unmastered.length === 0) {
        currentRound = [];
        return;
    }

    currentRound = shuffleArray(unmastered).slice(0, Math.min(7, unmastered.length));
    currentIndex = 0;
}

function renderLearnMode(setData, setId) {
    if (currentRound.length === 0) {
        renderComplete(setId);
        return;
    }

    const content = `
        <div class="min-h-screen bg-gray-50">
            <!-- Header -->
            <div class="study-mode-header bg-white border-b border-gray-200 py-4">
                <div class="container mx-auto px-4 max-w-5xl">
                    <div class="flex items-center justify-between mb-4">
                        <button onclick="window.location.hash='/set/${setId}'" class="text-gray-600 hover:text-gray-900 flex items-center space-x-2">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
                            </svg>
                            <span>Back</span>
                        </button>
                        <h1 class="text-xl font-semibold text-gray-900">${setData.title}</h1>
                        <div class="text-sm text-gray-600">${masteredCards.length}/${cards.length} mastered</div>
                    </div>
                    
                    <!-- Checkpoints -->
                    <div class="flex items-center justify-center space-x-3 mb-4">
                        ${renderCheckpoints()}
                    </div>
                    
                    <!-- Progress -->
                    <div class="progress-bar">
                        <div class="progress-bar-fill" id="progressBar" style="width: ${(masteredCards.length / cards.length) * 100}%"></div>
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

    document.getElementById('learnModeContent').innerHTML = content;
}

function renderCheckpoints() {
    const checkpointsHTML = [];
    for (let i = 0; i < totalRounds; i++) {
        const isCompleted = i < completedRounds;
        const isActive = i === completedRounds;
        
        let className = 'checkpoint-round ';
        if (isCompleted) className += 'checkpoint-completed';
        else if (isActive) className += 'checkpoint-active';
        else className += 'checkpoint-pending';
        
        checkpointsHTML.push(`<div class="${className}">${i + 1}</div>`);
    }
    return checkpointsHTML.join('');
}

function renderQuestion() {
    if (currentIndex >= currentRound.length) {
        completedRounds++;
        startNewRound();
        if (currentRound.length === 0) {
            return '';
        }
    }

    const card = currentRound[currentIndex];
    const questionType = isMcqSet ? 'multiple-choice' : (Math.random() > 0.5 ? 'multiple-choice' : 'written');
    
    if (questionType === 'multiple-choice') {
        return renderMultipleChoice(card);
    } else {
        return renderWritten(card);
    }
}

function renderMultipleChoice(card) {
    const prompt = card.prompt || card.definition;
    const correctAnswer = card.correctAnswer || card.term;

    let allAnswers = [];

    if (isMcqSet) {
        const otherAnswers = cards
            .filter(c => c.id !== card.id)
            .map(c => String(c.correctAnswer || c.term || '').trim())
            .filter(answer => answer && answer !== correctAnswer);

        const uniqueAnswers = [correctAnswer];
        otherAnswers.forEach(answer => {
            if (!uniqueAnswers.includes(answer)) {
                uniqueAnswers.push(answer);
            }
        });

        allAnswers = shuffleArray(uniqueAnswers.slice(0, 4));
    } else {
        const wrongAnswers = cards
            .filter(c => c.id !== card.id)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3)
            .map(c => c.term);
        
        allAnswers = shuffleArray([correctAnswer, ...wrongAnswers]);
    }
    
    currentQuestion = {
        type: 'multiple-choice',
        card: card,
        correctAnswer: correctAnswer
    };

    return `
        <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div class="mb-8">
                <label class="block text-sm font-medium text-gray-500 mb-3">${card.prompt ? 'QUESTION' : 'DEFINITION'}</label>
                <p class="text-2xl text-gray-900 font-medium leading-relaxed">${prompt}</p>
            </div>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-700 mb-4">Choose the correct term</label>
                <div class="space-y-3">
                    ${allAnswers.map((answer, index) => `
                        <button 
                            onclick="window.selectAnswer('${answer.replace(/'/g, "\\'")}')"
                            class="answer-option w-full text-left px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all font-medium text-lg"
                            data-answer="${answer}"
                        >
                            ${answer}
                        </button>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function renderWritten(card) {
    currentQuestion = {
        type: 'written',
        card: card,
        correctAnswer: card.term
    };

    return `
        <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div class="mb-8">
                <label class="block text-sm font-medium text-gray-500 mb-3">DEFINITION</label>
                <p class="text-2xl text-gray-900 font-medium leading-relaxed">${card.definition}</p>
            </div>

            <div class="mb-6">
                <label for="answer" class="block text-sm font-medium text-gray-700 mb-2">Type the term</label>
                <input 
                    type="text" 
                    id="answer" 
                    class="w-full px-4 py-4 text-xl border-2 border-gray-300 rounded-xl focus:ring-0 focus:border-blue-500 outline-none"
                    placeholder="Type your answer..."
                    onkeypress="if(event.key==='Enter') window.submitAnswer()"
                    autofocus
                >
            </div>

            <div id="feedback" class="mb-6 hidden"></div>

            <div class="flex justify-end">
                <button 
                    onclick="window.submitAnswer()"
                    class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                >
                    Submit
                </button>
            </div>
        </div>
    `;
}

function renderComplete(setId) {
    const content = `
        <div class="container mx-auto px-4 max-w-4xl py-12 animate-fade-in">
            <div class="bg-white rounded-2xl p-12 shadow-lg text-center">
                <div class="mb-8">
                    <svg class="w-24 h-24 mx-auto text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    <h2 class="text-4xl font-bold text-gray-900 mb-4">Round Complete!</h2>
                    <p class="text-xl text-gray-600">You've mastered all ${cards.length} terms</p>
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

    document.getElementById('learnModeContent').innerHTML = content;
}

// Global functions
window.selectAnswer = (answer) => {
    if (!currentQuestion || currentQuestion.type !== 'multiple-choice') return;

    const buttons = document.querySelectorAll('.answer-option');
    buttons.forEach(btn => btn.disabled = true);

    const selectedBtn = Array.from(buttons).find(btn => btn.dataset.answer === answer);
    const isCorrect = answer === currentQuestion.correctAnswer;

    if (isCorrect) {
        selectedBtn.classList.add('correct');
        currentQuestion.card.correctCount++;
        
        if (currentQuestion.card.correctCount >= 2 && !currentQuestion.card.isMastered) {
            currentQuestion.card.isMastered = true;
            masteredCards.push(currentQuestion.card);
        }

        setTimeout(() => {
            currentIndex++;
            const setId = window.location.hash.split('/')[2];
            const setData = { title: document.querySelector('h1').textContent };
            renderLearnMode(setData, setId);
        }, 1000);
    } else {
        selectedBtn.classList.add('incorrect');
        const correctBtn = Array.from(buttons).find(btn => btn.dataset.answer === currentQuestion.correctAnswer);
        correctBtn.classList.add('correct');
        currentQuestion.card.correctCount = 0;

        setTimeout(() => {
            currentIndex++;
            const setId = window.location.hash.split('/')[2];
            const setData = { title: document.querySelector('h1').textContent };
            renderLearnMode(setData, setId);
        }, 2000);
    }

    updateProgress();
};

window.submitAnswer = () => {
    const input = document.getElementById('answer');
    const userAnswer = input.value.trim();
    const correctAnswer = currentQuestion.correctAnswer;

    const isCorrect = userAnswer.toLowerCase() === correctAnswer.toLowerCase();
    const feedback = document.getElementById('feedback');
    feedback.classList.remove('hidden');

    input.disabled = true;

    if (isCorrect) {
        currentQuestion.card.correctCount++;
        
        if (currentQuestion.card.correctCount >= 2 && !currentQuestion.card.isMastered) {
            currentQuestion.card.isMastered = true;
            masteredCards.push(currentQuestion.card);
        }

        feedback.innerHTML = `
            <div class="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center space-x-3">
                <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <div class="font-semibold text-green-900">Correct!</div>
            </div>
        `;

        setTimeout(() => {
            currentIndex++;
            const setId = window.location.hash.split('/')[2];
            const setData = { title: document.querySelector('h1').textContent };
            renderLearnMode(setData, setId);
        }, 1000);
    } else {
        currentQuestion.card.correctCount = 0;
        
        feedback.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start space-x-3 mb-3">
                    <svg class="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                    <div>
                        <div class="font-semibold text-red-900 mb-1">Incorrect</div>
                        <div class="text-green-700">Correct answer: <span class="font-semibold">${correctAnswer}</span></div>
                    </div>
                </div>
                <button onclick="window.continueLearn()" class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                    Continue
                </button>
            </div>
        `;
    }

    updateProgress();
};

window.continueLearn = () => {
    currentIndex++;
    const setId = window.location.hash.split('/')[2];
    const setData = { title: document.querySelector('h1').textContent };
    renderLearnMode(setData, setId);
};

function updateProgress() {
    const progressBar = document.getElementById('progressBar');
    if (progressBar) {
        progressBar.style.width = `${(masteredCards.length / cards.length) * 100}%`;
    }
}

function showError(message) {
    document.getElementById('learnModeContent').innerHTML = `
        <div class="container mx-auto px-4 py-20 text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Error</h1>
            <p class="text-gray-600 mb-6">${message}</p>
            <button onclick="window.location.hash='/dashboard'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Back to Dashboard
            </button>
        </div>
    `;
}
