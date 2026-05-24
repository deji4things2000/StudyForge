// Premium Apple-Style Home Page
export function render() {
    return `
        <div class="min-h-screen bg-gradient-to-br from-white via-gray-50 to-white">
            <!-- Hero Section -->
            <div class="container mx-auto px-4">
                <div class="text-center py-24 animate-fade-in">
                    <!-- Main Heading -->
                    <div class="mb-12">
                        <div class="text-8xl mb-8 animate-bounce inline-block">📚</div>
                        <h1 class="text-7xl md:text-8xl font-bold text-gray-900 mb-6 tracking-tight leading-none">
                            Study
                            <span class="block mt-2 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 bg-clip-text text-transparent">Smarter</span>
                        </h1>
                        <p class="text-2xl md:text-3xl text-gray-600 max-w-4xl mx-auto leading-relaxed font-light">
                            Create flashcards, import from Anki, and master any subject with intelligent study tools designed for modern learners.
                        </p>
                    </div>

                    <!-- CTA Buttons -->
                    <div class="flex flex-col sm:flex-row justify-center gap-4 mb-24">
                        <button onclick="window.location.hash='/signup'" class="group px-10 py-5 bg-blue-600 text-white text-xl rounded-full font-semibold hover:bg-blue-700 transition-all shadow-lg hover:shadow-2xl hover:scale-105 duration-300">
                            <span class="flex items-center justify-center space-x-2">
                                <span>Get Started</span>
                                <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"/>
                                </svg>
                            </span>
                        </button>
                        <button onclick="window.location.hash='/login'" class="px-10 py-5 bg-white text-gray-900 text-xl rounded-full font-semibold hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-gray-300 hover:scale-105 duration-300">
                            Log In
                        </button>
                    </div>

                    <!-- Feature Cards -->
                    <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        <div class="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                📇
                            </div>
                            <h3 class="text-2xl font-semibold mb-3 text-gray-900">Flashcards</h3>
                            <p class="text-gray-600 leading-relaxed">Classic flip cards with smooth animations for quick review sessions</p>
                        </div>

                        <div class="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-purple-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div class="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                ✍️
                            </div>
                            <h3 class="text-2xl font-semibold mb-3 text-gray-900">Write Mode</h3>
                            <p class="text-gray-600 leading-relaxed">Test your knowledge by typing answers and get instant feedback</p>
                        </div>

                        <div class="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-pink-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div class="w-20 h-20 bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                🔊
                            </div>
                            <h3 class="text-2xl font-semibold mb-3 text-gray-900">Spell Mode</h3>
                            <p class="text-gray-600 leading-relaxed">Practice pronunciation with audio playback and spelling tests</p>
                        </div>

                        <div class="group bg-white rounded-3xl p-8 border border-gray-100 hover:border-green-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                            <div class="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                🧠
                            </div>
                            <h3 class="text-2xl font-semibold mb-3 text-gray-900">Learn Mode</h3>
                            <p class="text-gray-600 leading-relaxed">Smart adaptive learning with mixed question types</p>
                        </div>
                    </div>

                    <!-- Import/Export Section -->
                    <div class="max-w-5xl mx-auto mt-24">
                        <div class="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-3xl p-12 border border-indigo-100 shadow-xl">
                            <h2 class="text-4xl font-bold mb-6 text-gray-900">Seamless Import & Export</h2>
                            <p class="text-xl text-gray-700 mb-10 leading-relaxed">Bring your existing Anki decks or start fresh. Export anytime to keep your data portable.</p>
                            <div class="grid md:grid-cols-2 gap-6">
                                <div class="group bg-white rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div class="text-5xl mb-4">📥</div>
                                    <h3 class="text-xl font-semibold mb-2">Import from Anki</h3>
                                    <p class="text-gray-600">Bring all your existing study decks instantly</p>
                                </div>
                                <div class="group bg-white rounded-2xl p-8 hover:shadow-lg transition-all hover:-translate-y-1">
                                    <div class="text-5xl mb-4">📤</div>
                                    <h3 class="text-xl font-semibold mb-2">Export Anywhere</h3>
                                    <p class="text-gray-600">Take your study sets to any platform</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Final CTA -->
                    <div class="mt-32 mb-16">
                        <div class="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-16 text-white shadow-2xl">
                            <h2 class="text-4xl md:text-5xl font-bold mb-6">Ready to ace your exams?</h2>
                            <p class="text-xl mb-10 opacity-95 max-w-2xl mx-auto">Join students worldwide who are studying smarter with StudyForge</p>
                            <button onclick="window.location.hash='/signup'" class="px-12 py-5 bg-white text-blue-600 rounded-full font-bold text-xl hover:bg-gray-50 transition-all shadow-2xl hover:scale-105 duration-300">
                                Create Your Free Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

export function init() {
    console.log('Home page initialized');
}
