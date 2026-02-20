/**
 * Deno KV storage service for session management
 */

export interface Session {
  userId: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

const kv = await Deno.openKv();

/**
 * Get session from KV store
 * @param sessionId Session ID
 * @returns Session object or null if not found
 */
export async function getSession(sessionId: string): Promise<Session | null> {
  const result = await kv.get<Session>(["session", sessionId]);
  return result.value;
}

/**
 * Store session in KV store
 * @param sessionId Session ID
 * @param session Session object
 */
export async function putSession(sessionId: string, session: Session): Promise<void> {
  await kv.set(["session", sessionId], session);
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

  session.accessToken = accessToken;
  session.refreshToken = refreshToken;
  session.expiresAt = expiresAt;

  await putSession(sessionId, session);
}

/**
 * Reading history entry
 */
export interface HistoryEntry {
  novelId: number;
  title: string;
  coverUrl: string;
  lastReadAt: number;
  position: number;
}

/**
 * Append novel to reading history
 * @param userId User ID
 * @param entry History entry
 */
export async function appendHistory(userId: string, entry: HistoryEntry): Promise<void> {
  const key = ["history", userId, entry.novelId.toString()];
  await kv.set(key, entry);
}

/**
 * Get reading history for user
 * @param userId User ID
 * @param limit Maximum number of entries
 * @returns Array of history entries sorted by lastReadAt descending
 */
export async function getHistory(userId: string, limit = 50): Promise<HistoryEntry[]> {
  const entries: HistoryEntry[] = [];
  const prefix = ["history", userId];

  for await (const entry of kv.list<HistoryEntry>({ prefix })) {
    entries.push(entry.value);
  }

  // Sort by lastReadAt descending
  entries.sort((a, b) => b.lastReadAt - a.lastReadAt);

  return entries.slice(0, limit);
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
): Promise<void> {
  const key = ["position", userId, novelId.toString()];
  await kv.set(key, { position, updatedAt: Date.now() });
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
): Promise<{ position: number; updatedAt: number } | null> {
  const key = ["position", userId, novelId.toString()];
  const result = await kv.get<{ position: number; updatedAt: number }>(key);
  return result.value;
}
