import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  buildPcListFieldsEndpoint,
  buildPcListItemsEndpoint,
  getPeopleCultureList,
  PEOPLE_CULTURE_LIST_REGISTRY,
} from '../data/peopleCultureSpListRegistry.js';
import {
  ANN_FIELDS,
  CEL_FIELDS,
  KUDOS_FIELDS,
  fetchPeopleCultureListData,
  validatePeopleCultureListBindings,
} from '../data/peopleCultureListSource.js';

const SITE_URL = 'https://tenant.sharepoint.com/sites/HBCentral';

describe('peopleCultureSpListRegistry', () => {
  it('binds each list to its authoritative live GUID', () => {
    expect(PEOPLE_CULTURE_LIST_REGISTRY.announcements.id).toBe(
      '2cd191fc-a7ea-49f2-af05-c395c2326e57',
    );
    expect(PEOPLE_CULTURE_LIST_REGISTRY.celebrations.id).toBe(
      'b87bf664-0531-418b-902c-726e5fb87083',
    );
    expect(PEOPLE_CULTURE_LIST_REGISTRY.kudos.id).toBe(
      'b01fa4d2-29b1-4e11-b581-4cb3d0951a79',
    );
    expect(PEOPLE_CULTURE_LIST_REGISTRY.kudosAuditEvents.id).toBe(
      'c031c08f-25ac-407c-aa15-650b791efeb0',
    );
  });

  it('records the known live title / URL mismatch explicitly', () => {
    // The announcements list is at URL segment `Announcements1` but
    // is titled `People Culture Announcements`. The celebrations list
    // is at URL segment `Announcements` but is titled `People Culture
    // Celebrations`. Consumers MUST bind by id, never by either.
    expect(PEOPLE_CULTURE_LIST_REGISTRY.announcements.title).toBe(
      'People Culture Announcements',
    );
    expect(PEOPLE_CULTURE_LIST_REGISTRY.announcements.urlSegment).toBe(
      'People Culture Announcements1',
    );
    expect(PEOPLE_CULTURE_LIST_REGISTRY.celebrations.title).toBe(
      'People Culture Celebrations',
    );
    expect(PEOPLE_CULTURE_LIST_REGISTRY.celebrations.urlSegment).toBe(
      'People Culture Announcements',
    );
  });

  it('builds item endpoints using the list GUID, not the title', () => {
    const url = buildPcListItemsEndpoint(
      SITE_URL,
      PEOPLE_CULTURE_LIST_REGISTRY.announcements,
      { select: 'AnnouncementId', expand: 'AnnouncementPerson', top: 25 },
    );
    expect(url).toContain("lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/items");
    expect(url).toContain('$select=AnnouncementId');
    expect(url).toContain('$expand=AnnouncementPerson');
    expect(url).toContain('$top=25');
    expect(url).not.toContain('getbytitle');
  });

  it('builds fields endpoints using the list GUID', () => {
    const url = buildPcListFieldsEndpoint(
      SITE_URL,
      PEOPLE_CULTURE_LIST_REGISTRY.celebrations,
      "Title eq 'PersonName'",
    );
    expect(url).toContain("lists(guid'b87bf664-0531-418b-902c-726e5fb87083')/fields");
    expect(url).toContain('$filter=');
    expect(url).toContain('$select=InternalName');
    expect(url).not.toContain('getbytitle');
  });

  it('accepts the stable key as a shorthand for the descriptor', () => {
    expect(buildPcListItemsEndpoint(SITE_URL, 'kudos')).toContain(
      "lists(guid'b01fa4d2-29b1-4e11-b581-4cb3d0951a79')/items",
    );
    expect(getPeopleCultureList('kudos').title).toBe('People Culture Kudos');
  });
});

