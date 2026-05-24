// Dashboard Page
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { collection, query, where, getDocs, orderBy, deleteDoc, doc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { formatDate } from '../utils/helpers.js';

export function render() {
    return `
        <div class="container mx-auto px-4 py-8 animate-fade-in">
            <div class="mb-8">
                <h1 class="text-4xl font-bold text-gray-900 mb-2">My Dashboard</h1>
                <p class="text-gray-600" id="welcomeText">Welcome back!</p>
            </div>
            
            <div class="mb-8 flex flex-wrap gap-4">
                <button onclick="window.location.hash='/create-set'" class="px-8 py-4 button-primary text-white rounded-xl font-bold text-lg shadow-lg flex items-center space-x-2">
                    <span>➕</span>
                    <span>Create Study Set</span>
                </button>
            </div>

            <div id="studySetsContainer" class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="col-span-full flex justify-center py-12">
                    <div class="loading-spinner"></div>
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

    document.getElementById('welcomeText').textContent = `Welcome back, ${currentUser.displayName || currentUser.email}!`;
    
    await loadStudySets();
}

async function loadStudySets() {
    const container = document.getElementById('studySetsContainer');
    
    try {
        const setsQuery = query(
            collection(db, 'studySets'),
            where('ownerId', '==', currentUser.uid),
            orderBy('updatedAt', 'desc')
        );
        
        const setsSnapshot = await getDocs(setsQuery);
        const sets = setsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        if (sets.length === 0) {
            container.innerHTML = `
                <div class="col-span-full bg-white p-12 rounded-2xl text-center border-2 border-dashed border-gray-300 animate-fade-in">
                    <div class="text-6xl mb-4">📚</div>
                    <h3 class="text-2xl font-bold text-gray-700 mb-2">No study sets yet</h3>
                    <p class="text-gray-600 mb-6">Create your first set to get started!</p>
                    <button onclick="window.location.hash='/create-set'" class="px-8 py-3 button-primary text-white rounded-lg font-semibold inline-flex items-center space-x-2">
                        <span>➕</span>
                        <span>Create Your First Set</span>
                    </button>
                </div>
            `;
        } else {
            container.innerHTML = sets.map(set => `
                <div class="bg-white p-6 rounded-2xl shadow-lg card-hover border border-gray-100 animate-fade-in">
                    <div class="flex justify-between items-start mb-4">
                        <div class="text-4xl">📖</div>
                        <button onclick="window.deleteSet('${set.id}')" class="text-red-500 hover:text-red-700 transition p-2 hover:bg-red-50 rounded-lg" title="Delete">
                            🗑️
                        </button>
                    </div>
                    <a href="#/set/${set.id}" class="block">
                        <h3 class="text-xl font-bold mb-2 text-gray-900 hover:text-blue-600 transition">${set.title}</h3>
                        <p class="text-gray-600 text-sm mb-4 line-clamp-2">${set.description || 'No description'}</p>
                    </a>
                    <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>${set.cardCount || 0} cards</span>
                        <span>${formatDate(set.updatedAt?.toDate ? set.updatedAt.toDate() : set.updatedAt)}</span>
                    </div>
                    <button onclick="window.location.hash='/study/${set.id}/flashcards'" class="w-full py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition font-medium">
                        Study Now
                    </button>
                </div>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading sets:', error);
        container.innerHTML = `
            <div class="col-span-full bg-red-50 p-6 rounded-lg text-center text-red-700">
                <p class="font-semibold mb-2">Error loading study sets</p>
                <p class="text-sm">Please refresh the page or try again later.</p>
            </div>
        `;
    }
}

// Global delete function
window.deleteSet = async (setId) => {
    if (!confirm('Are you sure you want to delete this study set? This action cannot be undone.')) return;
    
    try {
        await deleteDoc(doc(db, 'studySets', setId));
        await loadStudySets();
    } catch (error) {
        alert('Error deleting set: ' + error.message);
    }
};
