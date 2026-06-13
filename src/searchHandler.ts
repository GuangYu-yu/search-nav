import { resolveEngineUrl } from './builtInEngines'
import { currentMode, currentEngine } from './modeManager'

function handleSearch(): void {
  const query = (document.getElementById("searchQuery") as HTMLInputElement | null)?.value
  if (!query) return

  const baseUrl = resolveEngineUrl(currentEngine, currentMode)
  if (!baseUrl) return

  const url = baseUrl + encodeURIComponent(query)
  // 安全校验：仅允许 http/https 协议跳转
  if (!/^https?:\/\//.test(url)) return

  window.location.href = url
}

export { handleSearch }