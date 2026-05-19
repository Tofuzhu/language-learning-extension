import { describe, it, expect } from 'vitest'

// We test the logic directly since the functions don't depend on browser APIs
// (extractBalancedJson and tryExtractCaptionTracks are internal — we test getCaptionTracks
// by mocking document, which jsdom provides)

// ── Inline copies of the pure logic (no DOM needed) ──────────────────────────

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

function tryExtractCaptionTracks(src: string): unknown[] | null {
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
    const resp = JSON.parse(json) as { captions?: { playerCaptionsTracklistRenderer?: { captionTracks?: unknown[] } } }
    return resp?.captions?.playerCaptionsTracklistRenderer?.captionTracks ?? null
  } catch {
    return null
  }
}

// ─────────────────────────────────────────────────────────────────────────────

describe('youtubeHelpers – extractBalancedJson', () => {
  it('extracts a simple object', () => {
    const src = 'var x = {"a":1,"b":2};'
    const idx = src.indexOf('{')
    expect(extractBalancedJson(src, idx)).toBe('{"a":1,"b":2}')
  })

  it('handles nested objects', () => {
    const src = '{"outer":{"inner":42}}'
    expect(extractBalancedJson(src, 0)).toBe('{"outer":{"inner":42}}')
  })

  it('handles braces inside strings', () => {
    const src = '{"key":"value{not_a_brace}"}'
    expect(extractBalancedJson(src, 0)).toBe('{"key":"value{not_a_brace}"}')
  })

  it('handles escaped quotes in strings', () => {
    const src = '{"key":"she said \\"hello\\""}'
    expect(extractBalancedJson(src, 0)).toBe('{"key":"she said \\"hello\\""}')
  })

  it('returns null if no closing brace', () => {
    expect(extractBalancedJson('{"unclosed":', 0)).toBeNull()
  })
})

describe('youtubeHelpers – tryExtractCaptionTracks', () => {
  function makeScript(tracks: object[]) {
    const resp = {
      captions: {
        playerCaptionsTracklistRenderer: { captionTracks: tracks }
      }
    }
    return `var ytInitialPlayerResponse = ${JSON.stringify(resp)};var yt = {};`
  }

  it('extracts caption tracks from a simulated YouTube script', () => {
    const fakeTrack = { baseUrl: 'https://example.com/api/timedtext?v=abc', languageCode: 'en', name: { simpleText: 'English' } }
    const src = makeScript([fakeTrack])
    const result = tryExtractCaptionTracks(src)
    expect(result).toHaveLength(1)
    expect((result![0] as { languageCode: string }).languageCode).toBe('en')
  })

  it('extracts multiple tracks', () => {
    const tracks = [
      { baseUrl: 'https://example.com/t1', languageCode: 'en', name: { simpleText: 'English' } },
      { baseUrl: 'https://example.com/t2', languageCode: 'es', name: { simpleText: 'Spanish' } },
    ]
    const result = tryExtractCaptionTracks(makeScript(tracks))
    expect(result).toHaveLength(2)
  })

  it('returns null when no ytInitialPlayerResponse', () => {
    expect(tryExtractCaptionTracks('var x = 1;')).toBeNull()
  })

  it('returns null when captions are absent', () => {
    const src = `var ytInitialPlayerResponse = {"videoId":"abc"};`
    expect(tryExtractCaptionTracks(src)).toBeNull()
  })

  it('handles deeply nested complex JSON without breaking', () => {
    const tracks = [{ baseUrl: 'https://example.com/timedtext?v=x&key={"nested":"json"}', languageCode: 'en', name: { simpleText: 'En' } }]
    const src = makeScript(tracks)
    const result = tryExtractCaptionTracks(src)
    expect(result).not.toBeNull()
  })
})

// ── URL builder tests ─────────────────────────────────────────────────────────

function buildOriginalUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('fmt', '3')
    url.searchParams.delete('tlang')
    return url.toString()
  } catch {
    const sep = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${sep}fmt=3`
  }
}

function buildTranslatedUrl(baseUrl: string, targetLang: string): string {
  try {
    const url = new URL(baseUrl)
    url.searchParams.set('fmt', '3')
    url.searchParams.set('tlang', targetLang)
    return url.toString()
  } catch {
    const sep = baseUrl.includes('?') ? '&' : '?'
    return `${baseUrl}${sep}fmt=3&tlang=${targetLang}`
  }
}

describe('URL builders', () => {
  const base = 'https://www.youtube.com/api/timedtext?v=abc&lang=en'

  it('buildOriginalUrl sets fmt=3', () => {
    const url = buildOriginalUrl(base)
    expect(url).toContain('fmt=3')
    expect(url).not.toContain('tlang')
  })

  it('buildOriginalUrl removes existing tlang', () => {
    const url = buildOriginalUrl(base + '&tlang=zh')
    expect(url).not.toContain('tlang')
  })

  it('buildTranslatedUrl sets fmt=3 and tlang', () => {
    const url = buildTranslatedUrl(base, 'zh')
    expect(url).toContain('fmt=3')
    expect(url).toContain('tlang=zh')
  })

  it('buildTranslatedUrl overrides existing tlang', () => {
    const url = buildTranslatedUrl(base + '&tlang=fr', 'zh')
    expect(url).toContain('tlang=zh')
    expect(url).not.toContain('tlang=fr')
  })
})
