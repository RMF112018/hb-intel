import { describe, expect, it } from 'vitest';

import type {
  MyWorkActorSummary,
  MyWorkAdobeSignRecentCompletionsQuery,
  MyWorkReadModelSourceStatus,
  MyWorkReadModelWarning,
} from '@hbc/models/myWork';

import type { MyWorkReadContext } from '../my-work-read-model-provider.js';
import {
  adobeSignActorKey,
  type AdobeSignActorKey,
  type AdobeSignDelegatedActor,
} from './adobe-sign-actor-normalizer.js';
import {
  createAdobeSignRecentCompletionsAdapter,
  type AdobeSignPrincipalResolver,
  type AdobeSignRecentCompletionsAdapterDeps,
} from './adobe-sign-recent-completions-adapter.js';
import type { AdobeSignPrincipalResolutionResult } from './adobe-sign-principal-resolution.js';
import { ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS } from './adobe-sign-recent-completions-request.js';
import {
  createDeterministicMockSearchClient,
  type AdobeSignRecentCompletionsSearchClientItem,
  type AdobeSignSearchResult,
} from './adobe-sign-search-client.js';
import type { IAdobeSignTokenService } from './adobe-sign-token-service.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const ACTOR_KEY: AdobeSignActorKey = adobeSignActorKey(TENANT, OID);
const FIXED_NOW = new Date('2026-05-13T10:00:00.000Z');
const ACCESS_TOKEN = 'access-token-do-not-leak';
const API_ACCESS_POINT = 'https://api.eu1.echosign.com';

function actorSummary(): MyWorkActorSummary {
  return { displayName: 'User One', principalName: 'user@example.com' };
}

