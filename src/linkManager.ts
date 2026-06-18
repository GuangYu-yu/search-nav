import { LinkItem, ResourceItem, FaviconCache, Mode } from './types'
import { links, resources, initializeDataPreview } from './dataManager'
import { renderQuickLinks, renderLinks } from './uiManager'
import { currentMode } from './modeManager'
import { updateEngineDropdown, defaultFaviconSvg } from './engineManager'
import { addCustomEngine } from './builtInEngines'
import { showToast } from './toast'

let pendingDeleteIndex: number = -1
let currentEditIndex: number = -1
let pendingDeleteResourceIndex: number = -1

type ItemType = 'link' | 'resource'

interface ItemTypeConfig {
  items: (LinkItem | ResourceItem)[]
  storageKey: string
  label: string
  nameInputId: string
  urlInputId: string
  imageInputId: string
  editNameInputId: string
  editUrlInputId: string
  editImageInputId: string
  dialogId: string
  closeDialogFunc: () => void
  renderFunc: () => void
  editCloseDialogFunc: () => void
  editRenderFunc: () => void
  closeConfirmFunc: () => void
}

function getItemConfig(type: ItemType): ItemTypeConfig {
  if (type === "link") {
    return {
      items: links,
      storageKey: "navLinks",
      label: "网站",
      nameInputId: "linkName",
      urlInputId: "linkUrl",
      imageInputId: "linkImageUrl",
      editNameInputId: "editLinkName",
      editUrlInputId: "editLinkUrl",
      editImageInputId: "editLinkImageUrl",
      dialogId: "editDialog",
      closeDialogFunc: closeConfirmDialog,
      renderFunc: () => {
        renderLinks()
        renderQuickLinks()
      },
      editCloseDialogFunc: closeEditDialog,
      editRenderFunc: () => {
        renderLinks()
        renderQuickLinks()
        initializeDataPreview()
      },
      closeConfirmFunc: closeConfirmDialog,
    }
  }
  return {
    items: resources,
    storageKey: "navResources",
    label: "资源",
    nameInputId: "resourceName",
    urlInputId: "resourceUrl",
    imageInputId: "resourceImageUrl",
    editNameInputId: "editResourceName",
    editUrlInputId: "editResourceUrl",
    editImageInputId: "editResourceImageUrl",
    dialogId: "editResourceDialog",
    closeDialogFunc: closeConfirmResourceDialog,
    renderFunc: () => {
      if (currentMode === "resource") {
        updateEngineDropdown()
      }
    },
    editCloseDialogFunc: closeEditResourceDialog,
    editRenderFunc: () => {
      initializeDataPreview()
      if (currentMode === "resource") {
        updateEngineDropdown()
      }
    },
    closeConfirmFunc: () => {
      const dialog = document.getElementById("confirmResourceDialog")
      dialog?.classList.remove("show")
      pendingDeleteResourceIndex = -1
    },
  }
}

function addItem(type: ItemType): void {
  const cfg = getItemConfig(type)

  const name = (document.getElementById(cfg.nameInputId) as HTMLInputElement | null)?.value.trim() || ""
  const url = (document.getElementById(cfg.urlInputId) as HTMLInputElement | null)?.value.trim() || ""
  const imageUrl = (document.getElementById(cfg.imageInputId) as HTMLInputElement | null)?.value.trim() || ""

  if (!url) {
    showToast(`请填写${cfg.label}地址`, 'error')
    return
  }

  const formattedUrl = url.startsWith("http") ? url : "https://" + url
  const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl)

  cfg.items.push({ name, url: formattedUrl, faviconUrl })
  localStorage.setItem(cfg.storageKey, JSON.stringify(cfg.items))

  const nameInput = document.getElementById(cfg.nameInputId) as HTMLInputElement | null
  const urlInput = document.getElementById(cfg.urlInputId) as HTMLInputElement | null
  const imageInput = document.getElementById(cfg.imageInputId) as HTMLInputElement | null
  
  if (nameInput) nameInput.value = ""
  if (urlInput) urlInput.value = ""
  if (imageInput) imageInput.value = ""

  cfg.renderFunc()
  initializeDataPreview()
}

