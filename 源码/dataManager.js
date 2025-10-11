// 数据管理模块
import { updateEngineDropdown } from './engineManager.js'
import { renderLinks, renderResources, renderQuickLinks } from './uiManager.js'

let links = JSON.parse(localStorage.getItem("navLinks")) || []
let resources = JSON.parse(localStorage.getItem("navResources")) || []

// 初始化数据预览
function initializeDataPreview() {
  const data = {
    links: links,
    resources: resources
  }
  const dataStr = JSON.stringify(data, null, 2)
  updateDataPreview(dataStr)
}

// 数据管理功能
function saveDataConfig() {
  const previewElement = document.getElementById("dataPreview")
  if (previewElement) {
    try {
      const data = JSON.parse(previewElement.value)
      if (data.links && data.resources) {
        links.length = 0;
        links.push(...data.links);
        resources.length = 0;
        resources.push(...data.resources);
        localStorage.setItem("navLinks", JSON.stringify(links))
        localStorage.setItem("navResources", JSON.stringify(resources))
        // 需要从其他模块导入这些函数
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

function applyDataFromURL() {
  const urlInput = document.getElementById("dataUrlInput")
  const url = urlInput.value.trim()
  if (!url) {
    alert("请输入URL")
    return
  }

  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error("网络响应不正常")
      }
      return response.json()
    })
    .then((data) => {
      if (data.links && data.resources) {
        const dataStr = JSON.stringify(data, null, 2)
        updateDataPreview(dataStr)
        alert("数据已从URL获取，请点击保存配置应用更改")
      } else {
        alert("URL中的数据格式不正确")
      }
    })
    .catch((err) => {
      console.error("从URL获取数据失败:", err)
      alert("从URL获取数据失败，请检查URL是否正确")
    })
}

function updateDataPreview(data) {
  const previewElement = document.getElementById("dataPreview")
  if (previewElement) {
    previewElement.value = data
  }
}

export { links, resources, initializeDataPreview, saveDataConfig, applyDataFromURL, updateDataPreview }