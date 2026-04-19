/**
 * Homepage hero banner asset resolver.
 *
 * Ownership contract:
 * - Canonical homepage package-owned banner files live under
 *   `apps/hb-homepage/assets/hero-banners/`.
 * - Runtime URL assembly for those package-owned defaults is centralized
 *   here so hero surfaces never rely on brittle raw string concatenation.
 */

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
