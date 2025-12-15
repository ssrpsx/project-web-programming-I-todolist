const API_USER = "http://localhost:3000"

const ranks = ["Infant", "Toddler", "Kid", "Teenager", "Adult"];
const totalExpPerLevel = 200
var level = 0;
var exp = 0;
var rank_index = 0;
var pomodoroIsDone = false;
const soundRankUp = new Audio("../audio/rankup.mp3");
const soundLevelUp = new Audio("../audio/levelup.mp3");

function isLoggedIn() {
    const token = localStorage.getItem("token");
    const expireAt = localStorage.getItem("expireAt");
    if (!token || !expireAt) return false;
    if (Date.now() > Number(expireAt)) {
        localStorage.clear();
        return false;
    }
    return true;
}

function getToken() {
    return localStorage.getItem("token");
}

async function authFetchData(url, options = {}) {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    const token = getToken();

    const res = await fetch(url, {
        ...options,
        headers: {
            ...(options.headers || {}),
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
        }
    });

    if (res.status === 401 || res.status === 403) {
        localStorage.clear();
        window.location.href = "login.html";
        return;
    }

    return res;
}

function createAchievementItem(data) {
    const item = document.createElement("div");
    item.className = "achievement-item";
    item.dataset.id = data.ID;

    if (data.COMPLETE === 1) item.classList.add("completed");

    item.innerHTML = `
    <div class="ach-icon">
      <i class="${data.ICON}"></i>
    </div>
    <div class="ach-info">
      <h4>${data.TITLE}</h4>
      <p>${data.DESCRIPTION}</p>
    </div>
  `;

    return item;
}
function RankUp(oldFrames, newFrames, oldRank, newRank) {
    const overlay = document.createElement("div");
    overlay.className = "levelup-overlay";

    const frameBox = document.createElement("div");
    frameBox.className = "levelup-frame";

    const title = document.createElement("div");
    title.className = "levelup-title";
    title.textContent = "🎉 Congratulations 🎉";

    const imgWrap = document.createElement("div");
    imgWrap.className = "levelup-img-wrap";

    const oldImg = document.createElement("img");
    oldImg.className = "levelup-img";

    const newImg = document.createElement("img");
    newImg.className = "levelup-img";

    const sub = document.createElement("div");
    sub.className = "levelup-sub";
    sub.textContent = `Rank Up : ${oldRank} to ${newRank}`;

    imgWrap.appendChild(oldImg);
    imgWrap.appendChild(newImg);

    frameBox.appendChild(title);
    frameBox.appendChild(imgWrap);
    frameBox.appendChild(sub);

    overlay.appendChild(frameBox);
    document.body.appendChild(overlay);

    let frame = 0;
    let loop = 0;
    const totalFrames = oldFrames.length;
    const maxLoop = 3;

    let oldX = 120;
    let newX = 360;

    oldImg.style.left = `${oldX}px`;
    newImg.style.left = `${newX}px`;

    oldImg.src = oldFrames[0];
    newImg.src = newFrames[0];

    soundRankUp.play()

    setTimeout(() => {
        const interval = setInterval(() => {

            oldImg.src = oldFrames[frame];
            newImg.src = newFrames[frame];

            oldX -= 12;
            newX -= 12;

            oldImg.style.left = `${oldX}px`;
            newImg.style.left = `${newX}px`;

            frame++;

            if (frame >= totalFrames) {
                frame = 0;
                loop++;
            }

            // รูปเก่าหลุดจอ
            if (oldX < -150 && oldImg.parentNode) {
                oldImg.remove();
            }

            // ✅ เงื่อนไขหยุดที่ตำแหน่ง 120px และครบ 3 loop
            if (loop >= maxLoop && newX <= 120) {
                clearInterval(interval);
                newImg.style.left = "120px";

                setTimeout(() => overlay.remove(), 1000);
            }

        }, 100);
    }, 700);
}


