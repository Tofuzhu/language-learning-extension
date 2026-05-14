# Language Learning Extension — Plan 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a working Chrome extension skeleton with local multi-profile system and settings page (language selection), so Plan 2 and Plan 3 can build on a stable data layer.

**Architecture:** Vite + CRXJS builds multiple entry points (popup, options, sidepanel, content, background) from a single manifest. Shared types and a Chrome Storage wrapper are the foundation. A profile manager sits on top, isolating each user's vocabulary and settings. The options page lets users configure language pairs and manage profiles.

**Tech Stack:** React 18, TypeScript, Vite 5, CRXJS 2, Tailwind CSS 3, Zustand 5, Vitest

**Spec reference:** `docs/superpowers/specs/2026-05-14-language-learning-extension-design.md` — Phase 0 + Phase 1

---

## File Map

| File | Role |
|------|------|
| `manifest.json` | Extension config, all entry points declared |
| `vite.config.ts` | Vite + CRXJS + Vitest config |
| `src/shared/types.ts` | All TypeScript types + constants (Language, Profile, UserSettings, WordRecord…) |
| `src/shared/storage.ts` | Thin Chrome Storage wrapper (get/set/remove) |
| `src/shared/profile.ts` | Profile CRUD + active profile management |
| `src/shared/messages.ts` | Message type constants for cross-context messaging |
| `src/shared/styles.css` | Tailwind base CSS (imported by all entry points) |
| `src/background/index.ts` | Service Worker stub |
| `src/content/index.tsx` | Content script stub |
| `src/sidepanel/index.html` + `index.tsx` | Side Panel stub |
| `src/popup/index.html` + `index.tsx` + `PopupApp.tsx` | Popup: current profile + switch dropdown + settings link |
| `src/options/index.html` + `index.tsx` + `OptionsPage.tsx` | Options page shell |
| `src/options/components/LanguageSettings/index.tsx` | Target/native language selectors |
| `src/options/components/ProfileManager/index.tsx` | Create/switch/delete profiles |
| `tests/setup.ts` | Chrome API mocks for Vitest |
| `tests/shared/storage.test.ts` | Storage wrapper unit tests |
| `tests/shared/profile.test.ts` | Profile manager unit tests |
| `CLAUDE.md` | Project context for future AI sessions |

---

## Task 1: Initialize Project

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `tsconfig.node.json`, `manifest.json`, `tailwind.config.ts`, `postcss.config.js`

- [ ] **Step 1: Create project directory and initialize**

```bash
cd D:\pythonProject2\Languagelearning
npm create vite@latest language-learning-extension -- --template react-ts
cd language-learning-extension
```

- [ ] **Step 2: Install dependencies**

```bash
npm install zustand
npm install -D @crxjs/vite-plugin@^2.0.0-beta.26 @types/chrome tailwindcss@^3 postcss autoprefixer vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

- [ ] **Step 3: Replace `vite.config.ts`**

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'

export default defineConfig({
  plugins: [
    react(),
    crx({ manifest }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    globals: true,
  },
})
```

- [ ] **Step 4: Replace `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "types": ["chrome", "vitest/globals"]
  },
  "include": ["src", "tests"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 5: Create `manifest.json`**

```json
{
  "manifest_version": 3,
  "name": "Language Learning Extension",
  "version": "0.1.0",
  "description": "Learn languages while watching YouTube",
  "icons": {
    "16": "public/icons/icon16.png",
    "48": "public/icons/icon48.png",
    "128": "public/icons/icon128.png"
  },
  "permissions": ["storage", "activeTab", "scripting", "sidePanel", "contextMenus", "tabs"],
  "host_permissions": [
    "https://www.youtube.com/*",
    "https://translate.googleapis.com/*",
    "https://api.dictionaryapi.dev/*"
  ],
  "action": {
    "default_popup": "src/popup/index.html"
  },
  "options_page": "src/options/index.html",
  "side_panel": {
    "default_path": "src/sidepanel/index.html"
  },
  "background": {
    "service_worker": "src/background/index.ts",
    "type": "module"
  },
  "content_scripts": [
    {
      "matches": ["https://www.youtube.com/watch*"],
      "js": ["src/content/index.tsx"]
    }
  ]
}
```

- [ ] **Step 6: Initialize Tailwind**

```bash
npx tailwindcss init -p
```

Then replace `tailwind.config.js` with:

```typescript
// tailwind.config.ts (rename from .js)
import type { Config } from 'tailwindcss'
export default {
  content: ['./src/**/*.{ts,tsx,html}'],
  theme: { extend: {} },
  plugins: [],
} satisfies Config
```

And update `postcss.config.js`:
```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create placeholder icons (required by manifest)**

