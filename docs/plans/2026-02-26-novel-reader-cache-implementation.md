# 小说阅读页本地缓存实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 为小说阅读页添加本地缓存，使用 Zustand persist 中间件保留最近 20 本小说的详情、内容和阅读进度，并新增点击标题查看详情弹窗功能。

**Architecture:** 使用 Zustand persist 中间件实现 LRU 缓存策略，缓存结构包含 novelCache（按 novelId 索引）和 cacheOrder（访问顺序数组）。新增 NovelDetailModal 组件用于显示详情弹窗，在 NovelHeader 中添加点击事件和刷新按钮。

**Tech Stack:** React, TypeScript, Zustand, zustand/middleware (persist), Tailwind CSS

---

## Task 1: 添加 readerStore 缓存状态和类型定义

**Files:**
- Modify: `frontend/src/stores/readerStore.ts:1-97`

**Step 1: 导入 persist 中间件**

在文件顶部添加导入：

```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { NovelDetail, NovelPage } from '../types/novel'
```

**Step 2: 添加缓存相关类型定义**

在 `ReaderState` 接口之前添加：

```typescript
interface CachedNovel {
  novel: NovelDetail
  pages: NovelPage[]
  currentPage: number
  timestamp: number
}

interface NovelCache {
  [novelId: string]: CachedNovel
}
```

**Step 3: 扩展 ReaderState 接口**

修改 `ReaderState` 接口，添加缓存相关状态：

```typescript
interface ReaderState {
  novel: NovelDetail | null
  pages: NovelPage[]
  currentPage: number
  totalPages: number
  isLoading: boolean
  error: string | null

  // 缓存相关
  novelCache: NovelCache
  cacheOrder: string[]

  loadNovel: (novelId: string, forceRefresh?: boolean) => Promise<void>
  setPage: (page: number) => void
  nextPage: () => void
  prevPage: () => void
  clearNovel: () => void
  clearError: () => void
  refreshNovel: () => Promise<void>
}
```

**Step 4: 验证类型定义**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过（可能有未实现方法的错误，下一步会实现）

---

## Task 2: 实现 LRU 缓存管理辅助函数

**Files:**
- Modify: `frontend/src/stores/readerStore.ts:22-97`

**Step 1: 添加缓存管理辅助函数**

在 `create` 调用之前添加辅助函数：

```typescript
const MAX_CACHE_SIZE = 20

// 更新缓存顺序（LRU）
const updateCacheOrder = (cacheOrder: string[], novelId: string): string[] => {
  const filtered = cacheOrder.filter(id => id !== novelId)
  return [novelId, ...filtered]
}

// 淘汰最旧的缓存
const evictOldestCache = (novelCache: NovelCache, cacheOrder: string[]): { novelCache: NovelCache; cacheOrder: string[] } => {
  if (cacheOrder.length <= MAX_CACHE_SIZE) {
    return { novelCache, cacheOrder }
  }

  const oldestId = cacheOrder[cacheOrder.length - 1]
  const newCache = { ...novelCache }
  delete newCache[oldestId]
  const newOrder = cacheOrder.slice(0, -1)

  return { novelCache: newCache, cacheOrder: newOrder }
}
```

**Step 2: 验证辅助函数**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

---

## Task 3: 重构 readerStore 使用 persist 中间件

**Files:**
- Modify: `frontend/src/stores/readerStore.ts:22-97`

**Step 1: 修改 store 创建使用 persist**

将现有的 `create` 调用包装在 `persist` 中：

