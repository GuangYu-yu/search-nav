// 模式管理模块
import { selectEngine, updateEngineDropdown } from "./engineManager.js"

let currentMode = "search"
let currentEngine = "google"

// 设置当前引擎的函数
function setCurrentEngine(engine) {
  currentEngine = engine
}

// 切换模式
function switchMode(mode) {
  currentMode = mode
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.mode === mode)
  })

  // 移动滑块
  const slider = document.querySelector(".mode-slider")
  if (mode === "translate") {
    slider.style.transform = "translateX(100px)" // 与按钮宽度保持一致
  } else if (mode === "resource") {
    slider.style.transform = "translateX(200px)" // 第三个按钮位置
  } else {
    slider.style.transform = "translateX(0)"
  }

  const searchInput = document.getElementById("searchQuery")
  if (mode === "translate") {
    searchInput.placeholder = "输入要翻译的文本..."
    // 切换到翻译引擎
    selectEngine("google", "Google翻译")
    // 更新引擎下拉菜单以显示适合翻译的选项
    updateEngineDropdown()
  } else if (mode === "resource") {
    searchInput.placeholder = "搜索各类资源..."
    // 切换到资源引擎
    selectEngine("bilibili", "哔哩哔哩")
    // 更新引擎下拉菜单以显示资源搜索选项
    updateEngineDropdown()
  } else {
    searchInput.placeholder = "输入搜索内容..."
    // 切换回搜索引擎
    selectEngine("google", "Google")
    // 更新引擎下拉菜单以显示所有搜索选项
    updateEngineDropdown()
  }
}

export { currentMode, currentEngine, setCurrentEngine, switchMode }