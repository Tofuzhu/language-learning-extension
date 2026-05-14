# Language Learning Extension

Chrome extension for language learning on YouTube. Replicates core Language Reactor features.

---

## 📋 用户使用说明（当前版本 v0.1 — Plan 1 已完成）

### 目前可用的功能

**1. 扩展图标弹窗**
- 点击 Chrome 工具栏中的扩展图标，打开弹窗
- 显示当前档案名称和学习语言对（如 English → 中文）
- 可通过下拉菜单切换不同用户档案

**2. 设置页面**
- 点击弹窗中的「⚙️ 设置」按钮打开
- 设置「我正在学习的语言」和「我的母语」（支持英语/西班牙语/中文）
- 调整字幕字号、颜色标注开关（字幕功能在 Plan 2 实现后生效）
- 管理本地档案：新建、改名、切换、删除

### 目前在 YouTube 上看不到任何变化 — 这是正常的

**YouTube 字幕叠层、单词点击、播放控制栏等功能需要 Plan 2 完成后才会出现。**  
当前 Plan 1 只完成了数据层和设置界面，内容脚本（Content Script）尚未实现。

### 完整功能上线时间表

| 功能 | 计划 | 状态 |
|------|------|------|
| 扩展弹窗 + 设置页面 + 档案系统 | Plan 1 | ✅ 已完成 |
| YouTube 双语字幕叠层 | Plan 2 | 🔲 待开发 |
| 播放控制栏（逐句跳转/重播/变速）| Plan 2 | 🔲 待开发 |
| 单词点击查字典 | Plan 2/3 | 🔲 待开发 |
| 单词颜色熟悉度标注 | Plan 3 | 🔲 待开发 |
| 生词库 Side Panel | Plan 3 | 🔲 待开发 |

---

## Spec & Plans

- **Spec:** `docs/superpowers/specs/2026-05-14-language-learning-extension-design.md`
- **Plan 1 (Foundation):** `docs/superpowers/plans/2026-05-14-plan1-foundation.md` ✅ 完成（2026-05-14）
- **Plan 2 (字幕+播放控制):** `docs/superpowers/plans/2026-05-14-plan2-subtitles.md` ← 下一步
- **Plan 3 (词库+字典):** `docs/superpowers/plans/2026-05-14-plan3-vocabulary.md`

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