```typescript
export const useReaderStore = create<ReaderState>()(
  persist(
    (set, get) => ({
      novel: null,
      pages: [],
      currentPage: 1,
      totalPages: 0,
      isLoading: false,
      error: null,
      novelCache: {},
      cacheOrder: [],

      // 方法实现将在后续步骤添加
      loadNovel: async (novelId: string, forceRefresh = false) => {
        // 临时空实现
      },

      setPage: (page) => {
        const { totalPages, novel } = get()
        if (page >= 1 && page <= totalPages) {
          set({ currentPage: page })

          // 更新缓存中的阅读进度
          if (novel) {
            const { novelCache } = get()
            const cached = novelCache[novel.id]
            if (cached) {
              set({
                novelCache: {
                  ...novelCache,
                  [novel.id]: { ...cached, currentPage: page, timestamp: Date.now() }
                }
              })
            }
          }
        }
      },

      nextPage: () => {
        const { currentPage, totalPages } = get()
        if (currentPage < totalPages) {
          get().setPage(currentPage + 1)
        }
      },

      prevPage: () => {
        const { currentPage } = get()
        if (currentPage > 1) {
          get().setPage(currentPage - 1)
        }
      },

      clearNovel: () =>
        set({
          novel: null,
          pages: [],
          currentPage: 1,
          totalPages: 0,
        }),

      clearError: () => set({ error: null }),

      refreshNovel: async () => {
        const { novel } = get()
        if (novel) {
          await get().loadNovel(novel.id, true)
        }
      },
    }),
    {
      name: 'reader-cache-storage',
      partialize: (state) => ({
        novelCache: state.novelCache,
        cacheOrder: state.cacheOrder,
      }),
    }
  )
)
```

**Step 2: 验证基本结构**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

---

## Task 4: 实现带缓存的 loadNovel 方法

**Files:**
- Modify: `frontend/src/stores/readerStore.ts` (loadNovel 方法)

**Step 1: 实现完整的 loadNovel 逻辑**

替换临时的 `loadNovel` 实现：

```typescript
loadNovel: async (novelId: string, forceRefresh = false) => {
  try {
    set({ isLoading: true, error: null })

    // 检查缓存（除非强制刷新）
    if (!forceRefresh) {
      const { novelCache, cacheOrder } = get()
      const cached = novelCache[novelId]

      if (cached) {
        // 缓存命中，直接使用
        set({
          novel: cached.novel,
          pages: cached.pages,
          currentPage: cached.currentPage,
          totalPages: cached.pages.length,
          isLoading: false,
          cacheOrder: updateCacheOrder(cacheOrder, novelId),
          novelCache: {
            ...novelCache,
            [novelId]: { ...cached, timestamp: Date.now() }
          }
        })
        return
      }
    }

    // 缓存未命中或强制刷新，请求 API
    const [novelDetail, contentResponse] = await Promise.all([
      api.get<NovelDetail>(`/novels/${novelId}`),
      api.get<{ content: string; novelId?: number }>(`/novels/${novelId}/content`),
    ])

    if (!contentResponse.content) {
      throw new Error('ERR_READER_CONTENT_EMPTY')
    }

    const pageTexts = splitByNewpage(contentResponse.content)
    const pages: NovelPage[] = pageTexts.map((text, index) => ({
      page: index + 1,
      content: text,
    }))

    // 更新缓存
    const { novelCache, cacheOrder } = get()
    const newCacheOrder = updateCacheOrder(cacheOrder, novelId)
    const newCachedNovel: CachedNovel = {
      novel: novelDetail,
      pages,
      currentPage: 1,
      timestamp: Date.now()
    }

    let updatedCache = {
      ...novelCache,
      [novelId]: newCachedNovel
    }
    let updatedOrder = newCacheOrder

    // 淘汰旧缓存
    if (updatedOrder.length > MAX_CACHE_SIZE) {
      const evicted = evictOldestCache(updatedCache, updatedOrder)
      updatedCache = evicted.novelCache
      updatedOrder = evicted.cacheOrder
    }

    set({
      novel: novelDetail,
      pages,
      totalPages: pages.length,
      currentPage: 1,
      isLoading: false,
      novelCache: updatedCache,
      cacheOrder: updatedOrder
    })
  } catch (error) {
    console.error('Load novel error:', error)
    set({
      error: error instanceof Error ? error.message : 'ERR_READER_LOAD_FAILED',
      isLoading: false,
    })
  }
},
```

