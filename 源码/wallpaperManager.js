// 壁纸管理模块
// 设置壁纸
function setWallpaper(type) {
  let backgroundStyle = ""

  if (type.startsWith("gradient")) {
    const gradientIndex = parseInt(type.replace("gradient", "")) - 1
    const gradientPairs = getGradientPairs()
    if (gradientIndex >= 0 && gradientIndex < gradientPairs.length) {
      const [color1, color2] = gradientPairs[gradientIndex]
      backgroundStyle = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
    }
  }

  const wallpaperContainer = document.getElementById("wallpaperContainer")
  if (backgroundStyle) {
    wallpaperContainer.style.background = backgroundStyle
    localStorage.setItem("customWallpaper", backgroundStyle)
  } else {
    wallpaperContainer.style.background = ""
    localStorage.removeItem("customWallpaper")
  }
}

// 设置自定义壁纸
function setCustomWallpaper() {
  const url = document.getElementById("customWallpaperUrl").value.trim()
  if (!url) {
    alert("请输入图片URL")
    return
  }

  // 测试图片是否能正常加载
  const img = new Image()
  img.onload = function () {
    const backgroundStyle = `url('${url}') center/cover no-repeat`
    const wallpaperContainer = document.getElementById("wallpaperContainer")
    wallpaperContainer.style.background = backgroundStyle
    localStorage.setItem("customWallpaper", backgroundStyle)
    // 保存输入框的值
    localStorage.setItem("customWallpaperUrl", url)
  }
  img.onerror = function () {
    // 图片加载失败处理
    console.log("图片加载失败，请检查URL是否正确")
  }
  img.src = url
}

// 获取当前选择的渐变方向
function getCurrentDirection() {
  const activeBtn = document.querySelector(".direction-btn.active")
  return activeBtn ? activeBtn.dataset.direction : "135deg"
}

// 自动更新渐变预览
function updateGradientPreview() {
  const color1 = document.getElementById("color1").value
  const color2 = document.getElementById("color2").value
  const direction = getCurrentDirection()

  const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`

  const preview = document.getElementById("gradientPreview")
  preview.style.background = gradient
}

// 获取所有可用颜色
function getAllColors() {
  return [
    "#667eea",
    "#764ba2",
    "#f093fb",
    "#f5576c",
    "#4ecdc4",
    "#44a08d",
    "#ff6b6b",
    "#45b7d1",
    "#96c93d",
    "#feca57",
    "#ff9ff3",
    "#54a0ff",
    "#5f27cd",
    "#00d2d3",
    "#ff9f43",
    "#10ac84",
    "#ee5a24",
    "#0abde3",
    "#006ba6",
    "#f38ba8",
    "#a8e6cf",
    "#ffd93d",
    "#6c5ce7"
  ]
}

// 获取预定义的渐变颜色对
function getGradientPairs() {
  const colors = getAllColors()
  return [
    [colors[0], colors[1]], // #667eea, #764ba2
    [colors[2], colors[3]], // #f093fb, #f5576c
    [colors[4], colors[5]], // #4ecdc4, #44a08d
    [colors[6], colors[7]], // #ff6b6b, #45b7d1
    [colors[0], colors[2]] // #667eea, #f093fb
  ]
}

// 随机生成颜色
function randomColors() {
  const colors = getAllColors()

  const color1 = colors[Math.floor(Math.random() * colors.length)]
  let color2 = colors[Math.floor(Math.random() * colors.length)]

  // 确保两个颜色不同
  while (color2 === color1) {
    color2 = colors[Math.floor(Math.random() * colors.length)]
  }

  document.getElementById("color1").value = color1
  document.getElementById("color2").value = color2

  // 随机选择方向
  const directions = ["135deg", "45deg", "90deg", "0deg"]
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)]

  // 更新方向按钮
  document.querySelectorAll(".direction-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.direction === randomDirection)
  })

  // 自动更新预览
  updateGradientPreview()
}

// 实时更新SVG壁纸
function updateSVGWallpaper() {
  const svgCode = document.getElementById("svgCode").value

  // 移除现有的SVG壁纸
  const existingSVG = document.getElementById("svgWallpaper")
  if (existingSVG) {
    existingSVG.remove()
  }

  // 如果SVG代码为空，恢复默认壁纸
  if (!svgCode || svgCode.trim() === "") {
    const savedWallpaper = localStorage.getItem("customWallpaper")
    if (savedWallpaper) {
      const wallpaperContainer = document.getElementById("wallpaperContainer")
      wallpaperContainer.style.background = savedWallpaper
    } else {
      setWallpaper("default")
    }
    localStorage.removeItem("svgWallpaper")
    return
  }

  const wallpaperContainer = document.getElementById("wallpaperContainer")

  // 创建SVG容器
  const svgContainer = document.createElement("div")
  svgContainer.id = "svgWallpaper"
  svgContainer.className = "svg-wallpaper"

  try {
    // 解析SVG代码
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgCode, "image/svg+xml")

    // 检查解析错误
    const parserError = svgDoc.querySelector("parsererror")
    if (parserError) {
      throw new Error("SVG解析错误：" + parserError.textContent)
    }

    // 获取SVG元素
    const svgElement = svgDoc.documentElement
    if (svgElement.nodeName !== "svg") {
      throw new Error("请输入有效的SVG代码")
    }

    // 设置SVG尺寸为100%
    svgElement.setAttribute("width", "100%")
    svgElement.setAttribute("height", "100%")
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid slice")

    // 添加到容器
    svgContainer.appendChild(svgElement)
    wallpaperContainer.appendChild(svgContainer)

    // 清除现有背景
    wallpaperContainer.style.background = ""

    // 保存状态
    localStorage.setItem("svgWallpaper", "active")
  } catch (error) {
    console.error("SVG代码错误：", error.message)
    svgContainer.remove()
  }
}

// 应用自定义渐变
function applyCustomGradient() {
  const color1 = document.getElementById("color1").value
  const color2 = document.getElementById("color2").value
  const direction = getCurrentDirection()

  const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`

  const wallpaperContainer = document.getElementById("wallpaperContainer")
  wallpaperContainer.style.background = gradient
  localStorage.setItem("customWallpaper", gradient)
}

// 初始化颜色混色器
function initColorMixer() {
  // 方向按钮事件
  document.querySelectorAll(".direction-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".direction-btn")
        .forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      updateGradientPreview()
    })
  })

  // 颜色输入事件 - 自动刷新
  document
    .getElementById("color1")
    .addEventListener("input", updateGradientPreview)
  document
    .getElementById("color2")
    .addEventListener("input", updateGradientPreview)

  // 初始预览
  updateGradientPreview()
}

export { 
  setWallpaper, 
  setCustomWallpaper, 
  getCurrentDirection, 
  updateGradientPreview, 
  getAllColors, 
  getGradientPairs, 
  randomColors, 
  updateSVGWallpaper, 
  applyCustomGradient, 
  initColorMixer 
}