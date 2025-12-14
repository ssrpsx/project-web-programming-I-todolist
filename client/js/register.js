const overlay = document.getElementById("popup-overlay");
const titleEl = document.getElementById("popup-title");
const messageEl = document.getElementById("popup-message");
const btn = document.getElementById("popup-btn");
const form = document.getElementById('register-form');
const username = document.getElementById('username');
const password = document.getElementById('password');
const confirmPassword = document.getElementById('confirmPassword')

const API_BASE = "http://localhost:3000"

if (isLoggedIn()) {
    window.location.href = "dashboard.html";
}

function showPopup(title, message, callback) {
    titleEl.textContent = title;
    messageEl.textContent = message;

    overlay.showModal();

    btn.onclick = () => {
        overlay.close();
        if (callback) callback();
    };
}


form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const data = {
        username: formData.get("username"),
        password: formData.get("password"),
        confirmPassword: formData.get("confirmPassword"),
    };

    if (data.password !== data.confirmPassword) {
        showPopup("Error", "Passwords do not match");
        password.value = "";
        confirmPassword.value = "";
        return;
    }

    try {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });

        const result = await res.json();

        if (!res.ok) {
            showPopup("Register Failed", result.message || "Something went wrong");
            username.value = "";
            password.value = "";
            confirmPassword.value = "";
            return;
        }

        showPopup("Register Success", "Account created successfully!", () => {
            window.location.href = "login.html";
        });

    }
    catch (err) {
        showPopup("Server Error", "Unable to connect to server: " + err);
        password.value = "";
        confirmPassword.value = "";
    }
});

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