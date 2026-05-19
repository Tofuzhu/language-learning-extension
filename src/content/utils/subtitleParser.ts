import type { SubtitleCue } from '../../shared/types'

// ─── JSON3 format (fmt=json3) ────────────────────────────────────────────────
// YouTube returns: { "events": [{ "tStartMs": 1000, "dDurationMs": 2000,
//                                  "segs": [{ "utf8": "text" }] }] }

interface Json3Event {
  tStartMs?: number
  dDurationMs?: number
  segs?: Array<{ utf8?: string }>
}
interface Json3Response {
  events?: Json3Event[]
}

export function parseJson3(json: string): Array<{ start: number; end: number; text: string }> {
  let data: Json3Response
  try {
    data = JSON.parse(json) as Json3Response
  } catch {
    return []
  }
  const events = data.events ?? []
  return events
    .filter(e => e.segs && e.tStartMs !== undefined)
    .map(e => {
      const start = (e.tStartMs ?? 0) / 1000
      const dur = (e.dDurationMs ?? 0) / 1000
      const text = (e.segs ?? [])
        .map(s => s.utf8 ?? '')
        .join('')
        .replace(/\n/g, ' ')
        .trim()
      return { start, end: start + dur, text }
    })
    .filter(c => c.text.length > 0)
}

// ─── XML format 3 (fallback) ─────────────────────────────────────────────────
export function parseTimedTextXml(xml: string): Array<{ start: number; end: number; text: string }> {
  try {
    const parser = new DOMParser()
    const doc = parser.parseFromString(xml, 'text/xml')
    const textNodes = Array.from(doc.getElementsByTagName('text'))
    return textNodes.map(node => {
      const start = parseFloat(node.getAttribute('start') ?? '0')
      const dur = parseFloat(node.getAttribute('dur') ?? '0')
      const raw = node.textContent ?? ''
      const ta = document.createElement('textarea')
      ta.innerHTML = raw
      const text = ta.value.replace(/\n/g, ' ').trim()
      return { start, end: start + dur, text }
    }).filter(c => c.text.length > 0)
  } catch {
    return []
  }
}

// ─── Merge ───────────────────────────────────────────────────────────────────
export function mergeCues(
  original: Array<{ start: number; end: number; text: string }>,
  translated: Array<{ start: number; end: number; text: string }>
): SubtitleCue[] {
  return original.map((orig, i) => ({
    index: i,
    startTime: orig.start,
    endTime: orig.end,
    originalText: orig.text,
    translatedText: translated[i]?.text ?? '',
  }))
}
