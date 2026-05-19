# Language Learning Extension

Chrome extension for language learning on YouTube. Replicates core Language Reactor features.

---

## 📋 用户使用说明（当前版本 v0.2 — Plan 2 进行中）

### 目前可用的功能

**1. 扩展图标弹窗**
- 点击 Chrome 工具栏中的扩展图标，打开弹窗
- 显示当前档案名称和学习语言对（如 English → 中文）
- 可通过下拉菜单切换不同用户档案

**2. 设置页面**
- 点击弹窗中的「⚙️ 设置」按钮打开
- 设置「我正在学习的语言」和「我的母语」（支持英语/西班牙语/中文）
- 调整字幕字号、颜色标注开关

**3. YouTube 双语字幕叠层（Plan 2 — 开发中）**
- 打开任意有字幕的 YouTube 视频后，扩展自动抓取字幕
- 字幕以原文+译文形式显示在视频画面底部
- 右侧面板显示全部字幕列表，当前句蓝色高亮
- 左侧：`‹ ↺ ›` 上/重播/下句按钮
- 右侧：AP 自动暂停、速度选择、译文开关
- 快捷键：A（上一句）、S（重播）、D（下一句）、Q（自动暂停）

### ⚠️ 已知问题 / 待解决
- 字幕解析正在调试中（已切换到 fmt=json3 格式）
- 西语视频测试中

### 完整功能上线时间表

| 功能 | 计划 | 状态 |
|------|------|------|
| 扩展弹窗 + 设置页面 + 档案系统 | Plan 1 | ✅ 已完成 |
| YouTube 双语字幕叠层 | Plan 2 | 🔄 进行中 |
| 播放控制栏（逐句跳转/重播/变速）| Plan 2 | 🔄 进行中（UI完成，调试中） |
| 单词点击查字典 | Plan 2/3 | 🔲 待开发 |
| 单词颜色熟悉度标注 | Plan 3 | 🔲 待开发 |
| 生词库 Side Panel | Plan 3 | 🔲 待开发 |

---

## Spec & Plans

- **Spec:** `docs/superpowers/specs/2026-05-14-language-learning-extension-design.md`
- **Plan 1 (Foundation):** `docs/superpowers/plans/2026-05-14-plan1-foundation.md` ✅ 完成（2026-05-14）
- **Plan 2 (字幕+播放控制):** 进行中 ← 当前阶段
- **Plan 3 (词库+字典):** 待开发

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
| Content Script | `src/content/` | 🔄 Plan 2 进行中 |
| Background | `src/background/` | ✅ Basic message routing |

## Content Script 架构（Plan 2）

```
src/content/
├── index.tsx                      # 入口：挂载 React 到 #movie_player
├── components/
│   ├── App.tsx                    # 根组件：处理 SPA 导航、状态管理
│   ├── SubtitleOverlay/
│   │   ├── index.tsx              # Language Reactor 风格叠层 UI
│   │   └── SubtitleLine.tsx       # 单行字幕渲染
│   └── ControlBar/
│       └── index.tsx              # 播放控制栏（已合并进 Overlay）
├── hooks/
│   ├── useSubtitles.ts            # 字幕抓取与解析（fmt=json3）
│   ├── usePlayback.ts             # 播放控制：当前句追踪、自动暂停
│   └── useKeyboard.ts             # 快捷键（A/S/D/Q）
└── utils/
    ├── subtitleParser.ts          # JSON3 解析（主）+ XML 解析（备）
    └── youtubeHelpers.ts          # 提取字幕轨道、URL 构建、DOM 工具
```

## Key Abstractions

- `profileManager` (`src/shared/profile.ts`) — all profile CRUD
- `storage` (`src/shared/storage.ts`) — Chrome Storage local wrapper
- `useSubtitles` — 从 ytInitialPlayerResponse 提取轨道，用 fmt=json3 抓取双语字幕
- `usePlayback` — 追踪 currentTime，计算当前句 index，自动暂停
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
5. Open a YouTube video with CC, check for subtitle overlay

## Current Test Status

- `tests/shared/storage.test.ts` — 5 tests ✅
- `tests/shared/profile.test.ts` — 15 tests ✅
- `tests/content/subtitleParser.test.ts` — 9 tests ✅
- `tests/content/youtubeHelpers.test.ts` — 14 tests ✅
- **Total: 43 tests, all passing**

## 字幕抓取技术说明

1. **内容脚本隔离限制**：Content Script 运行在独立 JS 世界，无法直接访问 `window.ytInitialPlayerResponse`
2. **解决方案**：解析页面 `<script>` 标签文本，用括号匹配算法提取 JSON（非正则，更健壮）
3. **字幕格式**：使用 `fmt=json3`（JSON 格式），比 XML 更可靠；XML 作为 fallback
4. **翻译**：使用 YouTube 原生 `&tlang={lang}` 参数获取翻译，无需第三方 API
