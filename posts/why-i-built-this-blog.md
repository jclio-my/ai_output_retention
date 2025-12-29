---
title: "为什么构建这个博客"
date: "2024-12-28"
---

# 为什么构建这个博客

在使用 AI 的过程中，我常常会产生一些有价值的对话和输出。这些内容值得被保存下来，而不是随着时间的流逝而消失。

## 技术选择

### Next.js 14+
- 使用最新的 App Router
- 静态导出功能 (`output: 'export'`)
- 优秀的开发体验

### Tailwind CSS
- 快速的样式开发
- 内置暗黑模式支持
- Typography 插件用于文章排版

### 其他工具
- `gray-matter`: 解析 Markdown frontmatter
- `react-markdown`: 在 React 中渲染 Markdown
- `next-themes`: 主题切换管理

## 部署方案

选择 Cloudflare Pages 作为部署平台，因为：
- 全球 CDN 加速
- 自动构建和部署
- 免费的 SSL 证书
- 连接 GitHub 仓库即可自动更新

希望这个简单的博客能帮助更多人保存有价值的 AI 对话内容。
