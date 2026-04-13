import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { HbcThemeProvider } from '@hbc/ui-kit/homepage';
import { ReferenceHomepageComposition } from './homepage/ReferenceHomepageComposition.js';
import { storeSiteUrl, storeKudosListHostUrl } from './homepage/data/spContext.js';
import { createSharePointUserPhotoResolver } from './homepage/helpers/peopleCultureProfilePhotoResolver.js';
import { PersonalizedWelcomeHeader } from './webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from './webparts/hbHeroBanner/HbHeroBanner.js';
import { PriorityActionsRail } from './webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from './webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';
import { CompanyPulse } from './webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from './webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCulturePublic } from './webparts/peopleCulturePublic/PeopleCulturePublic.js';
import { PeopleCultureCompanion } from './webparts/peopleCultureCompanion/PeopleCultureCompanion.js';
import { HbKudos } from './webparts/hbKudos/HbKudos.js';
import { HbKudosCompanion } from './webparts/hbKudosCompanion/HbKudosCompanion.js';
import {
  HB_KUDOS_WEBPART_ID,
  HB_KUDOS_COMPANION_WEBPART_ID,
} from './webparts/hbKudos/kudosRuntimeContract.js';
import { TeamViewer } from './webparts/teamViewer/TeamViewer.js';
import { TEAM_VIEWER_WEBPART_ID } from './webparts/teamViewer/teamViewerRuntimeContract.js';
import { ProjectPortfolioSpotlight } from './webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { SafetyFieldExcellence } from './webparts/safetyFieldExcellence/SafetyFieldExcellence.js';
import { SmartSearchWayfinding } from './webparts/smartSearchWayfinding/SmartSearchWayfinding.js';
import { HbSignatureHero } from './webparts/hbSignatureHero/HbSignatureHero.js';
import { buildHeroArticleContent } from './webparts/hbSignatureHero/articleConfig.js';
import { createGraphPersonPhotoFn } from '@hbc/ui-kit/homepage';
import { HbHeroBannerAdmin } from './webparts/hbHeroBannerAdmin/HbHeroBannerAdmin.js';
import { PnpOps } from './webparts/pnp/PnpOps.js';
import { PNP_OPS_LEGACY_MODE, resolvePnpOpsExecutionMode } from './webparts/pnp/pnpOpsExecutionModes.js';
import type { HomepageIdentityInput } from './homepage/helpers/identity.js';

let root: Root | undefined;

interface MountConfig {
  webPartId?: unknown;
  webPartProperties?: unknown;
  assetBaseUrl?: unknown;
}

interface WebPartRendererContext {
  config?: Record<string, unknown>;
  identity: HomepageIdentityInput;
  assetBaseUrl?: string;
  siteUrl?: string;
  pageUrl?: string;
  getApiToken?: () => Promise<string>;
  getGraphToken?: () => Promise<string>;
}

