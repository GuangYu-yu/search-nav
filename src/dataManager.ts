import { LinkItem, ResourceItem, Mode } from './types'
import { updateEngineDropdown } from './engineManager'
import { renderLinks, renderQuickLinks } from './uiManager'
import { showToast } from './toast'

interface CustomEngine {
  id: string
  name: string
  url: string
  faviconUrl: string
  category: Mode
}

interface EngineOrderMap {
  search: string[]
  translate: string[]
  resource: string[]
}

type DataConfig = {
  links: LinkItem[]
  customEngines: CustomEngine[]
  customFaviconOverrides: Record<string, string>
  engineOrders: EngineOrderMap
}

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try { return JSON.parse(raw) } catch { /* ignore */ }
  return fallback
}

let links = safeParse<LinkItem[]>(localStorage.getItem("navLinks"), [])
let resources = safeParse<ResourceItem[]>(localStorage.getItem("navResources"), [])

function loadAllData(): DataConfig {
  return {
    links: [...links],
    customEngines: safeParse<CustomEngine[]>(localStorage.getItem("customEngines"), []),
    customFaviconOverrides: safeParse<Record<string, string>>(localStorage.getItem("customFaviconOverrides"), {}),
    engineOrders: {
      search: safeParse<string[]>(localStorage.getItem("engine_order_search"), []),
      translate: safeParse<string[]>(localStorage.getItem("engine_order_translate"), []),
      resource: safeParse<string[]>(localStorage.getItem("engine_order_resource"), [])
    }
  }
}

function saveAllData(data: DataConfig): void {
  // 书签
  links.length = 0
  links.push(...data.links)
  localStorage.setItem("navLinks", JSON.stringify(links))

  // 自定义引擎
  localStorage.setItem("customEngines", JSON.stringify(data.customEngines || []))

  // 引擎图标覆盖
  localStorage.setItem("customFaviconOverrides", JSON.stringify(data.customFaviconOverrides || {}))

  // 引擎排序
  const orders = data.engineOrders || { search: [], translate: [], resource: [] }
  localStorage.setItem("engine_order_search", JSON.stringify(orders.search || []))
  localStorage.setItem("engine_order_translate", JSON.stringify(orders.translate || []))
  localStorage.setItem("engine_order_resource", JSON.stringify(orders.resource || []))
}

function initializeDataPreview(): void {
  const data = loadAllData()
  const dataStr = JSON.stringify(data, null, 2)
  updateDataPreview(dataStr)
}

function saveDataConfig(): void {
  const previewElement = document.getElementById("dataPreview") as HTMLTextAreaElement | null
  if (previewElement) {
    try {
      const data: DataConfig = JSON.parse(previewElement.value)
      if (data.links) {
        saveAllData(data)
        renderLinks()
        renderQuickLinks()
        updateEngineDropdown()
        // 重新渲染引擎列表
        import('./builtInEngines').then(m => {
          m.renderEngineList("searchEngineList", "search")
          m.renderEngineList("translateEngineList", "translate")
          m.renderEngineList("resourceEngineList", "resource")
          m.updateDefaultLabel("search")
          m.updateDefaultLabel("translate")
          m.updateDefaultLabel("resource")
        })
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
      if (data.links) {
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