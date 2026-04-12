/**
 * Phase-16a/05 — direct tests for fetchKudosAuditTimeline.
 *
 * Proves row mapping, ascending sort by eventAt, malformed-row drop,
 * note handling, and failure fallback.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchKudosAuditTimeline } from '../data/kudosGovernanceWriter.js';

const SITE = 'https://harness.local/sites/hb';

function mockAuditResponse(body: unknown, ok = true, status = 200): void {
  globalThis.fetch = vi.fn(async () => ({
    ok,
    status,
    json: async () => body,
  })) as unknown as typeof fetch;
}

describe('fetchKudosAuditTimeline', () => {
  const originalFetch = globalThis.fetch;
  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns [] for blank kudosId without hitting network', async () => {
    const spy = vi.fn();
    globalThis.fetch = spy as unknown as typeof fetch;
    const rows = await fetchKudosAuditTimeline(SITE, '   ');
    expect(rows).toEqual([]);
    expect(spy).not.toHaveBeenCalled();
  });

  it('maps raw rows into timeline entries and sorts ascending by eventAt', async () => {
    mockAuditResponse({
      value: [
        {
          Id: 3,
          KudosId: 'k-1',
          EventType: 'approve',
          EventAt: '2026-04-12T12:00:00Z',
          Actor: { Id: 1, Title: 'Ava Admin', EMail: 'a@h.local' },
          InternalNote: '  reviewer note  ',
        },
        {
          Id: 1,
          KudosId: 'k-1',
          EventType: 'submit',
          EventAt: '2026-04-10T10:00:00Z',
          Actor: { Id: 2, Title: 'Sam Submitter', EMail: 's@h.local' },
          PublicNote: 'nice',
        },
        {
          Id: 2,
          KudosId: 'k-1',
          EventType: 'requestRevision',
          EventAt: '2026-04-11T11:00:00Z',
          Actor: { Id: 1, Title: 'Ava Admin', EMail: 'a@h.local' },
          InternalNote: '',
        },
      ],
    });
    const rows = await fetchKudosAuditTimeline(SITE, 'k-1');
    expect(rows.map((r) => r.eventType)).toEqual(['submit', 'requestRevision', 'approve']);
    expect(rows[0].publicNote).toBe('nice');
    expect(rows[0].actorDisplayName).toBe('Sam Submitter');
    // Empty internal note is trimmed to undefined.
    expect(rows[1].internalNote).toBeUndefined();
    expect(rows[2].internalNote).toBe('reviewer note');
  });

  it('drops rows missing EventType or EventAt', async () => {
    mockAuditResponse({
      value: [
        { Id: 1, KudosId: 'k-1', EventType: 'submit', EventAt: '2026-04-10T10:00:00Z', Actor: { Title: 'A' } },
        { Id: 2, KudosId: 'k-1', EventAt: '2026-04-11T10:00:00Z' }, // missing EventType
        { Id: 3, KudosId: 'k-1', EventType: 'approve' }, // missing EventAt
      ],
    });
    const rows = await fetchKudosAuditTimeline(SITE, 'k-1');
    expect(rows.map((r) => r.id)).toEqual([1]);
  });

  it('returns [] on non-ok response (failure fallback)', async () => {
    mockAuditResponse({}, false, 500);
    const rows = await fetchKudosAuditTimeline(SITE, 'k-1');
    expect(rows).toEqual([]);
  });

  it('defaults kudosId to the query input when raw row omits it', async () => {
    mockAuditResponse({
      value: [
        {
          Id: 1,
          EventType: 'submit',
          EventAt: '2026-04-10T10:00:00Z',
          Actor: { Title: 'A' },
        },
      ],
    });
    const rows = await fetchKudosAuditTimeline(SITE, 'k-inferred');
    expect(rows[0].kudosId).toBe('k-inferred');
  });
});
