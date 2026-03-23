export { resolveProjectRole } from './resolveProjectRole.js';
export type {
  ProjectRoleResolutionInput,
  ProjectRoleResolutionResult,
} from './resolveProjectRole.js';

export { resolvePerEligibility } from './resolvePerEligibility.js';
export type {
  PerEligibilityResult,
  PerEligibilitySource,
} from './resolvePerEligibility.js';

export { validateProjectAccess } from './validateProjectAccess.js';
export type {
  ProjectAccessResult,
  ProjectAccessDenialReason,
} from './validateProjectAccess.js';

export { ProjectMembershipGate } from './ProjectMembershipGate.js';
export type { ProjectMembershipGateProps } from './ProjectMembershipGate.js';

export {
  getModuleVisibility,
  getPerModuleVisibility,
  canAnnotateModule,
} from './moduleVisibility.js';
export type { ModuleVisibility, ProjectModuleId } from './moduleVisibility.js';

export {
  isPerRole,
  canPerAnnotate,
  canPerPushToTeam,
  getPerRestrictions,
} from './perScope.js';
export type { PerRestrictions } from './perScope.js';

export {
  getTileVisibility,
  getVisibleTileKeys,
  getSpineVisibility,
} from './tileVisibility.js';
export type { TileVisibility, CanvasTileKey } from './tileVisibility.js';
