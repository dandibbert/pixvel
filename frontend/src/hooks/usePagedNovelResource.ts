import { useCallback, useEffect, useRef, useState } from 'react'
import type { Novel } from '../types/novel'
import { normalizeOptionalPage } from '../utils/pageInput'

export interface PagedNovelResponse<TResource> {
  resource: TResource
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
}

export interface PagedNovelState<TResource> {
  resource: TResource | null
  novels: Novel[]
  page: number
  nextPage: number | null
  hasMore: boolean
  isLoading: boolean
  error: string | null
}

interface UsePagedNovelResourceOptions<TResource> {
  resourceId: string | undefined
  fetchPage: (page: number) => Promise<PagedNovelResponse<TResource>>
  getErrorMessage: (error: unknown) => string
}

export function createEmptyPagedNovelState<TResource>(): PagedNovelState<TResource> {
  return {
    resource: null,
    novels: [],
    page: 1,
    nextPage: null,
    hasMore: false,
    isLoading: false,
    error: null,
  }
}

export function mergePagedNovelResponse<TResource>(
  state: PagedNovelState<TResource>,
  response: PagedNovelResponse<TResource>,
): PagedNovelState<TResource> {
  return {
    ...state,
    resource: response.resource,
    novels: response.page === 1 ? response.novels : [...state.novels, ...response.novels],
    page: response.page,
    nextPage: normalizeOptionalPage(response.nextPage),
    hasMore: response.hasMore,
    isLoading: false,
    error: null,
  }
}

export function buildPagedNovelLoadingState<TResource>(
  state: PagedNovelState<TResource>,
): PagedNovelState<TResource> {
  return {
    ...state,
    isLoading: true,
    error: null,
  }
}

export function buildPagedNovelErrorState<TResource>(
  state: PagedNovelState<TResource>,
  errorMessage: string,
): PagedNovelState<TResource> {
  return {
    ...state,
    isLoading: false,
    error: errorMessage,
  }
}

export function getNextPagedNovelPage<TResource>(
  state: PagedNovelState<TResource>,
): number | null {
  if (!state.hasMore) return null
  return state.nextPage ?? state.page + 1
}

export function buildPagedNovelLoadMoreState<TResource>(
  state: PagedNovelState<TResource>,
): PagedNovelState<TResource> {
  const nextPage = getNextPagedNovelPage(state)
  if (state.isLoading || nextPage === null) return state

  return {
    ...state,
    page: nextPage,
  }
}

export function usePagedNovelResource<TResource>({
  resourceId,
  fetchPage,
  getErrorMessage,
}: UsePagedNovelResourceOptions<TResource>) {
  const [state, setState] = useState<PagedNovelState<TResource>>(() =>
    createEmptyPagedNovelState<TResource>(),
  )
  // The resource the fetch effect last loaded for. When resourceId changes,
  // the reset and fetch effects run in the same commit while state.page is
  // still the OLD resource's page — without a guard that fires a doomed
  // request (e.g. page 3 of the new author) that is discarded and refetched.
  const loadedResourceIdRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    setState(createEmptyPagedNovelState<TResource>())
  }, [resourceId])

  useEffect(() => {
    if (!resourceId) return

    // Stale commit between a resource switch and its state reset: skip and
    // let the post-reset run (page 1) do the single fetch. A stale page 1 is
    // equivalent to the post-reset fetch, so it may proceed directly.
    const stateIsStale = loadedResourceIdRef.current !== undefined &&
      loadedResourceIdRef.current !== resourceId
    if (stateIsStale && state.page !== 1) return

    loadedResourceIdRef.current = resourceId

    let isActive = true

    const loadPage = async () => {
      setState(buildPagedNovelLoadingState)

      try {
        const response = await fetchPage(state.page)
        if (!isActive) return
        setState((currentState) => mergePagedNovelResponse(currentState, response))
      } catch (error) {
        if (!isActive) return
        setState((currentState) => buildPagedNovelErrorState(currentState, getErrorMessage(error)))
      }
    }

    loadPage()

    return () => {
      isActive = false
    }
  }, [resourceId, state.page, fetchPage, getErrorMessage])

  const loadMore = useCallback(() => {
    setState(buildPagedNovelLoadMoreState)
  }, [])

  return {
    ...state,
    loadMore,
  }
}
