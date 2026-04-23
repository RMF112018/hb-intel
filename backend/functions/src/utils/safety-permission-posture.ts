import { diagnosePermissionModel } from './diagnose-permissions.js';

export type SafetyPermissionPosture =
  | 'staging-broad'
  | 'pre-rollout-tightened'
  | 'steady-state';

export type SafetyPermissionRequirement = 'required' | 'conditional' | 'forbidden';

export interface ISafetyPermissionMatrixEntry {
  permission: string;
  requiredFor: {
    staging: SafetyPermissionRequirement;
    preRollout: SafetyPermissionRequirement;
    steadyState: SafetyPermissionRequirement;
  };
  intent: string;
}

export interface ISafetyPermissionPostureIssue {
  code: string;
  message: string;
  remediation: string;
}

export interface ISafetyPermissionPostureValidation {
  posture: SafetyPermissionPosture;
  permissionModel: ReturnType<typeof diagnosePermissionModel>['model'];
  proof: ISafetyTightenedProofStatus;
  gate: ISafetyRolloutGateStatus;
  passed: boolean;
  issues: ISafetyPermissionPostureIssue[];
}

export interface ISafetyTightenedProofStatus {
  evidenceId?: string;
  executedAtUtc?: string;
  permissionModel?: string;
  maxAgeDays: number;
  stale: boolean;
  passed: boolean;
  issues: ISafetyPermissionPostureIssue[];
}

export interface ISafetyRolloutGateStatus {
  enabled: boolean;
  checkpointId?: string;
  expiresAtUtc?: string;
  expired: boolean;
  passed: boolean;
  issues: ISafetyPermissionPostureIssue[];
}

/** Strict format required for SAFETY_ROLLOUT_CHECKPOINT_ID so the evidence pointer is uniquely addressable. */
export const SAFETY_ROLLOUT_CHECKPOINT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;

export const SAFETY_PERMISSION_MATRIX: readonly ISafetyPermissionMatrixEntry[] = [
  {
    permission: 'Sites.Selected',
    requiredFor: {
      staging: 'conditional',
      preRollout: 'required',
      steadyState: 'required',
    },
    intent: 'Least-privilege selected scope for Safety SharePoint data-plane access.',
  },
  {
    permission: 'Sites.FullControl.All',
    requiredFor: {
      staging: 'conditional',
      preRollout: 'forbidden',
      steadyState: 'forbidden',
    },
    intent: 'Temporary stabilization fallback only. Forbidden for pre-rollout and steady-state.',
  },
  {
    permission: 'Group.ReadWrite.All',
    requiredFor: {
      staging: 'required',
      preRollout: 'required',
      steadyState: 'conditional',
    },
    intent: 'Required for current provisioning/control-plane group lifecycle integration.',
  },
];

function isProductionLikeEnvironment(): boolean {
  const env = (process.env.AZURE_FUNCTIONS_ENVIRONMENT ?? '').toLowerCase().trim();
  return env === 'production';
}

function resolveProofMaxAgeDays(): number {
  const raw = process.env.SAFETY_TIGHTENED_PROOF_MAX_AGE_DAYS?.trim();
  if (!raw) return 30;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 30;
}

