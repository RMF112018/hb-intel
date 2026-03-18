/**
 * INTEGRATION PATH: MOCK-ONLY
 *
 * MockRedisCacheService is the only implementation — no real Redis adapter exists.
 * In-memory Map storage does not persist across Azure Function invocations.
 * Real Redis integration (Azure Cache for Redis) is a Phase 1 infrastructure dependency.
 */
export interface IRedisCacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
}

interface CacheEntry {
  value: unknown;
  expiresAt: number | null;
}

export class MockRedisCacheService implements IRedisCacheService {
  private store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null,
    });
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async has(key: string): Promise<boolean> {
    const value = await this.get(key);
    return value !== null;
  }
}
