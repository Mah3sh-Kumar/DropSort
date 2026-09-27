// ========================================
// Theme Management
// ========================================

const themeToggle = document.getElementById("themeToggle");
const themeIcon = document.getElementById("themeIcon");
const themeText = document.getElementById("themeText");

function applyTheme(theme) {
    if (theme === "light") {
        document.body.classList.add("light-theme");
        document.documentElement.setAttribute('data-bs-theme', 'light');
        if (themeIcon) themeIcon.textContent = "🌙";
        if (themeText) themeText.textContent = "Dark";
    } else {
        document.body.classList.remove("light-theme");
        document.documentElement.setAttribute('data-bs-theme', 'dark');
        if (themeIcon) themeIcon.textContent = "☀️";
        if (themeText) themeText.textContent = "Light";
    }
    localStorage.setItem("dropsort-theme", theme);
}

const savedTheme = localStorage.getItem("dropsort-theme");
applyTheme(savedTheme || "dark");

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const isLight = document.body.classList.contains("light-theme");
        applyTheme(isLight ? "dark" : "light");
    });
}