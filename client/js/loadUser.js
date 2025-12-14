const API_USER = "http://localhost:3000"

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

function renderDataUser(data) {
    const ranks = ["Infant", "Toddler", "Kid", "Teenager", "Adult"];

    const usernameEl = document.getElementById("Username");
    const expEl = document.getElementById("user-exp");
    const levelEl = document.getElementById("user-level");
    const levelLogo = document.getElementById("logo-level");
    const progressEl = document.getElementById("progress-fill");
    const rank_number = document.getElementById("rank-number")
    const rank_name = document.getElementById("rank-name")

    const totalExpPerLevel = 1000;

    const exp = data.exp || 0;

    const level = Math.floor(exp / totalExpPerLevel) + 1;

    const currentLevelExp = exp % totalExpPerLevel;

    const ranks_number = Math.floor(level / 5);

    const rank_index = ranks_number > 5 ? 5 : ranks_number;

    usernameEl.textContent = data.username;
    levelEl.textContent = `Level: ${level}`;
    expEl.textContent = `${currentLevelExp} / ${totalExpPerLevel} XP`;
    rank_number.textContent = ranks_number + 1;
    rank_name.textContent = ranks[rank_index]
    levelLogo.textContent = level;

    progressEl.style.width = `${(currentLevelExp / totalExpPerLevel) * 100}%`;
}


async function loadDataUser() {
    const res = await authFetchData(`${API_USER}/api/get_user`, {
        method: "GET",
    }
    );
    if (!res) return;

    const user = await res.json();
    renderDataUser(user);
}

document.addEventListener("DOMContentLoaded", () => {
    if (!isLoggedIn()) {
        window.location.href = "login.html";
        return;
    }
    
    loadDataUser();
});
