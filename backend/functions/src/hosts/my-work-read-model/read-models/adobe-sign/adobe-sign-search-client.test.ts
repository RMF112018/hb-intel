import { describe, expect, it } from 'vitest';

import { adobeSignActorKey } from './adobe-sign-actor-normalizer.js';
import {
  createDeterministicMockSearchClient,
  type AdobeSignSearchClientInput,
  type AdobeSignSearchResult,
} from './adobe-sign-search-client.js';
import { buildAdobeSignSearchRequest } from './adobe-sign-search-request.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';

function input(overrides?: Partial<AdobeSignSearchClientInput>): AdobeSignSearchClientInput {
  return {
    actorKey: adobeSignActorKey(TENANT, OID),
    accessToken: 'access-token-not-asserted',
    apiAccessPoint: 'https://api.eu1.echosign.com',
    request: buildAdobeSignSearchRequest({ pageSize: 25 }),
    ...overrides,
  };
}

describe('createDeterministicMockSearchClient', () => {
  it('returns scripted results in order', async () => {
    const okOne: AdobeSignSearchResult = {
      status: 'ok',
      items: [
        {
          intent: 'action-queue',
          agreementId: 'agr-1',
          agreementName: 'Contract One',
          recipientStatus: 'WAITING_FOR_MY_SIGNATURE',
        },
      ],
    };
    const okTwo: AdobeSignSearchResult = {
      status: 'ok',
      items: [],
      nextCursor: 'next-cursor-2',
    };
    const client = createDeterministicMockSearchClient([okOne, okTwo]);

    await expect(client.search(input())).resolves.toEqual(okOne);
    await expect(client.search(input())).resolves.toEqual(okTwo);
    expect(client.callCount()).toBe(2);
  });

  it('captures each call input for later assertion', async () => {
    const client = createDeterministicMockSearchClient([
      { status: 'ok', items: [] },
      { status: 'ok', items: [] },
    ]);

    const firstInput = input({ request: buildAdobeSignSearchRequest({ pageSize: 10 }) });
    const secondInput = input({
      request: buildAdobeSignSearchRequest({ pageSize: 50, cursor: 'opaque-cursor-1' }),
    });

    await client.search(firstInput);
    await client.search(secondInput);

    const captured = client.capturedInputs();
    expect(captured).toHaveLength(2);
    expect(captured[0]).toBe(firstInput);
    expect(captured[1]).toBe(secondInput);
    expect(captured[1]?.request.cursor).toBe('opaque-cursor-1');
  });

  it('throws when consumed past the end of the script', async () => {
    const client = createDeterministicMockSearchClient([{ status: 'ok', items: [] }]);
    await client.search(input());
    await expect(client.search(input())).rejects.toThrow(/exhausted/i);
  });

  it('preserves failure-result discriminants without leaking a vendor body', async () => {
    const unauthorized: AdobeSignSearchResult = { status: 'unauthorized' };
    const unreachable: AdobeSignSearchResult = { status: 'unreachable', reason: 'http-5xx' };
    const client = createDeterministicMockSearchClient([unauthorized, unreachable]);

    const a = await client.search(input());
    const b = await client.search(input());

    expect(a).toEqual({ status: 'unauthorized' });
    expect(b).toEqual({ status: 'unreachable', reason: 'http-5xx' });
    // Closed-enum result shape — no `body`, `raw`, or vendor-string property exists.
    expect(Object.keys(a)).toEqual(['status']);
    expect(Object.keys(b).sort()).toEqual(['reason', 'status']);
  });
});
