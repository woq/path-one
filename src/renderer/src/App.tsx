import React, { useEffect, useState } from 'react'
import { TitleBar } from './components/TitleBar'
import { Account } from './pages/Account'
import { BrowserMode } from './pages/BrowserMode'
import { GlobalMode } from './pages/GlobalMode'
import { GuideStart } from './pages/guide/GuideStart'
import { GuideVerify } from './pages/guide/GuideVerify'
import { GuideFaq } from './pages/guide/GuideFaq'
import { Routing } from './pages/Routing'
import { Logs } from './pages/Logs'
import { SystemService } from './pages/SystemService'
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  CircleHelp,
  Globe,
  KeyRound,
  RefreshCw,
  Rocket,
  Route,
  Terminal,
  Wrench,
  X
} from 'lucide-react'
import type { AppConfig } from './types'
import { DEFAULT_MIXED_PORT, PATH_ONE_RULES } from '../../shared/path-line'

const INITIAL_CONFIG: AppConfig = {
  mixedPort: DEFAULT_MIXED_PORT,
  tunEnabled: false,
  systemProxy: false,
  autoStart: false,
  silentStart: true,
  activeNode: '',
  autoUpdateSub: false,
  autoUpdateGeo: false,
  linePort: '',
  lineUsername: '',
  linePassword: '',
  subscriptions: [],
  nodes: [],
  rules: PATH_ONE_RULES
}

type TabId =
  | 'account'
  | 'browser'
  | 'global'
  | 'routing'
  | 'service'
  | 'logs'
  | 'guide-start'
  | 'guide-verify'
  | 'guide-faq'

