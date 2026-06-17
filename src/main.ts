import { currentMode, switchMode } from './modeManager'
import { initializeDataPreview } from './dataManager'
import { updateEngineDropdown, selectEngine } from "./engineManager"
import { setTheme } from './themeManager'
import { initializeEventHandlers } from './eventHandlers'
import { initBuiltInEngines } from './builtInEngines'
import {
  updateSVGWallpaper,
  initColorMixer,
  restoreWallpaperFromStorage
} from './wallpaperManager'
import { initWallpaperRenderer } from './wallpaperRenderer'
import { 
  fetchSuggestions, 
  showSuggestions, 
  hideSuggestions, 
  handleSuggestionNavigation 
} from './suggestionManager'
import { handleSearch } from './searchHandler'
import { 
  renderQuickLinks, 
  switchTab, 
  renderResources, 
  applyFocusTransition 
} from './uiManager'

document.addEventListener("DOMContentLoaded", function () {
  updateEngineDropdown()

  const searchInput = document.getElementById("searchQuery") as HTMLInputElement | null
  if (searchInput) {
    let isComposing = false

    const handleSuggestionInput = (e: Event) => {
      const query = (e.target as HTMLInputElement).value
      if (currentMode === "search") {
        fetchSuggestions(query).then((suggestions) =>
          showSuggestions(suggestions, query)
        )
      } else {
        hideSuggestions()
      }
    }

    searchInput.addEventListener("compositionstart", () => { isComposing = true })
    searchInput.addEventListener("compositionend", (e) => {
      isComposing = false
      handleSuggestionInput(e)
    })
    searchInput.addEventListener("input", (e) => {
      if (isComposing) return
      handleSuggestionInput(e)
    })

    searchInput.addEventListener("keydown", handleSuggestionNavigation)

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSearch()
      }
    })

    const searchContainer = document.querySelector(".search-container") as HTMLElement | null
    const quickLinks = document.querySelector(".quick-links") as HTMLElement | null

    searchInput.addEventListener("focus", () => {
      searchContainer?.classList.add("focused")
      quickLinks?.classList.add("collapsed")
      applyFocusTransition(true)

      if (searchInput.value.trim() && currentMode === "search") {
        const query = searchInput.value
        fetchSuggestions(query).then((suggestions) =>
          showSuggestions(suggestions, query)
        )
      }
    })

    searchInput.addEventListener("blur", () => {
      hideSuggestions()

      searchContainer?.classList.remove("focused")
      quickLinks?.classList.remove("collapsed")
      applyFocusTransition(false)
    })
  }

  const searchBtn = document.querySelector(".search-btn") as HTMLElement | null
  if (searchBtn) {
    searchBtn.addEventListener("mousedown", (e) => {
      e.preventDefault()
    })
  }

  const engineSelector = document.querySelector(".engine-selector") as HTMLElement | null
  if (engineSelector) {
    engineSelector.addEventListener("mousedown", (e) => {
      e.preventDefault()
    })
  }

  const engineDropdown = document.getElementById("engineDropdown")
  if (engineDropdown) {
    engineDropdown.addEventListener("mousedown", (e) => {
      e.preventDefault()
    })
  }

  const savedTheme = localStorage.getItem("preferred-theme")
  setTheme(savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'))

  const defaultMode = (localStorage.getItem("defaultMode") || "search") as 'search' | 'translate' | 'resource'
  switchMode(defaultMode)

  selectEngine("google", "Google")

  renderQuickLinks()
  renderResources()
  initBuiltInEngines()

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab((btn as HTMLElement).dataset.tab || ""))
  })

  // 恢复壁纸设置面板的输入框 UI 状态
  const savedWallpaperUrl = localStorage.getItem("customWallpaperUrl")
  if (savedWallpaperUrl) {
    const customWallpaperUrlInput = document.getElementById("customWallpaperUrl") as HTMLInputElement | null
    if (customWallpaperUrlInput) {
      customWallpaperUrlInput.value = savedWallpaperUrl
    }
  }

  const savedSVGCode = localStorage.getItem("svgCode")
  if (savedSVGCode) {
    const svgCodeInput = document.getElementById("svgCode") as HTMLTextAreaElement | null
    if (svgCodeInput) {
      svgCodeInput.value = savedSVGCode
    }
  }

  // 初始化 Pixi 渲染器并从 localStorage 恢复壁纸内容(异步,不阻塞其他初始化)
  const wallpaperGL = document.getElementById("wallpaperGL") as HTMLCanvasElement | null
  if (wallpaperGL) {
    initWallpaperRenderer(wallpaperGL).then(() => {
      void restoreWallpaperFromStorage()
    })
  }

  initColorMixer()

  const svgTextarea = document.getElementById("svgCode") as HTMLTextAreaElement | null
  if (svgTextarea) {
    svgTextarea.addEventListener("input", function () {
      localStorage.setItem("svgCode", this.value)
      updateSVGWallpaper()
    })
  }
  
  initializeDataPreview()
  initializeEventHandlers()
})