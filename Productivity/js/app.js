// Core App Logic (Controller) - NO MODULES

class App {
    constructor() {
        this.currentView = 'dashboard';
        this.state = {
            tasks: [],
            goals: [],
            habits: [],
            skills: [],
            history: [], // For Analytics
            tasksFilter: 'all',
            user: {
                xp: 0,
                level: 1,
                streak: 0
            }
        };
        // Expose to window
        window.app = this;
    }

    async init() {
        try {
            console.log("Initializing App...");

            // Add a timeout for the DB init to detect file:// protocol hangs
            const dbInit = window.db.init();
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error("Database initialization timed out. \n\nIf you are opening this file directly (file://), your browser may be blocking IndexedDB. \n\nPlease run 'node server.js' and open 'http://localhost:3000'.")), 3000)
            );

            await Promise.race([dbInit, timeout]);

            // Init AI
            if (window.AiEngine) {
                window.ai = new window.AiEngine();
                await window.ai.init();
            }

            // Auth Check
            const currentUser = localStorage.getItem('currentUser');
            const userProfile = await window.db.get('settings', 'user_profile');

            this.initTheme();
            this.bindEvents();

            if (currentUser && userProfile && currentUser === userProfile.username) {
                window.currentUser = currentUser;
                window.hasAccount = true;
                await this.loadData();
                this.render(); // Explicitly render dashboard (default currentView)
            } else {
                window.hasAccount = !!userProfile;
                this.navigate('auth');
            }

        } catch (e) {
            console.error("Initialization failed", e);
            document.querySelector('#main-view').innerHTML = `
                <div class="glass-panel flex-col flex-center" style="padding:2rem; color: #ff6b6b; text-align: center; height: 100%;">
                    <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                    <h1 style="margin-bottom: 1rem;">Initialization Error</h1>
                    <p style="margin-bottom: 2rem; max-width: 500px; line-height: 1.6;">${e.message.replace(/\n/g, '<br>')}</p>
                    <div style="padding: 1rem; background: rgba(0,0,0,0.3); border-radius: 8px; text-align: left; font-family: monospace;">
                        <span style="color: #4cd964;">></span> node server.js<br>
                        <span style="color: #4cd964;">></span> Open http://localhost:3000
                    </div>
                </div>`;
        }
    }

    async loadData() {
        // Load entities
        this.state.tasks = await window.db.getAll('tasks');
        this.state.goals = await window.db.getAll('goals');

        // Load Patterns/History
        try {
            const patterns = await window.db.getAll('patterns');
            this.state.history = patterns || [];
        } catch (e) {
            console.warn("Could not load patterns", e);
            this.state.history = [];
        }

        try {
            this.state.habits = await window.db.getAll('habits');

            // HABIT DECAY LOGIC
            const today = new Date().toISOString().split('T')[0];
            const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

            let habitsUpdated = false;
            for (let habit of this.state.habits) {
                if (habit.history && habit.history.length > 0) {
                    const lastDate = habit.history[habit.history.length - 1];

                    // If last check-in was NOT today AND NOT yesterday, streak is broken
                    if (lastDate !== today && lastDate !== yesterday) {
                        if (habit.streak > 0) {
                            console.log(`📉 Habit Decay Detector: Breaking streak for ${habit.title}`);
                            habit.streak = 0;
                            habit.stability = Math.max(0, (habit.stability || 0) - 10); // Decay stability
                            await window.db.update('habits', habit);
                            habitsUpdated = true;
                        }
                    }
                }
            }
            if (habitsUpdated) {
                // simple notify or just silent update
                console.log("Habit streaks updated based on decay.");
            }

        } catch (e) {
            console.warn("Habits store likely not ready yet (version mismatch)", e);
            this.state.habits = [];
        }

        try {
            this.state.skills = await window.db.getAll('skills');
            if (!this.state.skills || this.state.skills.length === 0) {
                const defaults = [
                    { id: 'focus', name: 'Deep Focus', level: 1, xp: 0, maxXp: 100, icon: '🧠', description: 'Ability to work without distraction.' },
                    { id: 'discipline', name: 'Iron Will', level: 1, xp: 0, maxXp: 100, icon: '🛡️', description: 'Consistency in habits and hard tasks.' },
                    { id: 'velocity', name: 'Velocity', level: 1, xp: 0, maxXp: 100, icon: '⚡', description: 'Speed of execution for small tasks.' }
                ];
                await Promise.all(defaults.map(s => window.db.add('skills', s)));
                this.state.skills = defaults;
            }
        } catch (e) {
            console.warn("Skills store likely not ready yet", e);
            this.state.skills = [];
        }

        const savedXP = await window.db.get('settings', 'user_xp');
        if (savedXP) {
            this.state.user = savedXP;
        } else {
            await window.db.update('settings', { key: 'user_xp', ...this.state.user });
        }
    }

    bindEvents() {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                if (page) {
                    this.navigate(page);
                    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                    e.currentTarget.classList.add('active');
                }
            });
        });

        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    initTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.setAttribute('data-theme', savedTheme);
            this.updateThemeButton(savedTheme);
        }
    }

    toggleTheme() {
        const body = document.body;
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'liquid-glass' ? '' : 'liquid-glass';

        if (newTheme) {
            body.setAttribute('data-theme', newTheme);
        } else {
            body.removeAttribute('data-theme');
        }

        localStorage.setItem('theme', newTheme);

        this.updateThemeButton(newTheme);
    }

    updateThemeButton(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;

        const icon = btn.querySelector('.theme-icon');
        const label = btn.querySelector('.theme-label');

        if (theme === 'liquid-glass') {
            icon.textContent = '🌙';
            label.textContent = 'Dark Mode';
        } else {
            icon.textContent = '💧';
            label.textContent = 'Liquid Theme';
        }
    }

    navigate(pageName, params = null) {
        this.currentView = pageName;
        this.currentParams = params;
        this.render();
    }

    render() {
        const appEl = document.getElementById('app');
        const main = document.querySelector('#main-view');
        main.innerHTML = '';

        // Hide/Show Sidebar based on view
        const sidebar = document.querySelector('.sidebar');
        if (this.currentView === 'auth') {
            if (sidebar) sidebar.style.display = 'none';
            if (appEl) appEl.classList.add('auth-mode');
        } else {
            if (sidebar) sidebar.style.display = 'flex';
            if (appEl) appEl.classList.remove('auth-mode');
            this.renderSidebarStats();
        }

        switch (this.currentView) {
            case 'auth':
                if (window.AuthView) main.appendChild(window.AuthView(this.handleAction.bind(this)));
                break;
            case 'dashboard':
                // Pass username if available, actually it's global window.currentUser or pass in state
                // We'll update DashboardView to accept username
                if (window.DashboardView) main.appendChild(window.DashboardView(this.state, window.currentUser));
                const focusBtn = main.querySelector('button.btn-primary');
                if (focusBtn && focusBtn.textContent.includes('Focus')) {
                    focusBtn.onclick = () => this.navigate('focus');
                }
                break;
            case 'tasks':
                if (window.TasksView) main.appendChild(window.TasksView(this.state, this.handleAction.bind(this)));
                break;
            case 'goals':
                if (window.GoalsView) main.appendChild(window.GoalsView(this.state, this.handleAction.bind(this)));
                break;
            case 'focus':
                if (window.FocusView) main.appendChild(window.FocusView(this.state, this.handleAction.bind(this)));
                break;
            case 'habits':
                if (window.HabitsView) main.appendChild(window.HabitsView(this.state, this.handleAction.bind(this)));
                break;
            case 'analytics':
                if (window.AnalyticsView) main.appendChild(window.AnalyticsView(this.state, this.handleAction.bind(this)));
                break;
            case 'skills':
                if (window.SkillsView) main.appendChild(window.SkillsView(this.state, this.currentParams, this.navigate.bind(this)));
                break;
            case 'calendar':
                if (window.CalendarView) main.appendChild(window.CalendarView(this.state, this.handleAction.bind(this)));
                break;
            default:
                main.innerHTML = `<h1>Page ${this.currentView} coming soon</h1>`;
        }
    }

    async awardSkillXP(skillId, amount) {
        if (!this.state.skills) return;
        const skill = this.state.skills.find(s => s.id === skillId);
        if (skill) {
            skill.xp += amount;
            if (skill.xp >= skill.maxXp) {
                skill.level++;
                skill.xp = skill.xp - skill.maxXp;
                skill.maxXp = Math.round(skill.maxXp * 1.5);
                alert(`🆙 SKILL LEVEL UP: ${skill.name} is now Level ${skill.level}!`);
            }
            await window.db.update('skills', skill);
        }
    }

    renderSidebarStats() {
        const xpEl = document.querySelector('.user-status');
        if (xpEl) {
            const progress = (this.state.user.xp % 100);
            xpEl.innerHTML = `
                <div class="flex-row gap-2" style="justify-content: flex-start; align-items: center; width: 100%;">
                    <button id="skills-btn-sidebar" style="background:none; border:none; padding:0; cursor:pointer;" title="View Skill Tree">
                        <div style="width: 32px; height: 32px; background: var(--color-primary); border-radius: 50%; display:flex; align-items:center; justify-content:center; font-weight:bold; color: white;">
                            ${this.state.user.level}
                        </div>
                    </button>
                    <div class="flex-col" style="flex: 1;">
                        <div style="font-size: 0.9rem; font-weight: 700; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${window.currentUser || 'Pilot'}</div>
                        <div class="flex-row" style="justify-content: space-between; font-size: 0.7rem; color: var(--color-text-muted);">
                            <span>Lvl ${this.state.user.level}</span>
                            <span class="t-accent">${this.state.user.xp} XP</span>
                        </div>
                        <div style="width: 100%; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 4px;">
                             <div style="width: ${progress}%; height: 100%; background: var(--color-accent); border-radius: 2px; transition: width 0.5s ease;"></div>
                        </div>
                    </div>
                     <button id="logout-btn" class="btn btn-ghost" style="padding: 0.4rem; color: var(--color-danger);" title="Logout">
                        <span style="font-size: 1rem;">❌</span>
                    </button>
                </div>
             `;

            const btn = document.getElementById('skills-btn-sidebar');
            if (btn) btn.onclick = () => this.navigate('skills');

            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) logoutBtn.onclick = () => this.handleAction('LOGOUT_USER');
        }
    }

    async handleAction(action, payload) {
        console.log('Action:', action, payload);

        // AUTHENTICATION
        if (action === 'REGISTER_USER') {
            const profile = {
                username: payload.username,
                password: payload.password, // Stored plain for POC, should hash in prod
                joinedAt: new Date().toISOString()
            };
            await window.db.update('settings', { key: 'user_profile', ...profile });
            window.hasAccount = true;
            window.currentUser = payload.username;
            localStorage.setItem('currentUser', payload.username);

            await this.loadData();
            this.navigate('dashboard');
        }

        if (action === 'LOGIN_USER') {
            const profile = await window.db.get('settings', 'user_profile');
            if (profile && profile.username === payload.username && profile.password === payload.password) {
                window.currentUser = payload.username;
                localStorage.setItem('currentUser', payload.username);
                await this.loadData();
                this.navigate('dashboard');
            } else {
                alert("Access Denied: Invalid Credentials.");
            }
        }

        if (action === 'LOGOUT_USER') {
            localStorage.removeItem('currentUser');
            window.currentUser = null;
            this.navigate('auth');
        }

        // Notify AI (only if logged in)
        if (action !== 'REGISTER_USER' && action !== 'LOGIN_USER' && window.ai) {
            window.ai.learn(action, payload);
        }

        // TASKS
        if (action === 'ADD_TASK') {
            const task = {
                id: crypto.randomUUID(),
                title: payload.title,
                difficulty: payload.difficulty,
                energy: payload.energy,
                type: payload.type || 'shallow',
                status: 'todo',
                createdAt: new Date().toISOString(),
                xpValue: this.calculateXPValue(payload.difficulty, payload.type)
            };
            await window.db.add('tasks', task);
            this.state.tasks.push(task);
            this.render();
        }

        if (action === 'TOGGLE_TASK') {
            const task = this.state.tasks.find(t => t.id === payload.id);
            if (task) {
                const wasDone = task.status === 'done';
                task.status = wasDone ? 'todo' : 'done';

                if (!wasDone) {
                    this.awardXP(task.xpValue || 10);
                    // Skill XP Logic
                    if (task.type === 'deep') this.awardSkillXP('focus', 15);
                    if (task.type === 'shallow') this.awardSkillXP('velocity', 5);
                    if (task.difficulty === 'hard') this.awardSkillXP('discipline', 20);
                } else {
                    this.awardXP(-(task.xpValue || 10));
                }

                await window.db.update('tasks', task);
                this.render();
            }
        }

        if (action === 'DELETE_TASK') {
            await window.db.delete('tasks', payload.id);
            this.state.tasks = this.state.tasks.filter(t => t.id !== payload.id);
            this.render();
        }

        // GOALS
        if (action === 'ADD_GOAL') {
            const goal = {
                id: crypto.randomUUID(),
                title: payload.title,
                type: payload.type,
                parentId: payload.parentId,
                status: 'active',
                createdAt: new Date().toISOString()
            };
            await window.db.add('goals', goal);
            this.state.goals.push(goal);
            this.render();
        }

        if (action === 'TOGGLE_GOAL') {
            const goal = this.state.goals.find(g => g.id === payload.id);
            if (goal) {
                const wasDone = goal.status === 'done';
                goal.status = wasDone ? 'active' : 'done';

                if (!wasDone) {
                    // Award XP based on Goal Type
                    let amount = 50;
                    if (goal.type === 'year') amount = 250;
                    if (goal.type === 'life') amount = 500;
                    if (goal.type === 'month') amount = 100;

                    this.awardXP(amount);
                    alert(`🎯 GOAL COMPLETED: +${amount} XP`);

                    // Award Skill XP (Goals usually require Discipline & Focus)
                    this.awardSkillXP('discipline', Math.round(amount * 0.2));
                    this.awardSkillXP('focus', Math.round(amount * 0.1));
                } else {
                    // logic to revert XP could be here, but complex for levels. 
                    // For now, we assume user won't toggle back and forth to cheat (or we accept it)
                }

                await window.db.update('goals', goal);
                this.render();
            }
        }

        // HABITS
        if (action === 'ADD_HABIT') {
            const habit = {
                id: crypto.randomUUID(),
                title: payload.title,
                streak: 0,
                stability: 0,
                history: [],
                createdAt: new Date().toISOString()
            };
            await window.db.add('habits', habit);
            if (!this.state.habits) this.state.habits = [];
            this.state.habits.push(habit);
            this.render();
        }

        if (action === 'CHECK_HABIT') {
            const habit = this.state.habits.find(h => h.id === payload.id);
            if (habit) {
                const today = new Date().toISOString().split('T')[0];
                if (habit.history.includes(today)) return;

                habit.history.push(today);
                habit.streak = (habit.streak || 0) + 1;

                let gain = 10;
                if (habit.streak > 3) gain += 5;
                habit.stability = Math.min(100, (habit.stability || 0) + gain);

                this.awardXP(15);
                this.awardSkillXP('discipline', 10);

                await window.db.update('habits', habit);
                this.render();
            }
        }

        if (action === 'ADD_XP') {
            this.awardXP(payload.amount);
            if (payload.source === 'focus_session') {
                this.awardSkillXP('focus', Math.round(payload.amount / 2));
            }
            this.render();
        }

        if (action === 'COMPLETE_FOCUS') {
            const minutes = payload.minutes || 25;
            const xp = minutes * 2; // 2 XP per minute

            this.awardXP(xp);
            this.awardSkillXP('focus', xp);

            // Log Pattern explicitly if AI didn't catch it via ADD_XP
            // Actually AI listens to ADD_XP, but we might want structured data
            const pattern = {
                type: 'focus_session',
                duration: minutes,
                timestamp: new Date().toISOString()
            };

            // We can let the AI engine or DB handle the write
            // But since AI Engine listens to actions, we should rely on that or write to DB here to update history state immediately
            await window.db.add('patterns', pattern);
            this.state.history.push(pattern);

            this.render();
        }

        if (action === 'SET_TASK_FILTER') {
            this.state.tasksFilter = payload.filter;
            this.render();
        }
    }

    calculateXPValue(difficulty, type) {
        let base = 10;
        if (difficulty === 'medium') base = 20;
        if (difficulty === 'hard') base = 50;
        if (type === 'deep') base *= 1.5;
        return Math.round(base);
    }

    async awardXP(amount) {
        this.state.user.xp = Math.max(0, this.state.user.xp + amount);

        const nextLevel = Math.floor(this.state.user.xp / 100) + 1;
        if (nextLevel > this.state.user.level) {
            this.state.user.level = nextLevel;
            alert(`🎉 LEVEL UP! You are now Level ${nextLevel}!`);
        }

        await window.db.update('settings', { key: 'user_xp', ...this.state.user });
    }

    async resetData() {
        if (confirm("⚠️ FACTORY RESET ⚠️\n\nAre you sure you want to wipe EVERYTHING?\n\nThis will delete:\n- All Tasks & Goals\n- Habit Streaks\n- XP & Levels\n- ENTIRE Analytics History\n\nThis cannot be undone.")) {
            try {
                console.log("Initiating full reset...");
                await window.db.deleteDatabase();
                localStorage.clear();
                alert("System Reset Complete.\n\nCreating new clean database instance...");
                window.location.reload();
            } catch (e) {
                console.error("Reset failed", e);
                alert("Failed to reset data: " + e.message);
                // Force reload anyway as fallback to clear memory
                window.location.reload();
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});
