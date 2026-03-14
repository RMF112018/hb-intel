import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { IProvisioningStatus } from '@hbc/models';
import type { IMockServices } from '../../../test-utils/mock-services.js';
import { createMockServices } from '../../../test-utils/mock-services.js';

// Set OPEX_UPN before importing step6 (module-level const reads it at load time)
const OPEX_UPN = 'opex@hb.com';
process.env.OPEX_MANAGER_UPN = OPEX_UPN;

// Dynamic import to ensure env is set before module-level const evaluation
const { executeStep6 } = await import('./step6-permissions.js');

function makeStatus(overrides?: Partial<IProvisioningStatus>): IProvisioningStatus {
  return {
    projectId: 'proj-1',
    projectNumber: '25-001-01',
    projectName: 'Test Project',
    correlationId: 'corr-1',
    overallStatus: 'InProgress',
    currentStep: 6,
    steps: [],
    siteUrl: 'https://hbconstruction.sharepoint.com/sites/25-001-01',
    triggeredBy: 'trigger@hb.com',
    submittedBy: 'submitter@hb.com',
    groupMembers: ['member1@hb.com', 'member2@hb.com'],
    startedAt: new Date().toISOString(),
    step5DeferredToTimer: false,
    step5TimerRetryCount: 0,
    retryCount: 0,
    ...overrides,
  };
}

