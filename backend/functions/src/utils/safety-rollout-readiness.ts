import {
  type ISafetyPermissionPostureIssue,
  type ISafetyPermissionPostureValidation,
  type ISafetyRolloutGateStatus,
  type ISafetyTightenedProofStatus,
  type SafetyPermissionPosture,
  validateSafetyPermissionPosture,
} from './safety-permission-posture.js';

/**
 * Single source of truth for Safety rollout readiness. Combines the permission
 * posture, tightened-proof bundle, and rollout gate into one typed result so
 * every gate-surfacing consumer (health, preflight, config validation,
 * prelaunch validation) derives the same verdict and failure codes.
 *
 * Consumers must NOT re-derive the rule set independently — they adapt this
 * result to their surface-specific representation.
 */
export interface ISafetyRolloutReadiness {
  readonly posture: SafetyPermissionPosture;
  readonly permissionModel: ISafetyPermissionPostureValidation['permissionModel'];
  readonly ready: boolean;
  readonly postureReady: boolean;
  readonly proofReady: boolean;
  readonly gateReady: boolean;
  readonly proof: ISafetyTightenedProofStatus;
  readonly gate: ISafetyRolloutGateStatus;
  readonly issues: ReadonlyArray<ISafetyPermissionPostureIssue>;
  readonly surfaceState: 'ready' | 'blocked';
}

export function evaluateSafetyRolloutReadiness(): ISafetyRolloutReadiness {
  return buildReadiness(validateSafetyPermissionPosture());
}

/**
 * Pure adapter around an already-computed posture validation. Useful when a
 * consumer already holds the posture result (e.g., the health probe) and does
 * not want to re-read environment state twice within the same request.
 */
export function deriveSafetyRolloutReadiness(
  postureValidation: ISafetyPermissionPostureValidation,
): ISafetyRolloutReadiness {
  return buildReadiness(postureValidation);
}

function buildReadiness(v: ISafetyPermissionPostureValidation): ISafetyRolloutReadiness {
  const gateIssueCodes = new Set(v.gate.issues.map((i) => i.code));
  const proofIssueCodes = new Set(v.proof.issues.map((i) => i.code));
  const postureOnlyIssues = v.issues.filter(
    (i) => !gateIssueCodes.has(i.code) && !proofIssueCodes.has(i.code),
  );

  const postureReady = postureOnlyIssues.length === 0;
  const proofReady = v.posture === 'staging-broad' ? true : v.proof.passed;
  const gateReady = v.gate.passed;
  const ready = v.passed && postureReady && proofReady && gateReady;

  return {
    posture: v.posture,
    permissionModel: v.permissionModel,
    ready,
    postureReady,
    proofReady,
    gateReady,
    proof: v.proof,
    gate: v.gate,
    issues: v.issues,
    surfaceState: ready ? 'ready' : 'blocked',
  };
}
