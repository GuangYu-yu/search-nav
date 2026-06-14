import { Mode } from './types'
import { setDefaultEngine, getDefaultEngine, currentMode } from './modeManager'
import { searchEngines, translateEngines, resourceEngines } from './searchEngines'

interface EngineInfo {
  id: string
  name: string
  builtIn: boolean
  faviconUrl?: string
}

const searchEngineList: EngineInfo[] = [
  { id: "google", name: "Google", builtIn: true },
  { id: "bing", name: "Bing", builtIn: true },
  { id: "baidu", name: "百度", builtIn: true },
  { id: "yandex", name: "Yandex", builtIn: true },
  { id: "duckduckgo", name: "DuckDuckGo", builtIn: true },
  { id: "ecosia", name: "Ecosia", builtIn: true },
  { id: "yahoo", name: "Yahoo!", builtIn: true },
  { id: "brave", name: "Brave", builtIn: true },
  { id: "qwant", name: "Qwant", builtIn: true },
  { id: "aol", name: "AOL", builtIn: true }
]

const translateEngineList: EngineInfo[] = [
  { id: "google", name: "Google翻译", builtIn: true },
  { id: "bing", name: "Bing翻译", builtIn: true },
  { id: "deepl", name: "DeepL", builtIn: true },
  { id: "baidu", name: "百度翻译", builtIn: true },
  { id: "yandex", name: "Yandex翻译", builtIn: true }
]

const resourceEngineList: EngineInfo[] = [
  { id: "zhihu", name: "知乎", builtIn: true },
  { id: "wikipedia", name: "Wikipedia", builtIn: true },
  { id: "weibo", name: "微博", builtIn: true },
  { id: "xiaohongshu", name: "小红书", builtIn: true },
  { id: "reddit", name: "Reddit", builtIn: true },
  { id: "x", name: "X", builtIn: true },
  { id: "bilibili", name: "哔哩哔哩", builtIn: true },
  { id: "douyin", name: "抖音", builtIn: true },
  { id: "kuaishou", name: "快手", builtIn: true },
  { id: "taobao", name: "淘宝", builtIn: true },
  { id: "amazon", name: "Amazon", builtIn: true },
  { id: "jingdong", name: "京东", builtIn: true }
]

// 自定义引擎存储
interface CustomEngine {
  id: string
  name: string
  url: string
  faviconUrl: string
  category: Mode
}

function loadCustomEngines(): CustomEngine[] {
  const saved = localStorage.getItem("customEngines")
  if (saved) {
    try { return JSON.parse(saved) } catch { localStorage.removeItem("customEngines") }
  }
  return []
}

function saveCustomEngines(engines: CustomEngine[]): void {
  localStorage.setItem("customEngines", JSON.stringify(engines))
}

// 自定义图标URL存储（内置引擎的图标覆盖）
function loadCustomFaviconOverrides(): Record<string, string> {
  const saved = localStorage.getItem("customFaviconOverrides")
  if (saved) {
    try { return JSON.parse(saved) } catch { localStorage.removeItem("customFaviconOverrides") }
  }
  return {}
}

function saveCustomFaviconOverrides(overrides: Record<string, string>): void {
  localStorage.setItem("customFaviconOverrides", JSON.stringify(overrides))
}

function getEngineListForMode(mode: Mode): EngineInfo[] {
  const base = mode === "search" ? searchEngineList
    : mode === "translate" ? translateEngineList
    : resourceEngineList

  const customEngines = loadCustomEngines().filter(e => e.category === mode)
  const customInfos: EngineInfo[] = customEngines.map(e => ({
    id: e.id,
    name: e.name,
    builtIn: false,
    faviconUrl: e.faviconUrl
  }))

  return [...base, ...customInfos]
}

// 根据引擎ID和模式解析搜索URL（不修改原始常量对象）
function resolveEngineUrl(engineId: string, mode: Mode): string {
  // 内置引擎
  if (mode === "search" && searchEngines[engineId]) return searchEngines[engineId]
  if (mode === "translate" && translateEngines[engineId]) return translateEngines[engineId]
  if (mode === "resource" && resourceEngines[engineId]) return resourceEngines[engineId]

  // 自定义引擎
  const custom = loadCustomEngines().find(e => e.id === engineId)
  if (custom) return custom.url

  // navResources 的 custom_${index} 格式
  if (engineId.startsWith("custom_")) {
    const index = parseInt(engineId.replace("custom_", ""))
    const saved = localStorage.getItem("navResources")
    if (saved) {
      try {
        const arr = JSON.parse(saved) as { url: string }[]
        if (index >= 0 && index < arr.length) return arr[index].url
      } catch { /* ignore */ }
    }
  }

  return ""
}