```bash
mkdir -p public/icons
# Create 3 simple placeholder PNG files (16x16, 48x48, 128x128)
# Use any image editor or copy a placeholder image
# The extension won't load without these files
```

Create `public/icons/create-icons.js` to generate simple icons programmatically (run once):

```javascript
// public/icons/create-icons.js - run with: node public/icons/create-icons.js
import { createCanvas } from 'canvas'
import { writeFileSync } from 'fs'

for (const size of [16, 48, 128]) {
  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#3B82F6'
  ctx.fillRect(0, 0, size, size)
  ctx.fillStyle = 'white'
  ctx.font = `${size * 0.5}px sans-serif`
  ctx.textAlign = 'center'
  ctx.fillText('L', size / 2, size * 0.7)
  writeFileSync(`public/icons/icon${size}.png`, canvas.toBuffer('image/png'))
}
```

> If `canvas` npm package is unavailable, copy any 3 PNG files and rename them to `icon16.png`, `icon48.png`, `icon128.png`. The content doesn't matter for development.

- [ ] **Step 8: Delete Vite template boilerplate**

```bash
rm -rf src/App.tsx src/App.css src/assets src/main.tsx index.html
```

- [ ] **Step 9: Verify Vite builds without error**

```bash
npm run build
```

Expected: build completes, `dist/` folder is created. Chrome extension files appear in `dist/`.

- [ ] **Step 10: Commit**

```bash
git init
git add .
git commit -m "feat: initialize Vite + CRXJS + React + TypeScript + Tailwind project"
```

---

## Task 2: Global CSS

**Files:**
- Create: `src/shared/styles.css`

- [ ] **Step 1: Create shared Tailwind CSS file**

```css
/* src/shared/styles.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Reset for Chrome extension shadow DOM injection */
* {
  box-sizing: border-box;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/styles.css
git commit -m "feat: add shared Tailwind CSS entry"
```

---

## Task 3: Shared Types

**Files:**
- Create: `src/shared/types.ts`

- [ ] **Step 1: Create types file**

```typescript
// src/shared/types.ts

export type Language = 'en' | 'es' | 'zh'
export type FamiliarityLevel = 0 | 1 | 2 | 3
export type FontSize = 'small' | 'medium' | 'large'
export type TranslationPosition = 'above' | 'below'
export type TranslationProvider = 'youtube' | 'google' | 'microsoft'

export interface UserSettings {
  targetLanguage: Language
  nativeLanguage: Language
  subtitleFontSize: FontSize
  translationPosition: TranslationPosition
  colorAnnotationEnabled: boolean
  translationProvider: TranslationProvider
}

export interface Profile {
  id: string
  name: string
  createdAt: number
  settings: UserSettings
}

export interface ProfileStore {
  activeProfileId: string
  profiles: Profile[]
}

export interface WordRecord {
  id: string               // lowercase word as unique key
  word: string
  translation: string
  familiarity: FamiliarityLevel
  savedAt: number
  lastSeenAt: number
  context: string          // subtitle sentence where word was saved
  videoId: string
  videoTitle: string
}

export interface SubtitleCue {
  index: number
  startTime: number        // seconds
  endTime: number          // seconds
  originalText: string
  translatedText: string
}

export const LANGUAGE_LABELS: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  zh: '中文',
}

export const FAMILIARITY_COLORS: Record<FamiliarityLevel, string> = {
  0: '#EF4444', // red-500  — 陌生
  1: '#EAB308', // yellow-500 — 学习中
  2: '#22C55E', // green-500 — 熟悉 (light green)
  3: 'inherit', // no color — 已掌握
}

export const DEFAULT_SETTINGS: UserSettings = {
  targetLanguage: 'en',
  nativeLanguage: 'zh',
  subtitleFontSize: 'medium',
  translationPosition: 'above',
  colorAnnotationEnabled: true,
  translationProvider: 'youtube',
}

export const PROFILE_LIST_KEY = 'profile_list'

export function wordsKey(profileId: string): string {
  return `words_${profileId}`
}
```

- [ ] **Step 2: Commit**

```bash
git add src/shared/types.ts
git commit -m "feat: add shared TypeScript types and constants"
```

---

## Task 4: Chrome Storage Wrapper (TDD)

