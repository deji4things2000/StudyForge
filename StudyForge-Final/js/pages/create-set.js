// Create Set Page
import { db } from '../firebase-config.js';
import { currentUser } from '../auth.js';
import { collection, addDoc, doc, setDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { importAnkiDeck, importCSV } from '../utils/helpers.js';

export function render() {
    return `
        <div class="container mx-auto px-4 py-8 max-w-4xl animate-fade-in">
            <h1 class="text-4xl font-bold text-gray-900 mb-8">Create Study Set</h1>
            
            <form id="createSetForm" class="space-y-6">
                <div class="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                    <input type="text" id="setTitle" placeholder="Enter a title, like 'Biology - Chapter 22: Evolution'" required class="w-full text-2xl font-bold border-0 border-b-2 border-gray-200 focus:border-blue-500 outline-none mb-4 py-3">
                    <textarea id="setDescription" placeholder="Add a description (optional)" class="w-full border-0 border-b-2 border-gray-200 focus:border-blue-500 outline-none py-2 resize-none" rows="2"></textarea>
                </div>

                <!-- Import Button -->
                <div class="flex justify-between items-center">
                    <button type="button" id="showImportBtn" class="flex items-center space-x-2 bg-white text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition border border-gray-200 shadow-sm font-medium">
                        <span>📥</span>
                        <span>Import</span>
                    </button>
                    <span class="text-sm text-gray-500" id="cardCount">2 cards</span>
                </div>

                <div id="cardsContainer" class="space-y-4">
                    ${generateCard(1)}
                    ${generateCard(2)}
                </div>

                <button type="button" id="addCardBtn" class="w-full py-4 border-2 border-dashed border-gray-300 rounded-2xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition font-medium text-lg flex items-center justify-center space-x-2">
                    <span>➕</span>
                    <span>Add Card</span>
                </button>

                <div class="flex justify-between items-center pt-4">
                    <button type="button" onclick="window.location.hash='/dashboard'" class="px-6 py-3 text-gray-600 hover:text-gray-800 transition font-medium">
                        Cancel
                    </button>
                    <button type="submit" class="px-8 py-3 button-primary text-white rounded-xl font-bold shadow-lg">
                        Create Study Set
                    </button>
                </div>
            </form>
        </div>

        <!-- Import Modal -->
        <div id="importModal" class="hidden modal modal-overlay fixed inset-0 flex items-center justify-center z-50 p-4">
            <div class="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl modal-content animate-fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-900">Import Cards</h2>
                    <button id="closeImportBtn" class="text-gray-400 hover:text-gray-600 transition text-2xl">
                        ✕
                    </button>
                </div>

                <div class="mb-6">
                    <div class="grid grid-cols-2 gap-3">
                        <button type="button" id="csvImportBtn" class="import-type-btn p-4 rounded-xl border-2 transition border-gray-200 hover:border-gray-300">
                            <span class="text-3xl block mb-2">📄</span>
                            <span class="font-medium">CSV File</span>
                        </button>
                        <button type="button" id="ankiImportBtn" class="import-type-btn p-4 rounded-xl border-2 transition border-gray-200 hover:border-gray-300">
                            <span class="text-3xl block mb-2">📥</span>
                            <span class="font-medium">Anki Deck</span>
                        </button>
                    </div>
                </div>

                <div id="importInstructions" class="mb-6 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p class="text-sm text-gray-700">Select import type above</p>
                </div>

                <input type="file" id="importFileInput" accept=".csv,.txt" class="hidden">
                <button id="selectFileBtn" class="w-full px-4 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition">
                    Select File
                </button>

                <button id="cancelImportBtn" class="w-full mt-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-medium">
                    Cancel
                </button>
            </div>
        </div>
    `;
}

function generateCard(number) {
    return `
        <div class="card-item bg-white p-6 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
            <div class="flex justify-between items-center mb-4">
                <span class="text-sm font-bold text-gray-500">CARD ${number}</span>
                ${number > 2 ? '<button type="button" class="remove-card text-red-500 hover:text-red-700 transition" title="Remove">🗑️</button>' : ''}
            </div>
            <div class="grid md:grid-cols-2 gap-4">
                <div>
                    <label class="text-xs text-gray-500 uppercase font-semibold mb-2 block">Term</label>
                    <textarea class="card-term w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" rows="3" required></textarea>
                </div>
                <div>
                    <label class="text-xs text-gray-500 uppercase font-semibold mb-2 block">Definition</label>
                    <textarea class="card-definition w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none" rows="3" required></textarea>
                </div>
            </div>
        </div>
    `;
}

function replaceCards(cards) {
    const container = document.getElementById('cardsContainer');
    container.innerHTML = '';
    cards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.innerHTML = generateCard(index + 1);
        const cardElement = cardDiv.firstElementChild;
        cardElement.querySelector('.card-term').value = card.term;
        cardElement.querySelector('.card-definition').value = card.definition;
        container.appendChild(cardElement);
        
        const removeBtn = cardElement.querySelector('.remove-card');
        if (removeBtn) {
            removeBtn.addEventListener('click', () => {
                cardElement.remove();
                updateCardNumbers();
            });
        }
    });
    updateCardCount();
}

