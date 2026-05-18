/**
 * My Work read-model provider resolver — B05 remediation Prompt 05.
 *
 * Composition root that turns `process.env` (or any env-like object)
 * into the `IMyWorkReadModelProvider` the route layer should use.
 * Three modes:
 *
 *   1. Test / mock-adapter mode (`NODE_ENV === 'test'` or
 *      `HBC_ADAPTER_MODE === 'mock'`): returns the existing
 *      `MyWorkMockReadModelProvider`, preserving the entire B04
 *      fixture posture.
 *   2. Production-style env with every Adobe-Sign prerequisite ready:
 *      composes the full Adobe-Sign live stack
 *      (`composeAdobeSignLiveStack`) and returns a composite provider
 *      that delegates `getMyWorkHome` + `getAdobeSignActionQueue` to
 *      `MyWorkAdobeSignLiveReadModelProvider` and `getMyProjectLinks`
 *      to the operator's `MyProjectLinksReadModelProvider`.
 *   3. Production-style env with any prerequisite missing: returns
 *      `new MyWorkMockReadModelProvider({ simulateBackendUnavailable:
 *      true })` so both protected routes degrade to a typed
 *      `'backend-unavailable'` envelope instead of crashing at route
 *      load.
 *
 * The route module imports `resolveMyWorkReadModelProvider` and
 * constructs the provider exactly once at module-load time. Tests
 * `vi.mock(...)` this resolver to short-circuit the composition.
 *
 * @module hosts/my-work-read-model/read-models/my-work-read-model-provider-resolver
 */

import {
  createAdobeSignActionQueueAdapter,
  type IAdobeSignActionQueueAdapter,
} from './adobe-sign/adobe-sign-action-queue-adapter.js';
import {
  createAdobeSignRecentCompletionsAdapter,
  type IAdobeSignRecentCompletionsAdapter,
} from './adobe-sign/adobe-sign-recent-completions-adapter.js';
import type { EnvLike } from './adobe-sign/adobe-sign-config.js';
import { resolveAdobeSignOAuthConfigReadiness } from './adobe-sign/adobe-sign-config.js';
import { resolveAdobeSignGrantStore } from './adobe-sign/adobe-sign-grant-store.js';
import { createAdobeSignLiveRefreshClient } from './adobe-sign/adobe-sign-live-refresh-client.js';
import { createAdobeSignLiveSearchClient } from './adobe-sign/adobe-sign-live-search-client.js';
import { createAdobeSignPrincipalResolver } from './adobe-sign/adobe-sign-principal-resolver.js';
import {
  createAdobeSignRefreshTokenCipher,
  resolveAdobeSignRefreshTokenCipherKey,
} from './adobe-sign/adobe-sign-refresh-token-crypto.js';
import { resolveAdobeSignRefreshTokenStore } from './adobe-sign/adobe-sign-refresh-token-store.js';
import { createAdobeSignTokenService } from './adobe-sign/adobe-sign-token-service.js';

import { MyWorkAdobeSignLiveReadModelProvider } from './my-work-adobe-sign-live-read-model-provider.js';
import { MyWorkMockReadModelProvider } from './my-work-mock-read-model-provider.js';
import type { IMyWorkReadModelProvider } from './my-work-read-model-provider.js';
import { MyProjectLinksReadModelProvider } from './project-links/my-project-links-read-model-provider.js';
import { ProjectionMyProjectLinksReadModelProvider } from './project-links/my-project-links-projection-provider.js';
import { GraphListClient } from '../../../services/legacy-fallback/graph-list-client.js';
import { getProjectionConfig } from '../../../services/my-projects-projection/projection-config.js';
import { createGraphMyProjectsRegistryRepository } from '../../../services/my-projects-projection/registry/my-projects-registry-repository.js';

/**
 * Build the active My Projects read provider based on `config.enablement.readMode`.
 * Production defaults to `legacy`; flipping to `projection` is an operator
 * config change (env var + restart). When the projection config is not
 * available (e.g., local-only tests with no env), the resolver falls through
 * to the legacy provider — never to a synthesized stub.
 */