describe('executeStep6 — Set Permissions', () => {
  let services: IMockServices;
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv, OPEX_MANAGER_UPN: OPEX_UPN };
    services = createMockServices();

    // Default: no existing groups (force creation)
    services.graph.getGroupByDisplayName.mockResolvedValue(null);
    services.graph.createSecurityGroup.mockImplementation(
      async (_name: string) => `mock-group-${Math.random().toString(36).slice(2, 8)}`
    );
    services.graph.addGroupMembers.mockResolvedValue(undefined);
    services.sharePoint.assignGroupToPermissionLevel.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('returns Failed when siteUrl is not set', async () => {
    const status = makeStatus({ siteUrl: undefined });
    const result = await executeStep6(services, status);
    expect(result.status).toBe('Failed');
    expect(result.errorMessage).toContain('siteUrl');
  });

  it('creates 3 groups, populates members, assigns SP permissions', async () => {
    const status = makeStatus({
      groupLeaders: ['leader@hb.com'],
    });

    const result = await executeStep6(services, status);

    expect(result.status).toBe('Completed');
    // 3 groups created (Leaders, Team, Viewers)
    expect(services.graph.createSecurityGroup).toHaveBeenCalledTimes(3);
    // 3 getGroupByDisplayName calls (idempotency check)
    expect(services.graph.getGroupByDisplayName).toHaveBeenCalledTimes(3);
    // addGroupMembers: leaders + team + viewers (if viewers present)
    expect(services.graph.addGroupMembers).toHaveBeenCalledTimes(2); // leaders + team (no dept viewers)
    // 3 SP permission assignments
    expect(services.sharePoint.assignGroupToPermissionLevel).toHaveBeenCalledTimes(3);
    // entraGroups stored on status
    expect(status.entraGroups).toBeDefined();
    expect(status.entraGroups!.leadersGroupId).toBeTruthy();
    expect(status.entraGroups!.teamGroupId).toBeTruthy();
    expect(status.entraGroups!.viewersGroupId).toBeTruthy();
  });

  it('idempotent: skips create when getGroupByDisplayName returns existing ID', async () => {
    services.graph.getGroupByDisplayName.mockResolvedValue('existing-group-id');

    const result = await executeStep6(services, makeStatus());

    expect(result.status).toBe('Completed');
    expect(services.graph.createSecurityGroup).not.toHaveBeenCalled();
  });

  it('uses triggeredBy as fallback when no groupLeaders specified', async () => {
    const status = makeStatus({ groupLeaders: undefined });
    await executeStep6(services, status);

    // Leaders group members should include triggeredBy + OPEX_UPN
    const leadersMembersCall = services.graph.addGroupMembers.mock.calls[0];
    const memberUpns = leadersMembersCall[1] as string[];
    expect(memberUpns).toContain('trigger@hb.com');
    expect(memberUpns).toContain(OPEX_UPN);
  });

  it('uses groupLeaders when provided instead of triggeredBy', async () => {
    const status = makeStatus({ groupLeaders: ['leader1@hb.com', 'leader2@hb.com'] });
    await executeStep6(services, status);

    const leadersMembersCall = services.graph.addGroupMembers.mock.calls[0];
    const memberUpns = leadersMembersCall[1] as string[];
    expect(memberUpns).toContain('leader1@hb.com');
    expect(memberUpns).toContain('leader2@hb.com');
    expect(memberUpns).toContain(OPEX_UPN);
  });

  it('populates viewers from department env var', async () => {
    process.env.DEPT_BACKGROUND_ACCESS_COMMERCIAL = 'viewer1@hb.com,viewer2@hb.com';
    const status = makeStatus({ department: 'commercial' as IProvisioningStatus['department'] });

    await executeStep6(services, status);

    // 3 addGroupMembers calls: leaders, team, viewers
    expect(services.graph.addGroupMembers).toHaveBeenCalledTimes(3);
    const viewersMembersCall = services.graph.addGroupMembers.mock.calls[2];
    const viewerUpns = viewersMembersCall[1] as string[];
    expect(viewerUpns).toContain('viewer1@hb.com');
    expect(viewerUpns).toContain('viewer2@hb.com');
  });

  it('deduplicates OPEX_UPN with leaders', async () => {
    const status = makeStatus({ groupLeaders: [OPEX_UPN, 'other@hb.com'] });
    await executeStep6(services, status);

    const leadersMembersCall = services.graph.addGroupMembers.mock.calls[0];
    const memberUpns = leadersMembersCall[1] as string[];
    const opexCount = memberUpns.filter((u: string) => u === OPEX_UPN).length;
    expect(opexCount).toBe(1);
  });

  it('returns Failed with error message on Graph error', async () => {
    services.graph.createSecurityGroup.mockRejectedValue(new Error('Graph API timeout'));

    const result = await executeStep6(services, makeStatus());

    expect(result.status).toBe('Failed');
    expect(result.errorMessage).toContain('Graph API timeout');
  });

  it('returns Failed with stringified message on non-Error throw', async () => {
    services.graph.createSecurityGroup.mockRejectedValue('string-error');

    const result = await executeStep6(services, makeStatus());

    expect(result.status).toBe('Failed');
    expect(result.errorMessage).toBe('string-error');
  });

  it('assigns correct SharePoint permission levels', async () => {
    let callIndex = 0;
    services.graph.createSecurityGroup.mockImplementation(async () => `group-${callIndex++}`);

    await executeStep6(services, makeStatus());

    const spCalls = services.sharePoint.assignGroupToPermissionLevel.mock.calls;
    expect(spCalls[0][2]).toBe('Full Control');
    expect(spCalls[1][2]).toBe('Contribute');
    expect(spCalls[2][2]).toBe('Read');
  });

  it('uses triggeredBy as fallback when groupLeaders is empty array', async () => {
    const status = makeStatus({ groupLeaders: [] });
    await executeStep6(services, status);

    const leadersMembersCall = services.graph.addGroupMembers.mock.calls[0];
    const memberUpns = leadersMembersCall[1] as string[];
    expect(memberUpns).toContain('trigger@hb.com');
  });

  it('skips viewer population when no department set', async () => {
    const status = makeStatus({ department: undefined });
    await executeStep6(services, status);

    // Only leaders + team calls; no viewers call
    expect(services.graph.addGroupMembers).toHaveBeenCalledTimes(2);
  });

  it('builds correct display names from projectNumber', async () => {
    const status = makeStatus({ projectNumber: '25-999-01' });
    await executeStep6(services, status);

    const displayNames = services.graph.getGroupByDisplayName.mock.calls.map((c: unknown[]) => c[0]);
    expect(displayNames).toContain('HB-25-999-01-Leaders');
    expect(displayNames).toContain('HB-25-999-01-Team');
    expect(displayNames).toContain('HB-25-999-01-Viewers');
  });
});
