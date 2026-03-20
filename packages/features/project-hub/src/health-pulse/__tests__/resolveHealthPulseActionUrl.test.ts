/**
 * Gate 12 (P2-C4 scenario 3): Health pulse → Project Hub navigation URL.
 * Verifies project-significance escalation URL contract.
 */
import { describe, it, expect } from 'vitest';
import { resolveHealthPulseActionUrl } from '../resolveHealthPulseActionUrl.js';

describe('resolveHealthPulseActionUrl (P2-C4 scenario 3)', () => {
  it('produces relative URL with projectId and health view', () => {
    const url = resolveHealthPulseActionUrl('PRJ-001');
    expect(url).toBe('/project-hub?projectId=PRJ-001&view=health');
  });

  it('encodes projectId for URL safety', () => {
    const url = resolveHealthPulseActionUrl('PRJ 001&special');
    expect(url).toContain('projectId=PRJ%20001%26special');
  });

  it('starts with /project-hub (project-significance escalation)', () => {
    const url = resolveHealthPulseActionUrl('PRJ-999');
    expect(url.startsWith('/project-hub')).toBe(true);
  });

  it('produces relative path (no origin)', () => {
    const url = resolveHealthPulseActionUrl('PRJ-001');
    expect(url).not.toContain('://');
  });
});
