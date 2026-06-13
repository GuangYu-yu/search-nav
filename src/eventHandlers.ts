import { setTheme, toggleThemeSwitcher } from './themeManager'
import { openSettings, closeSettings } from './uiManager'
import { toggleEngineDropdown, selectEngine } from './engineManager'
import { cycleMode, setModeSwitchAnimating, isModeSwitchAnimating } from './modeManager'
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

function isAnyDialogOpen(): boolean {
  const dialogs = ['confirmDialog', 'editDialog', 'editResourceDialog', 'confirmResourceDialog']
  return dialogs.some(id => {
    const el = document.getElementById(id)
    return el?.classList.contains('show')
  })
}

function onClick(id: string, handler: () => void): void {
  const el = document.getElementById(id)
  if (el) el.addEventListener('click', handler)
}

export function initializeEventHandlers(): void {
  onClick('themeToggleBtn', toggleThemeSwitcher)

  const themeButtons = document.querySelectorAll('.theme-btn')
  themeButtons.forEach(btn => {
    btn.addEventListener('click', function(this: HTMLElement) {
      const theme = this.getAttribute('data-theme')
      if (theme) setTheme(theme)
    })
  })

  onClick('settingsBtn', openSettings)

  const engineSelector = document.getElementById('engineSelector')
  if (engineSelector) {
    let clickCount = 0
    let clickTimer: ReturnType<typeof setTimeout> | null = null

    engineSelector.addEventListener('click', () => {
      if (isModeSwitchAnimating()) return

      clickCount++
      if (clickCount === 1) {
        clickTimer = setTimeout(() => {
          clickCount = 0
          toggleEngineDropdown()
        }, 250)
      } else if (clickCount >= 2) {
        if (clickTimer) {
          clearTimeout(clickTimer)
          clickTimer = null
        }
        clickCount = 0
        const dropdown = document.getElementById('engineDropdown')
        if (dropdown) dropdown.classList.remove('show')
        const suggestionsContainer = document.getElementById('suggestionsContainer')
        if (suggestionsContainer) suggestionsContainer.style.opacity = ""
        setModeSwitchAnimating(true)
        cycleMode()
      }
    })
  }

  onClick('closeSettingsBtn', closeSettings)
  onClick('searchBtn', handleSearch)
  onClick('closeConfirmDialogBtn', closeConfirmDialog)
  onClick('confirmDeleteLinkBtn', confirmDeleteLink)
  onClick('closeEditDialogBtn', closeEditDialog)
  onClick('saveEditedLinkBtn', saveEditedLink)
  onClick('closeEditResourceDialogBtn', closeEditResourceDialog)
  onClick('saveEditedResourceBtn', saveEditedResource)
  onClick('closeConfirmResourceDialogBtn', closeConfirmResourceDialog)
  onClick('confirmDeleteResourceBtn', confirmDeleteResource)
  onClick('addLinkBtn', addLink)
  onClick('addResourceBtn', addResource)

  // 壁纸选项：通过 ID 前缀规则绑定
  const wallpaperMappings: [string, string][] = [
    ['defaultWallpaperOption', 'default'],
    ['gradient1WallpaperOption', 'gradient1'],
    ['gradient2WallpaperOption', 'gradient2'],
    ['gradient3WallpaperOption', 'gradient3'],
    ['gradient4WallpaperOption', 'gradient4'],
    ['gradient5WallpaperOption', 'gradient5'],
  ]
  wallpaperMappings.forEach(([id, type]) => {
    const el = document.getElementById(id)
    if (el) el.addEventListener('click', () => setWallpaper(type))
  })

  onClick('randomColorsBtn', randomColors)
  onClick('applyCustomGradientBtn', applyCustomGradient)
  onClick('setCustomWallpaperBtn', setCustomWallpaper)
  onClick('saveDataConfigBtn', saveDataConfig)
  onClick('applyDataFromURLBtn', applyDataFromURL)

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

  // ESC 关闭设置面板和对话框
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      if (isAnyDialogOpen()) {
        closeConfirmDialog()
        closeEditDialog()
        closeEditResourceDialog()
        closeConfirmResourceDialog()
      } else {
        const modal = document.getElementById('settingsModal')
        if (modal?.classList.contains('show')) {
          closeSettings()
        }
      }
    }
  })

  // 遮罩点击关闭设置面板
  const settingsModal = document.getElementById('settingsModal')
  if (settingsModal) {
    settingsModal.addEventListener('click', (e: Event) => {
      if (e.target === settingsModal) {
        closeSettings()
      }
    })
  }

  // 遮罩点击关闭对话框
  const dialogIds = ['confirmDialog', 'editDialog', 'editResourceDialog', 'confirmResourceDialog']
  const closeFuncs: Record<string, () => void> = {
    confirmDialog: closeConfirmDialog,
    editDialog: closeEditDialog,
    editResourceDialog: closeEditResourceDialog,
    confirmResourceDialog: closeConfirmResourceDialog
  }
  dialogIds.forEach(id => {
    const dialog = document.getElementById(id)
    if (dialog) {
      dialog.addEventListener('click', (e: Event) => {
        if (e.target === dialog) {
          closeFuncs[id]()
        }
      })
    }
  })
}