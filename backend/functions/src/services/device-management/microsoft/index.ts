/**
 * Microsoft Device Management — barrel exports.
 *
 * @module device-management/microsoft
 */

export { MicrosoftIdentityService, MockMicrosoftIdentityService } from './microsoft-identity-service.js';
export type { IMicrosoftIdentityService, IIdentityReadinessResult, IDeviceGroupResult } from './microsoft-identity-service.js';

export { MicrosoftIntuneService, MockMicrosoftIntuneService } from './microsoft-intune-service.js';
export type {
  IMicrosoftIntuneService,
  IntuneEnrollmentState,
  IntuneComplianceState,
  IIntuneDeviceStatus,
  IIntuneReadinessResult,
  IIntunePolicyAssignmentResult,
} from './microsoft-intune-service.js';

export { MicrosoftAutopilotService, MockMicrosoftAutopilotService } from './microsoft-autopilot-service.js';
export type {
  IMicrosoftAutopilotService,
  AutopilotRegistrationState,
  AutopilotProfileAssignmentState,
  IAutopilotDevice,
  IAutopilotReadinessResult,
  IAutopilotRegistrationResult,
  IAutopilotProfileAssignmentResult,
  ITechnicianPreProvisioningContext,
} from './microsoft-autopilot-service.js';

export { runMicrosoftPreflightChecks } from './microsoft-readiness-probes.js';
