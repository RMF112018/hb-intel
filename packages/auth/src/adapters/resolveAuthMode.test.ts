import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveCanonicalAuthMode } from './resolveAuthMode.js';

describe('resolveCanonicalAuthMode startup timing', () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__;
  });

  it('emits runtime-detection timing markers around runtime resolution', () => {
    const startPhase = vi.fn();
    const endPhase = vi.fn();
    const recordPhase = vi.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ = {
      startPhase,
      endPhase,
      recordPhase,
    };

    const mode = resolveCanonicalAuthMode();
    expect(mode).toBeDefined();
    expect(startPhase).toHaveBeenCalledWith(
      'runtime-detection',
      expect.objectContaining({
        source: 'auth-runtime-resolver',
        outcome: 'pending',
      }),
    );
    expect(endPhase).toHaveBeenCalledWith(
      'runtime-detection',
      expect.objectContaining({
        source: 'auth-runtime-resolver',
        outcome: 'success',
      }),
    );
    expect(recordPhase).not.toHaveBeenCalled();
  });
});
