function toggleThemeSwitcher(): void {
  const themeSwitcher = document.getElementById("themeSwitcher")
  themeSwitcher?.classList.toggle("show")
}

function setTheme(theme: string): void {
  document.documentElement.classList.add("theme-transitioning")
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("preferred-theme", theme)

  document.querySelectorAll(".theme-btn").forEach((btn) => {
    btn.classList.remove("active")
    if (btn.classList.contains(theme)) {
      btn.classList.add("active")
    }
  })

  setTimeout(() => {
    document.documentElement.classList.remove("theme-transitioning")
  }, 300)
}

export { setTheme, toggleThemeSwitcher }