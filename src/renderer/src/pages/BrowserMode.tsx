import React, { useEffect, useState } from 'react'
import { AlertTriangle, Globe, RefreshCw, ShieldOff, Wifi, WifiOff } from 'lucide-react'
import type { AppConfig } from '../types'
import { DEFAULT_MIXED_PORT, credentialsComplete } from '../../../shared/path-line'

interface Props {
  config: AppConfig
  onUpdateConfig: (cfg: AppConfig) => void | Promise<void>
}

export const BrowserMode: React.FC<Props> = ({ config, onUpdateConfig }) => {
  const [busy, setBusy] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [coreStatus, setCoreStatus] = useState({ running: false, binaryExists: false })

  const ready = credentialsComplete(config)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      const st = await window.api?.getCoreStatus()
      if (alive && st) setCoreStatus({ running: !!st.running, binaryExists: !!st.binaryExists })
    }
    void tick()
    const id = window.setInterval(() => void tick(), 2000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])

  const toggle = async () => {
    if (!ready && !config.systemProxy) {
      setWarning('请先到「账号」页保存端口、账号和密码。')
      return
    }
    setBusy(true)
    setWarning(null)
    setMsg(null)
    try {
      const next = !config.systemProxy
      await onUpdateConfig({ ...config, systemProxy: next })
      await window.api?.setSystemProxy?.(next)
      setMsg(next ? '浏览器模式已打开。' : '浏览器模式已关闭。')
    } catch (err) {
      setWarning(err instanceof Error ? err.message : '切换失败')
    } finally {
      setBusy(false)
    }
  }

  const emergencyClear = async () => {
    setBusy(true)
    try {
      await onUpdateConfig({ ...config, systemProxy: false })
      await window.api?.setSystemProxy?.(false)
      setWarning(null)
      setMsg('系统代理已关闭。')
    } finally {
      setBusy(false)
    }
  }

  const restartCore = async () => {
    setBusy(true)
    try {
      await window.api?.restartCore?.()
      setMsg('正在重启内核…')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-text">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">Path One</p>
        <h1 className="text-3xl font-semibold text-fx-text tracking-tight">浏览器模式</h1>
        <p className="text-sm text-fx-muted leading-relaxed">
          打开后，Windows 系统代理指向本机 {DEFAULT_MIXED_PORT} 端口。适合 Edge / Chrome 等浏览器访问。
        </p>
      </header>

      <section className="fx-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-fx-text font-medium">
              <Globe className="w-4 h-4 text-fx-accent" />
              开关
            </div>
            <p className="text-xs text-fx-muted leading-relaxed">
              当前：{config.systemProxy ? '已打开' : '已关闭'}
              {!ready && ' · 请先在「账号」页保存完整信息'}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            aria-pressed={config.systemProxy}
            onClick={() => void toggle()}
            className={`relative w-12 h-7 rounded-full transition duration-fx shrink-0 ${
              config.systemProxy ? 'bg-fx-accent' : 'bg-fx-surface'
            }`}
          >
            <span
              className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition duration-fx ${
                config.systemProxy ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>
        {warning && (
          <p className="text-xs text-amber-200/90 flex gap-1.5 items-start">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {warning}
          </p>
        )}
        {msg && <p className="text-xs text-fx-ok">{msg}</p>}
      </section>

      <section className="fx-panel rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-medium text-fx-text">本页说明</h2>
        <ul className="text-xs text-fx-muted space-y-2 list-disc pl-5 leading-relaxed">
          <li>打开前请先在「账号」页保存端口、账号、密码。</li>
          <li>打开后，会跟随系统代理的程序（常见为浏览器）将走线路。</li>
          <li>国内站点与本地网段仍按路由里的直连规则处理。</li>
          <li>命令行、Git 等通常不跟随系统代理；这类用途请用「全局模式」。</li>
          <li>用完后关闭本开关，或点下方「救急：关系统代理」。</li>
          <li>网页突然全部打不开时，优先点救急按钮。</li>
        </ul>
      </section>

      <section className="fx-panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {coreStatus.running ? (
            <Wifi className="w-4 h-4 text-fx-ok" />
          ) : (
            <WifiOff className="w-4 h-4 text-fx-muted" />
          )}
          <div className="text-sm text-fx-text">
            内核 {coreStatus.running ? '运行中' : '未运行'}
            {!coreStatus.binaryExists && (
              <span className="text-fx-danger ml-2 text-xs">缺少内核文件</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={busy} onClick={() => void restartCore()} className="fx-btn">
            <RefreshCw className="w-3.5 h-3.5" />
            重启内核
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => void emergencyClear()}
            className="fx-btn text-rose-200"
          >
            <ShieldOff className="w-3.5 h-3.5" />
            救急：关系统代理
          </button>
        </div>
      </section>
    </div>
  )
}