const WEBPART_RENDERERS: Record<string, (props: WebPartRendererContext) => ReactNode> = {
  '46bfde64-f0cb-4f62-9f6b-a466f8fadc1f': ({ config, identity }) => createElement(PersonalizedWelcomeHeader, { config, identity }),
  '39762a4d-c7fd-44a6-a11e-4f8de9f5778d': ({ config }) => createElement(HbHeroBanner, { config }),
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616': ({ config }) => createElement(PriorityActionsRail, { config }),
  'cb7060f5-b852-4600-b912-a5f6f7221ce2': ({ config }) => createElement(ToolLauncherWorkHub, { config }),
  '0b53f651-fd92-4f7f-a9da-f7797017f5eb': ({ config }) => createElement(CompanyPulse, { config }),
  'e8fa8a84-a48a-41d2-85a6-b7c7df70aeca': ({ config }) => createElement(LeadershipMessage, { config }),
  // Legacy merged People & Culture seam (27ac10f4-…) was retired in the
  // Phase-23 closure. It is no longer packaged into hb-webparts.sppkg and
  // no longer rendered by the runtime. Consumers must migrate to the
  // split webparts below (PeopleCulturePublic + HbKudos).
  // Phase-14 pc/ Prompt-02: People & Culture public webpart (real runtime).
  // Prompt-04 wires a SharePoint profile-photo resolver so profile-photo-first
  // media renders through `/_layouts/15/userphoto.aspx` when a site URL is
  // available.
  'e39d9662-34c4-43e6-9425-5770f62da626': ({ config, identity, assetBaseUrl, siteUrl }) =>
    createElement(PeopleCulturePublic, {
      config,
      identity,
      assetBaseUrl,
      profilePhotoResolver: siteUrl
        ? createSharePointUserPhotoResolver({ siteUrl })
        : undefined,
    }),
  // Phase-14 pc/ Prompt-03: People & Culture HR operating companion webpart.
  // Prompt-04 passes the same profile-photo resolver so the multi-context
  // preview panel and content-family list rows render the same media the
  // public surface will.
  '7c3f8e24-5a9b-4c1d-b63e-8f2a194d5c7e': ({ config, identity, assetBaseUrl, siteUrl }) =>
    createElement(PeopleCultureCompanion, {
      config,
      identity,
      assetBaseUrl,
      profilePhotoResolver: siteUrl
        ? createSharePointUserPhotoResolver({ siteUrl })
        : undefined,
    }),
  // Phase-14 kudos/ Prompt-02: HB Kudos employee recognition webpart.
  // Phase-11 Prompt-01: getGraphToken wired so the shared people picker
  // can resolve directory photos via Graph /users/{upn}/photo/$value.
  // Phase-21 Wave 4: id is sourced from `kudosRuntimeContract` so the
  // mount wiring cannot drift from the manifest id.
  [HB_KUDOS_WEBPART_ID]: ({ config, identity, assetBaseUrl, getGraphToken }) =>
    createElement(HbKudos, { config, identity, assetBaseUrl, getGraphToken }),
  // Phase-14 kudos/ Prompt-03: HB Kudos HR Approval Companion webpart.
  // Phase-21 Wave 4: id from kudosRuntimeContract (single source of truth).
  [HB_KUDOS_COMPANION_WEBPART_ID]: ({ config, identity, assetBaseUrl }) =>
    createElement(HbKudosCompanion, { config, identity, assetBaseUrl }),
  // Phase-01 Prompt-01: TeamViewer (article-bound team-member viewer).
  [TEAM_VIEWER_WEBPART_ID]: ({ config, identity, assetBaseUrl, pageUrl, getGraphToken }) =>
    createElement(TeamViewer, { config, identity, assetBaseUrl, pageUrl, getGraphToken }),
  '8370ab0c-b6df-4db0-82f1-24b54750f508': ({ config }) => createElement(ProjectPortfolioSpotlight, { config }),
  '89ca5ff3-21f4-4b23-a953-4b7306ea1029': ({ config }) => createElement(SafetyFieldExcellence, { config }),
  '11d72b36-a92f-4e2d-9918-75df2cb0d11e': ({ config }) => createElement(SmartSearchWayfinding, { config }),
  // Prompt-01 PnP operations shell.
  '9e2dd84a-a121-4fb3-a964-f43a94abf9fd': ({ config, identity, getApiToken }) =>
    createElement(PnpOps, { config, identity, getApiToken }),
  // Phase-02 Prompt-05: Hero Banner Admin app — authoring surface
  // hosted on the HBCentral Homepage-Admin page. Reads/writes the
  // canonical Hero Banner Config list consumed by the public
  // HbHeroBanner webpart.
  '23d22f2d-7a15-4031-ab64-2454898bfd44': ({ siteUrl }) =>
    createElement(HbHeroBannerAdmin, { siteUrl }),
  '28acd6a7-2582-4d8a-86d4-b52bfbeb375c': ({ config, identity, assetBaseUrl, siteUrl, getGraphToken }) => {
    const backgroundImage = typeof config?.backgroundImageUrl === 'string' && config.backgroundImageUrl
      ? config.backgroundImageUrl
      : undefined;
    // Article content is derived from property-pane fields but only
    // consumed by the hero when the mode resolver selects 'article'
    // (non-HBCentral). HBCentral hard-locks 'homepage' regardless of
    // these fields. `buildHeroArticleContent` returns undefined when
    // any required article field (title/author/publishedDate) is
    // missing, so partial configuration cannot silently force article
    // mode on non-HBCentral hosts either — the orchestrator renders
    // nothing in that case.
    const article = buildHeroArticleContent(config);
    const fetchPersonPhoto = getGraphToken
      ? createGraphPersonPhotoFn(getGraphToken)
      : undefined;
    return createElement(HbSignatureHero, {
      identity,
      backgroundImage,
      assetBaseUrl,
      siteUrl,
      article,
      fetchPersonPhoto,
    });
  },
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

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: MountConfig,
): Promise<void> {
  storeSiteUrl(spfxContext?.pageContext?.web?.absoluteUrl);

  const webPartId = typeof config?.webPartId === 'string' ? config.webPartId : '';
  const webPartProperties =
    typeof config?.webPartProperties === 'object' && config.webPartProperties !== null
      ? (config.webPartProperties as Record<string, unknown>)
      : undefined;

  // For companion webparts hosted on a different site than the canonical
  // list host, store the explicit list-host URL from webpart properties
  // so data operations target the correct site (e.g. HBCentral).
  if (typeof webPartProperties?.kudosListHostUrl === 'string' && webPartProperties.kudosListHostUrl.trim()) {
    const candidate = webPartProperties.kudosListHostUrl.trim();
    // Only accept absolute https:// (or http:// for local dev) URLs.
    // A malformed override would silently point data fetches at a bad
    // origin — fail explicitly instead, keeping the hardcoded canonical
    // list host (HBCentral) in place.
    if (/^https?:\/\//i.test(candidate)) {
      storeKudosListHostUrl(candidate);
    } else {
      console.warn('[hb-webparts mount] Ignoring malformed kudosListHostUrl override; falling back to canonical host.', {
        candidate,
      });
    }
  }
  const assetBaseUrl = typeof config?.assetBaseUrl === 'string' ? config.assetBaseUrl : undefined;
  const siteUrl = spfxContext?.pageContext?.web?.absoluteUrl;
  // SPFx exposes the current page URL indirectly; window.location.href
  // is the authoritative page URL both in the hosted iframe and in
  // local dev. TeamViewer's article-binding resolver uses this as a
  // filter key against `HB Article Destination Pages` at HBCentral.
  const pageUrl = typeof window !== 'undefined' ? window.location.href : undefined;
  const identity: HomepageIdentityInput = {
    displayName: spfxContext?.pageContext?.user?.displayName,
    email: spfxContext?.pageContext?.user?.email,
  };
  const pnpExecutionMode = resolvePnpOpsExecutionMode(webPartProperties);
  const backendAudience = pnpExecutionMode === PNP_OPS_LEGACY_MODE
    && typeof webPartProperties?.backendAudience === 'string'
    ? webPartProperties.backendAudience.trim()
    : '';
  const getApiToken = pnpExecutionMode === PNP_OPS_LEGACY_MODE
    ? createApiTokenProvider(spfxContext, backendAudience)
    : undefined;
  const getGraphToken = createApiTokenProvider(spfxContext, 'https://graph.microsoft.com');
  const renderWebPart = WEBPART_RENDERERS[webPartId];
  const withThemeProvider = (node: ReactNode): ReactNode =>
    createElement(HbcThemeProvider, { forceTheme: 'light' as const, children: node });

  if (webPartId === '9e2dd84a-a121-4fb3-a964-f43a94abf9fd' && pnpExecutionMode === PNP_OPS_LEGACY_MODE && !getApiToken) {
    console.warn('[hb-webparts mount] PnP Ops is configured in legacy-admin-api mode without token-provider prerequisites.', {
      webPartId,
      executionMode: pnpExecutionMode,
      hasBackendAudience: Boolean(backendAudience),
      hasSpfxContext: Boolean(spfxContext),
    });
  }

  root = createRoot(el);
  if (renderWebPart) {
    root.render(
      withThemeProvider(
        renderWebPart({
          config: webPartProperties,
          identity,
          assetBaseUrl,
          siteUrl,
          pageUrl,
          getApiToken,
          getGraphToken,
        }),
      ),
    );
    return;
  }
  if (webPartId) {
    console.error('[hb-webparts mount] Unknown webPartId requested by shell runtime.', {
      webPartId,
      knownWebPartIds: Object.keys(WEBPART_RENDERERS),
    });
    root.render(
      createElement('section', {
        role: 'alert',
        style: {
          border: '1px solid #d13438',
          background: '#fdf3f4',
          color: '#242424',
          padding: '12px',
          borderRadius: '4px',
          fontFamily: 'Segoe UI, Arial, sans-serif',
        },
      }, `Unsupported webPartId "${webPartId}" in hb-webparts mount map. Check packaged manifest linkage and shell-entry mapping.`),
    );
    return;
  }
  // No webPartId context (local composition preview path) still requires
  // theme context for @hbc/ui-kit/homepage primitives/hooks.
  root.render(withThemeProvider(createElement(ReferenceHomepageComposition)));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbWebparts?: typeof api }).__hbIntel_hbWebparts = api;
