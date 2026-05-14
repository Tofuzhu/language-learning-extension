import { useState } from 'react'
import { profileManager } from '../../../shared/profile'
import type { ProfileStore } from '../../../shared/types'

interface Props {
  store: ProfileStore
  onStoreChange: (store: ProfileStore) => void
}

export function ProfileManager({ store, onStoreChange }: Props) {
  const [newName, setNewName] = useState('')
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const refresh = async () => {
    const updated = await profileManager.getStore()
    onStoreChange(updated)
  }

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) { setError('请输入档案名称'); return }
    await profileManager.createProfile(name)
    setNewName('')
    setError('')
    await refresh()
  }

  const handleSwitch = async (profileId: string) => {
    await profileManager.switchProfile(profileId)
    await refresh()
  }

  const handleRename = async (profileId: string) => {
    const name = editName.trim()
    if (!name) { setError('名称不能为空'); return }
    await profileManager.renameProfile(profileId, name)
    setEditingId(null)
    setError('')
    await refresh()
  }

  const handleDelete = async (profileId: string) => {
    if (!window.confirm('确认删除此档案？生词数据将一并删除，无法恢复。')) return
    try {
      await profileManager.deleteProfile(profileId)
      setError('')
      await refresh()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-gray-700 mb-3">档案管理</h2>
      <div className="space-y-2 mb-4">
        {store.profiles.map(profile => (
          <div key={profile.id} className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg">
            {editingId === profile.id ? (
              <>
                <input
                  className="flex-1 border rounded px-2 py-1 text-sm"
                  value={editName}
                  onChange={e => setEditName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleRename(profile.id)}
                  autoFocus
                />
                <button onClick={() => handleRename(profile.id)} className="text-xs text-blue-600 hover:underline">保存</button>
                <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:underline">取消</button>
              </>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium">{profile.name}</span>
                {profile.id === store.activeProfileId
                  ? <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">当前</span>
                  : <button onClick={() => handleSwitch(profile.id)} className="text-xs text-blue-600 hover:underline">切换</button>
                }
                <button
                  onClick={() => { setEditingId(profile.id); setEditName(profile.name) }}
                  className="text-xs text-gray-500 hover:underline"
                >改名</button>
                <button
                  onClick={() => handleDelete(profile.id)}
                  disabled={store.profiles.length <= 1 || profile.id === store.activeProfileId}
                  className="text-xs text-red-500 hover:underline disabled:opacity-30 disabled:cursor-not-allowed"
                >删除</button>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="新档案名称（如：张三）"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleCreate()}
          className="flex-1 border border-gray-300 rounded px-3 py-1.5 text-sm"
        />
        <button
          onClick={handleCreate}
          className="text-sm bg-blue-500 text-white rounded px-4 py-1.5 hover:bg-blue-600 transition-colors whitespace-nowrap"
        >
          + 新建
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </section>
  )
}
