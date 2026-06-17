import {
  Application,
  Container,
  Sprite,
  Texture,
  BlurFilter,
  ColorMatrixFilter,
  Ticker,
} from 'pixi.js'

/**
 * 壁纸内容适配器接口。
 * 任意壁纸类型实现此接口,产出一个 Pixi Container 即可被渲染器消费。
 * 渲染与模糊解耦:此处只负责"画内容",模糊由 WallpaperRenderer 的 filter 负责。
 */
export interface WallpaperContent {
  toPixi(app: Application): Promise<Container>
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('图片加载失败: ' + src))
    img.src = src
  })
}

/** 静态图片 URL 壁纸 */
export class ImageContent implements WallpaperContent {
  constructor(private url: string) {}
  async toPixi(_app: Application): Promise<Container> {
    const img = await loadImage(this.url)
    return new Sprite(Texture.from(img))
  }
}

/** CSS 线性渐变壁纸。256x256 canvas 画渐变,cover-fit 时 GPU 双线性插值即可,无锯齿。 */
export class GradientContent implements WallpaperContent {
  constructor(
    private color1: string,
    private color2: string,
    private direction: string
  ) {}
  async toPixi(_app: Application): Promise<Container> {
    const size = 256
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const ctx = canvas.getContext('2d')!

    // CSS gradient angle: 0deg=向上, 90deg=向右, 180deg=向下, 135deg=右下
    const deg = parseFloat(this.direction) || 135
    const rad = deg * Math.PI / 180
    const dx = Math.sin(rad)
    const dy = -Math.cos(rad)
    const half = size / 2

    const grad = ctx.createLinearGradient(
      half - dx * half, half - dy * half,
      half + dx * half, half + dy * half
    )
    grad.addColorStop(0, this.color1)
    grad.addColorStop(1, this.color2)
    ctx.fillStyle = grad
    ctx.fillRect(0, 0, size, size)

    return new Sprite(Texture.from(canvas))
  }
}

