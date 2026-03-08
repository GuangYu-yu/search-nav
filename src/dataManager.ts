import { LinkItem, ResourceItem } from './types'
import { updateEngineDropdown } from './engineManager'
import { renderLinks, renderResources, renderQuickLinks } from './uiManager'

type DataConfig = {
  links: LinkItem[]
  resources: ResourceItem[]
}

let links: LinkItem[] = JSON.parse(localStorage.getItem("navLinks") || "[]") || []
let resources: ResourceItem[] = JSON.parse(localStorage.getItem("navResources") || "[]") || []

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
        alert("配置已保存")
      } else {
        alert("数据格式不正确")
      }
    } catch (err) {
      console.error("保存失败:", err)
      alert("保存失败，数据不是有效的JSON格式")
    }
  }
}

function applyDataFromURL(): void {
  const urlInput = document.getElementById("dataUrlInput") as HTMLInputElement | null
  const url: string | undefined = urlInput?.value.trim()
  if (!url) {
    alert("请输入URL")
    return
  }

  fetch(url)
    .then((response: Response): Promise<DataConfig> => {
      if (!response.ok) {
        throw new Error("网络响应不正常")
      }
      return response.json()
    })
    .then((data: DataConfig) => {
      if (data.links && data.resources) {
        const dataStr = JSON.stringify(data, null, 2)
        updateDataPreview(dataStr)
        alert("数据已从URL获取，请点击保存配置应用更改")
      } else {
        alert("URL中的数据格式不正确")
      }
    })
    .catch((err: Error) => {
      console.error("从URL获取数据失败:", err)
      alert("从URL获取数据失败，请检查URL是否正确")
    })
}

function updateDataPreview(data: string): void {
  const previewElement = document.getElementById("dataPreview") as HTMLTextAreaElement | null
  if (previewElement) {
    previewElement.value = data
  }
}

export { links, resources, initializeDataPreview, saveDataConfig, applyDataFromURL, updateDataPreview }