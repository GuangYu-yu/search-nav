import { currentMode, setCurrentEngine } from './modeManager'
import { resources } from './dataManager'
import { loadCustomEngines, loadCustomFaviconOverrides, getEngineListForMode } from './builtInEngines'

function updateEngineDropdown(): void {
  const dropdown = document.getElementById("engineDropdown")
  if (!dropdown) return
  
  dropdown.innerHTML = ""

  const faviconOverrides = loadCustomFaviconOverrides()

  function iconHtml(id: string, builtIn: boolean, faviconUrl?: string): string {
    const override = faviconOverrides[id]
    if (override) {
      return `<div class="engine-icon" style="background-image: url('${override}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`
    }
    if (builtIn) {
      return `<div class="engine-icon ${id}-icon"></div>`
    }
    return `<div class="engine-icon" style="background-image: url('${faviconUrl || defaultFaviconSvg()}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`
  }

  const builtInEngines = getEngineListForMode(currentMode).filter(e => e.builtIn)
  const customEngines = getEngineListForMode(currentMode).filter(e => !e.builtIn)
  let html = ""

  builtInEngines.forEach(engine => {
    html += `<div class="engine-option" data-engine="${engine.id}" data-display-name="${engine.name}">
      ${iconHtml(engine.id, engine.builtIn, engine.faviconUrl)}
      <span class="engine-name">${engine.name}</span>
    </div>`
  })

  // 资源模式：在内置引擎之后、自定义引擎之前插入 navResources
  if (currentMode === "resource") {
    resources.forEach((resource, index) => {
      const engineId = `custom_${index}`
      html += `<div class="engine-option" data-engine="${engineId}" data-display-name="${resource.name}">
        ${iconHtml(engineId, false, resource.faviconUrl)}
        <span class="engine-name">${resource.name}</span>
      </div>`
    })
  }

  customEngines.forEach(engine => {
    html += `<div class="engine-option" data-engine="${engine.id}" data-display-name="${engine.name}">
      ${iconHtml(engine.id, engine.builtIn, engine.faviconUrl)}
      <span class="engine-name">${engine.name}</span>
    </div>`
  })

  dropdown.innerHTML = html
}

function defaultFaviconSvg(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E'
}

function toggleEngineDropdown(): void {
  const dropdown = document.getElementById("engineDropdown")
  const suggestionsContainer = document.getElementById("suggestionsContainer")

  dropdown?.classList.toggle("show")

  if (dropdown?.classList.contains("show")) {
    if (suggestionsContainer) suggestionsContainer.style.opacity = "0.3"
  } else {
    if (suggestionsContainer) suggestionsContainer.style.opacity = ""
  }
}

function selectEngine(engine: string, displayName: string): void {
  setCurrentEngine(engine)
  const selector = document.querySelector(".engine-selector")
  if (!selector) return
  
  const icon = selector.querySelector(".engine-icon") as HTMLElement | null
  const nameSpan = selector.querySelector(".engine-name") as HTMLElement | null

  // 检查是否是自定义引擎
  const customEngines = loadCustomEngines()
  const customEngine = customEngines.find(e => e.id === engine)
  
  if (customEngine) {
    // 自定义引擎：使用其 favicon
    if (icon) {
      icon.className = "engine-icon"
      icon.style.backgroundImage = `url('${
        customEngine.faviconUrl || defaultFaviconSvg()
      }')`
      icon.style.backgroundSize = "contain"
      icon.style.backgroundRepeat = "no-repeat"
      icon.style.backgroundPosition = "center"
    }
  } else if (currentMode === "resource" && engine.startsWith("custom_")) {
    // navResources 中的资源项
    const index = parseInt(engine.replace("custom_", ""))
    if (index >= 0 && index < resources.length) {
      const resource = resources[index]
      if (icon) {
        icon.className = "engine-icon"
        icon.style.backgroundImage = `url('${
          resource.faviconUrl ||
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="8" y="12" font-size="12" text-anchor="middle" fill="%23666">📂</text></svg>'
        }')`
        icon.style.backgroundSize = ""
        icon.style.backgroundRepeat = ""
        icon.style.backgroundPosition = ""
      }
    }
  } else {
    // 内置引擎
    const faviconOverrides = loadCustomFaviconOverrides()
    const overrideUrl = faviconOverrides[engine]
    
    if (icon) {
      if (overrideUrl) {
        icon.className = "engine-icon"
        icon.style.backgroundImage = `url('${overrideUrl}')`
        icon.style.backgroundSize = "contain"
        icon.style.backgroundRepeat = "no-repeat"
        icon.style.backgroundPosition = "center"
      } else {
        icon.className = "engine-icon " + engine + "-icon"
        icon.style.backgroundImage = ""
        icon.style.backgroundSize = ""
        icon.style.backgroundRepeat = ""
        icon.style.backgroundPosition = ""
      }
    }
  }

  if (nameSpan) {
    nameSpan.textContent = displayName
  }

  const dropdown = document.getElementById("engineDropdown")
  if (dropdown) {
    dropdown.classList.remove("show")
    const suggestionsContainer = document.getElementById("suggestionsContainer")
    if (suggestionsContainer) suggestionsContainer.style.opacity = ""
  }
}

export { updateEngineDropdown, toggleEngineDropdown, selectEngine, defaultFaviconSvg }