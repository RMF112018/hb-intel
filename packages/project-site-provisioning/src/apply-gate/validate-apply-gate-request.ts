import {
  APPLY_GATE_APPROVAL_STATUSES,
  type ApplyGateRequest,
} from '../contracts/apply-gate.js';

export interface ApplyGateRequestValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const REQUIRED_TOP_LEVEL_FIELDS: ReadonlyArray<keyof ApplyGateRequest> = [
  'environment',
  'targetTenant',
  'manifest',
  'proofArtifact',
  'proofMarkdown',
  'operatorApproval',
  'rollbackPosture',
  'requestedBy',
  'requestedAt',
  'requestRef',
];

const REQUIRED_TARGET_TENANT_FIELDS = [
  'targetEnvironment',
  'tenantName',
  'tenantIdPlaceholder',
  'siteCollectionBaseUrl',
  'allowedSitePathPrefix',
  'operatorGroup',
  'dataClassification',
  'mutationMode',
] as const;

const REQUIRED_ROLLBACK_FIELDS = [
  'rollbackMode',
  'manualRepairOwner',
  'manualRepairRunbookRef',
  'knownIrreversibleActions',
  'preMutationSnapshotRequired',
  'postMutationValidationRequired',
] as const;

/**
 * Pure shape validator for an apply-gate request. Confirms required
 * fields are present and well-typed without reaching into the manifest
 * or proof-artifact business rules. The full evaluation pipeline lives
 * in `evaluateApplyGate`.
 */
export function validateApplyGateRequest(value: unknown): ApplyGateRequestValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(value)) {
    return { ok: false, errors: ['apply-gate request is not a plain object'] };
  }

  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (!(field in value)) {
      errors.push(`missing required apply-gate request field: ${field}`);
    }
  }

  if (typeof value['proofMarkdown'] !== 'string') {
    errors.push('proofMarkdown must be a string');
  }
  for (const field of ['requestedBy', 'requestedAt', 'requestRef'] as const) {
    if (typeof value[field] !== 'string' || (value[field] as string).length === 0) {
      errors.push(`${field} must be a non-empty string`);
    }
  }

  const env = value['environment'];
  if (env !== 'non-production' && env !== 'production') {
    errors.push('environment must be "non-production" or "production"');
  }

  const targetTenant = value['targetTenant'];
  if (!isPlainObject(targetTenant)) {
    errors.push('targetTenant must be an object');
  } else {
    for (const f of REQUIRED_TARGET_TENANT_FIELDS) {
      if (!(f in targetTenant)) {
        errors.push(`targetTenant.${f} is required`);
      }
    }
    if (targetTenant['targetEnvironment'] !== 'non-production') {
      errors.push('targetTenant.targetEnvironment must be "non-production"');
    }
    const mutationMode = targetTenant['mutationMode'];
    if (mutationMode !== 'blocked-in-step-5' && mutationMode !== 'future-non-production') {
      errors.push(
        'targetTenant.mutationMode must be "blocked-in-step-5" or "future-non-production"',
      );
    }
  }

  const approval = value['operatorApproval'];
  if (!isPlainObject(approval)) {
    errors.push('operatorApproval must be an object');
  } else {
    const status = approval['approvalStatus'];
    if (typeof status !== 'string' || !APPLY_GATE_APPROVAL_STATUSES.includes(status as never)) {
      errors.push(
        `operatorApproval.approvalStatus must be one of ${APPLY_GATE_APPROVAL_STATUSES.join(', ')}`,
      );
    }
    for (const f of ['approvedBy', 'approvedAt', 'approvalRef'] as const) {
      const v = approval[f];
      if (v !== null && typeof v !== 'string') {
        errors.push(`operatorApproval.${f} must be null or a string`);
      }
    }
    if ('approvalScope' in approval) {
      const scope = approval['approvalScope'];
      if (scope !== undefined && scope !== 'non-production-only') {
        errors.push('operatorApproval.approvalScope must be "non-production-only" when present');
      }
    }
  }

  const rollback = value['rollbackPosture'];
  if (!isPlainObject(rollback)) {
    errors.push('rollbackPosture must be an object');
  } else {
    for (const f of REQUIRED_ROLLBACK_FIELDS) {
      if (!(f in rollback)) {
        errors.push(`rollbackPosture.${f} is required`);
      }
    }
    const mode = rollback['rollbackMode'];
    if (mode !== 'manual-repair-plan' && mode !== 'future-automated-rollback') {
      errors.push(
        'rollbackPosture.rollbackMode must be "manual-repair-plan" or "future-automated-rollback"',
      );
    }
    if (
      typeof rollback['manualRepairOwner'] !== 'string' ||
      (rollback['manualRepairOwner'] as string).length === 0
    ) {
      errors.push('rollbackPosture.manualRepairOwner must be a non-empty string');
    }
    if (
      typeof rollback['manualRepairRunbookRef'] !== 'string' ||
      (rollback['manualRepairRunbookRef'] as string).length === 0
    ) {
      errors.push('rollbackPosture.manualRepairRunbookRef must be a non-empty string');
    }
    if (!Array.isArray(rollback['knownIrreversibleActions'])) {
      errors.push('rollbackPosture.knownIrreversibleActions must be an array');
    }
    if (typeof rollback['preMutationSnapshotRequired'] !== 'boolean') {
      errors.push('rollbackPosture.preMutationSnapshotRequired must be a boolean');
    }
    if (typeof rollback['postMutationValidationRequired'] !== 'boolean') {
      errors.push('rollbackPosture.postMutationValidationRequired must be a boolean');
    }
  }

  return { ok: errors.length === 0, errors: Object.freeze([...errors]) };
}
