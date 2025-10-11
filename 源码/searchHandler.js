// 搜索处理模块
import { searchEngines, resourceEngines, translateEngines } from './searchEngines.js'
import { currentMode, currentEngine } from './modeManager.js'

// 处理搜索
function handleSearch() {
  const query = document.getElementById("searchQuery").value.trim()
  if (!query) {
    return
  }

  let url
  if (currentMode === "translate") {
    // 翻译模式
    url = translateEngines[currentEngine] + encodeURIComponent(query)
  } else if (currentMode === "resource") {
    // 资源模式
    url = resourceEngines[currentEngine] + encodeURIComponent(query)
  } else {
    // 搜索模式
    url = searchEngines[currentEngine] + encodeURIComponent(query)
  }

  window.location.href = url
}

export { handleSearch }