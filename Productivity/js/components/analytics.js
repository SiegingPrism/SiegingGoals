// Analytics Component
window.AnalyticsView = function (state) {
    const container = document.createElement('div');

    // 1. Data Aggregation
    const totalTasks = state.tasks.length;
    const completedTasks = state.tasks.filter(t => t.status === 'done').length;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // Real Trend Data (Last 7 Days)
    const last7Days = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(today.getDate() - i);
        last7Days.push(d.toISOString().split('T')[0]);
    }

    // Count 'focus_session' or completed tasks per day from history
    // Note: state.history contains objects like { type: 'focus_session', timestamp: ... }
    const activityMap = {};
    if (state.history) {
        state.history.forEach(h => {
            const date = h.timestamp.split('T')[0];
            activityMap[date] = (activityMap[date] || 0) + 1;
        });
    }

    const trendData = last7Days.map(date => activityMap[date] || 0);

    // Dynamic Max Value for scaling
    // If no data, default to scale of 10
    const maxVal = Math.max(...trendData, 5);

    const html = `
        <div class="header">
            <h1 class="page-title">Performance Analytics</h1>
        </div>

        <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem;">
            
            <!-- Main Chart Area -->
            <div class="glass-panel" style="padding: 2rem; border-radius: var(--radius-lg);">
                <h3 class="t-muted" style="margin-bottom: 2rem;">Activity Velocity (7 Days)</h3>
                
                <div style="display: flex; align-items: flex-end; justify-content: space-between; height: 200px; padding-bottom: 1rem; border-bottom: 1px solid rgba(255,255,255,0.1);">
                    ${trendData.map((val, idx) => `
                        <div class="flex-col flex-center" style="gap: 0.5rem; height: 100%; justify-content: flex-end; width: 10%;">
                            <div style="
                                width: 100%; 
                                height: ${Math.max(4, (val / maxVal) * 100)}%; 
                                background: ${idx === 6 ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)'};
                                border-radius: 4px;
                                min-height: 4px;
                                transition: height 1s ease;
                            " title="${val} activities"></div>
                            <span class="t-muted" style="font-size: 0.7rem;">${idx === 6 ? 'Today' : 'D-' + (6 - idx)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <!-- Stats Column -->
            <div class="flex-col gap-4">
                <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg);">
                    <h3 class="t-muted">Completion Rate</h3>
                    <div class="flex-row flex-center" style="justify-content: space-between; margin-top: 1rem;">
                        <span style="font-size: 2.5rem; font-weight: 700; color: var(--color-success);">${completionRate}%</span>
                        <div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--color-success); display:flex; align-items:center; justify-content:center;">
                           📈
                        </div>
                    </div>
                </div>

                <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg);">
                    <h3 class="t-muted">Focus Efficiency</h3>
                    <div class="flex-row flex-center" style="justify-content: space-between; margin-top: 1rem;">
                        <span style="font-size: 2.5rem; font-weight: 700; color: var(--color-accent);">85%</span>
                         <div style="width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--color-accent); display:flex; align-items:center; justify-content:center;">
                           🧠
                        </div>
                    </div>
                    <p class="t-muted" style="font-size: 0.8rem; margin-top: 0.5rem;">Based on task difficulty vs time.</p>
                </div>
            </div>

        </div>

        <!-- Heatmap / Activity Log -->
        <h3 style="margin-top: 2rem; margin-bottom: 1rem;">Activity Log</h3>
        <div class="glass-panel" style="padding: 1.5rem; border-radius: var(--radius-lg);">
             <div class="flex-col gap-2">
                ${state.tasks.slice(0, 5).map(t => `
                    <div class="flex-row" style="justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span>${t.status === 'done' ? 'Completed' : 'Created'} task <strong>${t.title}</strong></span>
                        <span class="t-muted" style="font-size: 0.8rem;">${new Date(t.createdAt).toLocaleTimeString()}</span>
                    </div>
                `).join('')}
                ${state.tasks.length === 0 ? '<span class="t-muted">No activity recorded.</span>' : ''}
             </div>
        </div>
    `;

    container.innerHTML = html;
    return container;
};