function context(diagnostics?: MyWorkReadContext['diagnostics']): MyWorkReadContext {
  return {
    actor: actorSummary(),
    requestId: 'req-test-1',
    ...(diagnostics ? { diagnostics } : {}),
  };
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

function staticResolver(result: AdobeSignPrincipalResolutionResult): AdobeSignPrincipalResolver {
  return async () => result;
}

function staticTokenService(
  result: Awaited<ReturnType<IAdobeSignTokenService['getAccessToken']>>,
): IAdobeSignTokenService {
  return {
    async getAccessToken() {
      return result;
    },
  };
}

function okTokenService(): IAdobeSignTokenService {
  return staticTokenService({
    status: 'ok',
    accessToken: ACCESS_TOKEN,
    expiresAtUtc: '2026-05-13T11:00:00.000Z',
    apiAccessPoint: API_ACCESS_POINT,
  });
}

function buildDeps(
  overrides: Partial<AdobeSignRecentCompletionsAdapterDeps>,
): AdobeSignRecentCompletionsAdapterDeps {
  return {
    resolvePrincipal: staticResolver(resolvedResolution()),
    tokenService: okTokenService(),
    searchClient: createDeterministicMockSearchClient([{ status: 'ok', items: [] }]),
    now: () => FIXED_NOW,
    ...overrides,
  };
}

function recentRow(
  agreementId: string,
  overrides: Partial<AdobeSignRecentCompletionsSearchClientItem> = {},
): AdobeSignRecentCompletionsSearchClientItem {
  return {
    intent: 'recent-completions',
    agreementId,
    agreementName: `Agreement ${agreementId}`,
    ...overrides,
  };
}

const QUERY_EMPTY: MyWorkAdobeSignRecentCompletionsQuery = {};

function expectBaseSuccessPosture(
  env: Awaited<
    ReturnType<ReturnType<typeof createAdobeSignRecentCompletionsAdapter>['getRecentCompletions']>
  >,
) {
  expect(env.data.moduleId).toBe('adobe-sign-recent-completions');
  expect(env.data.summary.countBasis).toBe('returned-items');
  expect(env.data.summary.windowDays).toBe(30);
  expect(env.data.freshness).toEqual({
    state: 'fresh',
    generatedAtUtc: FIXED_NOW.toISOString(),
  });
}

describe('createAdobeSignRecentCompletionsAdapter', () => {
  it('maps populated results with agreementStatus completed posture', async () => {
    const result: AdobeSignSearchResult = {
      status: 'ok',
      items: [
        recentRow('agr-1', {
          senderDisplayName: 'Sender One',
          senderEmail: 'sender1@example.com',
          modifiedAtUtc: '2026-05-10T00:00:00.000Z',
          sourceOpenUrlCandidate: 'https://secure.na1.adobesign.com/account/agreementView?aid=1',
        }),
        recentRow('agr-2'),
      ],
      nextCursor: 'cursor-2',
    };

    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);

    expect(env.sourceStatus).toBe('available');
    expect(env.warnings.map((w) => w.code)).toEqual(['source-open-url-omitted']);
    expect(env.data.items).toHaveLength(2);
    expect(env.data.items[0]?.agreementStatus).toBe('COMPLETED');
    expect(env.data.items[0]?.modifiedAtUtc).toBe('2026-05-10T00:00:00.000Z');
    expect((env.data.items[0] as any).completedAtUtc).toBeUndefined();
    expect(env.data.summary.completedAgreementCount).toBe(2);
    expect(env.data.pagination).toEqual({ pageSize: 25, hasMore: true, nextCursor: 'cursor-2' });
    expectBaseSuccessPosture(env);
  });

  it('maps empty results', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([{ status: 'ok', items: [] }]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('available');
    expect(env.data.items).toEqual([]);
    expect(env.data.summary.completedAgreementCount).toBe(0);
  });

  it('honors pageSize on paged results', async () => {
    const result: AdobeSignSearchResult = {
      status: 'ok',
      items: [recentRow('agr-1')],
      nextCursor: 'cursor-2',
    };
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({ searchClient: createDeterministicMockSearchClient([result]) }),
    );
    const env = await adapter.getRecentCompletions(context(), { pageSize: 2, cursor: 'c1' });
    expect(env.data.pagination.pageSize).toBe(2);
    expect(env.data.pagination.hasMore).toBe(true);
    expect(env.data.pagination.nextCursor).toBe('cursor-2');
  });

  it('maps principal unresolved', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({ resolvePrincipal: staticResolver({ status: 'principal-unresolved' }) }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('principal-unresolved');
    expect(env.warnings.map((w) => w.code)).toEqual(['principal-unresolved']);
  });

  it('maps authorization-required token path', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({ tokenService: staticTokenService({ status: 'authorization-required' }) }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('authorization-required');
    expect(env.warnings.map((w) => w.code)).toEqual(['authorization-required']);
  });

  it('maps source-unavailable token path', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({ tokenService: staticTokenService({ status: 'source-unavailable' }) }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('source-unavailable');
    expect(env.warnings.map((w) => w.code)).toEqual(['source-unavailable']);
  });

  it('maps unauthorized search result to authorization-required', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([{ status: 'unauthorized' }]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('authorization-required');
  });

  it('maps unreachable search result to source-unavailable', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          { status: 'unreachable', reason: 'network' },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('source-unavailable');
  });

  it('keeps sender optional', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          {
            status: 'ok',
            items: [recentRow('agr-1'), recentRow('agr-2', { senderEmail: 'a@b.com' })],
          },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.data.items[0]?.sender).toBeUndefined();
    expect(env.data.items[1]?.sender?.emailAddress).toBe('a@b.com');
  });

  it('keeps modifiedAtUtc optional', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          {
            status: 'ok',
            items: [
              recentRow('agr-1'),
              recentRow('agr-2', { modifiedAtUtc: '2026-05-10T00:00:00.000Z' }),
            ],
          },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.data.items[0]?.modifiedAtUtc).toBeUndefined();
    expect(env.data.items[1]?.modifiedAtUtc).toBe('2026-05-10T00:00:00.000Z');
  });

  it('maps completedAtUtc only when row provides a true completion timestamp', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          {
            status: 'ok',
            items: [
              recentRow('agr-1', { createdAtUtc: '2026-05-09T00:00:00.000Z' }),
              recentRow('agr-2'),
            ],
          },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.data.items[0]?.completedAtUtc).toBe('2026-05-09T00:00:00.000Z');
    expect(env.data.items[1]?.completedAtUtc).toBeUndefined();
  });

  it('maps sourceOpenUrl when policy allows', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          {
            status: 'ok',
            items: [
              recentRow('agr-1', {
                sourceOpenUrlCandidate:
                  'https://secure.na1.adobesign.com/account/agreementView?aid=1',
              }),
            ],
          },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.data.items[0]?.sourceOpenUrl).toContain('secure.na1.adobesign.com');
  });

  it('emits source-open-url-omitted warning without degrading source status', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          { status: 'ok', items: [recentRow('agr-1')] },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('available');
    expect(env.warnings.map((w) => w.code)).toContain('source-open-url-omitted');
  });

  it('emits source-open-url-policy-rejected warning without degrading source status', async () => {
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          {
            status: 'ok',
            items: [
              recentRow('agr-1', { sourceOpenUrlCandidate: 'http://secure.adobesign.com/x' }),
            ],
          },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('available');
    const rejected = env.warnings.find((w) => w.code === 'source-open-url-policy-rejected');
    expect(rejected?.message).toContain('scheme-blocked');
  });

  it('drops mixed-intent rows as partial and does not coerce action-queue rows', async () => {
    const mixedRow = {
      intent: 'action-queue' as const,
      agreementId: 'agr-bad',
      agreementName: 'Bad',
      recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
    };
    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          { status: 'ok', items: [recentRow('agr-1'), mixedRow as any] },
        ]),
      }),
    );
    const env = await adapter.getRecentCompletions(context(), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('partial');
    expect(env.warnings.map((w) => w.code)).toContain('partial-source-data');
    expect(env.data.items.map((i) => i.agreementId)).toEqual(['agr-1']);
  });

  it('emits result telemetry with bounded fields and windowDays', async () => {
    const events: Array<{ name: string; properties: Record<string, unknown> }> = [];
    const diagnostics = {
      trackAdobeSignRuntimeEvent(name: string, properties: Record<string, unknown>) {
        events.push({ name, properties });
      },
    };

    const adapter = createAdobeSignRecentCompletionsAdapter(
      buildDeps({
        searchClient: createDeterministicMockSearchClient([
          { status: 'ok', items: [recentRow('agr-1')] },
        ]),
      }),
    );

    const env = await adapter.getRecentCompletions(context(diagnostics), QUERY_EMPTY);
    expect(env.sourceStatus).toBe('available');
    const event = events.find((e) => e.name === 'adobeSign.read.recentCompletions.result');
    expect(event).toBeDefined();
    expect(event?.properties).toMatchObject({
      sourceStatus: 'available' as MyWorkReadModelSourceStatus,
      resultStage: 'mapped-results',
      warningCodes: ['source-open-url-omitted'] as MyWorkReadModelWarning['code'][],
      itemCount: 1,
      hasMore: false,
      windowDays: ADOBE_SIGN_RECENT_COMPLETIONS_WINDOW_DAYS,
    });
    const serialized = JSON.stringify(events);
    expect(serialized).not.toContain(ACCESS_TOKEN);
    expect(serialized).not.toContain('sourceOpenUrlCandidate');
  });
});