/**
 * Exposed for unit tests so the read-mode branch can be exercised without
 * forcing every projection-config env var into the test environment.
 */
export interface IBuildProjectLinksProviderOptions {
  /** Override the config reader (defaults to `getProjectionConfig`). */
  readonly readProjectionConfig?: () => { readonly enablement: { readonly readMode: string } };
  /** Override the projection provider factory (tests inject a fake). */
  readonly projectionProviderFactory?: () => Pick<IMyWorkReadModelProvider, 'getMyProjectLinks'>;
  /** Override the legacy provider factory (tests inject a fake). */
  readonly legacyProviderFactory?: () => Pick<IMyWorkReadModelProvider, 'getMyProjectLinks'>;
}

export function buildProjectLinksProvider(
  opts: IBuildProjectLinksProviderOptions = {},
): Pick<IMyWorkReadModelProvider, 'getMyProjectLinks'> {
  const readConfig = opts.readProjectionConfig ?? getProjectionConfig;
  try {
    const cfg = readConfig();
    if (cfg.enablement.readMode === 'projection') {
      if (opts.projectionProviderFactory) return opts.projectionProviderFactory();
      const fullCfg = getProjectionConfig();
      const registryGraph = new GraphListClient(fullCfg.sites.registrySiteUrl);
      return new ProjectionMyProjectLinksReadModelProvider({
        registryRepository: createGraphMyProjectsRegistryRepository({ graph: registryGraph }),
      });
    }
  } catch {
    /* projection config unavailable → fall through to legacy */
  }
  return opts.legacyProviderFactory
    ? opts.legacyProviderFactory()
    : new MyProjectLinksReadModelProvider();
}

export type AdobeSignLiveStackCompositionReason =
  | 'oauth-config-not-ready'
  | 'grant-store-not-ready'
  | 'refresh-token-store-not-ready'
  | 'cipher-key-not-ready';

export type AdobeSignLiveStackComposition =
  | {
      readonly status: 'ready';
      readonly actionQueueAdapter: IAdobeSignActionQueueAdapter;
      readonly recentCompletionsAdapter: IAdobeSignRecentCompletionsAdapter;
    }
  | {
      readonly status: 'configuration-required';
      readonly reason: AdobeSignLiveStackCompositionReason;
    };

export function composeAdobeSignLiveStack(env: EnvLike): AdobeSignLiveStackComposition {
  const cfg = resolveAdobeSignOAuthConfigReadiness(env);
  if (cfg.status !== 'ready') {
    return { status: 'configuration-required', reason: 'oauth-config-not-ready' };
  }
  const grantStore = resolveAdobeSignGrantStore(env);
  if (grantStore.readiness !== 'ready') {
    return { status: 'configuration-required', reason: 'grant-store-not-ready' };
  }
  const refreshStore = resolveAdobeSignRefreshTokenStore(env);
  if (refreshStore.readiness !== 'ready') {
    return { status: 'configuration-required', reason: 'refresh-token-store-not-ready' };
  }
  const cipherKey = resolveAdobeSignRefreshTokenCipherKey(env);
  if (cipherKey.status !== 'ok') {
    return { status: 'configuration-required', reason: 'cipher-key-not-ready' };
  }
  const cipher = createAdobeSignRefreshTokenCipher(cipherKey.key);

  const clientId = env.ADOBE_SIGN_OAUTH_CLIENT_ID!;
  const clientSecret = env.ADOBE_SIGN_OAUTH_CLIENT_SECRET!;

  const refreshClient = createAdobeSignLiveRefreshClient({
    clientId,
    clientSecret,
    refreshTokenStore: refreshStore.store,
    cipher,
  });
  const tokenService = createAdobeSignTokenService({
    grantStore: grantStore.store,
    refreshClient,
  });
  const searchClient = createAdobeSignLiveSearchClient();
  const resolvePrincipal = createAdobeSignPrincipalResolver({
    resolveTenantId: () => env.AZURE_TENANT_ID,
    resolveConfigEnv: () => env,
    resolveGrantStore: () => grantStore,
  });
  const actionQueueAdapter = createAdobeSignActionQueueAdapter({
    resolvePrincipal,
    tokenService,
    searchClient,
    now: () => new Date(),
  });
  const recentCompletionsAdapter = createAdobeSignRecentCompletionsAdapter({
    resolvePrincipal,
    tokenService,
    searchClient,
    now: () => new Date(),
  });

  return { status: 'ready', actionQueueAdapter, recentCompletionsAdapter };
}

