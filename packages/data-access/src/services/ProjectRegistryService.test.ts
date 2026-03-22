import { describe, expect, it, beforeEach } from 'vitest';
import { MockProjectRegistryService } from './MockProjectRegistryService.js';
import type { IProjectRegistryRecord } from '@hbc/models';

function createMockRecord(
  overrides?: Partial<IProjectRegistryRecord>,
): IProjectRegistryRecord {
  return {
    projectId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
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

describe('MockProjectRegistryService', () => {
  let service: MockProjectRegistryService;

  const record1 = createMockRecord();
  const record2 = createMockRecord({
    projectId: 'b2c3d4e5-f6a7-8901-bcde-f23456789012',
    projectNumber: '26-002-01',
    projectName: 'Downtown Office Tower',
    department: 'luxury-residential',
    siteUrl: 'https://tenant.sharepoint.com/sites/project-26-002-01',
    siteAssociations: [
      {
        siteUrl: 'https://tenant.sharepoint.com/sites/project-26-002-01',
        associationType: 'primary',
        associatedAt: '2026-03-22T15:00:00.000Z',
        associatedByUpn: 'admin@example.com',
      },
    ],
  });

  beforeEach(() => {
    service = new MockProjectRegistryService();
    service.seed([record1, record2]);
  });

  describe('getByProjectId', () => {
    it('returns record when found', async () => {
      const result = await service.getByProjectId(record1.projectId);
      expect(result?.projectId).toBe(record1.projectId);
      expect(result?.projectName).toBe('Harbor View Medical Center');
    });

    it('returns null when not found', async () => {
      expect(await service.getByProjectId('nonexistent')).toBeNull();
    });
  });

  describe('getByProjectNumber', () => {
    it('returns record when found', async () => {
      const result = await service.getByProjectNumber('26-001-01');
      expect(result?.projectId).toBe(record1.projectId);
    });

    it('returns null when not found', async () => {
      expect(await service.getByProjectNumber('99-999-99')).toBeNull();
    });
  });

  describe('getBySiteUrl', () => {
    it('returns record matching a site association', async () => {
      const result = await service.getBySiteUrl(
        'https://tenant.sharepoint.com/sites/project-26-001-01',
      );
      expect(result?.projectId).toBe(record1.projectId);
    });

    it('returns null for unassociated site URL', async () => {
      expect(await service.getBySiteUrl('https://unknown.example.com')).toBeNull();
    });
  });

  describe('resolveProjectIdentity', () => {
    it('resolves UUID as projectId', async () => {
      const result = await service.resolveProjectIdentity(record1.projectId);
      expect(result?.projectId).toBe(record1.projectId);
    });

    it('resolves projectNumber format', async () => {
      const result = await service.resolveProjectIdentity('26-002-01');
      expect(result?.projectId).toBe(record2.projectId);
    });

    it('resolves site URL', async () => {
      const result = await service.resolveProjectIdentity(
        'https://tenant.sharepoint.com/sites/project-26-002-01',
      );
      expect(result?.projectId).toBe(record2.projectId);
    });

    it('returns null for unknown key', async () => {
      expect(await service.resolveProjectIdentity('unknown')).toBeNull();
    });

    it('returns null for empty string', async () => {
      expect(await service.resolveProjectIdentity('')).toBeNull();
    });

    it('trims whitespace', async () => {
      const result = await service.resolveProjectIdentity('  26-001-01  ');
      expect(result?.projectId).toBe(record1.projectId);
    });
  });

  describe('listByDepartment', () => {
    it('returns records matching department', async () => {
      const commercial = await service.listByDepartment('commercial');
      expect(commercial).toHaveLength(1);
      expect(commercial[0].projectId).toBe(record1.projectId);
    });

    it('returns records for luxury-residential', async () => {
      const luxury = await service.listByDepartment('luxury-residential');
      expect(luxury).toHaveLength(1);
      expect(luxury[0].projectId).toBe(record2.projectId);
    });

    it('returns empty array for department with no projects', async () => {
      service.clear();
      expect(await service.listByDepartment('commercial')).toEqual([]);
    });
  });

  describe('seed and clear', () => {
    it('clear removes all records', async () => {
      service.clear();
      expect(await service.getByProjectId(record1.projectId)).toBeNull();
    });

    it('seed replaces store contents', async () => {
      service.seed([record2]);
      expect(await service.getByProjectId(record1.projectId)).toBeNull();
      expect(await service.getByProjectId(record2.projectId)).not.toBeNull();
    });
  });
});
