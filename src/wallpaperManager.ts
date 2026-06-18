import { showToast } from './toast'
import {
  WallpaperContent,
  ImageContent,
  GradientContent,
  InlineSVGContent,
  VideoContent,
  DefaultContent,
  getWallpaperRenderer,
} from './wallpaperRenderer'
import { ShaderContent } from './shaderWallpaper'

/** 解析 localStorage 里的 customWallpaper 字符串,还原为 ContentSource */
function parseWallpaperString(bg: string): WallpaperContent | null {
  bg = bg.trim()
  if (bg.startsWith('url(')) {
    const m = bg.match(/url\(['"]?([^'"]+)['"]?\)/)
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
      const content = isShaderCode(savedSVGCode)
        ? new ShaderContent(savedSVGCode)
        : new InlineSVGContent(savedSVGCode)
      await getWallpaperRenderer().setContent(content)
      return
    }
  }

  const savedWallpaper = localStorage.getItem('customWallpaper')
  if (savedWallpaper) {
    // 视频壁纸
    if (savedWallpaper.startsWith('video(')) {
      const m = savedWallpaper.match(/video\(['"]?([^'"]+)['"]?\)/)
      if (m) {
        await getWallpaperRenderer().setContent(new VideoContent(m[1]))
        return
      }
    }
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
    content = new DefaultContent()
  }

  if (backgroundStyle) {
    localStorage.setItem('customWallpaper', backgroundStyle)
  } else {
    localStorage.removeItem('customWallpaper')
  }
  clearSVGState()

  // 更新预设卡片选中态
  document.querySelectorAll('.wallpaper-option').forEach(el => {
    el.classList.toggle('active', (el as HTMLElement).dataset.type === type)
  })

  void getWallpaperRenderer().setContent(content)
}

function setCustomWallpaper(): void {
  const url = (document.getElementById('customWallpaperUrl') as HTMLInputElement | null)?.value.trim()
  if (!url) { showToast('请输入URL', 'error'); return }
  applyMediaUrl(url)
}

/** 处理本地图片/视频文件选择 */
export function handleImageFile(input: HTMLInputElement): void {
  const file = input.files?.[0]
  if (!file) return
  if (file.type.startsWith('video/')) {
    applyMediaUrl(URL.createObjectURL(file), 'video')
  } else {
    const reader = new FileReader()
    reader.onload = () => {
      applyMediaUrl(reader.result as string, 'image')
      input.value = ''
    }
    reader.readAsDataURL(file)
  }
}

/** 统一媒体应用: 自动判断视频或图片 */
function applyMediaUrl(url: string, kind?: 'image' | 'video'): void {
  const isVideo = kind === 'video' || /\.(mp4|webm|ogg|mov)($|\?)/i.test(url)
  if (isVideo) return applyVideoUrl(url)
  return applyImageUrl(url)
}

/** 应用图片 URL */
function applyImageUrl(url: string): void {
  const img = new Image()
  img.onload = () => {
    const style = `url('${url}') center/cover no-repeat`
    localStorage.setItem('customWallpaper', style)
    localStorage.setItem('customWallpaperUrl', url)
    clearSVGState()
    document.querySelectorAll('.wallpaper-option').forEach(el => el.classList.remove('active'))
    void getWallpaperRenderer().setContent(new ImageContent(url))
  }
  img.onerror = () => showToast('图片加载失败', 'error')
  img.src = url
}

/** 应用视频 URL */
function applyVideoUrl(url: string): void {
  localStorage.setItem('customWallpaper', `video(${url})`)
  localStorage.setItem('customWallpaperUrl', url)
  clearSVGState()
  document.querySelectorAll('.wallpaper-option').forEach(el => el.classList.remove('active'))
  void getWallpaperRenderer().setContent(new VideoContent(url))
}

function updateGradientPreview(): void {
  const c1 = (document.getElementById('color1') as HTMLInputElement | null)?.value || '#667eea'
  const c2 = (document.getElementById('color2') as HTMLInputElement | null)?.value || '#764ba2'
  const preview = document.getElementById('gradientPreview') as HTMLElement | null
  if (preview) preview.style.background = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
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
  const c1 = colors[Math.floor(Math.random() * colors.length)]
  let c2 = colors[Math.floor(Math.random() * colors.length)]
  while (c2 === c1) c2 = colors[Math.floor(Math.random() * colors.length)]

  const i1 = document.getElementById('color1') as HTMLInputElement | null
  const i2 = document.getElementById('color2') as HTMLInputElement | null
  if (i1) i1.value = c1
  if (i2) i2.value = c2
  updateGradientPreview()
}

/** 检测代码是否为 GLSL 着色器(Shadertoy 兼容) */
function isShaderCode(code: string): boolean {
  return /\bmainImage\s*\(/.test(code)
}

function updateSVGWallpaper(): void {
  const code = (document.getElementById('svgCode') as HTMLTextAreaElement | null)?.value || ''

  if (!code.trim()) {
    clearSVGState()
    const savedWallpaper = localStorage.getItem('customWallpaper')
    const content = savedWallpaper
      ? parseWallpaperString(savedWallpaper) ?? new DefaultContent()
      : new DefaultContent()
    void getWallpaperRenderer().setContent(content)
    return
  }

  // 着色器代码: 直接走 ShaderContent
  if (isShaderCode(code)) {
    localStorage.setItem('svgWallpaper', 'active')
    localStorage.setItem('svgCode', code)
    void getWallpaperRenderer().setContent(new ShaderContent(code))
    return
  }

  // 验证 SVG 语法
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(code, 'image/svg+xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) throw new Error('SVG解析错误：' + parserError.textContent)
    if (doc.documentElement.nodeName !== 'svg') throw new Error('请输入有效的SVG代码')
  } catch (error) {
    console.error('SVG代码错误：', (error as Error).message)
    return
  }

  localStorage.setItem('svgWallpaper', 'active')
  localStorage.setItem('svgCode', code)
  void getWallpaperRenderer().setContent(new InlineSVGContent(code))
}

function applyCustomGradient(): void {
  const c1 = (document.getElementById('color1') as HTMLInputElement | null)?.value || '#667eea'
  const c2 = (document.getElementById('color2') as HTMLInputElement | null)?.value || '#764ba2'
  const gradient = `linear-gradient(135deg, ${c1} 0%, ${c2} 100%)`
  localStorage.setItem('customWallpaper', gradient)
  clearSVGState()
  document.querySelectorAll('.wallpaper-option').forEach(el => el.classList.remove('active'))
  void getWallpaperRenderer().setContent(new GradientContent(c1, c2, '135deg'))
}

function initColorMixer(): void {
  const i1 = document.getElementById('color1') as HTMLInputElement | null
  const i2 = document.getElementById('color2') as HTMLInputElement | null
  i1?.addEventListener('input', updateGradientPreview)
  i2?.addEventListener('input', updateGradientPreview)
  updateGradientPreview()
}

export {
  setWallpaper,
  setCustomWallpaper,
  randomColors,
  updateSVGWallpaper,
  applyCustomGradient,
  initColorMixer,
}