**Step 2: 验证实现**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

**Step 3: 提交更改**

```bash
git add frontend/src/stores/readerStore.ts
git commit -m "feat(reader): add cache support with LRU strategy"
```

---

## Task 5: 创建 NovelDetailModal 组件

**Files:**
- Create: `frontend/src/components/novel/NovelDetailModal.tsx`

**Step 1: 创建基础 Modal 组件**

```typescript
import { NovelDetail } from '../../types/novel'
import { useI18n } from '../../i18n/useI18n'

interface NovelDetailModalProps {
  novel: NovelDetail
  isOpen: boolean
  onClose: () => void
}

export default function NovelDetailModal({ novel, isOpen, onClose }: NovelDetailModalProps) {
  const { t } = useI18n()

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 关闭按钮 */}
        <div className="sticky top-0 bg-white border-b border-muted p-4 flex justify-between items-center">
          <h2 className="text-lg font-bold">{t('reader.novelDetails')}</h2>
          <button
            onClick={onClose}
            className="text-foreground/40 hover:text-foreground p-2 rounded-lg hover:bg-muted transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 内容区域 */}
        <div className="p-6 space-y-6">
          {/* 封面和基本信息 */}
          <div className="flex gap-4">
            {novel.coverUrl && (
              <img
                src={novel.coverUrl}
                alt={novel.title}
                className="w-32 h-32 object-cover rounded-lg border-2 border-muted"
              />
            )}
            <div className="flex-1 space-y-2">
              <h3 className="text-xl font-bold">{novel.title}</h3>
              <p className="text-sm text-foreground/60">{novel.author.name}</p>
              <div className="flex gap-4 text-sm text-foreground/60">
                <span>📖 {novel.textLength?.toLocaleString()} {t('common.characters')}</span>
                <span>❤️ {novel.bookmarkCount?.toLocaleString()}</span>
                <span>👁️ {novel.viewCount?.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* 简介 */}
          {novel.description && (
            <div>
              <h4 className="font-bold mb-2">{t('common.description')}</h4>
              <p className="text-sm text-foreground/80 whitespace-pre-wrap">{novel.description}</p>
            </div>
          )}

          {/* 标签 */}
          {novel.tags && novel.tags.length > 0 && (
            <div>
              <h4 className="font-bold mb-2">{t('common.tags')}</h4>
              <div className="flex flex-wrap gap-2">
                {novel.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-muted text-sm rounded-full"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 创建时间 */}
          {novel.createDate && (
            <div className="text-sm text-foreground/60">
              {t('common.created')}: {new Date(novel.createDate).toLocaleDateString()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
```

**Step 2: 验证组件**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

**Step 3: 提交更改**

```bash
git add frontend/src/components/novel/NovelDetailModal.tsx
git commit -m "feat(reader): add novel detail modal component"
```

---

## Task 6: 修改 NovelHeader 添加刷新按钮和标题点击事件

**Files:**
- Modify: `frontend/src/components/novel/NovelHeader.tsx:1-68`

**Step 1: 添加状态和回调 props**

修改 `NovelHeaderProps` 接口和组件：

```typescript
import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { NovelDetail } from '../../types/novel'

interface NovelHeaderProps {
  novel: NovelDetail
  onTitleClick?: () => void
  onRefresh?: () => void
}

export default function NovelHeader({ novel, onTitleClick, onRefresh }: NovelHeaderProps) {
  const navigate = useNavigate()
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false)
        } else {
          setIsVisible(true)
        }
        setLastScrollY(window.scrollY)
      }
    }

    window.addEventListener('scroll', controlNavbar)
    return () => window.removeEventListener('scroll', controlNavbar)
  }, [lastScrollY])

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b-2 border-muted px-4 py-2 md:px-8 transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-4xl mx-auto flex items-center gap-3 md:gap-6">
        <button
          onClick={() => navigate(-1)}
          className="text-foreground/40 hover:text-primary p-2 rounded-lg bg-muted transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1
            className="text-sm md:text-base font-black text-foreground truncate leading-tight tracking-tight cursor-pointer hover:text-primary transition-colors"
            onClick={onTitleClick}
          >
            {novel.title}
          </h1>
          <button
            className="text-[10px] font-black text-primary uppercase tracking-widest truncate hover:text-primary/70 transition-colors"
            onClick={() => navigate(`/author/${novel.author.id}`)}
          >
            {novel.author.name}
          </button>
        </div>

        {/* 刷新按钮 */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-foreground/40 hover:text-primary p-2 rounded-lg bg-muted transition-all"
            title="Refresh"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}

        <button
          onClick={() => navigate('/')}
          className="text-foreground/40 hover:text-primary p-2 rounded-lg bg-muted transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
    </header>
  )
}
```

