/**
 * PCC SPFx read-model client boundary barrel (Phase 3 / Wave 3 / Prompt 06).
 *
 * This barrel is intentionally dormant: no app entry point, shell,
 * surface, or mount file imports from it in Wave 3. It exists as a
 * forward-compatible seam for a future prompt that introduces an
 * explicit, opt-in backend HTTP client behind the same interface.
 */

export {
  PCC_READ_MODEL_NAMESPACE,
  PCC_READ_MODEL_ROUTE_IDS,
  PCC_READ_MODEL_ROUTE_PATHS,
  type IPccReadModelClient,
  type PccReadModelRouteId,
} from './pccReadModelClient.js';

export {
  createPccFixtureReadModelClient,
  type PccFixtureReadModelClientOptions,
} from './pccFixtureReadModelClient.js';

export {
  PCC_SOURCE_STATUS_TO_PREVIEW_STATE,
  mapPccSourceStatusToPreviewState,
} from './pccReadModelStateMapping.js';
