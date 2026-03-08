import { searchEngines, resourceEngines, translateEngines } from './searchEngines'
import { currentMode, currentEngine } from './modeManager'

function handleSearch(): void {
  const query = (document.getElementById("searchQuery") as HTMLInputElement | null)?.value
  if (!query) {
    return
  }

  let url: string
  if (currentMode === "translate") {
    const encodedQuery = encodeURIComponent(query)
    url = translateEngines[currentEngine] + encodedQuery
  } else if (currentMode === "resource") {
    url = resourceEngines[currentEngine] + encodeURIComponent(query)
  } else {
    url = searchEngines[currentEngine] + encodeURIComponent(query)
  }

  window.location.href = url
}

export { handleSearch }