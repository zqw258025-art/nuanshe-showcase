# 暖舍静态展示版

这是一个与现有暖舍 V2 完全隔离的静态产品 Demo，用于 GitHub Pages 公网展示。目录内没有后端、数据库、Worker、PostgreSQL、88API 或 API Key。

## 技术方案

- 原生 ES Modules + HTML + CSS
- Node.js 仅用于本地开发服务器、静态构建和测试
- 零运行时依赖、零 npm 依赖
- Hash 路由，刷新页面不需要服务器重写规则
- 相对资源路径，可部署在 GitHub Pages 任意仓库子路径

## 本地运行

```powershell
cd nuanshe-showcase
node scripts/dev.mjs
```

浏览器访问 `http://127.0.0.1:4173`。

## 检查与构建

```powershell
node --test tests/*.test.mjs
node scripts/build.mjs
```

构建结果位于 `dist/`。该目录直接对应 GitHub Pages 的发布产物。

## GitHub Pages

1. 将 `nuanshe-showcase/` 作为独立仓库根目录，仓库名建议使用 `nuanshe-showcase`。
2. 推送到 `main` 分支。
3. 在 GitHub 仓库的 `Settings > Pages` 中将 Source 设为 `GitHub Actions`。
4. `.github/workflows/pages.yml` 会自动测试、构建并发布。

默认访问地址为：

```text
https://<github-username>.github.io/nuanshe-showcase/
```

## 图片边界

- 用户选择的图片通过浏览器 `File API` 和 `URL.createObjectURL` 在本地预览。
- 图片不会上传、不会写 IndexedDB、LocalStorage 或远端存储。
- 生成完成后展示的图片是暖舍 V2 本地归档中已有的真实输出，页面会明确标记为 `Demo Preview`。

## 素材来源

素材仅从现有暖舍项目中复制并压缩，不修改 V2 原文件：

- `v2/data/eval-inputs/eval-01.png`
- `v2/data/eval-inputs/eval-02.png`
- `v2/data/eval-inputs/eval-03.png`
- `v2/data/eval-inputs/eval-04.jpg`
- `v2/output-eval/eval-01-afternoon-out.jpg`
- `v2/output-eval/eval-01-final-out.jpg`
- `v2/output-eval/eval-01-people-sofa-reading-out.jpg`
- `v2/output-eval/eval-02-v2-out.jpg`
- `v2/output-eval/eval-03-v2-out.jpg`
- `v2/output-eval/eval-04-v2-out.jpg`
