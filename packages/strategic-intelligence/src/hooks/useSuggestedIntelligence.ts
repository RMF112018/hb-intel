import { StrategicIntelligenceApi } from '../api/StrategicIntelligenceApi.js';
import type {
  ISuggestedIntelligenceMatch,
} from '../types/index.js';
import {
  appendSuggestionOutcome,
  appendTelemetryDelta,
  getSuggestionOutcomes,
  type StrategicIntelligenceSuggestionOutcome,
} from './stateStore.js';

const defaultApi = new StrategicIntelligenceApi();

export interface ISuggestedIntelligenceExplainabilityPayload {
  suggestionId: string;
  entryId: string;
  whyShown: string;
  matchDimensions: string[];
  reuseHistoryCount: number;
}

export interface UseSuggestedIntelligenceInput {
  projectId: string;
  scorecardId?: string;
}

export interface UseSuggestedIntelligenceResult {
  suggestions: ISuggestedIntelligenceMatch[];
  explainability: ISuggestedIntelligenceExplainabilityPayload[];
  outcomes: ReturnType<typeof getSuggestionOutcomes>;
  actions: {
    recordOutcome: (
      suggestionId: string,
      outcome: StrategicIntelligenceSuggestionOutcome
    ) => UseSuggestedIntelligenceResult;
  };
}

const telemetryDeltaForOutcome = (
  outcome: StrategicIntelligenceSuggestionOutcome
): {
  suggestionAcceptanceRate: number;
  suggestionExplainabilityEngagementRate: number;
} => {
  if (outcome === 'accepted') {
    return {
      suggestionAcceptanceRate: 1,
      suggestionExplainabilityEngagementRate: 1,
    };
  }

  if (outcome === 'dismissed') {
    return {
      suggestionAcceptanceRate: 0,
      suggestionExplainabilityEngagementRate: 1,
    };
  }

  return {
    suggestionAcceptanceRate: 0,
    suggestionExplainabilityEngagementRate: 0,
  };
};

export const useSuggestedIntelligence = (
  input: UseSuggestedIntelligenceInput,
  deps?: {
    api?: StrategicIntelligenceApi;
    now?: () => Date;
  }
): UseSuggestedIntelligenceResult => {
  const api = deps?.api ?? defaultApi;
  const now = deps?.now ?? (() => new Date());
  const scorecardId = input.scorecardId ?? input.projectId;
  const entries = api.getLivingEntries(scorecardId);

  const suggestions = entries.flatMap((entry) => entry.suggestedMatches);
  const explainability = suggestions.map((suggestion) => ({
    suggestionId: suggestion.suggestionId,
    entryId: suggestion.entryId,
    whyShown: suggestion.reason,
    matchDimensions: [...suggestion.matchedDimensions],
    reuseHistoryCount: suggestion.reuseHistoryCount,
  }));

  return {
    suggestions,
    explainability,
    outcomes: getSuggestionOutcomes(scorecardId),
    actions: {
      recordOutcome: (suggestionId, outcome) => {
        const recordedAt = now().toISOString();
        const telemetryDelta = telemetryDeltaForOutcome(outcome);

        appendSuggestionOutcome(scorecardId, {
          suggestionId,
          outcome,
          recordedAt,
        });

        appendTelemetryDelta(scorecardId, {
          channel: 'suggestionAcceptanceRate',
          delta: telemetryDelta.suggestionAcceptanceRate,
          recordedAt,
        });

        appendTelemetryDelta(scorecardId, {
          channel: 'suggestionExplainabilityEngagementRate',
          delta: telemetryDelta.suggestionExplainabilityEngagementRate,
          recordedAt,
        });

        return useSuggestedIntelligence(input, {
          api,
          now,
        });
      },
    },
  };
};
