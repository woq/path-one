import { Tray, Menu, nativeImage, NativeImage, BrowserWindow, app } from 'electron'
import path from 'path'
import fs from 'fs'

let tray: Tray | null = null
let trayWindow: BrowserWindow | null = null

// Distinct from Frozen-XUI; Windows NotifyIcon GUID must be unique per app.
const TRAY_GUID = '39a51539-3f73-448c-b859-38abfa6fd5aa'

// Embedded 32x32 path-one fallback icon (PNG base64)
const FALLBACK_ICON_BASE64 =
  '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'

function loadTrayIcon(): NativeImage {
  const candidatePaths = [
    path.join(process.resourcesPath, 'icon.ico'),
    path.join(process.resourcesPath, 'icon.png'),
    path.join(path.dirname(process.execPath), 'resources', 'icon.ico'),
    path.join(path.dirname(process.execPath), 'resources', 'icon.png'),
    path.join(path.dirname(process.execPath), 'icon.ico'),
    path.join(path.dirname(process.execPath), 'icon.png'),
    path.join(app.getAppPath(), 'resources', 'icon.ico'),
    path.join(app.getAppPath(), 'resources', 'icon.png'),
    path.join(__dirname, '../../resources/icon.ico'),
    path.join(__dirname, '../../resources/icon.png')
  ]

  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        const img = nativeImage.createFromPath(p)
        if (!img.isEmpty()) {
          return img
        }
        const buf = fs.readFileSync(p)
        const imgFromBuf = nativeImage.createFromBuffer(buf)
        if (!imgFromBuf.isEmpty()) {
          return imgFromBuf
        }
      }
    } catch {
      // try next
    }
  }

  try {
    return nativeImage.createFromDataURL(`data:image/png;base64,${FALLBACK_ICON_BASE64}`)
  } catch {
    return nativeImage.createEmpty()
  }
}

function buildTray(mainWindow: BrowserWindow): Tray {
  const icon = loadTrayIcon()
  const created = new Tray(icon, TRAY_GUID)
  created.setToolTip('Path One')

  const showWindow = () => {
    if (mainWindow.isMinimized()) mainWindow.restore()
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    mainWindow.focus()
  }

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主界面',
      click: () => {
        showWindow()
      }
    },
    { type: 'separator' },
    {
      label: '直连模式',
      type: 'radio',
      checked: false,
      click: () => {
        mainWindow.webContents.send('tray:change-mode', 'direct')
      }
    },
    {
      label: '规则路由模式',
      type: 'radio',
      checked: true,
      click: () => {
        mainWindow.webContents.send('tray:change-mode', 'rule')
      }
    },
    {
      label: '全局代理模式',
      type: 'radio',
      checked: false,
      click: () => {
        mainWindow.webContents.send('tray:change-mode', 'global')
      }
    },
    { type: 'separator' },
    {
      label: '退出 Path One',
      click: () => {
        app.quit()
      }
    }
  ])

  created.setContextMenu(contextMenu)

  created.on('click', () => {
    showWindow()
  })

  created.on('double-click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide()
    } else {
      showWindow()
    }
  })

  return created
}

export function createTray(mainWindow: BrowserWindow): Tray | null {
  trayWindow = mainWindow
  if (mainWindow.isDestroyed()) return tray
  if (tray && !tray.isDestroyed()) return tray
  try {
    tray = buildTray(mainWindow)
    return tray
  } catch (err) {
    console.error('[Tray] Failed to create tray icon:', err)
    tray = null
    return null
  }
}

/**
 * Explorer often starts after a logon-time process. A tray created too early
 * is dropped when the notification area is rebuilt. Recreate a few times.
 */
export function scheduleTray(mainWindow: BrowserWindow): void {
  trayWindow = mainWindow
  const delays = [0, 1500, 5000, 15000]
  for (const delay of delays) {
    setTimeout(() => {
      if (!trayWindow || trayWindow.isDestroyed()) return
      if (tray && !tray.isDestroyed()) return
      createTray(trayWindow)
    }, delay)
  }
}
