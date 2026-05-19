import React, { useState, useRef, useEffect } from 'react'
import type { SubtitleCue, FontSize } from '../../../shared/types'
import type { SubtitleStatus } from '../../hooks/useSubtitles'

// ─── Props ────────────────────────────────────────────────────────────────────

interface SubtitleOverlayProps {
  cues: SubtitleCue[]
  currentCueIndex: number
  status: SubtitleStatus
  errorMessage: string
  detectedLang: string
  fontSize: FontSize
  showTranslation: boolean
  onReload: () => void
  onPrev: () => void
  onNext: () => void
  onReplay: () => void
  autoPause: boolean
  onToggleAutoPause: () => void
  playbackRate: number
  onRateChange: (rate: number) => void
  onToggleTranslation: () => void
}

const FONT_SIZE_MAP: Record<FontSize, { orig: string; trans: string }> = {
  small:  { orig: '16px', trans: '13px' },
  medium: { orig: '20px', trans: '15px' },
  large:  { orig: '26px', trans: '19px' },
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5]

// ─── Main component ───────────────────────────────────────────────────────────
// Layout matching Language Reactor:
//   • Subtitle text + left/right controls float at the bottom of the video
//     frame, ABOVE YouTube's native control bar (~50px)
//   • Side panel (subtitle list) slides in from the right inside the player
//   • Nothing is placed at bottom:0, so YouTube controls stay accessible

