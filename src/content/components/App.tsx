import { useEffect, useState, useRef } from 'react'
import { profileManager } from '../../shared/profile'
import { MSG } from '../../shared/messages'
import type { UserSettings } from '../../shared/types'
import { DEFAULT_SETTINGS } from '../../shared/types'
import { useSubtitles } from '../hooks/useSubtitles'
import { usePlayback } from '../hooks/usePlayback'
import { useKeyboard } from '../hooks/useKeyboard'
import { SubtitleOverlay } from './SubtitleOverlay/index'
import { getVideoId, getVideoElement } from '../utils/youtubeHelpers'

export function App() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)
  const [videoId, setVideoId] = useState<string | null>(null)
  const [videoEl, setVideoEl] = useState<HTMLVideoElement | null>(null)
  const [showTranslation, setShowTranslation] = useState(true)
  const urlRef = useRef(location.href)

  // Load settings from the active profile
  useEffect(() => {
    profileManager.getActiveProfile().then(p => setSettings(p.settings)).catch(console.error)
  }, [])

  // Listen for settings/profile changes from popup/options
  useEffect(() => {
    const handler = (msg: { type: string }) => {
      if (msg.type === MSG.SETTINGS_UPDATED || msg.type === MSG.PROFILE_SWITCHED) {
        profileManager.getActiveProfile().then(p => setSettings(p.settings)).catch(console.error)
      }
    }
    chrome.runtime.onMessage.addListener(handler)
    return () => chrome.runtime.onMessage.removeListener(handler)
  }, [])

  // Detect YouTube SPA navigation
  useEffect(() => {
    function checkUrl() {
      if (location.href === urlRef.current) return
      urlRef.current = location.href
      const vid = getVideoId()
      setVideoId(vid)
      setVideoEl(null)
      if (vid) setTimeout(() => setVideoEl(getVideoElement()), 1200)
    }

    // Initial
    setVideoId(getVideoId())
    setTimeout(() => setVideoEl(getVideoElement()), 1000)

    // Watch title changes (YouTube SPA navigation signal)
    const titleEl = document.querySelector('title') ?? document.head
    const obs = new MutationObserver(checkUrl)
    obs.observe(titleEl, { subtree: true, characterData: true, childList: true })
    window.addEventListener('popstate', checkUrl)
    return () => { obs.disconnect(); window.removeEventListener('popstate', checkUrl) }
  }, [])

  const { cues, status, errorMessage, detectedLang, reload } = useSubtitles(
    videoId,
    settings.targetLanguage,
    settings.nativeLanguage
  )

  const {
    currentCueIndex,
    autoPause,
    playbackRate,
    prevSentence,
    nextSentence,
    replaySentence,
    toggleAutoPause,
    setRate,
  } = usePlayback(cues, videoEl)

  useKeyboard({ prevSentence, nextSentence, replaySentence, toggleAutoPause })

  if (!videoId) return null

  return (
    <SubtitleOverlay
      cues={cues}
      currentCueIndex={currentCueIndex}
      status={status}
      errorMessage={errorMessage}
      detectedLang={detectedLang}
      fontSize={settings.subtitleFontSize}
      showTranslation={showTranslation}
      onReload={reload}
      onPrev={prevSentence}
      onNext={nextSentence}
      onReplay={replaySentence}
      autoPause={autoPause}
      onToggleAutoPause={toggleAutoPause}
      playbackRate={playbackRate}
      onRateChange={setRate}
      onToggleTranslation={() => setShowTranslation(v => !v)}
    />
  )
}
