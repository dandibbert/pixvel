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
  await kv.set(buildSessionKey(sessionId), session);
}

/**
 * Delete a session from KV store
 * @param sessionId Session ID
 */
export async function deleteSession(sessionId: string): Promise<void> {
  await kv.delete(buildSessionKey(sessionId));
}

/**
 * Update tokens in existing session
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
  const session = await getSession(sessionId);
  if (!session) {
    throw new Error("Session not found");
  }

  await putSession(
    sessionId,
    applySessionTokenRefresh(session, {
      accessToken,
      refreshToken,
      expiresAt,
    }),
  );
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
