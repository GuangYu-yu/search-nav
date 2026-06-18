import type { DomWallpaperContent } from './wallpaperRenderer'

/**
 * Shadertoy 着色器壁纸 — 独立 canvas + WebGL2。
 * 99% 代码复制即用。Cubemap shader 顶部加注释 `// iChannel0: cube`
 */
export class ShaderContent implements DomWallpaperContent {
  private canvas: HTMLCanvasElement | null = null
  private gl: WebGL2RenderingContext | null = null
  private animId = 0
  private startTime = 0
  private prevTime = 0
  private frame = 0
  private lastDateSec = -1
  private cachedDate = new Float32Array(4)
  private program: WebGLProgram | null = null
  private textures: WebGLTexture[] = []
  private uLoc: Record<string, WebGLUniformLocation | null> = {}
  private mouse = { x: 0, y: 0, cx: 0, cy: 0, down: false }
  private onMouse = (e: MouseEvent) => {
    const r = this.canvas!.getBoundingClientRect()
    const mx = e.clientX - r.left, my = e.clientY - r.top
    if (e.type === 'mousedown') { this.mouse.cx = mx; this.mouse.cy = my; this.mouse.down = true }
    if (e.type === 'mouseup' || e.type === 'mouseleave') this.mouse.down = false
    this.mouse.x = mx; this.mouse.y = my
  }

  constructor(private userGLSL: string) {}

