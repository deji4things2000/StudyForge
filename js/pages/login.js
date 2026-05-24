// Login Page
export function render() {
    return `
        <div class="container mx-auto px-4">
            <div class="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-2xl animate-fade-in">
                <div class="text-center mb-8">
                    <div class="text-5xl mb-4">🔐</div>
                    <h2 class="text-3xl font-bold text-gray-900">Welcome Back</h2>
                    <p class="text-gray-600 mt-2">Log in to continue studying</p>
                </div>
                <form id="loginForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="loginEmail" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password</label>
                        <input type="password" id="loginPassword" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    </div>
                    <div id="loginError" class="hidden text-red-600 text-sm bg-red-50 p-3 rounded-lg"></div>
                    <button type="submit" class="w-full py-3 button-primary text-white rounded-lg font-semibold text-lg">
                        Log In
                    </button>
                </form>
                <p class="text-center mt-6 text-gray-600">
                    Don't have an account? <a href="#/signup" class="text-blue-600 font-semibold hover:text-blue-700">Sign up</a>
                </p>
            </div>
        </div>
    `;
}

export function init() {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorDiv = document.getElementById('loginError');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';

        const { login } = await import('../auth.js');
        const result = await login(email, password);

        if (result.success) {
            window.location.hash = '/dashboard';
        } else {
            errorDiv.textContent = result.error;
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log In';
        }
    });
}
