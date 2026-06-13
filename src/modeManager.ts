import { Mode } from './types'
import { selectEngine, updateEngineDropdown } from "./engineManager"

let modeSwitchAnimating = false

export function setModeSwitchAnimating(val: boolean): void { modeSwitchAnimating = val }
export function isModeSwitchAnimating(): boolean { return modeSwitchAnimating }

let currentMode: Mode = "search"
let currentEngine: string = "google"

function setCurrentEngine(engine: string): void {
  currentEngine = engine
}

const modeCycle: Mode[] = ["search", "translate", "resource"]

// 从 localStorage 加载默认引擎设置
function loadDefaultEngines(): Record<Mode, { engine: string; displayName: string }> {
  const saved = localStorage.getItem("modeDefaultEngines")
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch { /* ignore */ }
  }
  return {
    search: { engine: "google", displayName: "Google" },
    translate: { engine: "google", displayName: "Google翻译" },
    resource: { engine: "bilibili", displayName: "哔哩哔哩" }
  }
}

let modeDefaultEngine: Record<Mode, { engine: string; displayName: string }> = loadDefaultEngines()

function saveDefaultEngines(): void {
  localStorage.setItem("modeDefaultEngines", JSON.stringify(modeDefaultEngine))
}

function setDefaultEngine(mode: Mode, engine: string, displayName: string): void {
  modeDefaultEngine[mode] = { engine, displayName }
  saveDefaultEngines()
}

function getDefaultEngine(mode: Mode): { engine: string; displayName: string } {
  return modeDefaultEngine[mode]
}

const modeIcons: Record<Mode, string> = {
  search: "fa-search",
  translate: "fa-language",
  resource: "fa-compass"
}

function switchMode(mode: Mode): void {
  currentMode = mode

  const selector = document.querySelector(".engine-selector")
  const icon = selector?.querySelector(".engine-icon") as HTMLElement | null
  const indicator = document.getElementById("modeIndicator")

  // 先显示模式指示器图标
  if (indicator && icon) {
    const iconEl = indicator.querySelector("i")
    if (iconEl) {
      iconEl.className = "fas " + modeIcons[mode]
    }
    // 隐藏引擎图标，显示模式指示器
    icon.style.opacity = "0"
    icon.style.transform = "scale(0.5)"
    indicator.classList.remove("fade-out")
    indicator.classList.add("show")
  }

  const searchInput = document.getElementById("searchQuery") as HTMLInputElement | null
  if (searchInput) {
    if (mode === "translate") {
      searchInput.placeholder = "输入要翻译的文本..."
    } else if (mode === "resource") {
      searchInput.placeholder = "搜索各类资源..."
    } else {
      searchInput.placeholder = "输入搜索内容..."
    }
  }

  // 延迟后切换到引擎图标
  setTimeout(() => {
    const defaults = modeDefaultEngine[mode]
    selectEngine(defaults.engine, defaults.displayName)
    updateEngineDropdown()

    // 恢复引擎图标
    if (indicator && icon) {
      indicator.classList.remove("show")
      indicator.classList.add("fade-out")
      icon.style.opacity = ""
      icon.style.transform = ""
      icon.classList.remove("mode-switching")
      void icon.offsetWidth
      icon.classList.add("mode-switching")
    }

    // 引擎图标动画结束后释放锁
    setTimeout(() => {
      setModeSwitchAnimating(false)
    }, 450)
  }, 600)
}

function cycleMode(): void {
  const currentIndex = modeCycle.indexOf(currentMode)
  const nextIndex = (currentIndex + 1) % modeCycle.length
  switchMode(modeCycle[nextIndex])
}

export { currentMode, currentEngine, setCurrentEngine, switchMode, cycleMode, setDefaultEngine, getDefaultEngine }