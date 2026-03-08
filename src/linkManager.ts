import { LinkItem, ResourceItem, FaviconCache } from './types'
import { links, resources, initializeDataPreview } from './dataManager'
import { renderQuickLinks, renderLinks, renderResources } from './uiManager'
import { currentMode } from './modeManager'
import { updateEngineDropdown } from './engineManager'

let pendingDeleteIndex: number = -1
let currentEditIndex: number = -1
let pendingDeleteResourceIndex: number = -1

type ItemType = 'link' | 'resource'

function addItem(type: ItemType): void {
  let nameInputId: string, urlInputId: string, imageInputId: string, items: (LinkItem | ResourceItem)[], storageKey: string, renderFunc: () => void
  
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
  } else {
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

  const name = (document.getElementById(nameInputId) as HTMLInputElement | null)?.value.trim() || ""
  const url = (document.getElementById(urlInputId) as HTMLInputElement | null)?.value.trim() || ""
  const imageUrl = (document.getElementById(imageInputId) as HTMLInputElement | null)?.value.trim() || ""

  if (!url) {
    alert(`请填写${type === 'link' ? '网站' : '资源'}地址`)
    return
  }

  const formattedUrl = url.startsWith("http") ? url : "https://" + url
  const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl)

  items.push({ name, url: formattedUrl, faviconUrl })
  localStorage.setItem(storageKey, JSON.stringify(items))

  const nameInput = document.getElementById(nameInputId) as HTMLInputElement | null
  const urlInput = document.getElementById(urlInputId) as HTMLInputElement | null
  const imageInput = document.getElementById(imageInputId) as HTMLInputElement | null
  
  if (nameInput) nameInput.value = ""
  if (urlInput) urlInput.value = ""
  if (imageInput) imageInput.value = ""

  renderFunc()
  initializeDataPreview()
}

function addLink(): void {
  addItem("link")
}

function addResource(): void {
  addItem("resource")
}

function deleteLink(index: number): void {
  pendingDeleteIndex = index
  showConfirmDialog()
}

function deleteResource(index: number): void {
  pendingDeleteResourceIndex = index
  showConfirmResourceDialog()
}

function showConfirmResourceDialog(): void {
  const dialog = document.getElementById("confirmResourceDialog")
  dialog?.classList.add("show")
}

function closeConfirmResourceDialog(): void {
  const dialog = document.getElementById("confirmResourceDialog")
  dialog?.classList.remove("show")
  pendingDeleteResourceIndex = -1
}

function confirmDeleteItem(type: ItemType): void {
  let pendingIndex: number, items: (LinkItem | ResourceItem)[], storageKey: string, renderFunc: () => void, closeDialogFunc: () => void
  
  if (type === "link") {
    pendingIndex = pendingDeleteIndex
    items = links
    storageKey = "navLinks"
    renderFunc = () => {
      renderLinks()
      renderQuickLinks()
    }
    closeDialogFunc = closeConfirmDialog
  } else {
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
    initializeDataPreview()
  }
  closeDialogFunc()
}

function confirmDeleteResource(): void {
  confirmDeleteItem("resource")
}

function showConfirmDialog(): void {
  const dialog = document.getElementById("confirmDialog")
  dialog?.classList.add("show")
}

function closeConfirmDialog(): void {
  const dialog = document.getElementById("confirmDialog")
  dialog?.classList.remove("show")
  pendingDeleteIndex = -1
}

function confirmDeleteLink(): void {
  confirmDeleteItem("link")
}

function showEditDialogByType(index: number, type: ItemType): void {
  currentEditIndex = index
  
  let item: LinkItem | ResourceItem, nameInputId: string, urlInputId: string, imageInputId: string, dialogId: string
  
  if (type === "link") {
    item = links[index]
    nameInputId = "editLinkName"
    urlInputId = "editLinkUrl"
    imageInputId = "editLinkImageUrl"
    dialogId = "editDialog"
  } else {
    item = resources[index]
    nameInputId = "editResourceName"
    urlInputId = "editResourceUrl"
    imageInputId = "editResourceImageUrl"
    dialogId = "editResourceDialog"
  }

  const nameInput = document.getElementById(nameInputId) as HTMLInputElement | null
  const urlInput = document.getElementById(urlInputId) as HTMLInputElement | null
  const imageInput = document.getElementById(imageInputId) as HTMLInputElement | null
  
  if (nameInput) nameInput.value = item.name
  if (urlInput) urlInput.value = item.url

  const isCustomImage =
    item.faviconUrl &&
    !item.faviconUrl.includes("google.com/s2/favicons") &&
    !item.faviconUrl.startsWith("data:image/svg+xml")
  
  if (imageInput) imageInput.value = isCustomImage ? item.faviconUrl : ""

  const dialog = document.getElementById(dialogId)
  dialog?.classList.add("show")
}

function showEditDialog(index: number): void {
  showEditDialogByType(index, "link")
}

function showEditResourceDialog(index: number): void {
  showEditDialogByType(index, "resource")
}

function closeEditDialog(): void {
  const dialog = document.getElementById("editDialog")
  dialog?.classList.remove("show")
  currentEditIndex = -1
}

function closeEditResourceDialog(): void {
  const dialog = document.getElementById("editResourceDialog")
  dialog?.classList.remove("show")
  currentEditIndex = -1
}

function formatUrl(url: string): string {
  return url.startsWith("http") ? url : "https://" + url
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname
  } catch {
    return null
  }
}

function clearDomainCache(url: string): void {
  const domain = extractDomain(url)
  if (domain) {
    const cacheKey = `favicon_cache_${domain}`
    localStorage.removeItem(cacheKey)
  }
}

function validateFormData(url: string, errorMessage: string): boolean {
  if (!url) {
    alert(errorMessage)
    return false
  }
  return true
}

function saveEditedItem(type: ItemType): void {
  let items: (LinkItem | ResourceItem)[], storageKey: string, renderFunc: () => void, closeDialogFunc: () => void, nameInputId: string, urlInputId: string, imageInputId: string
  
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
  } else {
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
    const name = (document.getElementById(nameInputId) as HTMLInputElement | null)?.value.trim() || ""
    const url = (document.getElementById(urlInputId) as HTMLInputElement | null)?.value.trim() || ""
    const imageUrl = (document.getElementById(imageInputId) as HTMLInputElement | null)?.value.trim() || ""

    if (!validateFormData(url, `请填写${type === 'link' ? '网站' : '资源'}地址`)) {
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

function saveEditedLink(): void {
  saveEditedItem("link")
}

function saveEditedResource(): void {
  saveEditedItem("resource")
}

function getDefaultFavicon(): string {
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23666"%3E%3Cpath d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/%3E%3C/svg%3E'
}

function getFaviconUrl(url: string): string {
  try {
    const domain = extractDomain(url)
    if (!domain) return getDefaultFavicon()
    
    return `https://favicone.com/${domain}?s=256`
  } catch {
    return getDefaultFavicon()
  }
}

function getCachedFaviconUrl(url: string): string {
  try {
    const domain = extractDomain(url)
    if (!domain) return getDefaultFavicon()
    
    const cacheKey = `favicon_cache_${domain}`

    const cachedData = localStorage.getItem(cacheKey)
    if (cachedData) {
      const cache: FaviconCache = JSON.parse(cachedData)
      const now = Date.now()

      if (now - cache.timestamp < 30 * 60 * 1000) {
        return cache.faviconUrl
      }
    }

    const faviconeUrl = `https://favicone.com/${domain}?s=256`

    const cacheData: FaviconCache = {
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