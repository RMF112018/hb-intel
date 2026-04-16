/**
 * hb-publisher mount entry.
 *
 * Single-webpart SPFx dispatch for the Article Publisher authoring surface.
 * Preserves the manifest id `1a6f8b2c-4e5d-42c1-8f9a-3b7c5d6e8f10` so existing
 * tenant page-part instances keep working after the package lineage split.
 */
import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { HbcThemeProvider } from '@hbc/ui-kit/homepage';
import { storeSiteUrl } from '@hbc/sharepoint-platform';
import { ArticlePublisher } from './webparts/articlePublisher/ArticlePublisher.js';
import { ARTICLE_PUBLISHER_WEBPART_ID } from './webparts/articlePublisher/runtimeContract.js';
import type { AssetLibrarySearchFn } from './webparts/articlePublisher/sharedChrome/index.js';
import { createAssetLibrarySearch } from './data/publisherAdapter/assetLibrarySource.js';
import { PUBLISHER_LIST_HOST_SITE_URL } from './data/publisherAdapter/publisherListDescriptors.js';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- side-effect import injects Publisher tokens at :root
import publisherTokens from './webparts/articlePublisher/sharedChrome/tokens.module.css';
void publisherTokens;
import mountStyles from './mount.module.css';

interface HomepageIdentityInput {
  displayName?: string;
  email?: string;
}

let root: Root | undefined;

interface MountConfig {
  webPartId?: unknown;
  webPartProperties?: unknown;
  assetBaseUrl?: unknown;
}

interface WebPartRendererContext {
  identity: HomepageIdentityInput;
  siteUrl?: string;
  getGraphToken?: () => Promise<string>;
  /**
   * Governed asset-library search function constructed by
   * {@link buildHostedSearchAssets} when SPFx context is present.
   * `undefined` in dev-preview / hostless paths so the authoring UI
   * honestly falls back to URL-first entry rather than pretending to
   * have production governance it does not have.
   */
  searchAssets?: AssetLibrarySearchFn;
}

const WEBPART_RENDERERS: Record<string, (props: WebPartRendererContext) => ReactNode> = {
  [ARTICLE_PUBLISHER_WEBPART_ID]: ({ siteUrl, identity, getGraphToken, searchAssets }) =>
    createElement(ArticlePublisher, {
      siteUrl,
      actorEmail: identity?.email,
      getGraphToken,
      searchAssets,
    }),
};

function createApiTokenProvider(
  context: WebPartContext | undefined,
  audience: string,
): (() => Promise<string>) | undefined {
  if (!context || !audience) {
    return undefined;
  }
  return async (): Promise<string> => {
    const provider = await context.aadTokenProviderFactory.getTokenProvider();
    return provider.getToken(audience);
  };
}

/**
 * Build the governed asset-library search function for the hosted
 * runtime. Returns `undefined` when no SPFx context is available
 * (dev preview, storybook, hostless test harnesses) so the UI falls
 * back to URL-first entry without pretending to have a live library.
 *
 * The provider binds to `PUBLISHER_LIST_HOST_SITE_URL` — the
 * HBCentral absolute URL — matching the Projects lookup anchor so
 * hosted pages outside HBCentral still resolve assets against the
 * correct tenant library instead of the page site.
 *
 * Exported for `mount.test.ts`; runtime callers should go through
 * {@link mount}.
 */
export function buildHostedSearchAssets(
  spfxContext: WebPartContext | undefined,
): AssetLibrarySearchFn | undefined {
  if (!spfxContext) return undefined;
  return createAssetLibrarySearch({ hostSiteUrl: PUBLISHER_LIST_HOST_SITE_URL });
}

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: MountConfig,
): Promise<void> {
  storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl);

  const webPartId = typeof config?.webPartId === 'string' ? config.webPartId : '';
  const siteUrl = spfxContext?.pageContext?.web?.absoluteUrl;
  const identity: HomepageIdentityInput = {
    displayName: spfxContext?.pageContext?.user?.displayName,
    email: spfxContext?.pageContext?.user?.email,
  };
  const getGraphToken = createApiTokenProvider(spfxContext, 'https://graph.microsoft.com');
  const searchAssets = buildHostedSearchAssets(spfxContext);
  const renderWebPart = WEBPART_RENDERERS[webPartId];
  const withThemeProvider = (node: ReactNode): ReactNode =>
    createElement(HbcThemeProvider, { forceTheme: 'light' as const, children: node });

  root = createRoot(el);
  if (renderWebPart) {
    root.render(
      withThemeProvider(
        renderWebPart({
          identity,
          siteUrl,
          getGraphToken,
          searchAssets,
        }),
      ),
    );
    return;
  }
  if (webPartId) {
    console.error('[hb-publisher mount] Unknown webPartId requested by shell runtime.', {
      webPartId,
      knownWebPartIds: Object.keys(WEBPART_RENDERERS),
    });
    root.render(
      createElement(
        'section',
        {
          role: 'alert',
          'aria-live': 'assertive',
          className: mountStyles.unknownWebpartFallback,
        },
        createElement(
          'p',
          { className: mountStyles.unknownWebpartHeadline },
          'Unsupported web part',
        ),
        createElement(
          'p',
          { className: mountStyles.unknownWebpartDetail },
          `webPartId "${webPartId}" is not mapped in the hb-publisher mount. Check packaged manifest linkage and shell-entry mapping.`,
        ),
      ),
    );
    return;
  }
  // Fallback dev preview (no SPFx context).
  root.render(withThemeProvider(createElement(ArticlePublisher, { siteUrl })));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbPublisher?: typeof api }).__hbIntel_hbPublisher = api;
