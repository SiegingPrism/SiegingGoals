// Goals Component - Hierarchical View
window.GoalsView = function (state, dispatch) {
    const container = document.createElement('div');
    const goals = state.goals || [];

    const html = `
        <div class="header">
            <h1 class="page-title">Life & Goals</h1>
            <button id="add-goal-btn" class="btn btn-primary">Define New Goal</button>
        </div>

        <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
            <p class="t-muted" style="margin-bottom: 1rem;">Hierarchy: Life → Yearly → Monthly → Weekly</p>
            
            <div id="goal-input-area" style="display:none; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                <input type="text" id="new-goal-title" class="input-glass" placeholder="Goal Title (e.g., Become a Senior Dev)" style="margin-bottom: 0.5rem;">
                <select id="new-goal-type" class="input-glass" style="margin-bottom: 0.5rem;">
                    <option value="life">Life Goal (Vision)</option>
                    <option value="year">Yearly Goal</option>
                    <option value="month">Monthly Goal</option>
                </select>
                <button id="confirm-add-goal" class="btn btn-primary" style="width: 100%;">Create Goal</button>
            </div>
        </div>

        <div id="goals-tree" class="flex-col gap-4">
            ${goals.map(g => `
                <div class="glass-panel" style="padding: 1rem; border-left: 4px solid ${g.status === 'done' ? 'var(--color-success)' : 'var(--color-primary)'}; display: flex; align-items: center; justify-content: space-between;">
                    <div>
                        <div class="flex-row gap-2" style="align-items: center;">
                            <span style="font-weight: 700; font-size: 1.1rem; ${g.status === 'done' ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${g.title}</span>
                            ${g.status === 'done' ? '<span style="font-size: 0.8rem; color: var(--color-success);">Completed</span>' : ''}
                        </div>
                        <span class="tag" style="background: rgba(255,255,255,0.1); font-size: 0.7rem; margin-top: 0.25rem; display: inline-block;">${g.type.toUpperCase()} GOAL</span>
                    </div>
                    <button class="btn btn-ghost toggle-goal-btn" data-id="${g.id}" title="${g.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}" style="font-size: 1.25rem;">
                        ${g.status === 'done' ? '✅' : '⬜'}
                    </button>
                </div>
            `).join('')}
            ${goals.length === 0 ? '<div class="t-muted text-center" style="text-align:center;">No goals defined. Start with a Life Vision.</div>' : ''}
        </div>
    `;

    container.innerHTML = html;

    // Logic
    const addBtn = container.querySelector('#add-goal-btn');
    const inputArea = container.querySelector('#goal-input-area');
    const confirmBtn = container.querySelector('#confirm-add-goal');
    const titleInput = container.querySelector('#new-goal-title');
    const typeInput = container.querySelector('#new-goal-type');

    addBtn.addEventListener('click', () => {
        inputArea.style.display = 'block';
    });

    confirmBtn.addEventListener('click', () => {
        if (!titleInput.value) return;
        dispatch('ADD_GOAL', {
            title: titleInput.value,
            type: typeInput.value,
            parentId: null, // hierarchical logic to be added later
            status: 'active'
        });
        inputArea.style.display = 'none';
        titleInput.value = '';
    });

    container.querySelectorAll('.toggle-goal-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            dispatch('TOGGLE_GOAL', { id });
        });
    });

    return container;
};
