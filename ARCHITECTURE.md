# Path One — 架构说明

Path One 是精简版 Windows 线路客户端。技术栈：Electron 33 + electron-vite + React 18 + Tailwind Soft Tonal + 自带内核。

## 产品边界

- 用户只填 **端口 / 账号 / 密码**。
- 上游固定：`server = 10.0.0.101`，`type = socks5`，节点名 `Path`（见 `src/shared/path-line.ts`）。
- 无订阅、无节点列表、无路由编辑器、无 DNS 编辑页。
- 界面四页：首页、使用说明、系统服务、内核日志。
- 产品文案只称「内核」，不出现第三方内核品牌名。随包文件名为 `core.exe`。

## 配置流

1. 首页保存 → `app:save-config`
2. `normalizePathConfig` 强制写入唯一 Path 节点与 `PATH_ONE_RULES`
3. `generateCoreConfig` 写出 `config.yaml`
4. 热重载内核控制面

规则固定为：私网 / `GEOIP,CN` 直连，其余 `MATCH,PROXY`。

## 模式

- **浏览器模式**：系统代理 → `127.0.0.1:7890`
- **全局模式**：TUN；仅当 `PathOneService` 运行中时，生成配置才带 `tun.enable: true`

## 身份与预览

- 生产只出 unpack：`pnpm build:unpack` → `dist/win-unpacked`（无 NSIS / 无全量 zip 目标）
- 正式：`com.pathone.app`（含 `win-unpacked`）
- 预览：仅未打包的 `pnpm dev` 默认开启；`com.pathone.app.preview`，`%APPDATA%\PathOne-Preview`

## 目录要点

```text
src/main/           主进程（内核、代理、服务、托盘）
src/shared/path-line.ts   固定线路与配置归一化
src/renderer/       Soft Tonal UI（Home / Guide / Service / Logs）
resources/binaries/ core.exe、core.sha256、PathOneService
```
