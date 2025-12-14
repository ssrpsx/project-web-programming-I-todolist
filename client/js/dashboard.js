const API_Dashboard = "http://localhost:3000"
const taskInput = document.querySelector('.task-input');
const difficultySelect = document.querySelector('.difficulty-select');
const taskForm = document.querySelector('.task-input-group');
const taskList = document.querySelector('.task-list');

function renderDataDashboard(tasks) {
    const taskList = document.querySelector(".task-list");
    taskList.innerHTML = "";

    const xpMap = {
        Easy: 15,
        Medium: 25,
        Hard: 50
    };

    tasks.forEach(task => {

        if (task.COMPLETE == false) {

            const xp = xpMap[task.LEVEL] || 0;

            const li = document.createElement("li");
            li.className = "task-item";
            li.dataset.id = task.ID;

            li.innerHTML = `
            <div class="task-left">
            <label class="checkbox-container">
            <input type="checkbox" ${task.COMPLETE ? "checked" : ""}>
            <span class="checkmark"></span>
            </label>
            <span class="task-name">${task.TASK}</span>
            </div>
            
            <div class="task-right">
            <div class="xp-display">
            <i class="fas fa-certificate xp-icon ${task.LEVEL.toLowerCase()}"></i>
            <span class="xp-amount">+${xp}XP</span>
            </div>
            <button class="delete-btn">
            <i class="fas fa-trash-alt"></i>
            </button>
            </div>
            `;

            taskList.appendChild(li);
        }
    });
}

async function loadDataDashboard() {
    console.log(`${API_Dashboard}/api/get_task`);

    const res = await authFetchData(
        `${API_Dashboard}/api/get_task`,
        {
            method: "GET",
        }
    );

    if (!res) return;

    const data = await res.json();

    renderDataDashboard(data);
}

async function postTask(taskText, difficulty) {
    const res = await authFetchData(
        `${API_Dashboard}/api/post_task`,
        {
            method: "POST",
            body: JSON.stringify({
                TASK: taskText,
                LEVEL: difficulty
            })
        }
    );

    if (!res) return;

    const data = await res.json();
    console.log("Task added:", data);
}

if (taskForm) {
    taskForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const taskText = taskInput.value.trim();
        const difficulty = difficultySelect.value;

        if (taskText === "") return;

        await postTask(taskText, difficulty);

        taskInput.value = "";
        taskInput.focus();

        loadDataDashboard();
    });
}

if (taskList) {
    taskList.addEventListener("click", async (event) => {
        const target = event.target;
        const taskItem = target.closest(".task-item");
        // if (!taskItem) return;

        const taskId = taskItem.dataset.id;

        if (target.closest(".delete-btn")) {
            await authFetchData(
                `${API_Dashboard}/api/delete_task/${taskId}`,
                { method: "DELETE" }
            );

            taskItem.style.opacity = "0";
            taskItem.style.transform = "translateX(50px)";
            setTimeout(() => loadDataDashboard(), 300);
        }

        if (target.matches("input[type='checkbox']")) {
            await authFetchData(
                `${API_Dashboard}/api/put_task/${taskId}`,
                { method: "PUT" }
            );

            loadDataDashboard();
            loadDataUser();
        }
    });
}

loadDataDashboard();