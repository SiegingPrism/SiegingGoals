// Focus Mode Component
window.FocusView = function (state, dispatch) {
    const container = document.createElement('div');
    let timerInterval = null;
    let timeLeft = 25 * 60; // 25 mins
    let isRunning = false;

    const html = `
        <div class="header">
            <h1 class="page-title">Deep Focus</h1>
        </div>

        <div class="glass-panel flex-center flex-col" style="padding: 4rem 2rem; border-radius: var(--radius-lg); position: relative; overflow: hidden;">
            <div style="position: absolute; top:0; left:0; width:100%; height:5px; background: rgba(255,255,255,0.1);">
                <div id="progress-bar" style="width: 100%; height: 100%; background: var(--color-accent); transition: width 1s linear;"></div>
            </div>

            <h2 class="t-muted" style="letter-spacing: 0.1em; text-transform: uppercase;">Time Remaining</h2>
            <div id="timer-display" style="font-size: 6rem; font-weight: 800; font-variant-numeric: tabular-nums; margin: 1rem 0;">
                25:00
            </div>
            
            <div class="flex-row gap-4">
                <button id="btn-toggle" class="btn btn-primary" style="padding: 1rem 3rem; font-size: 1.2rem;">Start Focus</button>
                <button id="btn-reset" class="btn btn-ghost">Reset</button>
            </div>

            <p class="t-muted" style="margin-top: 2rem; max-width: 400px; text-align: center;">
                "Deep work is the superpower of the 21st century."
            </p>
        </div>
    `;

    container.innerHTML = html;

    const display = container.querySelector('#timer-display');
    const toggleBtn = container.querySelector('#btn-toggle');
    const resetBtn = container.querySelector('#btn-reset');
    const progressBar = container.querySelector('#progress-bar');

    const updateDisplay = () => {
        const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
        const s = (timeLeft % 60).toString().padStart(2, '0');
        display.textContent = `${m}:${s}`;
        const pct = (timeLeft / (25 * 60)) * 100;
        progressBar.style.width = `${pct}%`;
    };

    const stopTimer = () => {
        clearInterval(timerInterval);
        isRunning = false;
        toggleBtn.textContent = 'Start Focus';
        toggleBtn.classList.remove('btn-danger');
    };

    toggleBtn.addEventListener('click', () => {
        if (isRunning) {
            stopTimer();
            return;
        }

        isRunning = true;
        toggleBtn.textContent = 'Pause Session';

        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                stopTimer();
                // Complete
                alert("Focus Session Complete! Great work.");
                dispatch('COMPLETE_FOCUS', { minutes: 25 });
            }
        }, 1000);
    });

    resetBtn.addEventListener('click', () => {
        stopTimer();
        timeLeft = 25 * 60;
        updateDisplay();
    });

    // Cleanup on unmount (not handled here in vanilla easy way, but minimal leak for now)
    return container;
};
