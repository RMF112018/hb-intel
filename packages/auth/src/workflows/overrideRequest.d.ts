import type { AccessOverrideRequest, AccessOverrideRequestPolicy, AccessOverrideRequestValidationResult, StructuredAccessOverrideRequest, StructuredAccessOverrideRequestCommand } from '../types.js';
/**
 * Default policy for standard override request intake.
 *
 * Alignment notes:
 * - PH5.12 item 4: default expiration required for most overrides.
 * - D-07: deterministic workflow defaults and validation paths.
 */
export declare const DEFAULT_OVERRIDE_REQUEST_POLICY: AccessOverrideRequestPolicy;
/**
 * Validate structured override request input before creating persisted records.
 *
 * Alignment notes:
 * - D-10: provider/source identity is not used for authorization decisions.
 * - D-12: UI surfaces consume validated workflow contracts only.
 */
export declare function validateStructuredOverrideRequest(command: StructuredAccessOverrideRequestCommand, policy?: AccessOverrideRequestPolicy): AccessOverrideRequestValidationResult;
/**
 * Create the structured workflow request model used by approval/renewal modules.
 */
export declare function createStructuredOverrideRequest(command: StructuredAccessOverrideRequestCommand, policy?: AccessOverrideRequestPolicy): StructuredAccessOverrideRequest;
/**
 * Bridge structured request model into Phase 5.10 override record input contract.
 */
export declare function toOverrideRequestInput(request: StructuredAccessOverrideRequest): AccessOverrideRequest;
//# sourceMappingURL=overrideRequest.d.ts.map