**Files:**
- Create: `src/shared/storage.ts`
- Create: `tests/setup.ts`
- Create: `tests/shared/storage.test.ts`

- [ ] **Step 1: Create Vitest Chrome mock setup**

```typescript
// tests/setup.ts
import { vi, beforeEach } from 'vitest'

const mockStorageData: Record<string, unknown> = {}

const mockStorage = {
  get: vi.fn(async (key: string) => {
    return { [key]: mockStorageData[key] }
  }),
  set: vi.fn(async (items: Record<string, unknown>) => {
    Object.assign(mockStorageData, items)
  }),
  remove: vi.fn(async (key: string) => {
    delete mockStorageData[key]
  }),
}

Object.defineProperty(global, 'chrome', {
  value: {
    storage: { local: mockStorage },
    runtime: {
      sendMessage: vi.fn(),
      onMessage: { addListener: vi.fn() },
      onInstalled: { addListener: vi.fn() },
      openOptionsPage: vi.fn(),
    },
    tabs: {
      query: vi.fn(),
      sendMessage: vi.fn(),
    },
  },
  writable: true,
})

beforeEach(() => {
  // Clear storage data between tests
  Object.keys(mockStorageData).forEach(k => delete mockStorageData[k])
  vi.clearAllMocks()
})
```

- [ ] **Step 2: Write failing tests for storage**

```typescript
// tests/shared/storage.test.ts
import { describe, it, expect } from 'vitest'
import { storage } from '../../src/shared/storage'

describe('storage', () => {
  it('returns null for missing keys', async () => {
    const result = await storage.get('nonexistent')
    expect(result).toBeNull()
  })

  it('stores and retrieves a value', async () => {
    await storage.set('test_key', { foo: 'bar' })
    const result = await storage.get<{ foo: string }>('test_key')
    expect(result).toEqual({ foo: 'bar' })
  })

  it('overwrites an existing value', async () => {
    await storage.set('key', 1)
    await storage.set('key', 2)
    expect(await storage.get<number>('key')).toBe(2)
  })

  it('removes a key', async () => {
    await storage.set('to_remove', 42)
    await storage.remove('to_remove')
    expect(await storage.get('to_remove')).toBeNull()
  })

  it('removing a non-existent key does not throw', async () => {
    await expect(storage.remove('ghost')).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 3: Run tests — expect FAIL**

```bash
npx vitest run tests/shared/storage.test.ts
```

Expected: FAIL — "Cannot find module '../../src/shared/storage'"

- [ ] **Step 4: Implement storage wrapper**

```typescript
// src/shared/storage.ts
export const storage = {
  async get<T>(key: string): Promise<T | null> {
    const result = await chrome.storage.local.get(key)
    return (result[key] as T) ?? null
  },

  async set<T>(key: string, value: T): Promise<void> {
    await chrome.storage.local.set({ [key]: value })
  },

  async remove(key: string): Promise<void> {
    await chrome.storage.local.remove(key)
  },
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npx vitest run tests/shared/storage.test.ts
```

Expected: PASS — 5 tests pass

- [ ] **Step 6: Commit**

```bash
git add src/shared/storage.ts tests/setup.ts tests/shared/storage.test.ts
git commit -m "feat: add Chrome Storage wrapper with unit tests"
```

---

## Task 5: Profile Manager — Read & Create (TDD)

**Files:**
- Create: `src/shared/profile.ts`
- Create: `tests/shared/profile.test.ts`

- [ ] **Step 1: Write failing tests for getStore and createProfile**

```typescript
// tests/shared/profile.test.ts
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
    expect(store1.profiles).toHaveLength(store2.profiles.length)
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

  it('new profile inherits default settings', async () => {
    await profileManager.getStore()
    const profile = await profileManager.createProfile('王五')
    expect(profile.settings.targetLanguage).toBe('en')
    expect(profile.settings.colorAnnotationEnabled).toBe(true)
  })

  it('new profile has a unique id', async () => {
    await profileManager.getStore()
    const p1 = await profileManager.createProfile('A')
    const p2 = await profileManager.createProfile('B')
    expect(p1.id).not.toBe(p2.id)
  })
})
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run tests/shared/profile.test.ts
```

Expected: FAIL — "Cannot find module '../../src/shared/profile'"

- [ ] **Step 3: Implement profile.ts — getStore + createProfile**

```typescript
// src/shared/profile.ts
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

