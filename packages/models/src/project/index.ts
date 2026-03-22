/**
 * Project domain models — active project context and portfolio summary.
 *
 * @module project
 */

export { type IActiveProject, type IPortfolioSummary } from './IProject.js';
export { type IProjectFormData } from './IProjectFormData.js';
export { ProjectStatus } from './ProjectEnums.js';
export type { ProjectLifecycleStatus } from './ProjectEnums.js';
export type { IProjectRegistryRecord, ISiteAssociation } from './IProjectRegistryRecord.js';
export { toActiveProject } from './IProjectRegistryRecord.js';
export { type ProjectId, type ProjectNumber, type ProjectSearchCriteria } from './types.js';
export { PROJECT_STATUS_LABELS, ACTIVE_PROJECT_STATUSES } from './constants.js';