describe('people-culture adapter field-name contracts', () => {
  it('points ANN_FIELDS.PublishDate at the live mangled internal name', () => {
    expect(ANN_FIELDS.PublishDate).toBe('PublishDateMapstopublishDate_x00');
  });

  it('points CEL_FIELDS.HomepageEnabled at the live mangled internal name', () => {
    expect(CEL_FIELDS.HomepageEnabled).toBe('HomepageEnabledGovernanceextensi');
  });

  it('includes Kudos WorkflowStatus and WasEverPublished in the field contract', () => {
    expect(KUDOS_FIELDS.WorkflowStatus).toBe('WorkflowStatus');
    expect(KUDOS_FIELDS.WasEverPublished).toBe('WasEverPublished');
    expect(KUDOS_FIELDS.ProminenceIntent).toBe('ProminenceIntent');
    expect(KUDOS_FIELDS.CurrentVisibilityMode).toBe('CurrentVisibilityMode');
  });

  it('includes the announcements InternalNotes field', () => {
    expect(ANN_FIELDS.InternalNotes).toBe('InternalNotes');
  });
});

describe('fetchPeopleCultureListData', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;
  let routes: Array<{
    match: (url: string) => boolean;
    response: { body: unknown; ok: boolean; status: number };
  }>;

  beforeEach(() => {
    routes = [];
    fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const received = typeof input === 'string' ? input : String(input);
      for (const route of routes) {
        if (route.match(received)) {
          return jsonResponse(route.response.body, route.response.ok, route.response.status);
        }
      }
      throw new Error(`Unexpected URL ${received}`);
    });
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  function jsonResponse(body: unknown, ok = true, status = 200): Response {
    return {
      ok,
      status,
      statusText: ok ? 'OK' : 'Error',
      json: async () => body,
      text: async () => JSON.stringify(body),
    } as unknown as Response;
  }

  function stubRoute(
    urlPrefix: string,
    body: unknown,
    options: { ok?: boolean; status?: number } = {},
  ): void {
    const ok = options.ok ?? true;
    const status = options.status ?? (ok ? 200 : 500);
    routes.push({
      match: (url: string) => url.startsWith(urlPrefix),
      response: { body, ok, status },
    });
  }

  it('binds every REST call to the list GUID endpoint', async () => {
    // Publish-date field resolver is called first; return the mangled name.
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/fields`,
      { value: [{ InternalName: 'PublishDateMapstopublishDate_x00' }] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b01fa4d2-29b1-4e11-b581-4cb3d0951a79')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b87bf664-0531-418b-902c-726e5fb87083')/items`,
      { value: [] },
    );

    const result = await fetchPeopleCultureListData(SITE_URL);
    expect(result.errors).toEqual([]);
    expect(result.config.announcements).toEqual([]);
    expect(result.config.kudos).toEqual([]);
    expect(result.config.celebrations).toEqual([]);

    // No getbytitle URL should have been issued by the fetch mock.
    const calledUrls = fetchMock.mock.calls.map((call) => String(call[0] ?? ''));
    for (const url of calledUrls) {
      expect(url).not.toContain('getbytitle');
    }
  });

  it('remaps the mangled PublishDate onto the adapter PublishDate key', async () => {
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/fields`,
      { value: [{ InternalName: 'PublishDateMapstopublishDate_x00' }] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/items`,
      {
        value: [
          {
            AnnouncementId: 'ann-1',
            AnnouncementPerson: { Id: 11, Title: 'Jordan Lee' },
            PersonDisplayName: 'Jordan Lee',
            AnnouncementType: 'promotion',
            Headline: 'Promoted to Senior PM',
            Summary: 'Congratulations.',
            PublishDateMapstopublishDate_x00: '2026-04-08T00:00:00Z',
            HomepageEnabled: true,
          },
        ],
      },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b01fa4d2-29b1-4e11-b581-4cb3d0951a79')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b87bf664-0531-418b-902c-726e5fb87083')/items`,
      { value: [] },
    );

    const result = await fetchPeopleCultureListData(SITE_URL);
    expect(result.config.announcements).toHaveLength(1);
    const announcement = result.config.announcements?.[0];
    expect(announcement?.publishDate).toBe('2026-04-08T00:00:00Z');
    expect(announcement?.headline).toBe('Promoted to Senior PM');
    expect(announcement?.personName).toBe('Jordan Lee');
  });

  it('maps the Kudos WorkflowStatus to the narrow KudosStatus and preserves the full field', async () => {
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/fields`,
      { value: [{ InternalName: 'PublishDateMapstopublishDate_x00' }] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b01fa4d2-29b1-4e11-b581-4cb3d0951a79')/items`,
      {
        value: [
          {
            KudosId: 'k-1',
            Headline: 'Great work',
            Excerpt: 'They did great things.',
            SubmittedBy: { Id: 42, Title: 'Submitter One', EMail: 'one@hb.com' },
            SubmittedDate: '2026-04-01T00:00:00Z',
            WorkflowStatus: 'approvedScheduled',
            WasEverPublished: false,
            IsPinned: true,
            PinOrder: 3,
            IsFeatured: true,
            ProminenceIntent: 'featured',
            CurrentVisibilityMode: 'public',
            HomepageEnabled: true,
            IsScheduled: true,
            ScheduledPublishAt: '2026-04-15T00:00:00Z',
            CelebrateCount: 7,
          },
          {
            KudosId: 'k-2',
            Headline: 'Rejected item',
            Excerpt: 'Not the right fit.',
            SubmittedBy: { Id: 43, Title: 'Submitter Two' },
            SubmittedDate: '2026-04-02T00:00:00Z',
            WorkflowStatus: 'rejected',
            WasEverPublished: false,
          },
          {
            KudosId: 'k-3',
            Headline: 'Pending item',
            Excerpt: 'Awaiting review.',
            SubmittedBy: { Id: 44, Title: 'Submitter Three' },
            SubmittedDate: '2026-04-03T00:00:00Z',
            WorkflowStatus: 'pending',
          },
        ],
      },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b87bf664-0531-418b-902c-726e5fb87083')/items`,
      { value: [] },
    );

    const result = await fetchPeopleCultureListData(SITE_URL);
    expect(result.config.kudos).toHaveLength(3);
    const k1 = result.config.kudos?.find((k) => k.id === 'k-1');
    expect(k1?.status).toBe('approved');
    expect(k1?.workflowStatus).toBe('approvedScheduled');
    expect(k1?.pinOrder).toBe(3);
    expect(k1?.isFeatured).toBe(true);
    expect(k1?.prominenceIntent).toBe('featured');
    expect(k1?.visibilityMode).toBe('public');
    expect(k1?.isScheduled).toBe(true);
    expect(k1?.scheduledPublishAt).toBe('2026-04-15T00:00:00Z');

    const k2 = result.config.kudos?.find((k) => k.id === 'k-2');
    expect(k2?.status).toBe('rejected');
    expect(k2?.workflowStatus).toBe('rejected');

    const k3 = result.config.kudos?.find((k) => k.id === 'k-3');
    expect(k3?.status).toBe('pending');
    expect(k3?.workflowStatus).toBe('pending');
  });

  it('explodes multi-user celebrations via PersonName results array', async () => {
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/fields`,
      { value: [{ InternalName: 'PublishDateMapstopublishDate_x00' }] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b01fa4d2-29b1-4e11-b581-4cb3d0951a79')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b87bf664-0531-418b-902c-726e5fb87083')/items`,
      {
        value: [
          {
            AnnouncementId: 'cel-1',
            PersonName: {
              results: [
                { Id: 1, Title: 'Jordan Lee' },
                { Id: 2, Title: 'Taylor Reeves' },
              ],
            },
            CelebrationType: 'birthday',
            CelebrationDate: '2026-04-12T00:00:00Z',
            HomepageEnabledGovernanceextensi: true,
          },
          {
            AnnouncementId: 'cel-2',
            PersonName: [],
            PersonDisplayName: 'Morgan Chen',
            CelebrationType: 'anniversary',
            CelebrationDate: '2026-04-13T00:00:00Z',
            AnniversaryYears: 10,
            HomepageEnabledGovernanceextensi: true,
          },
          {
            AnnouncementId: 'cel-3',
            PersonName: [{ Id: 3, Title: 'Suppressed User' }],
            CelebrationType: 'birthday',
            CelebrationDate: '2026-04-14T00:00:00Z',
            HomepageEnabledGovernanceextensi: false,
          },
        ],
      },
    );

    const result = await fetchPeopleCultureListData(SITE_URL);
    expect(result.config.celebrations).toHaveLength(3);
    const names = (result.config.celebrations ?? []).map((c) => c.personName).sort();
    expect(names).toEqual(['Jordan Lee', 'Morgan Chen', 'Taylor Reeves']);
    const cel2 = result.config.celebrations?.find((c) => c.personName === 'Morgan Chen');
    expect(cel2?.anniversaryYears).toBe(10);
    // The suppressed celebration (HomepageEnabledGovernanceextensi = false)
    // is filtered out.
    expect(
      result.config.celebrations?.some((c) => c.personName === 'Suppressed User'),
    ).toBe(false);
  });

  it('surfaces list fetch errors through the result.errors channel', async () => {
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/fields`,
      { value: [{ InternalName: 'PublishDateMapstopublishDate_x00' }] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'2cd191fc-a7ea-49f2-af05-c395c2326e57')/items`,
      { error: 'forbidden' },
      { ok: false, status: 403 },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b01fa4d2-29b1-4e11-b581-4cb3d0951a79')/items`,
      { value: [] },
    );
    stubRoute(
      `${SITE_URL}/_api/web/lists(guid'b87bf664-0531-418b-902c-726e5fb87083')/items`,
      { value: [] },
    );

    const result = await fetchPeopleCultureListData(SITE_URL);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('People Culture Announcements');
    expect(result.errors[0]).toContain('2cd191fc-a7ea-49f2-af05-c395c2326e57');
    expect(result.config.announcements).toEqual([]);
  });
});

