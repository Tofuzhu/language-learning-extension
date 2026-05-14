import { storage } from './storage'
import {
  DEFAULT_SETTINGS,
  PROFILE_LIST_KEY,
  wordsKey,
  type Profile,
  type ProfileStore,
  type UserSettings,
} from './types'

async function getStore(): Promise<ProfileStore> {
  const existing = await storage.get<ProfileStore>(PROFILE_LIST_KEY)
  if (existing) return existing

  const defaultProfile: Profile = {
    id: crypto.randomUUID(),
    name: '默认用户',
    createdAt: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
  }
  const defaultStore: ProfileStore = {
    activeProfileId: defaultProfile.id,
    profiles: [defaultProfile],
  }
  await storage.set(PROFILE_LIST_KEY, defaultStore)
  return defaultStore
}

async function createProfile(name: string): Promise<Profile> {
  const store = await getStore()
  const newProfile: Profile = {
    id: crypto.randomUUID(),
    name: name.trim(),
    createdAt: Date.now(),
    settings: { ...DEFAULT_SETTINGS },
  }
  await storage.set(PROFILE_LIST_KEY, {
    ...store,
    profiles: [...store.profiles, newProfile],
  })
  return newProfile
}

async function switchProfile(profileId: string): Promise<void> {
  const store = await getStore()
  if (!store.profiles.find(p => p.id === profileId)) {
    throw new Error(`Profile ${profileId} not found`)
  }
  await storage.set(PROFILE_LIST_KEY, { ...store, activeProfileId: profileId })
}

async function updateSettings(profileId: string, updates: Partial<UserSettings>): Promise<void> {
  const store = await getStore()
  await storage.set(PROFILE_LIST_KEY, {
    ...store,
    profiles: store.profiles.map(p =>
      p.id === profileId
        ? { ...p, settings: { ...p.settings, ...updates } }
        : p
    ),
  })
}

async function renameProfile(profileId: string, name: string): Promise<void> {
  const store = await getStore()
  await storage.set(PROFILE_LIST_KEY, {
    ...store,
    profiles: store.profiles.map(p =>
      p.id === profileId ? { ...p, name: name.trim() } : p
    ),
  })
}

async function deleteProfile(profileId: string): Promise<void> {
  const store = await getStore()
  if (store.profiles.length <= 1) {
    throw new Error('Cannot delete the only profile')
  }
  if (store.activeProfileId === profileId) {
    throw new Error('Cannot delete the active profile — switch first')
  }
  await storage.set(PROFILE_LIST_KEY, {
    ...store,
    profiles: store.profiles.filter(p => p.id !== profileId),
  })
  await storage.remove(wordsKey(profileId))
}

async function getActiveProfile(): Promise<Profile> {
  const store = await getStore()
  const profile = store.profiles.find(p => p.id === store.activeProfileId)
  if (!profile) throw new Error('Active profile not found')
  return profile
}

export const profileManager = {
  getStore,
  getActiveProfile,
  createProfile,
  switchProfile,
  updateSettings,
  renameProfile,
  deleteProfile,
}
