export {
  getCompatibleSharePointFieldTypes,
  isSharePointFieldTypeCompatible,
  normalizeListTitle,
} from './compatibility.js';
export {
  buildFieldPlan,
  buildListFieldPlans,
  resolveLiveFieldForDefinition,
  validateProvisionedFields,
} from './planner.js';
export {
  applyFieldSettingsUpdates,
  createSharePointField,
  type ISharePointListLike,
} from './apply.js';
export type {
  IFieldMutation,
  IFieldPlanAction,
  IFieldSettingsUpdatePlan,
  ILiveSharePointFieldSnapshot,
  IListProvisioningResult,
  IProvisioningReport,
  IUnresolvedMutation,
} from './types.js';
