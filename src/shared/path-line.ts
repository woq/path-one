import type { AppConfig, ProxyNode, RouteRuleItem } from '../renderer/src/types'

/** Fixed upstream — users never edit this. */
export const FIXED_LINE_SERVER = '10.0.0.101'
export const FIXED_LINE_TYPE = 'socks5'
export const PATH_NODE_NAME = 'Path'

/** Simple private/CN direct + MATCH proxy — no node picker, no rule editor. */
export const PATH_ONE_RULES: RouteRuleItem[] = [
  {
    id: 'rule-lan-10',
    type: 'IP-CIDR',
    payload: '10.0.0.0/8',
    target: 'DIRECT',
    enabled: true,
    description: '本地 10.x 直连'
  },
  {
    id: 'rule-lan-172',
    type: 'IP-CIDR',
    payload: '172.16.0.0/12',
    target: 'DIRECT',
    enabled: true,
    description: '本地 172.16.x 直连'
  },
  {
    id: 'rule-lan-192',
    type: 'IP-CIDR',
    payload: '192.168.0.0/16',
    target: 'DIRECT',
    enabled: true,
    description: '本地 192.168.x 直连'
  },
  {
    id: 'rule-lan-127',
    type: 'IP-CIDR',
    payload: '127.0.0.0/8',
    target: 'DIRECT',
    enabled: true,
    description: '本机回环直连'
  },
  {
    id: 'rule-geo-private',
    type: 'GEOIP',
    payload: 'private',
    target: 'DIRECT',
    enabled: true,
    description: '私网直连'
  },
  {
    id: 'rule-cn-ip',
    type: 'GEOIP',
    payload: 'CN',
    target: 'DIRECT',
    enabled: true,
    description: '国内 IP 直连'
  },
  {
    id: 'rule-fallback',
    type: 'MATCH',
    payload: '',
    target: 'PROXY',
    enabled: true,
    description: '其余走线路'
  }
]

export function buildPathNode(port: string, username: string, password: string): ProxyNode {
  const portNum = Number(port)
  return {
    name: PATH_NODE_NAME,
    type: FIXED_LINE_TYPE,
    server: FIXED_LINE_SERVER,
    port: Number.isFinite(portNum) ? portNum : 0,
    raw: {
      name: PATH_NODE_NAME,
      type: FIXED_LINE_TYPE,
      server: FIXED_LINE_SERVER,
      port: Number.isFinite(portNum) ? portNum : 0,
      username,
      password,
      udp: true
    }
  }
}

export function credentialsComplete(cfg: Pick<AppConfig, 'linePort' | 'lineUsername' | 'linePassword'>): boolean {
  return Boolean(
    String(cfg.linePort ?? '').trim() &&
      String(cfg.lineUsername ?? '').trim() &&
      String(cfg.linePassword ?? '').trim()
  )
}

/** Force Path One shape: one fixed socks5 node + fixed rules. */
export function normalizePathConfig(cfg: AppConfig): AppConfig {
  const linePort = String(cfg.linePort ?? '').trim()
  const lineUsername = String(cfg.lineUsername ?? '').trim()
  const linePassword = String(cfg.linePassword ?? '').trim()
  const ready = credentialsComplete({ linePort, lineUsername, linePassword })
  const nodes = ready ? [buildPathNode(linePort, lineUsername, linePassword)] : []

  return {
    ...cfg,
    mixedPort: 7890,
    linePort,
    lineUsername,
    linePassword,
    activeNode: ready ? PATH_NODE_NAME : '',
    autoUpdateSub: false,
    autoUpdateGeo: false,
    subscriptions: [],
    manualNodes: [],
    nodes,
    rules: PATH_ONE_RULES
  }
}
