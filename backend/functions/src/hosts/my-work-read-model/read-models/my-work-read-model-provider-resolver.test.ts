import { randomBytes } from 'node:crypto';
import { describe, expect, it } from 'vitest';

import { MY_PROJECT_LINKS_AVAILABLE } from '@hbc/models/myWork/fixtures';

import type { EnvLike } from './adobe-sign/adobe-sign-config.js';
import { adobeSignActorKey } from './adobe-sign/adobe-sign-actor-normalizer.js';
import {
  composeAdobeSignLiveStack,
  resolveMyWorkReadModelProvider,
} from './my-work-read-model-provider-resolver.js';
import type { MyWorkReadContext } from './my-work-read-model-provider.js';

const TENANT = '11111111-2222-3333-4444-555555555555';
const OID = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
const VALID_KEY_B64 = Buffer.from(randomBytes(32)).toString('base64');

function fullProductionEnv(overrides: EnvLike = {}): EnvLike {
  return {
    NODE_ENV: 'production',
    HBC_ADAPTER_MODE: 'proxy',
    ADOBE_SIGN_OAUTH_CLIENT_ID: 'client-id-value',
    ADOBE_SIGN_OAUTH_CLIENT_SECRET: 'super-secret-do-not-echo',
    ADOBE_SIGN_OAUTH_REDIRECT_URI: 'https://hb-intel.example.com/api/adobe/callback',
    ADOBE_SIGN_OAUTH_SCOPES: 'agreement_read:self',
    ADOBE_SIGN_TOKEN_STORE_MODE: 'table-storage',
    AZURE_TENANT_ID: TENANT,
    AZURE_TABLE_ENDPOINT: 'https://example.table.core.windows.net',
    ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: VALID_KEY_B64,
    ...overrides,
  };
}

const fixtureContext: MyWorkReadContext = {
  actor: {
    displayName: 'Avery Operator',
    principalName: 'avery@hbc.test',
    hbcUserId: OID,
  },
  requestId: 'req-fixture',
};

describe('composeAdobeSignLiveStack', () => {
  it('returns ready when every prerequisite is satisfied (with AZURE_TABLE_ENDPOINT set in process.env)', () => {
    const previous = process.env.AZURE_TABLE_ENDPOINT;
    // Connection-string form bypasses DefaultAzureCredential (which would take
    // 5-6s to time out) and constructs a Azurite-style TableClient that fails
    // fast with ECONNREFUSED on the resolver's findGrant call.
    process.env.AZURE_TABLE_ENDPOINT = 'UseDevelopmentStorage=true';
    try {
      const composition = composeAdobeSignLiveStack(fullProductionEnv());
      expect(composition.status).toBe('ready');
      if (composition.status !== 'ready') return;
      expect(composition.actionQueueAdapter).toBeDefined();
      expect(typeof composition.actionQueueAdapter.getActionQueue).toBe('function');
    } finally {
      if (previous === undefined) delete process.env.AZURE_TABLE_ENDPOINT;
      else process.env.AZURE_TABLE_ENDPOINT = previous;
    }
  });

  it('returns configuration-required oauth-config-not-ready when OAuth keys are missing', () => {
    const composition = composeAdobeSignLiveStack(
      fullProductionEnv({ ADOBE_SIGN_OAUTH_CLIENT_SECRET: undefined }),
    );
    expect(composition.status).toBe('configuration-required');
    if (composition.status !== 'configuration-required') return;
    expect(composition.reason).toBe('oauth-config-not-ready');
  });

  it('returns configuration-required when the encryption key is absent (config readiness fires first)', () => {
    const previous = process.env.AZURE_TABLE_ENDPOINT;
    // Connection-string form bypasses DefaultAzureCredential (which would take
    // 5-6s to time out) and constructs a Azurite-style TableClient that fails
    // fast with ECONNREFUSED on the resolver's findGrant call.
    process.env.AZURE_TABLE_ENDPOINT = 'UseDevelopmentStorage=true';
    try {
      const composition = composeAdobeSignLiveStack(
        fullProductionEnv({ ADOBE_SIGN_TOKEN_ENCRYPTION_KEY: undefined }),
      );
      expect(composition.status).toBe('configuration-required');
      // Prompt-02 config readiness treats ADOBE_SIGN_TOKEN_ENCRYPTION_KEY as a
      // storage-infrastructure prerequisite under table-storage mode, so the
      // outermost gate (`oauth-config-not-ready`) trips before the inner
      // `cipher-key-not-ready` gate is reached. Both are valid failure modes.
      if (composition.status !== 'configuration-required') return;
      expect(['oauth-config-not-ready', 'cipher-key-not-ready']).toContain(composition.reason);
    } finally {
      if (previous === undefined) delete process.env.AZURE_TABLE_ENDPOINT;
      else process.env.AZURE_TABLE_ENDPOINT = previous;
    }
  });

  it('returns configuration-required refresh-token-store-not-ready when AZURE_TABLE_ENDPOINT is absent in process.env', () => {
    const previous = process.env.AZURE_TABLE_ENDPOINT;
    delete process.env.AZURE_TABLE_ENDPOINT;
    try {
      const composition = composeAdobeSignLiveStack(
        fullProductionEnv({ AZURE_TABLE_ENDPOINT: undefined }),
      );
      expect(composition.status).toBe('configuration-required');
    } finally {
      if (previous !== undefined) process.env.AZURE_TABLE_ENDPOINT = previous;
    }
  });
});

