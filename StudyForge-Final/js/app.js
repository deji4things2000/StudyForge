// Main App Module
import { initAuth, currentUser } from './auth.js';
import { initRouter, navigateTo } from './router.js';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initComponents();
    initAuth((user) => {
        if (user) {
            if (window.location.hash === '' || window.location.hash === '#/') {
                navigateTo('/dashboard');
            }
        }
    });
    initRouter();
});

// Initialize navbar and footer
function initComponents() {
    // Navbar
    const navbar = document.getElementById('navbar');
    if (navbar) {
        navbar.innerHTML = `
            <div class="gradient-primary text-white shadow-lg">
                <div class="container mx-auto px-4 py-4 flex justify-between items-center">
                    <a href="#/" class="text-2xl font-bold cursor-pointer hover:opacity-80 transition flex items-center space-x-2">
                        <span>📚</span>
                        <span>StudyForge</span>
                    </a>
                    <div id="navButtons">
                        <button onclick="window.location.hash='/login'" class="px-4 py-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition">Login</button>
                        <button onclick="window.location.hash='/signup'" class="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition ml-2 font-semibold shadow">Sign Up</button>
                    </div>
                    <div id="userMenu" class="hidden flex items-center space-x-4">
                        <a href="#/dashboard" class="hover:bg-white hover:bg-opacity-20 px-3 py-2 rounded-lg transition">Dashboard</a>
                        <span id="userName" class="font-medium"></span>
                        <button onclick="window.handleLogout()" class="px-4 py-2 bg-white bg-opacity-20 rounded-lg hover:bg-opacity-30 transition">Logout</button>
                    </div>
                </div>
            </div>
        `;
    }

    // Footer
    const footer = document.getElementById('footer');
    if (footer) {
        footer.innerHTML = `
            <div class="bg-gray-800 text-white mt-auto py-8">
                <div class="container mx-auto px-4">
                    <div class="text-center mb-4">
                        <p class="text-gray-400 mb-2">© 2025 StudyForge · Open-source learning platform</p>
                        <div class="flex justify-center space-x-6 mb-4">
                            <a href="https://github.com/Sillybob123/StudyForge" target="_blank" class="text-gray-400 hover:text-white transition">GitHub</a>
                            <a href="https://github.com/sponsors/Sillybob123" target="_blank" class="text-pink-400 hover:text-pink-300 transition">💝 Sponsor</a>
                        </div>
                    </div>
                    <div class="text-center text-sm text-gray-500">
                        <p>Made with ❤️ for students everywhere</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// Global logout handler
window.handleLogout = async () => {
    const { logout } = await import('./auth.js');
    await logout();
    window.location.hash = '/';
};