function LevelUp(frames, oldLevel, newLevel) {
    const overlay = document.createElement("div");
    overlay.className = "levelup-overlay";

    const frameBox = document.createElement("div");
    frameBox.className = "levelup-frame";

    const title = document.createElement("div");
    title.className = "levelup-title";
    title.textContent = "🎉 Level Up! 🎉";

    const img = document.createElement("img");
    img.className = "levelup-img";
    img.id = "level"

    const sub = document.createElement("div");
    sub.className = "levelup-sub";
    sub.textContent = `Level Up : ${oldLevel} to ${newLevel}`;

    frameBox.appendChild(title);
    frameBox.appendChild(img);
    frameBox.appendChild(sub);

    overlay.appendChild(frameBox);
    document.body.appendChild(overlay);

    let frame = 0;
    let loop = 0;
    const totalFrames = frames.length;
    const maxLoop = 3;

    img.src = frames[0];

    soundLevelUp.play()

    setTimeout(() => {
        const interval = setInterval(() => {
            img.src = frames[frame];
            frame++;

            if (frame >= totalFrames) {
                frame = 0;
                loop++;
            }

            if (loop >= maxLoop) {
                clearInterval(interval);

                setTimeout(() => overlay.remove(), 800);
            }
        }, 200);
    }, 700);
}

function checkLevelUp(newLevel, newRankIndex) {
    const prevLevel = Number(localStorage.getItem("prev_level")) || newLevel;
    const prevRankIndex = Number(localStorage.getItem("prev_rank_index")) || newRankIndex;

    // ===== LEVEL UP =====
    if (newLevel > prevLevel) {
        const frames = [
            `../images/${ranks[newRankIndex]}_yay_1.png`,
            `../images/${ranks[newRankIndex]}_yay_2.png`,
            `../images/${ranks[newRankIndex]}_yay_3.png`
        ];

        LevelUp(frames, prevLevel, newLevel);
    }

    // ===== RANK UP =====
    if (newRankIndex > prevRankIndex) {
        const oldRank = ranks[prevRankIndex];
        const newRank = ranks[newRankIndex];

        const oldFrames = [
            `../images/${oldRank}_walk_1.png`,
            `../images/${oldRank}_walk_2.png`,
            `../images/${oldRank}_walk_3.png`
        ];

        const newFrames = [
            `../images/${newRank}_walk_1.png`,
            `../images/${newRank}_walk_2.png`,
            `../images/${newRank}_walk_3.png`
        ];

        RankUp(oldFrames, newFrames, oldRank, newRank);
    }

    localStorage.setItem("prev_level", newLevel);
    localStorage.setItem("prev_rank_index", newRankIndex);
}


function renderAchievements(data) {
    const container = document.getElementById("achievement-list");
    container.innerHTML = "";

    data.sort((a, b) => a.COMPLETE - b.COMPLETE);

    data.forEach(item => {
        container.appendChild(createAchievementItem(item));
    });
}

function renderDataCorrectUser(data) {
    const correctNumber = document.getElementById('correct-number')

    correctNumber.innerText = data
}

function renderDataStreakUser(data) {
    const streakNumber = document.getElementById('streak-number')

    streakNumber.innerText = data
}

function renderDataUser(data) {
    const usernameEl = document.getElementById("Username");
    const expEl = document.getElementById("user-exp");
    const levelEl = document.getElementById("user-level");
    const levelLogo = document.getElementById("logo-level");
    const progressEl = document.getElementById("progress-fill");
    const rank_number = document.getElementById("rank-number");
    const rank_name = document.getElementById("rank-name");
    const img_user = document.getElementById("image-user");

    exp = data.exp || 0;

    level = Math.floor(exp / totalExpPerLevel) + 1;

    const currentLevelExp = exp % totalExpPerLevel;

    const ranks_number = Math.floor(level / 5);

    rank_index = ranks_number > 5 ? 5 : ranks_number;

    usernameEl.textContent = data.username;
    levelEl.textContent = `Level: ${level}`;
    expEl.textContent = `${currentLevelExp} / ${totalExpPerLevel} XP`;
    rank_number.textContent = ranks_number + 1;
    rank_name.textContent = ranks[rank_index]
    levelLogo.textContent = level;

    progressEl.style.width = `${(currentLevelExp / totalExpPerLevel) * 100}%`;

    img_user.src = `../images/${ranks[rank_index]}_profile.png`

    checkLevelUp(level, rank_index);
}

