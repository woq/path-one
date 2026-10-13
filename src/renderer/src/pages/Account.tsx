import React, { useState } from 'react'
import { Globe2, KeyRound, Loader2, MapPin } from 'lucide-react'
import type { AppConfig } from '../types'
import { credentialsComplete } from '../../../shared/path-line'

interface AccountProps {
  config: AppConfig
  onUpdateConfig: (cfg: AppConfig) => void | Promise<void>
}

type ProbeView = {
  ok: boolean
  label: string
  detail: string
  ms: number
} | null

export const Account: React.FC<AccountProps> = ({ config, onUpdateConfig }) => {
  const [port, setPort] = useState(config.linePort || '')
  const [username, setUsername] = useState(config.lineUsername || '')
  const [password, setPassword] = useState(config.linePassword || '')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [probeBusy, setProbeBusy] = useState<'domestic' | 'overseas' | null>(null)
  const [domestic, setDomestic] = useState<ProbeView>(null)
  const [overseas, setOverseas] = useState<ProbeView>(null)

  React.useEffect(() => {
    setPort(config.linePort || '')
    setUsername(config.lineUsername || '')
    setPassword(config.linePassword || '')
  }, [config.linePort, config.lineUsername, config.linePassword])

  const saved = credentialsComplete(config)

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
      setSaveMsg('已保存。可到「浏览器模式」或「全局模式」打开线路。')
    } finally {
      setBusy(false)
    }
  }

  const runProbe = async (kind: 'domestic' | 'overseas') => {
    setProbeBusy(kind)
    try {
      const res = await window.api.probeLine(kind)
      const view: ProbeView = {
        ok: res.ok,
        label: res.label,
        detail: res.detail,
        ms: res.ms
      }
      if (kind === 'domestic') setDomestic(view)
      else setOverseas(view)
    } catch (err) {
      const view: ProbeView = {
        ok: false,
        label: kind === 'domestic' ? '国内' : '国外',
        detail: err instanceof Error ? err.message : String(err),
        ms: -1
      }
      if (kind === 'domestic') setDomestic(view)
      else setOverseas(view)
    } finally {
      setProbeBusy(null)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 select-text">
      <header className="space-y-2">
        <p className="text-xs tracking-[0.2em] uppercase text-fx-muted/70">Path One</p>
        <h1 className="text-3xl font-semibold text-fx-text tracking-tight">账号</h1>
        <p className="text-sm text-fx-muted leading-relaxed">
          对照开通通知填写端口、账号、密码并保存。可用下方按钮分别测试国内与国外连通。
        </p>
      </header>

      <section className="fx-panel rounded-2xl p-6 space-y-5">
        <div className="flex items-center gap-2 text-fx-text">
          <KeyRound className="w-4 h-4 text-fx-accent" />
          <h2 className="text-base font-medium">填写与保存</h2>
        </div>
        <p className="text-xs text-fx-muted -mt-2">
          当前状态：{saved ? '已保存完整账号' : '尚未保存完整账号'}
        </p>

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
          {saveMsg && <span className="text-xs text-fx-ok">{saveMsg}</span>}
        </div>
      </section>

      <section className="fx-panel rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-medium text-fx-text">连通测试</h2>
        <p className="text-xs text-fx-muted">
          国内：本机直连探测。国外：经本机线路探测（需已保存账号且内核在运行；建议先打开浏览器模式或全局模式）。
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="rounded-xl bg-fx-bg/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-fx-text">
              <MapPin className="w-4 h-4 text-fx-accent" />
              国内
            </div>
            <button
              type="button"
              disabled={probeBusy !== null}
              onClick={() => void runProbe('domestic')}
              className="fx-btn w-full justify-center disabled:opacity-50"
            >
              {probeBusy === 'domestic' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  测试中…
                </>
              ) : (
                '测试国内'
              )}
            </button>
            {domestic && (
              <p className={`text-xs leading-relaxed ${domestic.ok ? 'text-fx-ok' : 'text-rose-300'}`}>
                {domestic.detail}
              </p>
            )}
          </div>

          <div className="rounded-xl bg-fx-bg/70 p-4 space-y-3">
            <div className="flex items-center gap-2 text-sm text-fx-text">
              <Globe2 className="w-4 h-4 text-fx-accent" />
              国外
            </div>
            <button
              type="button"
              disabled={probeBusy !== null}
              onClick={() => void runProbe('overseas')}
              className="fx-btn w-full justify-center disabled:opacity-50"
            >
              {probeBusy === 'overseas' ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  测试中…
                </>
              ) : (
                '测试国外'
              )}
            </button>
            {overseas && (
              <p className={`text-xs leading-relaxed ${overseas.ok ? 'text-fx-ok' : 'text-rose-300'}`}>
                {overseas.detail}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
