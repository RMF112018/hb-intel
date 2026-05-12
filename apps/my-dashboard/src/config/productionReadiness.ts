/**
 * My Dashboard production readiness surface.
 *
 * Re-exports the readiness contract defined in `runtimeConfig.ts` so that
 * downstream consumers can import from a focused `productionReadiness` module
 * without pulling in the full runtime-config surface. The actual readiness
 * logic remains colocated with the runtime config (repo precedent: estimating,
 * accounting) so all mode/URL/token decisions stay in one place.
 */
export {
  checkProductionReadiness,
  type IProductionModeReadiness,
} from './runtimeConfig.js';

import type { IProductionModeReadiness } from './runtimeConfig.js';

/** My Dashboard-namespaced alias for `IProductionModeReadiness`. */
export type IMyDashboardProductionReadiness = IProductionModeReadiness;
