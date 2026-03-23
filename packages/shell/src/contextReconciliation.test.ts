import { describe, expect, it } from 'vitest';
import { reconcileProjectContext } from './contextReconciliation.js';

describe('reconcileProjectContext', () => {
  it('no mismatch when store matches route', () => {
    const result = reconcileProjectContext({
      routeProjectId: 'proj-001',
      storeProjectId: 'proj-001',
    });

    expect(result.mismatchDetected).toBe(false);
    expect(result.authoritativeProjectId).toBe('proj-001');
    expect(result.storeNeedsSync).toBe(false);
    expect(result.previousProjectId).toBeUndefined();
  });

  it('detects mismatch when store differs from route', () => {
    const result = reconcileProjectContext({
      routeProjectId: 'proj-002',
      storeProjectId: 'proj-001',
    });

    expect(result.mismatchDetected).toBe(true);
    expect(result.authoritativeProjectId).toBe('proj-002');
    expect(result.storeNeedsSync).toBe(true);
    expect(result.previousProjectId).toBe('proj-001');
  });

  it('route wins — authoritative is always route projectId', () => {
    const result = reconcileProjectContext({
      routeProjectId: 'route-project',
      storeProjectId: 'store-project',
    });

    expect(result.authoritativeProjectId).toBe('route-project');
  });

  it('null store (first load) — sync needed, no mismatch', () => {
    const result = reconcileProjectContext({
      routeProjectId: 'proj-001',
      storeProjectId: null,
    });

    expect(result.mismatchDetected).toBe(false);
    expect(result.storeNeedsSync).toBe(true);
    expect(result.authoritativeProjectId).toBe('proj-001');
    expect(result.previousProjectId).toBeUndefined();
  });

  it('returns previousProjectId for return-memory preservation', () => {
    const result = reconcileProjectContext({
      routeProjectId: 'new-project',
      storeProjectId: 'old-project',
    });

    expect(result.previousProjectId).toBe('old-project');
  });

  it('no previousProjectId when no mismatch', () => {
    const result = reconcileProjectContext({
      routeProjectId: 'proj-001',
      storeProjectId: 'proj-001',
    });

    expect(result.previousProjectId).toBeUndefined();
  });
});
