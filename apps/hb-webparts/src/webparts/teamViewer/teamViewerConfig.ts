/**
 * teamViewerConfig — resolve raw webpart properties into a strict
 * `TeamViewerConfig`, applying safe defaults and coercions.
 *
 * The profile-detail drawer feature flag defaults to `false` and must
 * be explicitly enabled by the configuring site. This is a product
 * lock: the drawer is implemented for real, but ships disabled.
 */
import type {
  TeamViewerConfig,
  TeamViewerDensity,
  TeamViewerFeatureFlags,
  TeamViewerLayout,
} from './teamViewerContracts.js';

export const DEFAULT_TEAM_VIEWER_FEATURE_FLAGS: TeamViewerFeatureFlags = {
  profileDetailDrawer: false,
};

const DEFAULT_HEADING = 'Team';
const DEFAULT_LAYOUT: TeamViewerLayout = 'grid';
const DEFAULT_DENSITY: TeamViewerDensity = 'standard';

const LAYOUTS: readonly TeamViewerLayout[] = ['grid', 'rail', 'strip', 'grouped'];
const DENSITIES: readonly TeamViewerDensity[] = ['compact', 'standard', 'expanded'];

function coerceString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function coerceLayout(value: unknown): TeamViewerLayout {
  return LAYOUTS.find((l) => l === value) ?? DEFAULT_LAYOUT;
}

function coerceDensity(value: unknown): TeamViewerDensity {
  return DENSITIES.find((d) => d === value) ?? DEFAULT_DENSITY;
}

function coerceFlags(raw: unknown): TeamViewerFeatureFlags {
  if (!raw || typeof raw !== 'object') return DEFAULT_TEAM_VIEWER_FEATURE_FLAGS;
  const source = raw as Record<string, unknown>;
  return {
    profileDetailDrawer: source.profileDetailDrawer === true,
  };
}

export function resolveTeamViewerConfig(raw: Record<string, unknown> | undefined): TeamViewerConfig {
  const heading = coerceString(raw?.heading) ?? DEFAULT_HEADING;
  const articleId = coerceString(raw?.articleId);
  const destinationKey = coerceString(raw?.destinationKey);
  const layout = coerceLayout(raw?.layout);
  const density = coerceDensity(raw?.density);
  const flags = coerceFlags(raw?.featureFlags);
  return { heading, articleId, destinationKey, layout, density, flags };
}
