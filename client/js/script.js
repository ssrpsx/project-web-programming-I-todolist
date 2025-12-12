document.addEventListener('DOMContentLoaded', () => {
    // --- 1. Game State Setup ---
    let savedState = localStorage.getItem('bookback_gamestate');
    let gameState = savedState ? JSON.parse(savedState) : {
        currentXP: 0,
        maxXP: 100,
        level: 1,
        totalTasksDone: 0,
        streak: 0,
        rankIndex: 0,
        achievements: { firstStep: false, king: false }
    };
    
    const ranks = ["Infant", "Toddler", "Kid", "Teenager", "Adult"];

    // --- 2. Selectors ---
    const taskForm = document.querySelector('.task-input-group');
    const taskInput = document.querySelector('.task-input');
    const difficultySelect = document.querySelector('.difficulty-select');
    const taskList = document.querySelector('.task-list');
    
    // Sidebar Selectors
    const xpTextDisplay = document.querySelector('.exp-label span:last-child');
    const xpProgressBar = document.querySelector('.progress-fill');
    const levelDisplay = document.querySelector('.profile-info .level');
    const rankDisplay = document.querySelector('.profile-info .rank .rank-name');
    const rankNumberDisplay = document.querySelector('.rank-number');
    const badgeDisplay = document.querySelector('.badge'); // [ใหม่] ตัวเลือก Badge วงกลม
    const statValues = document.querySelectorAll('.stat-box .stat-value');
    const fireStatValue = statValues[0];
    const checkStatValue = statValues[1];

    // --- 3. Tasks Setup ---
    let savedTasks = localStorage.getItem('bookback_tasks');
    let tasks = savedTasks ? JSON.parse(savedTasks) : [];

    // --- 4. Initial Load ---
    updateUI();
    renderTasks();

    // --- 5. Events ---
    if (taskForm) {
        taskForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const taskText = taskInput.value.trim();
            const difficulty = difficultySelect.value;
            if (taskText !== "") {
                const newTask = { id: Date.now(), text: taskText, difficulty: difficulty };
                tasks.push(newTask);
                saveTasks();
                renderTasks();
                taskInput.value = "";
                taskInput.focus();
            }
        });
    }

    if (taskList) {
        taskList.addEventListener('click', (event) => {
            const target = event.target;
            const taskItem = target.closest('.task-item');
            if (!taskItem) return;

            if (target.closest('.delete-btn')) {
                const id = Number(taskItem.dataset.id);
                tasks = tasks.filter(t => t.id !== id);
                saveTasks();
                taskItem.style.opacity = '0';
                taskItem.style.transform = 'translateX(50px)';
                setTimeout(() => renderTasks(), 300);
            }
        });

        taskList.addEventListener('change', (event) => {
            if (event.target.type === 'checkbox' && event.target.checked) {
                const taskItem = event.target.closest('.task-item');
                const id = Number(taskItem.dataset.id);
                const xpGain = getXPFromTask(taskItem);

                // Update State
                gameState.currentXP += xpGain;
                gameState.totalTasksDone += 1; 
                gameState.streak += 1;

                checkAchievements();
                checkLevelUp();
                updateUI(); 
                saveGame();

                const taskName = taskItem.querySelector('.task-name');
                taskName.classList.add('completed');
                
                setTimeout(() => {
                    tasks = tasks.filter(t => t.id !== id);
                    saveTasks();
                    renderTasks();
                }, 600); 
            }
        });
    }

    // --- 6. Helper Functions ---
    function saveTasks() { localStorage.setItem('bookback_tasks', JSON.stringify(tasks)); }
    
    function renderTasks() {
        if(!taskList) return;
        taskList.innerHTML = '';
        tasks.forEach(task => createTaskHTML(task));
    }

    function saveGame() { localStorage.setItem('bookback_gamestate', JSON.stringify(gameState)); }

    function checkLevelUp() {
        let leveledUp = false;
        while (gameState.currentXP >= gameState.maxXP) {
            gameState.currentXP -= gameState.maxXP;
            gameState.level++;
            gameState.maxXP = Math.floor(gameState.maxXP * 1.2); 
            
            // Logic นี้ถูกต้องแล้วครับ มันจะหยุดเพิ่ม Rank เมื่อถึงตัวสุดท้าย (Adult)
            if (gameState.rankIndex < ranks.length - 1) {
                gameState.rankIndex++;
            }
            
            leveledUp = true;
        }
        if (leveledUp) {
            alert(`🎉 Level Up! You are now Level ${gameState.level} (${ranks[gameState.rankIndex]})`);
            saveGame();
        }
    }

    function checkAchievements() {
        let changed = false;
        if (gameState.totalTasksDone >= 1 && !gameState.achievements.firstStep) {
            gameState.currentXP += 50;
            gameState.achievements.firstStep = true;
            changed = true;
            alert(`🏆 Achievement Unlocked: First Step!\nReward: +50 XP`);
        }
        if (gameState.level >= 5 && !gameState.achievements.king) {
            gameState.currentXP += 500;
            gameState.achievements.king = true;
            changed = true;
            alert(`👑 Achievement Unlocked: King!\nReward: +500 XP`);
        }
        if (changed) saveGame();
    }

    function updateUI() {
        // อัปเดต Sidebar Info
        if(xpTextDisplay) xpTextDisplay.textContent = `${Math.floor(gameState.currentXP)}/${gameState.maxXP} XP`;
        if(xpProgressBar) {
            let percentage = (gameState.currentXP / gameState.maxXP) * 100;
            if (percentage > 100) percentage = 100;
            xpProgressBar.style.width = `${percentage}%`;
        }
        if(levelDisplay) levelDisplay.textContent = `Level ${gameState.level}`;
        if(rankDisplay) rankDisplay.textContent = ranks[gameState.rankIndex];
        if(rankNumberDisplay) rankNumberDisplay.textContent = gameState.rankIndex + 1;
        
        // [ใหม่] อัปเดต Badge ให้แสดงเลข Level ปัจจุบัน
        if(badgeDisplay) badgeDisplay.textContent = gameState.level;

        // Stats
        if(checkStatValue) checkStatValue.textContent = gameState.totalTasksDone;
        if(fireStatValue) fireStatValue.textContent = gameState.streak;

        // Achievements
        const achFirstStep = document.getElementById('ach-first-step');
        if (achFirstStep && gameState.achievements.firstStep) achFirstStep.classList.add('unlocked');
        
        const achKing = document.getElementById('ach-king');
        if (achKing) {
            const kingText = achKing.querySelector('.king-progress-text');
            const kingBar = achKing.querySelector('.king-progress-bar');
            let kingPercent = (gameState.level / 5) * 100;
            if (kingPercent > 100) kingPercent = 100;
            
            if(kingText) kingText.textContent = `${Math.min(gameState.level, 5)}/5`;
            if(kingBar) kingBar.style.width = `${kingPercent}%`;
            
            if (gameState.achievements.king) achKing.classList.add('unlocked');
        }
    }

    function getXPFromTask(taskItem) {
        const xpText = taskItem.querySelector('.xp-amount').textContent;
        return parseInt(xpText.replace(/\D/g, '')); 
    }

    function deleteTaskAnimation(taskItem) {
        taskItem.style.transition = 'all 0.5s ease';
        taskItem.style.transform = 'translateX(50px)';
        taskItem.style.opacity = '0';
    }

    function createTaskHTML(task) {
        let xpAmount = 10;
        let iconClass = 'fa-certificate';
        let colorClass = 'easy';
        if (task.difficulty === 'medium') { xpAmount = 25; iconClass = 'fa-certificate'; colorClass = 'medium'; } 
        else if (task.difficulty === 'hard') { xpAmount = 50; iconClass = 'fa-certificate'; colorClass = 'hard'; }

        const li = document.createElement('li');
        li.className = 'task-item';
        li.dataset.id = task.id;
        li.innerHTML = `
            <div class="task-left">
                <label class="checkbox-container">
                    <input type="checkbox">
                    <span class="checkmark"></span>
                </label>
                <span class="task-name">${task.text}</span>
            </div>
            <div class="task-right">
                <div class="xp-display">
                    <i class="fas ${iconClass} xp-icon ${colorClass}"></i>
                    <span class="xp-amount">+${xpAmount}XP</span>
                </div>
                <button class="delete-btn"><i class="fas fa-trash-alt"></i></button>
            </div>
        `;
        taskList.appendChild(li);
    }
});