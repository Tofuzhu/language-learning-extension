import { describe, it, expect } from 'vitest'
import { profileManager } from '../../src/shared/profile'

describe('profileManager.getStore', () => {
  it('creates a default profile on first call', async () => {
    const store = await profileManager.getStore()
    expect(store.profiles).toHaveLength(1)
    expect(store.profiles[0].name).toBe('默认用户')
    expect(store.activeProfileId).toBe(store.profiles[0].id)
  })

  it('returns the same store on subsequent calls', async () => {
    const store1 = await profileManager.getStore()
    const store2 = await profileManager.getStore()
    expect(store1.activeProfileId).toBe(store2.activeProfileId)
  })

  it('default profile has correct default settings', async () => {
    const store = await profileManager.getStore()
    expect(store.profiles[0].settings.targetLanguage).toBe('en')
    expect(store.profiles[0].settings.nativeLanguage).toBe('zh')
    expect(store.profiles[0].settings.colorAnnotationEnabled).toBe(true)
  })
})

describe('profileManager.createProfile', () => {
  it('adds a new profile', async () => {
    await profileManager.getStore()
    await profileManager.createProfile('张三')
    const store = await profileManager.getStore()
    expect(store.profiles).toHaveLength(2)
    expect(store.profiles[1].name).toBe('张三')
  })

  it('trims whitespace from profile name', async () => {
    await profileManager.getStore()
    const profile = await profileManager.createProfile('  李四  ')
    expect(profile.name).toBe('李四')
  })

  it('new profile has a unique id', async () => {
    await profileManager.getStore()
    const p1 = await profileManager.createProfile('A')
    const p2 = await profileManager.createProfile('B')
    expect(p1.id).not.toBe(p2.id)
  })
})

describe('profileManager.switchProfile', () => {
  it('changes the active profile id', async () => {
    await profileManager.getStore()
    const extra = await profileManager.createProfile('切换目标')
    await profileManager.switchProfile(extra.id)
    const store = await profileManager.getStore()
    expect(store.activeProfileId).toBe(extra.id)
  })

  it('throws when profile id does not exist', async () => {
    await profileManager.getStore()
    await expect(profileManager.switchProfile('nonexistent-id')).rejects.toThrow('not found')
  })
})

describe('profileManager.updateSettings', () => {
  it('updates a single setting without changing others', async () => {
    const store = await profileManager.getStore()
    const id = store.profiles[0].id
    await profileManager.updateSettings(id, { targetLanguage: 'es' })
    const updated = await profileManager.getStore()
    const profile = updated.profiles.find(p => p.id === id)!
    expect(profile.settings.targetLanguage).toBe('es')
    expect(profile.settings.nativeLanguage).toBe('zh')
    expect(profile.settings.colorAnnotationEnabled).toBe(true)
  })

  it('only updates the target profile, not others', async () => {
    await profileManager.getStore()
    const extra = await profileManager.createProfile('另一个')
    const store = await profileManager.getStore()
    const defaultId = store.profiles[0].id
    await profileManager.updateSettings(extra.id, { targetLanguage: 'es' })
    const updated = await profileManager.getStore()
    const defaultProfile = updated.profiles.find(p => p.id === defaultId)!
    expect(defaultProfile.settings.targetLanguage).toBe('en')
  })
})

describe('profileManager.renameProfile', () => {
  it('renames a profile', async () => {
    const store = await profileManager.getStore()
    const id = store.profiles[0].id
    await profileManager.renameProfile(id, '新名字')
    const updated = await profileManager.getStore()
    expect(updated.profiles.find(p => p.id === id)!.name).toBe('新名字')
  })

  it('trims whitespace from new name', async () => {
    const store = await profileManager.getStore()
    const id = store.profiles[0].id
    await profileManager.renameProfile(id, '  trimmed  ')
    const updated = await profileManager.getStore()
    expect(updated.profiles.find(p => p.id === id)!.name).toBe('trimmed')
  })
})

describe('profileManager.deleteProfile', () => {
  it('removes a non-active profile', async () => {
    await profileManager.getStore()
    const extra = await profileManager.createProfile('可删除')
    await profileManager.deleteProfile(extra.id)
    const store = await profileManager.getStore()
    expect(store.profiles.find(p => p.id === extra.id)).toBeUndefined()
  })

  it('throws when deleting the only profile', async () => {
    const store = await profileManager.getStore()
    await expect(profileManager.deleteProfile(store.profiles[0].id)).rejects.toThrow('only profile')
  })

  it('throws when deleting the active profile', async () => {
    await profileManager.getStore()
    await profileManager.createProfile('备用')
    const store = await profileManager.getStore()
    await expect(profileManager.deleteProfile(store.activeProfileId)).rejects.toThrow('active profile')
  })
})
