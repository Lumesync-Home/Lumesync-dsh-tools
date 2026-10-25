/**
 * Host half of lumesync-appearance. The browser half ships via
 * exports["./client"] and is discovered through the package.json dsh.client
 * declaration. This half registers the `lume-appearance` settings namespace
 * with the harness settings provider so the client scope is writable and the
 * values persist server-side (cross-device), mirroring the skin-center
 * pattern (installSection fallback `register`).
 *
 * v2 (2026-09-28) adds:
 *  - bubble background / bubble ink (independent of the 4 base colors);
 *  - background colour / gradient / uploaded image dataURL / surface alpha /
 *    backdrop blur.
 *
 * v3 (2026-09-28) adds:
 *  - bubbleMaterial / sendMaterial: "solid" (default, unchanged) |
 *    "translucent" (semi-transparent, no blur) | "glass" (translucent +
 *    backdrop blur, light strength, no animation). User bubble + send button
 *    only; assistant bubble / tooltip / goal bubble are untouched.
 *
 * v4 (2026-09-28) adds:
 *  - glassAlpha (0..100, default 55): alpha of the glass fill, shared by the
 *    user bubble and send button;
 *  - the glass edge drops the uniform 1px border in favour of a layered
 *    mirror edge (bright top rim -> faint bottom rim + hairline inner ring +
 *    soft cast shadow), tuned separately for light and dark surfaces.
 *
 * v5 (2026-09-29) strengthens the glass "thickness". No new config keys: the
 * existing glassAlpha slider is now mapped per scheme in the client half
 * (light lifted, dark eased), the top rim is a brighter lit edge, the inner
 * glow turns cool in dark, and the cast shadow splits into a near + far pair.
 *
 * v6-dev (2026-09-30, work order 18) adds the SERVER-SIDE CONFIG FILE layer:
 *  - reads/writes `<plugin>/lume-appearance.config.json` (atomic write, a bad
 *    or missing file is silently ignored -> the client keeps its built-in
 *    defaults);
 *  - exposes a plugin-private route `GET|POST /api/lume-appearance/config`
 *    for the browser half. The handler never throws: on any read/write
 *    failure it answers a well-formed JSON error and stays silent.
 * The shared production plugin directory is never touched by this work; the
 * code lives only in `lumesync-appearance-dev`.
 */

