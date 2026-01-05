// Habits Component
window.HabitsView = function (state, dispatch) {
    const container = document.createElement('div');
    const habits = state.habits || [];

    // Date Helpers
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const html = `
        <div class="header">
            <h1 class="page-title">Habit Intelligence</h1>
            <button id="add-habit-btn" class="btn btn-primary">Track New Pattern</button>
        </div>

        <!-- Add Form -->
        <div id="habit-input-area" class="glass-panel" style="display:none; padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
             <input type="text" id="new-habit-title" class="input-glass" placeholder="Habit Title (e.g., Read 30 mins)" style="margin-bottom: 0.5rem;">
             <div class="flex-row gap-2" style="justify-content: space-between;">
                <select id="new-habit-impact" class="input-glass" style="width: auto;">
                    <option value="high">High Impact (Health/Core)</option>
                    <option value="medium">Medium Impact</option>
                    <option value="low">Low Impact</option>
                </select>
                <button id="confirm-add-habit" class="btn btn-primary">Start Tracking</button>
             </div>
        </div>

        <div class="flex-col gap-4">
            ${habits.length === 0 ? '<div class="t-muted" style="text-align:center; padding:2rem;">No patterns detected. Initialize monitoring.</div>' : ''}
            
            ${habits.map(habit => {
        const isDoneToday = habit.history && habit.history.includes(today);
        const stabilityScore = habit.stability || 0; // 0-100
        const streak = habit.streak || 0;

        // Stability Visual
        let stabilityColor = 'var(--color-danger)';
        if (stabilityScore > 40) stabilityColor = 'var(--color-warning)';
        if (stabilityScore > 80) stabilityColor = 'var(--color-success)';

        return `
                <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg); display: grid; grid-template-columns: 1fr auto; align-items: center;">
                    <div>
                        <div class="flex-row gap-2 flex-center" style="justify-content: flex-start; margin-bottom: 0.5rem;">
                             <span style="font-weight: 700; font-size: 1.1rem;">${habit.title}</span>
                             <span class="tag" style="background: rgba(255,255,255,0.05);">${streak} Day Streak</span>
                             ${streak > 7 ? '<span class="tag" style="background: var(--color-primary-glow);">🔥 Established</span>' : ''}
                        </div>
                        
                        <div class="flex-col">
                             <div style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 4px;">Stability Score: ${stabilityScore}%</div>
                             <div style="width: 200px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;">
                                 <div style="width: ${stabilityScore}%; height: 100%; background: ${stabilityColor}; border-radius: 2px; transition: width 0.3s ease;"></div>
                             </div>
                        </div>
                    </div>

                    <div>
                        <button class="btn ${isDoneToday ? 'btn-ghost' : 'btn-primary'} check-habit-btn" 
                                data-id="${habit.id}" 
                                ${isDoneToday ? 'disabled' : ''}>
                                ${isDoneToday ? 'Completed Today' : 'Check In'}
                        </button>
                    </div>
                </div>
                `;
    }).join('')}
        </div>
    `;

    container.innerHTML = html;

    // Logic
    const addBtn = container.querySelector('#add-habit-btn');
    const inputArea = container.querySelector('#habit-input-area');
    const confirmBtn = container.querySelector('#confirm-add-habit');
    const titleInput = container.querySelector('#new-habit-title');

    addBtn.addEventListener('click', () => {
        inputArea.style.display = 'block';
        titleInput.focus();
    });

    confirmBtn.addEventListener('click', () => {
        if (!titleInput.value) return;
        dispatch('ADD_HABIT', { title: titleInput.value });
        inputArea.style.display = 'none';
        titleInput.value = '';
    });

    container.querySelectorAll('.check-habit-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (e.target.disabled) return;
            const id = e.target.dataset.id;
            dispatch('CHECK_HABIT', { id });
        });
    });

    return container;
};
