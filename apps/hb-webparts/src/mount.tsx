import { createElement, type ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { ReferenceHomepageComposition } from './homepage/ReferenceHomepageComposition.js';
import { PersonalizedWelcomeHeader } from './webparts/personalizedWelcomeHeader/PersonalizedWelcomeHeader.js';
import { HbHeroBanner } from './webparts/hbHeroBanner/HbHeroBanner.js';
import { PriorityActionsRail } from './webparts/priorityActionsRail/PriorityActionsRail.js';
import { ToolLauncherWorkHub } from './webparts/toolLauncherWorkHub/ToolLauncherWorkHub.js';
import { CompanyPulse } from './webparts/companyPulse/CompanyPulse.js';
import { LeadershipMessage } from './webparts/leadershipMessage/LeadershipMessage.js';
import { PeopleCulture } from './webparts/peopleCulture/PeopleCulture.js';
import { ProjectPortfolioSpotlight } from './webparts/projectPortfolioSpotlight/ProjectPortfolioSpotlight.js';
import { SafetyFieldExcellence } from './webparts/safetyFieldExcellence/SafetyFieldExcellence.js';
import { SmartSearchWayfinding } from './webparts/smartSearchWayfinding/SmartSearchWayfinding.js';
import type { HomepageIdentityInput } from './homepage/helpers/identity.js';

let root: Root | undefined;

interface MountConfig {
  webPartId?: unknown;
  webPartProperties?: unknown;
}

const WEBPART_RENDERERS: Record<string, (props: { config?: Record<string, unknown>; identity: HomepageIdentityInput }) => ReactNode> = {
  '46bfde64-f0cb-4f62-9f6b-a466f8fadc1f': ({ config, identity }) => createElement(PersonalizedWelcomeHeader, { config, identity }),
  '39762a4d-c7fd-44a6-a11e-4f8de9f5778d': ({ config }) => createElement(HbHeroBanner, { config }),
  'b3f07190-79cf-437d-a1d6-ecbf3f77e616': ({ config }) => createElement(PriorityActionsRail, { config }),
  'cb7060f5-b852-4600-b912-a5f6f7221ce2': ({ config }) => createElement(ToolLauncherWorkHub, { config }),
  '0b53f651-fd92-4f7f-a9da-f7797017f5eb': ({ config }) => createElement(CompanyPulse, { config }),
  'e8fa8a84-a48a-41d2-85a6-b7c7df70aeca': ({ config }) => createElement(LeadershipMessage, { config }),
  '27ac10f4-4054-4dd2-bd53-3b4ef4379ab4': ({ config }) => createElement(PeopleCulture, { config }),
  '8370ab0c-b6df-4db0-82f1-24b54750f508': ({ config }) => createElement(ProjectPortfolioSpotlight, { config }),
  '89ca5ff3-21f4-4b23-a953-4b7306ea1029': ({ config }) => createElement(SafetyFieldExcellence, { config }),
  '11d72b36-a92f-4e2d-9918-75df2cb0d11e': ({ config }) => createElement(SmartSearchWayfinding, { config }),
};

export async function mount(
  el: HTMLElement,
  spfxContext?: WebPartContext,
  config?: MountConfig,
): Promise<void> {
  void spfxContext;

  const webPartId = typeof config?.webPartId === 'string' ? config.webPartId : '';
  const webPartProperties =
    typeof config?.webPartProperties === 'object' && config.webPartProperties !== null
      ? (config.webPartProperties as Record<string, unknown>)
      : undefined;
  const identity: HomepageIdentityInput = {
    displayName: spfxContext?.pageContext?.user?.displayName,
    email: spfxContext?.pageContext?.user?.email,
  };
  const renderWebPart = WEBPART_RENDERERS[webPartId];

  root = createRoot(el);
  if (renderWebPart) {
    root.render(renderWebPart({ config: webPartProperties, identity }));
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
