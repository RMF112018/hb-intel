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
  passed: boolean;
  issues: ISafetyPermissionPostureIssue[];
}

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
  }

  return {
    posture,
    permissionModel: model,
    passed: issues.length === 0,
    issues,
  };
}