function parseIsoTimestampUtc(value: string | undefined): number | null {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function resolveSafetyPermissionPosture(): SafetyPermissionPosture {
  const raw = (process.env.SAFETY_PERMISSION_POSTURE ?? '').toLowerCase().trim();
  if (raw === 'staging-broad' || raw === 'pre-rollout-tightened' || raw === 'steady-state') {
    return raw;
  }
  return isProductionLikeEnvironment() ? 'steady-state' : 'pre-rollout-tightened';
}

export function validateSafetyPermissionPosture(): ISafetyPermissionPostureValidation {
  const posture = resolveSafetyPermissionPosture();
  const { model } = diagnosePermissionModel();
  const issues: ISafetyPermissionPostureIssue[] = [];
  const tightenedProofConfirmed =
    process.env.SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED === 'true';
  const tightenedE2eConfirmed =
    process.env.SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED === 'true';
  const proofMaxAgeDays = resolveProofMaxAgeDays();
  const evidenceId = process.env.SAFETY_TIGHTENED_PROOF_EVIDENCE_ID?.trim();
  const executedAtUtc = process.env.SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC?.trim();
  const tightenedProofPermissionModel = process.env.SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL?.trim().toLowerCase();
  const proofIssues: ISafetyPermissionPostureIssue[] = [];
  let proofStale = false;

  if (posture === 'staging-broad') {
    if (model !== 'fullcontrol') {
      issues.push({
        code: 'SAFETY_STAGING_BROAD_REQUIRES_FULLCONTROL_MODEL',
        message:
          'SAFETY_PERMISSION_POSTURE=staging-broad requires SITES_PERMISSION_MODEL=fullcontrol.',
        remediation:
          'Set SITES_PERMISSION_MODEL=fullcontrol for staging-broad, or move to pre-rollout-tightened/steady-state.',
      });
    }
    if (process.env.SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED !== 'true') {
      issues.push({
        code: 'SAFETY_STAGING_BROAD_EXCEPTION_NOT_CONFIRMED',
        message:
          'staging-broad posture is active but SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED is not true.',
        remediation:
          'Set SAFETY_STAGING_BROAD_EXCEPTION_CONFIRMED=true after operator approval of the temporary broad posture.',
      });
    }
    if (!process.env.SAFETY_STAGING_BROAD_EXCEPTION_REASON?.trim()) {
      issues.push({
        code: 'SAFETY_STAGING_BROAD_EXCEPTION_REASON_MISSING',
        message:
          'staging-broad posture is active but SAFETY_STAGING_BROAD_EXCEPTION_REASON is empty.',
        remediation:
          'Set SAFETY_STAGING_BROAD_EXCEPTION_REASON to a time-boxed justification and expiry date.',
      });
    }
  }

  if (posture === 'pre-rollout-tightened' || posture === 'steady-state') {
    if (model !== 'sites-selected') {
      issues.push({
        code: 'SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED',
        message:
          `${posture} posture requires SITES_PERMISSION_MODEL=sites-selected, but current model is "${model}".`,
        remediation:
          'Set SITES_PERMISSION_MODEL=sites-selected and confirm per-site grants for Safety targets.',
      });
    }
    if (process.env.SITES_SELECTED_GRANT_CONFIRMED !== 'true') {
      issues.push({
        code: 'SAFETY_TIGHTENED_POSTURE_REQUIRES_SITES_SELECTED_CONFIRMATION',
        message:
          `${posture} posture requires SITES_SELECTED_GRANT_CONFIRMED=true.`,
        remediation:
          'Confirm Sites.Selected per-site grant workflow is operational and set SITES_SELECTED_GRANT_CONFIRMED=true.',
      });
    }
    if (!tightenedProofConfirmed) {
      issues.push({
        code: 'SAFETY_TIGHTENED_POSTURE_PROOF_NOT_CONFIRMED',
        message:
          `${posture} posture requires SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED=true.`,
        remediation:
          'Set SAFETY_TIGHTENED_POSTURE_PROOF_CONFIRMED=true after validating final Safety permission matrix and rollout gates.',
      });
    }
    if (!tightenedE2eConfirmed) {
      issues.push({
        code: 'SAFETY_TIGHTENED_E2E_PROOF_NOT_CONFIRMED',
        message:
          `${posture} posture requires SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED=true.`,
        remediation:
          'Set SAFETY_E2E_TIGHTENED_INGEST_REPLAY_CONFIRMED=true after successful ingest + replay verification under tightened posture.',
      });
    }

    if (!evidenceId) {
      proofIssues.push({
        code: 'SAFETY_TIGHTENED_PROOF_EVIDENCE_ID_MISSING',
        message:
          `${posture} posture requires SAFETY_TIGHTENED_PROOF_EVIDENCE_ID.`,
        remediation:
          'Set SAFETY_TIGHTENED_PROOF_EVIDENCE_ID to the immutable proof artifact/run identifier used for rollout signoff.',
      });
    }

    const executedAtMs = parseIsoTimestampUtc(executedAtUtc);
    if (!executedAtUtc) {
      proofIssues.push({
        code: 'SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_MISSING',
        message:
          `${posture} posture requires SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC.`,
        remediation:
          'Set SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC as an ISO-8601 UTC timestamp when tightened proof was executed.',
      });
    } else if (executedAtMs === null) {
      proofIssues.push({
        code: 'SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_INVALID',
        message:
          `SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC must be a valid ISO-8601 timestamp, received "${executedAtUtc}".`,
        remediation:
          'Use an ISO-8601 UTC timestamp (for example: 2026-04-23T13:00:00Z).',
      });
    } else if (executedAtMs > Date.now() + 60 * 1000) {
      proofIssues.push({
        code: 'SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC_IN_FUTURE',
        message:
          `SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC is in the future (${executedAtUtc}); proof cannot be attested for a run that has not executed.`,
        remediation:
          'Set SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC to the actual UTC timestamp when tightened proof executed.',
      });
    } else {
      const ageMs = Date.now() - executedAtMs;
      proofStale = ageMs > proofMaxAgeDays * 24 * 60 * 60 * 1000;
      if (posture === 'steady-state' && proofStale) {
        proofIssues.push({
          code: 'SAFETY_TIGHTENED_PROOF_STALE',
          message:
            `steady-state posture requires tightened proof <= ${proofMaxAgeDays} days old.`,
          remediation:
            'Re-run tightened ingest/replay proof and refresh SAFETY_TIGHTENED_PROOF_EXECUTED_AT_UTC before rollout signoff.',
        });
      }
    }

    if (!tightenedProofPermissionModel) {
      proofIssues.push({
        code: 'SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL_MISSING',
        message:
          `${posture} posture requires SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL=sites-selected.`,
        remediation:
          'Set SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL=sites-selected after confirming proof ran under the tightened model.',
      });
    } else if (tightenedProofPermissionModel !== 'sites-selected') {
      proofIssues.push({
        code: 'SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL_INVALID',
        message:
          `SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL must be "sites-selected", received "${tightenedProofPermissionModel}".`,
        remediation:
          'Re-run tightened proof under Sites.Selected and set SAFETY_TIGHTENED_PROOF_PERMISSION_MODEL=sites-selected.',
      });
    }

    issues.push(...proofIssues);
  }

  const gate = evaluateSafetyRolloutGate(posture);
  issues.push(...gate.issues);

  const proof: ISafetyTightenedProofStatus = {
    evidenceId,
    executedAtUtc,
    permissionModel: tightenedProofPermissionModel,
    maxAgeDays: proofMaxAgeDays,
    stale: proofStale,
    passed: proofIssues.length === 0,
    issues: proofIssues,
  };

  return {
    posture,
    permissionModel: model,
    proof,
    gate,
    passed: issues.length === 0,
    issues,
  };
}

/**
 * Evaluates the Safety rollout gate independently of the proof bundle so the
 * gate state can be surfaced consistently across health, preflight, config
 * validation, and prelaunch checks.
 *
 * Gate is enforced for non-staging-broad postures. staging-broad is a
 * time-boxed exception and does not require the rollout gate.
 */
export function evaluateSafetyRolloutGate(
  posture: SafetyPermissionPosture = resolveSafetyPermissionPosture(),
): ISafetyRolloutGateStatus {
  const enabled = process.env.SAFETY_ROLLOUT_GATE_ENABLED === 'true';
  const checkpointId = process.env.SAFETY_ROLLOUT_CHECKPOINT_ID?.trim();
  const expiresAtUtcRaw = process.env.SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC?.trim();
  const issues: ISafetyPermissionPostureIssue[] = [];
  let expired = false;

  if (posture === 'staging-broad') {
    return {
      enabled,
      checkpointId,
      expiresAtUtc: expiresAtUtcRaw,
      expired: false,
      passed: true,
      issues: [],
    };
  }

  if (!enabled) {
    issues.push({
      code: 'SAFETY_ROLLOUT_GATE_NOT_ENABLED',
      message:
        `${posture} posture requires SAFETY_ROLLOUT_GATE_ENABLED=true to enforce the rollout boundary.`,
      remediation:
        'Set SAFETY_ROLLOUT_GATE_ENABLED=true only after rollout approval is recorded, alongside SAFETY_ROLLOUT_CHECKPOINT_ID.',
    });
  }

  if (!checkpointId) {
    issues.push({
      code: 'SAFETY_ROLLOUT_CHECKPOINT_ID_MISSING',
      message:
        `${posture} posture requires SAFETY_ROLLOUT_CHECKPOINT_ID to bind the deployment to an approval artifact.`,
      remediation:
        'Set SAFETY_ROLLOUT_CHECKPOINT_ID to the immutable approval/audit-trail identifier (alphanumerics, ".", "_", ":", "-"; 8–128 chars).',
    });
  } else if (!SAFETY_ROLLOUT_CHECKPOINT_ID_PATTERN.test(checkpointId)) {
    issues.push({
      code: 'SAFETY_ROLLOUT_CHECKPOINT_ID_INVALID',
      message:
        `SAFETY_ROLLOUT_CHECKPOINT_ID does not match the required format (alphanumerics, ".", "_", ":", "-"; 8–128 chars). Received "${checkpointId}".`,
      remediation:
        'Reissue a checkpoint identifier that matches the allowed character set and length window, then update SAFETY_ROLLOUT_CHECKPOINT_ID.',
    });
  }

  if (expiresAtUtcRaw) {
    const expiresAtMs = parseIsoTimestampUtc(expiresAtUtcRaw);
    if (expiresAtMs === null) {
      issues.push({
        code: 'SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC_INVALID',
        message:
          `SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC must be a valid ISO-8601 UTC timestamp, received "${expiresAtUtcRaw}".`,
        remediation:
          'Use an ISO-8601 UTC timestamp (for example: 2026-05-30T00:00:00Z) or unset the variable for an open-ended gate.',
      });
    } else if (expiresAtMs <= Date.now()) {
      expired = true;
      issues.push({
        code: 'SAFETY_ROLLOUT_GATE_EXPIRED',
        message:
          `Safety rollout gate expired at ${expiresAtUtcRaw}; rollout approval must be refreshed before continuing.`,
        remediation:
          'Obtain a new rollout approval, rotate SAFETY_ROLLOUT_CHECKPOINT_ID, and update SAFETY_ROLLOUT_GATE_EXPIRES_AT_UTC to a future UTC timestamp.',
      });
    }
  }

  return {
    enabled,
    checkpointId,
    expiresAtUtc: expiresAtUtcRaw,
    expired,
    passed: issues.length === 0,
    issues,
  };
}