  async renderTo(wrapper: HTMLElement): Promise<void> {
    const canvas = document.createElement('canvas')
    const dpr = window.devicePixelRatio || 1
    const w = wrapper.clientWidth
    const h = wrapper.clientHeight
    canvas.width = Math.floor(w * dpr)
    canvas.height = Math.floor(h * dpr)
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%'

    const gl = canvas.getContext('webgl2') as WebGL2RenderingContext | null
    if (!gl) throw new Error('WebGL 2.0 不可用')

    const chTypes = parseChannelConfigs(this.userGLSL)
    const vs = makeShader(gl, gl.VERTEX_SHADER, VERT300)
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      throw new Error('顶点着色器编译失败:\n' + (gl.getShaderInfoLog(vs) || '(无详情)'))
    }
    const fs = makeShader(gl, gl.FRAGMENT_SHADER, fragSrc(this.userGLSL, chTypes))
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      throw new Error('着色器编译失败:\n' + (gl.getShaderInfoLog(fs) || '(无详情)'))
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, vs)
    gl.attachShader(prog, fs)
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error('着色器链接失败:\n' + (gl.getProgramInfoLog(prog) || '(无详情)'))
    }

    this.setupGL(gl, prog, canvas, chTypes)
    wrapper.appendChild(canvas)
    canvas.addEventListener('mousemove', this.onMouse)
    canvas.addEventListener('mousedown', this.onMouse)
    canvas.addEventListener('mouseup', this.onMouse)
    canvas.addEventListener('mouseleave', this.onMouse)
    this.tick()
  }

  private setupGL(gl: WebGL2RenderingContext, prog: WebGLProgram, c: HTMLCanvasElement, chTypes: string[]): void {
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW)
    const a = gl.getAttribLocation(prog, 'pos')
    gl.enableVertexAttribArray(a)
    gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0)
    gl.useProgram(prog)

    // 256x256 程序化噪点纹理替代空白，使依赖 iChannel 的 shader 获得丰富的随机细节
    const noiseData = makeBlueNoise()
    const faces = [gl.TEXTURE_CUBE_MAP_POSITIVE_X, gl.TEXTURE_CUBE_MAP_NEGATIVE_X,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Y, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y,
      gl.TEXTURE_CUBE_MAP_POSITIVE_Z, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z]

    for (let i = 0; i < 4; i++) {
      gl.activeTexture(gl.TEXTURE0 + i)
      if (chTypes[i] === 'samplerCube') {
        const t = gl.createTexture()!
        this.textures.push(t)
        gl.bindTexture(gl.TEXTURE_CUBE_MAP, t)
        for (const f of faces) gl.texImage2D(f, 0, gl.RGBA, TEX, TEX, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_R, gl.CLAMP_TO_EDGE)
      } else {
        const t = gl.createTexture()!
        this.textures.push(t)
        gl.bindTexture(gl.TEXTURE_2D, t)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, TEX, TEX, 0, gl.RGBA, gl.UNSIGNED_BYTE, noiseData)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
      }
      const loc = gl.getUniformLocation(prog, 'iChannel' + i)
      if (loc) gl.uniform1i(loc, i)
    }

    this.uLoc = {
      iTime: gl.getUniformLocation(prog, 'iTime'),
      iResolution: gl.getUniformLocation(prog, 'iResolution'),
      iMouse: gl.getUniformLocation(prog, 'iMouse'),
      iDate: gl.getUniformLocation(prog, 'iDate'),
      iFrame: gl.getUniformLocation(prog, 'iFrame'),
      iTimeDelta: gl.getUniformLocation(prog, 'iTimeDelta'),
      iFrameRate: gl.getUniformLocation(prog, 'iFrameRate'),
    }

    const resLoc = gl.getUniformLocation(prog, 'iChannelResolution')
    if (resLoc) gl.uniform3fv(resLoc, new Float32Array([
      TEX, TEX, 1,  TEX, TEX, 1,  TEX, TEX, 1,  TEX, TEX, 1,
    ]))
    const cTimeLoc = gl.getUniformLocation(prog, 'iChannelTime')
    if (cTimeLoc) gl.uniform1fv(cTimeLoc, new Float32Array(4))
    this.canvas = c
    this.gl = gl
    this.program = prog
    this.startTime = performance.now()
  }

  private tick = () => {
    const gl = this.gl!, L = this.uLoc, c = this.canvas!
    const now = performance.now()
    const elapsed = (now - this.startTime) / 1000
    let dt = (now - this.prevTime) / 1000
    this.prevTime = now
    if (dt <= 0) dt = 1 / 60

    gl.useProgram(this.program!)
    if (L.iTime) gl.uniform1f(L.iTime, elapsed)
    if (L.iResolution) gl.uniform3f(L.iResolution, c.width, c.height, 1)
    if (L.iMouse) {
      const m = this.mouse
      const dpr = window.devicePixelRatio || 1
      const px = m.x * dpr, py = m.y * dpr
      if (m.down) {
        gl.uniform4f(L.iMouse, px, py, m.cx * dpr, m.cy * dpr)
      } else {
        gl.uniform4f(L.iMouse, px, py, -Math.abs(m.cx * dpr), -Math.abs(m.cy * dpr))
      }
    }
    if (L.iDate) {
      const sec = Math.floor(now / 1000)
      if (sec !== this.lastDateSec) {
        this.lastDateSec = sec
        const d = new Date()
        this.cachedDate[0] = d.getFullYear()
        this.cachedDate[1] = d.getMonth() + 1
        this.cachedDate[2] = d.getDate()
        this.cachedDate[3] = d.getHours() * 3600 + d.getMinutes() * 60 + d.getSeconds()
      }
      gl.uniform4f(L.iDate, this.cachedDate[0], this.cachedDate[1], this.cachedDate[2], this.cachedDate[3])
    }
    if (L.iFrame) gl.uniform1i(L.iFrame, this.frame++)
    if (L.iTimeDelta) gl.uniform1f(L.iTimeDelta, dt)
    if (L.iFrameRate) gl.uniform1f(L.iFrameRate, 1 / dt)

    gl.viewport(0, 0, c.width, c.height)
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    this.animId = requestAnimationFrame(this.tick)
  }

  resize(w: number, h: number): void {
    if (!this.canvas || !this.gl) return
    const dpr = window.devicePixelRatio || 1
    this.canvas.width = Math.floor(w * dpr)
    this.canvas.height = Math.floor(h * dpr)
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  destroy(): void {
    cancelAnimationFrame(this.animId)
    if (this.gl) {
      for (const t of this.textures) this.gl.deleteTexture(t)
      this.textures.length = 0
      this.gl.useProgram(null)
      this.gl.deleteProgram(this.program)
    }
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.onMouse)
      this.canvas.removeEventListener('mousedown', this.onMouse)
      this.canvas.removeEventListener('mouseup', this.onMouse)
      this.canvas.removeEventListener('mouseleave', this.onMouse)
      this.canvas.remove(); this.canvas = null
    }
    this.gl = null; this.program = null
  }
}

/* ─── GLSL ─── */

const VERT300 = `#version 300 es
in vec2 pos;
void main() { gl_Position = vec4(pos, 0.0, 1.0); }
`

