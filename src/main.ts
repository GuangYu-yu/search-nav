import { currentMode, switchMode } from './modeManager'
import { initializeDataPreview, saveDataConfig, applyDataFromURL, updateDataPreview } from './dataManager'
import { updateEngineDropdown, selectEngine } from "./engineManager"
import { setTheme, toggleThemeSwitcher } from './themeManager'
import { initializeEventHandlers } from './eventHandlers'
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
} from './wallpaperManager'
import { 
  fetchSuggestions, 
  showSuggestions, 
  hideSuggestions, 
  handleSuggestionNavigation 
} from './suggestionManager'
import { handleSearch } from './searchHandler'
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
} from './linkManager'
import { 
  renderQuickLinks, 
  openSettings, 
  closeSettings, 
  switchTab, 
  renderLinks, 
  renderResources, 
  applyFocusTransition 
} from './uiManager'

document.addEventListener("DOMContentLoaded", function () {
  updateEngineDropdown()

  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchMode((btn as HTMLElement).dataset.mode as 'search' | 'translate' | 'resource'))
  })

  const searchInput = document.getElementById("searchQuery") as HTMLInputElement | null
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const query = (e.target as HTMLInputElement).value
      if (currentMode === "search") {
        fetchSuggestions(query).then((suggestions) =>
          showSuggestions(suggestions, query)
        )
      } else {
        hideSuggestions()
      }
    })

    searchInput.addEventListener("keydown", handleSuggestionNavigation)

    searchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        handleSearch()
      }
    })

    const searchContainer = document.querySelector(".search-container") as HTMLElement | null
    const modeSwitcher = document.querySelector(".mode-switcher") as HTMLElement | null
    const quickLinks = document.querySelector(".quick-links") as HTMLElement | null

    searchInput.addEventListener("focus", () => {
      searchContainer?.classList.add("focused")
      modeSwitcher?.classList.add("collapsed")
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
      modeSwitcher?.classList.remove("collapsed")
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

  const savedTheme = localStorage.getItem("preferred-theme") || "light"
  setTheme(savedTheme)

  const defaultMode = (localStorage.getItem("defaultMode") || "search") as 'search' | 'translate' | 'resource'
  switchMode(defaultMode)

  const slider = document.querySelector(".mode-slider") as HTMLElement | null
  if (slider && defaultMode === "translate") {
    slider.style.transform = "translateX(100px)"
  }

  selectEngine("google", "Google")

  renderQuickLinks()
  renderResources()

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => switchTab((btn as HTMLElement).dataset.tab || ""))
  })

  const savedWallpaper = localStorage.getItem("customWallpaper")
  if (savedWallpaper) {
    const wallpaperContainer = document.getElementById("wallpaperContainer") as HTMLElement | null
    if (wallpaperContainer) {
      wallpaperContainer.style.background = savedWallpaper
    }
  }

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

  const svgActive = localStorage.getItem("svgWallpaper")
  if (svgActive === "active") {
    const savedSVGCode = localStorage.getItem("svgCode")
    if (savedSVGCode) {
      const svgCodeInput = document.getElementById("svgCode") as HTMLTextAreaElement | null
      if (svgCodeInput) {
        svgCodeInput.value = savedSVGCode
      }
      updateSVGWallpaper()
    }
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

declare global {
  interface Window {
    switchMode: typeof switchMode
    updateEngineDropdown: typeof updateEngineDropdown
    selectEngine: typeof selectEngine
    handleSearch: typeof handleSearch
    setTheme: typeof setTheme
    toggleThemeSwitcher: typeof toggleThemeSwitcher
    setWallpaper: typeof setWallpaper
    setCustomWallpaper: typeof setCustomWallpaper
    updateGradientPreview: typeof updateGradientPreview
    randomColors: typeof randomColors
    applyCustomGradient: typeof applyCustomGradient
    updateSVGWallpaper: typeof updateSVGWallpaper
    openSettings: typeof openSettings
    closeSettings: typeof closeSettings
    switchTab: typeof switchTab
    addLink: typeof addLink
    addResource: typeof addResource
    deleteLink: typeof deleteLink
    deleteResource: typeof deleteResource
    showConfirmResourceDialog: typeof showConfirmResourceDialog
    closeConfirmResourceDialog: typeof closeConfirmResourceDialog
    confirmDeleteResource: typeof confirmDeleteResource
    showConfirmDialog: typeof showConfirmDialog
    closeConfirmDialog: typeof closeConfirmDialog
    confirmDeleteLink: typeof confirmDeleteLink
    showEditDialog: typeof showEditDialog
    showEditResourceDialog: typeof showEditResourceDialog
    closeEditDialog: typeof closeEditDialog
    closeEditResourceDialog: typeof closeEditResourceDialog
    saveEditedLink: typeof saveEditedLink
    saveEditedResource: typeof saveEditedResource
    renderLinks: typeof renderLinks
    renderResources: typeof renderResources
    saveDataConfig: typeof saveDataConfig
    applyDataFromURL: typeof applyDataFromURL
    initColorMixer: typeof initColorMixer
    getCurrentDirection: typeof getCurrentDirection
    getAllColors: typeof getAllColors
    getGradientPairs: typeof getGradientPairs
    updateDataPreview: typeof updateDataPreview
  }
}

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