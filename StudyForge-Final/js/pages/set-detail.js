// Set Detail Page
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { doc, getDoc, collection, getDocs, query, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { exportToAnki, exportToCSV, formatDate } from '../utils/helpers.js';

export function render(setId) {
    return `
        <div id="setDetailContent" class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
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
            document.getElementById('setDetailContent').innerHTML = `
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
        const cards = cardsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        renderSetDetail(setData, cards);
    } catch (error) {
        console.error('Error loading set:', error);
        document.getElementById('setDetailContent').innerHTML = `
            <div class="container mx-auto px-4 py-20 text-center">
                <h1 class="text-4xl font-bold text-gray-900 mb-4">Error Loading Set</h1>
                <p class="text-gray-600 mb-4">${error.message}</p>
                <button onclick="window.location.hash='/dashboard'" class="px-6 py-3 bg-blue-600 text-white rounded-lg">
                    Back to Dashboard
                    </button>
            </div>
        `;
    }
}

function renderSetDetail(setData, cards) {
    const content = `
        <!-- Hero Section -->
        <div class="gradient-primary text-white py-12">
            <div class="container mx-auto px-4 max-w-6xl">
                <div class="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div class="flex-1 mb-6 md:mb-0">
                        <div class="flex items-center space-x-3 mb-4">
                            <div class="bg-white bg-opacity-20 p-2 rounded-lg">
                                <span class="text-2xl">📖</span>
                            </div>
                            <span class="text-blue-100 text-sm font-medium">Study Set</span>
                        </div>
                        <h1 class="text-4xl md:text-5xl font-bold mb-3">${setData.title}</h1>
                        ${setData.description ? `<p class="text-blue-100 text-lg mb-4">${setData.description}</p>` : ''}
                        <div class="flex items-center space-x-6 text-sm text-blue-100">
                            <span class="flex items-center space-x-2">
                                <span>⭐</span>
                                <span>${cards.length} terms</span>
                            </span>
                            <span>Created ${formatDate(setData.createdAt?.toDate ? setData.createdAt.toDate() : setData.createdAt)}</span>
                        </div>
                    </div>

                    <div class="flex flex-col sm:flex-row gap-3">
                        <button onclick="window.handleExportAnki('${setData.id}')" class="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-blue-600 rounded-xl hover:bg-blue-50 transition font-semibold shadow-lg">
                            <span>📥</span>
                            <span>Export to Anki</span>
                        </button>
                        <button onclick="window.handleExportCSV('${setData.id}')" class="flex items-center justify-center space-x-2 px-6 py-3 bg-white bg-opacity-20 text-white rounded-xl hover:bg-opacity-30 transition border border-white border-opacity-20 font-medium">
                            <span>📄</span>
                            <span>Export CSV</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Study Modes -->
        <div class="container mx-auto px-4 max-w-6xl -mt-8 mb-12">
            <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                <a href="#/study/${setData.id}/flashcards" class="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:-translate-y-1 duration-200">
                    <div class="gradient-blue w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span class="text-white text-2xl">📇</span>
                    </div>
                    <h3 class="font-bold text-xl mb-2 text-gray-900">Flashcards</h3>
                    <p class="text-gray-600 text-sm">Review cards with flip mode</p>
                </a>

                <a href="#/study/${setData.id}/write" class="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:-translate-y-1 duration-200">
                    <div class="gradient-purple w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span class="text-white text-2xl">✍️</span>
                    </div>
                    <h3 class="font-bold text-xl mb-2 text-gray-900">Write</h3>
                    <p class="text-gray-600 text-sm">Test by typing answers</p>
                </a>

                <a href="#/study/${setData.id}/spell" class="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:-translate-y-1 duration-200">
                    <div class="gradient-pink w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span class="text-white text-2xl">🔊</span>
                    </div>
                    <h3 class="font-bold text-xl mb-2 text-gray-900">Spell</h3>
                    <p class="text-gray-600 text-sm">Practice with audio</p>
                </a>

                <a href="#/study/${setData.id}/learn" class="bg-white p-6 rounded-2xl shadow-lg hover:shadow-xl transition border border-gray-100 group hover:-translate-y-1 duration-200">
                    <div class="gradient-green w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span class="text-white text-2xl">🧠</span>
                    </div>
                    <h3 class="font-bold text-xl mb-2 text-gray-900">Learn</h3>
                    <p class="text-gray-600 text-sm">Smart mixed questions</p>
                </a>
            </div>
        </div>

        <!-- Cards List -->
        <div class="container mx-auto px-4 max-w-6xl pb-12">
            <div class="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div class="px-8 py-6 border-b border-gray-100 bg-gray-50">
                    <h2 class="text-2xl font-bold text-gray-900">Terms in this set (${cards.length})</h2>
                </div>
                
                ${cards.length === 0 ? `
                    <div class="p-12 text-center">
                        <span class="text-6xl block mb-4">📖</span>
                        <p class="text-gray-500 text-lg">No cards in this set yet.</p>
                    </div>
                ` : `
                    <div class="divide-y divide-gray-100">
                        ${cards.map((card, index) => `
                            <div class="p-6 hover:bg-gray-50 transition-colors">
                                <div class="flex items-start space-x-6">
                                    <div class="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                        <span class="text-sm font-semibold text-gray-600">${index + 1}</span>
                                    </div>
                                    <div class="flex-1 grid md:grid-cols-2 gap-6">
                                        <div>
                                            <div class="text-xs uppercase font-semibold text-gray-500 mb-2 tracking-wide">Term</div>
                                            <p class="text-gray-900 font-medium text-lg">${card.term}</p>
                                        </div>
                                        <div class="border-l border-gray-200 pl-6">
                                            <div class="text-xs uppercase font-semibold text-gray-500 mb-2 tracking-wide">Definition</div>
                                            <p class="text-gray-700 text-lg">${card.definition}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;

    document.getElementById('setDetailContent').innerHTML = content;

    // Store data globally for export
    window.currentSetData = { setData, cards };
}

// Global export handlers
window.handleExportAnki = async (setId) => {
    if (window.currentSetData) {
        const { setData, cards } = window.currentSetData;
        exportToAnki(setData.title, cards);
    }
};

window.handleExportCSV = async (setId) => {
    if (window.currentSetData) {
        const { setData, cards } = window.currentSetData;
        exportToCSV(setData.title, cards);
    }
};
