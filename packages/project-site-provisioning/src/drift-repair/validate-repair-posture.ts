import {
  DRIFT_CATEGORIES,
  DRIFT_SEVERITIES,
  PHASE_2_ALLOWED_REPAIR_MODES,
  REPAIR_LIFECYCLE_STAGES,
  type DriftCategory,
  type DriftSeverity,
  type RepairLifecycleStage,
  type RepairMode,
} from '../contracts/drift-repair.js';

export interface PostureValidationResult {
  readonly ok: boolean;
  readonly errors: readonly string[];
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

const ALLOWED_REPAIR_MODES_SET = new Set<RepairMode>([...PHASE_2_ALLOWED_REPAIR_MODES]);

/**
 * Pure validator for a Phase 2 RepairPosture. Confirms the literal
 * no-execution flags, the lifecycle reset flags, and the allowed mode
 * set. Returns all violations rather than throwing on the first.
 */
export function validateRepairPosture(value: unknown): PostureValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(value)) {
    return { ok: false, errors: ['repair posture is not a plain object'] };
  }

  const currentMode = value['currentMode'];
  if (typeof currentMode !== 'string' || !ALLOWED_REPAIR_MODES_SET.has(currentMode as RepairMode)) {
    errors.push(
      `currentMode must be one of ${[...ALLOWED_REPAIR_MODES_SET].join(', ')}; got ${JSON.stringify(currentMode)}`,
    );
  }

  for (const flag of [
    'automaticTenantRepair',
    'backgroundRepair',
    'graphPnpRepair',
    'spfxTriggeredRepair',
  ] as const) {
    if (value[flag] !== false) {
      errors.push(`${flag} must be false`);
    }
  }

  for (const flag of ['newProofRequiredAfterRepair', 'newApplyGateDecisionRequired'] as const) {
    if (value[flag] !== true) {
      errors.push(`${flag} must be true`);
    }
  }

  const allowedRepairModes = value['allowedRepairModes'];
  if (!Array.isArray(allowedRepairModes)) {
    errors.push('allowedRepairModes must be an array');
  } else {
    const supplied = new Set(allowedRepairModes as RepairMode[]);
    if (
      supplied.size !== ALLOWED_REPAIR_MODES_SET.size ||
      [...ALLOWED_REPAIR_MODES_SET].some((m) => !supplied.has(m))
    ) {
      errors.push(
        `allowedRepairModes must equal the canonical Phase 2 set [${[...ALLOWED_REPAIR_MODES_SET].join(', ')}]`,
      );
    }
  }

  if (typeof value['notExecutableReason'] !== 'string' || (value['notExecutableReason'] as string).length === 0) {
    errors.push('notExecutableReason must be a non-empty string');
  }

  return { ok: errors.length === 0, errors: Object.freeze([...errors]) };
}

/**
 * Pure validator for a single RepairPlan record. Confirms required
 * fields, enum membership, and basic typing. Does not invoke any
 * tenant API.
 */
export function validateRepairPlan(value: unknown): PostureValidationResult {
  const errors: string[] = [];

  if (!isPlainObject(value)) {
    return { ok: false, errors: ['repair plan is not a plain object'] };
  }

  for (const f of [
    'repairRef',
    'driftCategory',
    'severity',
    'owner',
    'manualRepairRunbookRef',
    'rollbackImpact',
    'recommendedAction',
    'lifecycleStage',
  ] as const) {
    if (typeof value[f] !== 'string' || (value[f] as string).length === 0) {
      errors.push(`${f} must be a non-empty string`);
    }
  }

  if (
    typeof value['driftCategory'] === 'string' &&
    !(DRIFT_CATEGORIES as readonly string[]).includes(value['driftCategory'] as DriftCategory)
  ) {
    errors.push(`driftCategory must be one of ${DRIFT_CATEGORIES.join(', ')}`);
  }

  if (
    typeof value['severity'] === 'string' &&
    !(DRIFT_SEVERITIES as readonly string[]).includes(value['severity'] as DriftSeverity)
  ) {
    errors.push(`severity must be one of ${DRIFT_SEVERITIES.join(', ')}`);
  }

  if (
    typeof value['lifecycleStage'] === 'string' &&
    !(REPAIR_LIFECYCLE_STAGES as readonly string[]).includes(value['lifecycleStage'] as RepairLifecycleStage)
  ) {
    errors.push(`lifecycleStage must be one of ${REPAIR_LIFECYCLE_STAGES.join(', ')}`);
  }

  for (const f of [
    'preRepairSnapshotRequired',
    'postRepairValidationRequired',
    'approvalRequired',
  ] as const) {
    if (typeof value[f] !== 'boolean') {
      errors.push(`${f} must be a boolean`);
    }
  }

  if (!Array.isArray(value['knownIrreversibleActions'])) {
    errors.push('knownIrreversibleActions must be an array');
  }

  return { ok: errors.length === 0, errors: Object.freeze([...errors]) };
}
