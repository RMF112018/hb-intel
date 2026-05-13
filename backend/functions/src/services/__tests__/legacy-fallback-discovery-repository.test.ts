import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockGraph = vi.hoisted(() => ({
  listItems: vi.fn(),
  addItem: vi.fn(),
  updateItem: vi.fn(),
}));

vi.mock('../legacy-fallback/graph-list-client.js', () => {
  return {
    GraphListClient: class {
      listItems = mockGraph.listItems;
      addItem = mockGraph.addItem;
      updateItem = mockGraph.updateItem;
    },
  };
});

import { LegacyFallbackDiscoveryRepository } from '../legacy-fallback/discovery-repository.js';

const baseInput = {
  runId: 'run-001',
  discoveredAtUtc: '2026-05-13T00:00:00.000Z',
  projectNumber: '24-100-01',
  projectNameRaw: '24-100-01 Test Project',
  projectNameNormalized: 'test project',
  legacyYear: 2024,
  sourceSiteName: '2024 Projects',
  sourceSitePath: '/sites/2024Projects',
  sourceLibraryName: 'Documents',
  driveId: 'drive-a',
  driveItemId: 'item-a',
  folderName: '24-100-01 Test Project',
  folderPath: '/24-100-01 Test Project',
  folderWebUrl: 'https://example.invalid/folder-a',
  matching: {
    matchStatus: 'unmatched' as const,
    matchConfidence: 'none' as const,
    matchedProjectListItemId: null,
    matchedProjectTitle: null,
    matchMethod: 'no-match' as const,
    notes: 'no matching project',
  },
};

describe('LegacyFallbackDiscoveryRepository', () => {
  beforeEach(() => {
    mockGraph.listItems.mockReset();
    mockGraph.addItem.mockReset();
    mockGraph.updateItem.mockReset();
  });

  it('persists matching-engine truth instead of forced constants', async () => {
    mockGraph.listItems.mockResolvedValue([]);
    mockGraph.addItem.mockResolvedValue({ id: '1', fields: {} });

    const repository = new LegacyFallbackDiscoveryRepository();
    const outcome = await repository.upsertRegistryRecord(baseInput);

    expect(outcome).toBe('created');
    expect(mockGraph.addItem).toHaveBeenCalledTimes(1);
    const [, payload] = mockGraph.addItem.mock.calls[0] as [string, Record<string, unknown>];
    expect(payload.MatchStatus).toBe('unmatched');
    expect(payload.MatchConfidence).toBe('none');
    expect(payload.MatchMethod).toBe('no-match');

    const matchedInput = {
      ...baseInput,
      driveItemId: 'item-b',
      matching: {
        matchStatus: 'matched' as const,
        matchConfidence: 'high' as const,
        matchedProjectListItemId: 99,
        matchedProjectTitle: 'Authoritative Project',
        matchMethod: 'project-number-exact' as const,
        notes: 'exact match',
      },
    };

    await repository.upsertRegistryRecord(matchedInput);
    const [, matchedPayload] = mockGraph.addItem.mock.calls[1] as [string, Record<string, unknown>];
    expect(matchedPayload.MatchStatus).toBe('matched');
    expect(matchedPayload.MatchConfidence).toBe('high');
    expect(matchedPayload.MatchMethod).toBe('project-number-exact');
  });

  it('does not write manual My Projects fields during discovery refresh updates', async () => {
    mockGraph.listItems.mockResolvedValue([{ id: '44', fields: {} }]);
    mockGraph.updateItem.mockResolvedValue(undefined);

    const repository = new LegacyFallbackDiscoveryRepository();
    const outcome = await repository.upsertRegistryRecord({
      ...baseInput,
      matching: {
        matchStatus: 'review-required' as const,
        matchConfidence: 'low' as const,
        matchedProjectListItemId: null,
        matchedProjectTitle: null,
        matchMethod: 'normalized-title-year' as const,
        notes: 'possible title match',
      },
    });

    expect(outcome).toBe('updated');
    expect(mockGraph.updateItem).toHaveBeenCalledTimes(1);
    const [, , payload] = mockGraph.updateItem.mock.calls[0] as [string, number | string, Record<string, unknown>];

    expect(payload.MatchStatus).toBe('review-required');
    expect(payload.MatchConfidence).toBe('low');
    expect(payload.MatchMethod).toBe('normalized-title-year');

    // Discovery refresh must not blank or overwrite manual My Projects fields.
    expect(payload).not.toHaveProperty('LeadEstimatorUpns');
    expect(payload).not.toHaveProperty('EstimatorUpns');
    expect(payload).not.toHaveProperty('IdsManagerUpns');
    expect(payload).not.toHaveProperty('ProjectAccountantUpns');
    expect(payload).not.toHaveProperty('ProjectAdministratorUpns');
    expect(payload).not.toHaveProperty('ProjectCoordinatorUpns');
    expect(payload).not.toHaveProperty('SuperintendentUpns');
    expect(payload).not.toHaveProperty('LeadSuperintendentUpns');
    expect(payload).not.toHaveProperty('ProjectManagerUpns');
    expect(payload).not.toHaveProperty('LeadProjectManagerUpns');
    expect(payload).not.toHaveProperty('ProjectExecutiveUpns');
    expect(payload).not.toHaveProperty('SafetyCoordinatorUpns');
    expect(payload).not.toHaveProperty('QcManagerUpns');
    expect(payload).not.toHaveProperty('WarrantyManagerUpns');
    expect(payload).not.toHaveProperty('ProcoreProject');
  });
});
