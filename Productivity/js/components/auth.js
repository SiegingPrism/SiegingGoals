// Auth Component for Login/Register
window.AuthView = function (dispatch) {
    const container = document.createElement('div');
    container.className = 'glass-panel flex-col flex-center';
    container.style.height = '100%';
    container.style.maxWidth = '400px';
    container.style.margin = '0 auto';
    container.style.textAlign = 'center';
    container.style.padding = '3rem';

    // Check if user exists (we'll pass this state in, or check DB)
    // For now, let's assume the App handles the logic of WHICH view to show (Login or Register)
    // We'll create a generic form that adapts.

    const isRegistering = !window.hasAccount; // Global flag set by App

    const html = `
        <div class="animate-pop-in" style="font-size: 4rem; margin-bottom: 1rem;">🚀</div>
        <h1 class="animate-fade-up delay-100" style="margin-bottom: 0.5rem; font-size: 2rem;">${isRegistering ? 'Welcome, Pilot.' : 'Welcome Back.'}</h1>
        <p class="t-muted animate-fade-up delay-100" style="margin-bottom: 2rem;">
            ${isRegistering ? 'Initialize your profile to begin.' : 'Enter your credentials to access the flight deck.'}
        </p>

        <form id="auth-form" class="animate-fade-up delay-200" style="width: 100%; display: flex; flex-direction: column; gap: 1rem;">
            <div style="text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">USERNAME</label>
                <input type="text" id="auth-username" class="input-glass" placeholder="Callsign" required 
                    value="${window.currentUser || ''}">
            </div>

            <div style="text-align: left;">
                <label style="font-size: 0.8rem; font-weight: 600; margin-bottom: 0.5rem; display: block;">PASSWORD / PIN</label>
                <input type="password" id="auth-password" class="input-glass" placeholder="******" required>
            </div>

            <button type="submit" class="btn btn-primary animate-fade-up delay-300" style="margin-top: 1rem; justify-content: center; padding: 1rem;">
                ${isRegistering ? 'Initialize System' : 'Login'}
            </button>
        </form>
    `;

    container.innerHTML = html;

    const form = container.querySelector('#auth-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = container.querySelector('#auth-username').value;
        const password = container.querySelector('#auth-password').value;

        if (username && password) {
            dispatch(isRegistering ? 'REGISTER_USER' : 'LOGIN_USER', { username, password });
        }
    });

    return container;
};
