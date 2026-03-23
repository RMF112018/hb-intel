import { describe, expect, it } from 'vitest';
import { parseDeepLinkParams, buildTargetPathFromDeepLink } from './deepLinkHandler.js';

describe('parseDeepLinkParams', () => {
  it('parses projectId + module', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001', module: 'financial' },
      {},
    );

    expect(result.valid).toBe(true);
    expect(result.params?.projectId).toBe('proj-001');
    expect(result.params?.module).toBe('financial');
    expect(result.targetPath).toBe('/financial');
  });

  it('parses projectId only (project home)', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001' },
      {},
    );

    expect(result.valid).toBe(true);
    expect(result.params?.module).toBeUndefined();
    expect(result.targetPath).toBe('/');
  });

  it('parses all query parameters', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001', module: 'review' },
      {
        action: 'annotate',
        view: 'thread',
        reviewArtifactId: 'artifact-123',
        returnTo: '/sites/project-hub',
        source: 'spfx',
      },
    );

    expect(result.valid).toBe(true);
    expect(result.params?.action).toBe('annotate');
    expect(result.params?.view).toBe('thread');
    expect(result.params?.reviewArtifactId).toBe('artifact-123');
    expect(result.params?.returnTo).toBe('/sites/project-hub');
    expect(result.params?.source).toBe('spfx');
  });

  it('returns invalid when projectId is missing', () => {
    const result = parseDeepLinkParams({}, { source: 'spfx' });

    expect(result.valid).toBe(false);
    expect(result.params).toBeNull();
    expect(result.targetPath).toBe('/');
  });

  it('returns invalid when projectId is empty', () => {
    const result = parseDeepLinkParams({ projectId: '  ' }, {});

    expect(result.valid).toBe(false);
    expect(result.params).toBeNull();
  });

  it('sets isExternalArrival when source is present', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001' },
      { source: 'spfx' },
    );

    expect(result.isExternalArrival).toBe(true);
  });

  it('sets isExternalArrival=false when no source', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001' },
      {},
    );

    expect(result.isExternalArrival).toBe(false);
  });

  it('sets hasReturnTo when returnTo is present', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001' },
      { returnTo: '/sites/hub' },
    );

    expect(result.hasReturnTo).toBe(true);
  });

  it('sets hasReturnTo=false when no returnTo', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001' },
      {},
    );

    expect(result.hasReturnTo).toBe(false);
  });

  it('ignores empty query parameter values', () => {
    const result = parseDeepLinkParams(
      { projectId: 'proj-001' },
      { action: '', view: '', source: '' },
    );

    expect(result.params?.action).toBeUndefined();
    expect(result.params?.view).toBeUndefined();
    expect(result.params?.source).toBeUndefined();
    expect(result.isExternalArrival).toBe(false);
  });
});

describe('buildTargetPathFromDeepLink', () => {
  it('builds module path', () => {
    expect(buildTargetPathFromDeepLink({ projectId: 'p', module: 'financial' })).toBe('/financial');
  });

  it('returns / for project home when no module', () => {
    expect(buildTargetPathFromDeepLink({ projectId: 'p' })).toBe('/');
  });
});
