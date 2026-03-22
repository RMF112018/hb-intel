import { describe, expect, it } from 'vitest';
import {
  validateActivationPreconditions,
  buildRegistryRecord,
} from './createProjectActivation.js';
import type { ProjectActivationInput } from './createProjectActivation.js';
import type { IProvisioningStatus } from '@hbc/models';
import type { IProjectHubSeedData } from '../handoff-config.js';

function createMockSeed(overrides?: Partial<IProjectHubSeedData>): IProjectHubSeedData {
  return {
    projectName: 'Harbor View Medical Center',
    projectNumber: '26-001-01',
    department: 'commercial',
    siteUrl: 'https://tenant.sharepoint.com/sites/project-26-001-01',
    projectLeadId: 'pm@example.com',
    groupMembers: ['member1@example.com'],
    startDate: '2026-04-01T00:00:00.000Z',
    estimatedValue: 12500000,
    clientName: 'Harbor View Health System',
    ...overrides,
  };
}

function createMockProvisioningStatus(
  overrides?: Partial<IProvisioningStatus>,
): IProvisioningStatus {
  return {
    projectId: 'prov-001',
    projectNumber: '26-001-01',
    projectName: 'Harbor View Medical Center',
    correlationId: 'corr-001',
    overallStatus: 'Completed',
    currentStep: 7,
    steps: [],
    triggeredBy: 'coordinator@example.com',
    submittedBy: 'coordinator@example.com',
    groupMembers: ['member1@example.com'],
    startedAt: '2026-03-20T10:00:00.000Z',
    entraGroups: {
      leadersGroupId: 'group-leaders-001',
      teamGroupId: 'group-team-001',
      viewersGroupId: 'group-viewers-001',
    },
    siteUrl: 'https://tenant.sharepoint.com/sites/project-26-001-01',
    ...overrides,
  } as IProvisioningStatus;
}

function createMockInput(overrides?: Partial<ProjectActivationInput>): ProjectActivationInput {
  return {
    handoffId: 'handoff-001',
    seed: createMockSeed(),
    provisioningStatus: createMockProvisioningStatus(),
    acknowledgedByUpn: 'pm@example.com',
    ...overrides,
  };
}

const emptyExistingIds = { projectNumbers: new Set<string>(), siteUrls: new Set<string>() };

describe('validateActivationPreconditions', () => {
  it('returns null when all preconditions pass', () => {
    const result = validateActivationPreconditions(createMockInput(), emptyExistingIds);
    expect(result).toBeNull();
  });

  it('rejects when provisioning is not complete', () => {
    const input = createMockInput({
      provisioningStatus: createMockProvisioningStatus({ overallStatus: 'InProgress' }),
    });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toContain('not complete');
  });

  it('accepts BaseComplete status', () => {
    const input = createMockInput({
      provisioningStatus: createMockProvisioningStatus({ overallStatus: 'BaseComplete' }),
    });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toBeNull();
  });

  it('rejects when siteUrl is missing', () => {
    const input = createMockInput({ seed: createMockSeed({ siteUrl: '' }) });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toContain('Site URL');
  });

  it('rejects when PM is not assigned', () => {
    const input = createMockInput({ seed: createMockSeed({ projectLeadId: '' }) });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toContain('Project lead');
  });

  it('rejects when department is missing', () => {
    const input = createMockInput({
      seed: createMockSeed({ department: undefined as unknown as 'commercial' }),
    });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toContain('Department');
  });

  it('rejects when entra groups are missing', () => {
    const input = createMockInput({
      provisioningStatus: createMockProvisioningStatus({ entraGroups: undefined }),
    });
    expect(validateActivationPreconditions(input, emptyExistingIds)).toContain('Entra');
  });

  it('rejects duplicate projectNumber', () => {
    const existingIds = {
      projectNumbers: new Set(['26-001-01']),
      siteUrls: new Set<string>(),
    };
    expect(validateActivationPreconditions(createMockInput(), existingIds)).toContain('already exists');
  });

  it('rejects duplicate siteUrl', () => {
    const existingIds = {
      projectNumbers: new Set<string>(),
      siteUrls: new Set(['https://tenant.sharepoint.com/sites/project-26-001-01']),
    };
    expect(validateActivationPreconditions(createMockInput(), existingIds)).toContain('already associated');
  });
});

describe('buildRegistryRecord', () => {
  it('generates UUID v4 format projectId', () => {
    const record = buildRegistryRecord(createMockInput());
    expect(record.projectId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('sets lifecycleStatus to Active', () => {
    const record = buildRegistryRecord(createMockInput());
    expect(record.lifecycleStatus).toBe('Active');
  });

  it('populates immutable audit fields', () => {
    const input = createMockInput();
    const record = buildRegistryRecord(input);
    expect(record.sourceHandoffId).toBe('handoff-001');
    expect(record.activatedByUpn).toBe('pm@example.com');
    expect(record.activatedAt).toBeTruthy();
  });

  it('creates primary site association', () => {
    const record = buildRegistryRecord(createMockInput());
    expect(record.siteAssociations).toHaveLength(1);
    expect(record.siteAssociations[0].associationType).toBe('primary');
    expect(record.siteAssociations[0].siteUrl).toBe(
      'https://tenant.sharepoint.com/sites/project-26-001-01',
    );
  });

  it('maps seed data to all required fields', () => {
    const record = buildRegistryRecord(createMockInput());
    expect(record.projectName).toBe('Harbor View Medical Center');
    expect(record.projectNumber).toBe('26-001-01');
    expect(record.siteUrl).toBe('https://tenant.sharepoint.com/sites/project-26-001-01');
    expect(record.department).toBe('commercial');
    expect(record.projectManagerUpn).toBe('pm@example.com');
    expect(record.estimatedValue).toBe(12500000);
    expect(record.clientName).toBe('Harbor View Health System');
  });

  it('maps entraGroupSet from provisioning status', () => {
    const record = buildRegistryRecord(createMockInput());
    expect(record.entraGroupSet.leadersGroupId).toBe('group-leaders-001');
    expect(record.entraGroupSet.teamGroupId).toBe('group-team-001');
    expect(record.entraGroupSet.viewersGroupId).toBe('group-viewers-001');
  });

  it('defaults startDate to activation time when seed has no startDate', () => {
    const input = createMockInput({ seed: createMockSeed({ startDate: undefined }) });
    const record = buildRegistryRecord(input);
    expect(record.startDate).toBe(record.activatedAt);
  });

  it('generates unique projectIds on successive calls', () => {
    const a = buildRegistryRecord(createMockInput());
    const b = buildRegistryRecord(createMockInput());
    expect(a.projectId).not.toBe(b.projectId);
  });
});
