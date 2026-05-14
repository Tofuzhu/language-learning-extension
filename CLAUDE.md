# Language Learning Extension

Chrome extension for language learning on YouTube. Replicates core Language Reactor features.

## Spec & Plans

- **Spec:** `../docs/superpowers/specs/2026-05-14-language-learning-extension-design.md`
- **Plan 1 (Foundation):** `../docs/superpowers/plans/2026-05-14-plan1-foundation.md` ✅ Complete
- **Plan 2 (Subtitles):** `../docs/superpowers/plans/2026-05-14-plan2-subtitles.md` ← next
- **Plan 3 (Vocabulary):** `../docs/superpowers/plans/2026-05-14-plan3-vocabulary.md`

## Tech Stack

- React 18 + TypeScript + Vite 5 + CRXJS 2 + Tailwind CSS 3
- Manifest V3, Chrome Storage (local)
- Zustand for state management (added in Plan 2+)

## Entry Points

| Entry | Path | Status |
|-------|------|--------|
| Popup | `src/popup/` | ✅ Done — profile switcher + settings link |
| Options | `src/options/` | ✅ Done — language settings + profile manager |
| Side Panel | `src/sidepanel/` | 🔲 Stub — Plan 3 |
| Content Script | `src/content/` | 🔲 Stub — Plan 2 |
| Background | `src/background/` | 🔲 Stub — Plan 2 |

## Key Abstractions

- `profileManager` (`src/shared/profile.ts`) — all profile CRUD, each profile has its own settings + word store
- `storage` (`src/shared/storage.ts`) — Chrome Storage local wrapper
- Storage key pattern: `profile_list` → ProfileStore, `words_{profileId}` → WordRecord[]
- `MSG` (`src/shared/messages.ts`) — cross-context message type constants

## Languages Supported (MVP)

English (`en`), Spanish (`es`), Chinese (`zh`)

## Development Commands

```bash
npm run dev        # dev build with HMR
npm run build      # production build → dist/
npm run test:run   # run all unit tests (Vitest)
npm run test       # watch mode
```

## Loading Extension in Chrome

1. `npm run build`
2. Open `chrome://extensions`
3. Enable "Developer mode"
4. Click "Load unpacked" → select `dist/` folder
5. Click extension icon to open popup

## Current Test Status

- `tests/shared/storage.test.ts` — 5 tests ✅
- `tests/shared/profile.test.ts` — 15 tests ✅
