# Path One

Electron + 内核 + React Soft Tonal 的精简 Windows 线路客户端。

解压打开 → 在首页填写端口 / 账号 / 密码并保存 → 打开「浏览器模式」。

**完整用户说明（按页面与卡片）：[GUIDE.md](./GUIDE.md)**（与应用内「使用说明」一致）。

---

## 要点

- 服务器固定 `10.0.0.101`，协议 SOCKS5，本地混合端口 `8888`
- 首页：账号、浏览器模式、全局模式、内核状态
- 路由分流：直连规则固定只读；自定义规则可编辑；MATCH 兜底固定
- 发放形态：`pnpm build:unpack` → `dist/win-unpacked`

---

## 开发者

```bash
pnpm install
pnpm dev
pnpm test
pnpm build:unpack   # → dist/win-unpacked
```

- 固定线路与规则合并：`src/shared/path-line.ts`
- 生产 unpack 使用正式身份 `com.pathone.app`
- 仅 `pnpm dev` 默认预览实例
- 内核文件：`resources/binaries/core.exe`

详见 [ARCHITECTURE.md](./ARCHITECTURE.md)。
