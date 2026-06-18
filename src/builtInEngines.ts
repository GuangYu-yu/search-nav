import { Mode } from './types'
import { setDefaultEngine, getDefaultEngine, currentMode } from './modeManager'
import { searchEngines, translateEngines, resourceEngines } from './searchEngines'
import { findDropTarget, applyDropIndicator, clearDropIndicators } from './dragDropUtils'

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

function showEditEngineDialog(engineId: string, mode: Mode): void {
  pendingEditEngineId = engineId
  pendingEditMode = mode

  const engines = getEngineListForMode(mode)
  const engine = engines.find(e => e.id === engineId)
  if (!engine) return

  const isBuiltIn = engine.builtIn

  // 标题
  const title = document.getElementById("editEngineTitle")
  if (title) title.textContent = isBuiltIn ? "编辑图标" : "编辑引擎"

  // 名称：内置引擎只读
  const nameInput = document.getElementById("editEngineName") as HTMLInputElement
  if (nameInput) {
    nameInput.value = engine.name
    nameInput.readOnly = isBuiltIn
    nameInput.style.opacity = isBuiltIn ? "0.5" : ""
  }

  // URL：内置引擎隐藏
  const urlGroup = document.getElementById("editEngineUrlGroup")
  const urlInput = document.getElementById("editEngineUrl") as HTMLInputElement
  if (isBuiltIn) {
    if (urlGroup) urlGroup.style.display = "none"
  } else {
    if (urlGroup) urlGroup.style.display = ""
    const custom = loadCustomEngines().find(e => e.id === engineId)
    if (urlInput) urlInput.value = custom?.url || ""
  }

  // 图标URL
  const iconInput = document.getElementById("editEngineIconUrl") as HTMLInputElement
  if (iconInput) {
    const faviconOverrides = loadCustomFaviconOverrides()
    if (isBuiltIn) {
      iconInput.value = faviconOverrides[engineId] || ""
    } else {
      const custom = loadCustomEngines().find(e => e.id === engineId)
      iconInput.value = custom?.faviconUrl || ""
    }
  }

  // 设为默认复选框
  const defaultCheckbox = document.getElementById("editEngineSetDefault") as HTMLInputElement
  if (defaultCheckbox) {
    const currentDefault = getDefaultEngine(mode)
    defaultCheckbox.checked = currentDefault.engine === engineId
  }

  // 删除按钮：内置引擎不可删除
  const deleteBtn = document.getElementById("deleteEngineBtn")
  if (deleteBtn) {
    (deleteBtn as HTMLElement).style.display = isBuiltIn ? "none" : ""
  }

  const dialog = document.getElementById("editEngineDialog")
  if (dialog) dialog.classList.add("show")
}

function hideEditEngineDialog(): void {
  const dialog = document.getElementById("editEngineDialog")
  if (dialog) dialog.classList.remove("show")
  pendingEditEngineId = null
  pendingEditMode = null
}

function hideEditFaviconDialog(): void {
  const dialog = document.getElementById("editFaviconDialog")
  if (dialog) dialog.classList.remove("show")
}

function saveEditEngine(): void {
  if (!pendingEditEngineId || !pendingEditMode) return

  const engineId = pendingEditEngineId
  const mode = pendingEditMode

  const isBuiltIn = getEngineListForMode(mode).find(e => e.id === engineId)?.builtIn ?? false

  if (isBuiltIn) {
    // 内置引擎：只更新图标覆盖
    const iconInput = document.getElementById("editEngineIconUrl") as HTMLInputElement
    const newUrl = iconInput?.value.trim() ?? ""
    const faviconOverrides = loadCustomFaviconOverrides()
    if (newUrl === "") {
      delete faviconOverrides[engineId]
    } else {
      faviconOverrides[engineId] = newUrl
    }
    saveCustomFaviconOverrides(faviconOverrides)
  } else {
    // 自定义引擎：更新名称、URL、图标
    const nameInput = document.getElementById("editEngineName") as HTMLInputElement
    const urlInput = document.getElementById("editEngineUrl") as HTMLInputElement
    const iconInput = document.getElementById("editEngineIconUrl") as HTMLInputElement
    const newName = nameInput?.value.trim() || ""
    const newUrl = urlInput?.value.trim() || ""
    const newIcon = iconInput?.value.trim() || ""

    if (!newUrl) {
      import("./toast").then(({ showToast }) => showToast("请填写搜索地址", 'error'))
      return
    }

    let customEngines = loadCustomEngines()
    const idx = customEngines.findIndex(e => e.id === engineId)
    if (idx >= 0) {
      customEngines[idx].name = newName
      customEngines[idx].url = newUrl.startsWith("http") ? newUrl : "https://" + newUrl
      customEngines[idx].faviconUrl = newIcon
      saveCustomEngines(customEngines)
    }
  }

  // 设为默认
  const defaultCheckbox = document.getElementById("editEngineSetDefault") as HTMLInputElement
  if (defaultCheckbox?.checked) {
    const engine = getEngineListForMode(mode).find(e => e.id === engineId)
    if (engine) setDefaultEngine(mode, engineId, engine.name)
  }

  const containerId = mode === "search" ? "searchEngineList"
    : mode === "translate" ? "translateEngineList"
    : "resourceEngineList"

  hideEditEngineDialog()
  renderEngineList(containerId, mode)
  updateDefaultLabel(mode)

  // 同步搜索框
  if (mode === currentMode) {
    import("./engineManager").then(({ updateEngineDropdown }) => updateEngineDropdown())
  }
}

