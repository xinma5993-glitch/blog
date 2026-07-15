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
├── plan.html
├── edit.html
├── post.html
├── 404.html
├── posts/
│   ├── welcome.html
│   ├── git-and-github.html
│   └── learning-notes.html
├── content/
│   ├── site/content.json
│   ├── posts/posts.json
│   └── plans/plan.json
├── assets/
│   ├── css/style.css
│   ├── js/main.js
│   ├── js/content-editor.js
│   ├── js/planner.js
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

## 在网页里修改内容

访问 `edit.html` 可以在浏览器中修改网站名称、首页介绍、关于介绍和文章内容，也可以点击“新建文章”创建浏览器本地文章。保存时通过“保存到分类”字段选择或输入分类。改动会保存在当前浏览器的 `localStorage`，不会自动写回 GitHub 仓库。

浏览器中新建的文章会出现在首页文章列表中，并通过 `post.html?slug=文章标识` 打开。这个页面依赖当前浏览器保存的数据；如果换浏览器或清除缓存，需要先导入之前导出的 JSON。

如果需要把网页中的修改变成长期版本：

1. 在 `edit.html` 点击“导出 JSON”。
2. 将导出的内容整理回 `content/site/content.json` 和 `content/posts/posts.json`，并同步更新对应 HTML。
3. 运行 `python scripts/check_site.py`。
4. 提交并推送改动。

## 计划表

访问 `plan.html` 可以维护学习、写作和网站维护计划。计划表同样保存在当前浏览器中，并支持导出和导入 JSON。默认计划存放在 `content/plans/plan.json`。

## 修改网站信息

网站名称和首页介绍主要在 `index.html` 中修改。

默认站点内容也整理在 `content/site/content.json` 中，便于后续维护。

作者介绍在 `about.html` 中修改。

文章默认数据在 `content/posts/posts.json` 中整理，正式发布时仍需同步更新 `posts/` 中的 HTML 页面和首页入口。

全站样式在 `assets/css/style.css` 中修改。

深色模式、年份更新和浏览器内容覆盖逻辑在 `assets/js/main.js` 中修改。

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
