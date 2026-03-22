import { describe, expect, it } from 'vitest';
import { toActiveProject } from './IProjectRegistryRecord.js';
import type { IProjectRegistryRecord } from './IProjectRegistryRecord.js';

function createMockRegistryRecord(
  overrides?: Partial<IProjectRegistryRecord>,
): IProjectRegistryRecord {
  return {
    projectId: 'proj-uuid-001',
    projectNumber: '26-001-01',
    siteUrl: 'https://tenant.sharepoint.com/sites/project-26-001-01',
    activatedAt: '2026-03-22T14:00:00.000Z',
    activatedByUpn: 'pm@example.com',
    sourceHandoffId: 'handoff-001',
    entraGroupSet: {
      leadersGroupId: 'group-leaders-001',
      teamGroupId: 'group-team-001',
      viewersGroupId: 'group-viewers-001',
    },
    projectName: 'Harbor View Medical Center',
    lifecycleStatus: 'Active',
    startDate: '2026-04-01T00:00:00.000Z',
    projectManagerUpn: 'pm@example.com',
    projectManagerName: 'Jane Smith',
    department: 'commercial',
    siteAssociations: [
      {
        siteUrl: 'https://tenant.sharepoint.com/sites/project-26-001-01',
        associationType: 'primary',
        associatedAt: '2026-03-22T14:00:00.000Z',
        associatedByUpn: 'pm@example.com',
      },
    ],
    ...overrides,
  };
}

describe('toActiveProject', () => {
  it('maps projectId to id', () => {
    const record = createMockRegistryRecord({ projectId: 'uuid-123' });
    const active = toActiveProject(record);
    expect(active.id).toBe('uuid-123');
  });

  it('maps projectName to name', () => {
    const record = createMockRegistryRecord({ projectName: 'Test Project' });
    const active = toActiveProject(record);
    expect(active.name).toBe('Test Project');
  });

  it('maps projectNumber to number', () => {
    const record = createMockRegistryRecord({ projectNumber: '26-002-01' });
    const active = toActiveProject(record);
    expect(active.number).toBe('26-002-01');
  });

  it('maps lifecycleStatus to status', () => {
    const record = createMockRegistryRecord({ lifecycleStatus: 'Planning' });
    const active = toActiveProject(record);
    expect(active.status).toBe('Planning');
  });

  it('maps startDate directly', () => {
    const record = createMockRegistryRecord({ startDate: '2026-06-01T00:00:00.000Z' });
    const active = toActiveProject(record);
    expect(active.startDate).toBe('2026-06-01T00:00:00.000Z');
  });

  it('maps scheduledCompletionDate to endDate', () => {
    const record = createMockRegistryRecord({ scheduledCompletionDate: '2027-12-31T00:00:00.000Z' });
    const active = toActiveProject(record);
    expect(active.endDate).toBe('2027-12-31T00:00:00.000Z');
  });

  it('defaults endDate to empty string when scheduledCompletionDate is absent', () => {
    const record = createMockRegistryRecord({ scheduledCompletionDate: undefined });
    const active = toActiveProject(record);
    expect(active.endDate).toBe('');
  });

  it('returns all 6 IActiveProject fields', () => {
    const record = createMockRegistryRecord();
    const active = toActiveProject(record);
    expect(Object.keys(active).sort()).toEqual(['endDate', 'id', 'name', 'number', 'startDate', 'status']);
  });
});
