/**
 * @hbc/spfx/project-sites/search-seam
 *
 * Slim re-export surface for cross-surface project-search reuse — no UI, no
 * ProjectSitesRoot, no icon dependencies. Consumers like Safety's
 * SafetyProjectPicker import from this seam so they receive the exact same
 * grounded matcher, resolver, and data-access behavior the project-sites
 * grid runs, without pulling the webpart's UI graph into their bundle.
 *
 * G-03 Wave 2 revision (hb-intel-safety 1.2.8.x).
 */

export {
  applyProjectSitesPipeline,
  extractProjectSitesFacets,
} from './projectSitesFilter.js';
export { resolveProjectSiteEntries } from './projectSitesResolver.js';
export { useProjectSites } from './hooks/useProjectSites.js';

export {
  SCOPE_ALL,
  scopeFromYear,
  scopesEqual,
  DEFAULT_SORT_KEY,
  EMPTY_FILTERS,
  PROJECT_SITE_SOURCE_CLASSIFICATION_ORDER,
} from './types.js';

export type {
  IProjectSiteEntry,
  IProjectSiteSourceRefs,
  IProjectSitesResult,
  ProjectSitesScope,
  ProjectSitesSortKey,
  ProjectSitesFilters,
  ProjectSiteSourceClassification,
} from './types.js';
