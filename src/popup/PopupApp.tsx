import { useEffect, useState } from 'react'
import { profileManager } from '../shared/profile'
import { LANGUAGE_LABELS, type ProfileStore } from '../shared/types'
import { MSG } from '../shared/messages'

export function PopupApp() {
  const [store, setStore] = useState<ProfileStore | null>(null)

  useEffect(() => {
    profileManager.getStore().then(setStore)
  }, [])

  const handleSwitch = async (profileId: string) => {
    await profileManager.switchProfile(profileId)
    const updated = await profileManager.getStore()
    setStore(updated)
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tabId = tabs[0]?.id
      if (tabId) {
        chrome.tabs.sendMessage(tabId, { type: MSG.PROFILE_SWITCHED, payload: { profileId } })
          .catch(() => { /* tab may not have content script */ })
      }
    })
  }

  const openSettings = () => chrome.runtime.openOptionsPage()

  if (!store) {
    return <div className="w-56 p-4 text-sm text-gray-400">加载中...</div>
  }

  const active = store.profiles.find(p => p.id === store.activeProfileId)!

  return (
    <div className="w-64 p-4 font-sans bg-white">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-800">👤 {active.name}</span>
        <select
          className="text-xs border border-gray-300 rounded px-1 py-0.5 bg-white"
          value={store.activeProfileId}
          onChange={e => handleSwitch(e.target.value)}
        >
          {store.profiles.map(p => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>
      <div className="text-xs text-gray-500 mb-4">
        {LANGUAGE_LABELS[active.settings.targetLanguage]} → {LANGUAGE_LABELS[active.settings.nativeLanguage]}
      </div>
      <div className="flex gap-2">
        <button
          onClick={openSettings}
          className="flex-1 text-xs bg-blue-500 text-white rounded py-1.5 hover:bg-blue-600 transition-colors"
        >
          ⚙️ 设置
        </button>
      </div>
    </div>
  )
}
