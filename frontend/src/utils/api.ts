import { readStorageItem } from './safeStorage'

type ImportMetaWithApiEnv = ImportMeta & {
  readonly env?: {
    readonly VITE_API_BASE_URL?: string
  }
}

const API_BASE_URL = (import.meta as ImportMetaWithApiEnv).env?.VITE_API_BASE_URL || '/api'

export type QueryParamValue = string | number | boolean | null | undefined
export type QueryParams = Record<string, QueryParamValue>

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface RequestOptions extends RequestInit {
  params?: QueryParams
}

export function buildRequestUrl(
  baseUrl: string,
  endpoint: string,
  params?: QueryParams,
): string {
  let url = `${baseUrl}${endpoint}`
  const queryString = buildQueryString(params)

  if (queryString) {
    url += `?${queryString}`
  }

  return url
}

export function buildQueryString(params?: QueryParams): string {
  if (!params) return ''

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  return searchParams.toString()
}

export function buildRequestHeaders(headers: HeadersInit | undefined, token: string | null): Headers {
  const requestHeaders = new Headers(headers)
  requestHeaders.set('Content-Type', 'application/json')

  if (token) {
    requestHeaders.set('Authorization', `Bearer ${token}`)
  }

  return requestHeaders
}

export function serializeJsonBody(data: unknown): string | undefined {
  return data === undefined ? undefined : JSON.stringify(data)
}

export function readAccessToken(storage: Storage): string | null {
  return readStorageItem(storage, 'accessToken') || null
}

export function readBrowserAccessToken(
  storage: Storage | undefined = typeof localStorage === 'undefined' ? undefined : localStorage,
): string | null {
  if (!storage) {
    return null
  }

  return readAccessToken(storage)
}

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private getAuthToken(): string | null {
    return readBrowserAccessToken()
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { params, headers, ...fetchOptions } = options

    const url = buildRequestUrl(this.baseUrl, endpoint, params)
    const token = this.getAuthToken()
    const requestHeaders = buildRequestHeaders(headers, token)

    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new ApiError(
        response.status,
        response.statusText,
        errorText || 'Request failed'
      )
    }

    if (response.status === 204) {
      return {} as T
    }

    return response.json()
  }

  async get<T>(endpoint: string, params?: QueryParams): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: serializeJsonBody(data),
    })
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: serializeJsonBody(data),
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' })
  }
}

export const api = new ApiClient(API_BASE_URL)