describe('validatePeopleCultureListBindings', () => {
  const originalFetch = globalThis.fetch;
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    globalThis.fetch = fetchMock as unknown as typeof globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it('returns an empty error list when every critical field is present', async () => {
    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        value: [
          { InternalName: 'AnnouncementId' },
          { InternalName: 'AnnouncementPerson' },
          { InternalName: 'AnnouncementType' },
          { InternalName: 'Headline' },
          { InternalName: 'Summary' },
          { InternalName: 'HomepageEnabled' },
          { InternalName: 'PublishDateMapstopublishDate_x00' },
          { InternalName: 'PersonName' },
          { InternalName: 'CelebrationType' },
          { InternalName: 'CelebrationDate' },
          { InternalName: 'HomepageEnabledGovernanceextensi' },
          { InternalName: 'KudosId' },
          { InternalName: 'Excerpt' },
          { InternalName: 'SubmittedBy' },
          { InternalName: 'SubmittedDate' },
          { InternalName: 'WorkflowStatus' },
          { InternalName: 'WasEverPublished' },
          { InternalName: 'IsPinned' },
          { InternalName: 'CelebrateCount' },
        ],
      }),
    }));

    const errors = await validatePeopleCultureListBindings(SITE_URL);
    expect(errors).toEqual([]);
  });

  it('reports missing critical fields by list key', async () => {
    fetchMock.mockImplementation(async () => ({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: async () => ({
        // intentionally missing AnnouncementPerson, PersonName, WorkflowStatus
        value: [
          { InternalName: 'AnnouncementId' },
          { InternalName: 'AnnouncementType' },
          { InternalName: 'Headline' },
          { InternalName: 'Summary' },
          { InternalName: 'HomepageEnabled' },
          { InternalName: 'PublishDateMapstopublishDate_x00' },
          { InternalName: 'CelebrationType' },
          { InternalName: 'CelebrationDate' },
          { InternalName: 'HomepageEnabledGovernanceextensi' },
          { InternalName: 'KudosId' },
          { InternalName: 'Excerpt' },
          { InternalName: 'SubmittedBy' },
          { InternalName: 'SubmittedDate' },
          { InternalName: 'WasEverPublished' },
          { InternalName: 'IsPinned' },
          { InternalName: 'CelebrateCount' },
        ],
      }),
    }));

    const errors = await validatePeopleCultureListBindings(SITE_URL);
    expect(errors.length).toBeGreaterThanOrEqual(3);
    const joined = errors.join('\n');
    expect(joined).toContain('AnnouncementPerson');
    expect(joined).toContain('PersonName');
    expect(joined).toContain('WorkflowStatus');
  });
});
