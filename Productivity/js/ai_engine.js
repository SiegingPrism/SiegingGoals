// Self-Learning AI Engine
// Analyzes user behavior patterns to provide personalized suggestions

class AiEngine {
    constructor() {
        this.patterns = [];
        this.insights = {
            peakHour: null,
            mostProductiveDay: null,
            completionRate: 0
        };
    }

    async init() {
        // Load past patterns
        try {
            this.patterns = await window.db.getAll('patterns');
            this.analyze();
            console.log("🤖 AI Engine Online. Patterns loaded:", this.patterns.length);
        } catch (e) {
            console.warn("AI Engine failed to load patterns", e);
        }
    }

    async learn(action, payload) {
        // We only care about specific actions that indicate productivity
        const relevantActions = ['TOGGLE_TASK', 'CHECK_HABIT', 'ADD_XP'];

        if (!relevantActions.includes(action)) return;

        // If toggling task open (undoing), we might not want to log it as a positive pattern, 
        // or we handle it delicately. For simplicity, we track 'completions'.
        if (action === 'TOGGLE_TASK') {
            const task = window.app.state.tasks.find(t => t.id === payload.id);
            if (task && task.status !== 'done') return; // Only log when marking AS done
        }

        const entry = {
            type: action,
            timestamp: new Date().toISOString(),
            hour: new Date().getHours(),
            day: new Date().getDay(), // 0-6
            details: JSON.stringify(payload)
        };

        // Persist
        await window.db.add('patterns', entry);
        this.patterns.push(entry);

        // Re-analyze periodically or incrementally
        this.analyze();
    }

    analyze() {
        if (this.patterns.length === 0) return;

        // 1. Calculate Peak Productivity Hour
        const hourCounts = {};
        this.patterns.forEach(p => {
            if (p.type === 'TOGGLE_TASK' || p.type === 'CHECK_HABIT') {
                hourCounts[p.hour] = (hourCounts[p.hour] || 0) + 1;
            }
        });

        let maxCount = 0;
        let peakHour = null;
        for (const [hour, count] of Object.entries(hourCounts)) {
            if (count > maxCount) {
                maxCount = count;
                peakHour = parseInt(hour);
            }
        }
        this.insights.peakHour = peakHour;

        // 2. Completion trends could go here
    }

    getSuggestion() {
        const hour = new Date().getHours();
        const state = window.app.state;
        const taskCount = state.tasks.filter(t => t.status !== 'done').length;

        // 1. Burnout Guard (High Priority override)
        const highEnergyTasks = state.tasks.filter(t => t.status !== 'done' && t.energy === 'high').length;
        if (highEnergyTasks >= 3) {
            return {
                text: "⚠️ High burnout risk detected. You have 3+ High Energy tasks. Delegate or reschedule one.",
                type: 'warning'
            };
        }

        // 2. Peak Productivity Match
        if (this.insights.peakHour !== null && Math.abs(this.insights.peakHour - hour) <= 1) {
            return {
                text: "⚡ You are entering your Peak Productivity Zone. Tackle a 'Deep Work' task now!",
                type: 'success'
            };
        }

        // 3. Evening Reflection
        if (hour >= 20) {
            return {
                text: "🌙 Good evening. Review your wins for the day and plan 3 tasks for tomorrow.",
                type: 'info'
            };
        }

        // 4. Morning Momentum
        if (hour < 9) {
            return {
                text: "☀️ Early riser. Start with an 'Easy' task to build momentum.",
                type: 'success'
            };
        }

        // 5. General Context
        if (taskCount > 5) {
            return {
                text: `🚀 You have ${taskCount} pending tasks. Focus on the one with the highest impact.`,
                type: 'info'
            };
        }

        return {
            text: "Ready to conquer your goals? Add a task to get started.",
            type: 'neutral'
        };
    }
}

window.AiEngine = AiEngine;
