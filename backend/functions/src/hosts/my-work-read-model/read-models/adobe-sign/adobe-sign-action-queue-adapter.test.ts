import { describe, expect, it } from 'vitest';

import {
  ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES,
  type AdobeSignActionableRecipientStatus,
  type MyWorkActorSummary,
  type MyWorkAdobeSignActionQueueItem,
  type MyWorkAdobeSignActionQueueQuery,
} from '@hbc/models/myWork';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';

import {
  adobeSignActorKey,
  type AdobeSignActorKey,
  type AdobeSignDelegatedActor,
} from './adobe-sign-actor-normalizer.js';
import {
  createAdobeSignActionQueueAdapter,
  type AdobeSignActionQueueAdapterDeps,
  type AdobeSignPrincipalResolver,
} from './adobe-sign-action-queue-adapter.js';
import type { AdobeSignPrincipalResolutionResult } from './adobe-sign-principal-resolution.js';
import type { IAdobeSignTokenService } from './adobe-sign-token-service.js';
import {
  createDeterministicMockSearchClient,
  type AdobeSignSearchClientItem,
  type AdobeSignSearchResult,
} from './adobe-sign-search-client.js';
import {
  ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE,
  ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE,
} from './adobe-sign-search-request.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY: AdobeSignActorKey = adobeSignActorKey(TENANT, OID);

const FIXED_NOW = new Date('2026-05-13T10:00:00.000Z');
const ACCESS_TOKEN = 'access-token-do-not-leak';
const API_ACCESS_POINT = 'https://api.eu1.echosign.com';

const ALLOWED_ITEM_KEYS = new Set<keyof MyWorkAdobeSignActionQueueItem>([
  'itemId',
  'sourceSystem',
  'agreementId',
  'agreementName',
  'requiredAction',
  'adobeRecipientStatus',
  'sender',
  'createdAtUtc',
  'modifiedAtUtc',
  'expirationAtUtc',
  'sourceOpenUrl',
]);

function actorSummary(): MyWorkActorSummary {
  return { displayName: 'User One', principalName: 'user@example.com' };
}

function context(diagnostics?: MyWorkReadContext['diagnostics']): MyWorkReadContext {
  return { actor: actorSummary(), requestId: 'req-test-1', ...(diagnostics ? { diagnostics } : {}) };
}

function delegatedActor(): AdobeSignDelegatedActor {
  return {
    tenantId: TENANT,
    oid: OID,
    actorKey: ACTOR_KEY,
    displayName: 'User One',
    upn: 'user@example.com',
  };
}

function resolvedResolution(): AdobeSignPrincipalResolutionResult {
  return {
    status: 'resolved',
    principal: {
      actor: delegatedActor(),
      adobeApiAccessPoint: API_ACCESS_POINT,
      adobeWebAccessPoint: 'https://secure.eu1.echosign.com',
      grantedScopes: ['user_read:self'],
      grantState: 'active',
    },
    grantPublic: {
      actorTenantId: TENANT,
      actorOid: OID,
      actorKey: ACTOR_KEY,
      adobeApiAccessPoint: API_ACCESS_POINT,
      adobeWebAccessPoint: 'https://secure.eu1.echosign.com',
      grantedScopes: ['user_read:self'],
      grantedAtUtc: '2026-05-01T00:00:00.000Z',
      state: 'active',
    },
  };
}

function staticResolver(
  result: AdobeSignPrincipalResolutionResult,
): AdobeSignPrincipalResolver & { callCount: () => number } {
  let calls = 0;
  const fn: AdobeSignPrincipalResolver = async () => {
    calls++;
    return result;
  };
  return Object.assign(fn, { callCount: () => calls });
}

function staticTokenService(
  result: Awaited<ReturnType<IAdobeSignTokenService['getAccessToken']>>,
): IAdobeSignTokenService & { callCount: () => number } {
  let calls = 0;
  return {
    async getAccessToken() {
      calls++;
      return result;
    },
    callCount: () => calls,
  };
}

function okTokenService(): IAdobeSignTokenService & { callCount: () => number } {
  return staticTokenService({
    status: 'ok',
    accessToken: ACCESS_TOKEN,
    expiresAtUtc: '2026-05-13T11:00:00.000Z',
    apiAccessPoint: API_ACCESS_POINT,
  });
}

function buildDeps(
  overrides: Partial<AdobeSignActionQueueAdapterDeps>,
): AdobeSignActionQueueAdapterDeps {
  return {
    resolvePrincipal: staticResolver(resolvedResolution()),
    tokenService: okTokenService(),
    searchClient: createDeterministicMockSearchClient([{ status: 'ok', items: [] }]),
    now: () => FIXED_NOW,
    ...overrides,
  };
}

