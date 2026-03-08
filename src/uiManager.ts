import { LinkItem, ResourceItem, GridLayout } from './types'
import { links, resources, initializeDataPreview } from './dataManager'
import { getCachedFaviconUrl, getFaviconUrl, formatUrl, clearDomainCache, showEditDialog, showEditResourceDialog, deleteLink, deleteResource } from './linkManager'

function calculateGridLayout(totalItems: number): GridLayout {
  const maxColumns = 5

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

  const layout = calculateGridLayout(links.length)

  container.style.gridTemplateColumns = `repeat(${layout.columns}, 80px)`
  container.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`

  const fragment = document.createDocumentFragment()

  links.forEach((link) => {
    const linkElement = document.createElement("div")
    linkElement.className = "quick-link"
    linkElement.onclick = () => (window.location.href = link.url)

    const icon = document.createElement("div")
    icon.className = "quick-link-icon"
    icon.style.backgroundImage = `url('${
      link.faviconUrl || getCachedFaviconUrl(link.url)
    }')`

    const name = document.createElement("div")
    name.className = "quick-link-name"
    name.textContent = link.name

    linkElement.append(icon, name)
    fragment.appendChild(linkElement)
  })

  container.appendChild(fragment)
  container.classList.toggle("overflowing", layout.rows > 3)
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
}

function closeSettings(): void {
  const modal = document.getElementById("settingsModal")
  modal?.classList.remove("show")
  document.body.classList.remove("settings-modal-open")
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
    favicon.style.backgroundImage = `url('${item.faviconUrl}')`

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

    const editBtn = document.createElement("button")
    editBtn.className = "edit-btn"
    editBtn.textContent = "修改"
    
    const deleteBtn = document.createElement("button")
    deleteBtn.className = "delete-btn"
    deleteBtn.textContent = "删除"

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
    alert("请填写网站地址")
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
}

export { 
  calculateGridLayout, 
  renderQuickLinks, 
  openSettings, 
  closeSettings, 
  switchTab, 
  renderLinks, 
  renderResources, 
  saveLink, 
  applyFocusTransition 
}