/**
 * Tenant `HB Article Workflow History` round-trip drift guard.
 *
 * Pins the workflow-history contract (read + write) to the tenant
 * schema so the legacy `FromState` / `ToState` / `Action` / `Note`
 * field names and the legacy `inReview` workflow state cannot
 * silently slip back into the audit trail.
 */
import { describe, expect, it } from 'vitest';
import { mapWorkflowHistoryRow } from './publisherRowMappers';
import { mapWorkflowHistoryRowToListFields } from './publisherWriters';
import type { PublisherWorkflowHistoryRow } from './publisherContracts';
import { WORKFLOW_STATE_VALUES } from './publisherEnums';

const TENANT_RAW_HISTORY: Record<string, unknown> = {
  HistoryId: 'hst-001',
  ArticleId: 'art-2026-042',
  Title: 'draft → review',
  NewState: 'review',
  PreviousState: 'draft',
  ActionDateUtc: '2026-04-12T00:00:00Z',
  ActorEmail: 'editor@example.com',
  ActionNote: 'Submitted for review.',
};

describe('HB Article Workflow History — tenant round-trip', () => {
  it('uses the tenant `review` state value (never legacy `inReview`)', () => {
    expect(WORKFLOW_STATE_VALUES).toContain('review');
    expect(WORKFLOW_STATE_VALUES).toContain('scheduled');
    expect((WORKFLOW_STATE_VALUES as readonly string[])).not.toContain('inReview');
  });

  it('mapWorkflowHistoryRow reads every tenant-required column', () => {
    const row = mapWorkflowHistoryRow(TENANT_RAW_HISTORY);
    expect(row).toBeDefined();
    expect(row!.HistoryId).toBe('hst-001');
    expect(row!.ArticleId).toBe('art-2026-042');
    expect(row!.Title).toBe('draft → review');
    expect(row!.NewState).toBe('review');
    expect(row!.PreviousState).toBe('draft');
    expect(row!.ActorEmail).toBe('editor@example.com');
    expect(row!.ActionNote).toBe('Submitted for review.');
  });

  it('mapWorkflowHistoryRow rejects rows missing any tenant-required column', () => {
    for (const required of [
      'HistoryId',
      'ArticleId',
      'Title',
      'NewState',
      'ActionDateUtc',
    ] as const) {
      const incomplete = { ...TENANT_RAW_HISTORY };
      delete (incomplete as Record<string, unknown>)[required];
      expect(mapWorkflowHistoryRow(incomplete)).toBeUndefined();
    }
  });

  it('mapWorkflowHistoryRow rejects legacy ToState/FromState/Action/Note shape', () => {
    const legacy = {
      HistoryId: 'hst-001',
      ArticleId: 'art-2026-042',
      ToState: 'review',
      FromState: 'draft',
      Action: 'transition',
      ActionDateUtc: '2026-04-12T00:00:00Z',
      ActorEmail: 'editor@example.com',
      Note: 'legacy note',
    };
    // Missing tenant-required Title and NewState — rejected.
    expect(mapWorkflowHistoryRow(legacy)).toBeUndefined();
  });

  it('mapWorkflowHistoryRowToListFields emits tenant columns only', () => {
    const row: PublisherWorkflowHistoryRow = mapWorkflowHistoryRow(TENANT_RAW_HISTORY)!;
    const fields = mapWorkflowHistoryRowToListFields(row);
    expect(fields['HistoryId']).toBe('hst-001');
    expect(fields['ArticleId']).toBe('art-2026-042');
    expect(fields['Title']).toBe('draft → review');
    expect(fields['NewState']).toBe('review');
    expect(fields['PreviousState']).toBe('draft');
    expect(fields['ActionDateUtc']).toBe('2026-04-12T00:00:00Z');
    expect(fields['ActorEmail']).toBe('editor@example.com');
    expect(fields['ActionNote']).toBe('Submitted for review.');

    // Legacy fields must NEVER appear in the write payload.
    expect(fields['ToState']).toBeUndefined();
    expect(fields['FromState']).toBeUndefined();
    expect(fields['Action']).toBeUndefined();
    expect(fields['Note']).toBeUndefined();
  });

  it('round-trips a transition that uses tenant `review` end-to-end', () => {
    const handcrafted: PublisherWorkflowHistoryRow = {
      HistoryId: 'hst-roundtrip',
      ArticleId: 'art-roundtrip',
      Title: 'draft → review',
      NewState: 'review',
      PreviousState: 'draft',
      ActionDateUtc: '2026-04-12T00:00:00Z',
      ActorEmail: 'editor@example.com',
      ActionNote: 'Sent to review.',
    };
    const fields = mapWorkflowHistoryRowToListFields(handcrafted);
    expect(fields['NewState']).toBe('review');
    const reread = mapWorkflowHistoryRow(fields);
    expect(reread).toBeDefined();
    expect(reread!.NewState).toBe('review');
    expect(reread!.PreviousState).toBe('draft');
  });
});
