// Skills (Gamification) Component
// Skills (Gamification) Component
window.SkillsView = function (state, params, navigate) {
    const container = document.createElement('div');
    const skills = state.skills && state.skills.length > 0 ? state.skills : [
        { id: 'focus', name: 'Deep Focus', level: 1, xp: 0, maxXp: 100, icon: '🧠', description: 'Ability to work without distraction.' },
        { id: 'discipline', name: 'Iron Will', level: 1, xp: 0, maxXp: 100, icon: '🛡️', description: 'Consistency in habits and hard tasks.' },
        { id: 'velocity', name: 'Velocity', level: 1, xp: 0, maxXp: 100, icon: '⚡', description: 'Speed of execution for small tasks.' }
    ];

    // ROUTER: Detail View
    if (params && params.id) {
        const skill = skills.find(s => s.id === params.id);
        if (skill) {
            container.innerHTML = renderSkillDetail(skill);

            // Bind Back Button
            const backBtn = container.querySelector('.back-btn');
            if (backBtn) backBtn.addEventListener('click', () => navigate('skills'));

            return container;
        }
    }

    // LIST VIEW
    const html = `
        <div class="header">
            <h1 class="page-title">Skill Trees</h1>
            <p class="t-muted">Develop your character stats through real-world actions.</p>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem;">
            ${skills.map(skill => {
        const progress = (skill.xp / skill.maxXp) * 100;
        return `
                <div class="glass-panel skill-card" data-id="${skill.id}" style="padding: 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden; cursor: pointer; transition: transform 0.2s;">
                    <div style="position: absolute; top: -10px; right: -10px; font-size: 8rem; opacity: 0.05; pointer-events: none;">
                        ${skill.icon}
                    </div>
                    
                    <div class="flex-row" style="gap: 1rem; align-items: center; margin-bottom: 1.5rem;">
                        <div style="width: 64px; height: 64px; background: rgba(255,255,255,0.05); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 2rem; border: 1px solid rgba(255,255,255,0.1);">
                            ${skill.icon}
                        </div>
                        <div>
                            <h2 style="font-size: 1.5rem; margin: 0;">${skill.name}</h2>
                            <span class="t-accent" style="font-weight: bold;">Lvl ${skill.level}</span>
                        </div>
                    </div>

                    <p class="t-muted" style="margin-bottom: 2rem; font-size: 0.9rem; min-height: 40px;">
                        ${skill.description}
                    </p>

                    <!-- Stats / Perks -->
                    <div class="perk-card">
                        <h4 style="margin: 0 0 0.5rem 0; font-size: 0.8rem; text-transform: uppercase; color: var(--color-text-muted);">Current Perk</h4>
                        <div style="font-size: 0.9rem; color: var(--color-success);">
                            ${getPerkDescription(skill.id, skill.level)}
                        </div>
                    </div>

                    <!-- Progress -->
                    <div class="flex-row" style="justify-content: space-between; font-size: 0.8rem; margin-bottom: 0.5rem;">
                        <span>${skill.xp} XP</span>
                        <span class="t-muted">Next Level: ${skill.maxXp} XP</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress" style="width: ${progress}%; background: var(--color-primary);"></div>
                    </div>
                </div>
                `;
    }).join('')}
        </div>
    `;

    container.innerHTML = html;

    // Add Click Listeners
    container.querySelectorAll('.skill-card').forEach(card => {
        card.addEventListener('click', (e) => {
            const id = e.currentTarget.dataset.id;
            navigate('skills', { id });
        });
    });

    return container;
};

function renderSkillDetail(skill) {
    const progress = (skill.xp / skill.maxXp) * 100;

    // Generate levels list (Mocking future levels)
    const levelsHtml = [1, 2, 3, 4, 5].map(lvl => {
        const isUnlocked = skill.level >= lvl;
        const isCurrent = skill.level === lvl;
        return `
            <div class="glass-panel flex-row flex-center" style="justify-content: space-between; padding: 1rem; border: 1px solid ${isCurrent ? 'var(--color-primary)' : 'rgba(255,255,255,0.05)'}; opacity: ${isUnlocked ? 1 : 0.5}; margin-bottom: 0.5rem;">
                <div class="flex-row flex-center gap-2">
                    <div style="width: 30px; height: 30px; border-radius: 50%; background: ${isUnlocked ? 'var(--color-primary)' : '#333'}; color: white; display: flex; align-items: center; justify-content: center; font-weight: bold;">${lvl}</div>
                    <span style="${isCurrent ? 'color: var(--color-primary); font-weight: bold;' : ''}">Level ${lvl}</span>
                </div>
                <div style="font-size: 0.8rem; color: var(--color-text-muted);">
                    ${getPerkDescription(skill.id, lvl)}
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="header flex-row flex-center" style="justify-content: flex-start; gap: 1rem;">
            <button class="btn btn-ghost back-btn" style="font-size: 1.5rem; padding: 0.5rem;">←</button>
            <div>
                <h1 class="page-title">${skill.name}</h1>
                <p class="t-muted">Skill Tree</p>
            </div>
        </div>

        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 2rem;">
            <!-- Sidebar / Main Stat -->
            <div class="flex-col gap-4">
                <div class="glass-panel flex-col flex-center" style="padding: 3rem; text-align: center;">
                    <div style="font-size: 5rem; margin-bottom: 1rem;">${skill.icon}</div>
                    <h2 style="font-size: 2rem; margin-bottom: 0.5rem;">Lvl ${skill.level}</h2>
                    <p class="t-muted">${skill.description}</p>
                </div>

                <div class="glass-panel" style="padding: 1.5rem;">
                     <div class="flex-row" style="justify-content: space-between; font-size: 0.9rem; margin-bottom: 0.5rem;">
                        <span>Progress to Lvl ${skill.level + 1}</span>
                        <span class="t-muted">${skill.xp} / ${skill.maxXp} XP</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress" style="width: ${progress}%; background: var(--color-primary);"></div>
                    </div>
                </div>
            </div>

            <!-- Progression Path -->
            <div>
                <h3 style="margin-bottom: 1rem;">Progression Path</h3>
                ${levelsHtml}
            </div>
        </div>
    `;
}

function getPerkDescription(skillId, level) {
    if (skillId === 'focus') {
        if (level === 1) return "+5% XP from Focus Sessions";
        if (level >= 5) return "+15% XP from Focus Sessions & Unlocks 'Zen Mode' UI";
        return "+10% XP from Focus Sessions";
    }
    if (skillId === 'discipline') {
        if (level === 1) return "Habits lose stability 10% slower";
        return "Habits lose stability 20% slower";
    }
    if (skillId === 'velocity') {
        return "Shallow tasks award +2 XP";
    }
    return "Base stats active.";
}
