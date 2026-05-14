# Language Learning Chrome Extension — 需求规格文档

**项目名称**：Language Learning Extension（暂定）  
**日期**：2026-05-14  
**版本**：v1.1  
**阶段**：MVP（Phase 1）

---

## 项目进度总览（2026-05-14 更新）

| 开发计划 | 内容 | 状态 | 完成日期 |
|---------|------|------|---------|
| **Plan 1 — 基础层** | 脚手架 + 档案系统 + 设置页面 | ✅ 已完成 | 2026-05-14 |
| **Plan 2 — 字幕层** | YouTube 字幕抓取 + 双语渲染 + 播放控制 | 🔲 待开发 | — |
| **Plan 3 — 词库层** | 单词颜色标注 + 字典弹窗 + Side Panel | 🔲 待开发 | — |

### Plan 1 已交付内容
- ✅ Chrome 扩展可加载（`npm run build` → `dist/`）
- ✅ 扩展图标弹窗：显示当前档案、语言对、切换档案
- ✅ 设置页面：目标语言/母语选择（英/西/中）、字幕字号、颜色标注开关
- ✅ 本地多档案系统：新建/改名/切换/删除档案，每档案独立存储
- ✅ 单元测试 20 个全部通过（Storage + ProfileManager）
- ✅ CLAUDE.md 上下文文件保障后续 AI 会话连贯性

### ⚠️ 用户注意
**Plan 1 完成后，YouTube 视频页面暂无任何变化，这是预期行为。**  
双语字幕、播放控制、单词点击等功能均在 Plan 2/3 中实现。

---

## 1. 项目概述

复刻 Language Reactor 核心功能，做一个面向 YouTube 的语言学习 Chrome 扩展。用户在观看 YouTube 视频时，可以看到双语字幕、点击单词查看释义、通过快捷键控制播放、并将生词保存到词库中。生词按熟悉度分级，字幕中的单词实时颜色标注，帮助用户直观感受词汇积累的过程。

### 目标用户
- 通过看 YouTube 视频学习外语的成人用户
- 有一定英语基础，希望提升词汇量和听力的学习者

### MVP 范围（Phase 1）
- ✅ 功能 A：双语字幕（YouTube 视频上叠加原文 + 译文）
- ✅ 功能 B：单词字典弹窗（点击单词查释义）
- ✅ 功能 C：播放控制（逐句跳转、重播、自动暂停、变速）
- ✅ 功能 D：生词库 + 熟悉度颜色系统（保存单词、四级标注）
- ✅ 功能 E：设置页面（目标语言、母语设置）
- ✅ 功能 F：本地多档案系统（同一电脑多用户切换）

### 后续阶段（Phase 2，超出本文档范围）
- PhrasePump / 闪卡复习
- Anki 导出
- 云端账户 + 多设备词库同步

---

## 2. 技术架构

### 2.1 技术栈

| 层级 | 技术选型 |
|------|---------|
| 构建工具 | Vite + CRXJS |
| UI 框架 | React 18 + TypeScript |
| 样式 | Tailwind CSS |
| 状态管理 | Zustand |
| 本地存储 | Chrome Storage API（local） |
| 翻译服务 | YouTube 字幕 API → Google Translate 免费接口 → 微软翻译 API |
| 字典接口 | Free Dictionary API（英文）/ 有道词典接口 |
| 扩展规范 | Chrome Manifest V3 |

### 2.2 模块划分

```
Chrome Extension
├── Content Script        # 注入 YouTube 页面，渲染字幕/弹窗/控制栏
├── Background Worker     # Service Worker，处理翻译 API 调用和消息路由
├── Side Panel            # 生词库管理界面（含档案切换入口）
├── Options Page          # 设置页面（语言设置、档案管理）
└── Popup                 # 扩展图标弹窗（开关、当前档案、快捷入口）
```

### 2.3 数据流

```
YouTube 页面加载
    │
    ▼
Content Script 检测视频 → 抓取字幕（timedtext API / DOM 解析）
    │
    ▼
Background Worker 调用翻译接口 → 返回译文
    │
    ▼
Content Script 渲染双语字幕到视频上方
    │
用户点击/右键单词
    ▼
查询 Chrome Storage 获取熟悉度 → 渲染字典弹窗或右键菜单
    │
用户操作（保存/标记）
    ▼
写入 Chrome Storage → Side Panel 实时同步刷新
```

### 2.4 项目文件结构

