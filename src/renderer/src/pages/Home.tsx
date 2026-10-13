import React, { useEffect, useState } from 'react'
import {
  AlertTriangle,
  BookOpen,
  Globe,
  KeyRound,
  RefreshCw,
  Rocket,
  ShieldOff,
  Wifi,
  WifiOff
} from 'lucide-react'
import type { AppConfig } from '../types'
import {
  DEFAULT_MIXED_PORT,
  FIXED_LINE_SERVER,
  FIXED_LINE_TYPE,
  credentialsComplete
} from '../../../shared/path-line'

interface HomeProps {
  config: AppConfig
  onUpdateConfig: (cfg: AppConfig) => void | Promise<void>
  onOpenGuide: () => void
}

export const Home: React.FC<HomeProps> = ({ config, onUpdateConfig, onOpenGuide }) => {
  const [port, setPort] = useState(config.linePort || '')
  const [username, setUsername] = useState(config.lineUsername || '')
  const [password, setPassword] = useState(config.linePassword || '')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [proxyWarning, setProxyWarning] = useState<string | null>(null)
  const [tunWarning, setTunWarning] = useState<string | null>(null)
  const [coreStatus, setCoreStatus] = useState<{
    running: boolean
    binaryExists: boolean
  }>({ running: false, binaryExists: false })
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    setPort(config.linePort || '')
    setUsername(config.lineUsername || '')
    setPassword(config.linePassword || '')
  }, [config.linePort, config.lineUsername, config.linePassword])

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

  const ready = credentialsComplete({
    linePort: config.linePort,
    lineUsername: config.lineUsername,
    linePassword: config.linePassword
  })

  const handleSave = async () => {
    const nextPort = port.trim()
    const nextUser = username.trim()
    const nextPass = password.trim()
    if (!nextPort || !nextUser || !nextPass) {
      setSaveMsg('请填写端口、账号和密码后再保存。')
      return
    }
    setBusy(true)
    setSaveMsg(null)
    try {
      await onUpdateConfig({
        ...config,
        linePort: nextPort,
        lineUsername: nextUser,
        linePassword: nextPass
      })
      setSaveMsg('已保存。可打开下方模式开关。')
    } finally {
      setBusy(false)
    }
  }

  const toggleSystemProxy = async () => {
    if (!ready && !config.systemProxy) {
      setProxyWarning('请先保存端口、账号和密码。')
      return
    }
    setBusy(true)
    setProxyWarning(null)
    try {
      const next = !config.systemProxy
      await onUpdateConfig({ ...config, systemProxy: next })
      await window.api?.setSystemProxy?.(next)
    } catch (err) {
      setProxyWarning(err instanceof Error ? err.message : '切换系统代理失败')
    } finally {
      setBusy(false)
    }
  }

  const toggleTun = async () => {
    if (!ready && !config.tunEnabled) {
      setTunWarning('请先保存端口、账号和密码。')
      return
    }
    setBusy(true)
    setTunWarning(null)
    try {
      const next = !config.tunEnabled
      if (next) {
        const status = await window.api?.getServiceStatus?.()
        if (!status?.running) {
          setTunWarning('全局模式依赖系统服务。请先到「系统服务」页安装并启动，再打开此开关。')
          setBusy(false)
          return
        }
      }
      await onUpdateConfig({ ...config, tunEnabled: next })
    } catch (err) {
      setTunWarning(err instanceof Error ? err.message : '切换全局模式失败')
    } finally {
      setBusy(false)
    }
  }

  const emergencyClearProxy = async () => {
    setBusy(true)
    try {
      await onUpdateConfig({ ...config, systemProxy: false })
      await window.api?.setSystemProxy?.(false)
      setProxyWarning(null)
      setSaveMsg('系统代理已关闭。')
    } finally {
      setBusy(false)
    }
  }

  const restartCore = async () => {
    setBusy(true)
    try {
      await window.api?.restartCore?.()
      setSaveMsg('正在重启内核…')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-text">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">Path One</p>
        <h1 className="text-3xl font-semibold text-fx-text tracking-tight">首页</h1>
        <p className="text-sm text-fx-muted leading-relaxed">
          服务器 <span className="font-mono text-fx-accent">{FIXED_LINE_SERVER}</span> · 协议{' '}
          <span className="font-mono text-fx-accent">{FIXED_LINE_TYPE.toUpperCase()}</span> · 本地混合端口{' '}
          <span className="font-mono text-fx-accent">{DEFAULT_MIXED_PORT}</span>
        </p>
      </header>

      <section className="fx-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-fx-text">
          <KeyRound className="w-4 h-4 text-fx-accent" />
          <h2 className="text-base font-medium">账号</h2>
        </div>
        <p className="text-xs text-fx-muted -mt-2">对照开通通知填写端口、账号、密码，然后保存。</p>

        <div className="grid gap-4">
          <label className="block space-y-1.5">
            <span className="text-xs text-fx-muted">端口</span>
            <input
              className="w-full rounded-xl bg-fx-bg px-4 py-3 text-sm text-fx-text outline-none focus:ring-1 focus:ring-fx-accent/40 font-mono"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="开通通知中的端口"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-fx-muted">账号</span>
            <input
              className="w-full rounded-xl bg-fx-bg px-4 py-3 text-sm text-fx-text outline-none focus:ring-1 focus:ring-fx-accent/40 font-mono"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="开通通知中的账号"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-xs text-fx-muted">密码</span>
            <input
              type="password"
              className="w-full rounded-xl bg-fx-bg px-4 py-3 text-sm text-fx-text outline-none focus:ring-1 focus:ring-fx-accent/40 font-mono"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="开通通知中的密码"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            disabled={busy}
            onClick={() => void handleSave()}
            className="fx-btn-accent disabled:opacity-50"
          >
            保存账号
          </button>
          <button type="button" onClick={onOpenGuide} className="fx-btn">
            <BookOpen className="w-3.5 h-3.5" />
            使用说明
          </button>
          {saveMsg && <span className="text-xs text-fx-ok">{saveMsg}</span>}
        </div>
      </section>

      <section className="grid sm:grid-cols-2 gap-4">
        <div className="fx-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-fx-text font-medium">
                <Globe className="w-4 h-4 text-fx-accent" />
                浏览器模式
              </div>
              <p className="text-xs text-fx-muted mt-1.5 leading-relaxed">
                打开 Windows 系统代理，指向本机 {DEFAULT_MIXED_PORT} 端口。适合浏览器访问。
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              aria-pressed={config.systemProxy}
              onClick={() => void toggleSystemProxy()}
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
          {proxyWarning && (
            <p className="text-xs text-amber-200/90 flex gap-1.5 items-start">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {proxyWarning}
            </p>
          )}
        </div>

        <div className="fx-panel rounded-2xl p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-fx-text font-medium">
                <Rocket className="w-4 h-4 text-fx-accent" />
                全局模式
              </div>
              <p className="text-xs text-fx-muted mt-1.5 leading-relaxed">
                启用 TUN，让命令行、Git 等也走线路。需「系统服务」页中服务已在运行。
              </p>
            </div>
            <button
              type="button"
              disabled={busy}
              aria-pressed={config.tunEnabled}
              onClick={() => void toggleTun()}
              className={`relative w-12 h-7 rounded-full transition duration-fx shrink-0 ${
                config.tunEnabled ? 'bg-fx-accent' : 'bg-fx-surface'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition duration-fx ${
                  config.tunEnabled ? 'translate-x-5' : ''
                }`}
              />
            </button>
          </div>
          {tunWarning && (
            <p className="text-xs text-amber-200/90 flex gap-1.5 items-start">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {tunWarning}
            </p>
          )}
        </div>
      </section>

      <section className="fx-panel rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {coreStatus.running ? (
            <Wifi className="w-4 h-4 text-fx-ok" />
          ) : (
            <WifiOff className="w-4 h-4 text-fx-muted" />
          )}
          <div>
            <div className="text-sm text-fx-text">
              内核 {coreStatus.running ? '运行中' : '未运行'}
              {!coreStatus.binaryExists && (
                <span className="text-fx-danger ml-2 text-xs">缺少内核文件</span>
              )}
            </div>
            <div className="text-xs text-fx-muted mt-0.5">
              {ready ? '账号已保存' : '账号未保存完整'} · 本地端口 {DEFAULT_MIXED_PORT}
            </div>
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
            onClick={() => void emergencyClearProxy()}
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
