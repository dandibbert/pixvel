# 阅读页详情弹窗复用改造设计

## 概述

当前阅读页顶栏点击后使用独立的 `NovelDetailModal`，而搜索/收藏列表使用 `NovelPreviewModal`。两者在详情内容渲染上已经分叉，导致显示不一致，尤其是 description 的 HTML 解析表现不一致。

本设计目标是在不强行统一外壳交互的前提下，复用核心详情渲染逻辑，消除阅读页与列表页的显示差异。

## 问题与根因

### 现象
- 阅读页详情弹窗存在显示问题（包括 HTML 解析/样式表现差异）。
- 同一小说在不同入口（Reader vs Search/List）弹窗内容表现不一致。

### 根因
- 阅读页使用 `frontend/src/components/novel/NovelDetailModal.tsx`。
- 搜索/收藏页使用 `frontend/src/components/novel/NovelPreviewModal.tsx`。
- 两个组件重复实现了“详情内容区”，且渲染策略不同：
  - `NovelDetailModal` 的 description 以纯文本方式渲染。
  - `NovelPreviewModal` 的 description 以 HTML 渲染。
- 重复实现长期导致字段展示、样式和渲染策略漂移。

## 设计目标

1. Reader 与 Search/List 共享同一套详情内容渲染逻辑。
2. 保留两类弹窗外壳和场景交互差异（例如列表页底部“立即阅读”动作）。
3. 统一 description 渲染策略，修复 HTML 解析/显示不一致。
4. 尽量减少对既有页面行为的改动范围，降低回归风险。

## 方案对比

### 方案 A（推荐）：提取共享详情内容组件
**做法**
- 抽出 `NovelDetailContent`（暂定命名）用于承载：标题、作者、时间、系列、统计、标签、description。
- `NovelPreviewModal` 与 `NovelDetailModal` 均改为复用该内容组件。
- 两个 Modal 保留各自壳层（尺寸、关闭区、底部按钮）。

**优点**
- 核心渲染逻辑单点维护，长期可维护性最佳。
- 对现有页面行为侵入较小。
- 能直接解决当前显示分叉问题。

**缺点**
- 需要对两个弹窗进行结构调整（中等改动）。

### 方案 B：参数化 `NovelPreviewModal`
**做法**
- 将 `NovelPreviewModal` 改成通用可配置弹窗，Reader 通过参数禁用/替换底部交互。

**优点**
- 组件复用率更高。

**缺点**
- 需要重塑 `NovelPreviewModal` 职责，改动面更大。
- 对现有 Search/List 行为回归风险更高。

### 方案 C：仅修补 Reader 的 `NovelDetailModal`
**做法**
- 只在 `NovelDetailModal` 内补齐 HTML 渲染和样式。

**优点**
- 短期改动最小。

**缺点**
- 分叉结构保留，后续仍易再次不一致。
- 不能从结构上解决问题。

## 最终决策

采用**方案 A：提取共享详情内容组件**。

## 目标架构

### 组件分层
1. **详情内容层（共享）**
   - 新增共享内容组件（如 `NovelDetailContent`）。
   - 输入为小说详情数据与必要的交互回调。
   - 统一渲染 description、标签、统计等核心内容。

2. **弹窗外壳层（场景化）**
   - `NovelPreviewModal`：保留列表场景专属底部动作（立即阅读/长按菜单）。
   - `NovelDetailModal`：保留阅读场景的简洁外壳与关闭行为。

## 数据与渲染策略

- 共享组件按 `Novel` / `NovelDetail` 公共字段进行展示。
- description 统一使用与列表页一致的 HTML 渲染策略。
- 对缺省字段维持现有兜底显示策略（不新增额外业务语义）。

## 交互边界

- 不改变阅读页标题点击打开弹窗的入口行为。
- 不改变搜索/收藏页点击卡片打开预览弹窗的入口行为。
- 不改变列表页底部“立即阅读”相关交互。
- 本次仅聚焦“内容区复用与显示一致性”。

## 错误处理与安全考虑

- 继续沿用现有 description HTML 渲染方式，避免在两个弹窗中出现不同策略。
- 不新增远端输入来源，不扩大攻击面。
- 若后续需增强 HTML 安全策略（如统一净化），应在单点共享层实施，避免多处重复。

## 测试与验收

### 手动验收
1. 阅读页顶栏标题打开详情弹窗，description 显示与列表页一致。
2. 搜索页打开详情弹窗，现有展示与交互保持不变。
3. 收藏页打开详情弹窗，现有展示与交互保持不变。
4. 验证标签、统计、时间、作者信息在三处入口一致。

### 自动化验证
- 运行前端测试与构建，确认无编译错误和已有用例回归。

## 变更范围（预估）

- `frontend/src/components/novel/NovelDetailModal.tsx`
- `frontend/src/components/novel/NovelPreviewModal.tsx`
- `frontend/src/components/novel/*`（新增共享详情内容组件）

## 非目标

- 不重做弹窗视觉风格。
- 不重构阅读器分页/刷新逻辑。
- 不调整搜索或收藏业务流程。
