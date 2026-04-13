import { describe, it, expect, vi } from 'vitest';
import { createCacheInvalidationBus } from '../cacheInvalidation.js';

describe('createCacheInvalidationBus', () => {
  it('starts at generation 0 and bumps on invalidate', () => {
    const bus = createCacheInvalidationBus();
    expect(bus.getGeneration()).toBe(0);
    bus.invalidate();
    expect(bus.getGeneration()).toBe(1);
    bus.invalidate();
    expect(bus.getGeneration()).toBe(2);
  });

  it('fires subscribers on invalidate', () => {
    const bus = createCacheInvalidationBus();
    const a = vi.fn();
    const b = vi.fn();
    bus.subscribe(a);
    bus.subscribe(b);
    bus.invalidate();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe stops future notifications', () => {
    const bus = createCacheInvalidationBus();
    const a = vi.fn();
    const unsub = bus.subscribe(a);
    bus.invalidate();
    unsub();
    bus.invalidate();
    expect(a).toHaveBeenCalledTimes(1);
  });

  it('isolates subscriber errors', () => {
    const bus = createCacheInvalidationBus();
    const bad = vi.fn(() => {
      throw new Error('boom');
    });
    const good = vi.fn();
    bus.subscribe(bad);
    bus.subscribe(good);
    expect(() => bus.invalidate()).not.toThrow();
    expect(good).toHaveBeenCalledTimes(1);
  });
});