function commonUtils(userCode: string): string {
  const pal = !userCode.includes('vec3 pal(') && !userCode.includes('vec3 pal (')
  return `
${pal ? `vec3 pal(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) { return a + b*cos(6.28318*(c*t+d)); }` : ''}

vec4 _st(sampler2D s, vec2 uv)   { return textureLod(s, uv, 0.0); }
vec4 _st(sampler2D s, vec3 uvw)  { return textureLod(s, uvw.xy, 0.0); }
vec4 _st(samplerCube s, vec3 uvw){ return textureLod(s, uvw, 0.0); }
vec4 _st(samplerCube s, vec2 uv) { return textureLod(s, vec3(uv, 0.0), 0.0); }

#define texture(s, coord) _st(s, coord)
`
}

/* ─── helpers ─── */

function parseChannelConfigs(src: string): string[] {
  const c = ['sampler2D', 'sampler2D', 'sampler2D', 'sampler2D']
  for (const line of src.split('\n').slice(0, 20)) {
    const m = line.trim().match(/\/\/\s*iChannel([0-3])\s*:\s*(cube|samplercube)/i)
    if (m) c[+m[1]] = 'samplerCube'
  }
  return c
}

function fragSrc(user: string, chTypes: string[]): string {
  let code = user
    .replace(/precision\s+\w+\s+float\s*;\s*\n?/gi, '')
    .replace(/#version\s+\S+\s*\n?/g, '')

  if (/\b(vec[234]|float|int)\s+texture\s*\(/.test(code)) {
    code = code.replace(/\btexture\b/g, 'texFetch')
  }

  return `#version 300 es
precision highp float;

uniform vec3 iResolution;
uniform float iTime;
uniform float iTimeDelta;
uniform float iFrameRate;
uniform int iFrame;
uniform vec4 iMouse;
uniform vec4 iDate;
uniform float iSampleRate;
uniform float iChannelTime[4];
uniform vec3 iChannelResolution[4];
${chTypes.map((t, i) => `uniform ${t} iChannel${i};`).join('\n')}

${commonUtils(code)}

out vec4 shadertoy_out_color;

void mainImage(out vec4 fragColor, in vec2 fragCoord);

void main() {
    vec4 color;
    mainImage(color, gl_FragCoord.xy);
    shadertoy_out_color = vec4(color.xyz, 1.0);
}

${code}
`
}

function makeShader(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const s = gl.createShader(type)!
  gl.shaderSource(s, src)
  gl.compileShader(s)
  return s
}

/* ─── 纹理 ─── */

const TEX = 256

let _noiseCache: Uint8Array | null = null

/** TEX×TEX 分形噪声纹理 */
function makeBlueNoise(): Uint8Array {
  if (_noiseCache) return _noiseCache
  const d = new Uint8Array(TEX * TEX * 4)
  for (let y = 0; y < TEX; y++) {
    for (let x = 0; x < TEX; x++) {
      const i = (y * TEX + x) * 4
      d[i]     = fbm(x, y, 0)
      d[i + 1] = fbm(x, y, 1)
      d[i + 2] = fbm(x, y, 2)
      d[i + 3] = 255
    }
  }
  _noiseCache = d
  return d
}

/* 2D value noise: 整数格点 hash → 双线性插值 */
function vnoise(x: number, y: number, seed: number): number {
  const ix = x | 0, iy = y | 0
  const fx = x - ix, fy = y - iy
  const sx = fx * fx * (3 - 2 * fx) // smoothstep
  const sy = fy * fy * (3 - 2 * fy)
  const h = (ix: number, iy: number) => hash2d(ix + seed * 137, iy + seed * 251) / 255
  const a = h(ix, iy), b = h(ix + 1, iy)
  const c = h(ix, iy + 1), d = h(ix + 1, iy + 1)
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy
}

function hash2d(x: number, y: number): number {
  let h = (x * 374761393 + y * 668265263 + 1274126177) | 0
  h = ((h ^ (h >> 13)) * 1274126177) | 0
  return ((h ^ (h >> 16)) >>> 0) & 255
}

/* 分形布朗运动: 4 个八度叠加 */
function fbm(x: number, y: number, seed: number): number {
  const OCTAVES = 4, PERSISTENCE = 0.45, LACUNARITY = 2.1
  const ux = x / TEX * 6, uy = y / TEX * 6
  let v = 0, amp = 0.7, freq = 1, total = 0
  for (let o = 0; o < OCTAVES; o++) {
    v += vnoise(ux * freq + seed * 73, uy * freq + seed * 37, seed + o) * amp
    total += amp
    amp *= PERSISTENCE
    freq *= LACUNARITY
  }
  return Math.min(255, Math.max(0, (v / total) * 160 + 48) | 0)
}