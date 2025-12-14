document.addEventListener("DOMContentLoaded", () => {
    // ===== MODES =====
    let MODES = {
        work: { time: 25 * 60 },
        shortBreak: { time: 5 * 60 },
        longBreak: { time: 15 * 60 }
    };

    let currentMode = "work";
    let timeLeft = MODES[currentMode].time;
    let isRunning = false;
    let timerInterval = null;

    let pomoCount = 0;
    let cycleCount = 0;
    let sessionsUntilLongBreak = 4;

    // ===== UI =====
    const timeDisplay = document.getElementById("time-display");
    const startBtn = document.getElementById("start-btn");
    const resetBtn = document.getElementById("reset-btn");
    const pomoCountDisplay = document.getElementById("pomo-count");
    const heartsContainer = document.getElementById("pomo-hearts");

    // Progress ring
    const circle = document.querySelector(".progress-ring__circle");
    const radius = circle.r.baseVal.value;
    const circumference = radius * 2 * Math.PI;
    circle.style.strokeDasharray = `${circumference} ${circumference}`;
    circle.style.strokeDashoffset = 0;

    // ===== SETTINGS =====
    const settingsBtn = document.getElementById("settings-btn");
    const settingsModal = document.getElementById("settings-modal");
    const saveSettingsBtn = document.getElementById("save-settings-btn");
    const closeSettingsBtn = document.getElementById("close-settings-btn");
    const workInput = document.getElementById("work-input");
    const shortInput = document.getElementById("short-input");
    const longInput = document.getElementById("long-input");

    // ===== FUNCTIONS =====
    function startTimer() {
        if (isRunning) return;
        isRunning = true;
        startBtn.innerHTML = `<i class="fas fa-pause"></i> Pause`;

        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateDisplay();
            } else {
                finishSession();
            }
        }, 1000);
    }

    function pauseTimer() {
        isRunning = false;
        clearInterval(timerInterval);
        startBtn.innerHTML = `<i class="fas fa-play"></i> Start`;
    }

    function resetTimer() {
        pauseTimer();
        timeLeft = MODES[currentMode].time;
        updateDisplay();
        circle.style.strokeDashoffset = 0;
    }

    function finishSession() {
        pauseTimer();

        if (currentMode === "work") {
            pomoCount++;
            cycleCount++;
            sessionsUntilLongBreak--;
            pomoCountDisplay.textContent = pomoCount;
            updateHearts();

            if (sessionsUntilLongBreak === 0) {
                switchMode("longBreak");
                sessionsUntilLongBreak = 4;
                cycleCount = 0;
                updateHearts();
            } else {
                switchMode("shortBreak");
            }
        } else {
            switchMode("work");
        }

        startTimer();
    }

    function switchMode(mode) {
        currentMode = mode;
        timeLeft = MODES[mode].time;
        updateDisplay();

        document.querySelectorAll(".tab-btn").forEach(btn =>
            btn.classList.remove("active")
        );

        if (mode === "work") document.getElementById("work-btn").classList.add("active");
        if (mode === "shortBreak") document.getElementById("short-break-btn").classList.add("active");
        if (mode === "longBreak") document.getElementById("long-break-btn").classList.add("active");
    }

    function updateDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        timeDisplay.textContent = `${minutes.toString().padStart(2, "0")}:${seconds
            .toString()
            .padStart(2, "0")}`;

        const totalTime = MODES[currentMode].time;
        const offset = circumference - (timeLeft / totalTime) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    function updateHearts() {
        const hearts = heartsContainer.querySelectorAll("i");
        hearts.forEach((heart, index) => {
            if (index < cycleCount) {
                heart.className = "fas fa-heart completed";
            } else {
                heart.className = "far fa-heart";
            }
        });
    }

    // ===== EVENTS =====
    startBtn.addEventListener("click", () =>
        isRunning ? pauseTimer() : startTimer()
    );

    resetBtn.addEventListener("click", resetTimer);

    settingsBtn.addEventListener("click", () =>
        settingsModal.classList.remove("hidden")
    );

    closeSettingsBtn.addEventListener("click", () =>
        settingsModal.classList.add("hidden")
    );

    saveSettingsBtn.addEventListener("click", () => {
        const w = parseInt(workInput.value);
        const s = parseInt(shortInput.value);
        const l = parseInt(longInput.value);

        if (w > 0 && s > 0 && l > 0) {
            MODES.work.time = w * 60;
            MODES.shortBreak.time = s * 60;
            MODES.longBreak.time = l * 60;
            resetTimer();
            settingsModal.classList.add("hidden");
        } else {
            alert("Please enter valid time");
        }
    });

    // expose for HTML onclick
    window.switchMode = switchMode;

    // INIT
    updateDisplay();
    updateHearts();
});