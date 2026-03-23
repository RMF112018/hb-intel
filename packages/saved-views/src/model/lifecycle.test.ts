import { describe, it, expect } from 'vitest';
import { createSavedView } from './lifecycle.js';

const fixedNow = new Date('2026-03-23T14:00:00.000Z');

describe('createSavedView', () => {
  it('creates view with unique ID', () => {
    const v = createSavedView({ moduleKey: 'fin', workspaceKey: 'default', title: 'Test', scope: 'personal', filterClauses: [], sortBy: [], groupBy: [], presentation: {}, schemaVersion: 1 }, fixedNow);
    expect(v.viewId).toBeTruthy();
    expect(v.title).toBe('Test');
    expect(v.createdAtIso).toBe('2026-03-23T14:00:00.000Z');
  });

  it('throws on missing moduleKey', () => {
    expect(() => createSavedView({ moduleKey: '', workspaceKey: 'default', title: 'T', scope: 'personal', filterClauses: [], sortBy: [], groupBy: [], presentation: {}, schemaVersion: 1 }, fixedNow)).toThrow('moduleKey');
  });

  it('throws on missing workspaceKey', () => {
    expect(() => createSavedView({ moduleKey: 'fin', workspaceKey: '', title: 'T', scope: 'personal', filterClauses: [], sortBy: [], groupBy: [], presentation: {}, schemaVersion: 1 }, fixedNow)).toThrow('workspaceKey');
  });

  it('throws on missing title', () => {
    expect(() => createSavedView({ moduleKey: 'fin', workspaceKey: 'default', title: '', scope: 'personal', filterClauses: [], sortBy: [], groupBy: [], presentation: {}, schemaVersion: 1 }, fixedNow)).toThrow('title');
  });

  it('defaults isDefault to false', () => {
    const v = createSavedView({ moduleKey: 'fin', workspaceKey: 'default', title: 'T', scope: 'personal', filterClauses: [], sortBy: [], groupBy: [], presentation: {}, schemaVersion: 1 }, fixedNow);
    expect(v.isDefault).toBe(false);
  });

  it('uses current time when now not provided', () => {
    const v = createSavedView({ moduleKey: 'fin', workspaceKey: 'default', title: 'T', scope: 'personal', filterClauses: [], sortBy: [], groupBy: [], presentation: {}, schemaVersion: 1 });
    expect(new Date(v.createdAtIso).getTime()).toBeGreaterThan(0);
  });
});
