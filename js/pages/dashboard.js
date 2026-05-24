// Dashboard Page
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { collection, query, where, getDocs, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatDate } from '../utils/helpers.js';

export function render() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
            <div class="container mx-auto px-4 py-12 max-w-7xl">
                <!-- Header -->
                <div class="mb-16 text-center">
                    <h1 class="text-6xl font-semibold text-gray-900 mb-4 tracking-tight">My Study Sets</h1>
                    <p class="text-xl text-gray-600" id="welcomeText">Welcome back!</p>
                </div>
                
                <!-- Create Button -->
                <div class="mb-12 flex justify-center">
                    <button onclick="window.location.hash='/create-set'" class="group px-8 py-4 bg-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center space-x-3">
                        <span class="text-2xl">+</span>
                        <span>Create Study Set</span>
                    </button>
                </div>

                <!-- Study Sets Grid -->
                <div id="studySetsContainer">
                    <div class="flex justify-center py-20">
                        <div class="loading-spinner"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export async function init() {
    if (!currentUser) {
        window.location.hash = '/login';
        return;
    }

    document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.displayName || currentUser.email}`;
    
    await loadStudySets();
}

async function loadStudySets() {
    const container = document.getElementById('studySetsContainer');
    
    try {
        // Try to load sets without orderBy first to avoid index issues
        const setsQuery = query(
            collection(db, 'studySets'),
            where('ownerId', '==', currentUser.uid)
        );
        
        const setsSnapshot = await getDocs(setsQuery);
        let sets = setsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            createdAt: doc.data().createdAt,
            updatedAt: doc.data().updatedAt
        }));

        // Sort manually
        sets.sort((a, b) => {
            const dateA = a.updatedAt?.toDate ? a.updatedAt.toDate() : new Date(a.updatedAt || 0);
            const dateB = b.updatedAt?.toDate ? b.updatedAt.toDate() : new Date(b.updatedAt || 0);
            return dateB - dateA;
        });

        if (sets.length === 0) {
            container.innerHTML = `
                <div class="max-w-2xl mx-auto text-center py-20 animate-fade-in">
                    <div class="bg-white rounded-3xl p-16 border border-gray-100 shadow-sm">
                        <div class="text-7xl mb-6">📚</div>
                        <h3 class="text-3xl font-semibold text-gray-900 mb-3">No study sets yet</h3>
                        <p class="text-lg text-gray-600 mb-8">Create your first set and start your learning journey</p>
                        <button onclick="window.location.hash='/create-set'" class="px-8 py-4 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all hover:scale-105 inline-flex items-center space-x-2">
                            <span class="text-xl">+</span>
                            <span>Create Your First Set</span>
                        </button>
                    </div>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    ${sets.map(set => `
                        <div class="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2">
                            <div class="flex justify-between items-start mb-6">
                                <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                    📖
                                </div>
                                <button onclick="window.deleteSet('${set.id}')" class="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-50 rounded-full transition-all text-red-500 hover:text-red-700">
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                    </svg>
                                </button>
                            </div>
                            <a href="#/set/${set.id}" class="block">
                                <h3 class="text-2xl font-semibold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">${set.title}</h3>
                                <p class="text-gray-600 mb-6 line-clamp-2 leading-relaxed">${set.description || 'No description'}</p>
                            </a>
                            <div class="flex items-center justify-between text-sm text-gray-500 mb-6">
                                <span class="font-medium">${set.cardCount || 0} cards</span>
                                <span>${formatDate(set.updatedAt?.toDate ? set.updatedAt.toDate() : set.updatedAt)}</span>
                            </div>
                            <button onclick="window.location.hash='/study/${set.id}/flashcards'" class="w-full py-3 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 rounded-2xl hover:from-blue-100 hover:to-indigo-100 transition-all font-semibold group-hover:shadow-md">
                                Study Now
                            </button>
                        </div>
                    `).join('')}
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading sets:', error);
        container.innerHTML = `
            <div class="max-w-2xl mx-auto text-center py-20">
                <div class="bg-white rounded-3xl p-16 border border-red-100 shadow-sm">
                    <div class="text-6xl mb-6">⚠️</div>
                    <h3 class="text-2xl font-semibold text-gray-900 mb-3">Error loading study sets</h3>
                    <p class="text-gray-600 mb-2">${error.message}</p>
                    <p class="text-sm text-gray-500 mb-6">This might be a Firestore index issue. Sets will load without sorting for now.</p>
                    <button onclick="window.location.reload()" class="px-6 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition">
                        Refresh Page
                    </button>
                </div>
            </div>
        `;
    }
}

// Global delete function
window.deleteSet = async (setId) => {
    if (!confirm('Delete this study set? This action cannot be undone.')) return;
    
    try {
        await deleteDoc(doc(db, 'studySets', setId));
        await loadStudySets();
    } catch (error) {
        alert('Error deleting set: ' + error.message);
    }
};
