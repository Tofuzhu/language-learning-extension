interface CaptionTrack {
  baseUrl: string
  languageCode: string
  name: { simpleText: string }
  kind?: string
}

// ─── Caption track extraction ─────────────────────────────────────────────────
// Content scripts run in an isolated JS world and cannot read page globals.
// We parse ytInitialPlayerResponse from <script> tags using bracket matching.

export function getCaptionTracks(): CaptionTrack[] {
  const scripts = Array.from(document.querySelectorAll('script'))
  for (const script of scripts) {
    const src = script.textContent ?? ''
    if (!src.includes('captionTracks')) continue
    const tracks = tryExtractCaptionTracks(src)
    if (tracks && tracks.length > 0) {
      console.log('[LL Extension] Found', tracks.length, 'caption tracks:', tracks.map(t => t.languageCode))
      return tracks
    }
  }
  console.warn('[LL Extension] No caption tracks found in page scripts')
  return []
}

function tryExtractCaptionTracks(src: string): CaptionTrack[] | null {
  try {
    const marker = 'ytInitialPlayerResponse'
    const markerIdx = src.indexOf(marker)
    if (markerIdx === -1) return null
    const eqIdx = src.indexOf('=', markerIdx)
    if (eqIdx === -1) return null
    const braceIdx = src.indexOf('{', eqIdx)
    if (braceIdx === -1) return null
    const json = extractBalancedJson(src, braceIdx)
    if (!json) return null
    const resp = JSON.parse(json) as {
      captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: CaptionTrack[] } }
    }
    return resp?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? null
  } catch (e) {
    console.warn('[LL Extension] Failed to parse ytInitialPlayerResponse:', e)
    return null
  }
}

function extractBalancedJson(src: string, startIdx: number): string | null {
  let depth = 0
  let inString = false
  let escape = false
  for (let i = startIdx; i < src.length; i++) {
    const ch = src[i]
    if (escape) { escape = false; continue }
    if (ch === '\\' && inString) { escape = true; continue }
    if (ch === '"') { inString = !inString; continue }
    if (inString) continue
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) return src.slice(startIdx, i + 1)
    }
  }
  return null
}

// ─── Track selection ──────────────────────────────────────────────────────────

export function pickTrack(tracks: CaptionTrack[], langCode: string): CaptionTrack | null {
  if (tracks.length === 0) return null
  // Exact match, manual first
  const exact = tracks.filter(t => t.languageCode === langCode)
  const manualExact = exact.find(t => t.kind !== 'asr')
  if (manualExact) return manualExact
  if (exact.length > 0) return exact[0]
  // Prefix match (e.g. 'en-US' for 'en')
  const prefix = tracks.filter(t => t.languageCode.startsWith(langCode))
  const manualPrefix = prefix.find(t => t.kind !== 'asr')
  if (manualPrefix) return manualPrefix
  if (prefix.length > 0) return prefix[0]
  // Fallback: first available
  console.warn(`[LL Extension] No track for "${langCode}", using: ${tracks[0].languageCode}`)
  return tracks[0]
}

// ─── URL builders — use fmt=json3 for reliable JSON parsing ──────────────────

export function buildOriginalUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('fmt', 'json3')
    url.searchParams.delete('tlang')
    return url.toString()
  } catch {
    return `${baseUrl}&fmt=json3`
  }
}

export function buildTranslatedUrl(baseUrl: string, targetLang: string): string {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('fmt', 'json3')
    url.searchParams.set('tlang', targetLang)
    return url.toString()
  } catch {
    return `${baseUrl}&fmt=json3&tlang=${targetLang}`
  }
}

// ─── DOM helpers ──────────────────────────────────────────────────────────────

export function getVideoId(): string | null {
  return new URLSearchParams(window.location.search).get('v')
}

export function getVideoElement(): HTMLVideoElement | null {
  return (
    document.querySelector<HTMLVideoElement>('video.html5-main-video') ??
    document.querySelector<HTMLVideoElement>('#movie_player video') ??
    document.querySelector<HTMLVideoElement>('video')
  )
}

export function waitForPlayer(timeout = 15000): Promise<Element> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector('#movie_player')
    if (existing) { resolve(existing); return }
    const observer = new MutationObserver(() => {
      const el = document.querySelector('#movie_player')
      if (el) { observer.disconnect(); resolve(el) }
    })
    observer.observe(document.body, { childList: true, subtree: true })
    setTimeout(() => {
      observer.disconnect()
      reject(new Error('[LL Extension] #movie_player not found'))
    }, timeout)
  })
}
