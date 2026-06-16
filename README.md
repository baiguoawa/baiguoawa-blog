# baiguoawa / 白果的个人博客

## 中文

你好，这个仓库是 **baiguoawa** 的个人博客项目。

这个项目目前是一个公开前端仓库，主要用于个人内容展示、页面设计和博客风格实验。这个公开版本只包含前端文件。

如果你也想创作一个类似风格或类似结构的个人博客，可以把这个项目作为参考或模板使用。
但在使用前，请先通过私信联系我，获得我的同意，并说明你的具体用途。感谢配合。

### 使用说明

推荐使用 Node.js 24 和 npm。

```sh
npm ci
npm run dev
```

打开 Next.js 输出的本地地址即可预览。

### 常用命令

```sh
npm run lint
npm test
npm run build
npm start
```

`npm test` 会运行本地页面完整性检查。`npm run build` 会验证生产构建。

### 页面

- `/`：首页
- `/articles`：文章列表，目前为空状态
- `/tags`：标签页面，目前为空状态

### 配置

公开前端不需要环境变量。

### 发布说明

请只通过干净的 Git 工作流发布公开前端内容。

不要上传旧的本地项目文件夹、旧 Git 历史，或这些本地产物目录：

- `.next/`
- `.local/`
- `.backups/`
- `.worktrees/`
- `.omx/`
- `.playwright-mcp/`
- `.codegraph/`
- `node_modules/`

目前此项目对移动端或者狭窄的浏览器窗口支持并不完善，但日后会进行修改。

### 许可

保留所有权利。这个仓库可供查看，但未经仓库所有者书面许可，不得使用、复制、修改、再发布或分发其中任何内容。

## English

Hello, this repository is the personal blog project of **baiguoawa**.

This project is currently a public frontend-only repository. It is mainly used for personal content presentation, page design, and blog style experiments. This public version only includes frontend files.

If you want to create a personal blog with a similar style or structure, you may use this project as a reference or template.
However, before using it, please contact me privately, obtain my permission, and explain your intended use. Thank you for your cooperation.

### Usage

Node.js 24 and npm are recommended.

```sh
npm ci
npm run dev
```

Open the local URL printed by Next.js to preview the site.

### Scripts

```sh
npm run lint
npm test
npm run build
npm start
```

`npm test` runs the local page integrity check. `npm run build` verifies the production build.

### Pages

- `/`: home page
- `/articles`: article list, currently empty
- `/tags`: tag pages, currently empty

### Configuration

No environment variables are required for the public frontend.

### Publishing Notes

Publish only through a clean Git workflow for the public frontend.

Do not upload the old local project folder, old Git history, or local artifact folders such as:

- `.next/`
- `.local/`
- `.backups/`
- `.worktrees/`
- `.omx/`
- `.playwright-mcp/`
- `.codegraph/`
- `node_modules/`

Currently, this project does not provide adequate support for mobile devices or narrow browser windows. Improvements will be made in the future.

### License

All rights reserved. This repository is visible for review only. Do not use, copy, modify, redistribute, or publish any part of it without written permission from the owner.
