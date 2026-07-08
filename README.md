# Tools Web Frontend

工具网站前端：**React + TypeScript + Vite + TailwindCSS**。

## 功能

- 首页工具列表
- 音视频转文字：上传文件 / 粘贴 URL、进度轮询、结果展示

## 本地开发

```bash
npm install
npm run dev
```

浏览器访问 http://localhost:5173 ，API 通过 Vite 代理到 `http://localhost:18080`。

## 生产构建

```bash
npm run build
```

产物在 `dist/`，由 Nginx 托管，API 走 `/api` 反向代理。

## 环境变量

```env
# 生产环境若 API 同域可留空；跨域填完整地址
VITE_API_BASE=
```

## 与后端联调

1. 启动 backend ASR + API（见 tools-web-backend README）
2. `npm run dev`
3. 打开「音视频转文字」页测试

## 部署

见后端仓库 `deploy/ubuntu-baidu.md` 中的 Nginx 配置。
