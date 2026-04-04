export interface HomepageScaffoldConfig {
  maxItems: number;
  showSectionHeaders: boolean;
  enableAudienceFilter: boolean;
}

const DEFAULT_CONFIG: HomepageScaffoldConfig = {
  maxItems: 5,
  showSectionHeaders: true,
  enableAudienceFilter: true,
};

export function normalizeHomepageConfig(partial: Partial<HomepageScaffoldConfig> | undefined): HomepageScaffoldConfig {
  if (!partial) {
    return DEFAULT_CONFIG;
  }

  return {
    maxItems: Number.isFinite(partial.maxItems) && (partial.maxItems ?? 0) > 0 ? partial.maxItems ?? DEFAULT_CONFIG.maxItems : DEFAULT_CONFIG.maxItems,
    showSectionHeaders: partial.showSectionHeaders ?? DEFAULT_CONFIG.showSectionHeaders,
    enableAudienceFilter: partial.enableAudienceFilter ?? DEFAULT_CONFIG.enableAudienceFilter,
  };
}
