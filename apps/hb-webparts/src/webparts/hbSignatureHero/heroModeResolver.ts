/**
 * HbSignatureHero — hero mode resolver.
 *
 * Establishes an explicit, code-enforced mode boundary for the signature
 * hero instead of relying on convention or doctrine. The HBCentral site
 * URL is the canonical hard-lock for the flagship homepage render path:
 *
 *   https://hedrickbrotherscom.sharepoint.com/sites/HBCentral  → 'homepage'
 *
 * The canonical site URL is a production-infrastructure constant. It is
 * not a property-pane concern and not configurable per webpart instance.
 *
 * Phase-01 scope: only the `homepage` branch is exercised. Phase-02 will
 * introduce the `article` branch for non-HBCentral article rendering. To
 * keep the current behavior byte-identical on non-HBCentral workbench /
 * test hosts until Phase-02 lands, non-HBCentral resolves to `homepage`
 * today. See the marked TODO below.
 *
 * Governing source:
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/README.md`
 *   - `docs/architecture/plans/MASTER/spfx/hero/phase-01/05-Implementation-Prompt-01-Lock-HBCentral-Mode.md`
 */

export type HeroMode = 'homepage' | 'article';

/** Canonical HBCentral flagship site — hardcoded infrastructure constant. */
export const HBCENTRAL_SITE_URL =
  'https://hedrickbrotherscom.sharepoint.com/sites/HBCentral';

function normalizeSiteUrl(value: string): string {
  return value.trim().replace(/\/+$/, '').toLowerCase();
}

/**
 * Resolve the hero mode for the current render context.
 *
 * HBCentral always resolves to `'homepage'`. The comparison is
 * whitespace- and trailing-slash-tolerant and case-insensitive, because
 * SPFx `pageContext.web.absoluteUrl` has been observed to vary in case
 * across tenants and surfaces.
 */
export function resolveHeroMode(siteUrl?: string): HeroMode {
  if (typeof siteUrl === 'string' && siteUrl.trim().length > 0) {
    if (normalizeSiteUrl(siteUrl) === normalizeSiteUrl(HBCENTRAL_SITE_URL)) {
      return 'homepage';
    }
  }

  // TODO(phase-02): non-HBCentral contexts resolve to `'article'` once
  // the article-mode adapter is introduced. Until then, preserving the
  // current render on non-HBCentral hosts (workbench, tests, future
  // sites) means we fall through to `'homepage'`. This is the only
  // reason non-HBCentral still resolves to `'homepage'` today.
  return 'homepage';
}
