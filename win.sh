#!/usr/bin/env bash
set -e

WIN_DIR="D:\\code\\path-one"
NODE_PATH="C:\\Program Files\\nodejs;C:\\Users\\Administrator\\AppData\\Local\\pnpm;C:\\Users\\Administrator\\AppData\\Local\\pnpm\\bin;"

run_in_win() {
  local cmd="$1"
  powershell.exe -NoProfile -Command "
    \$env:Path = '${NODE_PATH}' + \$env:Path;
    \$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/';
    \$env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/';
    Set-Location '${WIN_DIR}';
    ${cmd}
  " < /dev/null
}

case "$1" in
  install)
    echo "==> [Windows] Installing dependencies with pnpm..."
    run_in_win "pnpm install"
    ;;
  dev)
    echo "==> [Windows] Launching Electron Dev Server & Native Window..."
    run_in_win "pnpm dev"
    ;;
  build)
    echo "==> [Windows] Building project with electron-vite..."
    run_in_win "pnpm build"
    ;;
  build:win|build:unpack|build:release)
    echo "==> [Windows] Building unpack production (dist/win-unpacked)..."
    run_in_win "pnpm build:unpack"
    ;;
  test)
    echo "==> [Windows] Running typecheck and automated unit tests..."
    run_in_win "pnpm test"
    ;;
  typecheck)
    echo "==> [Windows] Running typecheck..."
    run_in_win "pnpm typecheck"
    ;;
  exec)
    shift
    echo "==> [Windows] Executing pnpm $*..."
    run_in_win "pnpm $*"
    ;;
  *)
    echo "Usage: ./win.sh [install|dev|build|build:unpack|build:win|test|typecheck|exec <args>]"
    echo ""
    echo "Commands:"
    echo "  install       - pnpm install"
    echo "  dev           - pnpm dev"
    echo "  build         - electron-vite build only"
    echo "  build:unpack  - production unpack → dist/win-unpacked"
    echo "  build:win     - alias of build:unpack"
    echo "  test          - typecheck + unit tests"
    echo "  exec ...      - arbitrary pnpm command"
    exit 1
    ;;
esac
