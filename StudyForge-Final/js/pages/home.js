// Home Page
export function render() {
    return `
        <div class="container mx-auto px-4">
            <div class="text-center py-20 animate-fade-in">
                <div class="mb-8">
                    <div class="text-6xl mb-4 animate-bounce">📚</div>
                    <h1 class="text-5xl md:text-6xl font-extrabold text-gray-900 mb-4">
                        Study Smarter with <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">StudyForge</span>
                    </h1>
                    <p class="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
                        Create flashcards, import from Anki, and master any subject with 4 intelligent study modes
                    </p>
                </div>
                <div class="flex flex-col sm:flex-row justify-center gap-4 mb-16">
                    <button onclick="window.location.hash='/signup'" class="px-8 py-4 bg-blue-600 text-white text-xl rounded-xl hover:bg-blue-700 transition shadow-lg font-bold hover:scale-105 duration-200">
                        Get Started Free
                    </button>
                    <button onclick="window.location.hash='/login'" class="px-8 py-4 border-2 border-blue-600 text-blue-600 text-xl rounded-xl hover:bg-blue-50 transition font-bold">
                        Log In
                    </button>
                </div>

                <!-- Features -->
                <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mt-20">
                    <div class="bg-white p-6 rounded-2xl shadow-xl card-hover border border-gray-100">
                        <div class="gradient-blue w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-3xl">📇</div>
                        <h3 class="text-xl font-bold mb-2 text-gray-900">Flashcards</h3>
                        <p class="text-gray-600">Classic flip cards for quick review</p>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xl card-hover border border-gray-100">
                        <div class="gradient-purple w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-3xl">✍️</div>
                        <h3 class="text-xl font-bold mb-2 text-gray-900">Write Mode</h3>
                        <p class="text-gray-600">Test yourself by typing answers</p>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xl card-hover border border-gray-100">
                        <div class="gradient-pink w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-3xl">🔊</div>
                        <h3 class="text-xl font-bold mb-2 text-gray-900">Spell Mode</h3>
                        <p class="text-gray-600">Practice with audio pronunciation</p>
                    </div>
                    <div class="bg-white p-6 rounded-2xl shadow-xl card-hover border border-gray-100">
                        <div class="gradient-green w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 text-white text-3xl">🧠</div>
                        <h3 class="text-xl font-bold mb-2 text-gray-900">Learn Mode</h3>
                        <p class="text-gray-600">Smart adaptive learning</p>
                    </div>
                </div>

                <!-- Import/Export Feature -->
                <div class="max-w-4xl mx-auto mt-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-8">
                    <h2 class="text-3xl font-bold mb-4 text-gray-900">📥 Import & Export</h2>
                    <p class="text-lg text-gray-700 mb-4">Seamlessly import from Anki or CSV, and export your sets anytime</p>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-white p-4 rounded-xl">
                            <span class="text-2xl mb-2 block">📥</span>
                            <p class="font-semibold">Import from Anki</p>
                            <p class="text-sm text-gray-600">Bring your existing decks</p>
                        </div>
                        <div class="bg-white p-4 rounded-xl">
                            <span class="text-2xl mb-2 block">📤</span>
                            <p class="font-semibold">Export to Anki</p>
                            <p class="text-sm text-gray-600">Take your sets anywhere</p>
                        </div>
                    </div>
                </div>

                <!-- CTA -->
                <div class="mt-20 gradient-primary rounded-2xl p-12 text-white max-w-4xl mx-auto">
                    <h2 class="text-3xl md:text-4xl font-bold mb-4">Ready to ace your exams?</h2>
                    <p class="text-xl mb-8 opacity-90">Join students worldwide studying smarter with StudyForge</p>
                    <button onclick="window.location.hash='/signup'" class="px-10 py-5 bg-white text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition shadow-2xl hover:scale-105 duration-200">
                        Create Your Free Account
                    </button>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    console.log('Home page initialized');
}
