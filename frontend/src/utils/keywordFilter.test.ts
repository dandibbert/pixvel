import { describe, expect, it } from 'vitest'
import {
  type KeywordFilterNovelSource,
  buildNovelKeywordCorpus,
  evaluateNovelKeywordMatch,
  matchNovelKeywords,
} from './keywordFilter'

function makeNovel(overrides: Partial<KeywordFilterNovelSource> = {}): KeywordFilterNovelSource {
  return {
    title: 'Test Novel',
    description: 'A <b>great</b> story',
    author: { name: 'Author' },
    tags: ['action', 'comedy', 'romance', 'drama'],
    ...overrides,
  }
}

describe('keywordFilter', () => {
  describe('buildNovelKeywordCorpus', () => {
    it('limits card corpus to first 3 tags but includes all tags in modal corpus', () => {
      const novel = makeNovel({
        tags: ['action', 'comedy', 'romance', 'drama', 'fantasy'],
      })
      const corpus = buildNovelKeywordCorpus(novel)

      expect(corpus.card).toContain('action')
      expect(corpus.card).toContain('comedy')
      expect(corpus.card).toContain('romance')
      expect(corpus.card).not.toContain('drama')
      expect(corpus.card).not.toContain('fantasy')

      expect(corpus.modal).toContain('action')
      expect(corpus.modal).toContain('drama')
      expect(corpus.modal).toContain('fantasy')

      expect(corpus.all).toContain('action')
      expect(corpus.all).toContain('drama')
      expect(corpus.all).toContain('fantasy')
    })

    it('strips HTML from description in both card and modal corpora', () => {
      const novel = makeNovel({
        description: 'Hello <b>World</b> <br/> End',
      })
      const corpus = buildNovelKeywordCorpus(novel)

      expect(corpus.card).toContain('Hello World End')
      expect(corpus.modal).toContain('Hello World End')
      expect(corpus.card).not.toContain('<b>')
      expect(corpus.modal).not.toContain('<b>')
    })

    it('includes author name and series title in corpus', () => {
      const novel = makeNovel({
        author: { name: 'UniqueAuthor' },
        series: { title: 'UniqueSeries' },
      })
      const corpus = buildNovelKeywordCorpus(novel)

      expect(corpus.card).toContain('UniqueAuthor')
      expect(corpus.card).toContain('UniqueSeries')
      expect(corpus.modal).toContain('UniqueAuthor')
      expect(corpus.modal).toContain('UniqueSeries')
    })

    it('handles empty tags and missing optional fields gracefully', () => {
      const novel: KeywordFilterNovelSource = {
        title: 'Minimal',
        description: '',
      }
      const corpus = buildNovelKeywordCorpus(novel)

      expect(corpus.card).toContain('Minimal')
      expect(corpus.modal).toContain('Minimal')
    })
  })

  describe('matchNovelKeywords', () => {
    it('detects blocked words in corpus and marks novel as blocked', () => {
      const corpus = buildNovelKeywordCorpus(
        makeNovel({ title: 'Forbidden Novel' }),
      )
      const result = matchNovelKeywords(corpus, ['forbidden'], [])

      expect(result.isBlocked).toBe(true)
      expect(result.blockedHits).toEqual(['forbidden'])
    })

    it('detects highlight words in corpus', () => {
      const corpus = buildNovelKeywordCorpus(
        makeNovel({ title: 'Awesome Story' }),
      )
      const result = matchNovelKeywords(corpus, [], ['awesome'])

      expect(result.isBlocked).toBe(false)
      expect(result.highlightHits).toEqual(['awesome'])
    })

    it('identifies when highlight word only appears in modal context (tag beyond card limit)', () => {
      const novel = makeNovel({
        tags: ['tag1', 'tag2', 'tag3', 'specialtag'],
      })
      const corpus = buildNovelKeywordCorpus(novel)
      const result = matchNovelKeywords(corpus, [], ['specialtag'])

      expect(result.hasCardHighlight).toBe(false)
      expect(result.hasModalOnlyHighlight).toBe(true)
      expect(result.highlightHits).toEqual(['specialtag'])
    })

    it('identifies when highlight word appears in card context', () => {
      const novel = makeNovel({
        title: 'specialtag novel',
      })
      const corpus = buildNovelKeywordCorpus(novel)
      const result = matchNovelKeywords(corpus, [], ['specialtag'])

      expect(result.hasCardHighlight).toBe(true)
      expect(result.hasModalOnlyHighlight).toBe(false)
    })

    it('deduplicates keyword hits case-insensitively', () => {
      const novel = makeNovel({
        title: 'SPA story',
        tags: ['spa'],
      })
      const corpus = buildNovelKeywordCorpus(novel)
      const result = matchNovelKeywords(corpus, [], ['SPA', 'spa'])

      expect(result.highlightHits).toHaveLength(1)
    })

    it('returns no hits when keywords do not match corpus', () => {
      const corpus = buildNovelKeywordCorpus(
        makeNovel({ title: 'Normal Novel' }),
      )
      const result = matchNovelKeywords(corpus, ['restricted'], ['special'])

      expect(result.isBlocked).toBe(false)
      expect(result.blockedHits).toEqual([])
      expect(result.highlightHits).toEqual([])
      expect(result.hasCardHighlight).toBe(false)
      expect(result.hasModalOnlyHighlight).toBe(false)
    })
  })

  describe('evaluateNovelKeywordMatch', () => {
    it('combines corpus building and keyword matching in one step', () => {
      const novel = makeNovel({
        title: 'Blocked Highlight',
        tags: ['tag1', 'tag2', 'tag3', 'raretag'],
      })
      const result = evaluateNovelKeywordMatch(novel, ['blocked'], ['highlight', 'raretag'])

      expect(result.isBlocked).toBe(true)
      expect(result.blockedHits).toEqual(['blocked'])
      expect(result.highlightHits).toContain('highlight')
      expect(result.highlightHits).toContain('raretag')
      expect(result.hasCardHighlight).toBe(true)
      expect(result.hasModalOnlyHighlight).toBe(false)
    })

    it('detects highlight-only-in-modal when keyword matches 4th tag', () => {
      const novel = makeNovel({
        tags: ['a', 'b', 'c', 'deeptag'],
      })
      const result = evaluateNovelKeywordMatch(novel, [], ['deeptag'])

      expect(result.hasCardHighlight).toBe(false)
      expect(result.hasModalOnlyHighlight).toBe(true)
    })
  })
})
