/**
 * W0-G3-T02: BIC module registration seam for the provisioning module.
 *
 * Provides a factory function that consuming surfaces call during app
 * initialization to register the provisioning module with `@hbc/bic-next-move`.
 *
 * The factory accepts a queryFn because the actual API call depends on
 * the consuming surface's API client. The registration shape and module
 * key are fixed by this contract.
 */
import type { IBicModuleRegistration, IBicRegisteredItem } from '@hbc/bic-next-move';

/** Fixed module key for the project setup provisioning BIC module. */
export const PROVISIONING_BIC_MODULE_KEY = 'provisioning' as const;

/** Fixed human-readable label for the provisioning BIC module. */
export const PROVISIONING_BIC_MODULE_LABEL = 'Project Setup' as const;

/**
 * Creates the IBicModuleRegistration for the provisioning module.
 *
 * The caller must provide a queryFn that:
 * 1. Fetches all IProjectSetupRequest items where userId is the current BIC owner
 * 2. Maps each item to an IBicRegisteredItem using resolveFullBicState + PROJECT_SETUP_BIC_CONFIG
 * 3. Returns the array
 *
 * @example
 * ```ts
 * import { registerBicModule } from '@hbc/bic-next-move';
 * import { createProjectSetupBicRegistration } from '@hbc/provisioning';
 *
 * registerBicModule(createProjectSetupBicRegistration(async (userId) => {
 *   const items = await ProjectSetupApi.getItemsWhereOwner(userId);
 *   return items.map(item => ({
 *     itemKey: `provisioning:${item.requestId}`,
 *     moduleKey: 'provisioning',
 *     moduleLabel: 'Project Setup',
 *     state: resolveFullBicState(item, PROJECT_SETUP_BIC_CONFIG),
 *     href: `/project-setup/${item.requestId}`,
 *     title: item.projectName,
 *   }));
 * }));
 * ```
 */
export function createProjectSetupBicRegistration(
  queryFn: (userId: string) => Promise<IBicRegisteredItem[]>,
): IBicModuleRegistration {
  return {
    key: PROVISIONING_BIC_MODULE_KEY,
    label: PROVISIONING_BIC_MODULE_LABEL,
    queryFn,
  };
}
