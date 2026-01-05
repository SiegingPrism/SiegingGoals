// Calendar Component
window.CalendarView = function (state, dispatch) {
    const container = document.createElement('div');

    // Internal state for current view date
    let viewDate = new Date();
    // Check if we have a stored view date in state or default to now
    // For simplicity, we'll just use a local variable closure for now, 
    // but if we wanted persistence we'd put it in app state.

    const renderCalendar = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();

        // Month names
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // First day of the month
        const firstDay = new Date(year, month, 1);
        // Last day of the month
        const lastDay = new Date(year, month + 1, 0);

        // Days in month
        const daysInMonth = lastDay.getDate();

        // Day of week the month starts on (0=Sun, 1=Mon,...)
        const startingDay = firstDay.getDay();

        // Tasks mapped to dates
        // Assuming tasks have a 'dueDate' field (YYYY-MM-DD)
        // If not, we might not see markers yet, but the calendar will still function visually.
        const tasksByDate = {};
        state.tasks.forEach(t => {
            if (t.dueDate && t.status !== 'done') {
                const d = t.dueDate.split('T')[0];
                if (!tasksByDate[d]) tasksByDate[d] = [];
                tasksByDate[d].push(t);
            }
        });

        // HTML Grid
        let gridHtml = '';

        // Empty cells for days before start of month
        for (let i = 0; i < startingDay; i++) {
            gridHtml += `<div class="calendar-day empty"></div>`;
        }

        // Days
        // Days
        const now = new Date();
        const yearNow = now.getFullYear();
        const monthNow = String(now.getMonth() + 1).padStart(2, '0');
        const dayNow = String(now.getDate()).padStart(2, '0');
        const todayStr = `${yearNow}-${monthNow}-${dayNow}`;

        for (let day = 1; day <= daysInMonth; day++) {
            // Format date YYYY-MM-DD for matching
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isToday = dateStr === todayStr;

            const dayTasks = tasksByDate[dateStr] || [];
            const hasTasks = dayTasks.length > 0;

            gridHtml += `
                <div class="calendar-day ${isToday ? 'today' : ''} glass-panel" style="
                    min-height: 100px; 
                    padding: 0.5rem; 
                    border-radius: var(--radius-md); 
                    display: flex; 
                    flex-direction: column; 
                    justify-content: space-between;
                    background: ${isToday ? 'rgba(var(--color-primary-rgb), 0.1)' : 'rgba(255,255,255,0.02)'};
                    border: ${isToday ? '1px solid var(--color-primary)' : '1px solid transparent'};
                ">
                    <div style="font-weight: bold; opacity: ${isToday ? '1' : '0.5'}; text-align: right;">${day}</div>
                    
                    <div class="flex-col gap-1">
                        ${dayTasks.map(t => `
                            <div style="font-size: 0.7rem; background: rgba(255,255,255,0.1); padding: 2px 4px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                                ${t.title}
                            </div>
                        `).join('')}
                    </div>
                </div>
             `;
        }

        return `
            <div class="header flex-row" style="justify-content: space-between; align-items: center; margin-bottom: 2rem;">
                <h1 class="page-title">${monthNames[month]} ${year}</h1>
                <div class="flex-row gap-2">
                    <button id="prev-month" class="btn btn-ghost">◀</button>
                    <button class="btn btn-ghost" id="curr-month">Today</button>
                    <button id="next-month" class="btn btn-ghost">▶</button>
                </div>
            </div>

            <div class="calendar-grid" style="
                display: grid; 
                grid-template-columns: repeat(7, 1fr); 
                gap: 1rem;
            ">
                <!-- Week Headers -->
                <div class="t-muted text-center">Sun</div>
                <div class="t-muted text-center">Mon</div>
                <div class="t-muted text-center">Tue</div>
                <div class="t-muted text-center">Wed</div>
                <div class="t-muted text-center">Thu</div>
                <div class="t-muted text-center">Fri</div>
                <div class="t-muted text-center">Sat</div>
                
                <!-- Grid -->
                ${gridHtml}
            </div>
        `;
    };

    container.innerHTML = renderCalendar(viewDate);

    // Logic for traversing months needs re-rendering the container content
    // We can use a simple internal update function since this is a vanilla JS component
    const update = () => {
        container.innerHTML = renderCalendar(viewDate);
        bindControls();
    };

    const bindControls = () => {
        container.querySelector('#prev-month').onclick = () => {
            viewDate.setMonth(viewDate.getMonth() - 1);
            update();
        };
        container.querySelector('#next-month').onclick = () => {
            viewDate.setMonth(viewDate.getMonth() + 1);
            update();
        };
        container.querySelector('#curr-month').onclick = () => {
            viewDate = new Date();
            update();
        };
    };

    bindControls();

    return container;
};
