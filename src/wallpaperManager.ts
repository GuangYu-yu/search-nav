function setWallpaper(type: string): void {
  let backgroundStyle = ""

  if (type.startsWith("gradient")) {
    const gradientIndex = parseInt(type.replace("gradient", "")) - 1
    const gradientPairs = getGradientPairs()
    if (gradientIndex >= 0 && gradientIndex < gradientPairs.length) {
      const [color1, color2] = gradientPairs[gradientIndex]
      backgroundStyle = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
    }
  }

  const wallpaperContainer = document.getElementById("wallpaperContainer") as HTMLElement | null
  if (wallpaperContainer) {
    if (backgroundStyle) {
      wallpaperContainer.style.background = backgroundStyle
      localStorage.setItem("customWallpaper", backgroundStyle)
    } else {
      wallpaperContainer.style.background = ""
      localStorage.removeItem("customWallpaper")
    }
  }
}

function setCustomWallpaper(): void {
  const url = (document.getElementById("customWallpaperUrl") as HTMLInputElement | null)?.value.trim()
  if (!url) {
    alert("请输入图片URL")
    return
  }

  const img = new Image()
  img.decoding = "async"
  img.onload = function () {
    const backgroundStyle = `url('${url}') center/cover no-repeat`
    const wallpaperContainer = document.getElementById("wallpaperContainer") as HTMLElement | null
    if (wallpaperContainer) {
      wallpaperContainer.style.background = backgroundStyle
      localStorage.setItem("customWallpaper", backgroundStyle)
      localStorage.setItem("customWallpaperUrl", url)
    }
  }
  img.onerror = function () {
    console.log("图片加载失败，请检查URL是否正确")
  }
  img.src = url
}

function getCurrentDirection(): string {
  const activeBtn = document.querySelector(".direction-btn.active") as HTMLElement | null
  return activeBtn?.dataset.direction || "135deg"
}

function updateGradientPreview(): void {
  const color1 = (document.getElementById("color1") as HTMLInputElement | null)?.value || "#667eea"
  const color2 = (document.getElementById("color2") as HTMLInputElement | null)?.value || "#764ba2"
  const direction = getCurrentDirection()

  const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`

  const preview = document.getElementById("gradientPreview") as HTMLElement | null
  if (preview) {
    preview.style.background = gradient
  }
}

function getAllColors(): string[] {
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

function getGradientPairs(): string[][] {
  const colors = getAllColors()
  return [
    [colors[0], colors[1]],
    [colors[2], colors[3]],
    [colors[4], colors[5]],
    [colors[6], colors[7]],
    [colors[0], colors[2]]
  ]
}

function randomColors(): void {
  const colors = getAllColors()

  const color1 = colors[Math.floor(Math.random() * colors.length)]
  let color2 = colors[Math.floor(Math.random() * colors.length)]

  while (color2 === color1) {
    color2 = colors[Math.floor(Math.random() * colors.length)]
  }

  const color1Input = document.getElementById("color1") as HTMLInputElement | null
  const color2Input = document.getElementById("color2") as HTMLInputElement | null
  
  if (color1Input) color1Input.value = color1
  if (color2Input) color2Input.value = color2

  const directions = ["135deg", "45deg", "90deg", "0deg"]
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)]

  document.querySelectorAll(".direction-btn").forEach((btn) => {
    btn.classList.toggle("active", (btn as HTMLElement).dataset.direction === randomDirection)
  })

  updateGradientPreview()
}

function updateSVGWallpaper(): void {
  const svgCode = (document.getElementById("svgCode") as HTMLTextAreaElement | null)?.value || ""

  const existingSVG = document.getElementById("svgWallpaper")
  if (existingSVG) {
    existingSVG.remove()
  }

  if (!svgCode || svgCode.trim() === "") {
    const savedWallpaper = localStorage.getItem("customWallpaper")
    const wallpaperContainer = document.getElementById("wallpaperContainer") as HTMLElement | null
    if (wallpaperContainer) {
      if (savedWallpaper) {
        wallpaperContainer.style.background = savedWallpaper
      } else {
        setWallpaper("default")
      }
    }
    localStorage.removeItem("svgWallpaper")
    return
  }

  const wallpaperContainer = document.getElementById("wallpaperContainer") as HTMLElement | null
  if (!wallpaperContainer) return

  const svgContainer = document.createElement("div")
  svgContainer.id = "svgWallpaper"
  svgContainer.className = "svg-wallpaper"

  try {
    const parser = new DOMParser()
    const svgDoc = parser.parseFromString(svgCode, "image/svg+xml")

    const parserError = svgDoc.querySelector("parsererror")
    if (parserError) {
      throw new Error("SVG解析错误：" + parserError.textContent)
    }

    const svgElement = svgDoc.documentElement
    if (svgElement.nodeName !== "svg") {
      throw new Error("请输入有效的SVG代码")
    }

    svgElement.setAttribute("width", "100%")
    svgElement.setAttribute("height", "100%")
    svgElement.setAttribute("preserveAspectRatio", "xMidYMid slice")

    svgContainer.appendChild(svgElement)
    wallpaperContainer.appendChild(svgContainer)

    wallpaperContainer.style.background = ""

    localStorage.setItem("svgWallpaper", "active")
  } catch (error) {
    console.error("SVG代码错误：", (error as Error).message)
    svgContainer.remove()
  }
}

function applyCustomGradient(): void {
  const color1 = (document.getElementById("color1") as HTMLInputElement | null)?.value || "#667eea"
  const color2 = (document.getElementById("color2") as HTMLInputElement | null)?.value || "#764ba2"
  const direction = getCurrentDirection()

  const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`

  const wallpaperContainer = document.getElementById("wallpaperContainer") as HTMLElement | null
  if (wallpaperContainer) {
    wallpaperContainer.style.background = gradient
    localStorage.setItem("customWallpaper", gradient)
  }
}

function initColorMixer(): void {
  document.querySelectorAll(".direction-btn").forEach((btn) => {
    btn.addEventListener("click", function(this: HTMLElement) {
      document
        .querySelectorAll(".direction-btn")
        .forEach((b) => b.classList.remove("active"))
      this.classList.add("active")
      updateGradientPreview()
    })
  })

  const color1Input = document.getElementById("color1") as HTMLInputElement | null
  const color2Input = document.getElementById("color2") as HTMLInputElement | null
  
  color1Input?.addEventListener("input", updateGradientPreview)
  color2Input?.addEventListener("input", updateGradientPreview)

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