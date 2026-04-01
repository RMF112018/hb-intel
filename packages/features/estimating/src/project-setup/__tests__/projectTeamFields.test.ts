import { describe, expect, it } from 'vitest';
import {
  getEligibleTimberscanApprovers,
  normalizeProjectSetupTeamFields,
} from '../config/projectTeamFields.js';

describe('projectTeamFields', () => {
  it('builds stable deduplicated Timberscan approver options from upstream roles', () => {
    const eligible = getEligibleTimberscanApprovers({
      projectExecutiveUpn: 'exec@hb.com',
      projectManagerUpn: 'pm@hb.com',
      leadEstimatorUpn: 'lead@hb.com',
      supportingEstimatorUpns: ['support@hb.com', 'pm@hb.com'],
    });

    expect(eligible).toEqual([
      'exec@hb.com',
      'pm@hb.com',
      'lead@hb.com',
      'support@hb.com',
    ]);
  });

  it('clears an invalid Timberscan approver and derives legacy fields', () => {
    const normalized = normalizeProjectSetupTeamFields({
      projectExecutiveUpn: 'exec@hb.com',
      projectManagerUpn: 'pm@hb.com',
      leadEstimatorUpn: 'lead@hb.com',
      supportingEstimatorUpns: ['support@hb.com'],
      timberscanApproverUpn: 'removed@hb.com',
      viewerUPNs: ['viewer@hb.com'],
    });

    expect(normalized.timberscanApproverUpn).toBeUndefined();
    expect(normalized.groupLeaders).toEqual(['exec@hb.com']);
    expect(normalized.groupMembers).toEqual([
      'pm@hb.com',
      'lead@hb.com',
      'support@hb.com',
    ]);
    expect(normalized.viewerUPNs).toBeUndefined();
  });

  it('derives groupMembers from upstream role fields and clears viewerUPNs', () => {
    const normalized = normalizeProjectSetupTeamFields({
      projectManagerUpn: 'pm@hb.com',
      groupMembers: ['pm@hb.com', 'team1@hb.com', 'team2@hb.com'],
      viewerUPNs: ['viewer@hb.com'],
    });

    expect(normalized.projectManagerUpn).toBe('pm@hb.com');
    expect(normalized.groupMembers).toEqual(['pm@hb.com']);
    expect(normalized.projectExecutiveUpn).toBeUndefined();
    expect(normalized.leadEstimatorUpn).toBeUndefined();
    expect(normalized.timberscanApproverUpn).toBeUndefined();
    expect(normalized.viewerUPNs).toBeUndefined();
  });
});
