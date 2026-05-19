import { useState, useEffect, useRef, useCallback } from 'react'
import type { SubtitleCue } from '../../shared/types'

export interface UsePlaybackResult {
  currentTime: number
  currentCueIndex: number
  autoPause: boolean
  playbackRate: number
  prevSentence: () => void
  nextSentence: () => void
  replaySentence: () => void
  toggleAutoPause: () => void
  setRate: (rate: number) => void
}

/**
 * Manages video playback: tracks current time, computes current subtitle index,
 * and provides sentence navigation + auto-pause.
 */
export function usePlayback(
  cues: SubtitleCue[],
  videoEl: HTMLVideoElement | null
): UsePlaybackResult {
  const [currentTime, setCurrentTime] = useState(0)
  const [autoPause, setAutoPause] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const autoPauseRef = useRef(false)
  const cuesRef = useRef<SubtitleCue[]>([])
  const currentTimeRef = useRef(0)

  // Keep refs in sync
  autoPauseRef.current = autoPause
  cuesRef.current = cues

  useEffect(() => {
    if (!videoEl) return

    const onTimeUpdate = () => {
      const t = videoEl.currentTime
      currentTimeRef.current = t
      setCurrentTime(t)

      // Auto-pause: if the current cue just ended, pause
      if (autoPauseRef.current) {
        const cues = cuesRef.current
        const idx = findCueIndex(cues, t)
        if (idx >= 0) {
          const cue = cues[idx]
          const timeToEnd = cue.endTime - t
          // Pause within 50ms of the cue end
          if (timeToEnd <= 0.05 && timeToEnd > -0.15) {
            videoEl.pause()
          }
        }
      }
    }

    const onRateChange = () => setPlaybackRate(videoEl.playbackRate)

    videoEl.addEventListener('timeupdate', onTimeUpdate)
    videoEl.addEventListener('ratechange', onRateChange)
    return () => {
      videoEl.removeEventListener('timeupdate', onTimeUpdate)
      videoEl.removeEventListener('ratechange', onRateChange)
    }
  }, [videoEl])

  const seekTo = useCallback((time: number) => {
    if (!videoEl) return
    videoEl.currentTime = Math.max(0, time)
    if (videoEl.paused) videoEl.play().catch(() => {})
  }, [videoEl])

  const prevSentence = useCallback(() => {
    const cues = cuesRef.current
    const t = currentTimeRef.current
    const idx = findCueIndex(cues, t)
    if (idx > 0) {
      seekTo(cues[idx - 1].startTime)
    } else if (idx === 0) {
      seekTo(cues[0].startTime)
    }
  }, [seekTo])

  const nextSentence = useCallback(() => {
    const cues = cuesRef.current
    const t = currentTimeRef.current
    const idx = findCueIndex(cues, t)
    if (idx >= 0 && idx < cues.length - 1) {
      seekTo(cues[idx + 1].startTime)
    }
  }, [seekTo])

  const replaySentence = useCallback(() => {
    const cues = cuesRef.current
    const t = currentTimeRef.current
    const idx = findCueIndex(cues, t)
    if (idx >= 0) {
      seekTo(cues[idx].startTime)
    }
  }, [seekTo])

  const toggleAutoPause = useCallback(() => {
    setAutoPause(prev => !prev)
  }, [])

  const setRate = useCallback((rate: number) => {
    if (!videoEl) return
    videoEl.playbackRate = rate
    setPlaybackRate(rate)
  }, [videoEl])

  const currentCueIndex = findCueIndex(cues, currentTime)

  return {
    currentTime,
    currentCueIndex,
    autoPause,
    playbackRate,
    prevSentence,
    nextSentence,
    replaySentence,
    toggleAutoPause,
    setRate,
  }
}

function findCueIndex(cues: SubtitleCue[], time: number): number {
  if (cues.length === 0) return -1
  for (let i = cues.length - 1; i >= 0; i--) {
    if (time >= cues[i].startTime - 0.1) {
      if (time < cues[i].endTime + 0.5) return i
      // Past the cue but no next yet — keep showing last
      if (i === cues.length - 1) return i
      if (time < cues[i + 1].startTime) return -1
    }
  }
  return -1
}
