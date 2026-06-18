import { LinkItem } from './types'
import { links, initializeDataPreview } from './dataManager'
import { getCachedFaviconUrl, showEditDialogByType } from './linkManager'
import { tryGetWallpaperRenderer, computeBlurTarget } from './wallpaperRenderer'
import { findDropTarget, applyDropIndicator, clearDropIndicators } from './dragDropUtils'

function loadFaviconAsync(el: HTMLElement, url: string): void {
  const img = new Image()
  img.onload = () => {
    el.style.backgroundImage = `url('${url}')`
    el.classList.add('loaded')
  }
  img.onerror = () => {
    el.classList.add('loaded')
  }
  img.src = url
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

/** 创建书签 DOM（icon + name），图标异步加载 favicon，首字母占位 */
function createBookmarkDOM(link: LinkItem): { item: HTMLElement; icon: HTMLElement; name: HTMLElement } {
  const item = document.createElement("div")
  const icon = document.createElement("div")
  const name = document.createElement("div")

  icon.setAttribute("data-initial", link.name.charAt(0).toUpperCase())
  const faviconUrl = link.faviconUrl || getCachedFaviconUrl(link.url)
  loadFaviconAsync(icon, faviconUrl)

  name.textContent = link.name

  item.append(icon, name)
  return { item, icon, name }
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
    const { item, icon, name } = createBookmarkDOM(link)
    item.className = "quick-link"
    icon.className = "quick-link-icon"
    name.className = "quick-link-name"
    item.onclick = () => (window.location.href = link.url)
    fragment.appendChild(item)
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
  const quickContainer = document.getElementById("quickLinksContainer")
  if (quickContainer && links.length) relayoutGrid(quickContainer)
  const settingsContainer = document.getElementById("linksContainer")
  if (settingsContainer && links.length) syncHomepageLayout(settingsContainer)
})

// 拖拽时：光标不在书签网格区域内时清除所有指示器
document.addEventListener("dragover", (e) => {
  const grid = document.getElementById("linksContainer")
  if (!grid) return
  if (!grid.contains(e.target as Node)) {
    clearDropIndicators(grid)
  }
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

function renderLinks(): void {
  const container = document.getElementById("linksContainer") as HTMLElement | null
  if (!container) return
  
  container.innerHTML = ""

  links.forEach((link, index) => {
    const { item, icon, name } = createBookmarkDOM(link)
    item.className = "bookmark-item"
    icon.className = "bookmark-icon"
    name.className = "bookmark-name"
    item.setAttribute("data-index", String(index))
    item.draggable = true
    container.appendChild(item)

    // 点击进入编辑
    item.addEventListener("click", (e) => {
      if (item.classList.contains("dragging")) return
      e.preventDefault()
      const idx = parseInt(item.getAttribute("data-index")!)
      if (!isNaN(idx)) showEditDialogByType(idx, "link")
    })

    // 拖拽：克隆体补 favicon/首字母确保快照不是空白
    let ghost: HTMLElement | null = null
    item.addEventListener("dragstart", (e) => {
      ghost = item.cloneNode(true) as HTMLElement
      const origIcon = item.querySelector<HTMLElement>(".bookmark-icon")
      const ghostIcon = ghost.querySelector<HTMLElement>(".bookmark-icon")
      if (origIcon && ghostIcon) {
        ghostIcon.style.backgroundImage = getComputedStyle(origIcon).backgroundImage
        if (!origIcon.classList.contains("loaded")) {
          // favicon 没加载完，补首字母占位
          const letter = document.createElement("span")
          letter.textContent = origIcon.getAttribute("data-initial") || ""
          letter.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:600;color:#333;pointer-events:none"
          ghostIcon.appendChild(letter)
        }
      }
      ghost.style.position = "fixed"
      ghost.style.left = "-9999px"
      ghost.style.top = "-9999px"
      ghost.classList.remove("drag-source", "dragging", "drag-over", "drag-before", "drag-after")
      document.body.appendChild(ghost)
      ghost.offsetHeight
      e.dataTransfer!.setDragImage(ghost, ghost.offsetWidth / 2, ghost.offsetHeight / 2)
      item.classList.add("drag-source")
      e.dataTransfer!.effectAllowed = "move"
      e.dataTransfer!.setData("text/plain", item.getAttribute("data-index")!)
    })

    item.addEventListener("dragend", () => {
      ghost?.remove()
      ghost = null
      container.querySelectorAll(".drag-source, .drag-over, .drag-before, .drag-after").forEach(el => {
        el.classList.remove("drag-source", "drag-over", "drag-before", "drag-after")
      })
    })

    // 触摸设备长按拖动支持
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
      const target = findDropTarget(touch.clientX, touch.clientY, container, ".bookmark-item")
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
      const target = findDropTarget(touch.clientX, touch.clientY, container, ".bookmark-item")
      clearDropIndicators(container)
      if (!target) return

      const fromIndex = parseInt(item.getAttribute("data-index")!)
      const targetIndex = parseInt(target.item.getAttribute("data-index")!)
      if (isNaN(fromIndex) || isNaN(targetIndex) || fromIndex === targetIndex) return
      executeDrop(container, fromIndex, targetIndex, target.position)
    })
  })

  // 容器级 dragover / drop —— 覆盖间隙区域
  container.addEventListener("dragover", (e) => {
    e.preventDefault()
    e.dataTransfer!.dropEffect = "move"
    const target = findDropTarget(e.clientX, e.clientY, container, ".bookmark-item")
    if (target) {
      applyDropIndicator(container, target.item, target.position)
    }
  })

  container.addEventListener("drop", (e) => {
    e.preventDefault()
    const fromIndex = parseInt(e.dataTransfer!.getData("text/plain"))
    const target = findDropTarget(e.clientX, e.clientY, container, ".bookmark-item")
    clearDropIndicators(container)
    if (target && !isNaN(fromIndex)) {
      const targetIndex = parseInt(target.item.getAttribute("data-index")!)
      if (!isNaN(targetIndex) && fromIndex !== targetIndex) {
        executeDrop(container, fromIndex, targetIndex, target.position)
      }
    }
  })

  // 同步首页横纵排列
  syncHomepageLayout(container)
}

