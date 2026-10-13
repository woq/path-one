import React, { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Lock, Plus, Route, Trash2 } from 'lucide-react'
import type { AppConfig, RouteRuleItem, RuleType } from '../types'
import {
  isLockedDirectRule,
  isLockedMatchRule,
  mergePathRules,
  PATH_ONE_DIRECT_RULES,
  PATH_ONE_MATCH_RULE
} from '../../../shared/path-line'

interface RoutingProps {
  config: AppConfig
  onUpdateConfig: (cfg: AppConfig) => void | Promise<void>
}

const CUSTOM_RULE_TYPES: { label: string; value: RuleType }[] = [
  { label: '域名后缀', value: 'DOMAIN-SUFFIX' },
  { label: '域名关键词', value: 'DOMAIN-KEYWORD' },
  { label: 'IP 网段', value: 'IP-CIDR' },
  { label: '进程名', value: 'PROCESS-NAME' },
  { label: 'GeoSite', value: 'GEOSITE' },
  { label: 'GeoIP', value: 'GEOIP' }
]

const TARGETS = [
  { label: '线路 (PROXY)', value: 'PROXY' },
  { label: '直连 (DIRECT)', value: 'DIRECT' },
  { label: '拦截 (REJECT)', value: 'REJECT' }
]

function splitRules(rules: RouteRuleItem[]) {
  const merged = mergePathRules(rules)
  return {
    direct: merged.filter(isLockedDirectRule),
    custom: merged.filter((r) => !isLockedDirectRule(r) && !isLockedMatchRule(r)),
    match: merged.find(isLockedMatchRule) || PATH_ONE_MATCH_RULE
  }
}

