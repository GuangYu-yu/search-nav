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

/** 创建书签 DOM（icon + name） */
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
  const glass = document.getElementById("quickLinksGlass") as HTMLElement | null
  if (glass) glass.innerHTML = ""
  if (!links.length) return

  // 计算最优行列数，确保对称
  const layout = calculateGridLayout(links.length, maxColumnsForWidth())
  container.style.gridTemplateColumns = `repeat(${layout.columns}, minmax(80px, 1fr))`

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

  // 在毛玻璃层创建对应数量的玻璃块（backdrop-filter 在此层，不受动画影响）
  if (glass) {
    const isCollapsed = document.querySelector(".quick-links")?.classList.contains("collapsed")
    links.forEach(() => {
      const block = document.createElement("div")
      block.className = "quick-link-glass-block"
      if (isCollapsed) {
        block.style.opacity = "0"
        block.style.transition = "none"
      }
      glass.appendChild(block)
    })
    positionGlassBlocks()

    // 悬浮时毛玻璃块跟随图标放大
    const linkEls = container.querySelectorAll<HTMLElement>(".quick-link")
    const blocks = glass.children
    linkEls.forEach((linkEl, i) => {
      if (i >= blocks.length) return
      const block = blocks[i] as HTMLElement
      linkEl.addEventListener("mouseenter", () => {
        block.style.transform = "scale(1.08)"
        block.style.transition = "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
      })
      linkEl.addEventListener("mouseleave", () => {
        block.style.transform = "scale(1)"
        block.style.transition = "transform 0.2s cubic-bezier(0.25, 1, 0.5, 1)"
      })
    })
  }

  // 同步设置面板列数（renderQuickLinks 在 renderLinks 之后执行，此时列数才是最新）
  syncSettingsGrid()
}

/** 同步设置面板的网格列数与首页一致 */
function syncSettingsGrid(): void {
  const settingsContainer = document.getElementById("linksContainer")
  if (!settingsContainer) return
  const modal = document.getElementById("settingsModal")
  if (!modal?.classList.contains("show")) return
  const homeGrid = document.getElementById("quickLinksContainer")
  if (!homeGrid) return
  settingsContainer.style.gridTemplateColumns = getComputedStyle(homeGrid).gridTemplateColumns
}

/** 计算最优行列数，尽量让每行数量相等，最多 maxColumns 列 */
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

/** 将每个玻璃块精确对齐到对应图标的位置 */
function positionGlassBlocks(): void {
  const glass = document.getElementById("quickLinksGlass") as HTMLElement | null
  if (!glass) return

  const glassRect = glass.getBoundingClientRect()
  const icons = document.querySelectorAll<HTMLElement>("#quickLinksContainer .quick-link-icon")
  const blocks = glass.children

  icons.forEach((icon, i) => {
    if (i >= blocks.length) return
    const block = blocks[i] as HTMLElement
    const r = icon.getBoundingClientRect()
    block.style.left = `${Math.round(r.left - glassRect.left)}px`
    block.style.top = `${Math.round(r.top - glassRect.top)}px`
    block.style.width = `${Math.round(r.width)}px`
    block.style.height = `${Math.round(r.height)}px`
  })
}

// 窗口改变时重新计算列数，同时重新对齐玻璃块位置
window.addEventListener("resize", () => {
  relayoutGrid()
})

// 网格滚动时重新对齐玻璃块
document.getElementById("quickLinksContainer")?.addEventListener("scroll", () => {
  positionGlassBlocks()
})

// 拖拽时：光标不在书签网格区域内时清除所有指示器
document.addEventListener("dragover", (e) => {
  const grid = document.getElementById("linksContainer")
  if (!grid) return
  if (!grid.contains(e.target as Node)) {
    clearDropIndicators(grid)
  }
})

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
        if (!origIcon.classList.contains("loaded")) {
          // favicon 没加载完，补首字母占位
          const letter = document.createElement("span")
          letter.textContent = origIcon.getAttribute("data-initial") || ""
          letter.style.cssText = "position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:18px;font-weight:600;color:#333;pointer-events:none"
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

  // 同步首页列数（设置面板打开时立即对齐）
  syncSettingsGrid()
}

/** 根据容器宽度计算最大列数（响应式） */
function maxColumnsForWidth(): number {
  const grid = document.getElementById("quickLinksContainer")
  if (!grid) return 5
  const parentWidth = grid.parentElement?.clientWidth ?? 500
  const padding = 32  // 16px × 2
  const gap = 12
  const itemWidth = 80
  const available = parentWidth - padding
  const cols = Math.max(1, Math.floor((available + gap) / (itemWidth + gap)))
  return Math.min(cols, 5)
}

/** 重新计算首页网格列数并同步设置面板 */
function relayoutGrid(): void {
  const container = document.getElementById("quickLinksContainer")
  if (!container) return
  const maxCols = maxColumnsForWidth()
  const layout = calculateGridLayout(links.length, maxCols)
  container.style.gridTemplateColumns = `repeat(${layout.columns}, minmax(80px, 1fr))`
  // 重新对齐玻璃块位置
  positionGlassBlocks()
  // 如果设置面板打开，同步列数
  syncSettingsGrid()
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

  // JS 控制玻璃块淡入淡出（CSS ~ 选择器不可靠）
  const glass = document.getElementById("quickLinksGlass")
  if (glass) {
    const blocks = glass.children
    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i] as HTMLElement
      block.style.transition = "opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      block.style.opacity = isFocused ? "0" : "1"
    }
  }

  // 折叠/展开动画（300ms）期间每帧对齐玻璃块位置
  const start = performance.now()
  const duration = 300
  function frame(now: number) {
    positionGlassBlocks()
    if (now - start < duration) {
      requestAnimationFrame(frame)
    }
  }
  requestAnimationFrame(frame)
}

export { 
  renderQuickLinks, 
  openSettings, 
  closeSettings, 
  switchTab, 
  renderLinks, 
  applyFocusTransition
}