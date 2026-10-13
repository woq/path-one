# Path One — 架构说明

技术栈：Electron 33 + electron-vite + React 18 + Tailwind Soft Tonal + 自带内核。

## 产品边界

- 首页填写端口 / 账号 / 密码；服务器 `10.0.0.101`，协议 socks5，节点名 `Path`
- 本地混合端口默认 **8888**
- 路由：固定直连规则（只读）+ 用户自定义规则 + 固定 MATCH→PROXY
- 侧栏：首页、路由分流、使用说明、系统服务、内核日志
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
src/main/                 主进程
src/shared/path-line.ts   固定线路、直连规则、规则合并
src/renderer/src/pages/   Home / Routing / Guide / SystemService / Logs
resources/binaries/       core.exe、core.sha256、PathOneService
```