// 弹窗状态
let pendingEditEngineId: string | null = null
let pendingEditMode: Mode | null = null
let pendingDeleteEngineId: string | null = null
let pendingDeleteMode: Mode | null = null

function showEditFaviconDialog(engineId: string, mode: Mode): void {
  pendingEditEngineId = engineId
  pendingEditMode = mode
  const faviconOverrides = loadCustomFaviconOverrides()
  const input = document.getElementById("editFaviconUrl") as HTMLInputElement
  if (input) input.value = faviconOverrides[engineId] || ""
  const dialog = document.getElementById("editFaviconDialog")
  if (dialog) dialog.classList.add("show")
}

function hideEditFaviconDialog(): void {
  const dialog = document.getElementById("editFaviconDialog")
  if (dialog) dialog.classList.remove("show")
  pendingEditEngineId = null
  pendingEditMode = null
}

function showDeleteEngineDialog(engineId: string, mode: Mode): void {
  pendingDeleteEngineId = engineId
  pendingDeleteMode = mode
  const dialog = document.getElementById("confirmDeleteEngineDialog")
  if (dialog) dialog.classList.add("show")
}

function hideDeleteEngineDialog(): void {
  const dialog = document.getElementById("confirmDeleteEngineDialog")
  if (dialog) dialog.classList.remove("show")
  pendingDeleteEngineId = null
  pendingDeleteMode = null
}

function setupDialogListeners(): void {
  // 编辑图标弹窗
  const closeEditBtn = document.getElementById("closeEditFaviconBtn")
  const saveEditBtn = document.getElementById("saveEditFaviconBtn")
  if (closeEditBtn) closeEditBtn.addEventListener("click", hideEditFaviconDialog)
  if (saveEditBtn) {
    saveEditBtn.addEventListener("click", () => {
      if (!pendingEditEngineId || !pendingEditMode) return
      const input = document.getElementById("editFaviconUrl") as HTMLInputElement
      const newUrl = input?.value.trim() ?? ""
      const faviconOverrides = loadCustomFaviconOverrides()
      if (newUrl === "") {
        delete faviconOverrides[pendingEditEngineId]
      } else {
        faviconOverrides[pendingEditEngineId] = newUrl
      }
      saveCustomFaviconOverrides(faviconOverrides)
      const mode = pendingEditMode
      const engineId = pendingEditEngineId
      hideEditFaviconDialog()
      const containerId = mode === "search" ? "searchEngineList"
        : mode === "translate" ? "translateEngineList"
        : "resourceEngineList"
      renderEngineList(containerId, mode)

      // 同步搜索框图标
      const currentDefault = getDefaultEngine(mode)
      if (mode === currentMode && currentDefault.engine === engineId) {
        import("./engineManager").then(({ selectEngine }) => {
          selectEngine(engineId!, currentDefault.displayName)
        })
      }
    })
  }

  // 删除引擎弹窗
  const closeDeleteBtn = document.getElementById("closeDeleteEngineBtn")
  const confirmDeleteBtn = document.getElementById("confirmDeleteEngineBtn")
  if (closeDeleteBtn) closeDeleteBtn.addEventListener("click", hideDeleteEngineDialog)
  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", () => {
      if (!pendingDeleteEngineId || !pendingDeleteMode) return
      const engineId = pendingDeleteEngineId
      const mode = pendingDeleteMode
      hideDeleteEngineDialog()

      let customEngines = loadCustomEngines()
      customEngines = customEngines.filter(e => e.id !== engineId)
      saveCustomEngines(customEngines)

      // 如果删除的是当前默认引擎，修正为列表第一个
      const currentDefault = getDefaultEngine(mode)
      if (currentDefault.engine === engineId) {
        const remaining = getEngineListForMode(mode)
        if (remaining.length > 0) {
          setDefaultEngine(mode, remaining[0].id, remaining[0].name)
        }
      }

      const containerId = mode === "search" ? "searchEngineList"
        : mode === "translate" ? "translateEngineList"
        : "resourceEngineList"
      renderEngineList(containerId, mode)
      updateDefaultLabel(mode)
    })
  }

  // 点击遮罩关闭
  const editDialog = document.getElementById("editFaviconDialog")
  if (editDialog) {
    editDialog.addEventListener("click", (e) => {
      if (e.target === editDialog) hideEditFaviconDialog()
    })
  }
  const deleteDialog = document.getElementById("confirmDeleteEngineDialog")
  if (deleteDialog) {
    deleteDialog.addEventListener("click", (e) => {
      if (e.target === deleteDialog) hideDeleteEngineDialog()
    })
  }
}

