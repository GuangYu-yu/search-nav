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
    // 检查是否是网址
    if (isURL(query)) {
      url = query.startsWith("http") ? query : "https://" + query
    } else {
      url = searchEngines[currentEngine] + encodeURIComponent(query)
    }
  }

  window.location.href = url
}

// 判断是否是网址的函数
function isURL(string) {
  // 如果包含空格，不是网址
  if (string.includes(" ")) {
    return false
  }

  // 如果以http或https开头，很可能是网址
  if (string.startsWith("http://") || string.startsWith("https://")) {
    return true
  }

  // 检查是否符合网址格式（域名.顶级域名）
  const urlPattern = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.[a-zA-Z]{2,}([\/?#]|$)/
  return urlPattern.test(string)
}

export { handleSearch, isURL }