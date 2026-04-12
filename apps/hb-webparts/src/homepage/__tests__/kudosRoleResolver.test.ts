/**
 * Phase-16a/05 — direct tests for resolveKudosRole.
 *
 * Mocks the SharePoint `/_api/web/currentuser?$expand=Groups` endpoint
 * so the production code path runs end-to-end but without live SP.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearKudosRoleCache,
  resolveKudosRole,
} from '../helpers/kudosRoleResolver.js';

const SITE = 'https://harness.local/sites/hb';

function mockCurrentUser(body: unknown, ok = true, status = 200): void {
  globalThis.fetch = vi.fn(async (url: RequestInfo | URL) => {
    if (String(url).includes('/_api/web/currentuser')) {
      return {
        ok,
        status,
        json: async () => body,
      } as unknown as Response;
    }
    return { ok: false, status: 404, json: async () => ({}) } as unknown as Response;
  }) as unknown as typeof fetch;
}

describe('resolveKudosRole', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    clearKudosRoleCache();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns admin when IsSiteAdmin is true', async () => {
    mockCurrentUser({ IsSiteAdmin: true, Groups: [] });
    const role = await resolveKudosRole({
      siteUrl: SITE,
      currentUserEmail: 'a@h.local',
    });
    expect(role).toBe('admin');
  });

  it('returns admin when user is in HB Kudos Admins group', async () => {
    mockCurrentUser({
      IsSiteAdmin: false,
      Groups: [{ Title: 'HB Kudos Admins' }, { Title: 'Some Other' }],
    });
    const role = await resolveKudosRole({ siteUrl: SITE });
    expect(role).toBe('admin');
  });

  it('returns reviewer when user is in HB Kudos Reviewers group only', async () => {
    mockCurrentUser({
      IsSiteAdmin: false,
      Groups: [{ Title: 'HB Kudos Reviewers' }],
    });
    const role = await resolveKudosRole({ siteUrl: SITE });
    expect(role).toBe('reviewer');
  });

  it('returns viewer when user has neither canonical group', async () => {
    mockCurrentUser({ IsSiteAdmin: false, Groups: [{ Title: 'Other' }] });
    const role = await resolveKudosRole({ siteUrl: SITE });
    expect(role).toBe('viewer');
  });

  it('fails closed to viewer on REST failure', async () => {
    mockCurrentUser({}, false, 500);
    const role = await resolveKudosRole({ siteUrl: SITE });
    expect(role).toBe('viewer');
  });

  it('fails closed to viewer on network throw', async () => {
    globalThis.fetch = vi.fn(async () => {
      throw new Error('offline');
    }) as unknown as typeof fetch;
    const role = await resolveKudosRole({ siteUrl: SITE });
    expect(role).toBe('viewer');
  });

  it('falls back to simulatedRole when siteUrl is undefined', async () => {
    const role = await resolveKudosRole({
      siteUrl: undefined,
      simulatedRole: 'reviewer',
    });
    expect(role).toBe('reviewer');
  });

  it('simulatedRole fallback fails closed to viewer on malformed input', async () => {
    const role = await resolveKudosRole({ siteUrl: undefined, simulatedRole: 'nonsense' });
    expect(role).toBe('viewer');
  });

  it('ignores malformed Groups entries (missing Title)', async () => {
    mockCurrentUser({
      IsSiteAdmin: false,
      Groups: [{ Title: undefined }, { notTitle: 'bogus' }, { Title: 'HB Kudos Reviewers' }],
    });
    const role = await resolveKudosRole({ siteUrl: SITE });
    expect(role).toBe('reviewer');
  });

  it('caches repeated resolution for the same site+email', async () => {
    const fetchSpy = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ IsSiteAdmin: true }),
    })) as unknown as typeof fetch;
    globalThis.fetch = fetchSpy;
    await resolveKudosRole({ siteUrl: SITE, currentUserEmail: 'a@h.local' });
    await resolveKudosRole({ siteUrl: SITE, currentUserEmail: 'a@h.local' });
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('clearKudosRoleCache forces a fresh resolve', async () => {
    mockCurrentUser({ IsSiteAdmin: true });
    await resolveKudosRole({ siteUrl: SITE, currentUserEmail: 'a@h.local' });
    clearKudosRoleCache();
    await resolveKudosRole({ siteUrl: SITE, currentUserEmail: 'a@h.local' });
    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });
});
