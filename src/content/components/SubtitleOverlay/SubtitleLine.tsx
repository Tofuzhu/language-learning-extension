
import type { SubtitleCue } from '../../../shared/types'
import type { FontSize, TranslationPosition } from '../../../shared/types'

interface SubtitleLineProps {
  cue: SubtitleCue
  fontSize: FontSize
  translationPosition: TranslationPosition
  showTranslation: boolean
}

const fontSizeMap: Record<FontSize, string> = {
  small: '14px',
  medium: '18px',
  large: '22px',
}
const transFontSizeMap: Record<FontSize, string> = {
  small: '11px',
  medium: '14px',
  large: '17px',
}

export function SubtitleLine({ cue, fontSize, translationPosition, showTranslation }: SubtitleLineProps) {
  const origSize = fontSizeMap[fontSize]
  const transSize = transFontSizeMap[fontSize]

  const originalLine = (
    <div
      key="orig"
      style={{
        fontSize: origSize,
        color: '#ffffff',
        textShadow: '0 1px 3px rgba(0,0,0,0.9)',
        lineHeight: 1.4,
        fontWeight: 500,
        letterSpacing: '0.01em',
      }}
    >
      {cue.originalText}
    </div>
  )

  const translationLine = showTranslation && cue.translatedText ? (
    <div
      key="trans"
      style={{
        fontSize: transSize,
        color: '#d1d5db',
        textShadow: '0 1px 2px rgba(0,0,0,0.9)',
        lineHeight: 1.4,
        fontStyle: 'italic',
      }}
    >
      {cue.translatedText}
    </div>
  ) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }}>
      {translationPosition === 'above' ? (
        <>{translationLine}{originalLine}</>
      ) : (
        <>{originalLine}{translationLine}</>
      )}
    </div>
  )
}
