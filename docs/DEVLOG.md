# 开发日志 — Language Learning Extension

---

## 2026-05-19 — Plan 2 开发（字幕层 + 播放控制）

### 今日目标
完成 Plan 2 的 MVP：在 YouTube 视频上显示双语字幕叠层 + 播放控制。

### 完成的工作

#### 1. Content Script 完整实现
Plan 1 完成后 `src/content/index.tsx` 只是一个 3 行的占位 stub。今天完整实现了：

- **`src/content/index.tsx`** — 等待 `#movie_player` 就绪后挂载 React app，隐藏 YouTube 原生字幕
- **`src/content/components/App.tsx`** — 根组件，处理 YouTube SPA 导航（URL 变化检测）、档案设置读取
- **`src/content/components/SubtitleOverlay/index.tsx`** — Language Reactor 风格 UI（见下）
- **`src/content/hooks/useSubtitles.ts`** — 字幕抓取与解析 hook
- **`src/content/hooks/usePlayback.ts`** — 播放控制 hook（当前句追踪、自动暂停）
- **`src/content/hooks/useKeyboard.ts`** — 快捷键监听（A/S/D/Q）
- **`src/content/utils/subtitleParser.ts`** — JSON3 + XML 双格式解析器
- **`src/content/utils/youtubeHelpers.ts`** — 字幕轨道提取、URL 构建

#### 2. UI 设计
参考目标样图（Language Reactor）复刻：
- 字幕文字浮层在视频画面底部（`bottom: 56px`，不遮挡 YouTube 控制栏）
- 右侧字幕列表面板，当前句蓝色高亮，自动滚动
- 左侧：`‹ ↺ ›` 控制按钮（上一句/重播/下一句）
- 右侧：AP 自动暂停 / 速度选择 / 译文开关 / 面板开关
- 视频左上角显示检测到的字幕语言标签

#### 3. Bug 修复（调试过程）

| Bug | 原因 | 修复 |
|-----|------|------|
| 字幕加载后无显示 | Content Script 运行在隔离 JS 世界，`window.ytInitialPlayerResponse` 不可访问 | 改为解析 `<script>` 标签文本，使用括号匹配算法提取 JSON |
| 字幕解析失败 | 使用 `fmt=ttml`（TTML 格式），但解析器期望 `<text>` XML | 先改 `fmt=3`，后改为更可靠的 `fmt=json3` |
| UI 遮挡 YouTube 控件 | 字幕栏 `bottom: 0` 压在 YouTube 控制栏上 | 改为 `bottom: 56px` |
| Chrome 安全策略拦截 | CRXJS 动态导入 chunk 被 CSP 拦截 | 在 `manifest.json` 添加 `web_accessible_resources: ["assets/*"]` |

#### 4. 单元测试
新增 23 个测试（全部通过），总计 43 个：
- `tests/content/subtitleParser.test.ts` — 9 tests：XML 解析、HTML 实体、cue 合并
- `tests/content/youtubeHelpers.test.ts` — 14 tests：JSON 括号匹配算法、轨道提取、URL 构建

### 当前状态
- ✅ 构建通过（43 tests green, 0 TypeScript errors）  
- ✅ UI 渲染正常（字幕栏、侧边面板可见）
- 🔄 字幕数据加载待验证（JSON3 格式解析）
- 🔲 西语视频（https://www.youtube.com/watch?v=2lfQfnCGepM）测试待完成

### 下次继续
1. 用西语视频验证字幕加载是否正常（F12 Console 查看 `[LL Extension]` 日志）
2. 如字幕仍为空：检查 `fmt=json3` 实际响应格式，可能需要调整解析器
3. 完成 Plan 2 剩余：单词 Token 化（WordToken.tsx）、字典弹窗（Plan 3 前置）

---

## 2026-05-14 — Plan 1 完成（基础层）

- ✅ 项目脚手架（Vite + CRXJS + React + TypeScript + Tailwind）
- ✅ Chrome 扩展可加载（`npm run build` → `dist/`）
- ✅ 扩展弹窗：档案显示、语言对、切换档案
- ✅ 设置页面：目标语言/母语选择、字幕字号、颜色标注开关
- ✅ 本地多档案系统：新建/改名/切换/删除
- ✅ 单元测试 20 个全部通过
