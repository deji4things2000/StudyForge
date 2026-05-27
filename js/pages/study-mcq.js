// MCQ Test Mode
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { shuffleArray } from '../utils/helpers.js';

let cards = [];
let currentIndex = 0;
let currentQuestion = null;
let selectedAnswer = null;
let score = 0;
let responses = [];

export function render(setId) {
    return `
        <div id="mcqModeContent" class="min-h-screen bg-gray-50">
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
        cards = shuffleArray(cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

        if (cards.length < 2) {
            showError('Add at least two cards to run an MCQ test.');
            return;
        }

        currentIndex = 0;
        currentQuestion = null;
        selectedAnswer = null;
        score = 0;
        responses = [];

        renderMcqMode(setData, setId);
    } catch (error) {
        console.error('Error loading MCQ mode:', error);
        showError(error.message);
    }
}

function getQuestionData(card) {
    const isMcqCard = Array.isArray(card.options) && card.options.length > 0;

    if (isMcqCard || card.prompt || card.correctAnswer) {
        return {
            prompt: card.prompt || card.definition || card.term || '',
            correctAnswer: String(card.correctAnswer || card.term || '').trim(),
            optionSource: card.options || []
        };
    }

    return {
        prompt: card.definition || card.prompt || card.term || '',
        correctAnswer: String(card.term || card.correctAnswer || '').trim(),
        optionSource: card.options || []
    };
}

function buildOptions(card) {
    const { correctAnswer, optionSource } = getQuestionData(card);
    const options = [];

    const sourceOptions = Array.isArray(optionSource) ? optionSource : [];
    if (sourceOptions.length > 0) {
        sourceOptions.forEach(option => {
            const cleanedOption = String(option || '').trim();
            if (cleanedOption && !options.includes(cleanedOption)) {
                options.push(cleanedOption);
            }
        });
    }

    if (!options.includes(correctAnswer)) {
        options.push(correctAnswer);
    }

    const distractors = cards
        .filter(otherCard => otherCard.id !== card.id)
        .map(otherCard => getQuestionData(otherCard).correctAnswer)
        .filter(answer => answer && answer !== correctAnswer);

    shuffleArray(distractors).forEach(answer => {
        if (options.length >= 4) return;
        if (!options.includes(answer)) {
            options.push(answer);
        }
    });

    return shuffleArray(options.slice(0, Math.max(2, Math.min(4, options.length))));
}

function renderMcqMode(setData, setId) {
    const content = `
        <div class="min-h-screen bg-gray-50">
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

                    <div class="mb-2">
                        <div class="flex justify-between text-sm text-gray-600 mb-2">
                            <span id="progressText">${currentIndex + 1} / ${cards.length}</span>
                            <span id="scoreText">${score} correct</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-bar-fill" id="progressBar" style="width: ${((currentIndex + 1) / cards.length) * 100}%"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="container mx-auto px-4 max-w-4xl py-12">
                <div id="questionContainer" class="animate-fade-in">
                    ${renderQuestion()}
                </div>
            </div>
        </div>
    `;

    document.getElementById('mcqModeContent').innerHTML = content;
}

function renderQuestion() {
    if (currentIndex >= cards.length) {
        renderResults();
        return '';
    }

    const card = cards[currentIndex];
    const { prompt, correctAnswer } = getQuestionData(card);
    const options = buildOptions(card);

    currentQuestion = {
        card,
        prompt,
        correctAnswer,
        options
    };
    selectedAnswer = null;

    return `
        <div class="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <div class="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Question ${currentIndex + 1}</div>
                    <p class="text-2xl text-gray-900 font-medium leading-relaxed">${prompt}</p>
                </div>
                <div class="hidden sm:block text-sm text-gray-500 font-medium">Choose one answer</div>
            </div>

            <div class="mb-8">
                <div class="space-y-3">
                    ${options.map(option => `
                        <button
                            type="button"
                            class="mcq-option w-full text-left px-6 py-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 transition-all font-medium text-lg"
                            data-answer="${option.replace(/"/g, '&quot;')}"
                            onclick='window.selectMcqAnswer(${JSON.stringify(option)})'
                        >
                            ${option}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="flex justify-between items-center">
                <div class="text-sm text-gray-500">Your score is revealed after the quiz ends.</div>
                <button
                    id="submitBtn"
                    onclick="window.submitMcqAnswer()"
                    disabled
                    class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Submit Answer
                </button>
            </div>
        </div>
    `;
}

function renderNextQuestion(setId) {
    if (currentIndex >= cards.length) {
        renderResults(setId);
        return;
    }

    document.getElementById('questionContainer').innerHTML = renderQuestion();
    updateProgress();
}

function renderResults(setId) {
    const percentage = Math.round((score / cards.length) * 100);
    const passed = percentage >= 70;

    const content = `
        <div class="container mx-auto px-4 max-w-5xl py-12 animate-fade-in">
            <div class="bg-white rounded-2xl p-12 shadow-lg text-center mb-8">
                <div class="mb-6">
                    <div class="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">MCQ Test Complete</div>
                    <h2 class="text-4xl font-bold text-gray-900 mb-4">${passed ? 'Passed' : 'Review Your Answers'}</h2>
                    <p class="text-gray-600 text-lg">You answered ${score} out of ${cards.length} questions correctly.</p>
                </div>

                <div class="results-score mb-8">${percentage}%</div>

                <div class="grid grid-cols-3 gap-6 mb-10 max-w-2xl mx-auto">
                    <div class="text-center">
                        <div class="text-3xl font-bold text-green-600 mb-2">${score}</div>
                        <div class="text-gray-600">Correct</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-red-600 mb-2">${cards.length - score}</div>
                        <div class="text-gray-600">Incorrect</div>
                    </div>
                    <div class="text-center">
                        <div class="text-3xl font-bold text-gray-900 mb-2">${cards.length}</div>
                        <div class="text-gray-600">Total</div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row gap-4 justify-center">
                    <button onclick="window.location.reload()" class="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                        Retake Test
                    </button>
                    <button onclick="window.location.hash='/set/${setId}'" class="px-8 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300">
                        Back to Set
                    </button>
                </div>
            </div>

            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div class="px-8 py-6 border-b border-gray-100 bg-gray-50 text-left">
                    <h3 class="text-2xl font-bold text-gray-900">Answer Review</h3>
                    <p class="text-sm text-gray-500 mt-1">See what you got right and what needs work.</p>
                </div>

                <div class="divide-y divide-gray-100 text-left">
                    ${responses.map((response, index) => `
                        <div class="p-6 ${response.isCorrect ? 'bg-green-50/40' : 'bg-red-50/40'}">
                            <div class="flex items-start justify-between gap-4 mb-4">
                                <div>
                                    <div class="text-xs uppercase tracking-wide font-semibold text-gray-500 mb-2">Question ${index + 1}</div>
                                    <p class="text-lg font-medium text-gray-900">${response.prompt}</p>
                                </div>
                                <div class="flex-shrink-0 px-3 py-1 rounded-full text-sm font-semibold ${response.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">
                                    ${response.isCorrect ? 'Correct' : 'Incorrect'}
                                </div>
                            </div>

                            <div class="grid md:grid-cols-2 gap-4">
                                <div>
                                    <div class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Your Answer</div>
                                    <div class="rounded-xl border border-gray-200 bg-white px-4 py-3 ${response.isCorrect ? 'text-green-700' : 'text-red-600'} ${response.isCorrect ? '' : 'line-through'}">
                                        ${response.selectedAnswer || 'No answer selected'}
                                    </div>
                                </div>
                                <div>
                                    <div class="text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">Correct Answer</div>
                                    <div class="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700 font-semibold">
                                        ${response.correctAnswer}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

    document.getElementById('mcqModeContent').innerHTML = content;
}

function updateProgress() {
    const progressText = document.getElementById('progressText');
    const scoreText = document.getElementById('scoreText');
    const progressBar = document.getElementById('progressBar');

    if (progressText) {
        progressText.textContent = `${Math.min(currentIndex + 1, cards.length)} / ${cards.length}`;
    }

    if (scoreText) {
        scoreText.textContent = `${score} correct`;
    }

    if (progressBar) {
        progressBar.style.width = `${((currentIndex + 1) / cards.length) * 100}%`;
    }
}

function showError(message) {
    document.getElementById('mcqModeContent').innerHTML = `
        <div class="container mx-auto px-4 py-20 text-center">
            <h1 class="text-3xl font-bold text-gray-900 mb-4">Error</h1>
            <p class="text-gray-600 mb-6">${message}</p>
            <button onclick="window.location.hash='/dashboard'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                Back to Dashboard
            </button>
        </div>
    `;
}

// Global functions
window.selectMcqAnswer = (answer) => {
    if (!currentQuestion) return;

    // Normalize selected answer for reliable comparisons
    selectedAnswer = String(answer || '').trim();
    const buttons = document.querySelectorAll('.mcq-option');
    buttons.forEach(button => {
        button.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700');
        button.classList.add('border-gray-200');

        // Use dataset if present, otherwise fall back to trimmed button text
        const btnAnswer = String(button.dataset.answer || button.textContent || '').trim();
        if (btnAnswer === selectedAnswer) {
            button.classList.remove('border-gray-200');
            button.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
        }
    });

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) {
        submitBtn.disabled = false;
    }
};

window.submitMcqAnswer = () => {
    if (!currentQuestion || !selectedAnswer) return;

    const isCorrect = String(selectedAnswer).trim() === String(currentQuestion.correctAnswer || '').trim();
    responses.push({
        prompt: currentQuestion.prompt,
        selectedAnswer,
        correctAnswer: currentQuestion.correctAnswer,
        isCorrect
    });

    if (isCorrect) {
        score++;
    }

    currentIndex++;
    const setId = window.location.hash.split('/')[2];
    renderNextQuestion(setId);
};