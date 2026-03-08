import { SearchEngines } from './types'
import { resourceEngines } from './searchEngines'
import { currentMode, setCurrentEngine } from './modeManager'
import { resources } from './dataManager'

function updateEngineDropdown(): void {
  const dropdown = document.getElementById("engineDropdown")
  if (!dropdown) return
  
  dropdown.innerHTML = ""

  if (currentMode === "translate") {
    dropdown.innerHTML = `
      <div class="engine-option" data-engine="google" data-display-name="Google翻译">
        <div class="engine-icon google-icon"></div>
        <span class="engine-name">Google翻译</span>
      </div>
      <div class="engine-option" data-engine="bing" data-display-name="Bing翻译">
        <div class="engine-icon bing-icon"></div>
        <span class="engine-name">Bing翻译</span>
      </div>
      <div class="engine-option" data-engine="deepl" data-display-name="DeepL">
        <div class="engine-icon deepl-icon"></div>
        <span class="engine-name">DeepL</span>
      </div>
      <div class="engine-option" data-engine="baidu" data-display-name="百度翻译">
        <div class="engine-icon baidu-icon"></div>
        <span class="engine-name">百度翻译</span>
      </div>
      <div class="engine-option" data-engine="yandex" data-display-name="Yandex翻译">
        <div class="engine-icon yandex-icon"></div>
        <span class="engine-name">Yandex翻译</span>
      </div>
    `
  } else if (currentMode === "resource") {
    let resourceDropdownHTML = `
      <div class="engine-option" data-engine="zhihu" data-display-name="知乎">
        <div class="engine-icon zhihu-icon"></div>
        <span class="engine-name">知乎</span>
      </div>
      <div class="engine-option" data-engine="wikipedia" data-display-name="Wikipedia">
        <div class="engine-icon wikipedia-icon"></div>
        <span class="engine-name">Wikipedia</span>
      </div>
      <div class="engine-option" data-engine="weibo" data-display-name="微博">
        <div class="engine-icon weibo-icon"></div>
        <span class="engine-name">微博</span>
      </div>
      <div class="engine-option" data-engine="xiaohongshu" data-display-name="小红书">
        <div class="engine-icon xiaohongshu-icon"></div>
        <span class="engine-name">小红书</span>
      </div>
      <div class="engine-option" data-engine="reddit" data-display-name="Reddit">
        <div class="engine-icon reddit-icon"></div>
        <span class="engine-name">Reddit</span>
      </div>
      <div class="engine-option" data-engine="x" data-display-name="X">
        <div class="engine-icon x-icon"></div>
        <span class="engine-name">X</span>
      </div>
      <div class="engine-option" data-engine="bilibili" data-display-name="哔哩哔哩">
        <div class="engine-icon bilibili-icon"></div>
        <span class="engine-name">哔哩哔哩</span>
      </div>
      <div class="engine-option" data-engine="douyin" data-display-name="抖音">
        <div class="engine-icon douyin-icon"></div>
        <span class="engine-name">抖音</span>
      </div>
      <div class="engine-option" data-engine="kuaishou" data-display-name="快手">
        <div class="engine-icon kuaishou-icon"></div>
        <span class="engine-name">快手</span>
      </div>
      <div class="engine-option" data-engine="taobao" data-display-name="淘宝">
        <div class="engine-icon taobao-icon"></div>
        <span class="engine-name">淘宝</span>
      </div>
      <div class="engine-option" data-engine="amazon" data-display-name="Amazon">
        <div class="engine-icon amazon-icon"></div>
        <span class="engine-name">Amazon</span>
      </div>
      <div class="engine-option" data-engine="jingdong" data-display-name="京东">
        <div class="engine-icon jingdong-icon"></div>
        <span class="engine-name">京东</span>
      </div>
    `

    resources.forEach((resource, index) => {
      const customEngineId = `custom_${index}`
      const searchUrl = resource.url

      ;(resourceEngines as SearchEngines)[customEngineId] = searchUrl

      resourceDropdownHTML += `
        <div class="engine-option" data-engine="${customEngineId}" data-display-name="${resource.name}">
          <div class="engine-icon" style="background-image: url('${
            resource.faviconUrl ||
            'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="8" y="12" font-size="12" text-anchor="middle" fill="%23666">📂</text></svg>'
          }')"></div>
          <span class="engine-name">${resource.name}</span>
        </div>
      `
    })

    dropdown.innerHTML = resourceDropdownHTML
  } else {
    dropdown.innerHTML = `
      <div class="engine-option" data-engine="google" data-display-name="Google">
        <div class="engine-icon google-icon"></div>
        <span class="engine-name">Google</span>
      </div>
      <div class="engine-option" data-engine="bing" data-display-name="Bing">
        <div class="engine-icon bing-icon"></div>
        <span class="engine-name">Bing</span>
      </div>
      <div class="engine-option" data-engine="baidu" data-display-name="百度">
        <div class="engine-icon baidu-icon"></div>
        <span class="engine-name">百度</span>
      </div>
      <div class="engine-option" data-engine="yandex" data-display-name="Yandex">
        <div class="engine-icon yandex-icon"></div>
        <span class="engine-name">Yandex</span>
      </div>
      <div class="engine-option" data-engine="duckduckgo" data-display-name="DuckDuckGo">
        <div class="engine-icon duckduckgo-icon"></div>
        <span class="engine-name">DuckDuckGo</span>
      </div>
      <div class="engine-option" data-engine="ecosia" data-display-name="Ecosia">
        <div class="engine-icon ecosia-icon"></div>
        <span class="engine-name">Ecosia</span>
      </div>
      <div class="engine-option" data-engine="yahoo" data-display-name="Yahoo!">
        <div class="engine-icon yahoo-icon"></div>
        <span class="engine-name">Yahoo!</span>
      </div>
      <div class="engine-option" data-engine="brave" data-display-name="Brave">
        <div class="engine-icon brave-icon"></div>
        <span class="engine-name">Brave</span>
      </div>
      <div class="engine-option" data-engine="qwant" data-display-name="Qwant">
        <div class="engine-icon qwant-icon"></div>
        <span class="engine-name">Qwant</span>
      </div>
      <div class="engine-option" data-engine="aol" data-display-name="AOL">
        <div class="engine-icon aol-icon"></div>
        <span class="engine-name">AOL</span>
      </div>
    `
  }
}