export const profileManager = {
  getStore,
  createProfile,
}
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npx vitest run tests/shared/profile.test.ts
```

Expected: PASS — 7 tests pass

- [ ] **Step 5: Commit**

```bash
git add src/shared/profile.ts tests/shared/profile.test.ts
git commit -m "feat: profile manager — getStore and createProfile with tests"
```

---

## Task 6: Profile Manager — Switch, Update, Delete (TDD)

**Files:**
- Modify: `src/shared/profile.ts`
- Modify: `tests/shared/profile.test.ts`

- [ ] **Step 1: Add failing tests**

Append to `tests/shared/profile.test.ts`:

```typescript
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
    expect(profile.settings.nativeLanguage).toBe('zh')     // unchanged
    expect(profile.settings.colorAnnotationEnabled).toBe(true) // unchanged
  })

  it('only updates the target profile, not others', async () => {
    await profileManager.getStore()
    const extra = await profileManager.createProfile('另一个')
    const store = await profileManager.getStore()
    const defaultId = store.profiles[0].id
    await profileManager.updateSettings(extra.id, { targetLanguage: 'es' })
    const updated = await profileManager.getStore()
    const defaultProfile = updated.profiles.find(p => p.id === defaultId)!
    expect(defaultProfile.settings.targetLanguage).toBe('en') // unchanged
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
```

- [ ] **Step 2: Run tests — expect FAIL**

```bash
npx vitest run tests/shared/profile.test.ts
```

Expected: FAIL — "profileManager.switchProfile is not a function" (and similar)

- [ ] **Step 3: Complete profile.ts**

Replace `src/shared/profile.ts` with:

```typescript
// src/shared/profile.ts
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
```

- [ ] **Step 4: Run all tests — expect PASS**

```bash
npx vitest run
```

Expected: PASS — all tests pass (storage + profile)

- [ ] **Step 5: Commit**

```bash
git add src/shared/profile.ts tests/shared/profile.test.ts
git commit -m "feat: profile manager — switch, update, rename, delete with tests"
```

---

## Task 7: Messages + Stub Entry Points

**Files:**
- Create: `src/shared/messages.ts`
- Create: `src/background/index.ts`
- Create: `src/content/index.tsx`
- Create: `src/sidepanel/index.html`, `src/sidepanel/index.tsx`

- [ ] **Step 1: Create messages constants**

```typescript
// src/shared/messages.ts
export const MSG = {
  PROFILE_SWITCHED: 'PROFILE_SWITCHED',
  SETTINGS_UPDATED: 'SETTINGS_UPDATED',
  GET_ACTIVE_PROFILE: 'GET_ACTIVE_PROFILE',
  ACTIVE_PROFILE_RESPONSE: 'ACTIVE_PROFILE_RESPONSE',
} as const

export type MessageType = typeof MSG[keyof typeof MSG]

export interface ExtMessage {
  type: MessageType
  payload?: unknown
}
```

- [ ] **Step 2: Create background service worker stub**

```typescript
// src/background/index.ts
import { MSG, type ExtMessage } from '../shared/messages'
import { profileManager } from '../shared/profile'

chrome.runtime.onInstalled.addListener(() => {
  console.log('[LL Extension] Installed')
})

chrome.runtime.onMessage.addListener((msg: ExtMessage, _sender, sendResponse) => {
  if (msg.type === MSG.GET_ACTIVE_PROFILE) {
    profileManager.getActiveProfile().then(profile => {
      sendResponse({ type: MSG.ACTIVE_PROFILE_RESPONSE, payload: profile })
    })
    return true // keep message channel open for async response
  }
})
```

- [ ] **Step 3: Create content script stub**

```typescript
// src/content/index.tsx
// Content script — Plan 2 will implement subtitle overlay
console.log('[LL Extension] Content script loaded on YouTube')
```

- [ ] **Step 4: Create Side Panel stub**

```html
<!-- src/sidepanel/index.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>生词本</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

```tsx
// src/sidepanel/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '../shared/styles.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <div className="p-4 text-gray-600">📚 生词本（Plan 3 中实现）</div>
  </React.StrictMode>
)
```

- [ ] **Step 5: Run build to verify all entry points compile**

```bash
npm run build
```

Expected: build succeeds, no TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add src/shared/messages.ts src/background/index.ts src/content/index.tsx src/sidepanel/
git commit -m "feat: add message constants and stub entry points"
```

---

## Task 8: Popup UI

**Files:**
- Create: `src/popup/index.html`, `src/popup/index.tsx`, `src/popup/PopupApp.tsx`

- [ ] **Step 1: Create popup HTML**

```html
<!-- src/popup/index.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <title>Language Learning</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create popup entry**

```tsx
// src/popup/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '../shared/styles.css'
import { PopupApp } from './PopupApp'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PopupApp />
  </React.StrictMode>
)
```

- [ ] **Step 3: Create PopupApp component**

```tsx
// src/popup/PopupApp.tsx
import { useEffect, useState } from 'react'
import { profileManager } from '../shared/profile'
import { LANGUAGE_LABELS, type Profile, type ProfileStore } from '../shared/types'
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
    // Notify active YouTube tab to reload profile
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
      {/* Header: current profile */}
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

      {/* Language pair */}
      <div className="text-xs text-gray-500 mb-4">
        {LANGUAGE_LABELS[active.settings.targetLanguage]} → {LANGUAGE_LABELS[active.settings.nativeLanguage]}
      </div>

      {/* Actions */}
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
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
```

Expected: no errors

- [ ] **Step 5: Load extension in Chrome for visual check**
  1. Open `chrome://extensions`
  2. Enable "Developer mode"
  3. Click "Load unpacked" → select `dist/` folder
  4. Click the extension icon
  5. Verify: popup shows "👤 默认用户", language pair "English → 中文", "⚙️ 设置" button

- [ ] **Step 6: Commit**

```bash
git add src/popup/
git commit -m "feat: add popup with profile switcher"
```

---

## Task 9: Options — LanguageSettings Component

**Files:**
- Create: `src/options/components/LanguageSettings/index.tsx`

- [ ] **Step 1: Create LanguageSettings component**

```tsx
// src/options/components/LanguageSettings/index.tsx
import { LANGUAGE_LABELS, type Language, type UserSettings } from '../../../shared/types'

const LANGUAGES: Language[] = ['en', 'es', 'zh']
const FONT_SIZES = [
  { value: 'small', label: '小' },
  { value: 'medium', label: '中' },
  { value: 'large', label: '大' },
] as const

interface Props {
  settings: UserSettings
  onChange: (updates: Partial<UserSettings>) => void
}

export function LanguageSettings({ settings, onChange }: Props) {
  return (
    <section>
      <h2 className="text-base font-semibold text-gray-700 mb-3">语言设置</h2>
      <div className="space-y-3">

        {/* Target language */}
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

        {/* Native language */}
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

        {/* Subtitle font size */}
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

        {/* Color annotation toggle */}
        <div className="flex items-center gap-4">
          <label className="w-28 text-sm text-gray-600">颜色标注</label>
          <button
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
```

- [ ] **Step 2: Build to verify no TypeScript errors**

```bash
npm run build
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/options/components/LanguageSettings/
git commit -m "feat: add LanguageSettings component for options page"
```

---

## Task 10: Options — ProfileManager Component

**Files:**
- Create: `src/options/components/ProfileManager/index.tsx`

- [ ] **Step 1: Create ProfileManager component**

```tsx
// src/options/components/ProfileManager/index.tsx
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

      {/* Profile list */}
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
                  : (
                    <button
                      onClick={() => handleSwitch(profile.id)}
                      className="text-xs text-blue-600 hover:underline"
                    >切换</button>
                  )
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

      {/* Create new profile */}
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
```

- [ ] **Step 2: Build to verify**

```bash
npm run build
```

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/options/components/ProfileManager/
git commit -m "feat: add ProfileManager component for options page"
```

---

## Task 11: Options Page — Shell + Wire Together

**Files:**
- Create: `src/options/index.html`, `src/options/index.tsx`, `src/options/OptionsPage.tsx`

- [ ] **Step 1: Create options HTML**

```html
<!-- src/options/index.html -->
<!DOCTYPE html>
<html lang="zh">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Language Learning — 设置</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="./index.tsx"></script>
</body>
</html>
```

- [ ] **Step 2: Create options entry**

```tsx
// src/options/index.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import '../shared/styles.css'
import { OptionsPage } from './OptionsPage'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <OptionsPage />
  </React.StrictMode>
)
```

- [ ] **Step 3: Create OptionsPage**

```tsx
// src/options/OptionsPage.tsx
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
        {saved && (
          <span className="text-sm text-green-600 font-medium">✓ 已保存</span>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Run full build + all tests**

```bash
npm run build && npx vitest run
```

Expected: build succeeds, all tests pass

- [ ] **Step 5: Manual verification in Chrome**
  1. Reload extension at `chrome://extensions`
  2. Click extension icon → click "⚙️ 设置" → options page opens
  3. Verify language dropdowns show English/Español/中文, cannot select same language for both
  4. Toggle "颜色标注" switch — it animates
  5. Create a new profile "测试用户" → appears in list
  6. Switch to "测试用户" → marked as "当前"
  7. Switch back to "默认用户"
  8. Delete "测试用户" → disappears
  9. Click "保存设置" → "✓ 已保存" appears
  10. Close and reopen options → settings persisted

- [ ] **Step 6: Commit**

```bash
git add src/options/
git commit -m "feat: add options page with language settings and profile manager"
```

---

## Task 12: CLAUDE.md — Project Context File

**Files:**
- Create: `CLAUDE.md`

- [ ] **Step 1: Create CLAUDE.md at project root**

```markdown
# Language Learning Extension

Chrome extension for language learning on YouTube. Replicates core Language Reactor features.

## Spec & Plans

- **Spec:** `docs/superpowers/specs/2026-05-14-language-learning-extension-design.md`
- **Plan 1 (Foundation):** `docs/superpowers/plans/2026-05-14-plan1-foundation.md` ✅ Complete
- **Plan 2 (Subtitles):** `docs/superpowers/plans/2026-05-14-plan2-subtitles.md`
- **Plan 3 (Vocabulary):** `docs/superpowers/plans/2026-05-14-plan3-vocabulary.md`

## Tech Stack

- React 18 + TypeScript + Vite 5 + CRXJS 2 + Tailwind CSS 3
- Manifest V3, Chrome Storage (local)
- Zustand for state management

## Entry Points

| Entry | Path | Purpose |
|-------|------|---------|
| Popup | `src/popup/` | Profile switch + settings shortcut |
| Options | `src/options/` | Language settings + profile manager |
| Side Panel | `src/sidepanel/` | Vocabulary library (Plan 3) |
| Content | `src/content/` | YouTube subtitle overlay (Plan 2) |
| Background | `src/background/` | Translation API + message routing |

## Key Abstractions

- `profileManager` (`src/shared/profile.ts`) — all profile CRUD
- `storage` (`src/shared/storage.ts`) — Chrome Storage wrapper
- Storage key pattern: `profile_list` (ProfileStore), `words_{profileId}` (WordRecord[])

## Languages Supported (MVP)

English (`en`), Spanish (`es`), Chinese (`zh`)

## Development Commands

```bash
npm run dev      # dev build with HMR
npm run build    # production build → dist/
npx vitest run   # run all tests
```

## Loading Extension

1. `npm run build`
2. `chrome://extensions` → Developer mode → Load unpacked → select `dist/`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add CLAUDE.md with project context for future AI sessions"
```

---

## Final Verification Checklist

- [ ] `npx vitest run` — all tests pass (storage + profile)
- [ ] `npm run build` — no TypeScript errors
- [ ] Extension loads in Chrome without errors in `chrome://extensions`
- [ ] Popup shows current profile + language pair
- [ ] Popup profile switcher works
- [ ] Settings button opens options page
- [ ] Language selectors prevent selecting same language for both fields
- [ ] Color annotation toggle animates correctly
- [ ] Profile create / rename / delete / switch all work in options page
- [ ] Settings persist after closing and reopening options page

---

---

## ✅ Plan 1 完成记录

**完成日期：** 2026-05-14  
**最终测试：** 20 个单元测试全部通过  
**Git 提交数：** 8 次提交，历史干净  
**构建状态：** `npm run build` 通过，`dist/` 生成正常

### 实际交付 vs 计划偏差
- Task 1 执行过程中修复了 `tsconfig.json` 项目引用问题和 `tsconfig.app.json` 缺少 `strict: true` 的问题（代码质量审查发现）
- `vite.config.ts` 使用 `vitest/config` 的 `defineConfig` 替代 `vite` 的 `defineConfig`（兼容 Vitest 配置块）
- 其余均按计划完成，无范围变更

### 遗留事项（带入 Plan 2）
1. `PopupApp` 和 `OptionsPage` 缺少 Chrome Storage 加载失败的错误状态
2. `OptionsPage.handleSave` 存在档案切换后未保存的边界情况，待 Zustand 引入后修正
3. Content Script 仅为 stub，YouTube 页面无任何功能 — Plan 2 核心目标

*Plan version: 1.0 · 完成于 2026-05-14 · 下一步: Plan 2 (字幕+播放控制)*
