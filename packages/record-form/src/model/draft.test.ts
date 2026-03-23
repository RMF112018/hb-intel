import { describe, it, expect } from 'vitest';
import { createDraft, markDraftDirty, compareDrafts } from './draft.js';

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createDraft', () => {
  it('creates draft with unique ID', () => {
    const d = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' }, fixedNow);
    expect(d.draftId).toBeTruthy();
    expect(d.isDirty).toBe(false);
    expect(d.mode).toBe('create');
  });
});

describe('markDraftDirty', () => {
  it('sets isDirty and updates timestamp', () => {
    const d = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'edit', authorUpn: 'u@e.com' }, fixedNow);
    const dirty = markDraftDirty(d);
    expect(dirty.isDirty).toBe(true);
    expect(dirty.lastSavedAtIso).toBeTruthy();
  });
});

describe('compareDrafts', () => {
  it('detects differing fields', () => {
    const local = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' }, fixedNow);
    const server = { ...local, isDirty: true, lastSavedAtIso: '2026-03-23T15:00:00.000Z' };
    const result = compareDrafts(local, server);
    expect(result.differingFields).toContain('isDirty');
    expect(result.hasLocalDraft).toBe(true);
    expect(result.hasServerDraft).toBe(true);
  });

  it('detects stale local draft', () => {
    const local = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' }, fixedNow);
    const localSaved = { ...local, lastSavedAtIso: '2026-03-23T13:00:00.000Z' };
    const server = { ...local, lastSavedAtIso: '2026-03-23T15:00:00.000Z' };
    const result = compareDrafts(localSaved, server);
    expect(result.isStale).toBe(true);
  });

  it('detects mode difference', () => {
    const local = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' }, fixedNow);
    const server = { ...local, mode: 'edit' as const };
    expect(compareDrafts(local, server).differingFields).toContain('mode');
  });

  it('detects author difference', () => {
    const local = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'a@e.com' }, fixedNow);
    const server = { ...local, authorUpn: 'b@e.com' };
    expect(compareDrafts(local, server).differingFields).toContain('authorUpn');
  });

  it('not stale when server has null timestamp', () => {
    const local = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' }, fixedNow);
    const result = compareDrafts(local, { ...local });
    expect(result.isStale).toBe(false);
  });

  it('creates draft with recordId and schemaVersion', () => {
    const d = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'edit', authorUpn: 'u@e.com', recordId: 'r1', schemaVersion: '2.0' }, fixedNow);
    expect(d.recordId).toBe('r1');
    expect(d.schemaVersion).toBe('2.0');
  });

  it('uses current time when now not provided', () => {
    const d = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' });
    expect(new Date(d.createdAtIso).getTime()).toBeGreaterThan(0);
  });

  it('markDraftDirty uses current time when now not provided', () => {
    const d = createDraft({ moduleKey: 'fin', projectId: 'p1', mode: 'create', authorUpn: 'u@e.com' }, fixedNow);
    const dirty = markDraftDirty(d);
    expect(new Date(dirty.lastSavedAtIso!).getTime()).toBeGreaterThan(0);
  });
});