const SortableCustomRow: React.FC<{
  rule: RouteRuleItem
  index: number
  onUpdate: (rule: RouteRuleItem) => void
  onDelete: (id: string) => void
}> = ({ rule, index, onUpdate, onDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: rule.id
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1
  }

  return (
    <tr ref={setNodeRef} style={style} className="fx-row">
      <td className="px-2 py-2 w-8">
        <button
          type="button"
          className="cursor-grab text-fx-muted hover:text-fx-text p-1"
          aria-label="拖动排序"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
      </td>
      <td className="px-2 py-2 text-xs font-mono text-fx-muted w-10">#{index + 1}</td>
      <td className="px-2 py-2">
        <select
          value={rule.type}
          onChange={(e) => onUpdate({ ...rule, type: e.target.value as RuleType })}
          className="w-full bg-fx-bg rounded-lg px-2 py-1.5 text-xs text-fx-text outline-none focus:ring-1 focus:ring-fx-accent/40"
        >
          {CUSTOM_RULE_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <input
          value={rule.payload}
          onChange={(e) => onUpdate({ ...rule, payload: e.target.value })}
          placeholder="例如 google.com 或 1.2.3.0/24"
          className="w-full bg-fx-bg rounded-lg px-2 py-1.5 text-xs text-fx-text font-mono outline-none focus:ring-1 focus:ring-fx-accent/40"
          spellCheck={false}
        />
      </td>
      <td className="px-2 py-2">
        <select
          value={rule.target}
          onChange={(e) => onUpdate({ ...rule, target: e.target.value })}
          className="w-full bg-fx-bg rounded-lg px-2 py-1.5 text-xs text-fx-text outline-none focus:ring-1 focus:ring-fx-accent/40"
        >
          {TARGETS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-2 py-2">
        <button
          type="button"
          aria-pressed={rule.enabled}
          onClick={() => onUpdate({ ...rule, enabled: !rule.enabled })}
          className={`px-2 py-1 rounded-lg text-[11px] ${
            rule.enabled ? 'bg-fx-accent/20 text-fx-accent' : 'bg-fx-surface text-fx-muted'
          }`}
        >
          {rule.enabled ? '启用' : '关闭'}
        </button>
      </td>
      <td className="px-2 py-2">
        <button
          type="button"
          aria-label="删除规则"
          onClick={() => onDelete(rule.id)}
          className="p-1.5 rounded-lg text-fx-muted hover:text-fx-danger hover:bg-fx-danger/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  )
}

export const Routing: React.FC<RoutingProps> = ({ config, onUpdateConfig }) => {
  const [{ direct, custom, match }, setParts] = useState(() => splitRules(config.rules))
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setParts(splitRules(config.rules))
  }, [config.rules])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const persist = (nextCustom: RouteRuleItem[]) => {
    const rules = [...PATH_ONE_DIRECT_RULES, ...nextCustom, PATH_ONE_MATCH_RULE]
    setParts({ direct: PATH_ONE_DIRECT_RULES, custom: nextCustom, match: PATH_ONE_MATCH_RULE })
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      void onUpdateConfig({ ...config, rules })
    }, 400)
  }

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = custom.findIndex((r) => r.id === active.id)
    const newIndex = custom.findIndex((r) => r.id === over.id)
    if (oldIndex < 0 || newIndex < 0) return
    persist(arrayMove(custom, oldIndex, newIndex))
  }

  const addRule = () => {
    const rule: RouteRuleItem = {
      id: `rule-custom-${Date.now()}`,
      type: 'DOMAIN-SUFFIX',
      payload: '',
      target: 'PROXY',
      enabled: true,
      description: '自定义规则'
    }
    persist([rule, ...custom])
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6 select-text">
      <header className="space-y-2">
        <div className="flex items-center gap-2 text-fx-text">
          <Route className="w-5 h-5 text-fx-accent" />
          <h1 className="text-2xl font-semibold tracking-tight">路由分流</h1>
        </div>
        <p className="text-sm text-fx-muted leading-relaxed">
          规则自上而下匹配，先命中先生效。直连区与兜底规则由程序固定；中间可添加自定义规则。
        </p>
      </header>

      <section className="fx-panel rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-fx-muted" />
          <h2 className="text-sm font-medium text-fx-text">直连规则（固定）</h2>
        </div>
        <p className="text-xs text-fx-muted">本地网段与国内 IP 始终直连，此处仅展示，不可改动。</p>
        <div className="overflow-x-auto rounded-xl bg-fx-bg/60">
          <table className="w-full text-left text-xs">
            <thead className="text-fx-muted">
              <tr>
                <th className="px-3 py-2 font-medium">类型</th>
                <th className="px-3 py-2 font-medium">内容</th>
                <th className="px-3 py-2 font-medium">目标</th>
                <th className="px-3 py-2 font-medium">说明</th>
              </tr>
            </thead>
            <tbody>
              {direct.map((rule) => (
                <tr key={rule.id} className="border-t border-fx-border/40 text-fx-muted">
                  <td className="px-3 py-2 font-mono">{rule.type}</td>
                  <td className="px-3 py-2 font-mono text-fx-text/80">{rule.payload}</td>
                  <td className="px-3 py-2">DIRECT</td>
                  <td className="px-3 py-2">{rule.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="fx-panel rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-medium text-fx-text">自定义规则</h2>
            <p className="text-xs text-fx-muted mt-1">插在直连与兜底之间。可拖动排序、启用或删除。</p>
          </div>
          <button type="button" onClick={addRule} className="fx-btn-accent">
            <Plus className="w-3.5 h-3.5" />
            添加规则
          </button>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <div className="overflow-x-auto rounded-xl bg-fx-bg/60">
            <table className="w-full text-left text-xs">
              <thead className="text-fx-muted">
                <tr>
                  <th className="px-2 py-2 w-8" />
                  <th className="px-2 py-2">#</th>
                  <th className="px-2 py-2">类型</th>
                  <th className="px-2 py-2">内容</th>
                  <th className="px-2 py-2">目标</th>
                  <th className="px-2 py-2">状态</th>
                  <th className="px-2 py-2 w-10" />
                </tr>
              </thead>
              <SortableContext items={custom.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {custom.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-3 py-6 text-center text-fx-muted">
                        尚未添加自定义规则。点右上角「添加规则」开始。
                      </td>
                    </tr>
                  ) : (
                    custom.map((rule, index) => (
                      <SortableCustomRow
                        key={rule.id}
                        rule={rule}
                        index={index}
                        onUpdate={(updated) => {
                          persist(custom.map((r) => (r.id === updated.id ? updated : r)))
                        }}
                        onDelete={(id) => persist(custom.filter((r) => r.id !== id))}
                      />
                    ))
                  )}
                </tbody>
              </SortableContext>
            </table>
          </div>
        </DndContext>
      </section>

      <section className="fx-panel rounded-2xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-fx-muted" />
          <h2 className="text-sm font-medium text-fx-text">兜底规则（固定）</h2>
        </div>
        <div className="rounded-xl bg-fx-bg/60 px-4 py-3 text-xs text-fx-muted flex flex-wrap gap-4">
          <span>
            类型 <span className="font-mono text-fx-text">{match.type}</span>
          </span>
          <span>
            目标 <span className="font-mono text-fx-accent">{match.target}</span>
          </span>
          <span>{match.description}</span>
        </div>
      </section>
    </div>
  )
}
