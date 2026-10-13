# Path One — 架构说明

技术栈：Electron 33 + electron-vite + React 18 + Tailwind Soft Tonal + 自带内核。

## 产品边界

- 「账号」页填写端口 / 账号 / 密码；固定上游节点名 `Path`（见 `path-line.ts`）
- 本地端口默认 **8888**
- 路由：固定直连规则（只读）+ 用户自定义规则 + 固定 MATCH→PROXY
- 侧栏分组：操作（账号 / 浏览器 / 全局 / 路由 / 服务 / 日志）+ 说明（快速开始 / 确认已通 / 常见问题）
- 「账号」页含国内（直连）/ 国外（经本机端口）连通测试：`line:probe` → `line-probe.ts`
- 用户文档：`GUIDE.md` 索引 + `guide/*.md` 分篇
- 生产只出 unpack：`pnpm build:unpack` → `dist/win-unpacked`

## 配置流

1. 保存 → `normalizePathConfig`（固定节点、`mergePathRules`、mixedPort=8888）
2. `generateCoreConfig` 写出 `config.yaml`
3. 热重载控制面

## 模式

- 浏览器模式：系统代理 → `127.0.0.1:8888`
- 全局模式：TUN；仅 `PathOneService` 运行时配置才带 `tun.enable: true`

## 身份

- 正式：`com.pathone.app`（含 win-unpacked）
- 预览：仅未打包的 `pnpm dev`

## 目录

```text
src/main/                      主进程（含 line-probe.ts）
src/shared/path-line.ts        固定线路、直连规则、规则合并
src/renderer/src/pages/        Account / BrowserMode / GlobalMode / Routing / …
src/renderer/src/pages/guide/  GuideStart / GuideVerify / GuideFaq
guide/*.md                     分篇用户文档（GUIDE.md 为目录）
resources/binaries/            core.exe、core.sha256、PathOneService
```
