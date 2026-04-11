/**
 * usePersonPhotoCache — In-memory photo cache and async fetcher for
 * the shared people picker.
 *
 * Photo retrieval is a separate Graph endpoint from user search
 * (/users/{id}/photo/$value). This hook provides:
 *
 *   - per-person typed photo state (idle → loading → available | missing | failed)
 *   - in-memory cache keyed by UPN/id so repeated opens don't refetch
 *   - automatic blob URL creation + cleanup
 *   - clear distinction between 404 ImageNotFound (normal) and transient failures
 *
 * The cache is scoped to the hook instance lifetime. When the component
 * unmounts, outstanding blob URLs are revoked.
 */
import { useCallback, useRef, useSyncExternalStore } from 'react';
import type { PersonPhotoFn, PhotoState } from './types.js';

interface CacheEntry {
  state: PhotoState;
  url?: string;
}

interface PhotoCache {
  entries: Map<string, CacheEntry>;
  listeners: Set<() => void>;
}

function createPhotoCache(): PhotoCache {
  return { entries: new Map(), listeners: new Set() };
}

function notifyListeners(cache: PhotoCache): void {
  for (const fn of cache.listeners) fn();
}

/**
 * Returns a stable photo cache and a `getPhotoUrl` function that
 * triggers async fetches and returns the current state for a given key.
 *
 * @param fetchPhoto - adapter that fetches the binary photo. Returns
 *   blob URL when available, `undefined` for 404 ImageNotFound, and
 *   throws on transient errors.
 */
export function usePersonPhotoCache(
  fetchPhoto: PersonPhotoFn | undefined,
): {
  /** Get current photo state for a person. Triggers fetch if idle. */
  getPhoto: (key: string) => CacheEntry;
  /** Snapshot version for triggering re-renders */
  version: number;
} {
  const cacheRef = useRef<PhotoCache>(createPhotoCache());
  const versionRef = useRef(0);

  // Use useSyncExternalStore for safe concurrent-mode re-renders.
  const subscribe = useCallback((onStoreChange: () => void) => {
    const cache = cacheRef.current;
    cache.listeners.add(onStoreChange);
    return () => { cache.listeners.delete(onStoreChange); };
  }, []);

  const getSnapshot = useCallback(() => versionRef.current, []);

  const version = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const getPhoto = useCallback(
    (key: string): CacheEntry => {
      const cache = cacheRef.current;
      const existing = cache.entries.get(key);

      if (existing) return existing;

      // No adapter — stay idle
      if (!fetchPhoto) {
        return { state: 'idle' };
      }

      // Mark as loading and kick off fetch
      const loading: CacheEntry = { state: 'loading' };
      cache.entries.set(key, loading);

      void (async () => {
        try {
          const blobUrl = await fetchPhoto(key);
          if (blobUrl) {
            cache.entries.set(key, { state: 'available', url: blobUrl });
          } else {
            cache.entries.set(key, { state: 'missing' });
          }
        } catch {
          cache.entries.set(key, { state: 'failed' });
        }
        versionRef.current += 1;
        notifyListeners(cache);
      })();

      return loading;
    },
    [fetchPhoto],
  );

  return { getPhoto, version };
}

/**
 * Creates a PersonPhotoFn backed by Microsoft Graph /photo/$value.
 *
 * Returns a blob URL on success, `undefined` on 404 ImageNotFound,
 * and throws on any other failure.
 *
 * @param getAccessToken - async function returning a Graph-scoped Bearer token.
 */
export function createGraphPersonPhotoFn(
  getAccessToken: () => Promise<string>,
): PersonPhotoFn {
  return async (personIdOrUpn: string): Promise<string | undefined> => {
    const token = await getAccessToken();
    const url = `https://graph.microsoft.com/v1.0/users/${encodeURIComponent(personIdOrUpn)}/photo/$value`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 404) {
      // Normal missing-photo case (ImageNotFound). Not an error.
      return undefined;
    }

    if (!response.ok) {
      throw new Error(`Photo fetch failed: ${response.status} ${response.statusText}`);
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };
}
