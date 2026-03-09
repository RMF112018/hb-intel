import { useEffect } from 'react';
import { assertValidSpfxHostBridge, normalizeSpfxHostSignals } from './spfxHostBridge.js';
import type { ShellEnvironmentAdapter } from './types.js';

/**
 * SPFx host bridge validation and signal normalization hook.
 *
 * Extracted from ShellCore.tsx per PH7.3 §7.3.2.
 * - Effect 1: validates bridge is only supplied for spfx adapters.
 * - Effect 2: normalizes and applies SPFx host signals.
 */
export function useSpfxHostAdapter(params: { adapter: ShellEnvironmentAdapter }): void {
  const { adapter } = params;

  useEffect(() => {
    if (adapter.environment !== 'spfx' && adapter.spfxHostBridge) {
      throw new Error('SPFx host bridge can only be supplied for spfx shell environment adapters.');
    }
    if (adapter.environment === 'spfx' && adapter.spfxHostBridge) {
      assertValidSpfxHostBridge(adapter.spfxHostBridge);
    }
  }, [adapter]);

  useEffect(() => {
    if (adapter.environment !== 'spfx') {
      return;
    }

    const signals = normalizeSpfxHostSignals(adapter.spfxHostBridge?.signals);
    void adapter.applySpfxHostSignals?.(signals);
  }, [adapter]);
}
