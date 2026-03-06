import type { RedirectMemoryRecord, ShellEnvironment } from './types.js';

const REDIRECT_MEMORY_KEY = 'hbc-shell-redirect-memory';
const DEFAULT_TTL_MS = 5 * 60 * 1000;

let inMemoryRedirectRecord: RedirectMemoryRecord | null = null;

/**
 * Persist redirect intent for safe post-auth restoration.
 */
export function rememberRedirectTarget(params: {
  pathname: string;
  runtimeMode: ShellEnvironment;
  now?: Date;
  ttlMs?: number;
}): RedirectMemoryRecord | null {
  if (!isSafeRedirectPath(params.pathname)) {
    return null;
  }

  const now = params.now ?? new Date();
  const ttlMs = params.ttlMs ?? DEFAULT_TTL_MS;
  const record: RedirectMemoryRecord = {
    pathname: params.pathname,
    runtimeMode: params.runtimeMode,
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
  };

  inMemoryRedirectRecord = record;
  writeStorageRecord(record);
  return record;
}

/**
 * Restore redirect intent only when path, mode, and expiry checks pass.
 */
export function restoreRedirectTarget(params: {
  runtimeMode: ShellEnvironment;
  now?: Date;
}): RedirectMemoryRecord | null {
  const now = params.now ?? new Date();
  const record = inMemoryRedirectRecord ?? readStorageRecord();
  if (!record) {
    return null;
  }

  if (record.runtimeMode !== params.runtimeMode) {
    clearRedirectMemory();
    return null;
  }

  if (!isSafeRedirectPath(record.pathname)) {
    clearRedirectMemory();
    return null;
  }

  if (new Date(record.expiresAt).getTime() <= now.getTime()) {
    clearRedirectMemory();
    return null;
  }

  return record;
}

/**
 * Clear redirect memory from both runtime and storage layers.
 */
export function clearRedirectMemory(): void {
  inMemoryRedirectRecord = null;
  removeStorageRecord();
}

/**
 * Validate redirect paths against open-redirect and malformed targets.
 */
export function isSafeRedirectPath(pathname: string): boolean {
  if (!pathname.startsWith('/')) {
    return false;
  }

  if (pathname.startsWith('//')) {
    return false;
  }

  return !pathname.includes('://');
}

function writeStorageRecord(record: RedirectMemoryRecord): void {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  storage.setItem(REDIRECT_MEMORY_KEY, JSON.stringify(record));
}

function readStorageRecord(): RedirectMemoryRecord | null {
  const storage = getSessionStorage();
  if (!storage) {
    return null;
  }

  const raw = storage.getItem(REDIRECT_MEMORY_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as RedirectMemoryRecord;
    if (
      typeof parsed.pathname === 'string' &&
      typeof parsed.runtimeMode === 'string' &&
      typeof parsed.expiresAt === 'string'
    ) {
      return parsed;
    }
  } catch {
    // Ignore malformed storage data and force cleanup.
  }

  removeStorageRecord();
  return null;
}

function removeStorageRecord(): void {
  const storage = getSessionStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(REDIRECT_MEMORY_KEY);
}

function getSessionStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.sessionStorage) {
    return null;
  }
  return window.sessionStorage;
}
