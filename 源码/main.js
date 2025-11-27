// 主入口文件，整合所有模块
import { currentMode, switchMode } from './modeManager.js'
import { initializeDataPreview, saveDataConfig, applyDataFromURL, updateDataPreview } from './dataManager.js'
import { updateEngineDropdown, selectEngine } from "./engineManager.js"
import { setTheme, toggleThemeSwitcher } from './themeManager.js'
import { initializeEventHandlers } from './eventHandlers.js'
import { 
  setWallpaper, 
  setCustomWallpaper, 
  getCurrentDirection, 
  updateGradientPreview, 
  getAllColors, 
  getGradientPairs, 
  randomColors, 
  updateSVGWallpaper, 
  applyCustomGradient, 
  initColorMixer 
} from './wallpaperManager.js'
import { 
  fetchSuggestions, 
  showSuggestions, 
  hideSuggestions, 
  handleSuggestionNavigation 
} from './suggestionManager.js'
import { handleSearch } from './searchHandler.js'
import { 
  addLink, 
  addResource, 
  deleteLink, 
  deleteResource, 
  showConfirmResourceDialog, 
  closeConfirmResourceDialog, 
  confirmDeleteResource, 
  showConfirmDialog, 
  closeConfirmDialog, 
  confirmDeleteLink, 
  showEditDialog, 
  showEditResourceDialog, 
  closeEditDialog, 
  closeEditResourceDialog, 
  saveEditedLink, 
  saveEditedResource
} from './linkManager.js'
import { 
  renderQuickLinks, 
  openSettings, 
  closeSettings, 
  switchTab, 
  renderLinks, 
  renderResources, 
  applyFocusTransition 
} from './uiManager.js'

// 初始化事件监听
document.addEventListener("DOMContentLoaded", function () {
  // 初始更新引擎下拉菜单
  updateEngineDropdown()

  // 模式切换
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchMode(btn.dataset.mode))
  })

  // 搜索框输入事件
  const searchInput = document.getElementById("searchQuery")
  searchInput.addEventListener("input", (e) => {
    const query = e.target.value
    // 只在搜索模式下显示搜索建议
    if (currentMode === "search") {
      fetchSuggestions(query).then((suggestions) =>
        showSuggestions(suggestions, query)
      )
    } else {
      hideSuggestions()
    }
  })

  // 键盘事件处理
  searchInput.addEventListener("keydown", handleSuggestionNavigation)

  // 回车搜索
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  })

  // 搜索框焦点事件
  const searchContainer = document.querySelector(".search-container")
  const modeSwitcher = document.querySelector(".mode-switcher")
  const quickLinks = document.querySelector(".quick-links")

  searchInput.addEventListener("focus", () => {
    searchContainer.classList.add("focused")
    // 模式切换器收起动画
    modeSwitcher.classList.add("collapsed")
    // 快速链接淡出动画
    quickLinks.classList.add("collapsed")
    // 统一 transform 和 transition 逻辑，避免重绘问题
    applyFocusTransition(true)

    // 如果有内容，只在搜索模式下重新显示建议
    if (searchInput.value.trim() && currentMode === "search") {
      const query = searchInput.value
      fetchSuggestions(query).then((suggestions) =>
        showSuggestions(suggestions, query)
      )
    }
  })

  searchInput.addEventListener("blur", () => {
    hideSuggestions()

    searchContainer.classList.remove("focused")
    // 模式切换器展开动画
    modeSwitcher.classList.remove("collapsed")
    // 快速链接淡入动画
    quickLinks.classList.remove("collapsed")
    // 统一恢复逻辑
    applyFocusTransition(false)
  })

  // 搜索按钮mousedown事件 - 阻止默认行为，避免触发搜索框blur
  document.querySelector(".search-btn").addEventListener("mousedown", (e) => {
    e.preventDefault()
  })

  // 引擎选择器mousedown事件 - 阻止默认行为，避免触发搜索框blur
  document
    .querySelector(".engine-selector")
    .addEventListener("mousedown", (e) => {
      e.preventDefault()
    })

  // 引擎下拉菜单mousedown事件 - 阻止默认行为，避免触发搜索框blur
  document
    .getElementById("engineDropdown")
    .addEventListener("mousedown", (e) => {
      e.preventDefault()
    })

  // 加载保存的主题
  const savedTheme = localStorage.getItem("preferred-theme") || "light"
  setTheme(savedTheme)

  // 应用默认设置
  const defaultMode = localStorage.getItem("defaultMode") || "search"
  switchMode(defaultMode)

  // 初始化模式滑块
  const slider = document.querySelector(".mode-slider")
  if (defaultMode === "translate") {
    slider.style.transform = "translateX(100px)" // 与按钮宽度保持一致
  }

  // 初始化默认搜索引擎
  selectEngine("google", "Google")

  // 渲染快速链接
  renderQuickLinks()

  // 渲染资源
  renderResources()

  // 标签页切换事件
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab))
  })

  // 加载保存的壁纸
  const savedWallpaper = localStorage.getItem("customWallpaper")
  if (savedWallpaper) {
    const wallpaperContainer = document.getElementById("wallpaperContainer")
    wallpaperContainer.style.background = savedWallpaper
  }

  // 恢复自定义壁纸URL输入框的值
  const savedWallpaperUrl = localStorage.getItem("customWallpaperUrl")
  if (savedWallpaperUrl) {
    document.getElementById("customWallpaperUrl").value = savedWallpaperUrl
  }

  // 恢复SVG代码
  const savedSVGCode = localStorage.getItem("svgCode")
  if (savedSVGCode) {
    document.getElementById("svgCode").value = savedSVGCode
  }

  // 如果之前有活动的SVG壁纸，重新创建
  const svgActive = localStorage.getItem("svgWallpaper")
  if (svgActive === "active") {
    const savedSVGCode = localStorage.getItem("svgCode")
    if (savedSVGCode) {
      document.getElementById("svgCode").value = savedSVGCode
      updateSVGWallpaper()
    }
  }

  // 初始化自定义颜色混色功能
  initColorMixer()

  // 添加SVG代码实时更新功能
  const svgTextarea = document.getElementById("svgCode")
  if (svgTextarea) {
    svgTextarea.addEventListener("input", function () {
      localStorage.setItem("svgCode", this.value)
      updateSVGWallpaper()
    })
  }
  
  // 初始化数据预览
  initializeDataPreview()
  
  // 初始化事件处理器
  initializeEventHandlers()
})

