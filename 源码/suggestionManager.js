// 搜索建议管理模块
// 添加搜索建议相关变量
let suggestionCache = new Map() // 缓存搜索建议
let currentSuggestions = [] // 当前显示的建议
let activeSuggestionIndex = -1 // 当前选中的建议索引

// 为每个搜索引擎维护一个lastRequestTime
const engineLastRequestTime = {
  duckduckgo: 0,
  so360: 0
}

// 搜索引擎建议API配置
const SUGGESTION_APIS = {
  duckduckgo: {
    url: "https://duckduckgo.com/ac/",
    params: { q: "" }
  },
  so360: {
    url: "https://sug.so.360.cn/suggest",
    params: {
      word: "",
      encodein: "utf-8",
      encodeout: "utf-8",
      callback: "callback"
    }
  }
}

// 执行搜索引擎请求的函数
function performRequest(engine, api, query) {
  // 对于DuckDuckGo，使用fetch直接请求
  if (engine === "duckduckgo") {
    return fetch(
      `${api.url}?${new URLSearchParams({ ...api.params, q: query })}`
    )
      .then((response) => response.json())
      .then((data) => {
        const suggestions = data.map((item) => item.phrase)
        return suggestions.map((item) => ({
          text: item,
          source: engine
        }))
      })
      .catch((error) => {
        console.error("DuckDuckGo请求错误:", error)
        return []
      })
  }

  // 对于其他搜索引擎，保持原有的JSONP实现
  return new Promise((resolve, reject) => {
    // 生成唯一的回调函数名
    const callbackName =
      "jsonp_callback_" + Date.now() + "_" + Math.round(Math.random() * 100000)

    // 创建script标签
    const script = document.createElement("script")

    // 设置回调函数
    window[callbackName] = function (data) {
      // 清理script标签和回调函数
      document.head.removeChild(script)
      delete window[callbackName]

      try {
        // 解析不同搜索引擎的响应格式
        let suggestions = []
        if (engine === "so360") {
          // 360搜索API返回的格式是包含word字段的对象数组
          suggestions = data.result
            ? data.result.map((item) => item.word || item)
            : []
        }

        // 确保返回的是字符串数组，并添加来源信息
        const result = suggestions.map((item) => {
          let text = ""
          if (typeof item === "string") {
            text = item
          } else if (typeof item === "object" && item !== null) {
            // 如果是对象，尝试获取其text或label属性
            text = item.text || item.label || JSON.stringify(item)
          } else {
            // 其他情况转换为字符串
            text = String(item)
          }

          // 返回包含文本和来源的对象
          return {
            text: text,
            source: engine
          }
        })

        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    // 构造请求URL
    const params = new URLSearchParams({
      ...api.params,
      [Object.keys(api.params).find(
        (key) =>
          key === "q" || key === "query" || key === "command" || key === "word"
      )]: query,
      [Object.keys(api.params).find(
        (key) => key === "callback" || key === "JsonpCallback"
      )]: callbackName
    })
    const url = `${api.url}?${params}`

    // 设置script标签属性
    script.src = url
    script.onerror = function () {
      // 清理script标签和回调函数
      document.head.removeChild(script)
      delete window[callbackName]
      reject(new Error("Script load error for " + url))
    }

    // 添加script标签到页面
    document.head.appendChild(script)

    // 设置超时处理
    setTimeout(() => {
      if (window[callbackName]) {
        // 清理script标签和回调函数
        document.head.removeChild(script)
        delete window[callbackName]
        reject(new Error("Request timeout for " + engine))
      }
    }, 5000) // 5秒超时
  })
}

// 获取搜索建议
async function fetchSuggestions(query) {
  // 使用缓存避免重复请求
  if (suggestionCache.has(query)) {
    return suggestionCache.get(query)
  }

  // 如果查询为空，清空建议
  if (!query.trim()) {
    return []
  }

  // 获取当前选中的搜索引擎
  const currentEngine = document
    .querySelector(".engine-icon")
    .className.split(" ")
    .find((cls) => cls.endsWith("-icon"))
    .replace("-icon", "")

  // 定义需要请求的搜索引擎
  const enginesToQuery = ["duckduckgo", "so360"]

  try {
    // 并发请求所有搜索引擎的建议API，返回最快的结果
    const requests = enginesToQuery.map((engine) => {
      const api = SUGGESTION_APIS[engine]
      if (!api) {
        return Promise.resolve([])
      }

      // 计算距离上次请求的时间
      const now = Date.now()
      const timeSinceLastRequest = now - engineLastRequestTime[engine]

      // 返回一个Promise，根据需要添加延迟
      return new Promise((resolve) => {
        // 如果距离上次请求不足200ms，延迟到200ms后再发起请求
        if (timeSinceLastRequest < 200) {
          const delay = 200 - timeSinceLastRequest
          setTimeout(() => {
            engineLastRequestTime[engine] = Date.now()
            resolve(performRequest(engine, api, query))
          }, delay)
        } else {
          // 立即发起请求
          engineLastRequestTime[engine] = now
          resolve(performRequest(engine, api, query))
        }
      })
    })

    // 使用Promise.race获取最快返回的结果
    const result = await Promise.race(requests)

    // 缓存结果
    suggestionCache.set(query, result)

    return result
  } catch (error) {
    console.error("获取搜索建议时出错:", error)
    return []
  }
}

// 显示搜索建议
function showSuggestions(suggestions, query) {
  const suggestionsContainer = document.getElementById("suggestionsContainer")
  const searchInput = document.getElementById("searchQuery")

  // 检查搜索框当前内容是否与请求时的查询一致
  if (searchInput.value !== query) {
    // 如果不一致，不显示这些建议
    return
  }

  // 更新当前建议列表
  currentSuggestions = suggestions
  activeSuggestionIndex = -1

  // 如果没有建议，直接隐藏容器
  if (suggestions.length === 0) {
    suggestionsContainer.classList.remove("show")
    return
  }

  // 清空现有内容
  suggestionsContainer.innerHTML = ""

  // 限制只显示前六条建议
  const limitedSuggestions = suggestions.slice(0, 6)

  // 添加建议项
  limitedSuggestions.forEach((suggestion, index) => {
    const suggestionItem = document.createElement("div")
    suggestionItem.className = "suggestion-item"

    // 创建文本节点
    const textNode = document.createTextNode(suggestion.text || suggestion)
    suggestionItem.appendChild(textNode)

    // 创建来源标签
    const sourceSpan = document.createElement("span")
    sourceSpan.className = "suggestion-source"
    sourceSpan.textContent = suggestion.source || ""
    suggestionItem.appendChild(sourceSpan)

    suggestionItem.dataset.index = index

    // 点击事件
    suggestionItem.addEventListener("click", () => {
      searchInput.value = suggestion.text || suggestion
      handleSearch()
    })

    // 鼠标悬停事件
    suggestionItem.addEventListener("mouseenter", () => {
      // 移除其他项的激活状态
      suggestionsContainer
        .querySelectorAll(".suggestion-item")
        .forEach((item) => {
          item.classList.remove("active")
        })
      // 激活当前项
      suggestionItem.classList.add("active")
      activeSuggestionIndex = index
    })

    suggestionsContainer.appendChild(suggestionItem)
  })

  // 显示容器
  suggestionsContainer.classList.add("show")
}

// 隐藏搜索建议
function hideSuggestions() {
  const suggestionsContainer = document.getElementById("suggestionsContainer")
  suggestionsContainer.classList.remove("show")
  currentSuggestions = []
  activeSuggestionIndex = -1
}

// 处理键盘导航
function handleSuggestionNavigation(event) {
  const suggestionsContainer = document.getElementById("suggestionsContainer")

  // 如果建议容器未显示，不处理导航键
  if (!suggestionsContainer.classList.contains("show")) {
    return
  }

  const suggestionItems = suggestionsContainer.querySelectorAll(
    ".suggestion-item"
  )

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      // 只在显示的建议项范围内导航（最多6个）
      if (suggestionItems.length > 0) {
        activeSuggestionIndex =
          (activeSuggestionIndex + 1) % Math.min(currentSuggestions.length, 6)
        updateActiveSuggestion(suggestionItems)
      }
      break
    case "ArrowUp":
      event.preventDefault()
      // 只在显示的建议项范围内导航（最多6个）
      if (suggestionItems.length > 0) {
        activeSuggestionIndex =
          (activeSuggestionIndex - 1 + Math.min(currentSuggestions.length, 6)) %
          Math.min(currentSuggestions.length, 6)
        updateActiveSuggestion(suggestionItems)
      }
      break
    case "Enter":
      // 如果按下了Shift键，允许换行（不阻止默认行为）
      if (event.shiftKey) {
        return
      }
      
      // 没有按下Shift键，阻止默认行为
      event.preventDefault()
      // 如果有激活的建议项，使用它进行搜索
      if (
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < currentSuggestions.length
      ) {
        const searchInput = document.getElementById("searchQuery")
        searchInput.value =
          currentSuggestions[activeSuggestionIndex].text ||
          currentSuggestions[activeSuggestionIndex]
      }
      // 执行搜索
      handleSearch()
      break
    case "Escape":
      event.preventDefault()
      hideSuggestions()
      break
  }
}

// 更新激活的建议项
function updateActiveSuggestion(suggestionItems) {
  // 移除所有项的激活状态
  suggestionItems.forEach((item) => {
    item.classList.remove("active")
  })

  // 激活当前项
  if (
    activeSuggestionIndex >= 0 &&
    activeSuggestionIndex < suggestionItems.length
  ) {
    suggestionItems[activeSuggestionIndex].classList.add("active")

    // 滚动到可见区域
    suggestionItems[activeSuggestionIndex].scrollIntoView({
      block: "nearest",
      behavior: "smooth"
    })
  }
}

export { 
  fetchSuggestions, 
  showSuggestions, 
  hideSuggestions, 
  handleSuggestionNavigation 
}