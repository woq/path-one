import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const binariesDir = path.join(rootDir, 'resources', 'binaries')

const CORE_UPSTREAM_VERSION = process.env.CORE_UPSTREAM_VERSION || 'v1.19.32'
const CORE_UPSTREAM_ZIP = `mihomo-windows-amd64-compatible-${CORE_UPSTREAM_VERSION}.zip`
const CORE_UPSTREAM_URL = `https://github.com/MetaCubeX/mihomo/releases/download/${CORE_UPSTREAM_VERSION}/${CORE_UPSTREAM_ZIP}`

const GEOIP_URL = 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geoip.dat'
const GEOSITE_URL = 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/geosite.dat'
const ANTI_AD_URL = 'https://anti-ad.net/clash.yaml'

/** Persistent download cache (zip kept across builds). Override with CORE_CACHE_DIR. */
const cacheDir =
  process.env.CORE_CACHE_DIR || path.join(binariesDir, '.cache')

async function downloadFile(url, destPath) {
  console.log(`[download] Fetching ${url} ...`)
  const response = await fetch(url, {
    headers: { 'User-Agent': 'path-one-CI-Builder' }
  })
  if (!response.ok) {
    throw new Error(`Failed to download ${url}: ${response.status} ${response.statusText}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  fs.mkdirSync(path.dirname(destPath), { recursive: true })
  fs.writeFileSync(destPath, Buffer.from(arrayBuffer))
  console.log(`[download] Saved to ${destPath} (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`)
}

function tryCopyFile(src, dest, label) {
  if (!src || !fs.existsSync(src)) return false
  fs.mkdirSync(path.dirname(dest), { recursive: true })
  fs.copyFileSync(src, dest)
  console.log(`[cache] Reused ${label}: ${src}`)
  return true
}

/** Sibling projects often already have the same upstream Windows x64 core. */
function localCoreCandidates() {
  const parent = path.resolve(rootDir, '..')
  return [
    path.join(parent, 'Frozen-XUI', 'resources', 'binaries', 'mihomo.exe'),
    path.join(parent, 'draft-one', 'resources', 'binaries', 'mihomo.exe'),
    path.join(parent, 'Frozen-XUI', 'resources', 'binaries', 'core.exe'),
    path.join(parent, 'draft-one', 'resources', 'binaries', 'core.exe')
  ]
}

function localGeoCandidates(fileName) {
  const parent = path.resolve(rootDir, '..')
  return [
    path.join(binariesDir, '.cache', fileName),
    path.join(parent, 'Frozen-XUI', 'resources', 'binaries', fileName),
    path.join(parent, 'draft-one', 'resources', 'binaries', fileName)
  ]
}

function findNamedFile(dir, fileName) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      const nested = findNamedFile(full, fileName)
      if (nested) return nested
    } else if (entry.name.toLowerCase() === fileName.toLowerCase()) {
      return full
    }
  }
  return null
}

function writeCoreHash() {
  const coreExe = path.join(binariesDir, 'core.exe')
  if (!fs.existsSync(coreExe)) return
  const hex = crypto.createHash('sha256').update(fs.readFileSync(coreExe)).digest('hex')
  fs.writeFileSync(path.join(binariesDir, 'core.sha256'), `${hex}\n`)
  console.log('[core] Wrote core.sha256')
}

function extractZip(zipPath, destDir) {
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true, force: true })
  }
  fs.mkdirSync(destDir, { recursive: true })

  if (process.platform === 'win32') {
    try {
      execSync(`tar -xf "${zipPath}" -C "${destDir}"`, { stdio: 'inherit' })
    } catch {
      execSync(
        `powershell -NoProfile -NonInteractive -Command "Expand-Archive -LiteralPath '${zipPath.replace(/'/g, "''")}' -DestinationPath '${destDir.replace(/'/g, "''")}' -Force"`,
        { stdio: 'inherit' }
      )
    }
  } else {
    try {
      execSync(`tar -xf "${zipPath}" -C "${destDir}"`, { stdio: 'inherit' })
    } catch {
      execSync(`unzip -o "${zipPath}" -d "${destDir}"`, { stdio: 'inherit' })
    }
  }
}

async function prepareCore() {
  const coreExePath = path.join(binariesDir, 'core.exe')
  const force = process.env.FORCE_DOWNLOAD === 'true'

  if (!force && fs.existsSync(coreExePath)) {
    console.log('[core] core.exe already exists, skipping download.')
    writeCoreHash()
    return
  }

  // 1) Reuse sibling project cores (same upstream build) — no network.
  if (!force) {
    for (const candidate of localCoreCandidates()) {
      if (tryCopyFile(candidate, coreExePath, 'sibling core')) {
        const siblingWintun = path.join(path.dirname(candidate), 'wintun.dll')
        if (fs.existsSync(siblingWintun) && !fs.existsSync(path.join(binariesDir, 'wintun.dll'))) {
          tryCopyFile(siblingWintun, path.join(binariesDir, 'wintun.dll'), 'sibling wintun.dll')
        }
        writeCoreHash()
        return
      }
    }
  }

  // 2) Reuse cached zip, or download once into cache.
  fs.mkdirSync(cacheDir, { recursive: true })
  const cachedZip = path.join(cacheDir, CORE_UPSTREAM_ZIP)
  if (force || !fs.existsSync(cachedZip)) {
    await downloadFile(CORE_UPSTREAM_URL, cachedZip)
  } else {
    console.log(`[cache] Using cached zip: ${cachedZip}`)
  }

  const tempExtractDir = path.join(binariesDir, 'temp-extract')
  try {
    console.log('[core] Extracting upstream archive...')
    extractZip(cachedZip, tempExtractDir)

    const files = fs.readdirSync(tempExtractDir)
    const extractedExe = files.find((f) => f.endsWith('.exe'))
    if (!extractedExe) {
      throw new Error(`No .exe found in extracted core archive: ${files.join(', ')}`)
    }

    fs.copyFileSync(path.join(tempExtractDir, extractedExe), coreExePath)
    console.log(`[core] Installed core.exe from ${extractedExe}`)

    const wintunSrc = findNamedFile(tempExtractDir, 'wintun.dll')
    if (wintunSrc) {
      fs.copyFileSync(wintunSrc, path.join(binariesDir, 'wintun.dll'))
      console.log(`[core] Copied wintun.dll from archive`)
    } else {
      console.log('[core] Archive does not contain wintun.dll')
    }
  } finally {
    if (fs.existsSync(tempExtractDir)) {
      fs.rmSync(tempExtractDir, { recursive: true, force: true })
    }
    writeCoreHash()
  }
}

async function compileWindowsService() {
  const csSource = path.join(binariesDir, 'PathOneService.cs')
  const targetExe = path.join(binariesDir, 'PathOneService.exe')

  if (!fs.existsSync(csSource)) {
    console.log('[service] PathOneService.cs not found, skipping.')
    return
  }

  const force = process.env.FORCE_DOWNLOAD === 'true'
  if (!force && fs.existsSync(targetExe)) {
    try {
      const csMtime = fs.statSync(csSource).mtimeMs
      const exeMtime = fs.statSync(targetExe).mtimeMs
      if (exeMtime >= csMtime) {
        console.log('[service] PathOneService.exe is up-to-date, skipping compilation.')
        return
      }
    } catch {}
  }

  if (process.platform === 'win32') {
    const cscPath = 'C:\\Windows\\Microsoft.NET\\Framework64\\v4.0.30319\\csc.exe'
    if (fs.existsSync(cscPath)) {
      console.log('[service] Compiling PathOneService.cs via csc.exe...')
      try {
        execSync(`"${cscPath}" /target:exe /out:"${targetExe}" /r:System.ServiceProcess.dll "${csSource}"`, {
          stdio: 'inherit'
        })
        console.log(`[service] PathOneService.exe compiled successfully.`)
      } catch (e) {
        console.warn(`[service] Compilation failed (non-fatal):`, e.message)
      }
    } else {
      console.warn(`[service] csc.exe not found at ${cscPath}, skipping compilation.`)
    }
  } else {
    console.log('[service] Non-Windows host, skipping csc.exe compilation (will compile on Windows CI).')
  }
}

const MMDB_URL = 'https://testingcf.jsdelivr.net/gh/MetaCubeX/meta-rules-dat@release/country.mmdb'

async function prepareGeoData() {
  const geoipPath = path.join(binariesDir, 'geoip.dat')
  const geositePath = path.join(binariesDir, 'geosite.dat')
  const mmdbPath = path.join(binariesDir, 'country.mmdb')
  const antiAdPath = path.join(binariesDir, 'anti-ad.yaml')

  const force = process.env.FORCE_DOWNLOAD === 'true'
  const geoReady =
    fs.existsSync(geoipPath) && fs.existsSync(geositePath) && fs.existsSync(mmdbPath)
  const antiAdReady = fs.existsSync(antiAdPath)
  if (!force && geoReady && antiAdReady) {
    console.log('[geodata] geoip.dat, geosite.dat, country.mmdb, and anti-ad.yaml already exist, skipping.')
    return
  }

  async function ensureFile(dest, url, fileName) {
    if (!force && fs.existsSync(dest)) return
    if (!force) {
      for (const candidate of localGeoCandidates(fileName)) {
        if (tryCopyFile(candidate, dest, fileName)) return
      }
    }
    const cached = path.join(cacheDir, fileName)
    if (!force && fs.existsSync(cached)) {
      tryCopyFile(cached, dest, `cached ${fileName}`)
      return
    }
    await downloadFile(url, cached)
    tryCopyFile(cached, dest, `downloaded ${fileName}`)
  }

  try {
    await ensureFile(geoipPath, GEOIP_URL, 'geoip.dat')
    await ensureFile(geositePath, GEOSITE_URL, 'geosite.dat')
    await ensureFile(mmdbPath, MMDB_URL, 'country.mmdb')
    console.log('[geodata] GeoIP, GeoSite, and MMDB databases ready.')
  } catch (err) {
    console.warn('[geodata] Failed to download geo data, skipping (client will download at runtime):', err.message)
  }

  try {
    if (force || !fs.existsSync(antiAdPath)) {
      let filled = false
      if (!force) {
        for (const candidate of localGeoCandidates('anti-ad.yaml')) {
          if (tryCopyFile(candidate, antiAdPath, 'anti-ad.yaml')) {
            filled = true
            break
          }
        }
      }
      if (!filled) {
        const cached = path.join(cacheDir, 'anti-ad.yaml')
        if (!force && fs.existsSync(cached)) {
          tryCopyFile(cached, antiAdPath, 'cached anti-ad.yaml')
        } else {
          await downloadFile(ANTI_AD_URL, cached)
          tryCopyFile(cached, antiAdPath, 'downloaded anti-ad.yaml')
        }
      }
    }
    const size = fs.statSync(antiAdPath).size
    if (size < 100000) {
      throw new Error(`anti-ad.yaml is too small (${size} bytes)`)
    }
    console.log('[geodata] Bundled anti-ad.yaml ready.')
  } catch (err) {
    if (force) {
      throw err
    }
    console.warn('[geodata] Failed to download anti-ad.yaml, skipping (client will download at runtime):', err.message)
  }
}

async function main() {
  console.log('=== Preparing Binaries for path-one ===')
  if (!fs.existsSync(binariesDir)) {
    fs.mkdirSync(binariesDir, { recursive: true })
  }

  await prepareCore()
  await compileWindowsService()
  await prepareGeoData()

  console.log('=== Binaries preparation complete ===')
}

main().catch((err) => {
  console.error('[error] Preparation failed:', err)
  process.exit(1)
})
