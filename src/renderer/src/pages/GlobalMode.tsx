import React, { useEffect, useState } from 'react'
import { AlertTriangle, Rocket, Wrench } from 'lucide-react'
import type { AppConfig } from '../types'
import { credentialsComplete } from '../../../shared/path-line'

interface Props {
  config: AppConfig
  onUpdateConfig: (cfg: AppConfig) => void | Promise<void>
  onOpenService: () => void
}

export const GlobalMode: React.FC<Props> = ({ config, onUpdateConfig, onOpenService }) => {
  const [busy, setBusy] = useState(false)
  const [warning, setWarning] = useState<string | null>(null)
  const [msg, setMsg] = useState<string | null>(null)
  const [serviceRunning, setServiceRunning] = useState(false)

  const ready = credentialsComplete(config)

  useEffect(() => {
    let alive = true
    const tick = async () => {
      const st = await window.api?.getServiceStatus?.()
      if (alive) setServiceRunning(!!st?.running)
    }
    void tick()
    const id = window.setInterval(() => void tick(), 3000)
    return () => {
      alive = false
      window.clearInterval(id)
    }
  }, [])

  const toggle = async () => {
    if (!ready && !config.tunEnabled) {
      setWarning('请先到「账号」页保存端口、账号和密码。')
      return
    }
    setBusy(true)
    setWarning(null)
    setMsg(null)
    try {
      const next = !config.tunEnabled
      if (next) {
        const status = await window.api?.getServiceStatus?.()
        if (!status?.running) {
          setWarning('全局模式依赖系统服务正在运行。请先到「系统服务」页安装并启动。')
          setBusy(false)
          return
        }
      }
      await onUpdateConfig({ ...config, tunEnabled: next })
      setMsg(next ? '全局模式已打开（TUN）。' : '全局模式已关闭。')
      setServiceRunning(!!(await window.api?.getServiceStatus?.())?.running)
    } catch (err) {
      setWarning(err instanceof Error ? err.message : '切换失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-text">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">Path One</p>
        <h1 className="text-3xl font-semibold text-fx-text tracking-tight">全局模式</h1>
        <p className="text-sm text-fx-muted leading-relaxed">
          启用虚拟网卡（TUN）接管流量，适合 Git、命令行、Docker、SSH，以及找不到代理设置的软件。
        </p>
      </header>

      <section className="fx-panel rounded-2xl p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-fx-text font-medium">
              <Rocket className="w-4 h-4 text-fx-accent" />
              开关
            </div>
            <p className="text-xs text-fx-muted leading-relaxed">
              当前：{config.tunEnabled ? '已打开' : '已关闭'}
              {' · '}
              系统服务：{serviceRunning ? '运行中' : '未运行'}
            </p>
          </div>
          <button
            type="button"
            disabled={busy}
            aria-pressed={config.tunEnabled}
            onClick={() => void toggle()}
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
        {warning && (
          <p className="text-xs text-amber-200/90 flex gap-1.5 items-start">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            {warning}
          </p>
        )}
        {msg && <p className="text-xs text-fx-ok">{msg}</p>}
        <button type="button" onClick={onOpenService} className="fx-btn">
          <Wrench className="w-3.5 h-3.5" />
          打开系统服务页
        </button>
      </section>

      <section className="fx-panel rounded-2xl p-6 space-y-3">
        <h2 className="text-sm font-medium text-fx-text">本页说明</h2>
        <ul className="text-xs text-fx-muted space-y-2 list-disc pl-5 leading-relaxed">
          <li>打开前请先在「账号」页保存端口、账号、密码。</li>
          <li>必须先在「系统服务」安装并启动服务；首次会弹出管理员确认，请点「是」。</li>
          <li>服务未运行时无法真正启用全局模式。</li>
          <li>打开后，更多程序（含命令行）会走线路；直连规则仍然生效。</li>
          <li>若只需要浏览网页，优先使用「浏览器模式」，步骤更少。</li>
          <li>用完后关闭本开关；如需卸载服务，到「系统服务」页操作。</li>
        </ul>
      </section>
    </div>
  )
}
