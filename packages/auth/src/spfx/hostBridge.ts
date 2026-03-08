/**
 * SPFx auth bootstrap — Phase 5.
 * Seeds authStore + permissionStore from SharePoint page context.
 */
import { useAuthStore } from '../stores/index.js';
import { usePermissionStore } from '../stores/index.js';
import { extractSpfxUser } from '../adapters/index.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';
import type {
  ISpfxPageContext,
  SpfxHostContainerMetadata,
  SpfxHostSignalState,
  SpfxIdentityBridgeInput,
} from '../types.js';

/**
 * Approved SPFx host integration seam for Phase 5.14.
 *
 * Boundary rule:
 * - Allowed: host container metadata + identity context + narrow host signals.
 * - Disallowed: shell composition controls (mode/sidebar/layout) from SPFx.
 */
export interface SpfxHostBridgeInput {
  pageContext: ISpfxPageContext;
  hostContainer: SpfxHostContainerMetadata;
  hostContextRef: string;
  hostSignals?: SpfxHostSignalState;
}

/**
 * Validate strict SPFx host-bridge input before auth-store bootstrap.
 */
export function assertValidSpfxHostBridgeInput(input: SpfxHostBridgeInput): void {
  if (!input.pageContext?.user?.loginName) {
    throw new Error('SPFx host bridge requires pageContext.user.loginName.');
  }

  if (!input.hostContainer.hostId.trim()) {
    throw new Error('SPFx host bridge requires hostContainer.hostId.');
  }

  if (!input.hostContextRef.trim()) {
    throw new Error('SPFx host bridge requires hostContextRef.');
  }
}

/**
 * Build normalized identity bridge payload from approved SPFx host input.
 */
export function toSpfxIdentityBridgeInput(input: SpfxHostBridgeInput): SpfxIdentityBridgeInput {
  assertValidSpfxHostBridgeInput(input);
  return {
    pageContext: input.pageContext,
    hostContainer: input.hostContainer,
    hostContextRef: input.hostContextRef,
    hostSignals: input.hostSignals,
  };
}

/**
 * Bootstrap authentication from SPFx page context.
 * Call once before React renders in SPFx webpart entry point.
 */
export function bootstrapSpfxAuth(input: ISpfxPageContext | SpfxHostBridgeInput): void {
  startStartupPhase('auth-bootstrap', {
    source: 'spfx-bootstrap',
    runtimeMode: 'spfx-context',
    outcome: 'pending',
  });

  try {
    const bridgeInput = isSpfxHostBridgeInput(input)
      ? toSpfxIdentityBridgeInput(input)
      : toLegacyBridgeInput(input);
    const user = extractSpfxUser(bridgeInput.pageContext);
    const permissions = user.roles.flatMap((r) => r.permissions);

    useAuthStore.getState().setUser(user);
    usePermissionStore.getState().setPermissions(permissions);
    endStartupPhase('auth-bootstrap', {
      source: 'spfx-bootstrap',
      runtimeMode: 'spfx-context',
      outcome: 'success',
      details: {
        permissionCount: permissions.length,
      },
    });
  } catch (error) {
    endStartupPhase('auth-bootstrap', {
      source: 'spfx-bootstrap',
      runtimeMode: 'spfx-context',
      outcome: 'failure',
      details: {
        message: error instanceof Error ? error.message : 'unknown-spfx-bootstrap-error',
      },
    });
    throw error;
  }
}

function isSpfxHostBridgeInput(input: ISpfxPageContext | SpfxHostBridgeInput): input is SpfxHostBridgeInput {
  return 'pageContext' in input && 'hostContainer' in input && 'hostContextRef' in input;
}

function toLegacyBridgeInput(pageContext: ISpfxPageContext): SpfxHostBridgeInput {
  return {
    pageContext,
    hostContainer: {
      hostId: 'spfx-host',
    },
    hostContextRef: pageContext.user.loginName,
  };
}
