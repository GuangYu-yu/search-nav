import { LinkItem, ResourceItem } from './types'
import { updateEngineDropdown } from './engineManager'
import { renderLinks, renderResources, renderQuickLinks } from './uiManager'
import { showToast } from './toast'

type DataConfig = {
  links: LinkItem[]
  resources: ResourceItem[]
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) } catch { /* ignore */ }
  return fallback
}

let links: LinkItem[] = safeParse<LinkItem[]>(localStorage.getItem("navLinks"), [])
let resources: ResourceItem[] = safeParse<ResourceItem[]>(localStorage.getItem("navResources"), [])

function initializeDataPreview(): void {
  const data: DataConfig = {
    links: links,
    resources: resources
  }
  const dataStr = JSON.stringify(data, null, 2)
  updateDataPreview(dataStr)
}

function saveDataConfig(): void {
  const previewElement = document.getElementById("dataPreview") as HTMLTextAreaElement | null
  if (previewElement) {
    try {
      const data: DataConfig = JSON.parse(previewElement.value)
      if (data.links && data.resources) {
        links.length = 0
        links.push(...data.links)
        resources.length = 0
        resources.push(...data.resources)
        localStorage.setItem("navLinks", JSON.stringify(links))
        localStorage.setItem("navResources", JSON.stringify(resources))
        renderLinks()
        renderResources()
        renderQuickLinks()
        updateEngineDropdown()
        showToast("配置已保存", 'success')
      } else {
        showToast("数据格式不正确", 'error')
      }
    } catch (err) {
      console.error("保存失败:", err)
      showToast("保存失败，数据不是有效的JSON格式", 'error')
    }
  }
}

function applyDataFromURL(): void {
  const urlInput = document.getElementById("dataUrlInput") as HTMLInputElement | null
  const url: string | undefined = urlInput?.value.trim()
  if (!url) {
    showToast("请输入URL", 'error')
    return
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 10000)

  fetch(url, { signal: controller.signal })
    .then((response: Response): Promise<DataConfig> => {
      clearTimeout(timeoutId)
      if (!response.ok) {
        throw new Error("网络响应不正常")
      }
      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("application/json")) {
        throw new Error("响应不是有效的JSON格式")
      }
      return response.json()
    })
    .then((data: DataConfig) => {
      if (data.links && data.resources) {
        const dataStr = JSON.stringify(data, null, 2)
        updateDataPreview(dataStr)
        showToast("数据已从URL获取，请点击保存配置应用更改", 'success')
      } else {
        showToast("URL中的数据格式不正确", 'error')
      }
    })
    .catch((err: Error) => {
      if (err.name === "AbortError") {
        showToast("请求超时，请检查URL是否正确", 'error')
        return
      }
      console.error("从URL获取数据失败:", err)
      showToast("从URL获取数据失败，请检查URL是否正确", 'error')
    })
}

function updateDataPreview(data: string): void {
  const previewElement = document.getElementById("dataPreview") as HTMLTextAreaElement | null
  if (previewElement) {
    previewElement.value = data
  }
}

export { links, resources, initializeDataPreview, saveDataConfig, applyDataFromURL }