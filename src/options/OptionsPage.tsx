import { useEffect, useState } from 'react'
import { profileManager } from '../shared/profile'
import type { ProfileStore, UserSettings } from '../shared/types'
import { LanguageSettings } from './components/LanguageSettings'
import { ProfileManager } from './components/ProfileManager'

export function OptionsPage() {
  const [store, setStore] = useState<ProfileStore | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    profileManager.getStore().then(setStore)
  }, [])

  if (!store) {
    return <div className="p-8 text-gray-400 text-sm">加载中...</div>
  }

  const activeProfile = store.profiles.find(p => p.id === store.activeProfileId)!

  const handleSettingsChange = (updates: Partial<UserSettings>) => {
    setStore(prev => {
      if (!prev) return prev
      return {
        ...prev,
        profiles: prev.profiles.map(p =>
          p.id === prev.activeProfileId
            ? { ...p, settings: { ...p.settings, ...updates } }
            : p
        ),
      }
    })
  }

  const handleSave = async () => {
    await profileManager.updateSettings(activeProfile.id, activeProfile.settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-lg mx-auto p-8">
      <h1 className="text-xl font-bold text-gray-800 mb-6">⚙️ 设置</h1>
      <div className="space-y-6">
        <LanguageSettings
          settings={activeProfile.settings}
          onChange={handleSettingsChange}
        />
        <hr className="border-gray-200" />
        <ProfileManager store={store} onStoreChange={setStore} />
      </div>
      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={handleSave}
          className="bg-blue-500 text-white rounded-lg px-6 py-2 hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          保存设置
        </button>
        {saved && <span className="text-sm text-green-600 font-medium">✓ 已保存</span>}
      </div>
    </div>
  )
}