import z from 'schemastery'
import { existsSync, mkdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const NS = 'lume-appearance'

/** Absolute path of the server-side config file (beside package.json). */
const CONFIG_PATH = join(dirname(fileURLToPath(import.meta.url)), '..', 'lume-appearance.config.json')
/** Plugin-private route the browser half reads (GET) and writes (POST). */
const CONFIG_ROUTE = '/api/lume-appearance/config'
/** Upper bound for one POSTed config body (the seed with a wallpaper ~130 KB). */
const CONFIG_BODY_MAX_BYTES = 4 * 1024 * 1024

const Schema = z.object({
  accentLight: z.string().default('#7ba14f'),
  bgLight: z.string().default('#f4f4f2'),
  fgLight: z.string().default('#2b3440'),
  contrastLight: z.number().default(100),
  accentDark: z.string().default('#b9e28a'),
  bgDark: z.string().default('#0d1117'),
  fgDark: z.string().default('#dbe3ea'),
  contrastDark: z.number().default(100),
  cjkFont: z.string().default(''),
  latinFont: z.string().default(''),
  codeFont: z.string().default(''),
  // A. user bubble (empty string = "auto", derived from base palette)
  bubbleLight: z.string().default(''),
  bubbleInkLight: z.string().default(''),
  bubbleDark: z.string().default(''),
  bubbleInkDark: z.string().default(''),
  // E. material (v3): user bubble + send button. solid | translucent | glass
  bubbleMaterial: z.string().default('solid'),
  sendMaterial: z.string().default('solid'),
  // E. glass fill alpha (v4): 0..100, shared by user bubble + send button
  glassAlpha: z.number().default(55),
  // C. background
  bgKind: z.string().default('color'), // color | gradient | image
  bgGradFrom: z.string().default('#1f2937'),
  bgGradTo: z.string().default('#4b5563'),
  bgGradAngle: z.number().default(135),
  bgImageLight: z.string().default(''),
  bgImageDark: z.string().default(''),
  bgSurfaceAlpha: z.number().default(78),
  bgBlur: z.number().default(0),
})

/** Read + parse the config file; any failure (missing, unreadable, bad JSON,
 *  non-object) yields null so the caller keeps the built-in defaults. */
function readConfigFile() {
  try {
    if (!existsSync(CONFIG_PATH)) return null
    const parsed = JSON.parse(readFileSync(CONFIG_PATH, 'utf8'))
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null
  } catch (_error) {
    return null
  }
}

/** Atomically replace the config file (temp file + rename, with a Windows
 *  locked-target fallback). Returns whether the file was written; never throws. */
function writeConfigFile(config) {
  try {
    const dir = dirname(CONFIG_PATH)
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    const json = JSON.stringify(config, null, 2)
    const tmp = join(dir, `.lume-appearance.config.${process.pid}.${Date.now()}.tmp`)
    writeFileSync(tmp, json, 'utf8')
    try {
      renameSync(tmp, CONFIG_PATH)
    } catch (_renameError) {
      try { if (existsSync(CONFIG_PATH)) unlinkSync(CONFIG_PATH) } catch (_unlinkError) {}
      try {
        renameSync(tmp, CONFIG_PATH)
      } catch (_retryError) {
        writeFileSync(CONFIG_PATH, json, 'utf8')
        try { unlinkSync(tmp) } catch (_cleanupError) {}
      }
    }
    return true
  } catch (_error) {
    return false
  }
}

/** Bounded lenient JSON body reader; resolves null on empty, invalid, or
 *  over-limit bodies. Never rejects. */
function readJsonBody(req, maxBytes) {
  return new Promise((resolve) => {
    const chunks = []
    let size = 0
    let settled = false
    const finish = (value) => {
      if (settled) return
      settled = true
      resolve(value)
    }
    try {
      req.on('data', (chunk) => {
        if (settled) return
        size += chunk.length
        if (size > maxBytes) {
          finish(null)
          try { req.destroy() } catch (_error) {}
          return
        }
        chunks.push(chunk)
      })
      req.on('end', () => {
        const text = Buffer.concat(chunks).toString('utf8')
        if (text === '') { finish(null); return }
        try { finish(JSON.parse(text)) } catch (_error) { finish(null) }
      })
      req.on('error', () => finish(null))
    } catch (_error) {
      finish(null)
    }
  })
}

/** Write one JSON response without throwing. */
function respondJson(res, status, body) {
  try {
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      'referrer-policy': 'no-referrer',
    })
    res.end(JSON.stringify(body))
  } catch (_error) {
    try { res.end() } catch (_error2) {}
  }
}

/** Register the private config route on the injected WebServer. Mounting
 *  problems are logged, never thrown (the web shell must not go down). */
function registerConfigRoutes(ctx) {
  const route = {
    kind: 'exact',
    path: CONFIG_ROUTE,
    handler: async (req, res) => {
      try {
        const method = req.method || 'GET'
        if (method === 'GET' || method === 'HEAD') {
          respondJson(res, 200, readConfigFile() ?? {})
          return
        }
        if (method !== 'POST') {
          respondJson(res, 405, { ok: false, error: 'method-not-allowed' })
          return
        }
        const body = await readJsonBody(req, CONFIG_BODY_MAX_BYTES)
        if (body === null || typeof body !== 'object' || Array.isArray(body)) {
          respondJson(res, 200, { ok: false, error: 'invalid-body' })
          return
        }
        respondJson(res, 200, { ok: writeConfigFile(body) })
      } catch (_error) {
        respondJson(res, 200, { ok: false, error: 'write-failed' })
      }
    },
  }
  try {
    ctx.effect(() => {
      try {
        const dispose = ctx.webServer.register(route)
        console.info(`[lume-appearance] config route ready: ${CONFIG_ROUTE}`)
        return dispose
      } catch (error) {
        console.error('[lume-appearance] config route registration failed:', error)
        return () => {}
      }
    }, 'lume-appearance: config route')
  } catch (error) {
    console.error('[lume-appearance] config route effect failed:', error)
  }
}

export const inject = ['settings', 'webServer']

/**
 * Register the appearance settings namespace with the settings provider.
 * @param ctx - host plugin context.
 */
export function apply(ctx) {
  ctx.inject(['settings'], (settingsCtx) => {
    const settings = settingsCtx.settings
    if (settings === undefined || settings === null) return
    try {
      if (typeof settings.register === 'function') {
        settings.register(NS, Schema, { base: {} })
        return
      }
      if (typeof settings.installSection === 'function') {
        settings.installSection(ctx, NS, Schema, {}, {
          setSource: () => {},
          onChange: () => {},
        })
      }
    } catch (error) {
      ctx.logger?.warn?.(`lume-appearance: settings namespace registration failed: ${String(error)}`)
    }
  })
  registerConfigRoutes(ctx)
}
