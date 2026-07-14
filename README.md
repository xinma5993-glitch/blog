# Xinma's Blog

这是 `xinma5993-glitch` 的个人静态博客，用来记录学习、技术与生活。项目使用原生 HTML、CSS 和 JavaScript，不依赖构建工具、后端服务或外部 CDN，适合直接部署到 GitHub Pages。

## 在线访问

网站地址：

```text
https://xinma5993-glitch.github.io/blog/
```

## 目录结构

```text
.
├── index.html
├── about.html
├── 404.html
├── posts/
│   ├── welcome.html
│   ├── git-and-github.html
│   └── learning-notes.html
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   └── images/
│       ├── avatar.svg
│       └── favicon.svg
├── scripts/check_site.py
├── robots.txt
├── sitemap.xml
├── feed.xml
├── site.webmanifest
├── .nojekyll
├── AGENTS.md
└── README.md
```

## 本地预览

在项目根目录运行：

```bash
python -m http.server 8000
```

然后在浏览器访问：

```text
http://localhost:8000/
```

停止预览服务器时，在终端按 `Ctrl+C`。

## 新增文章

1. 在 `posts/` 目录中新建一个 HTML 文件。
2. 复制现有文章页结构，修改 `title`、`meta description`、`canonical`、日期、标签和正文。
3. 在 `index.html` 的文章卡片区域加入新文章入口。
4. 更新 `sitemap.xml` 和 `feed.xml`。
5. 运行检查脚本：

```bash
python scripts/check_site.py
```

## 修改网站信息

网站名称和首页介绍主要在 `index.html` 中修改。

作者介绍在 `about.html` 中修改。

全站样式在 `assets/css/style.css` 中修改。

深色模式和年份更新逻辑在 `assets/js/main.js` 中修改。

## GitHub Pages 部署

本项目是 GitHub Pages 项目站点，预计路径包含 `/blog/`：

```text
https://xinma5993-glitch.github.io/blog/
```

资源和站内链接使用相对路径，避免部署到项目路径后出现资源 404。

推荐在 GitHub Pages 中选择从 `main` 分支的仓库根目录发布。如果分支发布不可用，可以使用仓库中的 GitHub Pages Actions 工作流部署静态文件。

## 常见问题

### 页面样式没有加载

检查 HTML 中的 CSS 路径是否相对于当前页面正确。根目录页面使用 `assets/css/style.css`，`posts/` 中的文章页使用 `../assets/css/style.css`。

### 新文章没有出现在首页

需要手动在 `index.html` 的文章列表中添加文章卡片。

### GitHub Pages 访问 404

先确认 Pages 是否已启用，再检查发布分支、目录和仓库路径是否为 `/blog/`。

### 深色模式没有保存

浏览器需要允许 `localStorage`。如果 JavaScript 被禁用，网站仍然可以阅读，只是不会保存手动主题选择。
