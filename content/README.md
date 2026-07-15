# Content Directory

这个目录把博客内容按模块拆分，方便以后维护。

- `site/content.json`：网站名称、作者、首页介绍和关于页介绍。
- `posts/posts.json`：文章标题、日期、标签、摘要和正文结构。
- `plans/plan.json`：计划表默认任务。

网站上的 `edit.html` 和 `plan.html` 会读取这些默认内容，并把浏览器中修改后的内容保存到 `localStorage`。静态 GitHub Pages 不能直接把网页里的修改写回这些文件；如需永久提交，请导出 JSON 后再整理进仓库。
