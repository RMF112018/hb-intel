/**
 * SpfxContextAdapter — Phase 7-BW-2.
 * Bridges SPFx WebPartContext to HB Intel auth stores.
 * Called once during WebPart.onInit() — never called in PWA mode.
 *
 * Reference: PH7-BW-2-SPFx-Auth-Bridge.md
 */
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import type { ICurrentUser } from '@hbc/models';
import { useAuthStore } from '../stores/index.js';
import { usePermissionStore } from '../stores/index.js';
import { endStartupPhase, startStartupPhase } from '../startup/startupTimingBridge.js';

/** Module-level singleton — accessed by PnPjs adapters after bootstrap. */
let _spfxContext: WebPartContext | null = null;

/**
 * Returns the stored WebPartContext for use by data-access adapters.
 * Throws if called before bootstrapSpfxAuth().
 */
export function getSpfxContext(): WebPartContext {
  if (!_spfxContext) {
    throw new Error(
      'getSpfxContext() called before bootstrapSpfxAuth(). ' +
        'Ensure bootstrapSpfxAuth() is awaited in WebPart.onInit().',
    );
  }
  return _spfxContext;
}

/**
 * Main entry point called by every BaseClientSideWebPart.onInit().
 * Populates useAuthStore and usePermissionStore from SharePoint page context.
 *
 * @param context - The WebPartContext from this.context inside the webpart class
 * @param permissionKeys - Resolved permission keys (from SpfxRbacAdapter in BW-7).
 *   Pass empty array initially; BW-7 wires the full resolution.
 */
export async function bootstrapSpfxAuth(
  context: WebPartContext,
  permissionKeys: string[] = [],
): Promise<void> {
  startStartupPhase('auth-bootstrap', {
    source: 'spfx-webpart-bootstrap',
    runtimeMode: 'spfx-context',
    outcome: 'pending',
  });

  try {
    // 1. Store context singleton for PnPjs adapters
    _spfxContext = context;

    // 2. Build ICurrentUser from SharePoint page context
    const { user } = context.pageContext;
    const currentUser: ICurrentUser = {
      id: `spfx-${user.loginName}`,
      displayName: user.displayName,
      email: user.email,
      roles: [], // Populated by SpfxRbacAdapter in BW-7
    };

    // 3. Mark auth mode as 'spfx' and set user
    const authStore = useAuthStore.getState();
    authStore.beginBootstrap('spfx');
    authStore.setUser(currentUser);

    // 4. Set permissions (empty until BW-7 wires the RBAC resolution)
    usePermissionStore.getState().setPermissions(permissionKeys);

    // 5. Set feature flags (conservative defaults for SPFx — BW-7 refines these)
    usePermissionStore.getState().setFeatureFlags({
      'buyout-schedule': true,
      'risk-matrix': true,
    });

    // 6. Mark bootstrap complete
    authStore.completeBootstrap();

    endStartupPhase('auth-bootstrap', {
      source: 'spfx-webpart-bootstrap',
      runtimeMode: 'spfx-context',
      outcome: 'success',
      details: {
        permissionCount: permissionKeys.length,
        userId: currentUser.id,
      },
    });
  } catch (error) {
    endStartupPhase('auth-bootstrap', {
      source: 'spfx-webpart-bootstrap',
      runtimeMode: 'spfx-context',
      outcome: 'failure',
      details: {
        message: error instanceof Error ? error.message : 'unknown-spfx-webpart-bootstrap-error',
      },
    });
    throw error;
  }
}
