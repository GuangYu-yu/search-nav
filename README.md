# Search Nav

一个浏览器导航首页。支持多模式搜索、书签管理、自定义壁纸、主题切换和拖拽排序。

## 预览

![演示](https://github.com/GuangYu-yu/search-nav/blob/main/演示.png?raw=true)

## 功能特性

### 🔍 多模式搜索
- **搜索模式** — 通用网页搜索
- **翻译模式** — Google 翻译、DeepL、百度翻译等多引擎支持
- **资源搜索模式** — 知乎、B站、小红书、Reddit、X 等平台内搜索
- 三段式模式切换器，点击即切换
- 27 个内置搜索引擎，支持添加自定义引擎
- 引擎列表支持拖拽排序

### 🎨 主题
- **亮色 / 暗色 / 姨妈红 / 科技紫 / 尊贵金**
- 毛玻璃效果（Glassmorphism），大面积使用 `backdrop-filter: blur()`
- 搜索框霓虹流光动画（`@property` + CSS 自定义属性驱动）
- 响应式布局，适配移动端

### 🖼️ 壁纸系统
- **预设渐变背景** — 6 套快速选择
- **自定义颜色混色器** — 双色自由搭配 + 随机配色 + 方向控制
- **图片/视频壁纸** — URL 或本地文件
- **SVG 代码壁纸** — 粘贴即用，实时生效
- **Shader 壁纸** — 支持 Shadertoy 风格 GLSL 着色器，WebGL2 渲染
- 壁纸切换时支持平滑过渡 + 模糊效果（Pixi.js BlurFilter）

### 📚 书签管理
- 添加 / 编辑 / 删除书签
- 自定义书签图标 URL
- 快速访问书签网格（搜索聚焦时自动折叠）
- Favicon 异步加载 + 首字母占位
- **拖拽排序** — 书签位置可拖拽调整

### 📊 数据管理
- JSON 配置导入 / 导出
- URL 远程配置导入
- 数据预览与编辑

### ♿ 无障碍
- 支持 `prefers-reduced-motion`（减少动效偏好）
- 支持 `prefers-color-scheme`（系统暗色模式自动检测）
- 键盘焦点可见（`:focus-visible`）
- 键盘导航搜索建议（↑↓ 选择，Enter 确认，Esc 关闭）

## 技术栈

- **TypeScript** — 全量类型覆盖
- **Vite** — 开发构建
- **Pixi.js** — 壁纸渲染引擎（缩放、模糊、过渡）
- **CSS3** — 毛玻璃、自定义属性动画、设计 Token 体系
- **Font Awesome** — 图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
search-nav/
├── src/
│   ├── main.ts              # 入口文件，初始化编排
│   ├── builtInEngines.ts    # 内置引擎列表 & 自定义引擎存储 & 图标覆盖
│   ├── dataManager.ts       # 数据持久化 & JSON 导入导出 & 远程导入
│   ├── dragDropUtils.ts     # 拖拽排序通用工具（书签/引擎）
│   ├── engineManager.ts     # 引擎下拉菜单渲染 & 选择
│   ├── eventHandlers.ts     # 全局 DOM 事件绑定
│   ├── linkManager.ts       # 书签 / 自定义引擎增删改查
│   ├── modeManager.ts       # 三种搜索模式切换 & 默认引擎记忆
│   ├── searchEngines.ts     # 内置搜索引擎 URL 模板数据
│   ├── searchHandler.ts     # 搜索跳转 & URL 安全校验
│   ├── shaderWallpaper.ts   # Shadertoy GLSL 着色器壁纸（WebGL2）
│   ├── suggestionManager.ts # 搜索建议（Google/Baidu JSONP） & 来源切换
│   ├── themeManager.ts      # 主题切换 & 持久化
│   ├── toast.ts             # Toast 消息提示
│   ├── uiManager.ts         # UI 渲染（快速链接 / 设置面板 / 书签列表）
│   ├── wallpaperManager.ts  # 壁纸管理（渐变 / 图片 / 视频 / SVG / Shader）
│   ├── wallpaperRenderer.ts # Pixi.js 壁纸渲染器（缩放 / 模糊 / 过渡）
│   └── types/
│       └── index.ts         # 全局类型定义
├── css/
│   ├── main.css             # 样式入口（聚合其他模块）
│   ├── theme.css            # 设计 Token & 主题 CSS 变量
│   ├── base.css             # 基础样式 & 全局组件
│   ├── search-components.css # 搜索框 & 引擎下拉 & 霓虹流光
│   ├── quick-links.css      # 快速链接网格
│   ├── modal-components.css # 设置面板 & 对话框 & Toast
│   ├── tab-components.css   # 标签页 & 引擎列表
│   ├── theme-controls.css   # 主题切换器
│   └── wallpaper-components.css # 壁纸设置 & 颜色混色器
├── index.html               # HTML 入口
├── vite.config.ts           # Vite 配置（alias / server / build）
├── tsconfig.json
├── package.json
└── manifest.json
```

## 许可证

MIT