// 书签管理模块
import { links, resources, initializeDataPreview } from './dataManager.js'
import { renderQuickLinks, renderLinks, renderResources } from './uiManager.js'
import { currentMode } from './modeManager.js'
import { updateEngineDropdown } from './engineManager.js'

// 全局变量，用于存储待删除书签的索引
let pendingDeleteIndex = -1
let currentEditIndex = -1
// 全局变量，用于存储待删除资源的索引
let pendingDeleteResourceIndex = -1

// 添加书签
// 统一添加项
function addItem(type) {
  let nameInputId, urlInputId, imageInputId, items, storageKey, renderFunc
  
  if (type === "link") {
    nameInputId = "linkName"
    urlInputId = "linkUrl"
    imageInputId = "linkImageUrl"
    items = links
    storageKey = "navLinks"
    renderFunc = () => {
      renderLinks()
      renderQuickLinks()
    }
  } else if (type === "resource") {
    nameInputId = "resourceName"
    urlInputId = "resourceUrl"
    imageInputId = "resourceImageUrl"
    items = resources
    storageKey = "navResources"
    renderFunc = () => {
      renderResources()
      if (currentMode === "resource") {
        updateEngineDropdown()
      }
    }
  }

  const name = document.getElementById(nameInputId).value.trim()
  const url = document.getElementById(urlInputId).value.trim()
  const imageUrl = document.getElementById(imageInputId).value.trim()

  if (!url) {
    alert(`请填写${type === 'link' ? '网站' : '资源'}地址`)
    return
  }

  // 确保URL格式正确
  const formattedUrl = url.startsWith("http") ? url : "https://" + url

  // 获取favicon URL，如果有自定义图片URL则使用自定义的
  const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl)

  items.push({ name, url: formattedUrl, faviconUrl })
  localStorage.setItem(storageKey, JSON.stringify(items))

  // 清空输入框
  document.getElementById(nameInputId).value = ""
  document.getElementById(urlInputId).value = ""
  document.getElementById(imageInputId).value = ""

  // 重新渲染
  renderFunc()

  // 更新数据预览
  initializeDataPreview()
}

function addLink() {
  addItem("link")
}

// 添加资源
function addResource() {
  addItem("resource")
}

// 删除书签
function deleteLink(index) {
  pendingDeleteIndex = index
  showConfirmDialog()
}

// 删除资源
function deleteResource(index) {
  pendingDeleteResourceIndex = index
  showConfirmResourceDialog()
}

// 显示资源删除确认对话框
function showConfirmResourceDialog() {
  const dialog = document.getElementById("confirmResourceDialog")
  dialog.classList.add("show")
}

// 关闭资源删除确认对话框
function closeConfirmResourceDialog() {
  const dialog = document.getElementById("confirmResourceDialog")
  dialog.classList.remove("show")
  pendingDeleteResourceIndex = -1
}

// 统一确认删除项
function confirmDeleteItem(type) {
  let pendingIndex, items, storageKey, renderFunc, closeDialogFunc
  
  if (type === "link") {
    pendingIndex = pendingDeleteIndex
    items = links
    storageKey = "navLinks"
    renderFunc = () => {
      renderLinks()
      renderQuickLinks()
    }
    closeDialogFunc = closeConfirmDialog
  } else if (type === "resource") {
    pendingIndex = pendingDeleteResourceIndex
    items = resources
    storageKey = "navResources"
    renderFunc = () => {
      renderResources()
      if (currentMode === "resource") {
        updateEngineDropdown()
      }
    }
    closeDialogFunc = closeConfirmResourceDialog
  }

  if (pendingIndex >= 0 && pendingIndex < items.length) {
    // 清除该域名的favicon缓存
    try {
      const domain = new URL(items[pendingIndex].url).hostname
      const cacheKey = `favicon_cache_${domain}`
      localStorage.removeItem(cacheKey)
    } catch (e) {
      // URL解析失败时忽略
    }

    items.splice(pendingIndex, 1)
    localStorage.setItem(storageKey, JSON.stringify(items))
    renderFunc()

    // 更新数据预览
    initializeDataPreview()
  }
  closeDialogFunc()
}

// 确认删除资源
function confirmDeleteResource() {
  confirmDeleteItem("resource")
}

// 显示确认对话框
function showConfirmDialog() {
  const dialog = document.getElementById("confirmDialog")
  dialog.classList.add("show")
}

// 关闭确认对话框
function closeConfirmDialog() {
  const dialog = document.getElementById("confirmDialog")
  dialog.classList.remove("show")
  pendingDeleteIndex = -1
}

// 确认删除书签
function confirmDeleteLink() {
  confirmDeleteItem("link")
}

// 显示编辑对话框
// 统一显示编辑对话框
function showEditDialogByType(index, type) {
  currentEditIndex = index
  
  let item, nameInputId, urlInputId, imageInputId, dialogId
  
  if (type === "link") {
    item = links[index]
    nameInputId = "editLinkName"
    urlInputId = "editLinkUrl"
    imageInputId = "editLinkImageUrl"
    dialogId = "editDialog"
  } else if (type === "resource") {
    item = resources[index]
    nameInputId = "editResourceName"
    urlInputId = "editResourceUrl"
    imageInputId = "editResourceImageUrl"
    dialogId = "editResourceDialog"
  }

  // 填充表单数据
  document.getElementById(nameInputId).value = item.name
  document.getElementById(urlInputId).value = item.url

  // 判断是否是自定义图片URL
  const isCustomImage =
    item.faviconUrl &&
    !item.faviconUrl.includes("google.com/s2/favicons") &&
    !item.faviconUrl.startsWith("data:image/svg+xml")
  document.getElementById(imageInputId).value = isCustomImage
    ? item.faviconUrl
    : ""

  // 显示对话框
  const dialog = document.getElementById(dialogId)
  dialog.classList.add("show")
}

