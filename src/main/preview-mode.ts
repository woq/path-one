import path from 'path'
import { createRequire } from 'node:module'

export const RELEASE_AUMID = 'com.pathone.app'
export const PREVIEW_AUMID = 'com.pathone.app.preview'

const require = createRequire(import.meta.url)

function electronApp() {
  return (require('electron') as typeof import('electron')).app
}

/**
 * Only `pnpm dev` (unpackaged) defaults to preview.
 * Production is always the unpack folder (`dist/win-unpacked`) with release identity.
 * Override with `--preview` / `--no-preview`.
 */
export function resolvePreviewMode(opts: {
  argv: string[]
  isPackaged: boolean
  execPath: string
}): boolean {
  if (opts.argv.includes('--no-preview')) return false
  if (opts.argv.includes('--preview')) return true
  return !opts.isPackaged
}

let cached: boolean | null = null

export function isPreviewInstance(): boolean {
  if (cached !== null) return cached
  cached = resolvePreviewMode({
    argv: process.argv,
    isPackaged: electronApp().isPackaged,
    execPath: process.execPath
  })
  return cached
}

/** Must run before `app.requestSingleInstanceLock()`. */
export function applyPreviewInstanceIdentity(): void {
  if (!isPreviewInstance()) return
  const app = electronApp()
  app.setPath('userData', path.join(app.getPath('appData'), 'PathOne-Preview'))
  app.setName('Path One Preview')
}

export function previewAppUserModelId(): string {
  return isPreviewInstance() ? PREVIEW_AUMID : RELEASE_AUMID
}

export function previewWindowTitle(): string {
  return isPreviewInstance() ? 'Path One (Preview)' : 'Path One'
}
