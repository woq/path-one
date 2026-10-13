# binaries

由 `scripts/prepare-binaries.mjs` 准备（`pnpm build:unpack` 会先执行），不提交大文件进 git。

复用顺序（缺文件时）：本目录已有 → 旁路项目同名文件（如 `../Frozen-XUI/resources/binaries`）→ `resources/binaries/.cache` → 才联网下载。zip / 地理库会留在 `.cache`，下次不再重下。`FORCE_DOWNLOAD=true` 强制刷新。

1. `core.exe`：Windows x64 内核。下载后统一改名为 `core.exe`。默认版本可用环境变量 `CORE_UPSTREAM_VERSION` 覆盖（仅构建脚本）。同目录的 `core.sha256` 由脚本写下；安装系统服务时会按当时的文件再写一次。服务启动时摘要不符就拒绝启动；文件不存在则记警告并继续。
2. `PathOneService.exe` / `PathOneService.cs`：开机服务。
3. `geoip.dat` / `geosite.dat` / `country.mmdb`：规则与地理库。
4. `anti-ad.yaml`：可选规则载荷。
5. `wintun.dll`：本脚本不下载。若所用内核没有内嵌 Wintun，把 x64 `wintun.dll` 放在本目录。
