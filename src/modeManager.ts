import { Mode } from './types'
import { selectEngine, updateEngineDropdown } from "./engineManager"

let currentMode: Mode = "search"
let currentEngine: string = "google"

function setCurrentEngine(engine: string): void {
  currentEngine = engine
}

// 从 localStorage 加载默认引擎设置
function loadDefaultEngines(): Record<Mode, { engine: string; displayName: string }> {
  const saved = localStorage.getItem("modeDefaultEngines")
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch { localStorage.removeItem("modeDefaultEngines") }
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

function switchMode(mode: Mode): void {
  currentMode = mode

  const defaults = modeDefaultEngine[mode]
  selectEngine(defaults.engine, defaults.displayName)
  updateEngineDropdown()

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
}

export { currentMode, currentEngine, setCurrentEngine, switchMode, setDefaultEngine, getDefaultEngine }