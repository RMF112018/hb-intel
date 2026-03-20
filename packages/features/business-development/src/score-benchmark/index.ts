export { businessDevelopmentScoreBenchmarkProfile } from './profiles/index.js';

// BIC Registration (P2-C5 Blocker #2)
export {
  BD_SCORE_BENCHMARK_BIC_KEY,
  BD_SCORE_BENCHMARK_BIC_LABEL,
  createBdScoreBenchmarkBicRegistration,
} from './bic-registration.js';

// Notification Registrations (P2-C5 Blocker #6)
export { BD_SCORE_BENCHMARK_NOTIFICATION_REGISTRATIONS } from './notification-registrations.js';

export {
  mapScoreBenchmarkSnapshotToBdView,
  createReviewerConsensusSummary,
  mapDecisionSupportToPanelRoutes,
  mapStateToMyWorkPlacement,
  mapScoreBenchmarkReferenceIntegrations,
  type BdScoreBenchmarkViewModel,
  type ReviewerConsensusSummary,
  type BdPanelRouteProjection,
  type BdMyWorkPlacementProjection,
  type BdReferenceIntegrationProjection,
  type MapScoreBenchmarkIntegrationsInput,
} from './adapters/index.js';

export {
  createScoreBenchmarkReferenceIntegrations,
  projectScoreBenchmarkToBicActions,
  gateScoreBenchmarkByComplexity,
  projectScoreBenchmarkVersionedSnapshot,
  projectScoreBenchmarkRelatedItems,
  projectScoreBenchmarkToCanvasPlacement,
  resolveScoreBenchmarkNotifications,
  mapScoreBenchmarkToHealthIndicator,
  projectInlineHbiActions,
  projectSf22LearningSignals,
  type IScoreBenchmarkReferenceIntegrations,
  type IBdBicOwnershipAction,
  type IScoreBenchmarkComplexityProjection,
  type IScoreBenchmarkVersionedProjection,
  type IScoreBenchmarkRelatedItemsProjection,
  type IScoreBenchmarkCanvasPlacement,
  type IBdScoreBenchmarkNotificationProjection,
  type IScoreBenchmarkHealthProjection,
  type IHbiActionProjection,
  type IScoreBenchmarkLearningSignalProjection,
} from './integrations/index.js';

export {
  useBusinessDevelopmentScoreBenchmark,
  useScoreBenchmark,
  type UseScoreBenchmarkInput,
  type UseScoreBenchmarkResult,
} from './hooks/index.js';

export {
  ScoreBenchmarkGhostOverlay,
  BenchmarkSummaryPanel,
  SimilarPursuitsPanel,
  BenchmarkExplainabilityPanel,
  ReviewerConsensusPanel,
  WinZoneIndicator,
  BenchmarkFilterPanel,
  type ScoreBenchmarkGhostOverlayProps,
  type BenchmarkSummaryPanelProps,
  type SimilarPursuitsPanelProps,
  type BenchmarkExplainabilityPanelProps,
  type ReviewerConsensusPanelProps,
  type WinZoneIndicatorProps,
  type BenchmarkFilterPanelProps,
  type ScoreBenchmarkComplexityMode,
} from './components/index.js';
