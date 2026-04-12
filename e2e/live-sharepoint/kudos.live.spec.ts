/**
 * HB Kudos live-SharePoint integration lane (phase-16a/06).
 *
 * Thin reality-check against the real M365 contract seams. Non-
 * destructive: writes go to a dedicated dev/staging test list, each
 * write records its created item id, and the afterAll hook deletes
 * those items unless HB_KUDOS_LIVE_KEEP_SEEDS=true.
 *
 * If the required env vars are missing, every test self-skips with
 * a clear reason. No mocks: if authentication fails, the digest
 * fetch fails and the suite reports a real failure.
 */
import { expect, test, type APIRequestContext } from '@playwright/test';

const SITE_URL = process.env.HB_KUDOS_LIVE_SITE_URL;
const KUDOS_LIST_ID = process.env.HB_KUDOS_LIVE_KUDOS_LIST_ID;
const AUDIT_LIST_ID = process.env.HB_KUDOS_LIVE_AUDIT_LIST_ID;
const TEST_USER_EMAIL = process.env.HB_KUDOS_LIVE_TEST_USER_EMAIL;
const SEARCH_QUERY = process.env.HB_KUDOS_LIVE_SEARCH_QUERY ?? 'ken';
const KEEP_SEEDS = process.env.HB_KUDOS_LIVE_KEEP_SEEDS === 'true';

const missingEnv = [
  ['HB_KUDOS_LIVE_SITE_URL', SITE_URL],
  ['HB_KUDOS_LIVE_KUDOS_LIST_ID', KUDOS_LIST_ID],
  ['HB_KUDOS_LIVE_AUDIT_LIST_ID', AUDIT_LIST_ID],
  ['HB_KUDOS_LIVE_TEST_USER_EMAIL', TEST_USER_EMAIL],
]
  .filter(([, v]) => !v)
  .map(([k]) => k);

const created: Array<{ listId: string; itemId: number }> = [];

async function fetchDigest(api: APIRequestContext, site: string): Promise<string> {
  const res = await api.post(`${site}/_api/contextinfo`, {
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
    },
  });
  expect(res.status(), `contextinfo ${res.status()}`).toBe(200);
  const body = (await res.json()) as { FormDigestValue?: string };
  expect(body.FormDigestValue, 'FormDigestValue present').toBeTruthy();
  return body.FormDigestValue!;
}

async function deleteItem(
  api: APIRequestContext,
  site: string,
  listId: string,
  itemId: number,
  digest: string,
): Promise<void> {
  await api.post(`${site}/_api/web/lists(guid'${listId}')/items(${itemId})`, {
    headers: {
      Accept: 'application/json;odata=nometadata',
      'Content-Type': 'application/json;odata=nometadata',
      'X-HTTP-Method': 'DELETE',
      'If-Match': '*',
      'X-RequestDigest': digest,
    },
  });
}

