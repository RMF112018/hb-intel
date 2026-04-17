/**
 * @hbc/spfx/project-sites barrel.
 *
 * Package-oriented seam for the Project Sites webpart surface. App hosts
 * (notably `apps/project-sites/src/mount.tsx`) import `ProjectSitesRoot`
 * through this file via the `@hbc/spfx/project-sites` path alias, rather
 * than reaching into the source tree with a relative file path.
 *
 * Closes Gap 5 of `docs/architecture/reviews/project-sites-ui-kit-compliance-audit.md`.
 */

export { ProjectSitesRoot } from './ProjectSitesRoot.js';
export { default as ProjectSitesWebPart } from './ProjectSitesWebPart.js';

export type {
  IProjectSiteEntry,
  IProjectSitesResult,
  IAvailableYearsResult,
  ProjectSitesStatus,
  AvailableYearsStatus,
  IProjectSitesMountRuntimeConfig,
  IProjectSitesRuntimeContext,
  IResolvedProjectSitesScope,
  ProjectSitesScopeSource,
} from './types.js';

export {
  normalizeProjectSitesRuntimeConfig,
  resolveInitialProjectSitesScope,
} from './types.js';
