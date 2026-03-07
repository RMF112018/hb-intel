import type { AccessOverrideEmergencyBoundaryCheck, AccessOverrideEmergencyCommand, AccessOverrideEmergencyPolicy, AccessOverrideEmergencyResult } from '../types.js';
/**
 * Strict emergency workflow policy with short expiration and review boundaries.
 */
export declare const DEFAULT_EMERGENCY_ACCESS_POLICY: AccessOverrideEmergencyPolicy;
/**
 * Enforce emergency boundaries so break-glass does not replace normal workflow.
 *
 * Alignment notes:
 * - PH5.12 item 8: emergency cannot become normal-path substitute.
 * - D-04: deterministic boundary decision result.
 */
export declare function evaluateEmergencyBoundary(command: AccessOverrideEmergencyCommand, policy?: AccessOverrideEmergencyPolicy): AccessOverrideEmergencyBoundaryCheck;
/**
 * Execute emergency access grant with immediate approval and mandatory post-review.
 */
export declare function runEmergencyAccessWorkflow(command: AccessOverrideEmergencyCommand, policy?: AccessOverrideEmergencyPolicy): AccessOverrideEmergencyResult;
//# sourceMappingURL=emergencyAccess.d.ts.map