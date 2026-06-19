import { SuggestionItem, SuggestionAPI } from './types'
import { handleSearch } from './searchHandler'

interface EngineConfig {
  api: SuggestionAPI
  parse(data: unknown): string[]
  lastRequestTime: number
}

const ENGINE_CONFIGS: Record<string, EngineConfig> = {
  // Google 搜索建议
  google: {
    api: {
      url: "https://www.google.com/complete/search",
      params: {
        q: "",
        client: "gws-wiz",
        hl: "zh-CN",
        callback: "callback"
      }
    },
    parse(data: unknown): string[] {
      const d = data as [Array<[string]>, unknown]
      return Array.isArray(d) && Array.isArray(d[0]) ? d[0].map(item => item[0]) : []
    },
    lastRequestTime: 0
  },
  // 百度搜索建议
  baidu: {
    api: {
      url: "https://suggestion.baidu.com/su",
      params: {
        wd: "",
        cb: "callback"
      }
    },
    parse(data: unknown): string[] {
      const d = data as { s?: string[] }
      return d?.s ?? []
    },
    lastRequestTime: 0
  }
}

// 联想词来源偏好
const SUGGESTION_SOURCE_KEY = "preferredSuggestionSource"

function getSuggestionSource(): string {
  return localStorage.getItem(SUGGESTION_SOURCE_KEY) || "google"
}

function setSuggestionSource(source: string): void {
  localStorage.setItem(SUGGESTION_SOURCE_KEY, source)
}

// ============================================================
// 全局状态
// ============================================================

let jsonpCounter = 0
let suggestionCache: Map<string, SuggestionItem[]> = new Map()
let currentSuggestions: SuggestionItem[] = []
let activeSuggestionIndex = -1
let debounceTimer: NodeJS.Timeout | null = null

const MAX_SUGGESTIONS = 8

