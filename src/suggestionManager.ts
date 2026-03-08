import { SuggestionItem, SuggestionAPI } from './types'
import { handleSearch } from './searchHandler'

declare global {
  interface Window {
    [key: string]: any
  }
}

let suggestionCache: Map<string, SuggestionItem[]> = new Map()
let currentSuggestions: SuggestionItem[] = []
let activeSuggestionIndex: number = -1

const engineLastRequestTime: Record<string, number> = {
  duckduckgo: 0,
  so360: 0
}

const SUGGESTION_APIS: Record<string, SuggestionAPI> = {
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

function performRequest(engine: string, api: SuggestionAPI, query: string): Promise<SuggestionItem[]> {
  if (engine === "duckduckgo") {
    return fetch(
      `${api.url}?${new URLSearchParams({ ...api.params, q: query })}`
    )
      .then((response) => response.json())
      .then((data) => {
        const suggestions = data.map((item: any) => item.phrase)
        return suggestions.map((item: string) => ({
          text: item,
          source: engine
        }))
      })
      .catch((error) => {
        console.error("DuckDuckGo请求错误:", error)
        return []
      })
  }

  return new Promise((resolve, reject) => {
    const callbackName =
      "jsonp_callback_" + Date.now() + "_" + Math.round(Math.random() * 100000)

    const script = document.createElement("script")

    window[callbackName] = function (data: any) {
      document.head.removeChild(script)
      delete window[callbackName]

      try {
        let suggestions: (string | { text?: string; label?: string; word?: string })[] = []
        if (engine === "so360") {
          suggestions = data.result
            ? data.result.map((item: any) => item.word || item)
            : []
        }

        const result: SuggestionItem[] = suggestions.map((item) => {
          let text = ""
          if (typeof item === "string") {
            text = item
          } else if (typeof item === "object" && item !== null) {
            text = item.text || item.label || item.word || JSON.stringify(item)
          } else {
            text = String(item)
          }

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

    const params = new URLSearchParams({
      ...api.params,
      [Object.keys(api.params).find(
        (key) =>
          key === "q" || key === "query" || key === "command" || key === "word"
      ) || "q"]: query,
      [Object.keys(api.params).find(
        (key) => key === "callback" || key === "JsonpCallback"
      ) || "callback"]: callbackName
    })
    const url = `${api.url}?${params}`

    script.src = url
    script.onerror = function () {
      document.head.removeChild(script)
      delete window[callbackName]
      reject(new Error("Script load error for " + url))
    }

    document.head.appendChild(script)

    setTimeout(() => {
      if (window[callbackName]) {
        document.head.removeChild(script)
        delete window[callbackName]
        reject(new Error("Request timeout for " + engine))
      }
    }, 5000)
  })
}

async function fetchSuggestions(query: string): Promise<SuggestionItem[]> {
  if (suggestionCache.has(query)) {
    return suggestionCache.get(query) || []
  }

  if (!query.trim()) {
    return []
  }

  const enginesToQuery = ["duckduckgo", "so360"]

  try {
    const requests = enginesToQuery.map((engine) => {
      const api = SUGGESTION_APIS[engine]
      if (!api) {
        return Promise.resolve([])
      }

      const now = Date.now()
      const timeSinceLastRequest = now - engineLastRequestTime[engine]

      return new Promise<SuggestionItem[]>((resolve) => {
        if (timeSinceLastRequest < 200) {
          const delay = 200 - timeSinceLastRequest
          setTimeout(() => {
            engineLastRequestTime[engine] = Date.now()
            resolve(performRequest(engine, api, query))
          }, delay)
        } else {
          engineLastRequestTime[engine] = now
          resolve(performRequest(engine, api, query))
        }
      })
    })

    const result = await Promise.race(requests)
    suggestionCache.set(query, result)

    return result
  } catch (error) {
    console.error("获取搜索建议时出错:", error)
    return []
  }
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

  const limitedSuggestions = suggestions.slice(0, 6)

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

    suggestionItem.addEventListener("click", () => {
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
          (activeSuggestionIndex + 1) % Math.min(currentSuggestions.length, 6)
        updateActiveSuggestion(suggestionItems)
      }
      break
    case "ArrowUp":
      event.preventDefault()
      if (suggestionItems.length > 0) {
        activeSuggestionIndex =
          (activeSuggestionIndex - 1 + Math.min(currentSuggestions.length, 6)) %
          Math.min(currentSuggestions.length, 6)
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

export { 
  fetchSuggestions, 
  showSuggestions, 
  hideSuggestions, 
  handleSuggestionNavigation 
}