import { describe, expect, it } from 'vitest';
import {
  DRIFT_CATEGORIES,
  DRIFT_COMPARISON_INPUTS,
  DRIFT_REPAIR_NOT_EXECUTABLE_REASON,
  DRIFT_REPAIR_POSTURE_VERSION,
  DRIFT_SEVERITIES,
  PHASE_2_ALLOWED_REPAIR_MODES,
  PHASE_2_FORBIDDEN_REPAIR_MODES,
  REPAIR_LIFECYCLE_STAGES,
  REPAIR_MODES,
  type RepairPlan,
  type RepairPosture,
  validateRepairPlan,
  validateRepairPosture,
} from '../src/index.js';

const VALID_POSTURE: RepairPosture = Object.freeze({
  postureVersion: DRIFT_REPAIR_POSTURE_VERSION,
  allowedRepairModes: Object.freeze([...PHASE_2_ALLOWED_REPAIR_MODES]),
  currentMode: 'manual-review-only',
  automaticTenantRepair: false,
  backgroundRepair: false,
  graphPnpRepair: false,
  spfxTriggeredRepair: false,
  newProofRequiredAfterRepair: true,
  newApplyGateDecisionRequired: true,
  notExecutableReason: DRIFT_REPAIR_NOT_EXECUTABLE_REASON,
});

const VALID_PLAN: RepairPlan = Object.freeze({
  repairRef: 'REP-NONPROD-2026-04-28-001',
  driftCategory: 'configuration-drift',
  severity: 'warning',
  owner: 'pcc-oncall@example.com',
  manualRepairRunbookRef: 'docs/runbooks/pcc-manual-repair.md',
  preRepairSnapshotRequired: true,
  postRepairValidationRequired: true,
  approvalRequired: true,
  rollbackImpact: 'Manual review of configuration values; no irreversible side effects expected.',
  knownIrreversibleActions: Object.freeze([] as readonly string[]),
  recommendedAction: 'Re-run mapper with updated inputs and resubmit apply-gate request.',
  lifecycleStage: 'detected',
});

describe('drift / repair enums', () => {
  it('exposes the documented drift categories', () => {
    expect(DRIFT_CATEGORIES).toContain('none');
    expect(DRIFT_CATEGORIES).toContain('blocking-drift');
    expect(DRIFT_CATEGORIES).toContain('security-drift');
    expect(DRIFT_CATEGORIES.length).toBe(9);
  });

  it('exposes the documented drift severities', () => {
    expect(DRIFT_SEVERITIES).toEqual(['info', 'warning', 'error', 'blocking']);
  });

  it('exposes the documented repair modes and lifecycle stages', () => {
    expect(REPAIR_MODES).toContain('manual-review-only');
    expect(REPAIR_MODES).toContain('manual-repair-plan');
    expect(REPAIR_MODES).toContain('future-assisted-repair');
    expect(REPAIR_MODES).toContain('future-automated-repair');
    expect(REPAIR_LIFECYCLE_STAGES).toEqual([
      'detected',
      'triaged',
      'approved',
      'manually-repaired',
      'revalidated',
      'closed',
    ]);
  });

  it('partitions repair modes between Phase 2 allowed and forbidden', () => {
    expect(PHASE_2_ALLOWED_REPAIR_MODES).toEqual(['manual-review-only', 'manual-repair-plan']);
    expect(PHASE_2_FORBIDDEN_REPAIR_MODES).toEqual([
      'future-assisted-repair',
      'future-automated-repair',
    ]);
  });

  it('exposes the eleven canonical drift comparison inputs', () => {
    expect(DRIFT_COMPARISON_INPUTS.length).toBe(11);
    expect(DRIFT_COMPARISON_INPUTS).toContain('plannedHash-and-proofArtifactHash');
    expect(DRIFT_COMPARISON_INPUTS).toContain('tenant-observed-state');
  });
});

describe('validateRepairPosture', () => {
  it('accepts a posture with currentMode "manual-review-only"', () => {
    const r = validateRepairPosture(VALID_POSTURE);
    expect(r.ok, `errors: ${r.errors.join('; ')}`).toBe(true);
  });

  it('accepts a posture with currentMode "manual-repair-plan"', () => {
    const r = validateRepairPosture({ ...VALID_POSTURE, currentMode: 'manual-repair-plan' });
    expect(r.ok).toBe(true);
  });

  it('rejects forbidden Phase 2 repair modes', () => {
    for (const mode of PHASE_2_FORBIDDEN_REPAIR_MODES) {
      const r = validateRepairPosture({ ...VALID_POSTURE, currentMode: mode });
      expect(r.ok).toBe(false);
      expect(r.errors.some((e) => e.includes('currentMode'))).toBe(true);
    }
  });

  it('rejects when any automatic-repair flag is true', () => {
    for (const flag of [
      'automaticTenantRepair',
      'backgroundRepair',
      'graphPnpRepair',
      'spfxTriggeredRepair',
    ] as const) {
      const tampered = { ...VALID_POSTURE, [flag]: true };
      const r = validateRepairPosture(tampered);
      expect(r.ok).toBe(false);
      expect(r.errors.some((e) => e.includes(flag))).toBe(true);
    }
  });

  it('rejects when newProofRequiredAfterRepair is not true', () => {
    const r = validateRepairPosture({ ...VALID_POSTURE, newProofRequiredAfterRepair: false } as never);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('newProofRequiredAfterRepair'))).toBe(true);
  });

  it('rejects when newApplyGateDecisionRequired is not true', () => {
    const r = validateRepairPosture({ ...VALID_POSTURE, newApplyGateDecisionRequired: false } as never);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('newApplyGateDecisionRequired'))).toBe(true);
  });

  it('rejects when allowedRepairModes differs from the canonical Phase 2 set', () => {
    const r = validateRepairPosture({
      ...VALID_POSTURE,
      allowedRepairModes: Object.freeze(['manual-review-only']),
    });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('allowedRepairModes'))).toBe(true);
  });

  it('rejects a non-object input', () => {
    expect(validateRepairPosture(null).ok).toBe(false);
    expect(validateRepairPosture('hello').ok).toBe(false);
  });
});

describe('validateRepairPlan', () => {
  it('accepts a complete plan', () => {
    const r = validateRepairPlan(VALID_PLAN);
    expect(r.ok, `errors: ${r.errors.join('; ')}`).toBe(true);
  });

  it('rejects on missing required fields', () => {
    const { repairRef: _omit, ...stripped } = VALID_PLAN;
    void _omit;
    const r = validateRepairPlan(stripped);
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('repairRef'))).toBe(true);
  });

  it('rejects on invalid driftCategory', () => {
    const r = validateRepairPlan({ ...VALID_PLAN, driftCategory: 'mystery-drift' as never });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('driftCategory'))).toBe(true);
  });

  it('rejects on invalid severity', () => {
    const r = validateRepairPlan({ ...VALID_PLAN, severity: 'critical' as never });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('severity'))).toBe(true);
  });

  it('rejects on invalid lifecycleStage', () => {
    const r = validateRepairPlan({ ...VALID_PLAN, lifecycleStage: 'reopened' as never });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('lifecycleStage'))).toBe(true);
  });

  it('rejects when a boolean flag is non-boolean', () => {
    const r = validateRepairPlan({ ...VALID_PLAN, approvalRequired: 'yes' as never });
    expect(r.ok).toBe(false);
    expect(r.errors.some((e) => e.includes('approvalRequired'))).toBe(true);
  });
});
