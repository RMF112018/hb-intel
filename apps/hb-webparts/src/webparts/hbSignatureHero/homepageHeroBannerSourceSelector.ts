/**
 * Homepage hero banner source selector.
 *
 * Resolves the winning image source for the flagship homepage hero and
 * exposes the decision as inspectable runtime truth (winning source,
 * resolved daypart, resolved filename, override-active state). The
 * selector is the single seam consulted by the hero adapter so that the
 * rendered URL and the diagnostic attributes are always derived from the
 * same decision.
 *
 * Precedence rules:
 * - When a wrapper-embedded authored override is supplied, the override
 *   wins. Standalone (non-wrapper) renders are not allowed to provide an
 *   override; the orchestrator must drop any incoming `backgroundImage`
 *   before reaching this selector when `flagshipRenderPath` is
 *   `'standalone-webpart'`.
 * - Otherwise the daypart default banner asset URL wins, derived from
 *   `assetBaseUrl` + the daypart filename for `now`.
 * - When no override and no `assetBaseUrl` is available, the resolver
 *   returns a `'no-image-fallback'` source so the hero falls back to its
 *   tinted gradient surface without claiming a daypart-default win.
 */
import {
  resolveHomepageHeroBannerAssetUrl,
  resolveHomepageHeroBannerGovernance,
  type HeroImageGovernance,
} from './homepageHeroBannerAssetResolver.js';
import {
  resolveHomepageHeroBannerDaypartAt,
  resolveHomepageHeroBannerFileNameAt,
  type HomepageHeroBannerDaypart,
} from './homepageHeroBannerTimeOfDaySelector.js';

export type HomepageHeroBannerSource =
  | 'wrapper-override'
  | 'daypart-default'
  | 'no-image-fallback';

export interface HomepageHeroBannerSelection {
  readonly source: HomepageHeroBannerSource;
  readonly daypart: HomepageHeroBannerDaypart;
  readonly fileName: string;
  readonly url: string | undefined;
  readonly overrideActive: boolean;
  /**
   * Tuned focal + safe-zone intensities for the resolved image. Override
   * URLs that don't match a registered daypart banner receive neutral
   * defaults (centered focal, 1.0 intensities) so contrast governance
   * stays declarative for every winning source.
   */
  readonly governance: HeroImageGovernance;
}

export interface HomepageHeroBannerSelectionInput {
  readonly now: Date;
  readonly assetBaseUrl: string | undefined;
  readonly authoredOverrideUrl: string | undefined;
}

export function resolveHomepageHeroBannerSelection(
  input: HomepageHeroBannerSelectionInput,
): HomepageHeroBannerSelection {
  const daypart = resolveHomepageHeroBannerDaypartAt(input.now);
  const fileName = resolveHomepageHeroBannerFileNameAt(input.now);
  const overrideActive = typeof input.authoredOverrideUrl === 'string'
    && input.authoredOverrideUrl.length > 0;

  if (overrideActive) {
    // Authored overrides may or may not match a registered daypart asset.
    // Pull governance by URL basename when possible; otherwise the
    // resolver returns neutral defaults so the contrast stack stays valid.
    const overrideFileName = extractFileName(input.authoredOverrideUrl) ?? fileName;
    return {
      source: 'wrapper-override',
      daypart,
      fileName,
      url: input.authoredOverrideUrl,
      overrideActive: true,
      governance: resolveHomepageHeroBannerGovernance(overrideFileName),
    };
  }

  const defaultUrl = resolveHomepageHeroBannerAssetUrl(input.assetBaseUrl, fileName);
  if (!defaultUrl) {
    return {
      source: 'no-image-fallback',
      daypart,
      fileName,
      url: undefined,
      overrideActive: false,
      governance: resolveHomepageHeroBannerGovernance(fileName),
    };
  }

  return {
    source: 'daypart-default',
    daypart,
    fileName,
    url: defaultUrl,
    overrideActive: false,
    governance: resolveHomepageHeroBannerGovernance(fileName),
  };
}

function extractFileName(url: string | undefined): string | undefined {
  if (!url) return undefined;
  const stripped = url.split(/[?#]/, 1)[0] ?? url;
  const segments = stripped.split('/');
  const last = segments[segments.length - 1];
  return last && last.length > 0 ? last : undefined;
}
