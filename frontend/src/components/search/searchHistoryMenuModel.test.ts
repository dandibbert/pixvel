import { describe, expect, it } from 'vitest'
import type { SearchHistoryEntry } from '../../types/search'
import { buildSearchHistoryEntryMeta } from './searchHistoryMenuModel'

const historyEntry: SearchHistoryEntry = {
  query: '五悠',
  sort: 'date_desc',
  searchTarget: 'keyword',
  bookmarkNum: 1200,
  timestamp: 1,
}

describe('searchHistoryMenuModel', () => {
  it('builds display metadata for a search history entry with bookmark filters', () => {
    expect(
      buildSearchHistoryEntryMeta({
        entry: historyEntry,
        bookmarkSuffix: '收藏',
        formatNumber: (value) => value.toLocaleString('zh-CN'),
        searchTargetLabel: (target) => `target:${target}`,
        sortLabel: (sort) => `sort:${sort}`,
      }),
    ).toEqual({
      query: '五悠',
      targetLabel: 'target:keyword',
      sortLabel: 'sort:date_desc',
      bookmarkLabel: '1,200+收藏',
      removeAriaLabel: '删除 五悠',
    })
  })

  it('omits bookmark metadata when the bookmark filter is empty', () => {
    expect(
      buildSearchHistoryEntryMeta({
        entry: {
          ...historyEntry,
          bookmarkNum: 0,
        },
        bookmarkSuffix: '收藏',
        formatNumber: (value) => value.toString(),
        searchTargetLabel: (target) => target,
        sortLabel: (sort) => sort,
      }).bookmarkLabel,
    ).toBeNull()
  })
})
