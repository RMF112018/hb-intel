/**
 * White-Glove Device Deployment — service barrel exports.
 *
 * @module white-glove
 */

export { WhiteGloveRunService, MockWhiteGloveRunService } from './white-glove-run-service.js';
export type { IWhiteGloveRunService, IWhiteGloveRunLaunchRequest, IWhiteGloveDeviceLaunchInput } from './white-glove-run-service.js';

export type {
  IWhiteGlovePackageRunResult,
  IWhiteGloveDeviceRunResult,
  IDeviceRunProgress,
  IWhiteGlovePackageRunListResult,
  IWhiteGlovePackageRunSummary,
} from './white-glove-result-envelope.js';

export {
  getRetryStrategy,
  getCompensationActions,
  getRepairGuidance,
  classifyWhiteGloveFailure,
} from './white-glove-retry-semantics.js';
export type { IRetryStrategy, CompensationAction, IRepairGuidance } from './white-glove-retry-semantics.js';
