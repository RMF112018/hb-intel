import { ScoreBenchmarkApi } from '../api/ScoreBenchmarkApi.js';
import type {
  INoBidRationalePayload,
  IScoreBenchmarkDecisionSupportInput,
  IScoreBenchmarkDecisionSupportResult,
  IScoreBenchmarkPanelContext,
} from '../types/index.js';
import {
  enqueueMutation,
  getNoBidDraft,
  setNoBidDraft,
} from './stateStore.js';
import {
  parseScoreBenchmarkPanelContext,
  serializeScoreBenchmarkPanelContext,
} from './panelUrlState.js';
import { useScoreBenchmarkState } from './useScoreBenchmarkState.js';

const defaultApi = new ScoreBenchmarkApi();

const createNoBidPayload = (draft: string): INoBidRationalePayload => ({
  artifactId: `no-bid-${Date.now()}`,
  rationale: draft,
  citations: [],
  approvedAt: new Date().toISOString(),
});

export const useBenchmarkDecisionSupport = (
  input: IScoreBenchmarkDecisionSupportInput,
  deps?: {
    api?: ScoreBenchmarkApi;
    now?: () => Date;
  }
): IScoreBenchmarkDecisionSupportResult => {
  const api = deps?.api ?? defaultApi;
  const now = deps?.now ?? (() => new Date());

  const baseState = useScoreBenchmarkState(
    {
      entityId: input.entityId,
      filterContext: input.filterContext,
      reviewerContext: input.reviewerContext,
    },
    {
      api,
      now,
    }
  );

  const panelContext = parseScoreBenchmarkPanelContext(input.urlSearch ?? '');
  const isBaseHydrated = baseState.status === 'success' && baseState.overlay !== null;

  const mostSimilarPursuits =
    isBaseHydrated && panelContext.panel === 'similar-pursuits'
      ? api.getMostSimilarPursuits(input.entityId, input.filterContext)
      : [];

  const explainability =
    isBaseHydrated && panelContext.panel === 'explainability'
      ? api.getExplainability(input.entityId, input.filterContext)
      : [];

  const draft = getNoBidDraft(input.entityId);

  const updatePanelContext = (nextPanelContext: IScoreBenchmarkPanelContext): string =>
    serializeScoreBenchmarkPanelContext(input.urlSearch ?? '', nextPanelContext);

  return {
    baseState,
    confidenceReasons: baseState.overlay?.benchmarks.flatMap((item) => item.confidence.reasons) ?? [],
    recommendationRationale: baseState.overlay?.recommendation.rationaleCodes ?? [],
    noBidRationaleDraft: draft,
    mostSimilarPursuits,
    explainability,
    recalibrationSummaries: baseState.overlay?.recalibrationSignals ?? [],
    panelContext,
    panelHydration: {
      baseHydrated: isBaseHydrated,
      detailHydrated: isBaseHydrated && panelContext.panel !== null,
    },
    actions: {
      setNoBidRationaleDraft: (value: string) => {
        setNoBidDraft(input.entityId, value);
      },
      queueRecommendationOverride: (reason: string) => {
        enqueueMutation(input.entityId, {
          mutationId: `${input.entityId}-recommendation-override-${Date.now()}`,
          mutationType: 'recommendation-override',
          entityId: input.entityId,
          payload: {
            reason,
            reviewerId: input.reviewerContext.reviewerId,
          },
          queuedAt: now().toISOString(),
          replaySafe: true,
        });

        return useScoreBenchmarkState(
          {
            entityId: input.entityId,
            filterContext: input.filterContext,
            reviewerContext: input.reviewerContext,
          },
          {
            api,
            now,
          }
        );
      },
      queueNoBidRationaleSave: (approvedBy: string) => {
        const rationaleText = getNoBidDraft(input.entityId).trim();

        if (!rationaleText) {
          throw new Error('No-bid rationale draft cannot be empty.');
        }

        const payload = createNoBidPayload(rationaleText);

        const record = api.saveNoBidRationale(input.entityId, payload, approvedBy);

        enqueueMutation(input.entityId, {
          mutationId: `${input.entityId}-no-bid-${Date.now()}`,
          mutationType: 'no-bid-rationale',
          entityId: input.entityId,
          payload: {
            record,
          },
          queuedAt: now().toISOString(),
          replaySafe: true,
        });

        return record;
      },
      openPanel: (panel, meta) =>
        updatePanelContext({
          panel,
          criterionId: meta?.criterionId,
          pursuitId: meta?.pursuitId,
        }),
      closePanel: () => updatePanelContext({ panel: null }),
    },
  };
};