```
language-learning-extension/
├── manifest.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── src/
│   ├── content/                      # Content Script（注入 YouTube）
│   │   ├── index.tsx                 # React 挂载入口
│   │   ├── components/
│   │   │   ├── SubtitleOverlay/      # 双语字幕叠层
│   │   │   │   ├── index.tsx
│   │   │   │   ├── SubtitleLine.tsx  # 单行字幕（含可点击单词）
│   │   │   │   └── WordToken.tsx     # 单个单词（颜色/右键/点击）
│   │   │   ├── DictionaryPopup/      # 单词字典弹窗
│   │   │   │   └── index.tsx
│   │   │   ├── ContextMenu/          # 右键熟悉度菜单
│   │   │   │   └── index.tsx
│   │   │   └── ControlBar/           # 播放控制栏
│   │   │       └── index.tsx
│   │   ├── hooks/
│   │   │   ├── useSubtitles.ts       # 字幕抓取与解析
│   │   │   ├── usePlayback.ts        # 播放控制逻辑
│   │   │   └── useKeyboard.ts        # 快捷键监听
│   │   └── utils/
│   │       ├── subtitleParser.ts     # 字幕格式解析
│   │       └── wordTokenizer.ts      # 句子拆词
│   ├── sidepanel/                    # Side Panel 词库界面
│   │   ├── index.tsx
│   │   ├── SidePanel.tsx
│   │   └── components/
│   │       ├── WordList/             # 生词列表
│   │       └── SearchBar/            # 搜索筛选
│   ├── background/                   # Service Worker
│   │   ├── index.ts                  # 消息路由入口
│   │   └── translationService.ts     # 翻译 API 调用（含降级逻辑）
│   ├── popup/                        # 扩展图标弹窗
│   │   └── index.tsx
│   ├── options/                      # 设置页面（Options Page）
│   │   ├── index.tsx
│   │   ├── OptionsPage.tsx
│   │   └── components/
│   │       ├── LanguageSettings/     # 语言设置（目标语言 / 母语）
│   │       └── ProfileManager/       # 档案管理（新建/切换/删除）
│   └── shared/                       # 公共模块
│       ├── types.ts                  # 全局 TypeScript 类型
│       ├── storage.ts                # Chrome Storage 封装
│       ├── profile.ts                # 档案读写操作封装
│       └── messages.ts               # 消息类型常量
├── public/
│   └── icons/                        # 扩展图标 16/48/128px
└── docs/
    └── superpowers/specs/
        └── 2026-05-14-language-learning-extension-design.md
```

---

## 3. 功能详细规格

### 3.1 功能 A：双语字幕

#### 字幕获取策略（优先级降级）

1. **优先**：拦截 YouTube `timedtext` API 响应，获取原始字幕 XML/JSON
2. **备选**：监听页面 DOM，解析 YouTube 自动渲染的字幕元素
3. **无字幕处理**：若视频完全没有字幕轨道，在控制栏显示提示「该视频无字幕，扩展功能不可用」，不注入字幕叠层
4. **翻译**：Background Worker 调用翻译接口（绕过 CORS 限制）
   - 优先：YouTube 字幕自带译文轨道
   - 降级1：Google Translate 免费接口
   - 降级2：微软翻译 API

#### 字幕渲染

- 字幕叠层覆盖在视频画面底部（不遮挡 YouTube 原生字幕，需隐藏原生字幕）
- 原文字幕：白色，较大字号（18px），每个单词独立包裹为可交互 token
- 译文字幕：浅灰色，较小字号（14px），显示在原文上方
- 字幕背景：半透明黑色圆角框
- 提供「隐藏译文」开关，用于练习听力

#### 字幕导航

- 实时跟随视频播放时间戳高亮当前句
- 支持按句跳转（见播放控制）

---

### 3.2 功能 B：单词字典弹窗

#### 触发方式
- 鼠标左键点击字幕中任意单词
- 弹窗出现在单词附近，不遮挡字幕

#### 弹窗内容
```
┌──────────────────────────────────┐
│  [单词]                   [×]   │
│  /音标/  词性                    │
│  ─────────────────────────────── │
│  释义1（中文）                   │
│  释义2（中文）                   │
│  ─────────────────────────────── │
│  例句（原文）                    │
│  例句（译文）                    │
│  ─────────────────────────────── │
│  🔊 朗读     熟悉度：[●●○○]      │
│  [标记为学习中] [标记为已掌握]   │
└──────────────────────────────────┘
```

#### 数据源
- 英文单词：Free Dictionary API（`https://api.dictionaryapi.dev/api/v2/entries/en/{word}`）— 仅支持英语单词，其他语种降级为仅显示翻译结果
- 中文释义：调用翻译接口补充

#### 关闭方式
- 点击弹窗外区域关闭
- 按 `Esc` 关闭

---

### 3.3 功能 C：播放控制

#### 快捷键（全局监听，仅在 YouTube 视频页面生效）

| 按键 | 功能 |
|------|------|
| `A` | 跳到上一句字幕起始时间 |
| `D` | 跳到下一句字幕起始时间 |
| `S` | 重播当前句（跳回当前句起始时间） |
| `Q` | 开启/关闭自动暂停（每句字幕结束后暂停） |