function syncHomepageLayout(container: HTMLElement): void {
  const homeGrid = document.getElementById("quickLinksContainer")
  if (!homeGrid) return
  const style = getComputedStyle(homeGrid)
  container.style.gridTemplateColumns = style.gridTemplateColumns
  container.style.columnGap = style.columnGap
  container.style.gridTemplateRows = "auto"
}

function executeDrop(container: HTMLElement, fromIndex: number, targetIndex: number, position: 'before' | 'over' | 'after'): void {
  const items = [...container.querySelectorAll<HTMLElement>(".bookmark-item")]
  if (fromIndex < 0 || fromIndex >= items.length) return
  if (targetIndex < 0 || targetIndex >= items.length) return

  const sourceEl = items[fromIndex]
  const targetEl = items[targetIndex]

  if (position === 'over') {
    exchangeLinksAnimated(container, fromIndex, targetIndex)
    return
  }

  // 穿插：记录旧位置，移动 DOM，FLIP 动画，更新数据
  const oldRects = new Map<HTMLElement, DOMRect>()
  items.forEach(el => oldRects.set(el, el.getBoundingClientRect()))

  if (position === 'before') {
    container.insertBefore(sourceEl, targetEl)
  } else {
    const afterTarget = targetEl.nextSibling
    if (afterTarget) {
      container.insertBefore(sourceEl, afterTarget)
    } else {
      container.appendChild(sourceEl)
    }
  }

  // FLIP 动画
  const newItems = [...container.querySelectorAll<HTMLElement>(".bookmark-item")]
  newItems.forEach(el => {
    const old = oldRects.get(el)
    if (!old) return
    const r = el.getBoundingClientRect()
    const dx = old.left - r.left
    const dy = old.top - r.top
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
    el.style.transform = `translate(${dx}px, ${dy}px)`
    el.style.transition = "none"
    el.offsetHeight
    el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)"
    el.style.transform = ""
    const onEnd = () => { el.style.transition = ""; el.removeEventListener("transitionend", onEnd) }
    el.addEventListener("transitionend", onEnd)
  })

  // 更新 data-index + links 数组
  const oldLinks = [...links]
  links.length = 0
  newItems.forEach(el => {
    const oldIdx = parseInt(el.getAttribute("data-index")!)
    if (!isNaN(oldIdx) && oldIdx < oldLinks.length) {
      links.push(oldLinks[oldIdx])
    }
  })
  newItems.forEach((el, i) => el.setAttribute("data-index", String(i)))
  localStorage.setItem("navLinks", JSON.stringify(links))
  renderQuickLinks()
  initializeDataPreview()
}

function exchangeLinksAnimated(container: HTMLElement, a: number, b: number): void {
  const allItems = [...container.querySelectorAll(".bookmark-item")] as HTMLElement[]
  if (a >= allItems.length || b >= allItems.length || a === b) return

  const oldRects = new Map<HTMLElement, DOMRect>()
  allItems.forEach(el => oldRects.set(el, el.getBoundingClientRect()))

  const elA = allItems[a]
  const elB = allItems[b]

  // 用占位文本节点交换两个元素的位置，保留所有事件监听器
  const placeholder = document.createTextNode("")
  elB.replaceWith(placeholder)
  elA.replaceWith(elB)
  placeholder.replaceWith(elA)

  // 更新 data-index
  const newItems = [...container.querySelectorAll(".bookmark-item")] as HTMLElement[]
  newItems.forEach((el, i) => el.setAttribute("data-index", String(i)))

  // FLIP 动画
  newItems.forEach(el => {
    const old = oldRects.get(el)
    if (!old) return
    const r = el.getBoundingClientRect()
    const dx = old.left - r.left
    const dy = old.top - r.top
    if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) return
    el.style.transform = `translate(${dx}px, ${dy}px)`
    el.style.transition = "none"
    el.offsetHeight
    el.style.transition = "transform 0.35s cubic-bezier(0.25, 0.1, 0.25, 1)"
    el.style.transform = ""
    const onEnd = () => { el.style.transition = ""; el.removeEventListener("transitionend", onEnd) }
    el.addEventListener("transitionend", onEnd)
  })

  // 更新数据
  const tmp = links[a]
  links[a] = links[b]
  links[b] = tmp
  localStorage.setItem("navLinks", JSON.stringify(links))
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
  applyFocusTransition
}