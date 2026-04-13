/**
 * Minimal cache-invalidation bus primitive.
 *
 * Returns a standalone bus object with:
 *   - `invalidate()` — bump the generation counter and notify all
 *     subscribers synchronously.
 *   - `subscribe(fn)` — register a listener; returns an unsubscribe
 *     function.
 *   - `getGeneration()` — read the current generation counter
 *     (monotonically increasing).
 *
 * Does not own any cached data itself; higher-level hooks decide how
 * to respond to generation bumps.
 */

export interface CacheInvalidationBus {
  invalidate(): void;
  subscribe(fn: () => void): () => void;
  getGeneration(): number;
}

export function createCacheInvalidationBus(): CacheInvalidationBus {
  let generation = 0;
  const subscribers = new Set<() => void>();

  return {
    invalidate(): void {
      generation += 1;
      for (const fn of subscribers) {
        try {
          fn();
        } catch {
          // Subscriber errors are isolated — one bad listener must not
          // prevent the rest from firing.
        }
      }
    },
    subscribe(fn: () => void): () => void {
      subscribers.add(fn);
      return () => {
        subscribers.delete(fn);
      };
    },
    getGeneration(): number {
      return generation;
    },
  };
}