async function putAchievements(id, reload = true) {
    const res = await authFetchData(`${API_USER}/api/put_achievement`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ ID: id })
    });

    if (!res) return;

    if (reload) {
        await loadDataUser();
    }
}

async function checkAchievements(data, tasks, notes) {
    const { user, streak, achievement } = data;

    const level = Math.floor(user.exp / totalExpPerLevel) + 1;

    const hardCompleted = tasks.filter(
        t => t.LEVEL === "Hard" && t.COMPLETE === 1
    ).length;

    const noteCount = notes.length;

    for (const ach of achievement) {
        if (ach.COMPLETE === 1) continue;

        let shouldUnlock = false;

        switch (ach.TITLE) {
            case "On fire":
                shouldUnlock = streak >= 5;
                break;
            case "Hardcore":
                shouldUnlock = hardCompleted >= 3;
                break;
            case "King":
                shouldUnlock = level >= 5;
                break;
            case "Scribe":
                shouldUnlock = noteCount >= 3;
                break;
            case "Time Keeper":
                shouldUnlock = pomodoroIsDone === true;
                break;
            case "High Flyer":
                shouldUnlock = rank_index >= 2;
                break;
        }

        if (shouldUnlock) {
            await putAchievements(ach.ID, false);
            showPopup("Achievement: " + ach.TITLE, "Successfully + 100EXP", () => {
                loadDataUser();
            });
        }
    }
}

async function getTasks() {
    const res = await authFetchData(`${API_USER}/api/get_task`, {
        method: "GET"
    });
    if (!res) return [];

    if (!res.ok) return [];
    return await res.json();
}

async function getNotes() {
    const res = await authFetchData(`${API_USER}/api/get_note`, {
        method: "GET"
    });
    if (!res) return [];

    if (!res.ok) return [];
    return await res.json();
}

async function loadDataUser() {
    const res = await authFetchData(`${API_USER}/api/get_user`, {
        method: "GET",
    });
    if (!res) return;

    const data = await res.json();

    const tasks = await getTasks();
    const notes = await getNotes();

    if (!tasks || !notes) return;

    await checkAchievements(data, tasks, notes);

    renderDataUser(data.user);
    renderDataCorrectUser(data.correct);
    renderDataStreakUser(data.streak);
    renderAchievements(data.achievement);
}

function showPopup(title, message, callback) {
    const overlay = document.getElementById("popup-overlay");
    const titleEl = document.getElementById("popup-title");
    const messageEl = document.getElementById("popup-message");
    const btn = document.getElementById("popup-btn");

    titleEl.textContent = title;
    messageEl.textContent = message;

    overlay.showModal();

    btn.onclick = () => {
        overlay.close();
        if (callback) callback();
    };
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }

    loadDataUser();
});

// RankUp(
//     [
//         "../images/Infant_walk_1.png",
//         "../images/Infant_walk_2.png",
//         "../images/Infant_walk_3.png"
//     ],
//     [
//         "../images/Kid_walk_1.png",
//         "../images/Kid_walk_2.png",
//         "../images/Kid_walk_3.png"
//     ],
//     "Kid",
//     "Teenager"
// );

// LevelUp(
//     [
//         "../images/Infant_yay_1.png",
//         "../images/Infant_yay_2.png",
//         "../images/Infant_yay_3.png"
//     ],
//     4,
//     5
// );