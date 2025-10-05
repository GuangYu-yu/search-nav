// 书签管理模块
import { links, resources, initializeDataPreview } from './dataManager.js'
import { renderQuickLinks } from './uiManager.js'
import { currentMode } from './modeManager.js'
import { updateEngineDropdown } from './engineManager.js'

// 全局变量，用于存储待删除书签的索引
let pendingDeleteIndex = -1
let currentEditIndex = -1
// 全局变量，用于存储待删除资源的索引
let pendingDeleteResourceIndex = -1

// 添加书签
function addLink() {
  const name = document.getElementById("linkName").value.trim()
  const url = document.getElementById("linkUrl").value.trim()
  const imageUrl = document.getElementById("linkImageUrl").value.trim()

  if (!url) {
    alert("请填写网站地址")
    return
  }

  // 确保URL格式正确
  const formattedUrl = url.startsWith("http") ? url : "https://" + url

  // 获取favicon URL，如果有自定义图片URL则使用自定义的
  const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl)

  links.push({ name, url: formattedUrl, faviconUrl })
  localStorage.setItem("navLinks", JSON.stringify(links))

  // 清空输入框
  document.getElementById("linkName").value = ""
  document.getElementById("linkUrl").value = ""
  document.getElementById("linkImageUrl").value = ""

  // 重新渲染
  renderLinks()
  renderQuickLinks()

  // 更新数据预览
  initializeDataPreview()
}

// 添加资源
function addResource() {
  const name = document.getElementById("resourceName").value.trim()
  const url = document.getElementById("resourceUrl").value.trim()
  const imageUrl = document.getElementById("resourceImageUrl").value.trim()

  if (!url) {
    alert("请填写资源地址")
    return
  }

  // 确保URL格式正确
  const formattedUrl = url.startsWith("http") ? url : "https://" + url

  // 获取favicon URL，如果有自定义图片URL则使用自定义的
  const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl)

  resources.push({ name, url: formattedUrl, faviconUrl })
  localStorage.setItem("navResources", JSON.stringify(resources))

  // 清空输入框
  document.getElementById("resourceName").value = ""
  document.getElementById("resourceUrl").value = ""
  document.getElementById("resourceImageUrl").value = ""

  // 重新渲染
  renderResources()

  // 更新数据预览
  initializeDataPreview()

  // 更新引擎下拉菜单
  if (currentMode === "resource") {
    updateEngineDropdown()
  }
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

// 确认删除资源
function confirmDeleteResource() {
  if (
    pendingDeleteResourceIndex >= 0 &&
    pendingDeleteResourceIndex < resources.length
  ) {
    // 清除该域名的favicon缓存
    try {
      const domain = new URL(resources[pendingDeleteResourceIndex].url).hostname
      const cacheKey = `favicon_cache_${domain}`
      localStorage.removeItem(cacheKey)
    } catch (e) {
      // URL解析失败时忽略
    }

    resources.splice(pendingDeleteResourceIndex, 1)
    localStorage.setItem("navResources", JSON.stringify(resources))
    renderResources()

    // 更新数据预览
    initializeDataPreview()

    // 更新引擎下拉菜单
    if (currentMode === "resource") {
      updateEngineDropdown()
    }
  }
  closeConfirmResourceDialog()
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
  if (pendingDeleteIndex >= 0 && pendingDeleteIndex < links.length) {
    // 清除该域名的favicon缓存
    try {
      const domain = new URL(links[pendingDeleteIndex].url).hostname
      const cacheKey = `favicon_cache_${domain}`
      localStorage.removeItem(cacheKey)
    } catch (e) {
      // URL解析失败时忽略
    }

    links.splice(pendingDeleteIndex, 1)
    localStorage.setItem("navLinks", JSON.stringify(links))
    renderLinks()
    renderQuickLinks()

    // 更新数据预览
    initializeDataPreview()
  }
  closeConfirmDialog()
}

// 显示编辑对话框
function showEditDialog(index) {
  currentEditIndex = index
  const link = links[index]

  // 填充表单数据
  document.getElementById("editLinkName").value = link.name
  document.getElementById("editLinkUrl").value = link.url

  // 判断是否是自定义图片URL
  const isCustomImage =
    link.faviconUrl &&
    !link.faviconUrl.includes("google.com/s2/favicons") &&
    !link.faviconUrl.startsWith("data:image/svg+xml")
  document.getElementById("editLinkImageUrl").value = isCustomImage
    ? link.faviconUrl
    : ""

  // 显示对话框
  const dialog = document.getElementById("editDialog")
  dialog.classList.add("show")
}

// 显示资源编辑对话框
function showEditResourceDialog(index) {
  currentEditIndex = index
  const resource = resources[index]

  // 填充表单数据
  document.getElementById("editResourceName").value = resource.name
  document.getElementById("editResourceUrl").value = resource.url

  // 判断是否是自定义图片URL
  const isCustomImage =
    resource.faviconUrl &&
    !resource.faviconUrl.includes("google.com/s2/favicons") &&
    !resource.faviconUrl.startsWith("data:image/svg+xml")
  document.getElementById("editResourceImageUrl").value = isCustomImage
    ? resource.faviconUrl
    : ""

  // 显示对话框
  const dialog = document.getElementById("editResourceDialog")
  dialog.classList.add("show")
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

// 保存编辑的书签
function saveEditedLink() {
  if (currentEditIndex >= 0 && currentEditIndex < links.length) {
    const name = document.getElementById("editLinkName").value.trim()
    const url = document.getElementById("editLinkUrl").value.trim()
    const imageUrl = document.getElementById("editLinkImageUrl").value.trim()

    if (!validateFormData(name, url, "请填写网站地址")) {
      return
    }

    const formattedUrl = formatUrl(url)
    clearDomainCache(links[currentEditIndex].url)
    const faviconUrl = imageUrl || getFaviconUrl(formattedUrl)

    links[currentEditIndex] = { name, url: formattedUrl, faviconUrl }
    localStorage.setItem("navLinks", JSON.stringify(links))

    renderLinks()
    renderQuickLinks()
    initializeDataPreview()
  }
  closeEditDialog()
}

// 保存编辑的资源
function saveEditedResource() {
  if (currentEditIndex >= 0 && currentEditIndex < resources.length) {
    const name = document.getElementById("editResourceName").value.trim()
    const url = document.getElementById("editResourceUrl").value.trim()
    const imageUrl = document.getElementById("editResourceImageUrl").value.trim()

    if (!validateFormData(name, url, "请填写资源地址")) {
      return
    }

    const formattedUrl = formatUrl(url)
    clearDomainCache(resources[currentEditIndex].url)
    const faviconUrl = imageUrl || getFaviconUrl(formattedUrl)

    resources[currentEditIndex] = { name, url: formattedUrl, faviconUrl }
    localStorage.setItem("navResources", JSON.stringify(resources))

    renderResources()
    initializeDataPreview()

    if (currentMode === "resource") {
      updateEngineDropdown()
    }
  }
  closeEditResourceDialog()
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
  getCachedFaviconUrl 
}