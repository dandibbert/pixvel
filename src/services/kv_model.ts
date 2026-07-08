export interface ReadingPositionRecord {
  position: number;
  updatedAt: number;
}

export interface HistoryEntry {
  novelId: number;
  title: string;
  coverUrl: string;
  lastReadAt: number;
  position: number;
}

export function buildSessionKey(sessionId: string): Deno.KvKey {
  return ["session", sessionId];
}

export function buildHistoryKey(userId: string, novelId: number): Deno.KvKey {
  return ["history", userId, novelId.toString()];
}

export function buildHistoryPrefix(userId: string): Deno.KvKey {
  return ["history", userId];
}

export function buildPositionKey(userId: string, novelId: number): Deno.KvKey {
  return ["position", userId, novelId.toString()];
}

export function sortHistoryEntriesByRecency(
  entries: readonly HistoryEntry[],
  limit: number,
): HistoryEntry[] {
  return [...entries]
    .sort((a, b) => b.lastReadAt - a.lastReadAt)
    .slice(0, limit);
}

export function buildReadingPositionRecord(
  position: number,
  updatedAt: number,
): ReadingPositionRecord {
  return { position, updatedAt };
}

export function buildTimestampedReadingPositionRecord({
  position,
  updatedAt,
  now = Date.now,
}: {
  position: number;
  updatedAt?: number;
  now?: () => number;
}): ReadingPositionRecord {
  return buildReadingPositionRecord(position, updatedAt ?? now());
}
