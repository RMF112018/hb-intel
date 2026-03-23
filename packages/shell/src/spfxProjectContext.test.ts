import { describe, expect, it } from 'vitest';
import { resolveSpfxProjectContext } from './spfxProjectContext.js';

describe('resolveSpfxProjectContext', () => {
  const mockRecord = {
    projectId: 'proj-uuid-001',
    projectName: 'Harbor View Medical Center',
    projectNumber: '26-001-01',
    department: 'commercial',
  };

  it('resolves with valid registry record', () => {
    const result = resolveSpfxProjectContext({
      siteUrl: 'https://tenant.sharepoint.com/sites/proj-001',
      registryRecord: mockRecord,
    });

    expect(result.resolved).toBe(true);
    expect(result.projectId).toBe('proj-uuid-001');
    expect(result.projectName).toBe('Harbor View Medical Center');
    expect(result.projectNumber).toBe('26-001-01');
    expect(result.siteUrl).toBe('https://tenant.sharepoint.com/sites/proj-001');
    expect(result.notFound).toBe(false);
  });

  it('returns not-found when registry record is null', () => {
    const result = resolveSpfxProjectContext({
      siteUrl: 'https://tenant.sharepoint.com/sites/unknown',
      registryRecord: null,
    });

    expect(result.resolved).toBe(false);
    expect(result.notFound).toBe(true);
    expect(result.projectId).toBeUndefined();
  });

  it('returns not-found for empty siteUrl', () => {
    const result = resolveSpfxProjectContext({
      siteUrl: '',
      registryRecord: mockRecord,
    });

    expect(result.resolved).toBe(false);
    expect(result.notFound).toBe(true);
  });

  it('returns not-found for whitespace-only siteUrl', () => {
    const result = resolveSpfxProjectContext({
      siteUrl: '   ',
      registryRecord: mockRecord,
    });

    expect(result.resolved).toBe(false);
    expect(result.notFound).toBe(true);
  });

  it('preserves siteUrl in result', () => {
    const result = resolveSpfxProjectContext({
      siteUrl: 'https://tenant.sharepoint.com/sites/proj-001',
      registryRecord: null,
    });

    expect(result.siteUrl).toBe('https://tenant.sharepoint.com/sites/proj-001');
  });
});
