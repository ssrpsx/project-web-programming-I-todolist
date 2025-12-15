const btn = document.getElementById("btn");
const nav = document.getElementById("nav");

const links = document.querySelectorAll(".nav-links a");

btn.addEventListener("click", () => {
    if (nav.style.display == "block") {
        nav.style.display = 'none'
    }
    else {
        nav.style.display = 'block'
    }
})