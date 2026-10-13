# Path One

Electron + 内核 + React Soft Tonal 的精简 Windows 线路客户端。

解压打开 →「账号」填端口 / 账号 / 密码并保存 → 打开「浏览器模式」。

**用户说明（已拆分）：[GUIDE.md](./GUIDE.md)** → `guide/` 各篇；应用内左侧「说明」为短页。

---

## 要点

- 本地端口 `8888`
- 侧栏分组：**操作**（账号 / 浏览器 / 全局 / 路由 / 服务 / 日志）与 **说明**（快速开始 / 确认已通 / 常见问题）
- 各操作页自带「本页说明」；路由：直连固定、自定义可编辑、MATCH 兜底固定
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
