// UI管理模块
import { links, resources, initializeDataPreview } from './dataManager.js'
import { getCachedFaviconUrl, getFaviconUrl, formatUrl, clearDomainCache, showEditDialog, showEditResourceDialog, deleteLink, deleteResource } from './linkManager.js'

// 计算书签网格布局
function calculateGridLayout(totalItems) {
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

// 渲染快速链接
function renderQuickLinks() {
  const container = document.getElementById("quickLinksContainer")
  container.innerHTML = ""
  if (!links.length) return

  const layout = calculateGridLayout(links.length)

  // 设置网格样式
  container.style.gridTemplateColumns = `repeat(${layout.columns}, 80px)`
  container.style.gridTemplateRows = `repeat(${layout.rows}, 1fr)`

  const fragment = document.createDocumentFragment()

  links.forEach((link) => {
    const linkElement = document.createElement("div")
    linkElement.className = "quick-link"
    linkElement.onclick = () => (window.location.href = link.url)

    const icon = document.createElement("div")
    icon.className = "quick-link-icon"
    // 使用自定义图片URL或缓存的favicon
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

  // 超过三行显示滚动条
  container.classList.toggle("overflowing", layout.rows > 3)
}

// 点击外部关闭主题切换器和引擎下拉菜单
document.addEventListener("click", function (event) {
  const themeSwitcher = document.getElementById("themeSwitcher")
  const themeToggleBtn = document.querySelector(".theme-toggle-btn")
  const engineDropdown = document.getElementById("engineDropdown")
  const engineSelector = document.querySelector(".engine-selector")

  if (
    !themeSwitcher.contains(event.target) &&
    !themeToggleBtn.contains(event.target)
  ) {
    themeSwitcher.classList.remove("show")
  }

  if (
    !engineDropdown.contains(event.target) &&
    !engineSelector.contains(event.target)
  ) {
    engineDropdown.classList.remove("show")
    // 恢复搜索建议透明度
    const suggestionsContainer = document.getElementById("suggestionsContainer")
    suggestionsContainer.style.opacity = ""
  }
})

// 打开设置
function openSettings() {
  const modal = document.getElementById("settingsModal")
  modal.classList.add("show")
  document.body.classList.add("settings-modal-open")
  renderLinks()
}

// 关闭设置
function closeSettings() {
  const modal = document.getElementById("settingsModal")
  modal.classList.remove("show")
  document.body.classList.remove("settings-modal-open")
}

// 标签页切换
function switchTab(tabName) {
  // 更新标签按钮状态
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === tabName)
  })

  // 更新标签内容显示
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.toggle("active", content.id === tabName + "-tab")
  })
}

// 统一渲染列表项
function renderListItems(containerId, items, type) {
  const container = document.getElementById(containerId)
  container.innerHTML = ""

  items.forEach((item, index) => {
    const itemElement = document.createElement("div")
    itemElement.className = "link-item"
    itemElement.id = `${type}-${index}`

    // 图标
    const favicon = document.createElement("div")
    favicon.className = "link-favicon"
    favicon.style.backgroundImage = `url('${item.faviconUrl}')`

    // 信息
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

    // 操作按钮
    const actions = document.createElement("div")
    actions.className = "link-actions"

    const editBtn = document.createElement("button")
    editBtn.className = "edit-btn"
    editBtn.textContent = "修改"
    
    const deleteBtn = document.createElement("button")
    deleteBtn.className = "delete-btn"
    deleteBtn.textContent = "删除"

    // 根据类型设置不同的操作函数
    if (type === "link") {
      editBtn.onclick = () => showEditDialog(index)
      deleteBtn.onclick = () => deleteLink(index)
    } else if (type === "resource") {
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

// 渲染设置中的书签列表
function renderLinks() {
  renderListItems("linksContainer", links, "link")
}

// 渲染设置中的资源列表
function renderResources() {
  renderListItems("resourcesContainer", resources, "resource")
}

// 保存编辑的书签
function saveLink(index, name, url, imageUrl = "") {
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

// 统一处理焦点状态的 transform 和 transition
function applyFocusTransition(isFocused) {
  if (isFocused) {
    // 应用焦点状态
    document.body.classList.add("search-focused")
  } else {
    // 恢复默认状态
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