import { describe, expect, it } from 'vitest';
import {
  validateReclassificationAuthority,
  executeDepartmentReclassification,
  RECLASSIFICATION_APPROVER_ROLE,
} from './departmentReclassification.js';
import type { DepartmentReclassificationInput } from './departmentReclassification.js';
import type { IProjectRegistryRecord } from '@hbc/models';

function createMockRecord(
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

function createValidInput(
  overrides?: Partial<DepartmentReclassificationInput>,
): DepartmentReclassificationInput {
  return {
    projectId: 'proj-uuid-001',
    newDepartment: 'luxury-residential',
    approverUpn: 'opex-mgr@example.com',
    approverRole: RECLASSIFICATION_APPROVER_ROLE,
    reason: 'Project reclassified following client change to luxury residential segment.',
    ...overrides,
  };
}

describe('validateReclassificationAuthority', () => {
  it('returns null for valid Manager of Operational Excellence', () => {
    expect(validateReclassificationAuthority(createValidInput())).toBeNull();
  });

  it('rejects missing approver UPN', () => {
    expect(
      validateReclassificationAuthority(createValidInput({ approverUpn: '' })),
    ).toContain('Approver UPN');
  });

  it('rejects non-OpEx approver role', () => {
    const result = validateReclassificationAuthority(
      createValidInput({ approverRole: 'Project Manager' }),
    );
    expect(result).toContain('Manager of Operational Excellence');
  });

  it('rejects insufficient reason', () => {
    expect(
      validateReclassificationAuthority(createValidInput({ reason: 'short' })),
    ).toContain('minimum 10');
  });
});

describe('executeDepartmentReclassification', () => {
  it('updates department on the registry record', () => {
    const result = executeDepartmentReclassification(
      createValidInput(),
      createMockRecord(),
    );
    expect(result.updatedRecord.department).toBe('luxury-residential');
    expect(result.previousDepartment).toBe('commercial');
    expect(result.newDepartment).toBe('luxury-residential');
  });

  it('preserves all other registry record fields', () => {
    const record = createMockRecord();
    const result = executeDepartmentReclassification(
      createValidInput(),
      record,
    );
    expect(result.updatedRecord.projectId).toBe(record.projectId);
    expect(result.updatedRecord.projectName).toBe(record.projectName);
    expect(result.updatedRecord.projectNumber).toBe(record.projectNumber);
    expect(result.updatedRecord.siteUrl).toBe(record.siteUrl);
    expect(result.updatedRecord.entraGroupSet).toEqual(record.entraGroupSet);
  });

  it('throws when approver role is invalid', () => {
    expect(() =>
      executeDepartmentReclassification(
        createValidInput({ approverRole: 'Director' }),
        createMockRecord(),
      ),
    ).toThrow('Manager of Operational Excellence');
  });

  it('throws for same-department no-op', () => {
    expect(() =>
      executeDepartmentReclassification(
        createValidInput({ newDepartment: 'commercial' }),
        createMockRecord({ department: 'commercial' }),
      ),
    ).toThrow('already classified');
  });

  it('throws for projectId mismatch', () => {
    expect(() =>
      executeDepartmentReclassification(
        createValidInput({ projectId: 'wrong-id' }),
        createMockRecord(),
      ),
    ).toThrow('mismatch');
  });

  it('records audit timestamp', () => {
    const result = executeDepartmentReclassification(
      createValidInput(),
      createMockRecord(),
    );
    expect(result.auditTimestamp).toBeTruthy();
    expect(new Date(result.auditTimestamp).getTime()).not.toBeNaN();
  });

  it('returns previousDepartment for caller to handle override suspension', () => {
    const result = executeDepartmentReclassification(
      createValidInput(),
      createMockRecord({ department: 'commercial' }),
    );
    expect(result.previousDepartment).toBe('commercial');
  });
});