// 导出所有需要在全局作用域使用的函数
window.switchMode = switchMode
window.updateEngineDropdown = updateEngineDropdown
window.selectEngine = selectEngine
window.handleSearch = handleSearch
window.setTheme = setTheme
window.toggleThemeSwitcher = toggleThemeSwitcher
window.setWallpaper = setWallpaper
window.setCustomWallpaper = setCustomWallpaper
window.updateGradientPreview = updateGradientPreview
window.randomColors = randomColors
window.applyCustomGradient = applyCustomGradient
window.updateSVGWallpaper = updateSVGWallpaper
window.openSettings = openSettings
window.closeSettings = closeSettings
window.switchTab = switchTab
window.addLink = addLink
window.addResource = addResource
window.deleteLink = deleteLink
window.deleteResource = deleteResource
window.showConfirmResourceDialog = showConfirmResourceDialog
window.closeConfirmResourceDialog = closeConfirmResourceDialog
window.confirmDeleteResource = confirmDeleteResource
window.showConfirmDialog = showConfirmDialog
window.closeConfirmDialog = closeConfirmDialog
window.confirmDeleteLink = confirmDeleteLink
window.showEditDialog = showEditDialog
window.showEditResourceDialog = showEditResourceDialog
window.closeEditDialog = closeEditDialog
window.closeEditResourceDialog = closeEditResourceDialog
window.saveEditedLink = saveEditedLink
window.saveEditedResource = saveEditedResource
window.renderLinks = renderLinks
window.renderResources = renderResources
window.saveDataConfig = saveDataConfig
window.applyDataFromURL = applyDataFromURL
window.initColorMixer = initColorMixer
window.getCurrentDirection = getCurrentDirection
window.getAllColors = getAllColors
window.getGradientPairs = getGradientPairs
window.updateDataPreview = updateDataPreview