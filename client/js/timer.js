document.addEventListener('DOMContentLoaded', () => {
    // 1. Load Game State
    let savedState = localStorage.getItem('bookback_gamestate');
    let gameState = savedState ? JSON.parse(savedState) : {
        currentXP: 0, maxXP: 100, level: 1, rankIndex: 0,
        totalTasksDone: 0, streak: 0, achievements: { firstStep: false, king: false }
    };
    const ranks = ["Infant", "Toddler", "Kid", "Teenager", "Adult"];

    let MODES = {
        work: { time: 0.05 * 60 },
        shortBreak: { time: 0.05 * 60 },
        longBreak: { time: 0.05 * 60 }
    };

    let currentMode = 'work';
    let timeLeft = MODES[currentMode].time;
    let isRunning = false;
    let timerInterval = null;
    let pomoCount = 0;
    let cycleCount = 0;
    let sessionsUntilLongBreak = 4;

    // UI Selectors
    const timeDisplay = document.getElementById('time-display');
    const startBtn = document.getElementById('start-btn');
    const resetBtn = document.getElementById('reset-btn');
    const pomoCountDisplay = document.getElementById('pomo-count');
    const circle = document.querySelector('.progress-ring__circle');
    const heartsContainer = document.getElementById('pomo-hearts');

    // Sidebar Selectors
    const xpTextDisplay = document.querySelector('.exp-label span:last-child');
    const xpProgressBar = document.querySelector('.progress-fill');
    const levelDisplay = document.querySelector('.profile-info .level');
    const rankDisplay = document.querySelector('.profile-info .rank .rank-name');
    const rankNumberDisplay = document.querySelector('.rank-number');
    const badgeDisplay = document.querySelector('.badge'); // [ใหม่]
    const statValues = document.querySelectorAll('.stat-box .stat-value');

    // Settings Selectors
    const settingsBtn = document.getElementById('settings-btn');
    const settingsModal = document.getElementById('settings-modal');
    const saveSettingsBtn = document.getElementById('save-settings-btn');
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    const workInput = document.getElementById('work-input');
    const shortInput = document.getElementById('short-input');
    const longInput = document.getElementById('long-input');

    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = 0;

    updateSidebarUI();
    updateHearts();
    updateDisplay();

    // --- Functions ---

    function finishSession() {
        if (currentMode === 'work') {
            pomoCount++;
            cycleCount++;
            sessionsUntilLongBreak--;
            pomoCountDisplay.textContent = pomoCount;

            const rewardXP = 30;
            gameState.currentXP += rewardXP;
            gameState.streak += 1;
            gameState.totalTasksDone += 1;

            checkLevelUp();
            checkAchievements();
            saveGame();
            updateSidebarUI();
            updateHearts();

            if (sessionsUntilLongBreak === 0) {
                switchMode('longBreak');
                sessionsUntilLongBreak = 4;
                cycleCount = 0;
                updateHearts();
            } else {
                switchMode('shortBreak');
            }
        } else {
            switchMode('work');
        }
        startTimer();
    }

    function saveGame() {
        localStorage.setItem('bookback_gamestate', JSON.stringify(gameState));
    }

    function checkLevelUp() {
        let leveledUp = false;
        while (gameState.currentXP >= gameState.maxXP) {
            gameState.currentXP -= gameState.maxXP;
            gameState.level++;
            gameState.maxXP = Math.floor(gameState.maxXP * 1.2);
            if (gameState.rankIndex < ranks.length - 1) gameState.rankIndex++;
            leveledUp = true;
        }
        if (leveledUp) alert(`🎉 Level Up! You are now Level ${gameState.level} (${ranks[gameState.rankIndex]})`);
    }

    function checkAchievements() {
        let changed = false;
        if (gameState.level >= 5 && !gameState.achievements.king) {
            gameState.currentXP += 500;
            gameState.achievements.king = true;
            changed = true;
            alert(`👑 Achievement Unlocked: King!\nReward: +500 XP`);
        }
        if (gameState.streak >= 1 && !gameState.achievements.firstStep) {
            gameState.currentXP += 50;
            gameState.achievements.firstStep = true;
            changed = true;
            alert(`🏆 Achievement Unlocked: First Step!\nReward: +50 XP`);
        }
        if (changed) saveGame();
    }

    function updateSidebarUI() {
        if (xpTextDisplay) xpTextDisplay.textContent = `${Math.floor(gameState.currentXP)}/${gameState.maxXP} XP`;
        if (xpProgressBar) {
            let p = (gameState.currentXP / gameState.maxXP) * 100;
            if (p > 100) p = 100;
            xpProgressBar.style.width = `${p}%`;
        }
        if (levelDisplay) levelDisplay.textContent = `Level ${gameState.level}`;
        if (rankDisplay) rankDisplay.textContent = ranks[gameState.rankIndex];
        if (rankNumberDisplay) rankNumberDisplay.textContent = gameState.rankIndex + 1;

        if (badgeDisplay) badgeDisplay.textContent = gameState.level;

        if (statValues.length > 0) {
            statValues[0].textContent = gameState.streak;
            statValues[1].textContent = gameState.totalTasksDone;
        }

        const achFirstStep = document.getElementById('ach-first-step');
        if (achFirstStep && gameState.achievements.firstStep) achFirstStep.classList.add('unlocked');

        const achKing = document.getElementById('ach-king');
        if (achKing) {
            const kingText = achKing.querySelector('.king-progress-text');
            const kingBar = achKing.querySelector('.king-progress-bar');
            let kP = (gameState.level / 5) * 100;
            if (kP > 100) kP = 100;
            if (kingText) kingText.textContent = `${Math.min(gameState.level, 5)}/5`;
            if (kingBar) kingBar.style.width = `${kP}%`;
            if (gameState.achievements.king) achKing.classList.add('unlocked');
        }
    }

    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.innerHTML = '<i class="fas fa-pause"></i> Pause';
        timerInterval = setInterval(() => {
            if (timeLeft > 0) { timeLeft--; updateDisplay(); }
            else { finishSession(); }
        }, 1000);
    }
    function pauseTimer() {
        isRunning = false; clearInterval(timerInterval);
        startBtn.innerHTML = '<i class="fas fa-play"></i> Start';
    }
    function resetTimer() {
        pauseTimer(); timeLeft = MODES[currentMode].time;
        updateDisplay(); circle.style.strokeDashoffset = 0;
    }
    window.switchMode = function (mode) {
        currentMode = mode; timeLeft = MODES[mode].time;
        pauseTimer(); updateDisplay();
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        if (mode === 'work') document.getElementById('work-btn').classList.add('active');
        if (mode === 'shortBreak') document.getElementById('short-break-btn').classList.add('active');
        if (mode === 'longBreak') document.getElementById('long-break-btn').classList.add('active');
    };
    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        const totalTime = MODES[currentMode].time;
        const offset = circumference - (timeLeft / totalTime) * circumference;
        circle.style.strokeDashoffset = offset;
    }
    function updateHearts() {
        const hearts = heartsContainer.querySelectorAll('i');
        hearts.forEach((heart, index) => {
            if (index < cycleCount) { heart.classList.remove('far'); heart.classList.add('fas', 'completed'); }
            else { heart.classList.remove('fas', 'completed'); heart.classList.add('far'); }
        });
    }

    startBtn.addEventListener('click', () => isRunning ? pauseTimer() : startTimer());
    resetBtn.addEventListener('click', resetTimer);
    settingsBtn.addEventListener('click', () => { settingsModal.classList.remove('hidden'); });
    closeSettingsBtn.addEventListener('click', () => { settingsModal.classList.add('hidden'); });
    saveSettingsBtn.addEventListener('click', () => {
        const w = parseInt(workInput.value);
        const s = parseInt(shortInput.value);
        const l = parseInt(longInput.value);
        if (w > 0 && s > 0 && l > 0) {
            MODES.work.time = w * 60;
            MODES.shortBreak.time = s * 60;
            MODES.longBreak.time = l * 60;
            resetTimer(); settingsModal.classList.add('hidden');
        } else { alert("Please enter valid time."); }
    });
});