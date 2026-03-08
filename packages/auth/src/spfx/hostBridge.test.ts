import { afterEach, describe, expect, it, vi } from 'vitest';
import { SpfxAdapter } from '../adapters/SpfxAdapter.js';
import { useAuthStore, usePermissionStore } from '../stores/index.js';
import {
  assertValidSpfxHostBridgeInput,
  bootstrapSpfxAuth,
  toSpfxIdentityBridgeInput,
} from './hostBridge.js';

const pageContext = {
  user: {
    displayName: 'Taylor Host',
    email: 'taylor.host@hbintel.local',
    loginName: 'i:0#.f|membership|taylor.host@hbintel.local',
    isAnonymousGuestUser: false,
    isSiteAdmin: true,
  },
  web: {
    permissions: {
      value: {
        High: 0,
        Low: 0,
      },
    },
  },
};

describe('spfx bootstrap boundary seam', () => {
  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__;
  });

  it('validates strict bridge payload and bootstraps auth through approved seam', () => {
    const bridge = {
      pageContext,
      hostContainer: {
        hostId: 'spfx-root',
        domElementId: 'wp-1',
      },
      hostContextRef: 'ctx-bridge-1',
      hostSignals: {
        pathname: '/project-hub',
      },
    };

    assertValidSpfxHostBridgeInput(bridge);
    bootstrapSpfxAuth(bridge);

    expect(useAuthStore.getState().currentUser?.id).toContain('spfx-');
    expect(usePermissionStore.getState().permissions.length).toBeGreaterThan(0);

    useAuthStore.getState().clear();
    usePermissionStore.getState().clear();
  });

  it('normalizes bridge input for SPFx adapter acquisition path', async () => {
    const bridge = toSpfxIdentityBridgeInput({
      pageContext,
      hostContainer: {
        hostId: 'spfx-root',
      },
      hostContextRef: 'ctx-bridge-2',
    });

    const acquired = await new SpfxAdapter(bridge).acquireIdentity();
    expect(acquired.ok).toBe(true);
    if (acquired.ok) {
      expect(acquired.value.runtimeMode).toBe('spfx-context');
      expect(acquired.value.rawContext?.provider).toBe('spfx-context');
    }
  });

  it('ignores host payload fields that attempt shell composition control', () => {
    const bridge = toSpfxIdentityBridgeInput({
      pageContext,
      hostContainer: {
        hostId: 'spfx-root',
      },
      hostContextRef: 'ctx-bridge-3',
      hostSignals: { themeKey: 'dark' },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any);

    // Composition authority must remain in @hbc/shell rules, not SPFx host payloads.
    expect('mode' in bridge).toBe(false);
    expect('supportsAppLauncher' in bridge).toBe(false);
    expect(bridge.hostSignals?.themeKey).toBe('dark');
  });

  it('emits auth-bootstrap startup timing when bootstrapping from SPFx seam', () => {
    const startPhase = vi.fn();
    const endPhase = vi.fn();
    const recordPhase = vi.fn();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).__HBC_STARTUP_TIMING_BRIDGE__ = {
      startPhase,
      endPhase,
      recordPhase,
    };

    bootstrapSpfxAuth({
      pageContext,
      hostContainer: {
        hostId: 'spfx-root',
      },
      hostContextRef: 'ctx-bridge-4',
    });

    expect(startPhase).toHaveBeenCalledWith(
      'auth-bootstrap',
      expect.objectContaining({ source: 'spfx-bootstrap', outcome: 'pending' }),
    );
    expect(endPhase).toHaveBeenCalledWith(
      'auth-bootstrap',
      expect.objectContaining({ source: 'spfx-bootstrap', outcome: 'success' }),
    );
    expect(recordPhase).not.toHaveBeenCalled();
  });
});