export function SubtitleOverlay({
  cues,
  currentCueIndex,
  status,
  errorMessage,
  detectedLang,
  fontSize,
  showTranslation,
  onReload,
  onPrev,
  onNext,
  onReplay,
  autoPause,
  onToggleAutoPause,
  playbackRate,
  onRateChange,
  onToggleTranslation,
}: SubtitleOverlayProps) {
  const [showPanel, setShowPanel] = useState(true)
  const panelRef = useRef<HTMLDivElement>(null)
  const fz = FONT_SIZE_MAP[fontSize]
  const currentCue = currentCueIndex >= 0 ? cues[currentCueIndex] : null

  // Auto-scroll the side panel to the current cue
  useEffect(() => {
    if (!panelRef.current || currentCueIndex < 0) return
    const item = panelRef.current.querySelector(`[data-idx="${currentCueIndex}"]`) as HTMLElement | null
    if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [currentCueIndex])

  // ─── Root wrapper ─────────────────────────────────────────────────────────
  // This fills the entire #movie_player div (which is position:relative).
  // All children use absolute positioning relative to this.
  const root: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    fontFamily: "'Segoe UI', Arial, 'Noto Sans', sans-serif",
    zIndex: 2000,
  }

  // ─── Status indicators (only shown when not ready) ────────────────────────
  if (status === 'loading') {
    return (
      <div style={root}>
        <StatusPill color="#6b7280">⏳ 字幕加载中…</StatusPill>
      </div>
    )
  }
  if (status === 'no-captions') {
    return (
      <div style={root}>
        <StatusPill color="#ef4444">⚠️ {errorMessage}</StatusPill>
      </div>
    )
  }
  if (status === 'error') {
    return (
      <div style={root}>
        <StatusPill color="#ef4444">
          ❌ {errorMessage}
          <button onClick={onReload} style={inlineBtn}>重试</button>
        </StatusPill>
      </div>
    )
  }

  // ─── Ready state layout ───────────────────────────────────────────────────

  // SUBTITLE AREA: sits just above YouTube's native controls (~50px tall).
  // We add 56px from the bottom so we never overlap YouTube's control bar.
  const subtitleZone: React.CSSProperties = {
    position: 'absolute',
    bottom: '56px',   // above YouTube's ~50px control bar
    left: 0,
    right: showPanel ? '340px' : 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    pointerEvents: 'none',
  }

  // The dark pill behind the subtitle text
  const textPill: React.CSSProperties = {
    display: 'inline-block',
    background: 'rgba(0,0,0,0.78)',
    borderRadius: '6px',
    padding: '6px 18px 8px',
    textAlign: 'center',
    maxWidth: '90%',
    pointerEvents: 'auto',
    cursor: 'default',
  }

  // LEFT CONTROL COLUMN: prev / replay / next — Language Reactor style
  const leftCol: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    bottom: '56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    pointerEvents: 'auto',
  }

  // RIGHT CONTROL COLUMN: AP / speed / translate / panel toggle
  const rightCol: React.CSSProperties = {
    position: 'absolute',
    right: showPanel ? '352px' : '12px',
    bottom: '56px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    pointerEvents: 'auto',
  }

  // SIDE PANEL: subtitle list, right side of player
  const panel: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    width: '340px',
    background: 'rgba(18,18,20,0.95)',
    borderLeft: '1px solid rgba(255,255,255,0.07)',
    display: 'flex',
    flexDirection: 'column',
    pointerEvents: 'auto',
    backdropFilter: 'blur(10px)',
    zIndex: 2001,
  }

  // HAMBURGER: toggle panel — positioned at top-right of video area
  const hamBtn: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    right: showPanel ? '350px' : '10px',
    background: 'rgba(0,0,0,0.55)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '5px',
    color: '#d1d5db',
    cursor: 'pointer',
    fontSize: '16px',
    width: '30px',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'auto',
    zIndex: 2002,
  }

  // detected language badge
  const langBadge: React.CSSProperties = {
    position: 'absolute',
    top: '10px',
    left: '10px',
    background: 'rgba(0,0,0,0.55)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '4px',
    color: '#9ca3af',
    fontSize: '10px',
    padding: '2px 7px',
    pointerEvents: 'none',
  }

  return (
    <div style={root}>
      {/* Language badge */}
      {status === 'ready' && detectedLang && (
        <div style={langBadge}>{detectedLang}</div>
      )}

      {/* Hamburger / panel toggle */}
      <button style={hamBtn} onClick={() => setShowPanel(v => !v)} title="字幕列表">≡</button>

      {/* Subtitle text area */}
      <div style={subtitleZone}>
        {currentCue ? (
          <div style={textPill}>
            {/* Translation above (Language Reactor style) */}
            {showTranslation && currentCue.translatedText && (
              <div style={{
                color: '#9ca3af',
                fontSize: fz.trans,
                lineHeight: 1.4,
                marginBottom: '3px',
              }}>
                {currentCue.translatedText}
              </div>
            )}
            {/* Original text */}
            <div style={{
              color: '#ffffff',
              fontSize: fz.orig,
              fontWeight: 600,
              lineHeight: 1.4,
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
            }}>
              {currentCue.originalText}
            </div>
          </div>
        ) : status === 'ready' && cues.length > 0 ? null : null}
      </div>

      {/* Left controls: Prev / Replay / Next */}
      <div style={leftCol}>
        <CtrlBtn label="›" title="下一句 (D)" onClick={onNext} />
        <CtrlBtn label="↺" title="重播 (S)" onClick={onReplay} />
        <CtrlBtn label="‹" title="上一句 (A)" onClick={onPrev} />
      </div>

      {/* Right controls: AP / speed / translation */}
      <div style={rightCol}>
        <CtrlBtn label="AP" title={autoPause ? '自动暂停: 开' : '自动暂停: 关'} onClick={onToggleAutoPause} active={autoPause} small />
        <SpeedSelect value={playbackRate} options={RATES} onChange={onRateChange} />
        <CtrlBtn label="译" title={showTranslation ? '隐藏译文' : '显示译文'} onClick={onToggleTranslation} active={showTranslation} small />
      </div>

      {/* Side panel */}
      {showPanel && (
        <div style={panel}>
          {/* Panel header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '9px 14px 8px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            gap: '10px',
            flexShrink: 0,
          }}>
            <span style={{ color: '#3b82f6', fontSize: '13px', fontWeight: 600 }}>字幕</span>
            <span style={{ color: '#374151', fontSize: '11px' }}>|</span>
            <span style={{ color: '#4b5563', fontSize: '12px' }}>生词本</span>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowPanel(false)}
              style={{ background: 'none', border: 'none', color: '#4b5563', cursor: 'pointer', fontSize: '16px', lineHeight: 1, padding: 0 }}
            >✕</button>
          </div>
          {/* Cue list */}
          <div ref={panelRef} style={{ flex: 1, overflowY: 'auto' }}>
            {cues.map(cue => {
              const isCurrent = cue.index === currentCueIndex
              return (
                <div
                  key={cue.index}
                  data-idx={cue.index}
                  style={{
                    padding: '8px 16px 8px 13px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)',
                    borderLeft: isCurrent ? '3px solid #3b82f6' : '3px solid transparent',
                    background: isCurrent ? 'rgba(59,130,246,0.18)' : 'transparent',
                    transition: 'background 0.15s',
                    cursor: 'default',
                  }}
                >
                  <div style={{
                    color: isCurrent ? '#f3f4f6' : '#6b7280',
                    fontSize: '13px',
                    lineHeight: 1.5,
                  }}>
                    {cue.originalText}
                  </div>
                  {showTranslation && cue.translatedText && (
                    <div style={{
                      color: isCurrent ? '#9ca3af' : '#374151',
                      fontSize: '11px',
                      marginTop: '2px',
                      fontStyle: 'italic',
                    }}>
                      {cue.translatedText}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CtrlBtn({ label, title, onClick, active = false, small = false }: {
  label: string; title: string; onClick: () => void; active?: boolean; small?: boolean
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: active
          ? 'rgba(59,130,246,0.55)'
          : hover ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.55)',
        border: '1px solid ' + (active ? 'rgba(96,165,250,0.5)' : 'rgba(255,255,255,0.15)'),
        borderRadius: '5px',
        color: active ? '#93c5fd' : '#e5e7eb',
        fontSize: small ? '11px' : '17px',
        fontWeight: 600,
        width: small ? '30px' : '32px',
        height: '26px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'background 0.12s',
        padding: 0,
      }}
    >
      {label}
    </button>
  )
}

function SpeedSelect({ value, options, onChange }: {
  value: number; options: number[]; onChange: (v: number) => void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(parseFloat(e.target.value))}
      title="播放速度"
      style={{
        background: 'rgba(0,0,0,0.55)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '5px',
        color: '#e5e7eb',
        fontSize: '11px',
        width: '30px',
        height: '26px',
        cursor: 'pointer',
        padding: 0,
        textAlign: 'center',
        outline: 'none',
      }}
    >
      {options.map(r => (
        <option key={r} value={r} style={{ background: '#111' }}>{r}x</option>
      ))}
    </select>
  )
}

function StatusPill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '60px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: 'rgba(0,0,0,0.75)',
      borderRadius: '6px',
      padding: '6px 14px',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      color,
      fontSize: '13px',
      whiteSpace: 'nowrap',
      pointerEvents: 'auto',
    }}>
      {children}
    </div>
  )
}

const inlineBtn: React.CSSProperties = {
  background: 'rgba(255,255,255,0.12)',
  border: '1px solid rgba(255,255,255,0.2)',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '12px',
  padding: '2px 8px',
  cursor: 'pointer',
  marginLeft: '4px',
}
