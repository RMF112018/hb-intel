import { describe, expect, it } from 'vitest';
import {
  validateHandoffActivationPreconditions,
  buildRegistryRecordFromHandoff,
} from './handoffActivation.js';
import type { HandoffActivationInput } from './handoffActivation.js';

function createMockHandoffInput(
  overrides?: Partial<HandoffActivationInput>,
): HandoffActivationInput {
  return {
    handoffId: 'ext-handoff-001',
    projectName: 'Legacy Medical Center',
    projectNumber: '24-050-01',
    siteUrl: 'https://tenant.sharepoint.com/sites/project-24-050-01',
    department: 'commercial',
    projectManagerUpn: 'pm@example.com',
    entraGroupSet: {
      leadersGroupId: 'group-leaders-001',
      teamGroupId: 'group-team-001',
      viewersGroupId: 'group-viewers-001',
    },
    acknowledgedByUpn: 'admin@example.com',
    startDate: '2024-06-01T00:00:00.000Z',
    estimatedValue: 8500000,
    clientName: 'Legacy Health Partners',
    ...overrides,
  };
}

const emptyExistingIds = { projectNumbers: new Set<string>(), siteUrls: new Set<string>() };

describe('validateHandoffActivationPreconditions', () => {
  it('returns null when all preconditions pass', () => {
    expect(
      validateHandoffActivationPreconditions(createMockHandoffInput(), emptyExistingIds),
    ).toBeNull();
  });

  it('rejects missing projectName', () => {
    const input = createMockHandoffInput({ projectName: '' });
    expect(
      validateHandoffActivationPreconditions(input, emptyExistingIds),
    ).toContain('Project name');
  });

  it('rejects missing projectNumber', () => {
    const input = createMockHandoffInput({ projectNumber: '' });
    expect(
      validateHandoffActivationPreconditions(input, emptyExistingIds),
    ).toContain('Project number');
  });

  it('rejects missing siteUrl', () => {
    const input = createMockHandoffInput({ siteUrl: '' });
    expect(
      validateHandoffActivationPreconditions(input, emptyExistingIds),
    ).toContain('Site URL');
  });

  it('rejects missing department', () => {
    const input = createMockHandoffInput({
      department: '' as 'commercial',
    });
    expect(
      validateHandoffActivationPreconditions(input, emptyExistingIds),
    ).toContain('Department');
  });

  it('rejects missing PM UPN', () => {
    const input = createMockHandoffInput({ projectManagerUpn: '' });
    expect(
      validateHandoffActivationPreconditions(input, emptyExistingIds),
    ).toContain('Project Manager');
  });

  it('rejects incomplete entra group set', () => {
    const input = createMockHandoffInput({
      entraGroupSet: {
        leadersGroupId: 'group-leaders',
        teamGroupId: '',
        viewersGroupId: 'group-viewers',
      },
    });
    expect(
      validateHandoffActivationPreconditions(input, emptyExistingIds),
    ).toContain('Entra');
  });

  it('rejects duplicate projectNumber', () => {
    const existingIds = {
      projectNumbers: new Set(['24-050-01']),
      siteUrls: new Set<string>(),
    };
    expect(
      validateHandoffActivationPreconditions(createMockHandoffInput(), existingIds),
    ).toContain('already exists');
  });

  it('rejects duplicate siteUrl', () => {
    const existingIds = {
      projectNumbers: new Set<string>(),
      siteUrls: new Set(['https://tenant.sharepoint.com/sites/project-24-050-01']),
    };
    expect(
      validateHandoffActivationPreconditions(createMockHandoffInput(), existingIds),
    ).toContain('already associated');
  });
});

describe('buildRegistryRecordFromHandoff', () => {
  it('generates UUID v4 format projectId', () => {
    const record = buildRegistryRecordFromHandoff(createMockHandoffInput());
    expect(record.projectId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('sets lifecycleStatus to Active', () => {
    const record = buildRegistryRecordFromHandoff(createMockHandoffInput());
    expect(record.lifecycleStatus).toBe('Active');
  });

  it('populates immutable audit fields', () => {
    const record = buildRegistryRecordFromHandoff(createMockHandoffInput());
    expect(record.sourceHandoffId).toBe('ext-handoff-001');
    expect(record.activatedByUpn).toBe('admin@example.com');
    expect(record.activatedAt).toBeTruthy();
  });

  it('creates primary site association', () => {
    const record = buildRegistryRecordFromHandoff(createMockHandoffInput());
    expect(record.siteAssociations).toHaveLength(1);
    expect(record.siteAssociations[0].associationType).toBe('primary');
    expect(record.siteAssociations[0].siteUrl).toBe(
      'https://tenant.sharepoint.com/sites/project-24-050-01',
    );
  });

  it('maps all required fields', () => {
    const record = buildRegistryRecordFromHandoff(createMockHandoffInput());
    expect(record.projectName).toBe('Legacy Medical Center');
    expect(record.projectNumber).toBe('24-050-01');
    expect(record.department).toBe('commercial');
    expect(record.projectManagerUpn).toBe('pm@example.com');
    expect(record.entraGroupSet.leadersGroupId).toBe('group-leaders-001');
  });

  it('maps optional team anchor fields', () => {
    const input = createMockHandoffInput({
      superintendentUpn: 'super@example.com',
      superintendentName: 'Bob Super',
      projectExecutiveUpn: 'exec@example.com',
      projectExecutiveName: 'Alice Exec',
    });
    const record = buildRegistryRecordFromHandoff(input);
    expect(record.superintendentUpn).toBe('super@example.com');
    expect(record.superintendentName).toBe('Bob Super');
    expect(record.projectExecutiveUpn).toBe('exec@example.com');
    expect(record.projectExecutiveName).toBe('Alice Exec');
  });

  it('maps optional metadata fields', () => {
    const input = createMockHandoffInput({
      projectType: 'Healthcare',
      projectLocation: 'Portland, OR',
      scheduledCompletionDate: '2028-06-01T00:00:00.000Z',
    });
    const record = buildRegistryRecordFromHandoff(input);
    expect(record.projectType).toBe('Healthcare');
    expect(record.projectLocation).toBe('Portland, OR');
    expect(record.scheduledCompletionDate).toBe('2028-06-01T00:00:00.000Z');
  });

  it('defaults PM name to UPN when not provided', () => {
    const input = createMockHandoffInput({ projectManagerName: undefined });
    const record = buildRegistryRecordFromHandoff(input);
    expect(record.projectManagerName).toBe('pm@example.com');
  });

  it('uses provided PM name when available', () => {
    const input = createMockHandoffInput({ projectManagerName: 'Jane Smith' });
    const record = buildRegistryRecordFromHandoff(input);
    expect(record.projectManagerName).toBe('Jane Smith');
  });

  it('generates unique projectIds on successive calls', () => {
    const a = buildRegistryRecordFromHandoff(createMockHandoffInput());
    const b = buildRegistryRecordFromHandoff(createMockHandoffInput());
    expect(a.projectId).not.toBe(b.projectId);
  });
});
