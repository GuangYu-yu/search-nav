import { showToast } from './toast'
import {
  WallpaperContent,
  ImageContent,
  GradientContent,
  SVGContent,
  DefaultContent,
  getWallpaperRenderer,
} from './wallpaperRenderer'

/** 解析 localStorage 里的 customWallpaper 字符串,还原为 ContentSource */
function parseWallpaperString(bg: string): WallpaperContent | null {
  bg = bg.trim()
  if (bg.startsWith('url(')) {
    const m = bg.match(/url\(['"]?([^'")]+)['"]?\)/)
    if (m) return new ImageContent(m[1])
  } else if (bg.startsWith('linear-gradient(')) {
    // 格式: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
    const inner = bg.slice('linear-gradient('.length, -1)
    const parts = inner.split(',').map(s => s.trim())
    if (parts.length >= 3) {
      const dir = parts[0]
      const c1 = parts[1].split(/\s+/)[0]
      const c2 = parts[2].split(/\s+/)[0]
      return new GradientContent(c1, c2, dir)
    }
  }
  return null
}

/** 清空 SVG 状态,切换回非 SVG 壁纸时调用 */
function clearSVGState(): void {
  localStorage.removeItem('svgWallpaper')
  localStorage.removeItem('svgCode')
}

/** 启动时从 localStorage 恢复壁纸 */
export async function restoreWallpaperFromStorage(): Promise<void> {
  const svgActive = localStorage.getItem('svgWallpaper')
  if (svgActive === 'active') {
    const savedSVGCode = localStorage.getItem('svgCode')
    if (savedSVGCode) {
      await getWallpaperRenderer().setContent(new SVGContent(savedSVGCode))
      return
    }
  }

  const savedWallpaper = localStorage.getItem('customWallpaper')
  if (savedWallpaper) {
    const content = parseWallpaperString(savedWallpaper)
    if (content) {
      await getWallpaperRenderer().setContent(content)
      return
    }
  }

  await getWallpaperRenderer().setContent(new DefaultContent())
}

function setWallpaper(type: string): void {
  let content: WallpaperContent
  let backgroundStyle = ''

  if (type.startsWith('gradient')) {
    const gradientIndex = parseInt(type.replace('gradient', '')) - 1
    const gradientPairs = getGradientPairs()
    if (gradientIndex >= 0 && gradientIndex < gradientPairs.length) {
      const [color1, color2] = gradientPairs[gradientIndex]
      backgroundStyle = `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`
      content = new GradientContent(color1, color2, '135deg')
    } else {
      content = new DefaultContent()
    }
  } else {
    // type === 'default' 或其他
    content = new DefaultContent()
  }

  if (backgroundStyle) {
    localStorage.setItem('customWallpaper', backgroundStyle)
  } else {
    localStorage.removeItem('customWallpaper')
  }
  clearSVGState()

  void getWallpaperRenderer().setContent(content)
}

function setCustomWallpaper(): void {
  const url = (document.getElementById('customWallpaperUrl') as HTMLInputElement | null)?.value.trim()
  if (!url) {
    showToast('请输入图片URL', 'error')
    return
  }

  // 预验证图片可加载,与原逻辑保持一致(失败仅 console.log)
  const img = new Image()
  img.onload = function () {
    const backgroundStyle = `url('${url}') center/cover no-repeat`
    localStorage.setItem('customWallpaper', backgroundStyle)
    localStorage.setItem('customWallpaperUrl', url)
    clearSVGState()
    void getWallpaperRenderer().setContent(new ImageContent(url))
  }
  img.onerror = function () {
    console.log('图片加载失败，请检查URL是否正确')
  }
  img.src = url
}

function getCurrentDirection(): string {
  const activeBtn = document.querySelector('.direction-btn.active') as HTMLElement | null
  return activeBtn?.dataset.direction || '135deg'
}

