import { LinkItem, ResourceItem } from './types'
import { links, resources, initializeDataPreview } from './dataManager'
import { getCachedFaviconUrl, getFaviconUrl, formatUrl, clearDomainCache, showEditDialog, showEditResourceDialog, deleteLink, deleteResource } from './linkManager'
import { showToast } from './toast'
import { tryGetWallpaperRenderer, computeBlurTarget } from './wallpaperRenderer'

function loadFaviconAsync(el: HTMLElement, url: string): void {
  const img = new Image()
  img.onload = () => {
    el.style.backgroundImage = `url('${url}')`
    el.classList.add('loaded')
  }
  img.onerror = () => {
    el.classList.add('loaded')
  }
  // 延迟触发加载，优先渲染框架
  requestIdleCallback ? requestIdleCallback(() => { img.src = url }) : setTimeout(() => { img.src = url }, 1)
}

const ITEM_W = 100

function calculateColumns(containerWidth: number): number {
  const gap = 6
  const padding = 12
  const availableWidth = containerWidth - padding
  const maxColumns = Math.max(1, Math.floor((availableWidth + gap) / (ITEM_W + gap)))
  return Math.min(maxColumns, 5)
}

function calculateGridLayout(totalItems: number, maxColumns: number): { columns: number; rows: number } {
  if (totalItems <= maxColumns) {
    return { columns: totalItems, rows: 1 }
  }
  const rows = Math.ceil(totalItems / maxColumns)
  const itemsPerRow = Math.ceil(totalItems / rows)

  return {
    columns: itemsPerRow,
    rows: rows
  }
}

function renderQuickLinks(): void {
  const container = document.getElementById("quickLinksContainer") as HTMLElement | null
  if (!container) return
  
  container.innerHTML = ""
  if (!links.length) return

  const parentWidth = container.parentElement?.clientWidth ?? 800
  const maxColumns = calculateColumns(parentWidth)
  const layout = calculateGridLayout(links.length, maxColumns)
  const gap = computeGap(layout.columns, parentWidth)

  applyGridLayout(container, layout.columns, layout.rows, gap)

  const fragment = document.createDocumentFragment()

  links.forEach((link) => {
    const linkElement = document.createElement("div")
    linkElement.className = "quick-link"
    linkElement.onclick = () => (window.location.href = link.url)

    const icon = document.createElement("div")
    icon.className = "quick-link-icon"
    icon.setAttribute('data-initial', link.name.charAt(0).toUpperCase())

    const faviconUrl = link.faviconUrl || getCachedFaviconUrl(link.url)
    // 异步加载真实 favicon，先展示首字母占位
    loadFaviconAsync(icon, faviconUrl)

    const name = document.createElement("div")
    name.className = "quick-link-name"
    name.textContent = link.name

    linkElement.append(icon, name)
    fragment.appendChild(linkElement)
  })

  container.appendChild(fragment)
  container.classList.toggle("overflowing", layout.rows > 3)
}