function updateCardNumbers() {
    const cards = document.querySelectorAll('.card-item');
    cards.forEach((card, index) => {
        card.querySelector('.text-sm').textContent = `CARD ${index + 1}`;
    });
    updateCardCount();
}

function updateCardCount() {
    const count = document.querySelectorAll('.card-item').length;
    document.getElementById('cardCount').textContent = `${count} card${count !== 1 ? 's' : ''}`;
}

export function init() {
    if (!currentUser) {
        window.location.hash = '/login';
        return;
    }

    let cardCount = 2;
    let importType = 'csv';

    // Add card button
    document.getElementById('addCardBtn').addEventListener('click', () => {
        cardCount++;
        const container = document.getElementById('cardsContainer');
        const newCard = document.createElement('div');
        newCard.innerHTML = generateCard(cardCount);
        container.appendChild(newCard.firstElementChild);

        const removeBtn = newCard.querySelector('.remove-card');
        if (removeBtn) {
            removeBtn.addEventListener('click', (e) => {
                e.target.closest('.card-item').remove();
                updateCardNumbers();
            });
        }

        updateCardCount();
    });

    // Import modal handlers
    const importModal = document.getElementById('importModal');
    const showImportBtn = document.getElementById('showImportBtn');
    const closeImportBtn = document.getElementById('closeImportBtn');
    const cancelImportBtn = document.getElementById('cancelImportBtn');
    const csvImportBtn = document.getElementById('csvImportBtn');
    const ankiImportBtn = document.getElementById('ankiImportBtn');
    const selectFileBtn = document.getElementById('selectFileBtn');
    const importFileInput = document.getElementById('importFileInput');
    const importInstructions = document.getElementById('importInstructions');

    showImportBtn.addEventListener('click', () => {
        importModal.classList.remove('hidden');
    });

    closeImportBtn.addEventListener('click', () => {
        importModal.classList.add('hidden');
    });

    cancelImportBtn.addEventListener('click', () => {
        importModal.classList.add('hidden');
    });

    csvImportBtn.addEventListener('click', () => {
        importType = 'csv';
        importFileInput.accept = '.csv';
        csvImportBtn.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
        ankiImportBtn.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700');
        importInstructions.innerHTML = `
            <p class="font-semibold mb-2 text-sm">CSV Format:</p>
            <code class="text-xs block bg-white p-2 rounded">Term,Definition<br>Hello,Hola<br>Goodbye,Adiós</code>
        `;
    });

    ankiImportBtn.addEventListener('click', () => {
        importType = 'anki';
        importFileInput.accept = '.txt';
        ankiImportBtn.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
        csvImportBtn.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700');
        importInstructions.innerHTML = `
            <p class="font-semibold mb-2 text-sm">Anki Format:</p>
            <code class="text-xs block bg-white p-2 rounded">Term[TAB]Definition<br>Each line is a card</code>
        `;
    });

    selectFileBtn.addEventListener('click', () => {
        importFileInput.click();
    });

    importFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target.result;
            let cards = [];

            if (importType === 'anki') {
                cards = importAnkiDeck(content);
                if (cards.length > 0) {
                    replaceCards(cards);
                    importModal.classList.add('hidden');
                    alert(`Successfully imported ${cards.length} cards!`);
                } else {
                    alert('No valid cards found in the file.');
                }
            } else {
                // Use PapaParse for CSV
                importCSV(file, (importedCards) => {
                    if (importedCards.length > 0) {
                        replaceCards(importedCards);
                        importModal.classList.add('hidden');
                        alert(`Successfully imported ${importedCards.length} cards!`);
                    } else {
                        alert('No valid cards found in the file.');
                    }
                });
            }
        };

        reader.readAsText(file);
    });

    // Form submission
    document.getElementById('createSetForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const title = document.getElementById('setTitle').value.trim();
        const description = document.getElementById('setDescription').value.trim();
        const terms = Array.from(document.querySelectorAll('.card-term')).map(el => el.value.trim()).filter(v => v);
        const definitions = Array.from(document.querySelectorAll('.card-definition')).map(el => el.value.trim()).filter(v => v);

        if (terms.length === 0) {
            alert('Please add at least one card with both term and definition');
            return;
        }

        const submitBtn = e.target.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating...';

        try {
            const setRef = await addDoc(collection(db, 'studySets'), {
                title,
                description,
                ownerId: currentUser.uid,
                createdAt: new Date(),
                updatedAt: new Date(),
                cardCount: terms.length
            });

            for (let i = 0; i < terms.length; i++) {
                await setDoc(doc(db, 'studySets', setRef.id, 'cards', `card_${i}`), {
                    term: terms[i],
                    definition: definitions[i],
                    order: i
                });
            }

            alert('Study set created successfully!');
            window.location.hash = '/dashboard';
        } catch (error) {
            alert('Error creating set: ' + error.message);
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Study Set';
        }
    });
}