function addResource(): void {
  const name = (document.getElementById("resourceName") as HTMLInputElement | null)?.value.trim() || ""
  const url = (document.getElementById("resourceUrl") as HTMLInputElement | null)?.value.trim() || ""
  const imageUrl = (document.getElementById("resourceImageUrl") as HTMLInputElement | null)?.value.trim() || ""
  const category = (document.getElementById("resourceCategory") as HTMLSelectElement | null)?.value as Mode || "resource"

  if (!name) {
    showToast("请填写引擎名称", 'error')
    return
  }
  if (!url) {
    showToast("请填写搜索地址", 'error')
    return
  }

  const formattedUrl = formatUrl(url)
  const faviconUrl = imageUrl || getCachedFaviconUrl(formattedUrl)

  addCustomEngine(name, formattedUrl, faviconUrl, category)

  const nameInput = document.getElementById("resourceName") as HTMLInputElement | null
  const urlInput = document.getElementById("resourceUrl") as HTMLInputElement | null
  const imageInput = document.getElementById("resourceImageUrl") as HTMLInputElement | null
  
  if (nameInput) nameInput.value = ""
  if (urlInput) urlInput.value = ""
  if (imageInput) imageInput.value = ""

  updateEngineDropdown()
  initializeDataPreview()
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
  const cfg = getItemConfig(type)
  const pendingIndex = type === "link" ? pendingDeleteIndex : pendingDeleteResourceIndex

  if (pendingIndex >= 0 && pendingIndex < cfg.items.length) {
    try {
      const domain = new URL(cfg.items[pendingIndex].url).hostname
      const cacheKey = `favicon_cache_${domain}`
      localStorage.removeItem(cacheKey)
    } catch (e) {
      // URL解析失败时忽略
    }

    cfg.items.splice(pendingIndex, 1)
    localStorage.setItem(cfg.storageKey, JSON.stringify(cfg.items))
    cfg.renderFunc()
    initializeDataPreview()
  }
  cfg.closeDialogFunc()
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

function showEditDialogByType(index: number, type: ItemType): void {
  currentEditIndex = index
  const cfg = getItemConfig(type)
  const item = cfg.items[index]

  const nameInput = document.getElementById(cfg.editNameInputId) as HTMLInputElement | null
  const urlInput = document.getElementById(cfg.editUrlInputId) as HTMLInputElement | null
  const imageInput = document.getElementById(cfg.editImageInputId) as HTMLInputElement | null
  
  if (nameInput) nameInput.value = item.name
  if (urlInput) urlInput.value = item.url

  const isCustomImage =
    item.faviconUrl &&
    !item.faviconUrl.includes("google.com/s2/favicons") &&
    !item.faviconUrl.startsWith("data:image/svg+xml")
  
  if (imageInput) imageInput.value = isCustomImage ? item.faviconUrl : ""

  const dialog = document.getElementById(cfg.dialogId)
  dialog?.classList.add("show")
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
    showToast(errorMessage, 'error')
    return false
  }
  return true
}

function saveEditedItem(type: ItemType): void {
  const cfg = getItemConfig(type)

  if (currentEditIndex >= 0 && currentEditIndex < cfg.items.length) {
    const name = (document.getElementById(cfg.editNameInputId) as HTMLInputElement | null)?.value.trim() || ""
    const url = (document.getElementById(cfg.editUrlInputId) as HTMLInputElement | null)?.value.trim() || ""
    const imageUrl = (document.getElementById(cfg.editImageInputId) as HTMLInputElement | null)?.value.trim() || ""

    if (!validateFormData(url, `请填写${cfg.label}地址`)) {
      return
    }

    const formattedUrl = formatUrl(url)
    clearDomainCache(cfg.items[currentEditIndex].url)
    const faviconUrl = imageUrl.trim() ? imageUrl : getFaviconUrl(formattedUrl)

    cfg.items[currentEditIndex] = { name, url: formattedUrl, faviconUrl }
    localStorage.setItem(cfg.storageKey, JSON.stringify(cfg.items))

    cfg.editRenderFunc()
  }
  cfg.editCloseDialogFunc()
}

function deleteEditedLink(): void {
  pendingDeleteIndex = currentEditIndex
  closeEditDialog()
  showConfirmDialog()
}

function deleteEditedResource(): void {
  pendingDeleteResourceIndex = currentEditIndex
  closeEditResourceDialog()
  showConfirmResourceDialog()
}

function getFaviconUrl(url: string): string {
  try {
    const domain = extractDomain(url)
    if (!domain) return defaultFaviconSvg()
    
    return `https://favicone.com/${domain}?s=256`
  } catch {
    return defaultFaviconSvg()
  }
}

function getCachedFaviconUrl(url: string): string {
  try {
    const domain = extractDomain(url)
    if (!domain) return defaultFaviconSvg()
    
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
    return defaultFaviconSvg()
  }
}

export { 
  addItem,
  addResource, 
  closeConfirmResourceDialog, 
  confirmDeleteItem,
  closeConfirmDialog, 
  closeEditDialog, 
  closeEditResourceDialog, 
  saveEditedItem,
  showEditDialogByType,
  deleteEditedLink,
  deleteEditedResource,
  getCachedFaviconUrl,
}