function applyGridLayout(container: HTMLElement, columns: number, rows: number, gap: number): void {
  container.style.gridTemplateColumns = `repeat(${columns}, 80px)`
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`
  container.style.columnGap = `${gap}px`
}

// 窗口大小改变时重新计算列数（不重建 DOM）
window.addEventListener("resize", () => {
  const container = document.getElementById("quickLinksContainer")
  if (!container || !links.length) return
  relayoutGrid(container)
})

function relayoutGrid(container: HTMLElement): void {
  const parentWidth = container.parentElement?.clientWidth ?? 800
  const maxColumns = calculateColumns(parentWidth)
  const layout = calculateGridLayout(links.length, maxColumns)
  const gap = computeGap(layout.columns, parentWidth)
  applyGridLayout(container, layout.columns, layout.rows, gap)
  container.classList.toggle("overflowing", layout.rows > 3)
}

// 每行少于5个且容器有余量时扩大间距，下限8px上限48px
function computeGap(cols: number, containerWidth: number): number {
  if (cols <= 1 || cols >= 5) return 8
  const pad = 12
  const availableWidth = containerWidth - pad
  const naturalGap = Math.floor((availableWidth - cols * ITEM_W) / (cols - 1))
  return Math.max(8, Math.min(42, naturalGap))
}

document.addEventListener("click", function (event: Event): void {
  const themeSwitcher = document.getElementById("themeSwitcher")
  const themeToggleBtn = document.querySelector(".theme-toggle-btn")
  const engineDropdown = document.getElementById("engineDropdown")
  const engineSelector = document.querySelector(".engine-selector")

  if (
    themeSwitcher &&
    themeToggleBtn &&
    !themeSwitcher.contains(event.target as Node) &&
    !themeToggleBtn.contains(event.target as Node)
  ) {
    themeSwitcher.classList.remove("show")
  }

  if (
    engineDropdown &&
    engineSelector &&
    !engineDropdown.contains(event.target as Node) &&
    !engineSelector.contains(event.target as Node)
  ) {
    engineDropdown.classList.remove("show")
    const suggestionsContainer = document.getElementById("suggestionsContainer")
    if (suggestionsContainer) suggestionsContainer.style.opacity = ""
  }
})

function openSettings(): void {
  const modal = document.getElementById("settingsModal")
  modal?.classList.add("show")
  document.body.classList.add("settings-modal-open")
  renderLinks()
  const t = computeBlurTarget()
  tryGetWallpaperRenderer()?.setBlur(t.strength, t.brightness, 400)
}

function closeSettings(): void {
  const modal = document.getElementById("settingsModal")
  modal?.classList.remove("show")
  document.body.classList.remove("settings-modal-open")
  const t = computeBlurTarget()
  tryGetWallpaperRenderer()?.setBlur(t.strength, t.brightness, 400)
}

function switchTab(tabName: string): void {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", (btn as HTMLElement).dataset.tab === tabName)
  })

  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.toggle("active", content.id === tabName + "-tab")
  })
}

function renderListItems(containerId: string, items: (LinkItem | ResourceItem)[], type: 'link' | 'resource'): void {
  const container = document.getElementById(containerId)
  if (!container) return
  
  container.innerHTML = ""

  items.forEach((item, index) => {
    const itemElement = document.createElement("div")
    itemElement.className = "link-item"
    itemElement.id = `${type}-${index}`

    const favicon = document.createElement("div")
    favicon.className = "link-favicon"
    const faviconSrc = item.faviconUrl || getCachedFaviconUrl(item.url)
    favicon.style.backgroundImage = `url('${faviconSrc}')`

    const details = document.createElement("div")
    details.className = "link-details"

    const name = document.createElement("div")
    name.className = "link-name"
    name.textContent = item.name

    const url = document.createElement("div")
    url.className = "link-url"
    url.textContent = item.url

    details.appendChild(name)
    details.appendChild(url)

    const actions = document.createElement("div")
    actions.className = "link-actions"

    const editBtn = document.createElement("i")
    editBtn.className = "fas fa-pen link-action-edit"
    editBtn.title = "修改"
    
    const deleteBtn = document.createElement("i")
    deleteBtn.className = "fas fa-trash link-action-delete"
    deleteBtn.title = "删除"

    if (type === "link") {
      editBtn.onclick = () => showEditDialog(index)
      deleteBtn.onclick = () => deleteLink(index)
    } else {
      editBtn.onclick = () => showEditResourceDialog(index)
      deleteBtn.onclick = () => deleteResource(index)
    }

    actions.appendChild(editBtn)
    actions.appendChild(deleteBtn)

    itemElement.appendChild(favicon)
    itemElement.appendChild(details)
    itemElement.appendChild(actions)
    container.appendChild(itemElement)
  })
}

function renderLinks(): void {
  renderListItems("linksContainer", links, "link")
}

function renderResources(): void {
  renderListItems("resourcesContainer", resources, "resource")
}

function saveLink(index: number, name: string, url: string, imageUrl: string = ""): void {
  if (!url) {
    showToast("请填写网站地址", 'error')
    return
  }

  const formattedUrl = formatUrl(url)
  clearDomainCache(links[index].url)
  const faviconUrl = imageUrl || getFaviconUrl(formattedUrl)

  links[index] = { name, url: formattedUrl, faviconUrl }
  localStorage.setItem("navLinks", JSON.stringify(links))

  renderLinks()
  renderQuickLinks()
  initializeDataPreview()
}

function applyFocusTransition(isFocused: boolean): void {
  if (isFocused) {
    document.body.classList.add("search-focused")
  } else {
    document.body.classList.remove("search-focused")
  }
  const t = computeBlurTarget()
  tryGetWallpaperRenderer()?.setBlur(t.strength, t.brightness, 400)
}

export { 
  renderQuickLinks, 
  openSettings, 
  closeSettings, 
  switchTab, 
  renderLinks, 
  renderResources, 
  saveLink, 
  applyFocusTransition 
}