test.describe('HB Kudos — live SharePoint contract', () => {
  test.beforeAll(() => {
    if (missingEnv.length > 0) {
      // Skip the entire file with a loud reason. Never silently
      // green on a missing-env run.
      test.skip(
        true,
        `live-SharePoint lane requires env vars: ${missingEnv.join(', ')} — see e2e/live-sharepoint/README.md`,
      );
    }
  });

  test.afterAll(async ({ request }) => {
    if (!SITE_URL || KEEP_SEEDS || created.length === 0) return;
    try {
      const digest = await fetchDigest(request, SITE_URL);
      for (const c of created.splice(0)) {
        await deleteItem(request, SITE_URL, c.listId, c.itemId, digest).catch(() => {});
      }
    } catch {
      /* cleanup is best-effort */
    }
  });

  test('1. request digest fetch succeeds', async ({ request }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    expect(digest.length).toBeGreaterThan(8);
  });

  test('2. ClientPeoplePickerSearchUser returns at least one result for a safe query', async ({
    request,
  }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    const res = await request.post(
      `${SITE_URL}/_api/SP.UI.ApplicationPages.ClientPeoplePickerWebServiceInterface.ClientPeoplePickerSearchUser`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
        data: {
          queryParams: {
            QueryString: SEARCH_QUERY,
            MaximumEntitySuggestions: 10,
            AllowEmailAddresses: true,
            AllowOnlyEmailAddresses: false,
            PrincipalType: 1,
            PrincipalSource: 15,
            SharePointGroupID: 0,
          },
        },
      },
    );
    expect(res.ok()).toBe(true);
    const body = (await res.json()) as { ClientPeoplePickerSearchUser?: string };
    const principals = JSON.parse(body.ClientPeoplePickerSearchUser ?? '[]') as unknown[];
    expect(principals.length).toBeGreaterThan(0);
  });

  test('3. ensureUser resolves a known test user', async ({ request }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    const res = await request.post(
      `${SITE_URL}/_api/web/ensureuser('${encodeURIComponent(TEST_USER_EMAIL!)}')`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=nometadata',
          'X-RequestDigest': digest,
        },
      },
    );
    expect(res.ok()).toBe(true);
    const body = (await res.json()) as { Id?: number };
    expect(typeof body.Id).toBe('number');
  });

  test('4. draft can be written to the test Kudos list (GUID-bound)', async ({ request }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    const res = await request.post(
      `${SITE_URL}/_api/web/lists(guid'${KUDOS_LIST_ID}')/items`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest,
        },
        data: {
          __metadata: { type: 'SP.Data.People_x0020_Culture_x0020_KudosListItem' },
          KudosId: `live-test-${Date.now()}`,
          Headline: 'Live integration lane smoke',
          Excerpt: 'Phase-16a/06 reality check — safe to delete.',
          SubmittedDate: new Date().toISOString(),
          WorkflowStatus: 'pending',
          WasEverPublished: false,
          ProminenceIntent: 'standard',
          HomepageEnabled: false,
          IsPinned: false,
          IsFeatured: false,
          IsScheduled: false,
          CelebrateCount: 0,
        },
      },
    );
    expect(res.ok(), `create ${res.status()}`).toBe(true);
    const body = (await res.json()) as { d?: { Id?: number }; Id?: number };
    const itemId = body.d?.Id ?? body.Id;
    expect(typeof itemId, 'created item id returned').toBe('number');
    created.push({ listId: KUDOS_LIST_ID!, itemId: itemId! });
  });

  test('5. governance patch MERGE succeeds against a created item', async ({ request }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    const latest = created[created.length - 1];
    test.skip(!latest, 'no item from test #4 to patch');
    // Fetch etag
    const read = await request.get(
      `${SITE_URL}/_api/web/lists(guid'${KUDOS_LIST_ID}')/items(${latest.itemId})`,
      { headers: { Accept: 'application/json;odata=minimalmetadata' } },
    );
    expect(read.ok()).toBe(true);
    const readBody = (await read.json()) as { 'odata.etag'?: string; '@odata.etag'?: string };
    const etag = readBody['@odata.etag'] ?? readBody['odata.etag'] ?? '*';

    const patch = await request.post(
      `${SITE_URL}/_api/web/lists(guid'${KUDOS_LIST_ID}')/items(${latest.itemId})`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=verbose',
          'X-HTTP-Method': 'MERGE',
          'If-Match': etag,
          'X-RequestDigest': digest,
        },
        data: {
          __metadata: { type: 'SP.Data.People_x0020_Culture_x0020_KudosListItem' },
          CelebrateCount: 1,
        },
      },
    );
    expect(patch.status(), `MERGE ${patch.status()}`).toBeGreaterThanOrEqual(200);
    expect(patch.status()).toBeLessThan(300);
  });

  test('6. audit event can be written and read back', async ({ request }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    const latest = created[created.length - 1];
    test.skip(!latest, 'no item from test #4 to audit');
    const audit = await request.post(
      `${SITE_URL}/_api/web/lists(guid'${AUDIT_LIST_ID}')/items`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=verbose',
          'X-RequestDigest': digest,
        },
        data: {
          __metadata: { type: 'SP.Data.Kudos_x0020_Audit_x0020_EventsListItem' },
          KudosId: `live-test-audit-${latest.itemId}`,
          EventType: 'celebrate',
          EventAt: new Date().toISOString(),
        },
      },
    );
    expect(audit.ok(), `audit create ${audit.status()}`).toBe(true);
    const auditBody = (await audit.json()) as { d?: { Id?: number }; Id?: number };
    const auditId = auditBody.d?.Id ?? auditBody.Id;
    expect(typeof auditId).toBe('number');
    created.push({ listId: AUDIT_LIST_ID!, itemId: auditId! });

    // Read back
    const read = await request.get(
      `${SITE_URL}/_api/web/lists(guid'${AUDIT_LIST_ID}')/items(${auditId})`,
      { headers: { Accept: 'application/json;odata=nometadata' } },
    );
    expect(read.ok()).toBe(true);
    const readBody = (await read.json()) as { EventType?: string };
    expect(readBody.EventType).toBe('celebrate');
  });

  test('7. MERGE with stale ETag surfaces 412 conflict', async ({ request }) => {
    const digest = await fetchDigest(request, SITE_URL!);
    const latest = created.find((c) => c.listId === KUDOS_LIST_ID);
    test.skip(!latest, 'no item from test #4 to conflict-test');
    const patch = await request.post(
      `${SITE_URL}/_api/web/lists(guid'${KUDOS_LIST_ID}')/items(${latest!.itemId})`,
      {
        headers: {
          Accept: 'application/json;odata=nometadata',
          'Content-Type': 'application/json;odata=verbose',
          'X-HTTP-Method': 'MERGE',
          'If-Match': '"0"', // deliberately stale
          'X-RequestDigest': digest,
        },
        data: {
          __metadata: { type: 'SP.Data.People_x0020_Culture_x0020_KudosListItem' },
          CelebrateCount: 99,
        },
      },
    );
    expect(patch.status(), 'stale etag must surface 412').toBe(412);
  });

  test('8. list GUID binding targets the right list regardless of title', async ({ request }) => {
    const res = await request.get(
      `${SITE_URL}/_api/web/lists(guid'${KUDOS_LIST_ID}')?$select=Id,Title`,
      { headers: { Accept: 'application/json;odata=nometadata' } },
    );
    expect(res.ok()).toBe(true);
    const body = (await res.json()) as { Id?: string; Title?: string };
    // Normalize GUID comparison (SP returns braced/unbraced variants)
    const normalize = (s?: string): string => (s ?? '').replace(/[{}]/g, '').toLowerCase();
    expect(normalize(body.Id)).toBe(normalize(KUDOS_LIST_ID));
    expect(typeof body.Title).toBe('string');
    expect(body.Title!.length).toBeGreaterThan(0);
  });
});
