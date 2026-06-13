# Search Nav

一个功能丰富、简洁美观的浏览器导航首页，支持多搜索引擎、书签管理、自定义壁纸和主题切换。

## 预览

<img width="2145" height="1196" alt="演示" src="https://github.com/GuangYu-yu/search-nav/blob/main/演示.png?raw=true" />

## 功能特性

### 🔍 多模式搜索
- 搜索模式 — 通用网页搜索
- 翻译模式 — 多翻译引擎
- 资源搜索模式 — 知乎、B站、小红书等平台内搜索
- 双击搜索引擎图标切换模式
- 30+ 内置搜索引擎，支持自定义引擎

### 🎨 主题
- 亮色 / 暗色 / 姨妈红 / 科技紫 / 尊贵金五种主题
- 毛玻璃效果（Glassmorphism）
- 搜索框霓虹流光

### 🖼️ 壁纸设置
- 预设渐变背景
- 自定义颜色混色器（方向控制 + 随机配色）
- 图片壁纸支持
- SVG 代码壁纸支持

### 📚 书签管理
- 添加 / 编辑 / 删除书签
- 自定义书签图标
- 快速访问书签网格（搜索聚焦时自动折叠）
- Favicon 异步加载 + 首字母占位

### 📊 数据管理
- JSON 配置导入 / 导出
- URL 远程配置导入

### ♿ 无障碍
- 支持 `prefers-reduced-motion`（减少动效偏好）
- 支持 `prefers-color-scheme`（系统暗色模式自动检测）
- 键盘焦点可见（`:focus-visible`）

## 技术栈

- **TypeScript**
- **Vite**
- **CSS3**

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
│   ├── builtInEngines.ts    # 内置引擎列表 & 自定义引擎存储
│   ├── dataManager.ts       # 数据持久化 & 远程导入
│   ├── engineManager.ts     # 引擎下拉菜单渲染
│   ├── eventHandlers.ts     # 全局 DOM 事件绑定
│   ├── linkManager.ts       # 书签 / 资源增删改查
│   ├── modeManager.ts       # 三种搜索模式切换
│   ├── searchEngines.ts     # 内置搜索引擎 URL 模板
│   ├── searchHandler.ts     # 搜索跳转
│   ├── suggestionManager.ts # 搜索建议获取 & 展示
│   ├── themeManager.ts      # 主题切换
│   ├── toast.ts             # Toast 消息提示
│   ├── uiManager.ts         # UI 渲染（快速链接 / 设置面板）
│   ├── wallpaperManager.ts  # 壁纸管理（渐变 / 图片 / SVG）
│   └── types/
│       └── index.ts         # 全局类型定义
├── css/
│   ├── main.css             # 样式入口（聚合其他模块）
│   ├── theme.css            # 设计 Token & 主题变量
│   ├── base.css             # 基础样式 & 全局组件
│   ├── search-components.css # 搜索框 & 引擎下拉
│   ├── quick-links.css      # 快速链接网格
│   ├── modal-components.css # 设置面板 & 对话框 & Toast
│   ├── tab-components.css   # 标签页 & 引擎列表
│   ├── theme-controls.css   # 主题切换器
│   ├── wallpaper-components.css # 壁纸设置
│   └── color-mixer.css      # 颜色混色器
├── index.html               # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 许可证

MIT