export interface ResolveMyWorkReadModelProviderOptions {
  /** Defaults to `() => new Date()`; the mock provider's now signature is `() => string`. */
  readonly now?: () => Date;
  /**
   * Optional injection seam for deterministic tests. Production callers should
   * omit this and use the default provider construction path.
   */
  readonly projectLinksProvider?: Pick<IMyWorkReadModelProvider, 'getMyProjectLinks'>;
}

const isMockOrTestMode = (env: EnvLike): boolean =>
  env.NODE_ENV === 'test' || env.HBC_ADAPTER_MODE === 'mock';

function composeLiveProvider(
  composition: Extract<AdobeSignLiveStackComposition, { status: 'ready' }>,
  options?: ResolveMyWorkReadModelProviderOptions,
): IMyWorkReadModelProvider {
  const adobeProvider = new MyWorkAdobeSignLiveReadModelProvider({
    actionQueueAdapter: composition.actionQueueAdapter,
    recentCompletionsAdapter: composition.recentCompletionsAdapter,
    now: options?.now ?? (() => new Date()),
  });
  const projectLinksProvider = options?.projectLinksProvider ?? buildProjectLinksProvider();
  return {
    getMyWorkHome: (context) => adobeProvider.getMyWorkHome(context),
    getAdobeSignActionQueue: (context, query) =>
      adobeProvider.getAdobeSignActionQueue(context, query),
    getAdobeSignRecentCompletions: (context, query) =>
      adobeProvider.getAdobeSignRecentCompletions(context, query),
    getMyProjectLinks: (context) => projectLinksProvider.getMyProjectLinks(context),
  };
}

function composeFallbackProvider(
  options?: ResolveMyWorkReadModelProviderOptions,
): IMyWorkReadModelProvider {
  const mockProvider = new MyWorkMockReadModelProvider({ simulateBackendUnavailable: true });
  const projectLinksProvider = options?.projectLinksProvider ?? buildProjectLinksProvider();
  return {
    getMyWorkHome: (context) => mockProvider.getMyWorkHome(context),
    getAdobeSignActionQueue: (context, query) =>
      mockProvider.getAdobeSignActionQueue(context, query),
    getAdobeSignRecentCompletions: (context, query) =>
      mockProvider.getAdobeSignRecentCompletions(context, query),
    getMyProjectLinks: (context) => projectLinksProvider.getMyProjectLinks(context),
  };
}

function composeMockProvider(
  _options?: ResolveMyWorkReadModelProviderOptions,
): IMyWorkReadModelProvider {
  const mockProvider = new MyWorkMockReadModelProvider();
  // Mock-mode tests use the legacy provider directly. The projection-backed
  // path is only consulted in live composition; mock fixtures don't go through
  // the SharePoint helper list.
  const projectLinksProvider =
    _options?.projectLinksProvider ?? new MyProjectLinksReadModelProvider();
  return {
    getMyWorkHome: (context) => mockProvider.getMyWorkHome(context),
    getAdobeSignActionQueue: (context, query) =>
      mockProvider.getAdobeSignActionQueue(context, query),
    getAdobeSignRecentCompletions: (context, query) =>
      mockProvider.getAdobeSignRecentCompletions(context, query),
    getMyProjectLinks: (context) => projectLinksProvider.getMyProjectLinks(context),
  };
}

export function resolveMyWorkReadModelProvider(
  env: EnvLike,
  options?: ResolveMyWorkReadModelProviderOptions,
): IMyWorkReadModelProvider {
  if (isMockOrTestMode(env)) {
    return composeMockProvider(options);
  }
  const composition = composeAdobeSignLiveStack(env);
  if (composition.status !== 'ready') {
    return composeFallbackProvider(options);
  }
  return composeLiveProvider(composition, options);
}
