import { describe, expect, it, vi } from 'vitest';
import {
  assertValidSpfxHostBridge,
  createSpfxShellEnvironmentAdapter,
  normalizeSpfxHostSignals,
} from './spfxHostBridge.js';
import { resolveShellModeRules } from './shellModeRules.js';

describe('spfxHostBridge', () => {
  it('validates required host bridge fields', () => {
    expect(() =>
      assertValidSpfxHostBridge({
        hostContainer: { hostId: '  ' },
        identityContextRef: 'ctx',
      }),
    ).toThrow(/hostContainer\.hostId/);
  });

  it('creates strict spfx adapter and dispatches approved host callbacks', async () => {
    const onThemeChange = vi.fn();
    const onResize = vi.fn();
    const onLocationChange = vi.fn();

    const adapter = createSpfxShellEnvironmentAdapter({
      bridge: {
        hostContainer: { hostId: 'spfx-root' },
        identityContextRef: 'ctx-1',
        handlers: {
          onThemeChange,
          onResize,
          onLocationChange,
        },
      },
    });

    expect(adapter.environment).toBe('spfx');
    await adapter.applySpfxHostSignals?.({
      themeKey: 'light',
      widthPx: 1024,
      pathname: '/estimating',
    });

    expect(onThemeChange).toHaveBeenCalledWith('light');
    expect(onResize).toHaveBeenCalledWith(1024);
    expect(onLocationChange).toHaveBeenCalledWith('/estimating');
  });

  it('normalizes partial host signals without adding composition controls', () => {
    expect(normalizeSpfxHostSignals({ themeKey: 'dark' })).toEqual({
      themeKey: 'dark',
      widthPx: undefined,
      pathname: undefined,
    });
  });

  it('keeps shell composition authority in shell mode rules for spfx', async () => {
    const adapter = createSpfxShellEnvironmentAdapter({
      bridge: {
        hostContainer: { hostId: 'spfx-root' },
        identityContextRef: 'ctx-shell-mode',
        signals: { themeKey: 'high-contrast' },
      },
    });

    await adapter.applySpfxHostSignals?.(adapter.spfxHostBridge?.signals ?? {});
    expect(resolveShellModeRules(adapter.environment).mode).toBe('simplified');
  });
});