/** SVG 代码壁纸。通过 blob URL 加载为 Image 后上传 GPU 纹理。 */
export class SVGContent implements WallpaperContent {
  constructor(private code: string) {}
  async toPixi(_app: Application): Promise<Container> {
    const parser = new DOMParser()
    const doc = parser.parseFromString(this.code, 'image/svg+xml')
    const parserError = doc.querySelector('parsererror')
    if (parserError) throw new Error('SVG 解析错误: ' + parserError.textContent)

    const svg = doc.documentElement
    if (svg.nodeName !== 'svg') throw new Error('请输入有效的 SVG 代码')

    // Image 元素需要明确的像素尺寸,不能是 100%
    svg.setAttribute('width', String(window.innerWidth))
    svg.setAttribute('height', String(window.innerHeight))
    if (!svg.getAttribute('preserveAspectRatio')) {
      svg.setAttribute('preserveAspectRatio', 'xMidYMid slice')
    }

    const serialized = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([serialized], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    let img: HTMLImageElement
    try {
      img = await loadImage(url)
    } finally {
      // 延迟回收,确保 GPU 上传完成
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    return new Sprite(Texture.from(img))
  }
}

/** 默认壁纸:空容器,只显示 wrapper 的 background-color 兜底色 */
export class DefaultContent implements WallpaperContent {
  async toPixi(_app: Application): Promise<Container> {
    return new Container()
  }
}

/**
 * 壁纸渲染器。
 * - 内容层(contentLayer)挂载 BlurFilter + ColorMatrixFilter,模糊与亮度在 GPU 上完成
 * - filter 顺序 [blur, color] 对应 CSS `filter: blur() brightness()` 的应用顺序
 * - ticker 默认停止,仅在模糊动画进行时启动,节省空闲时 GPU 开销
 */
export class WallpaperRenderer {
  private app!: Application
  private layer = new Container()
  private blur = new BlurFilter({ strength: 0, quality: 4 })
  private color = new ColorMatrixFilter()
  private current: Container | null = null
  private currentBrightness = 1
  private contentToken = 0

  private anim = {
    blurFrom: 0, blurTo: 0, blurTime: 0, blurDur: 0,
    brightFrom: 1, brightTo: 1, brightTime: 0, brightDur: 0,
  }

  async init(canvas: HTMLCanvasElement): Promise<void> {
    this.app = new Application()
    await this.app.init({
      canvas,
      resizeTo: window,
      backgroundAlpha: 0,
      antialias: false,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    })
    this.app.stage.addChild(this.layer)
    this.layer.filters = [this.blur, this.color]
    this.color.brightness(1, false)
    this.app.ticker.add(this.tick)
    this.app.ticker.stop() // 默认不每帧渲染
    window.addEventListener('resize', this.onResize)
  }

  private onResize = () => {
    if (this.current) this.fitCover(this.current)
    if (!this.app.ticker.started) this.app.render()
  }

  async setContent(c: WallpaperContent): Promise<void> {
    const token = ++this.contentToken
    if (this.current) {
      this.layer.removeChild(this.current)
      this.current.destroy({ children: true })
      this.current = null
    }
    try {
      const obj = await c.toPixi(this.app)
      // 期间若又切换了内容,丢弃这次结果
      if (token !== this.contentToken) {
        obj.destroy({ children: true })
        return
      }
      this.layer.addChild(obj)
      this.current = obj
      this.fitCover(obj)
      if (!this.app.ticker.started) this.app.render()
    } catch (e) {
      console.error('壁纸加载失败:', e)
    }
  }

  /**
   * 设置模糊强度与亮度。
   * animateMs > 0 时从当前值平滑插值到目标值,中途调用会以当前插值作为新起点(支持中断重启)。
   */
  setBlur(strength: number, brightness: number, animateMs = 0): void {
    this.anim.blurFrom = this.blur.strength
    this.anim.blurTo = strength
    this.anim.blurTime = 0
    this.anim.blurDur = animateMs

    this.anim.brightFrom = this.currentBrightness
    this.anim.brightTo = brightness
    this.anim.brightTime = 0
    this.anim.brightDur = animateMs

    if (animateMs <= 0) {
      this.blur.strength = strength
      this.color.brightness(brightness, false)
      this.currentBrightness = brightness
      if (!this.app.ticker.started) this.app.render()
    } else {
      this.app.ticker.start()
    }
  }

  private tick = (ticker: Ticker) => {
    const dt = ticker.deltaMS

    if (this.anim.blurDur > 0) {
      this.anim.blurTime += dt
      const t = Math.min(1, this.anim.blurTime / this.anim.blurDur)
      const eased = easeOutCubic(t)
      this.blur.strength =
        this.anim.blurFrom + (this.anim.blurTo - this.anim.blurFrom) * eased
      if (t >= 1) this.anim.blurDur = 0
    }

    if (this.anim.brightDur > 0) {
      this.anim.brightTime += dt
      const t = Math.min(1, this.anim.brightTime / this.anim.brightDur)
      const eased = easeOutCubic(t)
      const b =
        this.anim.brightFrom + (this.anim.brightTo - this.anim.brightFrom) * eased
      this.color.brightness(b, false)
      this.currentBrightness = b
      if (t >= 1) this.anim.brightDur = 0
    }

    // 所有动画结束,停止 ticker 节省 GPU
    if (this.anim.blurDur === 0 && this.anim.brightDur === 0) {
      this.app.ticker.stop()
    }
  }

  /** cover 模式:缩放至铺满屏幕,居中,可能溢出 */
  private fitCover(obj: Container): void {
    if (!(obj instanceof Sprite) || !obj.texture) return
    const texW = obj.texture.width
    const texH = obj.texture.height
    if (texW === 0 || texH === 0) return

    const screenW = this.app.screen.width
    const screenH = this.app.screen.height
    const scale = Math.max(screenW / texW, screenH / texH)
    obj.scale.set(scale)
    obj.anchor.set(0.5)
    obj.position.set(screenW / 2, screenH / 2)
  }
}

// 全局单例,匹配项目现有 dataManager.ts 的模块级状态风格
let rendererInstance: WallpaperRenderer | null = null

export async function initWallpaperRenderer(
  canvas: HTMLCanvasElement
): Promise<WallpaperRenderer> {
  if (!rendererInstance) {
    rendererInstance = new WallpaperRenderer()
    await rendererInstance.init(canvas)
    // 初始化完成后,根据当前 body class 同步模糊状态(无动画)
    // 避免初始化期间用户的交互(如聚焦搜索)丢失模糊状态
    const t = computeBlurTarget()
    rendererInstance.setBlur(t.strength, t.brightness, 0)
  }
  return rendererInstance
}

/** 严格获取渲染器,未初始化时抛错(用于调试) */
export function getWallpaperRenderer(): WallpaperRenderer {
  if (!rendererInstance) {
    throw new Error('WallpaperRenderer 未初始化,请先调用 initWallpaperRenderer')
  }
  return rendererInstance
}

/** 宽松获取渲染器,未初始化时返回 null(用于 UI 事件处理,可能早于渲染器初始化触发) */
export function tryGetWallpaperRenderer(): WallpaperRenderer | null {
  return rendererInstance
}

/**
 * 根据当前 body 的 class 计算目标模糊状态。
 * settings-modal-open 优先级高于 search-focused(模态框打开时,搜索框聚焦状态被覆盖)。
 */
export function computeBlurTarget(): { strength: number; brightness: number } {
  if (document.body.classList.contains('settings-modal-open')) {
    return { strength: 8, brightness: 0.7 }
  }
  if (document.body.classList.contains('search-focused')) {
    return { strength: 10, brightness: 0.8 }
  }
  return { strength: 0, brightness: 1 }
}