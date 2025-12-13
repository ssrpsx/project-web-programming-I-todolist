const logout = document.getElementById('logout')

logout.addEventListener('click', (e) => {
    localStorage.clear();

    window.location.href = 'login.html'
})