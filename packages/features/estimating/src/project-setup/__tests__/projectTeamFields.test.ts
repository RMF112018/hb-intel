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
      additionalTeamMemberUpns: ['lead@hb.com', 'team@hb.com'],
    });

    expect(eligible).toEqual([
      'exec@hb.com',
      'pm@hb.com',
      'lead@hb.com',
      'support@hb.com',
      'team@hb.com',
    ]);
  });

  it('clears an invalid Timberscan approver and derives legacy fields', () => {
    const normalized = normalizeProjectSetupTeamFields({
      projectExecutiveUpn: 'exec@hb.com',
      projectManagerUpn: 'pm@hb.com',
      leadEstimatorUpn: 'lead@hb.com',
      supportingEstimatorUpns: ['support@hb.com'],
      additionalTeamMemberUpns: ['team@hb.com'],
      timberscanApproverUpn: 'removed@hb.com',
      viewerUPNs: ['viewer@hb.com'],
    });

    expect(normalized.timberscanApproverUpn).toBeUndefined();
    expect(normalized.projectLeadId).toBe('pm@hb.com');
    expect(normalized.groupLeaders).toEqual(['exec@hb.com']);
    expect(normalized.groupMembers).toEqual([
      'pm@hb.com',
      'lead@hb.com',
      'support@hb.com',
      'team@hb.com',
    ]);
    expect(normalized.viewerUPNs).toBeUndefined();
  });

  it('hydrates legacy team fields into the new Step 3 model without inventing missing roles', () => {
    const normalized = normalizeProjectSetupTeamFields({
      projectLeadId: 'pm@hb.com',
      groupMembers: ['pm@hb.com', 'team1@hb.com', 'team2@hb.com'],
      viewerUPNs: ['viewer@hb.com'],
    });

    expect(normalized.projectManagerUpn).toBe('pm@hb.com');
    expect(normalized.additionalTeamMemberUpns).toEqual(['team1@hb.com', 'team2@hb.com']);
    expect(normalized.projectExecutiveUpn).toBeUndefined();
    expect(normalized.leadEstimatorUpn).toBeUndefined();
    expect(normalized.timberscanApproverUpn).toBeUndefined();
    expect(normalized.viewerUPNs).toBeUndefined();
  });
});