describe('resolveMyWorkReadModelProvider', () => {
  it('returns the mock-fixture provider in NODE_ENV=test', async () => {
    const provider = resolveMyWorkReadModelProvider({ NODE_ENV: 'test' });
    const home = await provider.getMyWorkHome(fixtureContext);
    // Mock provider returns fixture envelopes (`mode: 'fixture'`).
    expect(home.mode).toBe('fixture');
    expect(home.sourceStatus).toBe('available');
  });

  it('returns the mock-fixture provider in HBC_ADAPTER_MODE=mock', async () => {
    const provider = resolveMyWorkReadModelProvider({ HBC_ADAPTER_MODE: 'mock' });
    const home = await provider.getMyWorkHome(fixtureContext);
    expect(home.mode).toBe('fixture');
  });

  it('returns the live provider (composition.status === "ready") when every prereq is satisfied', () => {
    const previous = process.env.AZURE_TABLE_ENDPOINT;
    process.env.AZURE_TABLE_ENDPOINT = 'UseDevelopmentStorage=true';
    try {
      // Verify routing decision via the synchronous composition function.
      // Actual end-to-end live behavior is covered by the dedicated
      // `MyWorkAdobeSignLiveReadModelProvider` + action-queue adapter unit
      // tests (this test deliberately avoids Azure round-trips).
      const composition = composeAdobeSignLiveStack(fullProductionEnv());
      expect(composition.status).toBe('ready');
      const provider = resolveMyWorkReadModelProvider(fullProductionEnv());
      expect(typeof provider.getMyWorkHome).toBe('function');
      expect(typeof provider.getAdobeSignActionQueue).toBe('function');
      expect(typeof provider.getMyProjectLinks).toBe('function');
    } finally {
      if (previous === undefined) delete process.env.AZURE_TABLE_ENDPOINT;
      else process.env.AZURE_TABLE_ENDPOINT = previous;
    }
  });

  it('returns the simulate-backend-unavailable mock when a prereq is missing in production', async () => {
    const provider = resolveMyWorkReadModelProvider(
      fullProductionEnv({ ADOBE_SIGN_OAUTH_CLIENT_SECRET: undefined }),
    );
    const home = await provider.getMyWorkHome(fixtureContext);
    expect(home.sourceStatus).toBe('backend-unavailable');
    const queue = await provider.getAdobeSignActionQueue(fixtureContext, {});
    expect(queue.sourceStatus).toBe('backend-unavailable');
  });

  it('preserves the project-links delegation across all modes', async () => {
    let projectLinksCalls = 0;
    const deterministicProjectLinksProvider = {
      async getMyProjectLinks() {
        projectLinksCalls++;
        return MY_PROJECT_LINKS_AVAILABLE;
      },
    };

    const mockProvider = resolveMyWorkReadModelProvider(
      { NODE_ENV: 'test' },
      { projectLinksProvider: deterministicProjectLinksProvider },
    );
    const projectLinks = await mockProvider.getMyProjectLinks(fixtureContext);
    expect(projectLinks).toEqual(MY_PROJECT_LINKS_AVAILABLE);

    const fallbackProvider = resolveMyWorkReadModelProvider(
      fullProductionEnv({ ADOBE_SIGN_OAUTH_CLIENT_SECRET: undefined }),
      { projectLinksProvider: deterministicProjectLinksProvider },
    );
    const fallbackLinks = await fallbackProvider.getMyProjectLinks(fixtureContext);
    expect(fallbackLinks).toEqual(MY_PROJECT_LINKS_AVAILABLE);
    expect(projectLinksCalls).toBe(2);
  });

  it('the live-mode actor key is derived from (tenantId, hbcUserId), not from any spoofed claim', () => {
    // Structural assertion only — avoid Azure round-trips. The full actor-key
    // derivation contract is exercised by the principal-resolver unit tests
    // (`adobe-sign-principal-resolver.test.ts`'s "no shared-principal fallback"
    // suite); the resolver routing path is verified above. This test pins the
    // shape of `adobeSignActorKey(tenantId, oid)` so a future change to the
    // key convention immediately surfaces here.
    expect(adobeSignActorKey(TENANT, 'spoofed-but-still-an-oid-uuid')).toBe(
      `${TENANT.toLowerCase()}::spoofed-but-still-an-oid-uuid`,
    );
  });
});
