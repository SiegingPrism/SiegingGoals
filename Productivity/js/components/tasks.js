// Tasks Component
window.TasksView = function (state, dispatch) {
    const container = document.createElement('div');

    // Filter Logic
    const filter = state.tasksFilter || 'all'; // all, active, completed, deep
    let displayedTasks = state.tasks;

    if (filter === 'active') displayedTasks = state.tasks.filter(t => t.status !== 'done');
    if (filter === 'completed') displayedTasks = state.tasks.filter(t => t.status === 'done');
    if (filter === 'deep') displayedTasks = state.tasks.filter(t => t.type === 'deep');

    const doneCount = state.tasks.filter(t => t.status === 'done').length;

    const html = `
        <div class="header">
            <h1 class="page-title">Tasks</h1>
            <div class="t-muted" style="font-size: 0.9rem;">
                Total Completed: <span class="t-accent">${doneCount}</span>
            </div>
        </div>
        
        <!-- Filter Bar -->
        <div class="flex-row gap-2" style="margin-bottom: 1.5rem; overflow-x: auto; padding-bottom: 5px;">
            <button class="btn ${filter === 'all' ? 'btn-primary' : 'btn-ghost'} filter-btn" data-filter="all">All Tasks</button>
            <button class="btn ${filter === 'active' ? 'btn-primary' : 'btn-ghost'} filter-btn" data-filter="active">Active</button>
            <button class="btn ${filter === 'deep' ? 'btn-primary' : 'btn-ghost'} filter-btn" data-filter="deep">Deep Work</button>
            <button class="btn ${filter === 'completed' ? 'btn-primary' : 'btn-ghost'} filter-btn" data-filter="completed">Completed</button>
        </div>

        <!-- Input Area -->
        <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg); margin-bottom: 2rem;">
            <div class="flex-col gap-4">
                <input type="text" id="new-task-title" class="input-glass" placeholder="What needs to be done?" autocomplete="off">
                
                <div class="flex-row gap-4" style="justify-content: space-between; align-items: center;">
                    <div class="flex-row gap-2">
                        <select id="new-task-difficulty" class="input-glass" style="width: auto; padding: 0.5rem;">
                            <option value="easy">Easy (1x XP)</option>
                            <option value="medium">Medium (2x XP)</option>
                            <option value="hard">Hard (3x XP)</option>
                        </select>
                        <select id="new-task-energy" class="input-glass" style="width: auto; padding: 0.5rem;">
                            <option value="low">Low Energy</option>
                            <option value="medium">Med Energy</option>
                            <option value="high">High Energy</option>
                        </select>
                        <select id="new-task-type" class="input-glass" style="width: auto; padding: 0.5rem;">
                            <option value="shallow">Shallow Work</option>
                            <option value="deep">Deep Work</option>
                        </select>
                    </div>
                    <button id="add-task-btn" class="btn btn-primary">Add Task ↵</button>
                </div>
            </div>
        </div>

        <!-- Task List -->
        <div id="task-list" style="min-height: 50px;">
            ${displayedTasks.length === 0 ? '<p class="t-muted" style="padding:1rem; text-align:center;">No tasks found for this filter.</p>' : ''}
        </div>
    `;

    container.innerHTML = html;

    // Filter Events
    container.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            dispatch('SET_TASK_FILTER', { filter: e.target.dataset.filter });
        });
    });

    // Helper to render a single card
    const renderCard = (task) => {
        const div = document.createElement('div');
        div.className = 'task-card flex-row';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.animation = 'fadeIn 0.3s ease-out';

        // Dynamic border color based on difficulty
        const borderColor = task.difficulty === 'hard' ? 'var(--color-danger)'
            : task.difficulty === 'medium' ? 'var(--color-warning)'
                : 'var(--color-success)';

        div.innerHTML = `
            <style>
               @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
               .task-card[data-id="${task.id}"]::before { background: ${borderColor}; }
            </style>
            <div class="flex-row gap-4 flex-center">
                <div class="custom-checkbox ${task.status === 'done' ? 'checked' : ''}" style="
                    width: 24px; height: 24px; 
                    border: 2px solid var(--color-text-muted); 
                    border-radius: 6px; 
                    cursor: pointer;
                    display: flex; align-items: center; justify-content: center;
                    background: ${task.status === 'done' ? 'var(--color-success)' : 'transparent'};
                    border-color: ${task.status === 'done' ? 'var(--color-success)' : 'var(--color-text-muted)'};
                    transition: 0.2s;
                ">
                    ${task.status === 'done' ? '<span style="color:black; font-weight:bold;">✓</span>' : ''}
                </div>
                <div class="flex-col">
                    <span style="font-weight: 500; font-size: 1.05rem; ${task.status === 'done' ? 'text-decoration: line-through; opacity: 0.7;' : ''}">${task.title}</span>
                    <div class="flex-row gap-2" style="margin-top: 6px;">
                        <span class="tag tag-difficulty-${task.difficulty}">${task.difficulty}</span>
                        <span class="tag tag-energy-${task.energy}">${task.energy}</span>
                        ${task.type === 'deep' ? '<span class="tag" style="background:#5c00d2; color:white;">Deep Focus</span>' : ''}
                    </div>
                </div>
            </div>
            <button class="btn btn-ghost" style="padding: 0.5rem; font-size: 1.2rem;">&times;</button>
        `;

        div.dataset.id = task.id;

        // Click checkbox logic
        div.querySelector('.custom-checkbox').addEventListener('click', () => {
            dispatch('TOGGLE_TASK', { id: task.id });
        });

        // Delete logic
        div.querySelector('.btn-ghost').addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm('Delete this task?')) {
                dispatch('DELETE_TASK', { id: task.id });
            }
        });

        return div;
    };

    const listContainer = container.querySelector('#task-list');
    displayedTasks.forEach(task => listContainer.appendChild(renderCard(task)));

    // Bind Add Event
    const btn = container.querySelector('#add-task-btn');
    const input = container.querySelector('#new-task-title');
    const diff = container.querySelector('#new-task-difficulty');
    const energy = container.querySelector('#new-task-energy');
    const type = container.querySelector('#new-task-type');

    const handleAdd = () => {
        if (!input.value.trim()) return;
        dispatch('ADD_TASK', {
            title: input.value,
            difficulty: diff.value,
            energy: energy.value,
            type: type.value
        });
    };

    btn.addEventListener('click', handleAdd);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleAdd();
    });

    return container;
};