function deleteEditedEngine(): void {
  if (!pendingEditEngineId || !pendingEditMode) return
  const engineId = pendingEditEngineId
  const mode = pendingEditMode
  hideEditEngineDialog()
  showDeleteEngineDialog(engineId, mode)
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
  // 编辑引擎弹窗
  const closeEditEngineBtn = document.getElementById("closeEditEngineBtn")
  const saveEditEngineBtn = document.getElementById("saveEditEngineBtn")
  const deleteEngineBtn = document.getElementById("deleteEngineBtn")
  if (closeEditEngineBtn) closeEditEngineBtn.addEventListener("click", hideEditEngineDialog)
  if (saveEditEngineBtn) saveEditEngineBtn.addEventListener("click", saveEditEngine)
  if (deleteEngineBtn) deleteEngineBtn.addEventListener("click", deleteEditedEngine)

  // 编辑图标弹窗（保留旧弹窗兼容性）
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

  // 遮罩关闭
  const editEngineDialog = document.getElementById("editEngineDialog")
  if (editEngineDialog) {
    editEngineDialog.addEventListener("click", (e) => {
      if (e.target === editEngineDialog) hideEditEngineDialog()
    })
  }
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

  let engines = getEngineListForMode(mode)

  // 应用自定义排序
  const order = loadEngineOrder(mode)
  if (order.length > 0) {
    const orderMap = new Map(order.map((id, i) => [id, i]))
    engines = [...engines].sort((a, b) => {
      const ai = orderMap.get(a.id)
      const bi = orderMap.get(b.id)
      if (ai !== undefined && bi !== undefined) return ai - bi
      if (ai !== undefined) return -1
      if (bi !== undefined) return 1
      return 0
    })
  }

  const currentDefault = getDefaultEngine(mode)
  const faviconOverrides = loadCustomFaviconOverrides()
  const customEngines = loadCustomEngines()
  container.innerHTML = ""

  engines.forEach((engine) => {
    const item = document.createElement("div")
    const isActive = engine.id === currentDefault.engine
    item.className = "engine-item" + (isActive ? " active" : "")
    item.setAttribute("data-engine", engine.id)
    item.setAttribute("data-mode", mode)
    item.draggable = true

    // 图标渲染
    const overrideUrl = faviconOverrides[engine.id]
    let iconHtml: string
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
    `

    // 点击打开编辑弹窗
    item.addEventListener("click", () => {
      if (item.classList.contains("dragging")) return
      showEditEngineDialog(engine.id, mode)
    })

    // 拖拽
    setupEngineDrag(item, container, mode)

    container.appendChild(item)
  })

  // 容器级 dragover/drop
  container.addEventListener("dragover", (e) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = "move"
    const target = findDropTarget(e.clientX, e.clientY, container, ".engine-item")
    if (target) {
      applyDropIndicator(container, target.item, target.position)
    }
  })

  container.addEventListener("drop", (e) => {
    e.preventDefault()
    const fromId = e.dataTransfer!.getData("text/plain")
    const target = findDropTarget(e.clientX, e.clientY, container, ".engine-item")
    clearDropIndicators(container)
    if (target && fromId) {
      const toId = target.item.getAttribute("data-engine")
      if (toId && fromId !== toId) {
        executeEngineDrop(container, mode, fromId, toId, target.position)
      }
    }
  })
}

// 自定义引擎排序
function loadEngineOrder(mode: Mode): string[] {
  const key = `engine_order_${mode}`
  const saved = localStorage.getItem(key)
  if (saved) {
    try { return JSON.parse(saved) } catch { localStorage.removeItem(key) }
  }
  return []
}

function saveEngineOrder(mode: Mode, order: string[]): void {
  localStorage.setItem(`engine_order_${mode}`, JSON.stringify(order))
}

// 引擎拖拽
function setupEngineDrag(item: HTMLElement, container: HTMLElement, mode: Mode): void {
  let ghost: HTMLElement | null = null

  item.addEventListener("dragstart", (e) => {
    ghost = item.cloneNode(true) as HTMLElement
    ghost.style.position = "fixed"
    ghost.style.left = "-9999px"
    ghost.style.top = "-9999px"
    ghost.classList.remove("drag-source", "dragging", "drag-over", "drag-before", "drag-after")
    document.body.appendChild(ghost)
    ghost.offsetHeight
    e.dataTransfer!.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2)
    item.classList.add("drag-source")
    e.dataTransfer!.effectAllowed = "move"
    e.dataTransfer!.setData("text/plain", item.getAttribute("data-engine")!)
  })

  item.addEventListener("dragend", () => {
    ghost?.remove()
    ghost = null
    container.querySelectorAll(".drag-source, .drag-over, .drag-before, .drag-after").forEach(el => {
      el.classList.remove("drag-source", "drag-over", "drag-before", "drag-after")
    })
  })

  // 触摸长按拖拽
  let longPressTimer: ReturnType<typeof setTimeout> | null = null
  let isDragging = false
  let startX = 0, startY = 0

  item.addEventListener("touchstart", (e) => {
    const touch = e.touches[0]
    startX = touch.clientX
    startY = touch.clientY
    isDragging = false
    longPressTimer = setTimeout(() => {
      isDragging = true
      item.classList.add("dragging")
    }, 400)
  }, { passive: true })

  item.addEventListener("touchmove", (e) => {
    if (!isDragging) {
      const touch = e.touches[0]
      if (Math.abs(touch.clientX - startX) > 8 || Math.abs(touch.clientY - startY) > 8) {
        if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
      }
      return
    }
    e.preventDefault()
    const touch = e.touches[0]
    const target = findDropTarget(touch.clientX, touch.clientY, container, ".engine-item")
    if (target) {
      applyDropIndicator(container, target.item, target.position)
    } else {
      clearDropIndicators(container)
    }
  }, { passive: false })

  item.addEventListener("touchend", (e) => {
    if (longPressTimer) { clearTimeout(longPressTimer); longPressTimer = null }
    if (!isDragging) return
    isDragging = false
    item.classList.remove("dragging")
    const touch = e.changedTouches[0]
    const target = findDropTarget(touch.clientX, touch.clientY, container, ".engine-item")
    clearDropIndicators(container)
    if (!target) return

    const fromId = item.getAttribute("data-engine")!
    const toId = target.item.getAttribute("data-engine")!
    if (fromId === toId) return
    executeEngineDrop(container, mode, fromId, toId, target.position)
  })
}

function executeEngineDrop(
  container: HTMLElement,
  mode: Mode,
  fromId: string,
  toId: string,
  position: 'before' | 'over' | 'after'
): void {
  const allItems = [...container.querySelectorAll<HTMLElement>(".engine-item")]
  const sourceEl = allItems.find(el => el.getAttribute("data-engine") === fromId)
  const targetEl = allItems.find(el => el.getAttribute("data-engine") === toId)
  if (!sourceEl || !targetEl) return

  if (position === 'over') {
    // 交换位置
    const placeholder = document.createTextNode("")
    targetEl.replaceWith(placeholder)
    sourceEl.replaceWith(targetEl)
    placeholder.replaceWith(sourceEl)
  } else if (position === 'before') {
    container.insertBefore(sourceEl, targetEl)
  } else {
    const afterTarget = targetEl.nextSibling
    if (afterTarget) {
      container.insertBefore(sourceEl, afterTarget)
    } else {
      container.appendChild(sourceEl)
    }
  }

  // 保存新顺序
  const newOrder = [...container.querySelectorAll<HTMLElement>(".engine-item")]
    .map(el => el.getAttribute("data-engine")!)
    .filter(Boolean)
  saveEngineOrder(mode, newOrder)

  // 重新渲染以同步 active 状态和 data 属性
  const containerId = mode === "search" ? "searchEngineList"
    : mode === "translate" ? "translateEngineList"
    : "resourceEngineList"
  renderEngineList(containerId, mode)
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

export { initBuiltInEngines, addCustomEngine, loadCustomEngines, loadCustomFaviconOverrides, getEngineListForMode, resolveEngineUrl, hideEditEngineDialog, hideDeleteEngineDialog, renderEngineList, updateDefaultLabel }