**Step 2: 验证组件**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

**Step 3: 提交更改**

```bash
git add frontend/src/components/novel/NovelHeader.tsx
git commit -m "feat(reader): add refresh button and title click handler to header"
```

---

## Task 7: 集成 Modal 和刷新功能到 NovelReader

**Files:**
- Modify: `frontend/src/components/novel/NovelReader.tsx:1-87`

**Step 1: 添加导入和状态**

```typescript
import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useReaderStore } from '../../stores/readerStore'
import { useNovelPagination } from '../../hooks/useNovelPagination'
import { NovelSeries } from '../../hooks/useNovelDetail'
import NovelHeader from './NovelHeader'
import NovelContent from './NovelContent'
import NovelPageNav from './NovelPageNav'
import NovelSeriesNav from './NovelSeriesNav'
import NovelDetailModal from './NovelDetailModal'
```

**Step 2: 添加 Modal 状态和处理函数**

在 `NovelReader` 组件中添加：

```typescript
export default function NovelReader({ series }: NovelReaderProps) {
  const navigate = useNavigate()
  const { novel, pages } = useReaderStore()
  const refreshNovel = useReaderStore((state) => state.refreshNovel)
  const { currentPage, totalPages, goToPage, goToNextPage, goToPrevPage } = useNovelPagination()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // ... 现有代码 ...

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshNovel()
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshNovel])

  const handleTitleClick = useCallback(() => {
    setIsModalOpen(true)
  }, [])

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false)
  }, [])

  // ... 现有的 handlePrev, handleNext, useEffect 代码 ...

  if (!novel) {
    return null
  }

  const currentPageContent = pages[currentPage - 1]?.content || ''

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <NovelHeader
        novel={novel}
        onTitleClick={handleTitleClick}
        onRefresh={handleRefresh}
      />
      <NovelSeriesNav series={series} />

      <main className="w-full max-w-4xl mx-auto px-4 md:px-6 pt-12 pb-28 md:pb-32 flex-1">
        <article className="bg-white rounded-xl p-8 md:p-12 lg:p-20 border-b-8 border-muted">
          <NovelContent content={currentPageContent} />
        </article>
      </main>

      <NovelPageNav
        currentPage={currentPage}
        totalPages={totalPages}
        onPrevPage={handlePrev}
        onNextPage={handleNext}
        onGoToPage={goToPage}
        series={series}
      />

      <NovelDetailModal
        novel={novel}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* 刷新提示 */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-lg z-50">
          Refreshing...
        </div>
      )}
    </div>
  )
}
```

**Step 3: 验证集成**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

**Step 4: 提交更改**

```bash
git add frontend/src/components/novel/NovelReader.tsx
git commit -m "feat(reader): integrate detail modal and refresh functionality"
```

---

## Task 8: 添加国际化文本

**Files:**
- Modify: `frontend/src/i18n/locales/en.ts`
- Modify: `frontend/src/i18n/locales/zh.ts`
- Modify: `frontend/src/i18n/locales/ja.ts`

**Step 1: 添加英文翻译**

在 `en.ts` 的 `reader` 部分添加：

