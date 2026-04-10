import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { ReferenceHomepageComposition } from './homepage/ReferenceHomepageComposition.js';
import { storeSiteUrl } from './homepage/data/spContext.js';
import { createSharePointUserPhotoResolver } from './homepage/helpers/peopleCultureProfilePhotoResolver.js';
import { PersonalizedWelcomeHeader } from './webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from './webparts/hbHeroBanner/HbHeroBanner.js';
import { PriorityActionsRail } from './webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from './webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';
import { CompanyPulse } from './webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from './webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCultureMerged } from './webparts/peopleCulture/PeopleCultureMerged.js';
import { PeopleCulturePublic } from './webparts/peopleCulturePublic/PeopleCulturePublic.js';
import { PeopleCultureCompanion } from './webparts/peopleCultureCompanion/PeopleCultureCompanion.js';
import { HbKudos } from './webparts/hbKudos/HbKudos.js';
import { HbKudosCompanion } from './webparts/hbKudosCompanion/HbKudosCompanion.js';
import { ProjectPortfolioSpotlight } from './webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { SafetyFieldExcellence } from './webparts/safetyFieldExcellence/SafetyFieldExcellence.js';
import { SmartSearchWayfinding } from './webparts/smartSearchWayfinding/SmartSearchWayfinding.js';
import { HbSignatureHero } from './webparts/hbSignatureHero/HbSignatureHero.js';
import { PnpOps } from './webparts/pnp/PnpOps.js';
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
  getApiToken?: () => Promise<string>;
}

const WEBPART_RENDERERS: Record<string, (props: WebPartRendererContext) => ReactNode> = {
  '46bfde64-f0cb-4f62-9f6b-a466f8fadc1f': ({ config, identity }) => createElement(PersonalizedWelcomeHeader, { config, identity }),
  '39762a4d-c7fd-44a6-a11e-4f8de9f5778d': ({ config }) => createElement(HbHeroBanner, { config }),
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616': ({ config }) => createElement(PriorityActionsRail, { config }),
  'cb7060f5-b852-4600-b912-a5f6f7221ce2': ({ config }) => createElement(ToolLauncherWorkHub, { config }),
  '0b53f651-fd92-4f7f-a9da-f7797017f5eb': ({ config }) => createElement(CompanyPulse, { config }),
  'e8fa8a84-a48a-41d2-85a6-b7c7df70aeca': ({ config }) => createElement(LeadershipMessage, { config }),
  // Legacy merged People & Culture seam — preserved for backward compatibility
  // with already-placed SharePoint page instances. Phase-14 Prompt-01 split
  // into PeopleCulturePublic + HbKudos below; legacy stays live until rollout.
  '27ac10f4-4054-4dd2-bd53-3b4ef4379ab4': ({ config, identity }) => createElement(PeopleCultureMerged, { config, identity }),
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
  'f14e59a3-4d6b-43b2-952e-ba02dea11dad': ({ config, identity, assetBaseUrl }) => createElement(HbKudos, { config, identity, assetBaseUrl }),
  // Phase-14 kudos/ Prompt-03: HB Kudos HR Approval Companion webpart.
  'a8c5d9e2-7f14-4b3a-9c82-1e6f5d8a4b97': ({ config, identity, assetBaseUrl }) =>
    createElement(HbKudosCompanion, { config, identity, assetBaseUrl }),
  '8370ab0c-b6df-4db0-82f1-24b54750f508': ({ config }) => createElement(ProjectPortfolioSpotlight, { config }),
  '89ca5ff3-21f4-4b23-a953-4b7306ea1029': ({ config }) => createElement(SafetyFieldExcellence, { config }),
  '11d72b36-a92f-4e2d-9918-75df2cb0d11e': ({ config }) => createElement(SmartSearchWayfinding, { config }),
  // Prompt-01 PnP operations shell.
  '9e2dd84a-a121-4fb3-a964-f43a94abf9fd': ({ config, identity, getApiToken }) =>
    createElement(PnpOps, { config, identity, getApiToken }),
  '28acd6a7-2582-4d8a-86d4-b52bfbeb375c': ({ config, identity, assetBaseUrl }) => {
    const backgroundImage = typeof config?.backgroundImageUrl === 'string' && config.backgroundImageUrl
      ? config.backgroundImageUrl
      : undefined;
    return createElement(HbSignatureHero, { identity, backgroundImage, assetBaseUrl });
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
  const assetBaseUrl = typeof config?.assetBaseUrl === 'string' ? config.assetBaseUrl : undefined;
  const siteUrl = spfxContext?.pageContext?.web?.absoluteUrl;
  const identity: HomepageIdentityInput = {
    displayName: spfxContext?.pageContext?.user?.displayName,
    email: spfxContext?.pageContext?.user?.email,
  };
  const backendAudience =
    typeof webPartProperties?.backendAudience === 'string'
      ? webPartProperties.backendAudience.trim()
      : '';
  const getApiToken = createApiTokenProvider(spfxContext, backendAudience);
  const renderWebPart = WEBPART_RENDERERS[webPartId];

  root = createRoot(el);
  if (renderWebPart) {
    root.render(
      renderWebPart({
        config: webPartProperties,
        identity,
        assetBaseUrl,
        siteUrl,
        getApiToken,
      }),
    );
    return;
  }
  root.render(createElement(ReferenceHomepageComposition));
}

export function unmount(): void {
  root?.unmount();
  root = undefined;
}

const api = { mount, unmount };
(globalThis as { __hbIntel_hbWebparts?: typeof api }).__hbIntel_hbWebparts = api;