#### 控制栏 UI
- 固定显示在视频下方（YouTube 控制条上方）
- 包含：上一句 ◄ / 重播 ↺ / 下一句 ► / 速度选择（0.5x / 0.8x / 1x / 1.25x / 1.5x）/ 自动暂停开关

#### 变速播放
- 直接修改 `video.playbackRate`

---

### 3.4 功能 D：生词库 + 熟悉度颜色系统

#### 4.1 熟悉度等级

| 级别 | 标签 | 字幕颜色标注 | 说明 |
|------|------|------------|------|
| 0 | 陌生 | 🔴 红色下划线 | 从未标记的词（默认） |
| 1 | 学习中 | 🟡 黄色高亮背景 | 已保存到生词库 |
| 2 | 熟悉 | 🟢 浅绿色下划线 | 主动标记为熟悉 |
| 3 | 已掌握 | 无标注（默认色）| 标记为已掌握，不再高亮 |

> 注：级别 0（陌生）默认不标注所有词，仅对「曾经出现在字幕中且未保存」的词显示红色下划线，避免整篇字幕全红影响观看体验。具体策略：只有用户右键或点击过的词（产生过交互）才记录为 familiarity=0 并显示红色；完全未交互的词不显示任何标注。

#### 4.2 右键菜单

右键点击字幕中的任意单词，弹出上下文菜单：

```
┌─────────────────────┐
│ 📖 查看释义         │
│ ─────────────────── │
│ 🔴 标记为陌生       │
│ 🟡 加入生词库       │
│ 🟢 标记为熟悉       │
│ ⚪ 标记为已掌握     │
└─────────────────────┘
```

- 当前熟悉度的选项显示勾选状态
- 操作立即写入 Chrome Storage，字幕颜色实时刷新

#### 4.3 生词库数据结构

```typescript
interface WordRecord {
  id: string               // 单词本身（小写）作为唯一键
  word: string             // 原始单词
  translation: string      // 中文释义（保存时记录）
  familiarity: 0 | 1 | 2 | 3
  savedAt: number          // 时间戳
  lastSeenAt: number       // 最近一次出现时间戳
  context: string          // 保存时的字幕原句
  videoId: string          // 来源视频 ID
  videoTitle: string       // 来源视频标题
}
```

#### 4.4 Side Panel 生词库界面

```
┌────────────────────────────────────┐
│  📚 我的生词本              [导出] │
│  🔍 搜索单词...                    │
│  筛选：[全部] [学习中] [熟悉] [掌握]│
│  ─────────────────────────────────│
│  🟡 mad        疯狂的   2026-05-14 │
│  🔴 among      在...之中 2026-05-13│
│  🟢 grief      悲痛      2026-05-12│
│  ─────────────────────────────────│
│  共 3 个词 · 学习中 2 · 熟悉 1    │
└────────────────────────────────────┘
```

- 点击词条可查看详情（释义、例句、来源视频）
- 导出为 CSV 格式（word, translation, familiarity, savedAt）
- 提供「颜色标注总开关」，可全局关闭字幕颜色标注

---

### 3.5 功能 E：设置页面

#### 入口
- 扩展图标弹窗中点击「设置」按钮，打开独立 Options Page（新标签页）
- Side Panel 顶部也提供「设置」快捷入口

#### 语言设置

| 设置项 | 说明 | MVP 支持语言 |
|--------|------|------------|
| 目标语言（学习的语言）| 字幕原文语言 | 英语、西班牙语、中文 |
| 母语（翻译目标语言）| 字幕译文显示语言 | 英语、西班牙语、中文 |

> MVP 确保英语、西班牙语、中文三种语言的字幕抓取和翻译质量，后续版本扩展更多语言。
> 目标语言与母语不能相同，设置时做校验提示。

#### 界面布局

```
┌──────────────────────────────────────────┐
│  ⚙️ 设置                                 │
│  ──────────────────────────────────────  │
│  语言设置                                │
│    我正在学习：  [英语 ▾]               │
│    我的母语：    [中文 ▾]               │
│  ──────────────────────────────────────  │
│  字幕显示                                │
│    字体大小：    [中 ▾]                 │
│    译文位置：    [原文上方 ▾]           │
│    颜色标注：    [开启 ●]               │
│  ──────────────────────────────────────  │
│  翻译服务                                │
│    优先使用：    [YouTube 内置 ▾]       │
│  ──────────────────────────────────────  │
│                          [保存设置]      │
└──────────────────────────────────────────┘
```

#### 设置数据结构

```typescript
interface UserSettings {
  targetLanguage: 'en' | 'es' | 'zh'   // 学习的语言
  nativeLanguage: 'en' | 'es' | 'zh'   // 母语
  subtitleFontSize: 'small' | 'medium' | 'large'
  translationPosition: 'above' | 'below'
  colorAnnotationEnabled: boolean
  translationProvider: 'youtube' | 'google' | 'microsoft'
}
```

