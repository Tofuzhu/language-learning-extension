import { useState, useEffect, useRef, useCallback } from 'react'
import type { SubtitleCue } from '../../shared/types'
import { getCaptionTracks, pickTrack, buildOriginalUrl, buildTranslatedUrl } from '../utils/youtubeHelpers'
import { parseJson3, parseTimedTextXml, mergeCues } from '../utils/subtitleParser'

export type SubtitleStatus = 'idle' | 'loading' | 'ready' | 'no-captions' | 'error'

export interface UseSubtitlesResult {
  cues: SubtitleCue[]
  status: SubtitleStatus
  errorMessage: string
  detectedLang: string
  reload: () => void
}

export function useSubtitles(
  videoId: string | null,
  targetLang: string,
  nativeLang: string
): UseSubtitlesResult {
  const [cues, setCues] = useState<SubtitleCue[]>([])
  const [status, setStatus] = useState<SubtitleStatus>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [detectedLang, setDetectedLang] = useState('')
  const abortRef = useRef<AbortController | null>(null)
  const reloadKey = useRef(0)
  const [tick, setTick] = useState(0)

  const reload = useCallback(() => {
    reloadKey.current += 1
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    if (!videoId) { setStatus('idle'); setCues([]); return }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    let cancelled = false

    async function fetch_() {
      setStatus('loading')
      setCues([])
      setErrorMessage('')
      setDetectedLang('')

      try {
        // Give the page JS time to run ytInitialPlayerResponse
        await new Promise(r => setTimeout(r, 800))
        if (cancelled) return

        const tracks = getCaptionTracks()
        if (tracks.length === 0) {
          setStatus('no-captions')
          setErrorMessage('该视频无字幕')
          return
        }

        const track = pickTrack(tracks, targetLang)
        if (!track) {
          setStatus('no-captions')
          setErrorMessage('未找到匹配字幕轨道')
          return
        }

        if (!cancelled) setDetectedLang(track.languageCode)
        console.log('[LL Extension] Using track:', track.languageCode, track.kind ?? 'manual')

        const origUrl = buildOriginalUrl(track.baseUrl)
        const sameLanguage = targetLang === nativeLang || track.languageCode === nativeLang
        const transUrl = sameLanguage ? null : buildTranslatedUrl(track.baseUrl, nativeLang)

        const [origRes, transRes] = await Promise.all([
          fetch(origUrl, { signal: controller.signal }),
          transUrl ? fetch(transUrl, { signal: controller.signal }) : Promise.resolve(null),
        ])

        if (!origRes.ok) throw new Error(`字幕请求失败: ${origRes.status}`)

        const origText = await origRes.text()
        const transText = (transRes && transRes.ok) ? await transRes.text() : ''

        console.log('[LL Extension] Orig response length:', origText.length, 'starts with:', origText.substring(0, 80))

        // Parse — try JSON3 first, fall back to XML
        let origCues = parseJson3(origText)
        if (origCues.length === 0) {
          console.log('[LL Extension] JSON3 parse empty, trying XML...')
          origCues = parseTimedTextXml(origText)
        }
        console.log('[LL Extension] Parsed', origCues.length, 'original cues')

        let transCues = transText ? parseJson3(transText) : []
        if (transCues.length === 0 && transText) transCues = parseTimedTextXml(transText)

        if (cancelled) return

        if (origCues.length === 0) {
          setStatus('error')
          setErrorMessage('字幕解析失败，格式不支持')
          return
        }

        setCues(mergeCues(origCues, transCues))
        setStatus('ready')
        console.log('[LL Extension] Ready with', origCues.length, 'cues')
      } catch (err) {
        if (cancelled || (err as Error).name === 'AbortError') return
        console.error('[LL Extension] Error:', err)
        setStatus('error')
        setErrorMessage((err as Error).message || '字幕加载失败')
      }
    }

    fetch_()
    return () => { cancelled = true; controller.abort() }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, targetLang, nativeLang, tick])

  return { cues, status, errorMessage, detectedLang, reload }
}
