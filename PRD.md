# MVP 需求文档 (PRD)

## likecamping-seo-writer
AI SEO Content Generation MVP

---

## 1. 项目概述

### 1.1 项目名称
likecamping-seo-writer

### 1.2 项目描述
MVP for AI SEO Content Generation - 一个基于AI的SEO内容生成工具

### 1.3 目标用户
- 内容创作者
- SEO优化师
- 营销人员
- 博客运营者

---

## 2. 功能需求

### 2.1 核心功能

#### 2.1.1 关键词输入
- 支持用户输入目标关键词
- 关键词输入框位于页面顶部
- 支持中文和英文关键词

#### 2.1.2 文章类型选择
- 提供多种文章类型选项：
  - 博客文章 (Blog Post)
  - 产品描述 (Product Description)
  - 着陆页文案 (Landing Page)
  - 社交媒体文案 (Social Media)

#### 2.1.3 内容生成
- 点击 Generate 按钮触发内容生成
- 使用打字机效果逐步显示生成的内容
- 在左侧 Source 面板显示原始 Markdown 内容
- 在右侧 Preview 面板实时渲染排版后的内容

### 2.2 界面布局

#### 2.2.1 顶部区域
- 关键词输入框
- 文章类型选择按钮组
- Generate 生成按钮

#### 2.2.2 主体区域（左右分栏）
- **左侧 Source**：显示生成的 Markdown 源代码
- **右侧 Preview**：实时渲染的预览效果
- 两栏宽度比例：1:1
- 支持滚动同步（可选）

---

## 3. 技术栈

### 3.1 前端技术
- HTML5
- Tailwind CSS (CDN)
- 原生 JavaScript
- marked.js (Markdown渲染)

### 3.2 设计规范
- 极简商务风格
- 响应式布局
- 清晰的视觉层次

---

## 4. 非功能需求

### 4.1 性能要求
- 页面加载时间 < 2秒
- 打字机效果流畅，无卡顿

### 4.2 兼容性
- 支持现代浏览器（Chrome, Firefox, Safari, Edge）
- 支持移动端基础浏览

---

## 5. 未来规划

### 5.1 后续版本功能
- 接入真实大模型 API
- 支持导出多种格式（PDF, Word）
- 支持保存历史记录
- 支持多语言内容生成

---

## 6. 项目信息

- **创建日期**: 2026-03-24
- **仓库地址**: https://github.com/kabindamo-tech/likecamping-seo-writer
- **状态**: MVP 开发中