function showEditDialog(index) {
  showEditDialogByType(index, "link")
}

// 显示资源编辑对话框
function showEditResourceDialog(index) {
  showEditDialogByType(index, "resource")
}

// 关闭编辑对话框
function closeEditDialog() {
  const dialog = document.getElementById("editDialog")
  dialog.classList.remove("show")
  currentEditIndex = -1
}

// 关闭资源编辑对话框
function closeEditResourceDialog() {
  const dialog = document.getElementById("editResourceDialog")
  dialog.classList.remove("show")
  currentEditIndex = -1
}

// 工具函数：格式化URL
function formatUrl(url) {
  return url.startsWith("http") ? url : "https://" + url
}

// 工具函数：提取域名
function extractDomain(url) {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

// 工具函数：清除域名缓存
function clearDomainCache(url) {
  const domain = extractDomain(url)
  if (domain) {
    const cacheKey = `favicon_cache_${domain}`
    localStorage.removeItem(cacheKey)
  }
}

// 工具函数：验证表单数据
function validateFormData(name, url, errorMessage) {
  if (!url) {
    alert(errorMessage)
    return false
  }
  return true
}

// 统一保存编辑项
function saveEditedItem(type) {
  let items, storageKey, renderFunc, closeDialogFunc, nameInputId, urlInputId, imageInputId
  
  if (type === "link") {
    items = links
    storageKey = "navLinks"
    renderFunc = () => {
      renderLinks()
      renderQuickLinks()
      initializeDataPreview()
    }
    closeDialogFunc = closeEditDialog
    nameInputId = "editLinkName"
    urlInputId = "editLinkUrl"
    imageInputId = "editLinkImageUrl"
  } else if (type === "resource") {
    items = resources
    storageKey = "navResources"
    renderFunc = () => {
      renderResources()
      initializeDataPreview()
      if (currentMode === "resource") {
        updateEngineDropdown()
      }
    }
    closeDialogFunc = closeEditResourceDialog
    nameInputId = "editResourceName"
    urlInputId = "editResourceUrl"
    imageInputId = "editResourceImageUrl"
  }

  if (currentEditIndex >= 0 && currentEditIndex < items.length) {
    const name = document.getElementById(nameInputId).value.trim()
    const url = document.getElementById(urlInputId).value.trim()
    const imageUrl = document.getElementById(imageInputId).value.trim()

    if (!validateFormData(name, url, `请填写${type === 'link' ? '网站' : '资源'}地址`)) {
      return
    }

    const formattedUrl = formatUrl(url)
    clearDomainCache(items[currentEditIndex].url)
    const faviconUrl = imageUrl.trim() ? imageUrl : getFaviconUrl(formattedUrl)

    items[currentEditIndex] = { name, url: formattedUrl, faviconUrl }
    localStorage.setItem(storageKey, JSON.stringify(items))

    renderFunc()
  }
  closeDialogFunc()
}

// 保存编辑的书签
function saveEditedLink() {
  saveEditedItem("link")
}

// 保存编辑的资源
function saveEditedResource() {
  saveEditedItem("resource")
}

// 获取默认的favicon图标
function getDefaultFavicon() {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E'
}

// 获取网站favicon
function getFaviconUrl(url) {
  try {
    const domain = extractDomain(url)
    if (!domain) return getDefaultFavicon()
    
    return `https://favicone.com/${domain}?s=256`
  } catch {
    return getDefaultFavicon()
  }
}

// 获取带缓存的网站favicon（30分钟缓存）
function getCachedFaviconUrl(url) {
  try {
    const domain = extractDomain(url)
    if (!domain) return getDefaultFavicon()
    
    const cacheKey = `favicon_cache_${domain}`

    // 检查是否有缓存
    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      const cache = JSON.parse(cachedData)
      const now = Date.now()

      // 如果缓存未过期（30分钟内），直接返回缓存的favicon
      if (now - cache.timestamp < 30 * 60 * 1000) {
        return cache.faviconUrl
      }
    }

    // 使用favicone.com服务获取图标
    const faviconeUrl = `https://favicone.com/${domain}?s=256`

    // 保存到缓存
    const cacheData = {
      faviconUrl: faviconeUrl,
      timestamp: Date.now()
    }
    localStorage.setItem(cacheKey, JSON.stringify(cacheData))

    return faviconeUrl
  } catch {
    return getDefaultFavicon()
  }
}

export { 
  addLink, 
  addResource, 
  deleteLink, 
  deleteResource, 
  showConfirmResourceDialog, 
  closeConfirmResourceDialog, 
  confirmDeleteResource, 
  showConfirmDialog, 
  closeConfirmDialog, 
  confirmDeleteLink, 
  showEditDialog, 
  showEditResourceDialog, 
  closeEditDialog, 
  closeEditResourceDialog, 
  saveEditedLink, 
  saveEditedResource, 
  getFaviconUrl, 
  getCachedFaviconUrl,
  formatUrl,
  extractDomain,
  clearDomainCache,
  validateFormData,
  getDefaultFavicon
}
