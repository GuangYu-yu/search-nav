import { setTheme, toggleThemeSwitcher } from './themeManager'
import { openSettings, closeSettings } from './uiManager'
import { toggleEngineDropdown, selectEngine } from './engineManager'
import { switchMode } from './modeManager'
import { handleSearch } from './searchHandler'
import { 
  closeConfirmDialog, 
  confirmDeleteLink, 
  closeEditDialog, 
  saveEditedLink, 
  closeEditResourceDialog, 
  saveEditedResource, 
  closeConfirmResourceDialog, 
  confirmDeleteResource, 
  addLink, 
  addResource 
} from './linkManager'
import { setWallpaper, randomColors, applyCustomGradient, setCustomWallpaper } from './wallpaperManager'
import { saveDataConfig, applyDataFromURL } from './dataManager'

export function initializeEventHandlers(): void {
  const themeToggleBtn = document.getElementById('themeToggleBtn')
  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', toggleThemeSwitcher)
  }

  const themeButtons = document.querySelectorAll('.theme-btn')
  themeButtons.forEach(btn => {
    btn.addEventListener('click', function(this: HTMLElement) {
      const theme = this.getAttribute('data-theme')
      if (theme) setTheme(theme)
    })
  })

  const settingsBtn = document.getElementById('settingsBtn')
  if (settingsBtn) {
    settingsBtn.addEventListener('click', openSettings)
  }

  const engineSelector = document.getElementById('engineSelector')
  if (engineSelector) {
    engineSelector.addEventListener('click', toggleEngineDropdown)
  }

  const modeButtons = document.querySelectorAll('.mode-btn')
  modeButtons.forEach(btn => {
    btn.addEventListener('click', function(this: HTMLElement) {
      const mode = this.getAttribute('data-mode')
      if (mode) switchMode(mode as 'search' | 'translate' | 'resource')
    })
  })

  const closeSettingsBtn = document.getElementById('closeSettingsBtn')
  if (closeSettingsBtn) {
    closeSettingsBtn.addEventListener('click', closeSettings)
  }

  const searchBtn = document.getElementById('searchBtn')
  if (searchBtn) {
    searchBtn.addEventListener('click', handleSearch)
  }

  const closeConfirmDialogBtn = document.getElementById('closeConfirmDialogBtn')
  if (closeConfirmDialogBtn) {
    closeConfirmDialogBtn.addEventListener('click', closeConfirmDialog)
  }

  const confirmDeleteLinkBtn = document.getElementById('confirmDeleteLinkBtn')
  if (confirmDeleteLinkBtn) {
    confirmDeleteLinkBtn.addEventListener('click', confirmDeleteLink)
  }

  const closeEditDialogBtn = document.getElementById('closeEditDialogBtn')
  if (closeEditDialogBtn) {
    closeEditDialogBtn.addEventListener('click', closeEditDialog)
  }

  const saveEditedLinkBtn = document.getElementById('saveEditedLinkBtn')
  if (saveEditedLinkBtn) {
    saveEditedLinkBtn.addEventListener('click', saveEditedLink)
  }

  const closeEditResourceDialogBtn = document.getElementById('closeEditResourceDialogBtn')
  if (closeEditResourceDialogBtn) {
    closeEditResourceDialogBtn.addEventListener('click', closeEditResourceDialog)
  }

  const saveEditedResourceBtn = document.getElementById('saveEditedResourceBtn')
  if (saveEditedResourceBtn) {
    saveEditedResourceBtn.addEventListener('click', saveEditedResource)
  }

  const closeConfirmResourceDialogBtn = document.getElementById('closeConfirmResourceDialogBtn')
  if (closeConfirmResourceDialogBtn) {
    closeConfirmResourceDialogBtn.addEventListener('click', closeConfirmResourceDialog)
  }

  const confirmDeleteResourceBtn = document.getElementById('confirmDeleteResourceBtn')
  if (confirmDeleteResourceBtn) {
    confirmDeleteResourceBtn.addEventListener('click', confirmDeleteResource)
  }

  const addLinkBtn = document.getElementById('addLinkBtn')
  if (addLinkBtn) {
    addLinkBtn.addEventListener('click', addLink)
  }

  const addResourceBtn = document.getElementById('addResourceBtn')
  if (addResourceBtn) {
    addResourceBtn.addEventListener('click', addResource)
  }

  const defaultWallpaperOption = document.getElementById('defaultWallpaperOption')
  if (defaultWallpaperOption) {
    defaultWallpaperOption.addEventListener('click', () => setWallpaper('default'))
  }
  const gradient1WallpaperOption = document.getElementById('gradient1WallpaperOption')
  if (gradient1WallpaperOption) {
    gradient1WallpaperOption.addEventListener('click', () => setWallpaper('gradient1'))
  }
  const gradient2WallpaperOption = document.getElementById('gradient2WallpaperOption')
  if (gradient2WallpaperOption) {
    gradient2WallpaperOption.addEventListener('click', () => setWallpaper('gradient2'))
  }
  const gradient3WallpaperOption = document.getElementById('gradient3WallpaperOption')
  if (gradient3WallpaperOption) {
    gradient3WallpaperOption.addEventListener('click', () => setWallpaper('gradient3'))
  }
  const gradient4WallpaperOption = document.getElementById('gradient4WallpaperOption')
  if (gradient4WallpaperOption) {
    gradient4WallpaperOption.addEventListener('click', () => setWallpaper('gradient4'))
  }
  const gradient5WallpaperOption = document.getElementById('gradient5WallpaperOption')
  if (gradient5WallpaperOption) {
    gradient5WallpaperOption.addEventListener('click', () => setWallpaper('gradient5'))
  }

  const randomColorsBtn = document.getElementById('randomColorsBtn')
  if (randomColorsBtn) {
    randomColorsBtn.addEventListener('click', randomColors)
  }

  const applyCustomGradientBtn = document.getElementById('applyCustomGradientBtn')
  if (applyCustomGradientBtn) {
    applyCustomGradientBtn.addEventListener('click', applyCustomGradient)
  }

  const setCustomWallpaperBtn = document.getElementById('setCustomWallpaperBtn')
  if (setCustomWallpaperBtn) {
    setCustomWallpaperBtn.addEventListener('click', setCustomWallpaper)
  }

  const saveDataConfigBtn = document.getElementById('saveDataConfigBtn')
  if (saveDataConfigBtn) {
    saveDataConfigBtn.addEventListener('click', saveDataConfig)
  }

  const applyDataFromURLBtn = document.getElementById('applyDataFromURLBtn')
  if (applyDataFromURLBtn) {
    applyDataFromURLBtn.addEventListener('click', applyDataFromURL)
  }

  const engineDropdown = document.getElementById('engineDropdown')
  if (engineDropdown) {
    engineDropdown.addEventListener('click', function(event: Event) {
      const engineOption = (event.target as HTMLElement).closest('.engine-option')
      if (engineOption) {
        const engine = engineOption.getAttribute('data-engine')
        const displayName = engineOption.getAttribute('data-display-name')
        
        if (engine && displayName) {
          selectEngine(engine, displayName)
        }
      }
    })
  }
}