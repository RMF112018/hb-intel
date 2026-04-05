/**
 * Icon resolution for homepage utility and discovery surfaces.
 *
 * Centralizes the iconKey-to-display-content mapping used by
 * ToolLauncherWorkHub and HomepageDiscoveryCluster. Both surfaces
 * previously maintained independent placeholder-grade icon logic.
 *
 * The resolver produces short text content (initials or fallback)
 * suitable for rendering inside HbcHomepageIconFrame. Prompts 02-04
 * may enhance this to support richer icon treatments.
 */

/** Known icon-key-to-initials mapping for utility/launcher surfaces. */
const UTILITY_ICON_MAP: Record<string, string> = {
  finance: 'FI',
  field: 'FL',
  hr: 'HR',
  safety: 'SF',
  quality: 'QC',
  risk: 'RM',
  ops: 'OE',
  admin: 'AD',
  legal: 'LG',
  it: 'IT',
};

const UTILITY_FALLBACK = 'AP';

/** Bullet fallback for discovery surfaces where no iconKey is provided. */
const DISCOVERY_FALLBACK = '\u2022';

/**
 * Resolve an iconKey to short display text for utility/launcher surfaces.
 *
 * Returns a recognized initials string when the key matches, otherwise
 * falls back to the first two uppercase characters of the key or a
 * generic fallback.
 */
export function resolveUtilityIconContent(iconKey: string | undefined): string {
  if (!iconKey) return UTILITY_FALLBACK;
  const normalized = iconKey.trim().toLowerCase();
  return UTILITY_ICON_MAP[normalized] ?? (iconKey.slice(0, 2).toUpperCase() || UTILITY_FALLBACK);
}

/**
 * Resolve an iconKey to short display text for discovery surfaces.
 *
 * Discovery items use a bullet fallback when no iconKey is provided,
 * otherwise display the first two uppercase characters.
 */
export function resolveDiscoveryIconContent(iconKey: string | undefined): string {
  if (!iconKey) return DISCOVERY_FALLBACK;
  return iconKey.slice(0, 2).toUpperCase() || DISCOVERY_FALLBACK;
}
