/**
 * Apple Device Management — barrel exports.
 *
 * @module device-management/apple
 */

export { AppleAbmService, MockAppleAbmService } from './apple-abm-service.js';
export type {
  IAppleAbmService,
  AbmAssignmentState,
  IAbmDeviceAssignment,
  IAbmReadinessResult,
  IAbmTokenValidationResult,
} from './apple-abm-service.js';

export { AppleAdeService, MockAppleAdeService } from './apple-ade-service.js';
export type {
  IAppleAdeService,
  AppleDevicePlatform,
  AdeEnrollmentState,
  IAdeDevice,
  IAdeReadinessResult,
  IAdePostureValidation,
} from './apple-ade-service.js';

export { AppleMdmService, MockAppleMdmService } from './apple-mdm-service.js';
export type {
  IAppleMdmService,
  AppleMdmEnrollmentState,
  SupervisedState,
  IAppleMdmDeviceStatus,
  IApnReadinessResult,
} from './apple-mdm-service.js';

export { runApplePreflightChecks } from './apple-readiness-probes.js';
