if (!isLoggedIn()) {
    window.location.href = "login.html";
}

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