import { describe, expect, it } from 'vitest';
import { buildPwaDeepLink } from './buildPwaDeepLink.js';

describe('buildPwaDeepLink', () => {
  const base = 'https://app.example.com';

  it('builds basic URL with projectId only', () => {
    const url = buildPwaDeepLink(base, { projectId: 'proj-001' });
    expect(url).toBe('https://app.example.com/project-hub/proj-001?source=spfx');
  });

  it('includes module in path segment', () => {
    const url = buildPwaDeepLink(base, { projectId: 'proj-001', module: 'schedule' });
    expect(url).toBe('https://app.example.com/project-hub/proj-001/schedule?source=spfx');
  });

  it('includes action query parameter', () => {
    const url = buildPwaDeepLink(base, {
      projectId: 'proj-001',
      module: 'schedule',
      action: 'import',
    });
    expect(url).toContain('action=import');
    expect(url).toContain('source=spfx');
  });

  it('includes view query parameter', () => {
    const url = buildPwaDeepLink(base, {
      projectId: 'proj-001',
      module: 'reports',
      view: 'history',
    });
    expect(url).toContain('view=history');
  });

  it('includes reviewArtifactId for executive review escalation', () => {
    const url = buildPwaDeepLink(base, {
      projectId: 'proj-001',
      module: 'review',
      reviewArtifactId: 'artifact-uuid-123',
      view: 'thread',
    });
    expect(url).toContain('reviewArtifactId=artifact-uuid-123');
    expect(url).toContain('view=thread');
  });

  it('URL-encodes returnTo parameter', () => {
    const url = buildPwaDeepLink(base, {
      projectId: 'proj-001',
      module: 'schedule',
      returnTo: '/sites/project-hub/schedule',
    });
    expect(url).toContain('returnTo=%2Fsites%2Fproject-hub%2Fschedule');
  });

  it('defaults source to spfx', () => {
    const url = buildPwaDeepLink(base, { projectId: 'proj-001' });
    expect(url).toContain('source=spfx');
  });

  it('allows custom source override', () => {
    const url = buildPwaDeepLink(base, {
      projectId: 'proj-001',
      source: 'teams',
    });
    expect(url).toContain('source=teams');
    expect(url).not.toContain('source=spfx');
  });

  it('constructs full escalation URL with all parameters', () => {
    const url = buildPwaDeepLink(base, {
      projectId: 'proj-001',
      module: 'review',
      action: 'annotate',
      view: 'thread',
      reviewArtifactId: 'art-456',
      returnTo: '/sites/project-hub',
      source: 'spfx',
    });

    expect(url).toMatch(/^https:\/\/app\.example\.com\/project-hub\/proj-001\/review\?/);
    expect(url).toContain('action=annotate');
    expect(url).toContain('view=thread');
    expect(url).toContain('reviewArtifactId=art-456');
    expect(url).toContain('returnTo=%2Fsites%2Fproject-hub');
    expect(url).toContain('source=spfx');
  });

  it('strips trailing slash from base URL', () => {
    const url = buildPwaDeepLink('https://app.example.com/', { projectId: 'proj-001' });
    expect(url).toMatch(/^https:\/\/app\.example\.com\/project-hub\/proj-001/);
    expect(url).not.toContain('//project-hub');
  });

  it('encodes projectId with special characters', () => {
    const url = buildPwaDeepLink(base, { projectId: 'proj 001' });
    expect(url).toContain('proj%20001');
  });
});
