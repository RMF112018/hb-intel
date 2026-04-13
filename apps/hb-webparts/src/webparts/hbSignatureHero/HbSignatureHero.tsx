/**
 * HbSignatureHero — Signature hero orchestrator.
 *
 * Thin dispatcher that selects a mode-specific hero adapter based on the
 * host site URL. The explicit mode boundary replaces the previous
 * convention/doctrine-based homepage lock:
 *
 *   - `'homepage'` → `HbSignatureHeroHomepage` (flagship HBCentral render)
 *   - `'article'`  → `HbSignatureHeroArticle`  (non-HBCentral editorial)
 *
 * Mode resolution is owned by `resolveHeroMode` and is keyed off the
 * canonical HBCentral site URL. Each branch has its own strict content
 * contract; there is no merged optional-prop matrix across modes.
 *
 * Governing source:
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/README.md`
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/05-Implementation-Prompt-01-Lock-HBCentral-Mode.md`
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/06-Implementation-Prompt-02-Introduce-Article-Mode.md`
 */
import * as React from 'react';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import { HbSignatureHeroHomepage } from './HbSignatureHeroHomepage.js';
import { HbSignatureHeroArticle } from './HbSignatureHeroArticle.js';
import type { HbSignatureHeroArticleContent } from './HbSignatureHeroArticleContract.js';
import { resolveHeroMode } from './heroModeResolver.js';

export interface HbSignatureHeroProps {
  identity: HomepageIdentityInput;
  /** Optional authored background image URL for the homepage branch. */
  backgroundImage?: string;
  /** CDN base URL for static assets (injected by SPFx shell at runtime). */
  assetBaseUrl?: string;
  /** Absolute URL of the current SharePoint site, used for mode resolution. */
  siteUrl?: string;
  /**
   * Article-mode payload. Only consumed when the resolver selects the
   * article branch. Ignored on HBCentral.
   */
  article?: HbSignatureHeroArticleContent;
  now?: Date;
}

export function HbSignatureHero({
  identity,
  backgroundImage,
  assetBaseUrl,
  siteUrl,
  article,
  now,
}: HbSignatureHeroProps): React.JSX.Element | null {
  const mode = resolveHeroMode(siteUrl);

  if (mode === 'homepage') {
    return (
      <HbSignatureHeroHomepage
        identity={identity}
        backgroundImage={backgroundImage}
        assetBaseUrl={assetBaseUrl}
        now={now}
      />
    );
  }

  // Article mode — render only when an article payload is supplied.
  // Runtime wiring of the payload is the concern of the property-pane
  // / runtime integration closure unit; when nothing is wired yet the
  // hero intentionally renders nothing rather than fall back to the
  // homepage branch (which is locked to HBCentral).
  if (!article) {
    return null;
  }

  return <HbSignatureHeroArticle article={article} />;
}
