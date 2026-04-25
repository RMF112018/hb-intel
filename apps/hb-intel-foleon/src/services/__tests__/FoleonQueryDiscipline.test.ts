import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { fetchFoleonContent } from '../FoleonContentService.js';
import { fetchFoleonPlacements } from '../FoleonPlacementService.js';
import { FoleonSchemaError } from '../../schema/validateListGuid.js';

const VALID_CONTENT_GUID = '11111111-1111-1111-1111-111111111111';
const VALID_PLACEMENTS_GUID = '22222222-2222-2222-2222-222222222222';
const SITE_URL = 'https://tenant.sharepoint.com/sites/HBCentral';

interface FetchSpy {
  readonly calls: string[];
  readonly restore: () => void;
}

function installFetchSpy(responseValue: unknown): FetchSpy {
  const calls: string[] = [];
  const original = (globalThis as { fetch?: typeof fetch }).fetch;
  (globalThis as { fetch?: typeof fetch }).fetch = (async (
    input: RequestInfo | URL,
  ): Promise<Response> => {
    calls.push(typeof input === 'string' ? input : input.toString());
    return new Response(JSON.stringify({ value: responseValue }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return {
    calls,
    restore: () => {
      (globalThis as { fetch?: typeof fetch }).fetch = original;
    },
  };
}

describe('FoleonContentService query discipline', () => {
  let spy: FetchSpy;

  beforeEach(() => {
    spy = installFetchSpy([]);
  });
  afterEach(() => spy.restore());

  it('binds by list GUID, not title', async () => {
    await fetchFoleonContent({
      siteUrl: SITE_URL,
      contentRegistryListId: VALID_CONTENT_GUID,
    });
    expect(spy.calls.length).toBe(1);
    expect(spy.calls[0]).toContain(`lists(guid'${VALID_CONTENT_GUID}')`);
    expect(spy.calls[0]).not.toContain('getbytitle');
  });

  it('emits $select and $top discipline on every query', async () => {
    await fetchFoleonContent({
      siteUrl: SITE_URL,
      contentRegistryListId: VALID_CONTENT_GUID,
      publishedOnly: true,
      homepageEligibleOnly: true,
      top: 42,
    });
    const url = spy.calls[0];
    expect(url).toContain('$select=');
    expect(url).toMatch(/\$top=42/);
    const decoded = decodeURIComponent(url);
    expect(decoded).toContain('Id,Title,FoleonDocId');
    expect(decoded).toContain('ReaderKey');
    expect(decoded).toContain('LastEditorialUpdate');
    expect(decoded).not.toContain('MarketingOwner');
    expect(decoded).not.toContain('AudienceGroups');
  });

  it('only filters on indexed columns', async () => {
    await fetchFoleonContent({
      siteUrl: SITE_URL,
      contentRegistryListId: VALID_CONTENT_GUID,
      foleonDocId: 123,
      publishedOnly: true,
      homepageEligibleOnly: true,
    });
    const url = decodeURIComponent(spy.calls[0]);
    const filterMatch = url.match(/\$filter=([^&]+)/);
    expect(filterMatch).not.toBeNull();
    const filterText = filterMatch![1];
    for (const indexed of ['FoleonDocId', 'IsVisible', 'PublishStatus', 'IsHomepageEligible']) {
      expect(filterText).toContain(indexed);
    }
    for (const promptTwoField of ['ReaderKey', 'ActiveEdition', 'ContentTypeKey', 'HomepageSlot']) {
      expect(filterText).not.toContain(promptTwoField);
    }
  });

  it('rejects a missing GUID before any fetch is issued', async () => {
    await expect(
      fetchFoleonContent({ siteUrl: SITE_URL, contentRegistryListId: '' }),
    ).rejects.toBeInstanceOf(FoleonSchemaError);
    expect(spy.calls.length).toBe(0);
  });

  it('rejects a malformed GUID before any fetch is issued', async () => {
    await expect(
      fetchFoleonContent({ siteUrl: SITE_URL, contentRegistryListId: 'not-a-guid' }),
    ).rejects.toMatchObject({ code: 'invalid-list-guid' });
    expect(spy.calls.length).toBe(0);
  });

  it('uses the default $top when none is supplied', async () => {
    await fetchFoleonContent({
      siteUrl: SITE_URL,
      contentRegistryListId: VALID_CONTENT_GUID,
    });
    expect(spy.calls[0]).toMatch(/\$top=100/);
  });
});

describe('FoleonPlacementService query discipline', () => {
  let spy: FetchSpy;

  beforeEach(() => {
    spy = installFetchSpy([]);
  });
  afterEach(() => spy.restore());

  it('binds by list GUID, applies bounded $top and IsActive filter', async () => {
    await fetchFoleonPlacements({
      siteUrl: SITE_URL,
      placementsListId: VALID_PLACEMENTS_GUID,
      activeOnly: true,
    });
    const url = spy.calls[0];
    expect(url).toContain(`lists(guid'${VALID_PLACEMENTS_GUID}')`);
    expect(url).toMatch(/\$top=50/);
    expect(decodeURIComponent(url)).toContain('IsActive eq 1');
  });

  it('rejects bad GUID before fetching', async () => {
    await expect(
      fetchFoleonPlacements({ siteUrl: SITE_URL, placementsListId: '' }),
    ).rejects.toBeInstanceOf(FoleonSchemaError);
    expect(spy.calls.length).toBe(0);
  });
});
