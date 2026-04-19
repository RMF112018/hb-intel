import type { PriorityActionsRailConfig } from '../../homepage/webparts/utilityContracts.js';

// =============================================================================
// HB Homepage wrapper config — wrapper-owned integration seam
// -----------------------------------------------------------------------------
// This module owns the typed surface the homepage wrapper uses to compose its
// pre-shell regions (today: the embedded PriorityActionsRail). It is
// intentionally separate from:
//
//   - `ModuleConfigSlices` / shell validation — those describe shell-zone
//     module inputs and must stay shell-semantic. Adding rail concerns there
//     would leak command-band product configuration into shell preset /
//     occupant model.
//
//   - `PriorityActionsRailConfig` / rail list+admin data seams — those remain
//     the rail product's authoring / data authority. The wrapper never
//     becomes the content authority for the rail; it only carries
//     integration inputs.
//
// A reviewer reading this file alone should be able to understand what the
// wrapper owns without opening shell occupant or rail data code.
// =============================================================================

/**
 * Default band key the rail reads from when the wrapper does not override it.
 * Mirrors `usePriorityActionsData` default so wrapper semantics stay aligned
 * with rail data semantics without duplicating the literal in consumers.
 */
export const HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY = 'homepage-primary';

/**
 * Wrapper-facing rail integration inputs.
 *
 * - `enabled` — whether the wrapper should render the embedded rail region.
 *   Default true. A future control-panel decision may gate this; the shell
 *   must not decide it.
 * - `bandKey` — list-source band key for the rail data seam. Wrapper-owned
 *   because a page may choose a non-default band for the embedded rail.
 * - `activeAudience` — audience filter propagated to the embedded rail.
 *   Read from the same top-level `activeAudience` input that shell zones
 *   read, but propagated through an explicit wrapper channel so audience
 *   semantics are not implicitly inherited from `ModuleConfigSlices`.
 * - `fallbackConfig` — optional `PriorityActionsRailConfig` the wrapper may
 *   hand to the rail for its manifest-fallback path when no SP site context
 *   exists. The wrapper is not the content authority; this is only a
 *   fallback pass-through.
 */
export interface HbHomepageWrapperRailConfig {
  readonly enabled: boolean;
  readonly bandKey: string;
  readonly activeAudience?: string;
  readonly alignmentMode: 'shared-entry-governed' | 'legacy';
  readonly fallbackConfig?: Partial<PriorityActionsRailConfig>;
}

/**
 * Wrapper-facing hero integration inputs for the flagship homepage path.
 *
 * - `enabled` — whether the wrapper should render the embedded hero region.
 *   Default true. Shell must not decide hero presence.
 * - `backgroundImageUrl` — optional authored image override passed to the
 *   reusable `HbSignatureHero` surface for homepage mode.
 */
export interface HbHomepageWrapperHeroConfig {
  readonly enabled: boolean;
  readonly backgroundImageUrl?: string;
}

/**
 * Aggregate wrapper config. Kept as a single aggregate so future wrapper
 * regions (beyond the rail) can slot in without rewriting the extraction
 * contract.
 */
export interface HbHomepageWrapperConfig {
  readonly rail: HbHomepageWrapperRailConfig;
  readonly hero: HbHomepageWrapperHeroConfig;
}

const DEFAULT_RAIL_CONFIG: HbHomepageWrapperRailConfig = {
  enabled: true,
  bandKey: HB_HOMEPAGE_WRAPPER_DEFAULT_BAND_KEY,
  activeAudience: undefined,
  alignmentMode: 'shared-entry-governed',
  fallbackConfig: undefined,
};

const DEFAULT_HERO_CONFIG: HbHomepageWrapperHeroConfig = {
  enabled: true,
  backgroundImageUrl: undefined,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function readBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function readFallbackRailConfig(value: unknown): Partial<PriorityActionsRailConfig> | undefined {
  if (!isRecord(value)) return undefined;
  const out: Partial<PriorityActionsRailConfig> = {};
  const heading = readString(value.heading);
  if (heading) out.heading = heading;
  if (Array.isArray(value.groups)) out.groups = value.groups as PriorityActionsRailConfig['groups'];
  if (Array.isArray(value.actions)) out.actions = value.actions as PriorityActionsRailConfig['actions'];
  if (typeof value.maxItems === 'number') out.maxItems = value.maxItems;
  return Object.keys(out).length > 0 ? out : undefined;
}

/**
 * Extract wrapper-owned integration inputs from the untyped `config` bag
 * passed to the homepage webpart. Falls back to safe defaults on any
 * malformed input; validation is wrapper-local and does not widen shell
 * semantics.
 *
 * Recognized shape (all optional):
 * ```
 * {
 *   activeAudience?: string,             // shared top-level audience
 *   backgroundImageUrl?: string,         // legacy hero override (compat)
 *   hbHomepageWrapper?: {
 *     hero?: {
 *       enabled?: boolean,
 *       backgroundImageUrl?: string
 *     },
 *     rail?: {
 *       enabled?: boolean,
 *       bandKey?: string,
 *       fallbackConfig?: PriorityActionsRailConfig
 *     }
 *   }
 * }
 * ```
 */
export function extractHbHomepageWrapperConfig(
  config: Record<string, unknown> | undefined,
): HbHomepageWrapperConfig {
  if (!isRecord(config)) {
    return { rail: DEFAULT_RAIL_CONFIG, hero: DEFAULT_HERO_CONFIG };
  }

  const topAudience = readString(config.activeAudience);
  const legacyBackgroundImageUrl = readString(config.backgroundImageUrl);
  const wrapperNode = isRecord(config.hbHomepageWrapper) ? config.hbHomepageWrapper : undefined;
  const railNode = wrapperNode && isRecord(wrapperNode.rail) ? wrapperNode.rail : undefined;
  const heroNode = wrapperNode && isRecord(wrapperNode.hero) ? wrapperNode.hero : undefined;

  const rail: HbHomepageWrapperRailConfig = {
    enabled: readBoolean(railNode?.enabled, DEFAULT_RAIL_CONFIG.enabled),
    bandKey: readString(railNode?.bandKey) ?? DEFAULT_RAIL_CONFIG.bandKey,
    activeAudience: topAudience,
    alignmentMode:
      railNode?.alignmentMode === 'legacy' ? 'legacy' : DEFAULT_RAIL_CONFIG.alignmentMode,
    fallbackConfig: readFallbackRailConfig(railNode?.fallbackConfig),
  };

  const hero: HbHomepageWrapperHeroConfig = {
    enabled: readBoolean(heroNode?.enabled, DEFAULT_HERO_CONFIG.enabled),
    backgroundImageUrl:
      readString(heroNode?.backgroundImageUrl) ?? legacyBackgroundImageUrl,
  };

  return { rail, hero };
}
