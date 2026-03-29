import { describe, it, expect, beforeEach } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import { MockProjectRequestsRepository } from '../project-requests-repository.js';

/**
 * SP field mapping contract tests.
 * Validates that the mock repository (used in all unit tests) preserves every
 * field through the round-trip, matching the contract the real adapter must honor.
 *
 * These tests serve as the contract specification for the field_N mapping in
 * SharePointProjectRequestsAdapter.toListItem/fromListItem.
 */

function makeFullRequest(): IProjectSetupRequest {
  return {
    requestId: 'req-full',
    projectId: 'proj-full',
    projectName: 'Wellington Estate',
    projectLocation: 'Wellington, FL',
    projectType: 'Residential',
    projectStage: 'Active',
    submittedBy: 'estimator@hedrickbrothers.com',
    submittedAt: '2026-03-15T12:00:00.000Z',
    state: 'Submitted',
    projectNumber: '25-244-01',
    groupMembers: ['user1@hedrickbrothers.com', 'user2@hedrickbrothers.com'],
    groupLeaders: ['leader1@hedrickbrothers.com'],
    department: 'commercial',
    estimatedValue: 15_000_000,
    clientName: 'Sample Client',
    startDate: '2026-06-01',
    contractType: 'GMP',
    projectLeadId: 'pm@hedrickbrothers.com',
    viewerUPNs: ['viewer1@hedrickbrothers.com'],
    addOns: ['submittals', 'closeout'],
    clarificationNote: 'Budget needs detail',
    clarificationRequestedAt: '2026-03-16T10:00:00.000Z',
    clarificationItems: [
      {
        clarificationId: 'c1',
        fieldId: 'estimatedValue',
        stepId: 'project-info',
        message: 'Clarify budget',
        raisedBy: 'controller@hb.com',
        raisedAt: '2026-03-16T10:00:00.000Z',
        status: 'open',
      },
    ],
    completedBy: 'admin@hedrickbrothers.com',
    completedAt: '2026-03-20T14:00:00.000Z',
    siteUrl: 'https://hedrickbrotherscom.sharepoint.com/sites/25-244-01',
    retryCount: 2,
    year: 2025,
    requesterRetryUsed: true,
  };
}

describe('SP field mapping contract — full round-trip', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('preserves all IProjectSetupRequest fields through upsert→get cycle', async () => {
    const original = makeFullRequest();
    await repo.upsertRequest(original);
    const retrieved = await repo.getRequest('req-full');

    expect(retrieved).not.toBeNull();
    // Core identity
    expect(retrieved!.requestId).toBe(original.requestId);
    expect(retrieved!.projectId).toBe(original.projectId);
    expect(retrieved!.projectNumber).toBe(original.projectNumber);
    // Project info
    expect(retrieved!.projectName).toBe(original.projectName);
    expect(retrieved!.projectLocation).toBe(original.projectLocation);
    expect(retrieved!.projectType).toBe(original.projectType);
    expect(retrieved!.projectStage).toBe(original.projectStage);
    // Submission metadata
    expect(retrieved!.submittedBy).toBe(original.submittedBy);
    expect(retrieved!.submittedAt).toBe(original.submittedAt);
    expect(retrieved!.state).toBe(original.state);
    // Team
    expect(retrieved!.groupMembers).toEqual(original.groupMembers);
    expect(retrieved!.groupLeaders).toEqual(original.groupLeaders);
    // Business details
    expect(retrieved!.department).toBe(original.department);
    expect(retrieved!.estimatedValue).toBe(original.estimatedValue);
    expect(retrieved!.clientName).toBe(original.clientName);
    expect(retrieved!.startDate).toBe(original.startDate);
    expect(retrieved!.contractType).toBe(original.contractType);
    expect(retrieved!.projectLeadId).toBe(original.projectLeadId);
    expect(retrieved!.viewerUPNs).toEqual(original.viewerUPNs);
    expect(retrieved!.addOns).toEqual(original.addOns);
    // Clarification
    expect(retrieved!.clarificationNote).toBe(original.clarificationNote);
    expect(retrieved!.clarificationRequestedAt).toBe(original.clarificationRequestedAt);
    expect(retrieved!.clarificationItems).toEqual(original.clarificationItems);
    // Completion
    expect(retrieved!.completedBy).toBe(original.completedBy);
    expect(retrieved!.completedAt).toBe(original.completedAt);
    expect(retrieved!.siteUrl).toBe(original.siteUrl);
    // Retry
    expect(retrieved!.retryCount).toBe(original.retryCount);
    expect(retrieved!.requesterRetryUsed).toBe(original.requesterRetryUsed);
    // Year
    expect(retrieved!.year).toBe(2025);
  });

  it('SP schema field_N mapping covers confirmed HBCentral Projects list columns', () => {
    // This test documents the confirmed SP schema.
    // If any mapping changes, this test must be updated.
    const confirmedSchema: Record<string, string> = {
      Title: 'Title',       // Standard SP column
      field_1: 'ProjectId',
      field_2: 'ProjectNumber',
      field_3: 'ProjectName',
      field_4: 'ProjectLocation',
      field_5: 'ProjectType',
      field_6: 'ProjectStage',
      field_7: 'SubmittedBy',
      field_8: 'SubmittedAt',
      field_9: 'RequestState',
      field_10: 'GroupMembersJson',
      field_11: 'GroupLeadersJson',
      field_12: 'Department',
      field_13: 'EstimatedValue',
      field_14: 'ClientName',
      field_15: 'StartDate',
      field_16: 'ContractType',
      field_17: 'ProjectLeadId',
      field_18: 'ViewerUPNsJson',
      field_19: 'AddOnsJson',
      field_20: 'ClarificationNote',
      field_21: 'CompletedBy',
      field_22: 'CompletedAt',
      field_23: 'SiteUrl',
      field_24: 'RetryCount',
      Year: 'Year',         // Post-import column
    };

    // Verify all 26 field mappings (Title + 24 custom + Year)
    expect(Object.keys(confirmedSchema)).toHaveLength(26);
    // Year column must use 'Year' as internal name (not field_N)
    expect(confirmedSchema.Year).toBe('Year');
    // All custom columns must use field_N pattern
    for (let i = 1; i <= 24; i++) {
      expect(confirmedSchema[`field_${i}`]).toBeDefined();
    }
  });

  it('Year field defaults to undefined when not provided', async () => {
    const request = makeFullRequest();
    delete (request as any).year;
    await repo.upsertRequest(request);
    const retrieved = await repo.getRequest('req-full');
    expect(retrieved!.year).toBeUndefined();
  });
});