---

### 3.6 功能 F：本地多档案系统

#### 设计原则
- 每个档案独立存储：词库、设置、学习进度
- 无需登录注册，纯本地
- Phase 2 升级为云端账户时，档案数据可迁移

#### 档案管理入口
- Popup 弹窗顶部显示当前档案名，点击可切换
- Settings 页面提供完整的档案管理（新建/重命名/删除）

#### Popup 档案切换 UI

```
┌──────────────────────────────┐
│  👤 张三            [切换 ▾] │  ← 当前档案
│  ─────────────────────────── │
│  🟢 扩展已启用               │
│  📚 生词本：42 词            │
│  ─────────────────────────── │
│  [打开生词本]  [⚙️ 设置]     │
└──────────────────────────────┘

切换档案下拉：
┌──────────────────┐
│ ✓ 张三           │
│   李四           │
│   ─────────────  │
│   + 新建档案     │
└──────────────────┘
```

#### 档案数据结构

```typescript
interface Profile {
  id: string            // UUID
  name: string          // 显示名称，如"张三"
  createdAt: number
  settings: UserSettings
}

interface ProfileStore {
  activeProfileId: string
  profiles: Profile[]
}

// Chrome Storage 存储键结构
// profile_list         → ProfileStore（档案列表 + 当前激活）
// words_{profileId}    → WordRecord[]（该档案的词库）
// settings_{profileId} → UserSettings（该档案的设置）
```

#### 档案操作规则
- 首次安装自动创建默认档案「默认用户」
- 删除档案需二次确认，且不能删除当前唯一的档案
- 切换档案后，Content Script 实时读取新档案的词库和设置，重新渲染字幕颜色

---

## 4. Chrome 扩展权限配置

```json
{
  "manifest_version": 3,
  "permissions": [
    "storage",
    "activeTab",
    "scripting",
    "sidePanel",
    "contextMenus",
    "tabs"
  ],
  "host_permissions": [
    "https://www.youtube.com/*",
    "https://translate.googleapis.com/*",
    "https://api.cognitive.microsofttranslator.com/*",
    "https://api.dictionaryapi.dev/*"
  ],
  "content_scripts": [
    {
      "matches": ["https://www.youtube.com/watch*"],
      "js": ["dist/content/index.js"]
    }
  ]
}
```

---

## 5. 上下文连贯性方案

> 针对用户担心的「长开发周期中 AI 上下文丢失导致项目不连贯」问题。

### 方案

1. **本文档为单一事实来源**：所有设计决策记录在此文档，每次新对话开始时读取本文档恢复上下文。
2. **开发计划文档**：由 writing-plans 生成，每个阶段完成后更新完成状态。
3. **CLAUDE.md**：在项目根目录创建 `CLAUDE.md`，记录项目概述、当前阶段、文档位置，每次新会话自动加载。
4. **代码即文档**：关键逻辑加简短注释，减少对 AI 记忆的依赖。

---

## 6. 非功能需求

| 项目 | 要求 |
|------|------|
| 性能 | 字幕渲染延迟 < 100ms，不影响 YouTube 正常播放 |
| 兼容性 | Chrome 120+，Manifest V3 |
| 存储 | Chrome Storage local 上限 5MB，词库超限时提示用户导出 |
| 隐私 | 不收集用户数据，翻译请求不经过自建服务器（直连第三方 API）|

---

## 7. 开发阶段规划（概览）

| 阶段 | 内容 | 对应功能 |
|------|------|---------|
| Phase 0 | 项目脚手架搭建（Vite + CRXJS + React + TypeScript + Tailwind）| 基础 |
| Phase 1 | 本地档案系统 + 设置页面框架（语言选择 + 档案切换）| 功能 E、F |
| Phase 2 | 字幕抓取 + 双语渲染 | 功能 A 核心 |
| Phase 3 | 播放控制栏 + 快捷键 | 功能 C |
| Phase 4 | 单词 Token 化 + 右键菜单 + 熟悉度颜色系统 | 功能 D 核心 |
| Phase 5 | 字典弹窗 + 词义查询接口 | 功能 B |
| Phase 6 | Side Panel 生词库完整界面 | 功能 D 完整 |
| Phase 7 | 翻译降级逻辑 + Popup 完善 + 整体联调 | 收尾 |

> Phase 1 优先于字幕功能，原因：档案和语言设置是所有功能的运行上下文，先建好基础数据层，后续各模块直接读取当前档案设置，避免返工。

---

*文档版本：v1.1 · 作者：用户 + Claude · 日期：2026-05-14*  
*变更记录：v1.1 新增功能 E（设置页面）、功能 F（本地多档案系统），调整开发阶段顺序*
