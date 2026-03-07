import type {
  ShellEnvironmentAdapter,
  SpfxHostBridge,
  SpfxHostSignalSnapshot,
} from './types.js';

/**
 * Validate the strict SPFx host bridge contract.
 *
 * Alignment notes:
 * - PH5.14: allow only host container metadata, identity context ref, and
 *   narrow host signals/callback hooks.
 * - D-07: deterministic input assertions for boundary enforcement.
 */
export function assertValidSpfxHostBridge(bridge: SpfxHostBridge): void {
  if (!bridge.hostContainer.hostId.trim()) {
    throw new Error('SPFx host bridge requires hostContainer.hostId.');
  }

  if (!bridge.identityContextRef.trim()) {
    throw new Error('SPFx host bridge requires identityContextRef.');
  }
}

/**
 * Normalize host signal snapshots into the approved shell seam shape.
 */
export function normalizeSpfxHostSignals(
  signals?: SpfxHostSignalSnapshot,
): SpfxHostSignalSnapshot {
  return {
    themeKey: signals?.themeKey,
    widthPx: signals?.widthPx,
    pathname: signals?.pathname,
  };
}

/**
 * Build a strict SPFx environment adapter that preserves shell-owned
 * composition authority and exposes only approved host hooks.
 */
export function createSpfxShellEnvironmentAdapter(params: {
  bridge: SpfxHostBridge;
  adapter?: Omit<ShellEnvironmentAdapter, 'environment' | 'spfxHostBridge'>;
}): ShellEnvironmentAdapter {
  assertValidSpfxHostBridge(params.bridge);

  return {
    environment: 'spfx',
    ...params.adapter,
    spfxHostBridge: {
      ...params.bridge,
      signals: normalizeSpfxHostSignals(params.bridge.signals),
    },
    applySpfxHostSignals: async (signals) => {
      const normalized = normalizeSpfxHostSignals(signals);

      // Host callbacks are approved narrow seams. Composition remains shell-owned.
      if (normalized.themeKey && params.bridge.handlers?.onThemeChange) {
        params.bridge.handlers.onThemeChange(normalized.themeKey);
      }
      if (typeof normalized.widthPx === 'number' && params.bridge.handlers?.onResize) {
        params.bridge.handlers.onResize(normalized.widthPx);
      }
      if (normalized.pathname && params.bridge.handlers?.onLocationChange) {
        params.bridge.handlers.onLocationChange(normalized.pathname);
      }

      await params.adapter?.applySpfxHostSignals?.(normalized);
    },
  };
}
