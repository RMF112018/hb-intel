export const FOLEON_LIST_TITLES = {
  contentRegistry: 'HB_FoleonContentRegistry',
  homepagePlacements: 'HB_FoleonHomepagePlacements',
  interactionEvents: 'HB_FoleonInteractionEvents',
  syncRuns: 'HB_FoleonSyncRuns',
} as const;

export interface FoleonBackendConfig {
  readonly sharePointSiteUrl?: string;
  readonly graphSiteId?: string;
  readonly contentRegistryListId?: string;
  readonly homepagePlacementsListId?: string;
  readonly syncRunsListId?: string;
  readonly foleonClientId?: string;
  readonly foleonClientSecret?: string;
  readonly foleonTokenUrl: string;
  readonly foleonDocsUrl: string;
  readonly foleonProjectsUrl: string;
  readonly allowedOrigins: ReadonlyArray<string>;
}

export function readFoleonBackendConfig(env: NodeJS.ProcessEnv = process.env): FoleonBackendConfig {
  return {
    sharePointSiteUrl: normalize(env.HB_FOLEON_SHAREPOINT_SITE_URL),
    graphSiteId: normalize(env.HB_FOLEON_GRAPH_SITE_ID),
    contentRegistryListId: normalize(env.HB_FOLEON_CONTENT_REGISTRY_LIST_ID),
    homepagePlacementsListId: normalize(env.HB_FOLEON_HOMEPAGE_PLACEMENTS_LIST_ID),
    syncRunsListId: normalize(env.HB_FOLEON_SYNC_RUNS_LIST_ID),
    foleonClientId: normalize(env.HB_FOLEON_CLIENT_ID),
    foleonClientSecret: normalize(env.HB_FOLEON_CLIENT_SECRET),
    foleonTokenUrl:
      normalize(env.HB_FOLEON_TOKEN_URL) ?? 'https://api.foleon.com/oauth/token',
    foleonDocsUrl: normalize(env.HB_FOLEON_DOCS_URL) ?? 'https://api.foleon.com/v2/docs',
    foleonProjectsUrl:
      normalize(env.HB_FOLEON_PROJECTS_URL) ?? 'https://api.foleon.com/v2/projects',
    allowedOrigins: parseCsv(env.HB_FOLEON_ALLOWED_ORIGINS ?? 'https://viewer.us.foleon.com'),
  };
}

export function foleonGraphConfigured(config: FoleonBackendConfig): boolean {
  return !!(
    config.sharePointSiteUrl &&
    config.graphSiteId &&
    config.contentRegistryListId &&
    config.homepagePlacementsListId &&
    config.syncRunsListId
  );
}

export function foleonApiConfigured(config: FoleonBackendConfig): boolean {
  return !!(config.foleonClientId && config.foleonClientSecret);
}

function normalize(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function parseCsv(value: string): ReadonlyArray<string> {
  return value
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}
