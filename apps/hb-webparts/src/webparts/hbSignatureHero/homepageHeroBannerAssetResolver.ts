/**
 * Homepage hero banner asset resolver + per-image governance.
 *
 * Ownership contract:
 * - Canonical homepage package-owned banner files live under
 *   `apps/hb-homepage/assets/hero-banners/`.
 * - Runtime URL assembly for those package-owned defaults is centralized
 *   here so hero surfaces never rely on brittle raw string concatenation.
 *
 * Image-governance contract (W01r-P16):
 * - Each approved daypart photo carries a tuned focal point and
 *   text-safe / logo-safe intensity multipliers so the hero's contrast
 *   stack adapts per-image instead of relying on one generalized scrim.
 * - Tablet- and phone-specific focal overrides absorb narrower-crop
 *   composition shifts so subjects don't slide under the text or logo
 *   on portrait viewports.
 * - Unknown filenames (authored overrides without a registered entry,
 *   or future banner additions) resolve to neutral defaults so the
 *   hero never breaks; intensities default to 1.0 and focal to 50/50.
 */

export interface HeroFocalPoint {
  /** Horizontal focal anchor as a 0–100 percentage. */
  readonly x: number;
  /** Vertical focal anchor as a 0–100 percentage. */
  readonly y: number;
}

export interface HeroImageGovernance {
  /** Desktop focal point used for `background-position` on ≥769px viewports. */
  readonly focal: HeroFocalPoint;
  /** Optional tablet focal override applied at ≤768px. */
  readonly tabletFocal?: HeroFocalPoint;
  /** Optional phone focal override applied at ≤480px. */
  readonly phoneFocal?: HeroFocalPoint;
  /**
   * Multiplier on the localized text-safe darken zone behind the
   * greeting and tagline. 1.0 is the default zone strength; bump above
   * 1.0 for bright midday scenes, drop below 1.0 for already-dark
   * imagery (e.g., night).
   */
  readonly textSafeIntensity: number;
  /**
   * Multiplier on the localized logo-safe brighten zone behind the
   * full-color HBC logo. 1.0 is the default zone strength; bump above
   * 1.0 for dark imagery, drop below 1.0 when the photo's right edge
   * is already bright.
   */
  readonly logoSafeIntensity: number;
}

const NEUTRAL_GOVERNANCE: HeroImageGovernance = {
  focal: { x: 50, y: 50 },
  textSafeIntensity: 1,
  logoSafeIntensity: 1,
};

/**
 * Per-fileName tuned governance for the four approved daypart banners.
 * Focal points keep busy construction subjects in the visual gutter
 * between the left text zone and the right logo zone. Intensity
 * multipliers adapt the localized contrast zones to each image's
 * native luminance so the global scrim stays subtle.
 */
const HOMEPAGE_HERO_BANNER_GOVERNANCE: Readonly<Record<string, HeroImageGovernance>> = {
  'banner_home_7_morning.png': {
    focal: { x: 55, y: 62 },
    tabletFocal: { x: 58, y: 58 },
    phoneFocal: { x: 60, y: 55 },
    textSafeIntensity: 0.9,
    logoSafeIntensity: 0.95,
  },
  'banner_home_7_mid-day.png': {
    focal: { x: 52, y: 68 },
    tabletFocal: { x: 55, y: 64 },
    phoneFocal: { x: 58, y: 60 },
    textSafeIntensity: 1.15,
    logoSafeIntensity: 0.8,
  },
  'banner_home_7_evening.png': {
    focal: { x: 50, y: 55 },
    tabletFocal: { x: 52, y: 52 },
    phoneFocal: { x: 55, y: 50 },
    textSafeIntensity: 0.95,
    logoSafeIntensity: 1.05,
  },
  'banner_home_7_night.png': {
    focal: { x: 48, y: 50 },
    tabletFocal: { x: 50, y: 48 },
    phoneFocal: { x: 52, y: 48 },
    textSafeIntensity: 0.55,
    logoSafeIntensity: 1.3,
  },
};

export function resolveHomepageHeroBannerAssetUrl(
  assetBaseUrl: string | undefined,
  bannerFileName: string,
): string | undefined {
  if (!assetBaseUrl) {
    return undefined;
  }
  const trimmedBase = assetBaseUrl.trim();
  if (!trimmedBase) {
    return undefined;
  }
  const normalizedBase = trimmedBase.endsWith('/') ? trimmedBase : `${trimmedBase}/`;
  return `${normalizedBase}${bannerFileName}`;
}

function clampPercentage(value: number): number {
  if (!Number.isFinite(value)) return 50;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return value;
}

function clampIntensity(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  if (value > 2) return 2;
  return value;
}

function normalizeFocal(focal: HeroFocalPoint | undefined): HeroFocalPoint | undefined {
  if (!focal) return undefined;
  return { x: clampPercentage(focal.x), y: clampPercentage(focal.y) };
}

/**
 * Returns tuned governance for an approved daypart banner filename, or
 * neutral defaults (centered focal, 1.0 intensities) for unknown sources
 * (authored overrides, future banners, etc.). Values are clamped so
 * upstream typos can't produce invalid CSS positions or negative
 * intensities.
 */
export function resolveHomepageHeroBannerGovernance(
  bannerFileName: string,
): HeroImageGovernance {
  const tuned = HOMEPAGE_HERO_BANNER_GOVERNANCE[bannerFileName];
  if (!tuned) {
    return NEUTRAL_GOVERNANCE;
  }
  const tabletFocal = normalizeFocal(tuned.tabletFocal);
  const phoneFocal = normalizeFocal(tuned.phoneFocal);
  return {
    focal: { x: clampPercentage(tuned.focal.x), y: clampPercentage(tuned.focal.y) },
    ...(tabletFocal ? { tabletFocal } : {}),
    ...(phoneFocal ? { phoneFocal } : {}),
    textSafeIntensity: clampIntensity(tuned.textSafeIntensity),
    logoSafeIntensity: clampIntensity(tuned.logoSafeIntensity),
  };
}

export const HOMEPAGE_HERO_BANNER_NEUTRAL_GOVERNANCE: HeroImageGovernance =
  NEUTRAL_GOVERNANCE;
