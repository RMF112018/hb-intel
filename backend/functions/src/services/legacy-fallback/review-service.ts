import { randomUUID } from 'crypto';
import type { LegacyFallbackMatchStatus } from '@hbc/models/provisioning';
import type {
  ILegacyFallbackReviewRecord,
  ILegacyFallbackReviewRepository,
  ILegacyFallbackReviewUpdatePatch,
} from './review-repository.js';

export interface ILegacyFallbackReviewFilters {
  readonly status?: LegacyFallbackMatchStatus;
  readonly confidence?: 'high' | 'medium' | 'low' | 'none';
  readonly year?: number;
  readonly isActive?: boolean;
  readonly queueOnly?: boolean;
  readonly search?: string;
}

export interface ILegacyFallbackReviewListResult {
  readonly items: readonly ILegacyFallbackReviewRecord[];
  readonly total: number;
}

export interface ILegacyFallbackManualBindInput {
  readonly recordId: number;
  readonly matchedProjectListItemId: number;
  readonly matchedProjectTitle: string;
  readonly notes?: string;
  readonly actorUpn: string;
}

export interface ILegacyFallbackReviewActionInput {
  readonly recordId: number;
  readonly notes?: string;
  readonly actorUpn: string;
}

function normalizeSearch(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function appendAuditNote(existingNotes: string, actorUpn: string, action: string, note?: string): string {
  const timestamp = new Date().toISOString();
  const suffix = note?.trim() ? `; note=${note.trim()}` : '';
  const line = `[${timestamp}] actor=${actorUpn}; action=${action}${suffix}`;
  return existingNotes.trim() ? `${existingNotes.trim()}\n${line}` : line;
}

function isQueueRecord(record: ILegacyFallbackReviewRecord): boolean {
  if (record.matchStatus === 'review-required' || record.matchStatus === 'unmatched') {
    return true;
  }

  return record.matchConfidence === 'low' || record.matchConfidence === 'none';
}

function sortQueue(records: readonly ILegacyFallbackReviewRecord[]): ILegacyFallbackReviewRecord[] {
  return [...records].sort((a, b) => {
    const validatedDelta = Date.parse(b.lastValidatedUtc || '') - Date.parse(a.lastValidatedUtc || '');
    if (!Number.isNaN(validatedDelta) && validatedDelta !== 0) {
      return validatedDelta;
    }
    const seenDelta = Date.parse(b.lastSeenUtc || '') - Date.parse(a.lastSeenUtc || '');
    if (!Number.isNaN(seenDelta) && seenDelta !== 0) {
      return seenDelta;
    }
    return b.id - a.id;
  });
}

export class LegacyFallbackReviewService {
  constructor(private readonly repository: ILegacyFallbackReviewRepository) {}

  async listRecords(filters: ILegacyFallbackReviewFilters = {}): Promise<ILegacyFallbackReviewListResult> {
    const rows = await this.repository.listRecords();
    const search = normalizeSearch(filters.search);

    const filtered = rows.filter((row) => {
      if (filters.queueOnly !== false && !isQueueRecord(row)) return false;
      if (filters.status && row.matchStatus !== filters.status) return false;
      if (filters.confidence && row.matchConfidence !== filters.confidence) return false;
      if (filters.year !== undefined && row.legacyYear !== filters.year) return false;
      if (filters.isActive !== undefined && row.isActive !== filters.isActive) return false;

      if (search) {
        const haystack = [
          row.projectNumber,
          row.projectNameRaw,
          row.projectNameNormalized,
          row.folderName,
          row.sourceSiteName,
          row.matchStatus,
          row.matchConfidence,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(search)) return false;
      }

      return true;
    });

    const sorted = sortQueue(filtered);
    return {
      items: sorted,
      total: sorted.length,
    };
  }

  async manualBind(input: ILegacyFallbackManualBindInput): Promise<ILegacyFallbackReviewRecord> {
    const existing = await this.requireRecord(input.recordId);
    const notes = appendAuditNote(existing.notes, input.actorUpn, 'manual-bind', input.notes);

    const patch: ILegacyFallbackReviewUpdatePatch = {
      matchStatus: 'matched',
      matchConfidence: 'medium',
      matchedProjectListItemId: input.matchedProjectListItemId,
      matchedProjectTitle: input.matchedProjectTitle,
      matchMethod: 'manual-bind',
      lastValidatedUtc: new Date().toISOString(),
      discoveryRunId: `manual-bind-${randomUUID()}`,
      notes,
      isActive: true,
    };

    await this.repository.updateRecord(input.recordId, patch);
    return this.requireRecord(input.recordId);
  }

  async ignoreRecord(input: ILegacyFallbackReviewActionInput): Promise<ILegacyFallbackReviewRecord> {
    const existing = await this.requireRecord(input.recordId);
    const notes = appendAuditNote(
      existing.notes,
      input.actorUpn,
      `ignore(previousStatus=${existing.matchStatus},previousMethod=${existing.matchMethod})`,
      input.notes,
    );

    const patch: ILegacyFallbackReviewUpdatePatch = {
      matchStatus: 'ignored',
      matchMethod: 'manual-override',
      lastValidatedUtc: new Date().toISOString(),
      discoveryRunId: `manual-ignore-${randomUUID()}`,
      notes,
      isActive: false,
    };

    await this.repository.updateRecord(input.recordId, patch);
    return this.requireRecord(input.recordId);
  }

  async disableRecord(input: ILegacyFallbackReviewActionInput): Promise<ILegacyFallbackReviewRecord> {
    const existing = await this.requireRecord(input.recordId);
    const notes = appendAuditNote(
      existing.notes,
      input.actorUpn,
      `disable(previousStatus=${existing.matchStatus},previousMethod=${existing.matchMethod})`,
      input.notes,
    );

    const patch: ILegacyFallbackReviewUpdatePatch = {
      matchStatus: 'disabled',
      matchMethod: 'manual-override',
      lastValidatedUtc: new Date().toISOString(),
      discoveryRunId: `manual-disable-${randomUUID()}`,
      notes,
      isActive: false,
    };

    await this.repository.updateRecord(input.recordId, patch);
    return this.requireRecord(input.recordId);
  }

  async getRecord(recordId: number): Promise<ILegacyFallbackReviewRecord> {
    return this.requireRecord(recordId);
  }

  private async requireRecord(recordId: number): Promise<ILegacyFallbackReviewRecord> {
    const record = await this.repository.getRecordById(recordId);
    if (!record) {
      throw new Error(`Legacy fallback record ${recordId} not found.`);
    }
    return record;
  }
}