function renderEngineList(
  containerId: string,
  mode: Mode
): void {
  const container = document.getElementById(containerId)
  if (!container) return

  const engines = getEngineListForMode(mode)
  const currentDefault = getDefaultEngine(mode)
  const faviconOverrides = loadCustomFaviconOverrides()
  const customEngines = loadCustomEngines()
  container.innerHTML = ""

  engines.forEach(engine => {
    const item = document.createElement("div")
    const isActive = engine.id === currentDefault.engine
    item.className = "engine-item" + (isActive ? " active" : "")

    // 图标渲染
    let iconHtml: string
    const overrideUrl = faviconOverrides[engine.id]
    if (overrideUrl) {
      iconHtml = `<div class="engine-icon" style="background-image: url('${overrideUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`
    } else if (engine.builtIn) {
      iconHtml = `<div class="engine-icon ${engine.id}-icon"></div>`
    } else {
      const custom = customEngines.find(e => e.id === engine.id)
      const faviconUrl = custom?.faviconUrl || ""
      iconHtml = faviconUrl
        ? `<div class="engine-icon" style="background-image: url('${faviconUrl}'); background-size: contain; background-repeat: no-repeat; background-position: center;"></div>`
        : `<div class="engine-icon" style="background: rgba(255,255,255,0.1); display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--text-secondary);">${engine.name.charAt(0)}</div>`
    }

    item.innerHTML = `
      ${iconHtml}
      <span class="engine-name">${engine.name}</span>
      <i class="fas fa-pen engine-check" title="编辑图标"></i>
      ${!engine.builtIn ? '<i class="fas fa-trash engine-delete" title="删除"></i>' : ''}
    `

    // 点击设为默认
    item.addEventListener("click", (e) => {
      const target = e.target as HTMLElement
      // 如果点击的是铅笔图标，打开编辑图标弹窗
      if (target.classList.contains("engine-check")) {
        e.stopPropagation()
        showEditFaviconDialog(engine.id, mode)
        return
      }
      // 如果点击的是删除图标
      if (target.classList.contains("engine-delete")) {
        e.stopPropagation()
        showDeleteEngineDialog(engine.id, mode)
        return
      }
      setDefaultEngine(mode, engine.id, engine.name)
      renderEngineList(containerId, mode)
      updateDefaultLabel(mode)
    })

    container.appendChild(item)
  })
}

function addCustomEngine(name: string, url: string, faviconUrl: string, category: Mode): void {
  const customEngines = loadCustomEngines()
  const id = `custom_${Date.now()}`
  customEngines.push({ id, name, url, faviconUrl, category })
  saveCustomEngines(customEngines)

  const containerId = category === "search" ? "searchEngineList"
    : category === "translate" ? "translateEngineList"
    : "resourceEngineList"
  renderEngineList(containerId, category)
  updateDefaultLabel(category)
}

function updateDefaultLabel(mode: Mode): void {
  const currentDefault = getDefaultEngine(mode)
  const labelId = mode === "search" ? "searchEngineDefault"
    : mode === "translate" ? "translateEngineDefault"
    : "resourceEngineDefault"
  const label = document.getElementById(labelId)
  if (label) {
    label.textContent = currentDefault.displayName
  }
}

function setupSectionToggle(headerId: string): void {
  const header = document.getElementById(headerId)
  if (!header) return

  header.addEventListener("click", () => {
    const section = header.closest(".engine-section")
    if (section) {
      section.classList.toggle("expanded")
    }
  })
}

function initBuiltInEngines(): void {
  // 渲染引擎列表
  renderEngineList("searchEngineList", "search")
  renderEngineList("translateEngineList", "translate")
  renderEngineList("resourceEngineList", "resource")

  // 更新默认标签
  updateDefaultLabel("search")
  updateDefaultLabel("translate")
  updateDefaultLabel("resource")

  // 设置展开/折叠
  setupSectionToggle("searchEngineHeader")
  setupSectionToggle("translateEngineHeader")
  setupSectionToggle("resourceEngineHeader")

  // 设置弹窗事件
  setupDialogListeners()
}

export { initBuiltInEngines, addCustomEngine, loadCustomEngines, loadCustomFaviconOverrides, getEngineListForMode, resolveEngineUrl }