import { describe, it, expect, beforeEach } from 'vitest';
import type { IProjectSetupRequest } from '@hbc/models';
import { MockProjectRequestsRepository } from '../project-requests-repository.js';
import { PROJECTS_LIST_FIELD_MAP, PROJECTS_LIST_SELECT_FIELDS } from '../projects-list-contract.js';

/**
 * P2-09: SP field mapping contract tests — truthfulness audit.
 *
 * These tests are organized by what they actually prove:
 *
 * 1. Mock round-trip: proves the MockProjectRequestsRepository preserves
 *    all IProjectSetupRequest fields in memory. This is useful for unit
 *    test reliability but does NOT prove SharePoint persistence.
 *
 * 2. Real contract proof: validates PROJECTS_LIST_FIELD_MAP covers the
 *    canonical domain field set and the production schema. The actual
 *    mapper proof lives in projects-list-mapper.test.ts.
 *
 * 3. Regression guards: ensures future schema changes cannot silently
 *    drop fields without failing tests.
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
    // P2-07 gap fields
    projectStreetAddress: '123 Main St',
    projectCity: 'Wellington',
    projectCounty: 'Palm Beach',
    projectState: 'FL',
    projectZip: '33401',
    officeDivision: 'South Florida',
    procoreProject: '1234567',
    projectExecutiveUpn: 'exec@hb.com',
    projectManagerUpn: 'pm2@hb.com',
    leadEstimatorUpn: 'est@hb.com',
    supportingEstimatorUpns: ['est2@hb.com'],
    timberscanApproverUpn: 'ts@hb.com',
    sageAccessUpns: ['sage@hb.com'],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Mock round-trip — proves MockProjectRequestsRepository fidelity
//    NOTE: This does NOT prove SharePoint persistence. Real persistence
//    proof is in projects-list-mapper.test.ts (toDomain/toListItem tests).
// ─────────────────────────────────────────────────────────────────────────────

describe('Mock repository round-trip (in-memory only — not SP proof)', () => {
  let repo: MockProjectRequestsRepository;

  beforeEach(() => {
    repo = new MockProjectRequestsRepository();
  });

  it('preserves all IProjectSetupRequest fields through mock upsert→get', async () => {
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
    // P2-07 gap fields
    expect(retrieved!.projectStreetAddress).toBe(original.projectStreetAddress);
    expect(retrieved!.projectCity).toBe(original.projectCity);
    expect(retrieved!.projectCounty).toBe(original.projectCounty);
    expect(retrieved!.projectState).toBe(original.projectState);
    expect(retrieved!.projectZip).toBe(original.projectZip);
    expect(retrieved!.officeDivision).toBe(original.officeDivision);
    expect(retrieved!.procoreProject).toBe(original.procoreProject);
    expect(retrieved!.projectExecutiveUpn).toBe(original.projectExecutiveUpn);
    expect(retrieved!.projectManagerUpn).toBe(original.projectManagerUpn);
    expect(retrieved!.leadEstimatorUpn).toBe(original.leadEstimatorUpn);
    expect(retrieved!.supportingEstimatorUpns).toEqual(original.supportingEstimatorUpns);
    expect(retrieved!.timberscanApproverUpn).toBe(original.timberscanApproverUpn);
    expect(retrieved!.sageAccessUpns).toEqual(original.sageAccessUpns);
  });

  it('Year field defaults to undefined when not provided', async () => {
    const request = makeFullRequest();
    delete (request as any).year;
    await repo.upsertRequest(request);
    const retrieved = await repo.getRequest('req-full');
    expect(retrieved!.year).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Real contract proof — validates PROJECTS_LIST_FIELD_MAP completeness
//    This proves the field map covers the production schema. The mapper
//    tests in projects-list-mapper.test.ts prove serialization correctness.
// ─────────────────────────────────────────────────────────────────────────────

describe('Real field contract proof (PROJECTS_LIST_FIELD_MAP)', () => {
  it('field map covers all 59 production schema columns after My Projects schema expansion', () => {
    expect(Object.keys(PROJECTS_LIST_FIELD_MAP)).toHaveLength(59);
  });

  it('SELECT_FIELDS includes all mapped SP internal names', () => {
    const mapSpNames = Object.values(PROJECTS_LIST_FIELD_MAP).map((e) => e.spInternalName);
    for (const name of mapSpNames) {
      expect(PROJECTS_LIST_SELECT_FIELDS).toContain(name);
    }
  });

  it('legacy CSV-import columns use field_N pattern (excluding removed field_17/18/19)', () => {
    for (let i = 1; i <= 24; i++) {
      if (i === 17 || i === 18 || i === 19) continue; // removed or renamed in Gap 6
      const entry = Object.values(PROJECTS_LIST_FIELD_MAP).find(
        (e) => e.spInternalName === `field_${i}`,
      );
      expect(entry, `field_${i} must exist in PROJECTS_LIST_FIELD_MAP`).toBeDefined();
    }
  });

  it('viewerUPNs and addOns use renamed SP column names', () => {
    const viewerEntry = Object.values(PROJECTS_LIST_FIELD_MAP).find(
      (e) => e.spInternalName === 'viewerUPNs',
    );
    expect(viewerEntry, 'viewerUPNs must exist in PROJECTS_LIST_FIELD_MAP').toBeDefined();
    const addOnsEntry = Object.values(PROJECTS_LIST_FIELD_MAP).find(
      (e) => e.spInternalName === 'addOns',
    );
    expect(addOnsEntry, 'addOns must exist in PROJECTS_LIST_FIELD_MAP').toBeDefined();
  });

  it('P2-07 gap columns use domain-name internal names', () => {
    const p207Fields = [
      'projectStreetAddress', 'projectCity', 'projectCounty', 'projectState', 'projectZip',
      'officeDivision', 'procoreProject',
      'projectExecutiveUpn', 'projectManagerUpn', 'leadEstimatorUpn',
      'supportingEstimatorUpns', 'timberscanApproverUpn', 'sageAccessUpns',
      'clarificationRequestedAt', 'requesterRetryUsed', 'clarificationItems',
    ];
    for (const field of p207Fields) {
      const entry = PROJECTS_LIST_FIELD_MAP[field as keyof typeof PROJECTS_LIST_FIELD_MAP];
      expect(entry, `${field} must exist in PROJECTS_LIST_FIELD_MAP`).toBeDefined();
      // P2-07 columns use domain property name as SP internal name
      expect(entry.spInternalName).toBe(field);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Regression guards — prevents silent field loss
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression guards — field contract cannot silently shrink', () => {
  it('field map has at least 41 entries (cannot silently remove fields)', () => {
    expect(Object.keys(PROJECTS_LIST_FIELD_MAP).length).toBeGreaterThanOrEqual(41);
  });

  it('SELECT_FIELDS has at least 41 entries', () => {
    expect(PROJECTS_LIST_SELECT_FIELDS.length).toBeGreaterThanOrEqual(41);
  });

  it('every field map entry has a valid serialization strategy', () => {
    const validStrategies = new Set(['direct', 'json-array', 'number', 'computed']);
    for (const [key, entry] of Object.entries(PROJECTS_LIST_FIELD_MAP)) {
      expect(
        validStrategies.has(entry.serialization),
        `${key} has invalid serialization: ${entry.serialization}`,
      ).toBe(true);
    }
  });
});