function updateGradientPreview(): void {
  const color1 = (document.getElementById('color1') as HTMLInputElement | null)?.value || '#667eea'
  const color2 = (document.getElementById('color2') as HTMLInputElement | null)?.value || '#764ba2'
  const direction = getCurrentDirection()

  const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`

  const preview = document.getElementById('gradientPreview') as HTMLElement | null
  if (preview) {
    preview.style.background = gradient
  }
}

function getAllColors(): string[] {
  return [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#f5576c',
    '#4ecdc4',
    '#44a08d',
    '#ff6b6b',
    '#45b7d1',
    '#96c93d',
    '#feca57',
    '#ff9ff3',
    '#54a0ff',
    '#5f27cd',
    '#00d2d3',
    '#ff9f43',
    '#10ac84',
    '#ee5a24',
    '#0abde3',
    '#006ba6',
    '#f38ba8',
    '#a8e6cf',
    '#ffd93d',
    '#6c5ce7',
  ]
}

function getGradientPairs(): string[][] {
  const colors = getAllColors()
  return [
    [colors[0], colors[1]],
    [colors[2], colors[3]],
    [colors[4], colors[5]],
    [colors[6], colors[7]],
    [colors[0], colors[2]],
  ]
}

function randomColors(): void {
  const colors = getAllColors()

  const color1 = colors[Math.floor(Math.random() * colors.length)]
  let color2 = colors[Math.floor(Math.random() * colors.length)]

  while (color2 === color1) {
    color2 = colors[Math.floor(Math.random() * colors.length)]
  }

  const color1Input = document.getElementById('color1') as HTMLInputElement | null
  const color2Input = document.getElementById('color2') as HTMLInputElement | null

  if (color1Input) color1Input.value = color1
  if (color2Input) color2Input.value = color2

  const directions = ['135deg', '45deg', '90deg', '0deg']
  const randomDirection =
    directions[Math.floor(Math.random() * directions.length)]

  document.querySelectorAll('.direction-btn').forEach((btn) => {
    btn.classList.toggle('active', (btn as HTMLElement).dataset.direction === randomDirection)
  })

  updateGradientPreview()
}

function updateSVGWallpaper(): void {
  const svgCode = (document.getElementById('svgCode') as HTMLTextAreaElement | null)?.value || ''

  if (!svgCode.trim()) {
    // SVG 被清空,回退到之前保存的图片/渐变
    localStorage.removeItem('svgWallpaper')
    const savedWallpaper = localStorage.getItem('customWallpaper')
    const content = savedWallpaper
      ? parseWallpaperString(savedWallpaper) ?? new DefaultContent()
      : new DefaultContent()
    void getWallpaperRenderer().setContent(content)
    return
  }

  // 验证 SVG 语法(与原逻辑保持一致,仅 console.error)
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(svgCode, 'image/svg+xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) throw new Error('SVG解析错误：' + parserError.textContent)
    if (doc.documentElement.nodeName !== 'svg') throw new Error('请输入有效的SVG代码')
  } catch (error) {
    console.error('SVG代码错误：', (error as Error).message)
    return
  }

  localStorage.setItem('svgWallpaper', 'active')
  localStorage.setItem('svgCode', svgCode)

  void getWallpaperRenderer().setContent(new SVGContent(svgCode))
}

function applyCustomGradient(): void {
  const color1 = (document.getElementById('color1') as HTMLInputElement | null)?.value || '#667eea'
  const color2 = (document.getElementById('color2') as HTMLInputElement | null)?.value || '#764ba2'
  const direction = getCurrentDirection()

  const gradient = `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`

  localStorage.setItem('customWallpaper', gradient)
  clearSVGState()

  void getWallpaperRenderer().setContent(new GradientContent(color1, color2, direction))
}

function initColorMixer(): void {
  document.querySelectorAll('.direction-btn').forEach((btn) => {
    btn.addEventListener('click', function(this: HTMLElement) {
      document
        .querySelectorAll('.direction-btn')
        .forEach((b) => b.classList.remove('active'))
      this.classList.add('active')
      updateGradientPreview()
    })
  })

  const color1Input = document.getElementById('color1') as HTMLInputElement | null
  const color2Input = document.getElementById('color2') as HTMLInputElement | null

  color1Input?.addEventListener('input', updateGradientPreview)
  color2Input?.addEventListener('input', updateGradientPreview)

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
  initColorMixer,
}