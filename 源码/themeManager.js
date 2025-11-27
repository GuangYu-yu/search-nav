// 主题管理模块
// 设置主题
function setTheme(theme) {
  // 添加过渡类来启用平滑过渡
  document.documentElement.classList.add("theme-transitioning")

  // 立即应用新主题
  document.documentElement.setAttribute("data-theme", theme)
  localStorage.setItem("preferred-theme", theme)

  // 更新按钮状态
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

// 切换主题切换器显示状态
function toggleThemeSwitcher() {
  const themeSwitcher = document.getElementById("themeSwitcher")
  themeSwitcher.classList.toggle("show")
}

export { setTheme, toggleThemeSwitcher }