/**
 * Deno KV storage service for session management
 */
import {
  buildHistoryKey,
  buildHistoryPrefix,
  buildPositionKey,
  buildSessionKey,
  buildTimestampedReadingPositionRecord,
  type HistoryEntry,
  type ReadingPositionRecord,
  sortHistoryEntriesByRecency,
} from "./kv_model.ts";
import { applySessionTokenRefresh, type Session } from "./session_model.ts";

export type { HistoryEntry, ReadingPositionRecord } from "./kv_model.ts";
export type { Session } from "./session_model.ts";

const kv = await Deno.openKv();

/**
 * Sessions are refreshed (rewritten) on every token refresh, so active sessions
 * stay alive; abandoned ones expire with the cookie instead of living forever.
 */
const SESSION_EXPIRE_IN_MS = 30 * 24 * 3600 * 1000;

/**
 * Get session from KV store
 * @param sessionId Session ID
 * @returns Session object or null if not found
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await kv.get<Session>(buildSessionKey(sessionId));
  return result.value;
}

/**
 * Store session in KV store
 * @param sessionId Session ID
 * @param session Session object
 */
export async function putSession(sessionId: string, session: Session): Promise<void> {
  await kv.set(buildSessionKey(sessionId), session, { expireIn: SESSION_EXPIRE_IN_MS });
}

/**
 * Delete a session from KV store
 * @param sessionId Session ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await kv.delete(buildSessionKey(sessionId));
}

/**
 * Update tokens in existing session.
 *
 * Uses an atomic versionstamp check so concurrent refreshes (parallel requests
 * or multiple isolates) cannot clobber a newer rotated refresh token with a
 * stale one; the losing writer retries against the fresh session.
 * @param sessionId Session ID
 * @param accessToken New access token
 * @param refreshToken New refresh token
 * @param expiresAt New expiration timestamp
 */
export async function updateTokens(
  sessionId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt: number,
): Promise<void> {
  const key = buildSessionKey(sessionId);
  const maxAttempts = 3;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const entry = await kv.get<Session>(key);
    if (!entry.value) {
      throw new Error("Session not found");
    }

    const updated = applySessionTokenRefresh(entry.value, {
      accessToken,
      refreshToken,
      expiresAt,
    });

    const result = await kv.atomic()
      .check(entry)
      .set(key, updated, { expireIn: SESSION_EXPIRE_IN_MS })
      .commit();

    if (result.ok) return;
  }

  throw new Error("Session update conflicted; please retry");
}

/**
 * Append novel to reading history
 * @param userId User ID
 * @param entry History entry
 */
export async function appendHistory(userId: string, entry: HistoryEntry): Promise<void> {
  await kv.set(buildHistoryKey(userId, entry.novelId), entry);
}

/**
 * Save reading position and history entry in one atomic commit
 * (single KV round trip, no partial-write window).
 * @param userId User ID
 * @param novelId Novel ID
 * @param position Reading position (page number)
 * @param historyEntry Optional history entry to upsert alongside the position
 */
export async function savePositionWithHistory(
  userId: string,
  novelId: number,
  position: number,
  updatedAt?: number,
  historyEntry?: HistoryEntry,
): Promise<void> {
  const atomic = kv.atomic().set(
    buildPositionKey(userId, novelId),
    buildTimestampedReadingPositionRecord({ position, updatedAt }),
  );

  if (historyEntry) {
    atomic.set(buildHistoryKey(userId, historyEntry.novelId), historyEntry);
  }

  await atomic.commit();
}

/**
 * Get reading history for user
 * @param userId User ID
 * @param limit Maximum number of entries
 * @returns Array of history entries sorted by lastReadAt descending
 */
export async function getHistory(userId: string, limit = 50): Promise<HistoryEntry[]> {
  const entries: HistoryEntry[] = [];

  for await (const entry of kv.list<HistoryEntry>({ prefix: buildHistoryPrefix(userId) })) {
    entries.push(entry.value);
  }

  return sortHistoryEntriesByRecency(entries, limit);
}

/**
 * Set reading position for a novel
 * @param userId User ID
 * @param novelId Novel ID
 * @param position Reading position (page number)
 */
export async function setPosition(
  userId: string,
  novelId: number,
  position: number,
  updatedAt?: number,
): Promise<void> {
  await kv.set(
    buildPositionKey(userId, novelId),
    buildTimestampedReadingPositionRecord({ position, updatedAt }),
  );
}

/**
 * Get reading position for a novel
 * @param userId User ID
 * @param novelId Novel ID
 * @returns Position object or null if not found
 */
export async function getPosition(
  userId: string,
  novelId: number,
): Promise<ReadingPositionRecord | null> {
  const result = await kv.get<ReadingPositionRecord>(buildPositionKey(userId, novelId));
  return result.value;
}

/**
 * Series neighbor resolution can cost up to 30 sequential upstream calls in
 * the pagination fallback, and neighbors change rarely — cache for 1h.
 * A `found: false` marker is cached too, so novels without a series don't
 * re-trigger the expensive scan on every request.
 */
const SERIES_RESOLVE_CACHE_TTL_MS = 3600 * 1000;

export interface CachedSeriesResolution<T> {
  found: boolean;
  series: T | null;
}

export function buildSeriesResolveCacheKey(novelId: number): Deno.KvKey {
  return ["series_resolve", novelId.toString()];
}

export async function getCachedSeriesResolution<T>(
  novelId: number,
): Promise<CachedSeriesResolution<T> | null> {
  const result = await kv.get<CachedSeriesResolution<T>>(buildSeriesResolveCacheKey(novelId));
  return result.value;
}

export async function setCachedSeriesResolution<T>(
  novelId: number,
  series: T | null,
): Promise<void> {
  await kv.set(
    buildSeriesResolveCacheKey(novelId),
    { found: series !== null, series } satisfies CachedSeriesResolution<T>,
    { expireIn: SERIES_RESOLVE_CACHE_TTL_MS },
  );
}
