// Dashboard Component
window.DashboardView = function (state, username) {
    const container = document.createElement('div');

    const greetingName = username || 'User';

    // Advanced Productivity Score Calculation
    // Formula: (Points Earned / Total Potential Points) * 100
    // Easy: 1pt, Medium: 3pts, Hard: 5pts
    let potentialPoints = 0;
    let earnedPoints = 0;

    state.tasks.forEach(t => {
        let pts = 1;
        if (t.difficulty === 'medium') pts = 3;
        if (t.difficulty === 'hard') pts = 5;

        potentialPoints += pts;
        if (t.status === 'done') earnedPoints += pts;
    });

    const productivityScore = potentialPoints > 0 ? Math.round((earnedPoints / potentialPoints) * 100) : 0;
    const pendingTasks = state.tasks.filter(t => t.status !== 'done').length;

    // AI Suggestion Engine
    let suggestion = { icon: '🤖', text: "Analyzing patterns...", color: 'var(--color-primary)' };

    if (window.ai) {
        const aiResult = window.ai.getSuggestion();
        suggestion.text = aiResult.text;

        // Map types to visual tokens
        suggestion.color = 'var(--color-primary)';
        if (aiResult.type === 'warning') {
            suggestion.icon = '⚠️';
            suggestion.color = 'var(--color-danger)';
        }
        if (aiResult.type === 'success') {
            suggestion.icon = '⚡';
            suggestion.color = 'var(--color-success)';
        }
        if (aiResult.type === 'info') {
            suggestion.icon = 'ℹ️';
            suggestion.color = 'var(--color-accent)';
        }
    }



    const html = `
        <div class="header">
            <div>
                <h1 class="page-title">Good Evening, ${greetingName}.</h1>
                <p class="t-muted">Ready to conquer your goals?</p>
            </div>
            <div>
                 <button class="btn btn-ghost" onclick="window.app.resetData()">Reset Data</button>
            </div>
        </div>

        <!-- AI Assistant Banner -->
        <div class="glass-panel" style="padding: 1rem 1.5rem; border-radius: var(--radius-md); margin-bottom: 2rem; border-left: 4px solid ${suggestion.color}; background: linear-gradient(90deg, rgba(255,255,255,0.03) 0%, transparent 100%); display: flex; align-items: center; gap: 1rem;">
            <div style="font-size: 1.5rem;">${suggestion.icon}</div>
            <div>
                <span style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--color-text-muted); display: block; margin-bottom: 4px;">SiegingGo AI Assistant</span>
                <span style="font-weight: 500; font-size: 0.95rem;">${suggestion.text}</span>
            </div>
        </div>

        <!-- 1. Productivity Score / Hero -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
            <!-- Score Card -->
            <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
                <h3 class="t-muted" style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Productivity Score</h3>
                <div class="flex-row flex-center" style="justify-content: flex-start; gap: 1rem;">
                    <span style="font-size: 3rem; font-weight: 800; color: var(--color-accent);">${productivityScore}</span>
                    <span style="font-size: 1rem; color: var(--color-success);">+12%</span>
                </div>
                <div style="position: absolute; right: -20px; bottom: -20px; width: 100px; height: 100px; border-radius: 50%; background: var(--color-accent); filter: blur(50px); opacity: 0.2;"></div>
            </div>

             <!-- Tasks Due -->
             <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg);">
                <h3 class="t-muted" style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Tasks Pending</h3>
                <div class="flex-col">
                    <span style="font-size: 2rem; font-weight: 700;">${pendingTasks}</span>
                    <span class="t-muted">Let's get to work.</span>
                </div>
            </div>
            
             <!-- Streak -->
             <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg);">
                <h3 class="t-muted" style="font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem;">Current Streak</h3>
                <div class="flex-col">
                    <span style="font-size: 2rem; font-weight: 700; color: var(--color-primary);">🔥 ${state.user.streak || 0} Days</span>
                    <span class="t-muted">Keep it up!</span>
                </div>
            </div>
        </div>

        <!-- 2. Recent Focus -->
        <h2 style="margin-bottom: 1rem;">Quick Actions</h2>
        <div class="glass-panel" style="padding: 2rem; border-radius: var(--radius-lg); text-align: center;">
            <p class="t-muted">Start a deep work session to boost your XP.</p>
            <button class="btn btn-primary" style="margin-top: 1rem;">Start Focus Session</button>
        </div>
    `;

    container.innerHTML = html;
    return container;
};
