import axios from 'axios'
import { DEFAULT_MIXED_PORT } from '../shared/path-line'

export type ProbeKind = 'domestic' | 'overseas'

export interface ProbeResult {
  ok: boolean
  kind: ProbeKind
  label: string
  ms: number
  detail: string
}

const DOMESTIC_URL = 'https://www.baidu.com/favicon.ico'
const OVERSEAS_URL = 'https://www.gstatic.com/generate_204'

async function timedGet(
  url: string,
  opts: { proxy: false | { host: string; port: number; protocol: string }; timeout: number }
): Promise<{ ms: number; status: number }> {
  const started = Date.now()
  const res = await axios.get(url, {
    proxy: opts.proxy,
    timeout: opts.timeout,
    maxRedirects: 5,
    validateStatus: () => true,
    headers: { 'User-Agent': 'path-one-probe' },
    responseType: 'arraybuffer'
  })
  return { ms: Date.now() - started, status: res.status }
}

/** 国内：直连探测；国外：经本机混合端口探测。 */
export async function probeLine(
  kind: ProbeKind,
  mixedPort = DEFAULT_MIXED_PORT
): Promise<ProbeResult> {
  const label = kind === 'domestic' ? '国内' : '国外'
  try {
    if (kind === 'domestic') {
      const { ms, status } = await timedGet(DOMESTIC_URL, { proxy: false, timeout: 8000 })
      const ok = status >= 200 && status < 400
      return {
        ok,
        kind,
        label,
        ms,
        detail: ok ? `直连成功 · HTTP ${status} · ${ms} ms` : `直连异常 · HTTP ${status} · ${ms} ms`
      }
    }

    const { ms, status } = await timedGet(OVERSEAS_URL, {
      proxy: { host: '127.0.0.1', port: mixedPort, protocol: 'http' },
      timeout: 12000
    })
    const ok = status >= 200 && status < 400
    return {
      ok,
      kind,
      label,
      ms,
      detail: ok
        ? `经线路成功 · HTTP ${status} · ${ms} ms`
        : `经线路异常 · HTTP ${status} · ${ms} ms（请确认已保存账号且内核在运行）`
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      kind,
      label,
      ms: -1,
      detail: kind === 'domestic' ? `直连失败 · ${msg}` : `经线路失败 · ${msg}`
    }
  }
}
