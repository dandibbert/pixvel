import {
  type NovelKeywordCorpus,
  type NovelKeywordMatchResult,
} from '../types/search'
import { stripHtmlToPlainText } from './htmlText'
import { compactTrimmedStrings } from './stringList'
import { normalizeComparableText } from './textNormalize'

export interface KeywordFilterNovelSource {
  title: string
  description: string
  author?: {
    name?: string
  }
  tags?: string[]
  series?: {
    title?: string
  }
}

const CARD_TAG_LIMIT = 3

function normalizeText(value: string): string {
  return normalizeComparableText(value)
}

function stripHtmlToText(value: string): string {
  return stripHtmlToPlainText(value, {
    tagReplacement: ' ',
    collapseWhitespace: true,
  })
}

function buildCorpus(parts: ReadonlyArray<string | undefined>): string {
  return compactTrimmedStrings(parts).join('\n')
}

function mergeUniqueParts(
  first: ReadonlyArray<string | undefined>,
  second: ReadonlyArray<string | undefined>,
): string[] {
  const merged: string[] = []
  const seen = new Set<string>()

  for (const trimmed of compactTrimmedStrings([...first, ...second])) {
    const key = normalizeText(trimmed)
    if (seen.has(key)) continue

    seen.add(key)
    merged.push(trimmed)
  }

  return merged
}

function collectKeywordHits(corpus: string, words: ReadonlyArray<string>): string[] {
  const corpusLower = normalizeText(corpus)
  const seenWords = new Set<string>()
  const hits: string[] = []

  for (const word of compactTrimmedStrings(words)) {
    const normalizedWord = normalizeText(word)
    if (seenWords.has(normalizedWord)) continue

    seenWords.add(normalizedWord)

    if (corpusLower.includes(normalizedWord)) {
      hits.push(word)
    }
  }

  return hits
}

export function buildNovelKeywordCorpus(novel: KeywordFilterNovelSource): NovelKeywordCorpus {
  const plainDescription = stripHtmlToText(novel.description ?? '')
  const tagList = novel.tags ?? []
  const cardTags = tagList.slice(0, CARD_TAG_LIMIT)

  const cardParts = [
    novel.title,
    novel.author?.name,
    novel.series?.title,
    ...cardTags,
    plainDescription,
  ]

  const modalParts = [
    novel.title,
    novel.author?.name,
    novel.series?.title,
    ...tagList,
    plainDescription,
  ]

  return {
    card: buildCorpus(cardParts),
    modal: buildCorpus(modalParts),
    all: buildCorpus(mergeUniqueParts(cardParts, modalParts)),
  }
}

export function matchNovelKeywords(
  corpus: NovelKeywordCorpus,
  blockedWords: ReadonlyArray<string>,
  highlightWords: ReadonlyArray<string>,
): NovelKeywordMatchResult {
  const blockedHits = collectKeywordHits(corpus.all, blockedWords)
  const highlightHits = collectKeywordHits(corpus.all, highlightWords)
  const hasCardHighlight = collectKeywordHits(corpus.card, highlightWords).length > 0
  const hasModalHighlight = collectKeywordHits(corpus.modal, highlightWords).length > 0

  return {
    isBlocked: blockedHits.length > 0,
    blockedHits,
    highlightHits,
    hasCardHighlight,
    hasModalOnlyHighlight: !hasCardHighlight && hasModalHighlight,
  }
}

export function evaluateNovelKeywordMatch(
  novel: KeywordFilterNovelSource,
  blockedWords: ReadonlyArray<string>,
  highlightWords: ReadonlyArray<string>,
): NovelKeywordMatchResult {
  const corpus = buildNovelKeywordCorpus(novel)
  return matchNovelKeywords(corpus, blockedWords, highlightWords)
}
