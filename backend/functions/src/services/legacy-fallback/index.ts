export {
  LEGACY_PROJECT_SITE_COLLECTION_ROOT,
  LEGACY_FALLBACK_LIST_HOST_SITE_URL,
  DEFAULT_LEGACY_LIBRARY_NAME,
  LEGACY_PROJECT_ANNUAL_SOURCES,
  validateLegacySourceConfiguration,
  type LegacyProjectSourceYear,
  type ILegacyAnnualSourceConfig,
} from './source-config.js';

export {
  LEGACY_PROJECT_NUMBER_REGEX,
  LEGACY_NAME_NORMALIZATION_RULES,
  normalizeLegacyCandidateName,
  stripLeadingProjectNumberToken,
  MATCH_METHOD_CONFIDENCE,
} from './matching-contracts.js';

export {
  LEGACY_FALLBACK_REGISTRY_LIST_TITLE,
  LEGACY_FALLBACK_SYNC_RUNS_LIST_TITLE,
  LEGACY_FALLBACK_REVIEW_OVERRIDE_LIST_REQUIRED,
  LEGACY_FALLBACK_REGISTRY_LIST_DESCRIPTOR,
  LEGACY_FALLBACK_SYNC_RUNS_LIST_DESCRIPTOR,
  LEGACY_FALLBACK_LIST_DESCRIPTORS,
  getLegacyFallbackListHostSiteUrl,
} from './list-descriptors.js';

export {
  LEGACY_FALLBACK_DISCOVERY_SERVICE_PATH,
  LEGACY_FALLBACK_LIST_PROVISIONING_SCRIPT_PATH,
} from './placement-contract.js';

export {
  getLegacyFallbackHostingConfig,
  validateLegacyFallbackHostingConfig,
  getLegacyFallbackDiscoveryConfig,
  LEGACY_FALLBACK_PILOT_APP_REGISTRATION,
  type ILegacyFallbackHostingConfig,
  type ILegacyFallbackDiscoveryConfig,
  type ILegacyFallbackHostingValidationIssue,
  type ILegacyFallbackHostingValidationResult,
} from './hosting-config.js';

export {
  LegacyFallbackDiscoveryGraphClient,
  type ILegacyFallbackDiscoveryGraphClient,
  type ILegacyGraphDrive,
  type ILegacyGraphFolderItem,
  type ILegacyGraphSite,
} from './discovery-graph-client.js';

export {
  LegacyFallbackDiscoveryRepository,
  type ILegacyFallbackDiscoveryRepository,
  type ILegacyFallbackRegistryUpsertInput,
  type ILegacyFallbackSyncRunCompletion,
  type ILegacyFallbackSyncRunStart,
} from './discovery-repository.js';

export {
  LegacyFallbackDiscoveryService,
  type ILegacyFallbackDiscoveryRunOptions,
  type ILegacyFallbackDiscoverySampleRecord,
  type ILegacyFallbackDiscoveryRunSummary,
  type ILegacyFallbackDiscoverySourceSummary,
} from './discovery-service.js';

export {
  LegacyFallbackMatchingEngine,
  type ILegacyFallbackMatchingEngine,
  type ILegacyFallbackProjectIndexRecord,
  type ILegacyFallbackMatchInput,
  type ILegacyFallbackMatchDecision,
} from './matching-engine.js';

export {
  LegacyFallbackProjectIndexProvider,
  type ILegacyFallbackProjectIndexProvider,
} from './project-index-provider.js';

export {
  LegacyFallbackReviewRepository,
  type ILegacyFallbackReviewRecord,
  type ILegacyFallbackReviewUpdatePatch,
  type ILegacyFallbackReviewRepository,
} from './review-repository.js';

export {
  LegacyFallbackReviewService,
  type ILegacyFallbackReviewFilters,
  type ILegacyFallbackReviewListResult,
  type ILegacyFallbackManualBindInput,
  type ILegacyFallbackReviewActionInput,
} from './review-service.js';
