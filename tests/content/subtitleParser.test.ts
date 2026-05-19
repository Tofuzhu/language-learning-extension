import { describe, it, expect } from 'vitest'
import { parseTimedTextXml, mergeCues } from '../../src/content/utils/subtitleParser'

describe('subtitleParser', () => {
  describe('parseTimedTextXml', () => {
    it('parses standard format-3 XML', () => {
      const xml = `<?xml version="1.0" encoding="utf-8" ?>
<transcript>
  <text start="1.459" dur="3.28">Hello world</text>
  <text start="5.0" dur="2.0">How are you?</text>
</transcript>`

      // We need a DOM parser — vitest uses jsdom
      const result = parseTimedTextXml(xml)
      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({ start: 1.459, end: 1.459 + 3.28, text: 'Hello world' })
      expect(result[1]).toMatchObject({ start: 5.0, end: 7.0, text: 'How are you?' })
    })

    it('decodes HTML entities', () => {
      const xml = `<transcript><text start="0" dur="1">It&#39;s &amp; that</text></transcript>`
      const result = parseTimedTextXml(xml)
      expect(result[0].text).toBe("It's & that")
    })

    it('filters out empty cues', () => {
      const xml = `<transcript>
        <text start="0" dur="1">  </text>
        <text start="1" dur="1">Real text</text>
      </transcript>`
      const result = parseTimedTextXml(xml)
      expect(result).toHaveLength(1)
      expect(result[0].text).toBe('Real text')
    })

    it('handles newlines inside text by converting to spaces', () => {
      const xml = `<transcript><text start="0" dur="2">Line one\nLine two</text></transcript>`
      const result = parseTimedTextXml(xml)
      expect(result[0].text).toBe('Line one Line two')
    })

    it('handles missing dur attribute gracefully', () => {
      const xml = `<transcript><text start="2">No duration</text></transcript>`
      const result = parseTimedTextXml(xml)
      expect(result[0].end).toBe(2) // start + 0
    })

    it('returns empty array for empty transcript', () => {
      const xml = `<transcript></transcript>`
      expect(parseTimedTextXml(xml)).toHaveLength(0)
    })
  })

  describe('mergeCues', () => {
    it('merges original and translated cues by index', () => {
      const orig = [
        { start: 0, end: 2, text: 'Hello' },
        { start: 2, end: 4, text: 'World' },
      ]
      const trans = [
        { start: 0, end: 2, text: '你好' },
        { start: 2, end: 4, text: '世界' },
      ]
      const merged = mergeCues(orig, trans)
      expect(merged).toHaveLength(2)
      expect(merged[0]).toMatchObject({ index: 0, startTime: 0, endTime: 2, originalText: 'Hello', translatedText: '你好' })
      expect(merged[1]).toMatchObject({ index: 1, originalText: 'World', translatedText: '世界' })
    })

    it('handles missing translations gracefully', () => {
      const orig = [{ start: 0, end: 2, text: 'Hello' }]
      const merged = mergeCues(orig, [])
      expect(merged[0].translatedText).toBe('')
    })

    it('handles more originals than translations', () => {
      const orig = [
        { start: 0, end: 2, text: 'A' },
        { start: 2, end: 4, text: 'B' },
        { start: 4, end: 6, text: 'C' },
      ]
      const trans = [{ start: 0, end: 2, text: 'AA' }]
      const merged = mergeCues(orig, trans)
      expect(merged[1].translatedText).toBe('')
      expect(merged[2].translatedText).toBe('')
    })
  })
})
