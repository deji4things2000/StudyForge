// Router Module
import { currentUser } from './auth.js';

export function navigateTo(page) {
    window.location.hash = page;
}

export function initRouter() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
}

async function handleRoute() {
    const hash = window.location.hash.slice(1) || '/';
    const app = document.getElementById('app');
    
    if (!app) return;

    // Show loading
    app.innerHTML = '<div class="flex items-center justify-center min-h-screen"><div class="loading-spinner"></div></div>';

    // Parse route
    const [path, ...params] = hash.slice(1).split('/');
    
    // Route handling
    try {
        if (hash === '/' || hash === '') {
            if (currentUser) {
                await loadPage('dashboard');
            } else {
                await loadPage('home');
            }
        } else if (path === 'study' && params[0]) {
            // Study mode: /study/{setId}/{mode}
            const setId = params[0];
            const mode = params[1] || 'flashcards';
            await loadStudyMode(setId, mode);
        } else if (path === 'set' && params[0]) {
            // Set detail: /set/{setId}
            await loadSetDetail(params[0]);
        } else {
            // Regular pages
            await loadPage(path);
        }
    } catch (error) {
        console.error('Routing error:', error);
        app.innerHTML = '<div class="container mx-auto px-4 py-20 text-center"><h1 class="text-4xl font-bold text-gray-900">Error Loading Page</h1></div>';
    }
}

async function loadPage(pageName) {
    const app = document.getElementById('app');
    
    try {
        const module = await import(`./pages/${pageName}.js`);
        if (module && module.render) {
            app.innerHTML = module.render();
            if (module.init) await module.init();
        }
    } catch (error) {
        console.error('Error loading page:', error);
        app.innerHTML = '<div class="container mx-auto px-4 py-20 text-center"><h1 class="text-4xl font-bold text-gray-900">Page Not Found</h1></div>';
    }
}

async function loadStudyMode(setId, mode) {
    const app = document.getElementById('app');
    
    try {
        const module = await import(`./pages/study-${mode}.js`);
        if (module && module.render) {
            app.innerHTML = module.render(setId);
            if (module.init) await module.init(setId);
        }
    } catch (error) {
        console.error('Error loading study mode:', error);
        // Fallback to flashcards
        const module = await import(`./pages/study-flashcards.js`);
        app.innerHTML = module.render(setId);
        if (module.init) await module.init(setId);
    }
}

async function loadSetDetail(setId) {
    const app = document.getElementById('app');
    
    try {
        const module = await import(`./pages/set-detail.js`);
        if (module && module.render) {
            app.innerHTML = module.render(setId);
            if (module.init) await module.init(setId);
        }
    } catch (error) {
        console.error('Error loading set detail:', error);
        app.innerHTML = '<div class="container mx-auto px-4 py-20 text-center"><h1 class="text-4xl font-bold text-gray-900">Set Not Found</h1></div>';
    }
}