// 中/英文引号替换为空格，避免被编码为 %27 / %22 导致 JSONP 请求中断
function sanitizeQuery(query: string): string {
  return query.replace(/[''""`'"]/g, ' ').trim()
}

function performRequest(engine: string, config: EngineConfig, query: string): Promise<SuggestionItem[]> {
  return new Promise((resolve, reject) => {
    const safeQuery = sanitizeQuery(query)
    const callbackName = `jsonp_callback_${Date.now()}_${++jsonpCounter}`
    const win = (window as unknown) as Record<string, unknown>
    const api = config.api

    const script = document.createElement("script")

    win[callbackName] = function (data: unknown) {
      document.head.removeChild(script)
      delete win[callbackName]

      try {
        const suggestions: string[] = config.parse(data)
        const result: SuggestionItem[] = suggestions.map((text) => ({
          text,
          source: engine
        }))
        resolve(result)
      } catch (error) {
        reject(error)
      }
    }

    const params = new URLSearchParams({
      ...api.params,
      [Object.keys(api.params).find(
        (key) =>
          key === "q" || key === "query" || key === "command" || key === "word" || key === "wd" || key === "qry"
      ) || "q"]: safeQuery,
      [Object.keys(api.params).find(
        (key) => key === "callback" || key === "JsonpCallback" || key === "cb"
      ) || "callback"]: callbackName
    })
    const url = `${api.url}?${params}`

    script.src = url
    script.onerror = function () {
      document.head.removeChild(script)
      delete win[callbackName]
      reject(new Error("Script load error for " + url))
    }

    document.head.appendChild(script)

    setTimeout(() => {
      if (win[callbackName]) {
        document.head.removeChild(script)
        delete win[callbackName]
        reject(new Error("Request timeout for " + engine))
      }
    }, 5000)
  })
}

function fetchSuggestions(query: string): Promise<SuggestionItem[]> {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  return new Promise((resolve) => {
    debounceTimer = setTimeout(() => {
      if (suggestionCache.has(query)) {
        resolve(suggestionCache.get(query) || [])
        return
      }

      if (!query.trim()) {
        resolve([])
        return
      }

      try {
        const source = getSuggestionSource()
        const config = ENGINE_CONFIGS[source]
        if (!config) {
          resolve([])
          return
        }

        const now = Date.now()
        const timeSinceLastRequest = now - config.lastRequestTime

        new Promise<SuggestionItem[]>((resolveReq) => {
          if (timeSinceLastRequest < 200) {
            const delay = 200 - timeSinceLastRequest
            setTimeout(() => {
              config.lastRequestTime = Date.now()
              resolveReq(performRequest(source, config, query))
            }, delay)
          } else {
            config.lastRequestTime = now
            resolveReq(performRequest(source, config, query))
          }
        }).then(result => {
          suggestionCache.set(query, result)
          if (suggestionCache.size > 50) {
            const firstKey = suggestionCache.keys().next().value
            if (firstKey !== undefined) suggestionCache.delete(firstKey)
          }
          resolve(result)
        })
      } catch (error) {
        console.error("获取搜索建议时出错:", error)
        resolve([])
      }
    }, 300)
  })
}

function showSuggestions(suggestions: SuggestionItem[], query: string): void {
  const suggestionsContainer = document.getElementById("suggestionsContainer")
  const searchInput = document.getElementById("searchQuery") as HTMLInputElement | null

  if (!suggestionsContainer || !searchInput) return

  if (searchInput.value !== query) {
    return
  }

  currentSuggestions = suggestions
  activeSuggestionIndex = -1

  if (suggestions.length === 0) {
    suggestionsContainer.classList.remove("show")
    return
  }

  suggestionsContainer.innerHTML = ""

  const limitedSuggestions = suggestions.slice(0, MAX_SUGGESTIONS)

  limitedSuggestions.forEach((suggestion, index) => {
    const suggestionItem = document.createElement("div")
    suggestionItem.className = "suggestion-item"

    const textNode = document.createTextNode(suggestion.text || "")
    suggestionItem.appendChild(textNode)

    const sourceSpan = document.createElement("span")
    sourceSpan.className = "suggestion-source"
    sourceSpan.textContent = suggestion.source || ""
    suggestionItem.appendChild(sourceSpan)

    suggestionItem.dataset.index = String(index)

    suggestionItem.addEventListener("mousedown", (e) => {
      e.preventDefault()
      searchInput.value = suggestion.text || ""
      handleSearch()
    })

    suggestionItem.addEventListener("mouseenter", () => {
      suggestionsContainer
        .querySelectorAll(".suggestion-item")
        .forEach((item) => {
          item.classList.remove("active")
        })
      suggestionItem.classList.add("active")
      activeSuggestionIndex = index
    })

    suggestionsContainer.appendChild(suggestionItem)
  })

  suggestionsContainer.classList.add("show")
}

function hideSuggestions(): void {
  const suggestionsContainer = document.getElementById("suggestionsContainer")
  suggestionsContainer?.classList.remove("show")
  currentSuggestions = []
  activeSuggestionIndex = -1
  if (debounceTimer) {
    clearTimeout(debounceTimer)
    debounceTimer = null
  }
}

function handleSuggestionNavigation(event: KeyboardEvent): void {
  const suggestionsContainer = document.getElementById("suggestionsContainer")

  if (!suggestionsContainer?.classList.contains("show")) {
    return
  }

  const suggestionItems = suggestionsContainer.querySelectorAll(
    ".suggestion-item"
  )

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault()
      if (suggestionItems.length > 0) {
        activeSuggestionIndex =
          (activeSuggestionIndex + 1) % Math.min(currentSuggestions.length, MAX_SUGGESTIONS)
        updateActiveSuggestion(suggestionItems)
      }
      break
    case "ArrowUp":
      event.preventDefault()
      if (suggestionItems.length > 0) {
        activeSuggestionIndex =
          (activeSuggestionIndex - 1 + Math.min(currentSuggestions.length, MAX_SUGGESTIONS)) %
          Math.min(currentSuggestions.length, MAX_SUGGESTIONS)
        updateActiveSuggestion(suggestionItems)
      }
      break
    case "Enter":
      if (event.shiftKey) {
        return
      }
      
      event.preventDefault()
      if (
        activeSuggestionIndex >= 0 &&
        activeSuggestionIndex < currentSuggestions.length
      ) {
        const searchInput = document.getElementById("searchQuery") as HTMLInputElement | null
        if (searchInput) {
          searchInput.value =
            currentSuggestions[activeSuggestionIndex].text ||
            ""
        }
      }
      handleSearch()
      break
    case "Escape":
      event.preventDefault()
      hideSuggestions()
      break
  }
}

function updateActiveSuggestion(suggestionItems: NodeListOf<Element>): void {
  suggestionItems.forEach((item) => {
    item.classList.remove("active")
  })

  if (
    activeSuggestionIndex >= 0 &&
    activeSuggestionIndex < suggestionItems.length
  ) {
    suggestionItems[activeSuggestionIndex].classList.add("active")

    ;(suggestionItems[activeSuggestionIndex] as HTMLElement).scrollIntoView({
      block: "nearest",
      behavior: "smooth"
    })
  }
}

/** 初始化设置页的联想词来源切换按钮状态和事件 */
function initSuggestionSourceToggle(): void {
  const toggle = document.getElementById("suggestionSourceToggle")
  if (!toggle) return

  // 从 localStorage 恢复选中态
  const saved = getSuggestionSource()
  toggle.querySelectorAll(".ss-option").forEach(el => {
    el.classList.toggle("active", el.getAttribute("data-source") === saved)
  })

  // 点击切换
  toggle.addEventListener("click", (e) => {
    const option = (e.target as HTMLElement).closest(".ss-option")
    if (!option) return
    const source = option.getAttribute("data-source")
    if (!source) return

    toggle.querySelectorAll(".ss-option").forEach(el => el.classList.remove("active"))
    option.classList.add("active")
    setSuggestionSource(source)

    // 切换后清空缓存，使下次联想词使用新源
    suggestionCache.clear()
  })
}

export { 
  fetchSuggestions, 
  showSuggestions, 
  hideSuggestions, 
  handleSuggestionNavigation,
  initSuggestionSourceToggle,
}