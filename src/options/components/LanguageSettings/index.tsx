import { LANGUAGE_LABELS, type Language, type UserSettings } from '../../../shared/types'

const LANGUAGES: Language[] = ['en', 'es', 'zh']
const FONT_SIZES = [
  { value: 'small' as const, label: '小' },
  { value: 'medium' as const, label: '中' },
  { value: 'large' as const, label: '大' },
]

interface Props {
  settings: UserSettings
  onChange: (updates: Partial<UserSettings>) => void
}

export function LanguageSettings({ settings, onChange }: Props) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-700 mb-3">语言设置</h2>
      <div className="space-y-3">
        <div className="flex items-center gap-4">
          <label className="w-28 text-sm text-gray-600">我正在学习</label>
          <select
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            value={settings.targetLanguage}
            onChange={e => {
              const lang = e.target.value as Language
              if (lang !== settings.nativeLanguage) onChange({ targetLanguage: lang })
            }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} disabled={lang === settings.nativeLanguage}>
                {LANGUAGE_LABELS[lang]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-28 text-sm text-gray-600">我的母语</label>
          <select
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            value={settings.nativeLanguage}
            onChange={e => {
              const lang = e.target.value as Language
              if (lang !== settings.targetLanguage) onChange({ nativeLanguage: lang })
            }}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} disabled={lang === settings.targetLanguage}>
                {LANGUAGE_LABELS[lang]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-28 text-sm text-gray-600">字幕字号</label>
          <select
            className="border border-gray-300 rounded px-3 py-1.5 text-sm bg-white"
            value={settings.subtitleFontSize}
            onChange={e => onChange({ subtitleFontSize: e.target.value as UserSettings['subtitleFontSize'] })}
          >
            {FONT_SIZES.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="w-28 text-sm text-gray-600">颜色标注</label>
          <button
            type="button"
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              settings.colorAnnotationEnabled ? 'bg-blue-500' : 'bg-gray-300'
            }`}
            onClick={() => onChange({ colorAnnotationEnabled: !settings.colorAnnotationEnabled })}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.colorAnnotationEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </section>
  )
}
