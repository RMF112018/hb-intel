import { describe, expect, it } from 'vitest';

import {
  INSPECTION_SCOPE,
  MASTER_BUILDING_CHECKPOINT_TEMPLATES,
  DEFICIENCY_HEALTH_IMPACT_RULES,
  DEFICIENCY_WORK_QUEUE_RULES,
  COMPLIANCE_CLOSEOUT_CONDITIONS,
} from '../../index.js';

describe('P3-E7-T04 contract stability', () => {
  it('INSPECTION_SCOPE is "permits/inspection"', () => {
    expect(INSPECTION_SCOPE).toBe('permits/inspection');
  });

  it('MASTER_BUILDING_CHECKPOINT_TEMPLATES has exactly 14 entries', () => {
    expect(MASTER_BUILDING_CHECKPOINT_TEMPLATES).toHaveLength(14);
  });

  it('all master building templates are for MASTER_BUILDING permit type', () => {
    for (const t of MASTER_BUILDING_CHECKPOINT_TEMPLATES) {
      expect(t.permitType).toBe('MASTER_BUILDING');
    }
  });

  it('Certificate of Occupancy is last and blocks closeout', () => {
    const co = MASTER_BUILDING_CHECKPOINT_TEMPLATES.find((t) => t.checkpointName === 'Certificate of Occupancy');
    expect(co).toBeTruthy();
    expect(co?.sequence).toBe(14);
    expect(co?.isBlockingCloseout).toBe(true);
  });

  it('Insulation is NOT blocking closeout', () => {
    const insulation = MASTER_BUILDING_CHECKPOINT_TEMPLATES.find((t) => t.checkpointName === 'Insulation');
    expect(insulation?.isBlockingCloseout).toBe(false);
  });

  it('DEFICIENCY_HEALTH_IMPACT_RULES has 9 rules', () => {
    expect(DEFICIENCY_HEALTH_IMPACT_RULES).toHaveLength(9);
  });

  it('HIGH+OPEN → CRITICAL', () => {
    const rule = DEFICIENCY_HEALTH_IMPACT_RULES.find((r) => r.severity === 'HIGH' && r.resolutionStatus === 'OPEN');
    expect(rule?.healthTierImpact).toBe('CRITICAL');
  });

  it('HIGH+RESOLVED → null (no impact)', () => {
    const rule = DEFICIENCY_HEALTH_IMPACT_RULES.find((r) => r.severity === 'HIGH' && r.resolutionStatus === 'RESOLVED');
    expect(rule?.healthTierImpact).toBeNull();
  });

  it('DEFICIENCY_WORK_QUEUE_RULES has 4 rules', () => {
    expect(DEFICIENCY_WORK_QUEUE_RULES).toHaveLength(4);
  });

  it('COMPLIANCE_CLOSEOUT_CONDITIONS has 4 conditions', () => {
    expect(COMPLIANCE_CLOSEOUT_CONDITIONS).toHaveLength(4);
  });
});
