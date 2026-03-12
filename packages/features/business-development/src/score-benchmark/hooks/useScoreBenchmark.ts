import {
  useBenchmarkDecisionSupport,
  useScoreBenchmarkFilters,
  useScoreBenchmarkState,
  type IBenchmarkFilterContext,
  type IScoreBenchmarkReviewerContext,
} from '@hbc/score-benchmark';
import {
  createReviewerConsensusSummary,
  mapDecisionSupportToPanelRoutes,
  mapScoreBenchmarkReferenceIntegrations,
  mapScoreBenchmarkSnapshotToBdView,
  mapStateToMyWorkPlacement,
  type BdReferenceIntegrationProjection,
  type BdMyWorkPlacementProjection,
  type BdPanelRouteProjection,
  type BdScoreBenchmarkViewModel,
  type MapScoreBenchmarkIntegrationsInput,
  type ReviewerConsensusSummary,
} from '../adapters/index.js';
import type { ComplexityTier } from '@hbc/complexity';
import type { PostBidLearningSignal } from '@hbc/post-bid-autopsy';

export interface UseScoreBenchmarkInput {
  entityId: string;
  actorUserId: string;
  reviewerContext: IScoreBenchmarkReviewerContext;
  filterContext?: IBenchmarkFilterContext;
  approvedCohorts?: readonly string[];
  defaultCohortId?: string;
  urlSearch?: string;
  basePath?: string;
  complexityTier?: ComplexityTier;
  learningSignals?: readonly PostBidLearningSignal[];
}

export interface UseScoreBenchmarkResult {
  viewModel: BdScoreBenchmarkViewModel | null;
  panelRoutes: BdPanelRouteProjection;
  myWorkPlacement: BdMyWorkPlacementProjection;
  reviewerConsensus: ReviewerConsensusSummary | null;
  integrations: BdReferenceIntegrationProjection | null;
  primitive: {
    state: ReturnType<typeof useScoreBenchmarkState>;
    filters: ReturnType<typeof useScoreBenchmarkFilters>;
    decisionSupport: ReturnType<typeof useBenchmarkDecisionSupport>;
  };
}

export const useScoreBenchmark = (
  input: UseScoreBenchmarkInput
): UseScoreBenchmarkResult => {
  const filters = useScoreBenchmarkFilters({
    entityId: input.entityId,
    actorUserId: input.actorUserId,
    reviewerContext: input.reviewerContext,
    initialContext: input.filterContext,
    approvedCohorts: input.approvedCohorts,
    defaultCohortId: input.defaultCohortId,
  });

  const state = useScoreBenchmarkState({
    entityId: input.entityId,
    filterContext: filters.filterContext,
    reviewerContext: input.reviewerContext,
  });

  const decisionSupport = useBenchmarkDecisionSupport({
    entityId: input.entityId,
    filterContext: filters.filterContext,
    reviewerContext: input.reviewerContext,
    urlSearch: input.urlSearch,
  });

  const overlay = state.overlay;
  const viewModel = overlay ? mapScoreBenchmarkSnapshotToBdView(overlay, state) : null;
  const reviewerConsensus = overlay ? createReviewerConsensusSummary(overlay.consensus) : null;
  const panelRoutes = mapDecisionSupportToPanelRoutes(
    decisionSupport,
    input.basePath ?? '/business-development/score-benchmark'
  );
  const basePath = input.basePath ?? '/business-development/score-benchmark';
  const integrationInput: MapScoreBenchmarkIntegrationsInput | null = overlay
    ? {
      overlay,
      state,
      decisionSupport,
      basePath,
      complexityTier: input.complexityTier ?? 'standard',
      learningSignals: input.learningSignals,
    }
    : null;

  return {
    viewModel,
    panelRoutes,
    myWorkPlacement: mapStateToMyWorkPlacement(state, panelRoutes.similarPursuitsHref),
    reviewerConsensus,
    integrations: integrationInput
      ? mapScoreBenchmarkReferenceIntegrations(integrationInput)
      : null,
    primitive: {
      state,
      filters,
      decisionSupport,
    },
  };
};
