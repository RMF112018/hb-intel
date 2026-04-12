/**
 * Phase-16 — submission seam validation.
 *
 * Proves `submitKudosDraft` enforces its contract without touching the
 * network:
 *   - pending/internal-only defaults on the POST payload
 *   - typed-recipient bucket handling (individuals ensure'd, buckets
 *     captured in ModeratorNotes)
 *   - text-mode fallback validation
 *   - cache invalidation on success
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../data/spContext.js', () => ({
  getKudosListHostUrl: () => 'https://tenant.sharepoint.com/sites/hb',
  getSiteUrl: () => 'https://tenant.sharepoint.com/sites/hb',
}));

const invalidateSpy = vi.fn();
vi.mock('../data/usePeopleCultureData.js', () => ({
  invalidatePeopleCultureCache: () => invalidateSpy(),
}));

import { submitKudosDraft } from '../data/peopleCultureSubmissionSource.js';
import { EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS } from '@hbc/ui-kit/homepage';

describe('submitKudosDraft — seam', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    invalidateSpy.mockReset();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('rejects submission when headline is missing', async () => {
    const res = await submitKudosDraft({
      recipientNames: 'Ren',
      headline: '',
      excerpt: 'ok',
      details: '',
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/headline/i);
  });

  it('rejects submission when excerpt is missing', async () => {
    const res = await submitKudosDraft({
      recipientNames: 'Ren',
      headline: 'H',
      excerpt: '',
      details: '',
    });
    expect(res.ok).toBe(false);
  });

  it('typed mode requires at least one bucket entry', async () => {
    const res = await submitKudosDraft({
      recipientNames: '',
      headline: 'H',
      excerpt: 'E',
      details: '',
      recipients: { ...EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS },
    });
    expect(res.ok).toBe(false);
    if (!res.ok) expect(res.error).toMatch(/recipient/i);
  });

  it('text mode requires recipientNames', async () => {
    const res = await submitKudosDraft({
      recipientNames: '   ',
      headline: 'H',
      excerpt: 'E',
      details: '',
    });
    expect(res.ok).toBe(false);
  });

  it('on success: posts pending/internal-only payload and invalidates cache', async () => {
    const calls: Array<{ url: string; init: RequestInit }> = [];
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push({ url, init: init ?? {} });
      if (url.endsWith('/contextinfo')) {
        return new Response(JSON.stringify({ FormDigestValue: 'digest' }), { status: 200 });
      }
      if (url.includes('ensureuser')) {
        return new Response(JSON.stringify({ Id: 42 }), { status: 200 });
      }
      // list item create
      return new Response(JSON.stringify({ Id: 999 }), { status: 201 });
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const res = await submitKudosDraft(
      {
        recipientNames: '',
        headline: 'Great work',
        excerpt: 'You did it',
        details: '',
        recipients: {
          ...EMPTY_KUDOS_COMPOSER_RECIPIENT_BUCKETS,
          individualEmails: ['ren@example.com'],
          teamLabels: ['Field Ops'],
        },
      },
      { submitterEmail: 'sam@example.com' },
    );

    expect(res.ok).toBe(true);
    if (res.ok) expect(res.itemId).toBe(999);

    const create = calls.find((c) => !c.url.endsWith('/contextinfo') && !c.url.includes('ensureuser'));
    expect(create).toBeDefined();
    const body = JSON.parse(create!.init.body as string);
    expect(body.WorkflowStatus).toBe('pending');
    expect(body.HomepageEnabled).toBe(false);
    expect(body.IsPinned).toBe(false);
    expect(body.IsFeatured).toBe(false);
    expect(body.IsScheduled).toBe(false);
    expect(body.WasEverPublished).toBe(false);
    expect(body.CelebrateCount).toBe(0);
    expect(body.ProminenceIntent).toBe('standard');
    // Typed individual resolved via ensureUser
    expect(body.IndividualRecipientsId?.results).toEqual([42]);
    // Bucket labels captured in ModeratorNotes
    expect(body.ModeratorNotes).toMatch(/Field Ops/);

    expect(invalidateSpy).toHaveBeenCalledOnce();
  });

  it('does not invalidate cache on server rejection', async () => {
    globalThis.fetch = vi.fn(async (url: string) => {
      if (url.endsWith('/contextinfo')) {
        return new Response(JSON.stringify({ FormDigestValue: 'd' }), { status: 200 });
      }
      return new Response('bad', { status: 400, statusText: 'Bad Request' });
    }) as unknown as typeof fetch;

    const res = await submitKudosDraft({
      recipientNames: 'Ren',
      headline: 'H',
      excerpt: 'E',
      details: '',
    });
    expect(res.ok).toBe(false);
    expect(invalidateSpy).not.toHaveBeenCalled();
  });
});
