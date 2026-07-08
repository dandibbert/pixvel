import { describe, expect, it } from 'vitest'
import type { Novel } from '../types/novel'
import {
  buildPagedCollectionDocumentTitle,
  buildPagedCollectionLoadErrorMessage,
  buildPagedCollectionResourceResponse,
  buildPagedCollectionSubtitle,
} from './pagedNovelCollectionModel'

interface ResourceMeta {
  id: string
  title: string
}

function createNovel(id: string): Novel {
  return {
    id,
    title: `Novel ${id}`,
    description: '',
    author: {
      id: `author-${id}`,
      name: 'Author',
    },
    tags: [],
    pageCount: 1,
    textLength: 1000,
    totalBookmarks: 0,
    totalViews: 0,
    createdAt: '2026-04-26T00:00:00.000Z',
    updatedAt: '2026-04-26T00:00:00.000Z',
  }
}

describe('pagedNovelCollectionModel', () => {
  it('normalizes paged resource responses for the shared resource hook', () => {
    const resource = {
      id: 'resource-1',
      title: 'Resource',
    }
    const novels = [createNovel('1')]

    expect(
      buildPagedCollectionResourceResponse<ResourceMeta>({
        resource,
        novels,
        page: 2,
        nextPage: undefined,
        hasMore: false,
      }),
    ).toEqual({
      resource,
      novels,
      page: 2,
      nextPage: null,
      hasMore: false,
    })
  })

  it('builds loaded and default subtitles from collection counts', () => {
    const formatNumber = (value: number) => `#${value}`

    expect(
      buildPagedCollectionSubtitle({
        count: 3,
        loadedTemplate: '已加载 {count} 篇',
        defaultSubtitle: '浏览全部作品',
        formatNumber,
      }),
    ).toBe('已加载 #3 篇')

    expect(
      buildPagedCollectionSubtitle({
        count: 0,
        loadedTemplate: '已加载 {count} 篇',
        defaultSubtitle: '浏览全部作品',
        formatNumber,
      }),
    ).toBe('浏览全部作品')
  })

  it('builds named and default document titles for resource pages', () => {
    expect(
      buildPagedCollectionDocumentTitle({
        resourceTitle: ' 夏五短篇集 ',
        titleSuffix: ' - Pixvel',
        defaultTitle: '系列 - Pixvel',
      }),
    ).toBe('夏五短篇集 - Pixvel')

    expect(
      buildPagedCollectionDocumentTitle({
        resourceTitle: '',
        titleSuffix: ' - Pixvel',
        defaultTitle: '作者 - Pixvel',
      }),
    ).toBe('作者 - Pixvel')
  })

  it('uses Error messages before falling back to the localized load message', () => {
    expect(buildPagedCollectionLoadErrorMessage(new Error('ERR_LOAD_FAILED'), 'fallback')).toBe('ERR_LOAD_FAILED')
    expect(buildPagedCollectionLoadErrorMessage('bad response', 'fallback')).toBe('fallback')
  })
})
