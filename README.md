# AI Output Retention

一个极简主义的静态博客系统，用于保存和展示有价值的 AI 输出内容。

## ✨ 特性

- **极简设计** - 干净的界面，专注于内容本身
- **深黑字体** - 使用 `#1a1a1a` 颜色，比纯黑更柔和
- **微软雅黑** - 优先使用微软雅黑字体，提供更好的中文阅读体验
- **暗黑模式** - 支持亮色/暗色主题切换
- **智能搜索** - 支持搜索历史、关键词高亮、键盘导航
- **瀑布流布局** - 列表页采用瀑布流展示所有文章
- **纯静态导出** - 可部署到 Cloudflare Pages 等静态托管服务

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果。

### 构建生产版本

```bash
npm run build
```

构建后的静态文件将输出到 `out` 目录。

## 📁 项目结构

```
ai_output_retention/
├── posts/                  # Markdown 文章存放目录
│   ├── article-1.md
│   └── article-2.md
├── public/                 # 静态资源
│   ├── favicon.svg
│   └── logo.svg
├── src/
│   ├── app/
│   │   ├── layout.js       # 全局布局
│   │   ├── page.js         # 首页（显示最新文章）
│   │   ├── list/
│   │   │   └── page.js     # 列表页（瀑布流）
│   │   ├── posts/
│   │   │   └── [slug]/
│   │   │       └── page.js # 文章详情页
│   │   ├── api/
│   │   │   └── posts/
│   │   │       └── route.js # 文章 API
│   │   ├── globals.css     # 全局样式
│   │   └── theme-provider.js # 主题提供者
│   ├── components/
│   │   ├── ThemeToggle.js  # 暗黑模式切换按钮
│   │   ├── SearchBox.js    # 搜索组件
│   │   └── CopyPostButton.js # 复制文章按钮
│   └── lib/
│       └── posts.js        # Markdown 读取工具函数
├── next.config.js          # Next.js 配置
├── tailwind.config.js      # Tailwind CSS 配置
└── package.json
```

## 📝 添加文章

在 `posts/` 目录下创建 Markdown 文件，文件名即为文章 ID。

### 文章格式

```markdown
---
title: "文章标题"
date: "2024-12-30"
---

# 欢迎使用 AI Output Retention

这里是正文内容...
```

**说明：**
- `title` - 文章标题（可选，如未指定将从内容中提取第一个标题）
- `date` - 发布日期（可选，默认为当前时间）
- 文件名（不含 .md）即为文章 ID

## 🛠️ 技术栈

- **框架**: [Next.js 14+](https://nextjs.org/) (App Router, Static Export)
- **语言**: JavaScript
- **样式**: [Tailwind CSS](https://tailwindcss.com/)
- **Markdown 解析**: [gray-matter](https://github.com/jonschlinkert/gray-matter), [react-markdown](https://github.com/remarkjs/react-markdown)
- **主题**: [next-themes](https://github.com/pacocoursey/next-themes)
- **图标**: [lucide-react](https://lucide.dev/)
- **日期处理**: [date-fns](https://date-fns.org/)

## 🚢 部署

### Cloudflare Pages

1. 将代码推送到 GitHub 仓库
2. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/) → Pages
3. 点击 "Create a project" → "Connect to Git"
4. 选择你的仓库
5. 配置构建设置：
   - **Framework preset**: Next.js (Static HTML Export)
   - **Build command**: `npm run build`
   - **Output directory**: `out`
6. 点击 "Save and Deploy"

### 其他静态托管

由于项目使用纯静态导出，可以部署到任何支持静态托管的平台：
- Vercel
- Netlify
- GitHub Pages
- 等等...

## 🎨 自定义配置

### 修改字体

编辑 `tailwind.config.js`:

```javascript
fontFamily: {
  sans: ['"Microsoft YaHei"', 'sans-serif'],
},
```

### 修改颜色

编辑 `tailwind.config.js`:

```javascript
colors: {
  ink: '#1a1a1a', // 深黑字体颜色
},
```

### 修改暗黑模式背景色

编辑 `src/app/layout.js`:

```javascript
<body className="bg-white dark:bg-[#121212] ...">
```

## 📄 许可证

ISC

## 👤 作者

hyppx