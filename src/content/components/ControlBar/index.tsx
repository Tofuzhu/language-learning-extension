import React from 'react'

interface ControlBarProps {
  autoPause: boolean
  playbackRate: number
  onPrev: () => void
  onReplay: () => void
  onNext: () => void
  onToggleAutoPause: () => void
  onRateChange: (rate: number) => void
}

const RATES = [0.5, 0.75, 1, 1.25, 1.5]

export function ControlBar({
  autoPause,
  playbackRate,
  onPrev,
  onReplay,
  onNext,
  onToggleAutoPause,
  onRateChange,
}: ControlBarProps) {
  const barStyle: React.CSSProperties = {
    position: 'absolute',
    bottom: '0',
    left: '0',
    right: '0',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 70%, transparent 100%)',
    zIndex: 2147483002,
    padding: '0 12px',
    pointerEvents: 'auto',
  }

  const btnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    padding: '3px 10px',
    cursor: 'pointer',
    transition: 'background 0.15s',
    lineHeight: '1.4',
    height: '26px',
    display: 'flex',
    alignItems: 'center',
  }

  const activeBtnStyle: React.CSSProperties = {
    ...btnStyle,
    background: 'rgba(59, 130, 246, 0.6)',
    border: '1px solid rgba(96, 165, 250, 0.5)',
  }

  const rateSelectStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.12)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '12px',
    padding: '2px 4px',
    cursor: 'pointer',
    height: '26px',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '11px',
    marginRight: '2px',
    userSelect: 'none',
  }

  return (
    <div style={barStyle}>
      <span style={labelStyle}>LL</span>

      {/* Prev */}
      <button style={btnStyle} onClick={onPrev} title="上一句 (A)">
        ◄
      </button>

      {/* Replay */}
      <button style={btnStyle} onClick={onReplay} title="重播当前句 (S)">
        ↺
      </button>

      {/* Next */}
      <button style={btnStyle} onClick={onNext} title="下一句 (D)">
        ►
      </button>

      {/* Auto-pause */}
      <button
        style={autoPause ? activeBtnStyle : btnStyle}
        onClick={onToggleAutoPause}
        title="自动暂停 (Q)"
      >
        {autoPause ? '⏸ 自动' : '⏸ 手动'}
      </button>

      {/* Playback rate */}
      <select
        style={rateSelectStyle}
        value={playbackRate}
        onChange={e => onRateChange(parseFloat(e.target.value))}
        title="播放速度"
      >
        {RATES.map(r => (
          <option key={r} value={r} style={{ background: '#1a1a1a', color: '#fff' }}>
            {r}x
          </option>
        ))}
      </select>
    </div>
  )
}
