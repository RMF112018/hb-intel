import { describe, expect, it } from 'vitest';
import {
  LegacyFallbackReviewService,
  type ILegacyFallbackReviewActionInput,
  type ILegacyFallbackManualBindInput,
} from '../legacy-fallback/review-service.js';
import type {
  ILegacyFallbackReviewRecord,
  ILegacyFallbackReviewRepository,
  ILegacyFallbackReviewUpdatePatch,
} from '../legacy-fallback/review-repository.js';

function makeRecord(overrides: Partial<ILegacyFallbackReviewRecord>): ILegacyFallbackReviewRecord {
  return {
    id: 1,
    projectNumber: '24-100-01',
    projectNameRaw: 'Project Alpha',
    projectNameNormalized: 'project alpha',
    legacyYear: 2024,
    sourceSiteName: '2024 Projects',
    sourceSitePath: '/sites/2024Projects',
    sourceLibraryName: 'Documents',
    driveId: 'drive-1',
    driveItemId: 'item-1',
    folderName: '24-100-01 Project Alpha',
    folderPath: '/24-100-01 Project Alpha',
    folderWebUrl: 'https://contoso.sharepoint.com/folder',
    matchStatus: 'review-required',
    matchConfidence: 'low',
    matchedProjectListItemId: null,
    matchedProjectTitle: '',
    matchMethod: 'manual-override',
    lastSeenUtc: '2026-04-17T00:00:00.000Z',
    lastValidatedUtc: '2026-04-17T00:00:00.000Z',
    discoveryRunId: 'run-1',
    notes: '',
    isActive: true,
    ...overrides,
  };
}

class InMemoryReviewRepository implements ILegacyFallbackReviewRepository {
  constructor(private readonly records: ILegacyFallbackReviewRecord[]) {}

  async listRecords(): Promise<readonly ILegacyFallbackReviewRecord[]> {
    return this.records;
  }

  async getRecordById(recordId: number): Promise<ILegacyFallbackReviewRecord | null> {
    return this.records.find((record) => record.id === recordId) ?? null;
  }

  async updateRecord(recordId: number, patch: ILegacyFallbackReviewUpdatePatch): Promise<void> {
    const idx = this.records.findIndex((record) => record.id === recordId);
    if (idx < 0) {
      return;
    }

    const current = this.records[idx];
    this.records[idx] = {
      ...current,
      ...(patch.matchStatus !== undefined ? { matchStatus: patch.matchStatus } : {}),
      ...(patch.matchConfidence !== undefined ? { matchConfidence: patch.matchConfidence } : {}),
      ...(patch.matchedProjectListItemId !== undefined
        ? { matchedProjectListItemId: patch.matchedProjectListItemId }
        : {}),
      ...(patch.matchedProjectTitle !== undefined ? { matchedProjectTitle: patch.matchedProjectTitle } : {}),
      ...(patch.matchMethod !== undefined ? { matchMethod: patch.matchMethod } : {}),
      ...(patch.lastValidatedUtc !== undefined ? { lastValidatedUtc: patch.lastValidatedUtc } : {}),
      ...(patch.discoveryRunId !== undefined ? { discoveryRunId: patch.discoveryRunId } : {}),
      ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
      ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
    };
  }
}

describe('LegacyFallbackReviewService', () => {
  it('returns only queue records by default and honors filters', async () => {
    const repo = new InMemoryReviewRepository([
      makeRecord({ id: 1, matchStatus: 'matched', matchConfidence: 'high' }),
      makeRecord({ id: 2, matchStatus: 'review-required', matchConfidence: 'low', legacyYear: 2023 }),
      makeRecord({ id: 3, matchStatus: 'unmatched', matchConfidence: 'none', legacyYear: 2024 }),
    ]);

    const service = new LegacyFallbackReviewService(repo);
    const queueOnly = await service.listRecords();

    expect(queueOnly.total).toBe(2);
    expect(queueOnly.items.map((item) => item.id)).toEqual([3, 2]);

    const filtered = await service.listRecords({ queueOnly: false, year: 2023, status: 'review-required' });
    expect(filtered.total).toBe(1);
    expect(filtered.items[0].id).toBe(2);
  });

  it('manual bind sets matched fields and appends trace notes', async () => {
    const repo = new InMemoryReviewRepository([
      makeRecord({
        id: 10,
        matchStatus: 'review-required',
        matchConfidence: 'low',
        notes: 'prior note',
      }),
    ]);

    const service = new LegacyFallbackReviewService(repo);
    const input: ILegacyFallbackManualBindInput = {
      recordId: 10,
      matchedProjectListItemId: 404,
      matchedProjectTitle: 'Project Delta',
      actorUpn: 'admin@hedrickbrothers.com',
      notes: 'confirmed by maintainer',
    };

    const updated = await service.manualBind(input);

    expect(updated.matchStatus).toBe('matched');
    expect(updated.matchConfidence).toBe('medium');
    expect(updated.matchMethod).toBe('manual-bind');
    expect(updated.isActive).toBe(true);
    expect(updated.matchedProjectListItemId).toBe(404);
    expect(updated.matchedProjectTitle).toBe('Project Delta');
    expect(updated.discoveryRunId.startsWith('manual-bind-')).toBe(true);
    expect(updated.notes).toContain('prior note');
    expect(updated.notes).toContain('action=manual-bind');
    expect(updated.notes).toContain('admin@hedrickbrothers.com');
  });

  it('ignore and disable set expected terminal statuses with provenance in notes', async () => {
    const repo = new InMemoryReviewRepository([
      makeRecord({ id: 21, matchStatus: 'review-required', matchMethod: 'normalized-title-year', notes: '' }),
      makeRecord({ id: 22, matchStatus: 'matched', matchMethod: 'project-number-exact', notes: '' }),
    ]);

    const service = new LegacyFallbackReviewService(repo);
    const ignoreInput: ILegacyFallbackReviewActionInput = {
      recordId: 21,
      actorUpn: 'admin@hedrickbrothers.com',
      notes: 'not a real project',
    };
    const disableInput: ILegacyFallbackReviewActionInput = {
      recordId: 22,
      actorUpn: 'admin@hedrickbrothers.com',
      notes: 'legacy folder retired',
    };

    const ignored = await service.ignoreRecord(ignoreInput);
    expect(ignored.matchStatus).toBe('ignored');
    expect(ignored.matchMethod).toBe('manual-override');
    expect(ignored.isActive).toBe(false);
    expect(ignored.discoveryRunId.startsWith('manual-ignore-')).toBe(true);
    expect(ignored.notes).toContain('previousStatus=review-required');
    expect(ignored.notes).toContain('previousMethod=normalized-title-year');

    const disabled = await service.disableRecord(disableInput);
    expect(disabled.matchStatus).toBe('disabled');
    expect(disabled.matchMethod).toBe('manual-override');
    expect(disabled.isActive).toBe(false);
    expect(disabled.discoveryRunId.startsWith('manual-disable-')).toBe(true);
    expect(disabled.notes).toContain('previousStatus=matched');
    expect(disabled.notes).toContain('previousMethod=project-number-exact');
  });

  it('throws for missing record', async () => {
    const repo = new InMemoryReviewRepository([]);
    const service = new LegacyFallbackReviewService(repo);

    await expect(service.getRecord(999)).rejects.toThrow('not found');
  });
});
