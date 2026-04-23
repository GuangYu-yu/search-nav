# Search Nav

一个功能丰富、简洁美观的浏览器导航首页，支持多搜索引擎、书签管理、自定义壁纸和主题切换。

## 预览

<img width="2145" height="1196" alt="演示" src="https://gitee.com/zhxdcyy/search-nav/raw/master/演示.png" />

## 功能特性

### 🎨 主题
- 亮色主题
- 暗色主题
- 姨妈红主题
- 科技紫主题
- 尊贵金主题

### 🖼️ 壁纸设置
- 预设渐变背景
- 自定义颜色混色器
- 图片壁纸支持
- SVG 代码壁纸支持

### 📚 书签管理
- 添加/编辑/删除书签
- 自定义书签图标
- 快速访问书签网格

### 📊 数据管理
- JSON 配置导入/导出
- URL 远程配置导入

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
│   ├── main.ts              # 入口文件
│   ├── dataManager.ts       # 数据管理
│   ├── engineManager.ts     # 搜索引擎管理
│   ├── eventHandlers.ts     # 事件处理
│   ├── linkManager.ts       # 书签/资源管理
│   ├── modeManager.ts       # 模式切换
│   ├── searchEngines.ts     # 搜索引擎配置
│   ├── searchHandler.ts     # 搜索处理
│   ├── suggestionManager.ts # 搜索建议
│   ├── themeManager.ts      # 主题管理
│   ├── uiManager.ts         # UI 管理
│   ├── utils.ts             # 工具函数
│   ├── wallpaperManager.ts  # 壁纸管理
│   └── types/
│       └── index.ts         # 类型定义
├── css/
│   ├── main.css             # 主样式
│   ├── theme.css            # 主题样式
│   ├── base.css             # 基础样式
│   └── ...                  # 其他组件样式
├── index.html               # HTML 入口
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 许可证

MIT