function toggleEngineDropdown(): void {
  const dropdown = document.getElementById("engineDropdown")
  const suggestionsContainer = document.getElementById("suggestionsContainer")

  dropdown?.classList.toggle("show")

  if (dropdown?.classList.contains("show")) {
    if (suggestionsContainer) suggestionsContainer.style.opacity = "0.3"
  } else {
    if (suggestionsContainer) suggestionsContainer.style.opacity = ""
  }
}

function selectEngine(engine: string, displayName: string): void {
  setCurrentEngine(engine)
  const selector = document.querySelector(".engine-selector")
  if (!selector) return
  
  const icon = selector.querySelector(".engine-icon") as HTMLElement | null
  const nameSpan = selector.querySelector(".engine-name") as HTMLElement | null

  if (currentMode === "resource" && engine.startsWith("custom_")) {
    const index = parseInt(engine.replace("custom_", ""))
    if (index >= 0 && index < resources.length) {
      const resource = resources[index]
      if (icon) {
        icon.className = "engine-icon"
        icon.style.backgroundImage = `url('${
          resource.faviconUrl ||
          'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="8" y="12" font-size="12" text-anchor="middle" fill="%23666">📂</text></svg>'
        }')`
      }
    }
  } else {
    if (icon) {
      icon.className = "engine-icon " + engine + "-icon"
      icon.style.backgroundImage = ""
    }
  }

  if (nameSpan) {
    nameSpan.textContent = displayName
  }

  const dropdown = document.getElementById("engineDropdown")
  if (dropdown) {
    dropdown.classList.remove("show")
    const suggestionsContainer = document.getElementById("suggestionsContainer")
    if (suggestionsContainer) suggestionsContainer.style.opacity = ""
  }
}

export { updateEngineDropdown, toggleEngineDropdown, selectEngine }