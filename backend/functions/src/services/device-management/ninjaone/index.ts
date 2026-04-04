/**
 * NinjaOne Device Management — barrel exports.
 *
 * @module device-management/ninjaone
 */

export { NinjaOneApiService, MockNinjaOneApiService } from './ninjaone-api-service.js';
export type {
  INinjaOneApiService,
  INinjaOneReadinessResult,
  INinjaOneOrganization,
  INinjaOneApiValidationResult,
} from './ninjaone-api-service.js';

export { NinjaOneStandardizationService, MockNinjaOneStandardizationService } from './ninjaone-standardization-service.js';
export type {
  INinjaOneStandardizationService,
  StandardizationTaskStatus,
  ValidationOutcome,
  IStandardizationStatus,
  IBundleAssignmentResult,
  IScriptTriggerResult,
  IValidationResult,
  IValidationCheck,
} from './ninjaone-standardization-service.js';

export { DEFAULT_BUNDLE_MAPPINGS, resolveBundlesForDevice } from './ninjaone-bundle-mapping.js';
export type { NinjaOneBundleType, INinjaOneBundleRef, INinjaOneBundleMapping } from './ninjaone-bundle-mapping.js';

export { runNinjaOnePreflightChecks } from './ninjaone-readiness-probes.js';