```typescript
reader: {
  // ... 现有翻译 ...
  novelDetails: 'Novel Details',
},
common: {
  // ... 现有翻译 ...
  characters: 'characters',
  description: 'Description',
  tags: 'Tags',
  created: 'Created',
}
```

**Step 2: 添加中文翻译**

在 `zh.ts` 的对应部分添加：

```typescript
reader: {
  // ... 现有翻译 ...
  novelDetails: '小说详情',
},
common: {
  // ... 现有翻译 ...
  characters: '字',
  description: '简介',
  tags: '标签',
  created: '创建时间',
}
```

**Step 3: 添加日文翻译**

在 `ja.ts` 的对应部分添加：

```typescript
reader: {
  // ... 现有翻译 ...
  novelDetails: '小説詳細',
},
common: {
  // ... 现有翻译 ...
  characters: '文字',
  description: '説明',
  tags: 'タグ',
  created: '作成日',
}
```

**Step 4: 验证翻译**

Run: `cd frontend && npm run type-check`
Expected: 类型检查通过

**Step 5: 提交更改**

```bash
git add frontend/src/i18n/locales/*.ts
git commit -m "feat(i18n): add translations for novel detail modal"
```

---

## Task 9: 手动测试缓存功能

**Files:**
- N/A (手动测试)

**Step 1: 启动开发服务器**

Run: `cd frontend && npm run dev`
Expected: 开发服务器启动成功

**Step 2: 测试缓存读取**

1. 打开浏览器访问小说阅读页
2. 观察 Network 面板，应该有 API 请求
3. 刷新页面
4. 观察 Network 面板，应该没有新的 API 请求（使用缓存）
5. 检查 localStorage 中的 `reader-cache-storage` 键

Expected: 缓存正常工作，刷新后不重复请求

**Step 3: 测试阅读进度保存**

1. 切换到第 2 页
2. 刷新页面
3. 应该自动恢复到第 2 页

Expected: 阅读进度正确保存和恢复

**Step 4: 测试手动刷新**

1. 点击顶栏的刷新按钮
2. 观察 Network 面板，应该有新的 API 请求
3. 内容应该更新

Expected: 手动刷新正常工作

**Step 5: 测试详情弹窗**

1. 点击顶栏的小说标题
2. 应该弹出详情 Modal
3. 检查显示的信息是否正确
4. 点击遮罩或关闭按钮
5. Modal 应该关闭

Expected: 详情弹窗正常显示和关闭

**Step 6: 测试 LRU 淘汰**

1. 依次打开 21 本不同的小说
2. 检查 localStorage 中的缓存
3. 应该只保留最近 20 本

Expected: LRU 淘汰策略正常工作

**Step 7: 记录测试结果**

创建测试报告文件记录测试结果。

---

## Task 10: 最终验证和文档更新

**Files:**
- Modify: `README.md` (如果需要)

**Step 1: 运行类型检查**

Run: `cd frontend && npm run type-check`
Expected: 无类型错误

**Step 2: 运行构建**

Run: `cd frontend && npm run build`
Expected: 构建成功

**Step 3: 最终提交**

```bash
git add .
git commit -m "feat(reader): complete cache implementation with detail modal

- Add Zustand persist middleware for caching
- Implement LRU strategy (keep 20 most recent novels)
- Cache novel details, content, and reading progress
- Add manual refresh button
- Add novel detail modal on title click
- Add i18n support for new features"
```

**Step 4: 创建 PR（如果需要）**

如果在独立分支工作，创建 Pull Request 合并到主分支。

---

## 总结

实现完成后，小说阅读页将具备：

1. ✅ 本地缓存（使用 Zustand persist）
2. ✅ LRU 策略（保留最近 20 本）
3. ✅ 缓存详情、内容和阅读进度
4. ✅ 手动刷新功能
5. ✅ 点击标题查看详情弹窗
6. ✅ 完整的国际化支持

用户体验改进：
- 刷新页面不再重复请求 API
- 自动恢复阅读进度
- 可以快速查看小说详情
- 支持手动刷新获取最新内容
