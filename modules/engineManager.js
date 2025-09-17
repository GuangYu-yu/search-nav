// 引擎管理模块
import { resourceEngines } from './searchEngines.js'
import { currentMode, setCurrentEngine } from './modeManager.js'
import { resources } from './dataManager.js'

// 更新引擎下拉菜单内容
function updateEngineDropdown() {
  const dropdown = document.getElementById("engineDropdown")
  dropdown.innerHTML = ""

  if (currentMode === "translate") {
    // 翻译模式下只显示翻译引擎
    dropdown.innerHTML = `
            <div class="engine-option" onclick="selectEngine('google', 'Google翻译')">
                <div class="engine-icon google-icon"></div>
                <span class="engine-name">Google翻译</span>
            </div>
            <div class="engine-option" onclick="selectEngine('bing', 'Bing翻译')">
                <div class="engine-icon bing-icon"></div>
                <span class="engine-name">Bing翻译</span>
            </div>
            <div class="engine-option" onclick="selectEngine('deepl', 'DeepL')">
                <div class="engine-icon deepl-icon"></div>
                <span class="engine-name">DeepL</span>
            </div>
            <div class="engine-option" onclick="selectEngine('baidu', '百度翻译')">
                <div class="engine-icon baidu-icon"></div>
                <span class="engine-name">百度翻译</span>
            </div>
            <div class="engine-option" onclick="selectEngine('yandex', 'Yandex翻译')">
                <div class="engine-icon yandex-icon"></div>
                <span class="engine-name">Yandex翻译</span>
            </div>
        `
  } else if (currentMode === "resource") {
    // 资源模式下显示资源搜索引擎
    let resourceDropdownHTML = `
            <div class="engine-option" onclick="selectEngine('zhihu', '知乎')">
                <div class="engine-icon zhihu-icon"></div>
                <span class="engine-name">知乎</span>
            </div>
            <div class="engine-option" onclick="selectEngine('weibo', '微博')">
                <div class="engine-icon weibo-icon"></div>
                <span class="engine-name">微博</span>
            </div>
            <div class="engine-option" onclick="selectEngine('xiaohongshu', '小红书')">
                <div class="engine-icon xiaohongshu-icon"></div>
                <span class="engine-name">小红书</span>
            </div>
            <div class="engine-option" onclick="selectEngine('bilibili', '哔哩哔哩')">
                <div class="engine-icon bilibili-icon"></div>
                <span class="engine-name">哔哩哔哩</span>
            </div>
            <div class="engine-option" onclick="selectEngine('douyin', '抖音')">
                <div class="engine-icon douyin-icon"></div>
                <span class="engine-name">抖音</span>
            </div>
            <div class="engine-option" onclick="selectEngine('taobao', '淘宝')">
                <div class="engine-icon taobao-icon"></div>
                <span class="engine-name">淘宝</span>
            </div>
        `

    // 添加用户自定义的资源条目
    resources.forEach((resource, index) => {
      // 为用户自定义资源生成唯一的引擎标识符
      const customEngineId = `custom_${index}`
      const searchUrl = resource.url

      // 添加到资源引擎对象中
      resourceEngines[customEngineId] = searchUrl

      // 添加到下拉菜单HTML中
      resourceDropdownHTML += `
                <div class="engine-option" onclick="selectEngine('${customEngineId}', '${
        resource.name
      }')">
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
    // 搜索模式下显示所有搜索引擎
    dropdown.innerHTML = `
            <div class="engine-option" onclick="selectEngine('google', 'Google')">
                <div class="engine-icon google-icon"></div>
                <span class="engine-name">Google</span>
            </div>
            <div class="engine-option" onclick="selectEngine('bing', 'Bing')">
                <div class="engine-icon bing-icon"></div>
                <span class="engine-name">Bing</span>
            </div>
            <div class="engine-option" onclick="selectEngine('baidu', '百度')">
                <div class="engine-icon baidu-icon"></div>
                <span class="engine-name">百度</span>
            </div>
            <div class="engine-option" onclick="selectEngine('yandex', 'Yandex')">
                <div class="engine-icon yandex-icon"></div>
                <span class="engine-name">Yandex</span>
            </div>
            <div class="engine-option" onclick="selectEngine('duckduckgo', 'DuckDuckGo')">
                <div class="engine-icon duckduckgo-icon"></div>
                <span class="engine-name">DuckDuckGo</span>
            </div>
            <div class="engine-option" onclick="selectEngine('ecosia', 'Ecosia')">
                <div class="engine-icon ecosia-icon"></div>
                <span class="engine-name">Ecosia</span>
            </div>
            <div class="engine-option" onclick="selectEngine('yahoo', 'Yahoo!')">
                <div class="engine-icon yahoo-icon"></div>
                <span class="engine-name">Yahoo!</span>
            </div>
            <div class="engine-option" onclick="selectEngine('searx', 'Searx')">
                <div class="engine-icon searx-icon"></div>
                <span class="engine-name">Searx</span>
            </div>
            <div class="engine-option" onclick="selectEngine('qwant', 'Qwant')">
                <div class="engine-icon qwant-icon"></div>
                <span class="engine-name">Qwant</span>
            </div>
        `
  }
}

// 切换引擎下拉菜单
function toggleEngineDropdown() {
  const dropdown = document.getElementById("engineDropdown")
  const suggestionsContainer = document.getElementById("suggestionsContainer")

  // 切换下拉菜单显示状态
  dropdown.classList.toggle("show")

  // 如果下拉菜单显示，则降低搜索建议透明度
  if (dropdown.classList.contains("show")) {
    suggestionsContainer.style.opacity = "0.3"
  } else {
    // 恢复搜索建议透明度
    suggestionsContainer.style.opacity = ""
  }
}

// 选择引擎
function selectEngine(engine, displayName) {
  setCurrentEngine(engine)
  const selector = document.querySelector(".engine-selector")
  const icon = selector.querySelector(".engine-icon")
  const nameSpan = selector.querySelector(".engine-name")

  // 更新图标
  // 检查是否是用户自定义的资源引擎
  if (currentMode === "resource" && engine.startsWith("custom_")) {
    // 获取资源索引
    const index = parseInt(engine.replace("custom_", ""))
    if (index >= 0 && index < resources.length) {
      const resource = resources[index]
      // 设置自定义图标
      icon.className = "engine-icon"
      icon.style.backgroundImage = `url('${
        resource.faviconUrl ||
        'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><text x="8" y="12" font-size="12" text-anchor="middle" fill="%23666">📂</text></svg>'
      }')`
    }
  } else {
    icon.className = "engine-icon " + engine + "-icon"
    icon.style.backgroundImage = ""
  }

  if (nameSpan) {
    nameSpan.textContent = displayName
  }

  // 关闭下拉菜单
  const dropdown = document.getElementById("engineDropdown")
  if (dropdown) {
    dropdown.classList.remove("show")
    // 恢复搜索建议透明度
    const suggestionsContainer = document.getElementById("suggestionsContainer")
    suggestionsContainer.style.opacity = ""
  }
}

export { updateEngineDropdown, toggleEngineDropdown, selectEngine }