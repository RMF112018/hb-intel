/**
 * Phase 3 Stage 4.1 — Per-project return memory.
 *
 * Persists the last-visited path per project in localStorage
 * so that re-entering a project returns the user to their previous
 * module/page. TTL-based expiration (7 days) and LRU pruning (50 max).
 *
 * Governing: P3-B1 §4 (Return Memory)
 */

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface IProjectReturnMemory {
  /** Canonical project identity */
  projectId: string;
  /** Relative module path (e.g., '/financial', '/schedule') */
  lastPath: string;
  /** ISO 8601 timestamp of last visit */
  lastVisitedAt: string;
  /** Query parameters at time of visit (optional) */
  lastQueryParams?: Record<string, string> | null;
  /** ISO 8601 expiration timestamp (7 days from lastVisitedAt) */
  validUntil: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const KEY_PREFIX = 'hbc-project-return-';
const INDEX_KEY = 'hbc-project-return-index';
const TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const MAX_ENTRIES = 50;

// ─────────────────────────────────────────────────────────────────────────────
// Core functions
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Save return memory for a project.
 *
 * Call on every successful project-scoped page navigation.
 * NEVER call on error pages, access-denied, or redirect-in-progress states.
 */
export function saveReturnMemory(
  projectId: string,
  path: string,
  queryParams?: Record<string, string> | null,
  now: Date = new Date(),
): void {
  const nowIso = now.toISOString();
  const validUntil = new Date(now.getTime() + TTL_MS).toISOString();

  const memory: IProjectReturnMemory = {
    projectId,
    lastPath: path,
    lastVisitedAt: nowIso,
    lastQueryParams: queryParams ?? null,
    validUntil,
  };

  try {
    localStorage.setItem(KEY_PREFIX + projectId, JSON.stringify(memory));
    updateIndex(projectId, nowIso);
    pruneLru();
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

/**
 * Get return memory for a project. Returns null if expired or not found.
 */
export function getReturnMemory(
  projectId: string,
  now: Date = new Date(),
): IProjectReturnMemory | null {
  try {
    const raw = localStorage.getItem(KEY_PREFIX + projectId);
    if (!raw) return null;

    const memory = JSON.parse(raw) as IProjectReturnMemory;
    if (new Date(memory.validUntil).getTime() < now.getTime()) {
      localStorage.removeItem(KEY_PREFIX + projectId);
      return null;
    }

    return memory;
  } catch {
    return null;
  }
}

/**
 * Clear return memory for a specific project.
 */
export function clearReturnMemory(projectId: string): void {
  try {
    localStorage.removeItem(KEY_PREFIX + projectId);
    removeFromIndex(projectId);
  } catch {
    // fail silently
  }
}

/**
 * Remove all expired return memory entries.
 */
export function pruneExpiredReturnMemory(now: Date = new Date()): void {
  try {
    const index = getIndex();
    for (const entry of index) {
      const raw = localStorage.getItem(KEY_PREFIX + entry.projectId);
      if (!raw) continue;
      try {
        const memory = JSON.parse(raw) as IProjectReturnMemory;
        if (new Date(memory.validUntil).getTime() < now.getTime()) {
          localStorage.removeItem(KEY_PREFIX + entry.projectId);
        }
      } catch {
        localStorage.removeItem(KEY_PREFIX + entry.projectId);
      }
    }
    rebuildIndex();
  } catch {
    // fail silently
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Index management (tracks projectIds for LRU pruning)
// ─────────────────────────────────────────────────────────────────────────────

interface IndexEntry {
  projectId: string;
  lastVisitedAt: string;
}

function getIndex(): IndexEntry[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? (JSON.parse(raw) as IndexEntry[]) : [];
  } catch {
    return [];
  }
}

function updateIndex(projectId: string, lastVisitedAt: string): void {
  const index = getIndex().filter((e) => e.projectId !== projectId);
  index.push({ projectId, lastVisitedAt });
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function removeFromIndex(projectId: string): void {
  const index = getIndex().filter((e) => e.projectId !== projectId);
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function rebuildIndex(): void {
  const index = getIndex().filter((entry) => {
    return localStorage.getItem(KEY_PREFIX + entry.projectId) !== null;
  });
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function pruneLru(): void {
  const index = getIndex();
  if (index.length <= MAX_ENTRIES) return;

  // Sort by lastVisitedAt ascending (oldest first)
  index.sort((a, b) => new Date(a.lastVisitedAt).getTime() - new Date(b.lastVisitedAt).getTime());

  // Remove oldest entries
  const toRemove = index.slice(0, index.length - MAX_ENTRIES);
  for (const entry of toRemove) {
    localStorage.removeItem(KEY_PREFIX + entry.projectId);
  }

  // Keep only recent entries in index
  const kept = index.slice(index.length - MAX_ENTRIES);
  localStorage.setItem(INDEX_KEY, JSON.stringify(kept));
}