function rowForStatus(
  status: AdobeSignActionableRecipientStatus,
  agreementId: string,
): AdobeSignSearchClientItem {
  return {
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    recipientStatus: status,
  };
}

// Deep-walk a value and collect every string leaf so we can assert tokens /
// vendor payloads / grant-store addresses never bleed through the envelope.
function collectStrings(value: unknown, acc: string[] = []): string[] {
  if (typeof value === 'string') {
    acc.push(value);
  } else if (Array.isArray(value)) {
    for (const v of value) collectStrings(v, acc);
  } else if (value !== null && typeof value === 'object') {
    for (const v of Object.values(value as Record<string, unknown>)) collectStrings(v, acc);
  }
  return acc;
}

const QUERY_EMPTY: MyWorkAdobeSignActionQueueQuery = {};

describe('createAdobeSignActionQueueAdapter', () => {
  describe('exact six-status mapping', () => {
    const expected: Record<
      AdobeSignActionableRecipientStatus,
      MyWorkAdobeSignActionQueueItem['requiredAction']
    > = {
      WAITING_FOR_MY_SIGNATURE: 'signature',
      WAITING_FOR_MY_APPROVAL: 'approval',
      WAITING_FOR_MY_ACCEPTANCE: 'acceptance',
      WAITING_FOR_MY_ACKNOWLEDGEMENT: 'acknowledgement',
      WAITING_FOR_MY_FORM_FILLING: 'form-filling',
      WAITING_FOR_MY_DELEGATION: 'delegation',
    };

    for (const status of ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES) {
      it(`maps ${status} → required action "${expected[status]}"`, async () => {
        const result: AdobeSignSearchResult = {
          status: 'ok',
          items: [rowForStatus(status, 'agr-x')],
        };
        const adapter = createAdobeSignActionQueueAdapter(
          buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
        );
        const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
        expect(env.sourceStatus).toBe('available');
        expect(env.data.items).toHaveLength(1);
        expect(env.data.items[0]?.adobeRecipientStatus).toBe(status);
        expect(env.data.items[0]?.requiredAction).toBe(expected[status]);
      });
    }
  });

  describe('unsupported statuses', () => {
    it('filters unsupported recipient statuses and trips a partial envelope', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
          // Statuses outside the six MVP user-action union — must be dropped.
          {
            agreementId: 'agr-2',
            agreementName: 'Sent',
            recipientStatus: 'WAITING_FOR_VERIFICATION',
          },
          { agreementId: 'agr-3', agreementName: 'Done', recipientStatus: 'OUT_FOR_DELIVERY' },
          rowForStatus('WAITING_FOR_MY_APPROVAL', 'agr-4'),
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.sourceStatus).toBe('partial');
      const codes = env.warnings.map((w) => w.code);
      expect(codes).toContain('partial-source-data');
      expect(codes).toContain('unsupported-source-status-filtered');
      expect(env.data.items.map((i) => i.agreementId)).toEqual(['agr-1', 'agr-4']);
      for (const item of env.data.items) {
        expect(ADOBE_SIGN_ACTIONABLE_RECIPIENT_STATUSES).toContain(item.adobeRecipientStatus);
      }
    });

    it('never emits an unsupported recipient status as a valid row even when all rows are unsupported', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          { agreementId: 'a', agreementName: 'A', recipientStatus: 'CANCELLED' },
          { agreementId: 'b', agreementName: 'B', recipientStatus: 'EXPIRED' },
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.sourceStatus).toBe('partial');
      expect(env.data.items).toEqual([]);
      expect(env.data.summary.totalActionItemCount).toBe(0);
    });
  });

  describe('search-call boundedness', () => {
    it('issues exactly one search call for a single page of N items (no N+1 detail fetch)', async () => {
      const N = 50;
      const items: AdobeSignSearchClientItem[] = Array.from({ length: N }, (_, i) =>
        rowForStatus('WAITING_FOR_MY_SIGNATURE', `agr-${i}`),
      );
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items }]);
      const adapter = createAdobeSignActionQueueAdapter(buildDeps({ searchClient }));

      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(searchClient.callCount()).toBe(1);
      expect(env.data.items).toHaveLength(N);
    });
  });

  describe('pagination / cursor opacity', () => {
    it('forwards an opaque cursor from the query into the search-client request verbatim', async () => {
      const opaque = 'cursor::opaque::page-2::abc123';
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
      const adapter = createAdobeSignActionQueueAdapter(buildDeps({ searchClient }));

      await adapter.getActionQueue(context(), { cursor: opaque });

      const captured = searchClient.capturedInputs();
      expect(captured[0]?.request.cursor).toBe(opaque);
    });

    it('re-emits the search-client `nextCursor` verbatim on envelope pagination', async () => {
      const nextCursor = 'cursor::opaque::next::xyz789';
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1')],
        nextCursor,
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );

      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.data.pagination.nextCursor).toBe(nextCursor);
      expect(env.data.pagination.hasMore).toBe(true);
    });

    it('reports `hasMore: false` and omits `nextCursor` when the search client returns none', async () => {
      const adapter = createAdobeSignActionQueueAdapter(buildDeps({}));
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.data.pagination.hasMore).toBe(false);
      expect(env.data.pagination.nextCursor).toBeUndefined();
    });

    it('clamps an oversized pageSize before passing it to the search client', async () => {
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
      const adapter = createAdobeSignActionQueueAdapter(buildDeps({ searchClient }));

      await adapter.getActionQueue(context(), { pageSize: 100000 });

      expect(searchClient.capturedInputs()[0]?.request.pageSize).toBe(
        ADOBE_SIGN_SEARCH_MAX_PAGE_SIZE,
      );
    });

    it('uses the documented default pageSize when the query omits it', async () => {
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
      const adapter = createAdobeSignActionQueueAdapter(buildDeps({ searchClient }));

      await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(searchClient.capturedInputs()[0]?.request.pageSize).toBe(
        ADOBE_SIGN_SEARCH_DEFAULT_PAGE_SIZE,
      );
    });
  });

  describe('source-state mappings', () => {
    it('principal configuration-required → envelope configuration-required (no token / search call)', async () => {
      const tokenService = okTokenService();
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          resolvePrincipal: staticResolver({
            status: 'configuration-required',
            missingKeys: ['ADOBE_SIGN_OAUTH_CLIENT_ID'],
            pendingStoreSelection: false,
          }),
          tokenService,
          searchClient,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('configuration-required');
      expect(env.warnings.map((w) => w.code)).toEqual(['configuration-required']);
      expect(env.data.items).toEqual([]);
      expect(env.data.freshness.state).toBe('unknown');
      expect(tokenService.callCount()).toBe(0);
      expect(searchClient.callCount()).toBe(0);
    });

    it('principal authorization-required → envelope authorization-required', async () => {
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          resolvePrincipal: staticResolver({
            status: 'authorization-required',
            actor: delegatedActor(),
            reason: 'no-grant-found',
          }),
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('authorization-required');
      expect(env.warnings.map((w) => w.code)).toEqual(['authorization-required']);
      expect(env.data.items).toEqual([]);
    });

    it('principal principal-unresolved → envelope principal-unresolved', async () => {
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          resolvePrincipal: staticResolver({
            status: 'principal-unresolved',
            reason: 'app-only',
          }),
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('principal-unresolved');
      expect(env.warnings.map((w) => w.code)).toEqual(['principal-unresolved']);
      expect(env.data.items).toEqual([]);
    });

    it('principal source-unavailable → envelope source-unavailable', async () => {
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          resolvePrincipal: staticResolver({
            status: 'source-unavailable',
            reason: 'adobe-unreachable',
          }),
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.warnings.map((w) => w.code)).toEqual(['source-unavailable']);
    });

    it('token service authorization-required → envelope authorization-required (no search call)', async () => {
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          tokenService: staticTokenService({
            status: 'authorization-required',
            reason: 'grant-requires-reauth',
          }),
          searchClient,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('authorization-required');
      expect(searchClient.callCount()).toBe(0);
    });

    it('token service source-unavailable → envelope source-unavailable (no search call)', async () => {
      const searchClient = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          tokenService: staticTokenService({
            status: 'source-unavailable',
            reason: 'token-store-unavailable',
          }),
          searchClient,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(searchClient.callCount()).toBe(0);
    });

    it('search client unauthorized → envelope authorization-required', async () => {
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([{ status: 'unauthorized' }]),
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('authorization-required');
      expect(env.data.items).toEqual([]);
    });

    it('search client unreachable → envelope source-unavailable', async () => {
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([
            { status: 'unreachable', reason: 'http-5xx' },
          ]),
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('source-unavailable');
      expect(env.data.items).toEqual([]);
    });

    it('principal resolved + token ok + search ok with retained rows → envelope available', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1')],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('available');
      expect(env.warnings.map((w) => w.code)).not.toContain('partial-source-data');
    });
  });

  describe('no raw Adobe payload returned to caller', () => {
    it('emitted items expose only the sealed B04 DTO keys', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          {
            agreementId: 'agr-1',
            agreementName: 'Contract One',
            recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
            senderDisplayName: 'Alice',
            senderEmail: 'alice@example.com',
            createdAtUtc: '2026-05-10T00:00:00.000Z',
            expirationAtUtc: '2026-05-15T00:00:00.000Z',
          },
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      const item = env.data.items[0]!;
      for (const key of Object.keys(item)) {
        expect(ALLOWED_ITEM_KEYS).toContain(key as keyof MyWorkAdobeSignActionQueueItem);
      }
    });

    it('does not leak the access token, refresh-token reference, or any vendor token field through the envelope', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1')],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      const allStrings = collectStrings(env);
      for (const s of allStrings) {
        expect(s).not.toContain(ACCESS_TOKEN);
        // Closed-enum guard: no vendor-status string outside the six MVP union.
        expect(s.startsWith('WAITING_FOR_VERIFICATION')).toBe(false);
      }
    });
  });

  describe('handoff-URL policy wiring', () => {
    const APPROVED_ADOBE: AdobeSignActionQueueAdapterDeps['urlPolicyConfig'] = {
      approvedDomainPolicy: [{ approvedHostSuffixes: ['.adobesign.com'] }],
    };

    it('omits `sourceOpenUrl` and emits `source-open-url-omitted` when no candidate is supplied', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
          rowForStatus('WAITING_FOR_MY_APPROVAL', 'agr-2'),
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      for (const item of env.data.items) {
        expect(item.sourceOpenUrl).toBeUndefined();
        expect(Object.prototype.hasOwnProperty.call(item, 'sourceOpenUrl')).toBe(false);
      }
      expect(env.warnings.map((w) => w.code)).toContain('source-open-url-omitted');
      expect(env.warnings.map((w) => w.code)).not.toContain('source-open-url-policy-rejected');
    });

    it('does not emit any handoff-URL warning when no items are returned', async () => {
      const adapter = createAdobeSignActionQueueAdapter(buildDeps({}));
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      const codes = env.warnings.map((w) => w.code);
      expect(codes).not.toContain('source-open-url-omitted');
      expect(codes).not.toContain('source-open-url-policy-rejected');
    });

    it('populates `sourceOpenUrl` verbatim when the candidate passes policy on an approved host', async () => {
      const allowedUrl = 'https://secure.na1.adobesign.com/account/agreementView?aid=abc';
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          {
            ...rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
            sourceOpenUrlCandidate: allowedUrl,
          },
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([result]),
          urlPolicyConfig: APPROVED_ADOBE,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.data.items[0]?.sourceOpenUrl).toBe(allowedUrl);
      const codes = env.warnings.map((w) => w.code);
      expect(codes).not.toContain('source-open-url-omitted');
      expect(codes).not.toContain('source-open-url-policy-rejected');
    });

    it('omits `sourceOpenUrl` and emits a policy-rejected warning carrying the reason code when the candidate fails policy', async () => {
      const httpUrl = 'http://secure.adobesign.com/agreementView'; // scheme-blocked
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          {
            ...rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
            sourceOpenUrlCandidate: httpUrl,
          },
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([result]),
          urlPolicyConfig: APPROVED_ADOBE,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.data.items[0]?.sourceOpenUrl).toBeUndefined();
      expect(Object.prototype.hasOwnProperty.call(env.data.items[0]!, 'sourceOpenUrl')).toBe(false);
      const rejected = env.warnings.find((w) => w.code === 'source-open-url-policy-rejected');
      expect(rejected).toBeDefined();
      expect(rejected?.message).toContain('scheme-blocked');
    });

    it.each([
      ['http://secure.adobesign.com/x', 'scheme-blocked'],
      ['https://localhost/x', 'host-blocked-local'],
      ['https://10.0.0.1/x', 'host-blocked-local'],
      ['https://secure.adobesign.com/x?access_token=a', 'query-contains-credential-like-parameter'],
      ['https://attacker.example.com/x', 'host-not-approved'],
      ['not a url', 'invalid-url'],
    ])('rejects %s with reason %s when policy is configured', async (candidate, expectedReason) => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          {
            ...rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
            sourceOpenUrlCandidate: candidate,
          },
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([result]),
          urlPolicyConfig: APPROVED_ADOBE,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);
      expect(env.data.items[0]?.sourceOpenUrl).toBeUndefined();
      const rejected = env.warnings.find((w) => w.code === 'source-open-url-policy-rejected');
      expect(rejected?.message).toContain(expectedReason);
    });

    it('surfaces both omitted and policy-rejected warnings simultaneously on a mixed page', async () => {
      const allowedUrl = 'https://secure.na1.adobesign.com/agreementView?aid=ok';
      const blockedUrl = 'http://secure.adobesign.com/agreementView'; // scheme-blocked
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          {
            ...rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
            sourceOpenUrlCandidate: allowedUrl,
          },
          {
            ...rowForStatus('WAITING_FOR_MY_APPROVAL', 'agr-2'),
            sourceOpenUrlCandidate: blockedUrl,
          },
          rowForStatus('WAITING_FOR_MY_ACCEPTANCE', 'agr-3'),
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([result]),
          urlPolicyConfig: APPROVED_ADOBE,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.data.items[0]?.sourceOpenUrl).toBe(allowedUrl);
      expect(env.data.items[1]?.sourceOpenUrl).toBeUndefined();
      expect(env.data.items[2]?.sourceOpenUrl).toBeUndefined();

      const codes = env.warnings.map((w) => w.code);
      expect(codes).toContain('source-open-url-omitted');
      expect(codes).toContain('source-open-url-policy-rejected');
    });

    it('coalesces multiple rejections into a single warning with sorted distinct reasons in `message`', async () => {
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          {
            ...rowForStatus('WAITING_FOR_MY_SIGNATURE', 'agr-1'),
            sourceOpenUrlCandidate: 'http://secure.adobesign.com/x',
          },
          {
            ...rowForStatus('WAITING_FOR_MY_APPROVAL', 'agr-2'),
            sourceOpenUrlCandidate: 'http://secure.adobesign.com/y',
          },
          {
            ...rowForStatus('WAITING_FOR_MY_ACCEPTANCE', 'agr-3'),
            sourceOpenUrlCandidate: 'https://localhost/z',
          },
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([result]),
          urlPolicyConfig: APPROVED_ADOBE,
        }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      const rejected = env.warnings.filter((w) => w.code === 'source-open-url-policy-rejected');
      expect(rejected).toHaveLength(1);
      expect(rejected[0]?.message).toBe('host-blocked-local,scheme-blocked');
    });
  });

  describe('summary projection', () => {
    it('counts each required-action bucket exactly once and tags items expiring within 7 days', async () => {
      const soon = new Date(FIXED_NOW.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
      const farOut = new Date(FIXED_NOW.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const result: AdobeSignSearchResult = {
        status: 'ok',
        items: [
          { ...rowForStatus('WAITING_FOR_MY_SIGNATURE', 'a'), expirationAtUtc: soon },
          { ...rowForStatus('WAITING_FOR_MY_APPROVAL', 'b'), expirationAtUtc: farOut },
          rowForStatus('WAITING_FOR_MY_DELEGATION', 'c'),
        ],
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
      );
      const env = await adapter.getActionQueue(context(), QUERY_EMPTY);

      expect(env.data.summary.countBasis).toBe('returned-items');
      expect(env.data.summary.totalActionItemCount).toBe(3);
      expect(env.data.summary.signatureCount).toBe(1);
      expect(env.data.summary.approvalCount).toBe(1);
      expect(env.data.summary.delegationCount).toBe(1);
      expect(env.data.summary.expiringSoonCount).toBe(1);
    });
  });

  describe('runtime result telemetry', () => {
    it('emits search + actionQueue result events with safe fields on search unauthorized', async () => {
      const events: Array<{ name: string; properties: Record<string, unknown> }> = [];
      const diagnostics = {
        trackAdobeSignRuntimeEvent(name: string, properties: Record<string, unknown>) {
          events.push({ name, properties });
        },
      };
      const adapter = createAdobeSignActionQueueAdapter(
        buildDeps({
          searchClient: createDeterministicMockSearchClient([{ status: 'unauthorized' }]),
        }),
      );

      const env = await adapter.getActionQueue(context(diagnostics), QUERY_EMPTY);
      expect(env.sourceStatus).toBe('authorization-required');
      expect(events).toEqual([
        {
          name: 'adobeSign.read.search.result',
          properties: { status: 'unauthorized' },
        },
        {
          name: 'adobeSign.read.actionQueue.result',
          properties: {
            sourceStatus: 'authorization-required',
            resultStage: 'search',
            warningCodes: ['authorization-required'],
          },
        },
      ]);
      const serialized = JSON.stringify(events);
      expect(serialized).not.toContain(ACCESS_TOKEN);
      expect(serialized).not.toContain('agreementId');
      expect(serialized).not.toContain('senderEmail');
    });
  });
});