type NavItem = { id: TabId; label: string; icon: React.ReactNode }
type NavGroup = { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    title: '操作',
    items: [
      { id: 'account', label: '账号', icon: <KeyRound className="w-4 h-4" /> },
      { id: 'browser', label: '浏览器模式', icon: <Globe className="w-4 h-4" /> },
      { id: 'global', label: '全局模式', icon: <Rocket className="w-4 h-4" /> },
      { id: 'routing', label: '路由分流', icon: <Route className="w-4 h-4" /> },
      { id: 'service', label: '系统服务', icon: <Wrench className="w-4 h-4" /> },
      { id: 'logs', label: '内核日志', icon: <Terminal className="w-4 h-4" /> }
    ]
  },
  {
    title: '说明',
    items: [
      { id: 'guide-start', label: '快速开始', icon: <BookOpen className="w-4 h-4" /> },
      { id: 'guide-verify', label: '确认已通', icon: <CheckCircle2 className="w-4 h-4" /> },
      { id: 'guide-faq', label: '常见问题', icon: <CircleHelp className="w-4 h-4" /> }
    ]
  }
]

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabId>('account')
  const [config, setConfig] = useState<AppConfig>(INITIAL_CONFIG)
  const [abnormalAlert, setAbnormalAlert] = useState<{
    reason: string
    systemProxyActive: boolean
    message: string
    timestamp: number
  } | null>(null)
  const [isRestartingCore, setIsRestartingCore] = useState(false)

  useEffect(() => {
    window.api?.getConfig().then((cfg: AppConfig) => {
      if (cfg) setConfig(cfg)
    })

    const unsubAlert = window.api?.onAbnormalAlert?.((data) => {
      if (data) setAbnormalAlert(data)
    })
    const unsubRecovered = window.api?.onCoreRecovered?.(() => {
      setAbnormalAlert(null)
    })
    const unsubCfg = window.api?.onConfigUpdated?.((newCfg) => {
      if (newCfg) setConfig(newCfg as AppConfig)
    })

    return () => {
      if (typeof unsubAlert === 'function') unsubAlert()
      if (typeof unsubRecovered === 'function') unsubRecovered()
      if (typeof unsubCfg === 'function') unsubCfg()
    }
  }, [])

  const handleUpdateConfig = async (newConfig: AppConfig, options?: { persist?: 'memory' }) => {
    setConfig(newConfig)
    if (options?.persist === 'memory') return
    await window.api?.saveConfig(newConfig)
  }

  const handleManualDisableProxy = async () => {
    const updated = { ...config, systemProxy: false }
    setConfig(updated)
    await window.api?.setSystemProxy(false)
    setAbnormalAlert((prev) => (prev ? { ...prev, systemProxyActive: false } : null))
  }

  const handleManualRestartCore = async () => {
    setIsRestartingCore(true)
    await window.api?.restartCore()
    setTimeout(() => {
      setIsRestartingCore(false)
      setAbnormalAlert(null)
    }, 1200)
  }

  return (
    <div className="fx-app-shell flex flex-col h-screen w-screen font-sans select-none overflow-hidden rounded-xl shadow-soft">
      <TitleBar title="Path One" />

      {abnormalAlert && (
        <div className="bg-amber-950/50 px-5 py-2.5 flex items-center justify-between text-amber-100 select-none transition duration-fx z-20">
          <div className="flex items-center gap-3 min-w-0 pr-4">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
            <div className="text-xs text-amber-200/90 font-medium">
              {abnormalAlert.systemProxyActive ? (
                <span>
                  <strong className="font-semibold text-amber-100">内核异常或未运行</strong>
                  <span className="text-amber-200/80 ml-1.5">
                    — 系统代理可能仍开着。网页打不开时，请先关代理或重启内核。
                  </span>
                </span>
              ) : (
                <span>
                  <strong className="font-semibold text-amber-100">内核状态提示</strong>
                  <span className="text-amber-200/80 ml-1.5">{abnormalAlert.message}</span>
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {abnormalAlert.reason.includes('端口冲突') && (
              <button
                type="button"
                onClick={() => {
                  void window.api.resolvePortConflict()
                }}
                className="px-3 py-1 bg-fx-danger/25 hover:bg-fx-danger/40 text-rose-100 rounded-xl text-xs font-medium transition duration-fx"
              >
                处理端口占用
              </button>
            )}
            {abnormalAlert.systemProxyActive && (
              <button
                type="button"
                onClick={handleManualDisableProxy}
                className="px-3 py-1 bg-amber-500/25 hover:bg-amber-500/40 text-amber-100 rounded-xl text-xs font-medium transition duration-fx"
              >
                关闭系统代理
              </button>
            )}
            <button
              type="button"
              onClick={handleManualRestartCore}
              disabled={isRestartingCore}
              className="fx-btn-accent disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isRestartingCore ? 'animate-spin' : ''}`} />
              <span>重启内核</span>
            </button>
            <button type="button" onClick={() => setActiveTab('logs')} className="fx-btn">
              查看日志
            </button>
            <button
              type="button"
              onClick={() => setAbnormalAlert(null)}
              className="p-1 hover:bg-amber-500/20 text-amber-400 hover:text-amber-200 rounded-md transition duration-fx ml-1"
              aria-label="关闭提示"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-52 bg-fx-elevated flex flex-col p-3 select-none shadow-soft min-h-0">
          <nav className="flex-1 overflow-y-auto space-y-4 pr-0.5">
            {NAV_GROUPS.map((group) => (
              <div key={group.title} className="space-y-0.5">
                <div className="px-3 pb-1 text-[10px] font-medium tracking-[0.18em] uppercase text-fx-muted/55">
                  {group.title}
                </div>
                {group.items.map((item) => {
                  const active = activeTab === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setActiveTab(item.id)}
                      className={`fx-nav ${active ? 'fx-nav-active' : ''}`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </button>
                  )
                })}
              </div>
            ))}
          </nav>

          <div className="mt-3 px-3 py-2.5 rounded-xl bg-fx-bg/80 text-center shrink-0">
            <div className="text-[11px] font-medium text-fx-muted/80">Path One</div>
            <div className="text-[10px] text-fx-muted/50 mt-0.5">本地端口 {DEFAULT_MIXED_PORT}</div>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto p-7 bg-transparent">
          {activeTab === 'account' && (
            <Account config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {activeTab === 'browser' && (
            <BrowserMode config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {activeTab === 'global' && (
            <GlobalMode
              config={config}
              onUpdateConfig={handleUpdateConfig}
              onOpenService={() => setActiveTab('service')}
            />
          )}
          {activeTab === 'routing' && (
            <Routing config={config} onUpdateConfig={handleUpdateConfig} />
          )}
          {activeTab === 'service' && <SystemService />}
          {activeTab === 'logs' && <Logs />}
          {activeTab === 'guide-start' && <GuideStart />}
          {activeTab === 'guide-verify' && <GuideVerify />}
          {activeTab === 'guide-faq' && <GuideFaq />}
        </main>
      </div>
    </div>
  )
}

export default App
