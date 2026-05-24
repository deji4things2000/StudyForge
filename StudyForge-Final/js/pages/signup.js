// Signup Page
export function render() {
    return `
        <div class="container mx-auto px-4">
            <div class="max-w-md mx-auto mt-20 bg-white p-8 rounded-2xl shadow-2xl animate-fade-in">
                <div class="text-center mb-8">
                    <div class="text-5xl mb-4">✨</div>
                    <h2 class="text-3xl font-bold text-gray-900">Create Account</h2>
                    <p class="text-gray-600 mt-2">Start your learning journey today</p>
                </div>
                <form id="signupForm" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                        <input type="text" id="signupName" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                        <input type="email" id="signupEmail" required class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Password (min. 6 characters)</label>
                        <input type="password" id="signupPassword" required minlength="6" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition">
                    </div>
                    <div id="signupError" class="hidden text-red-600 text-sm bg-red-50 p-3 rounded-lg"></div>
                    <button type="submit" class="w-full py-3 button-primary text-white rounded-lg font-semibold text-lg">
                        Sign Up
                    </button>
                </form>
                <p class="text-center mt-6 text-gray-600">
                    Already have an account? <a href="#/login" class="text-blue-600 font-semibold hover:text-blue-700">Log in</a>
                </p>
            </div>
        </div>
    `;
}

export function init() {
    const form = document.getElementById('signupForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('signupName').value;
        const email = document.getElementById('signupEmail').value;
        const password = document.getElementById('signupPassword').value;
        const errorDiv = document.getElementById('signupError');
        const submitBtn = form.querySelector('button[type="submit"]');

        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account...';

        const { signup } = await import('../auth.js');
        const result = await signup(email, password, name);

        if (result.success) {
            window.location.hash = '/dashboard';
        } else {
            errorDiv.textContent = result.error;
            errorDiv.classList.remove('hidden');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign Up';
        }
    });
}
