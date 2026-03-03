/**
 * SPFx auth bootstrap — Phase 5.
 * Seeds authStore + permissionStore from SharePoint page context.
 */
import { useAuthStore } from '../stores/index.js';
import { usePermissionStore } from '../stores/index.js';
import { extractSpfxUser } from '../adapters/index.js';
import type { ISpfxPageContext } from '../adapters/index.js';

/**
 * Bootstrap authentication from SPFx page context.
 * Call once before React renders in SPFx webpart entry point.
 */
export function bootstrapSpfxAuth(pageContext: ISpfxPageContext): void {
  const user = extractSpfxUser(pageContext);
  const permissions = user.roles.flatMap((r) => r.permissions);

  useAuthStore.getState().setUser(user);
  usePermissionStore.getState().setPermissions(permissions);
}
