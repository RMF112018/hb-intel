/**
 * HbSignatureHero — Signature hero orchestrator.
 *
 * Thin dispatcher that selects a mode-specific hero adapter based on the
 * host site URL. The explicit mode boundary replaces the previous
 * convention/doctrine-based homepage lock:
 *
 *   - `'homepage'` → `HbSignatureHeroHomepage` (flagship HBCentral render)
 *   - `'article'`  → reserved for Phase-02 (not introduced yet)
 *
 * Mode resolution is owned by `resolveHeroMode` and is keyed off the
 * canonical HBCentral site URL.
 *
 * Governing source:
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/README.md`
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/05-Implementation-Prompt-01-Lock-HBCentral-Mode.md`
 */
import * as React from 'react';
import type { HomepageIdentityInput } from '../../homepage/helpers/identity.js';
import { HbSignatureHeroHomepage } from './HbSignatureHeroHomepage.js';
import { resolveHeroMode } from './heroModeResolver.js';

export interface HbSignatureHeroProps {
  identity: HomepageIdentityInput;
  /** Optional authored background image URL (wide, low-clutter photography preferred). */
  backgroundImage?: string;
  /** CDN base URL for static assets (injected by SPFx shell at runtime). */
  assetBaseUrl?: string;
  /** Absolute URL of the current SharePoint site, used for mode resolution. */
  siteUrl?: string;
  now?: Date;
}

export function HbSignatureHero({
  identity,
  backgroundImage,
  assetBaseUrl,
  siteUrl,
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

  // TODO(phase-02): wire the article-mode adapter here.
  return null;
}
