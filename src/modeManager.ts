import { Mode } from './types'
import { selectEngine, updateEngineDropdown } from "./engineManager"

let currentMode: Mode = "search"
let currentEngine: string = "google"

function setCurrentEngine(engine: string): void {
  currentEngine = engine
}

function switchMode(mode: Mode): void {
  currentMode = mode
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.classList.toggle("active", (btn as HTMLElement).dataset.mode === mode)
  })

  const slider = document.querySelector(".mode-slider") as HTMLElement | null
  if (slider) {
    if (mode === "translate") {
      slider.style.transform = "translateX(100px)"
    } else if (mode === "resource") {
      slider.style.transform = "translateX(200px)"
    } else {
      slider.style.transform = "translateX(0)"
    }
  }

  const searchInput = document.getElementById("searchQuery") as HTMLInputElement | null
  if (searchInput) {
    if (mode === "translate") {
      searchInput.placeholder = "输入要翻译的文本..."
      selectEngine("google", "Google翻译")
      updateEngineDropdown()
    } else if (mode === "resource") {
      searchInput.placeholder = "搜索各类资源..."
      selectEngine("bilibili", "哔哩哔哩")
      updateEngineDropdown()
    } else {
      searchInput.placeholder = "输入搜索内容..."
      selectEngine("google", "Google")
      updateEngineDropdown()
    }
  }
}

export { currentMode, currentEngine, setCurrentEngine, switchMode }