import { describe, expect, it } from 'vitest';

import {
  BID_READINESS_SYNC_INDICATORS,
  CONFIDENCE_LEVELS,
  GOVERNANCE_STATES,
  PRIORITY_LEVELS,
  READINESS_STATES,
  RECOMMENDATION_CATEGORIES,
  RISK_LEVELS,
  SCORING_BANDS,
  SEVERITY_LEVELS,
  TELEMETRY_KEYS,
  type ReadinessState,
  type ScoringBand,
} from './index.js';

describe('readinessConstants', () => {
  it('keeps deterministic canonical enumerations for status and scoring', () => {
    const firstReadiness: ReadinessState = READINESS_STATES[0];
    const firstBand: ScoringBand = SCORING_BANDS[0];

    expect(firstReadiness).toBe('ready');
    expect(firstBand).toBe('excellent');
    expect(READINESS_STATES).toEqual(['ready', 'nearly-ready', 'attention-needed', 'not-ready']);
    expect(SCORING_BANDS).toEqual(['excellent', 'strong', 'moderate', 'weak']);
  });

  it('exposes governance/risk/recommendation/key domains with unique values', () => {
    expect(new Set(RISK_LEVELS).size).toBe(RISK_LEVELS.length);
    expect(new Set(RECOMMENDATION_CATEGORIES).size).toBe(RECOMMENDATION_CATEGORIES.length);
    expect(new Set(PRIORITY_LEVELS).size).toBe(PRIORITY_LEVELS.length);
    expect(new Set(GOVERNANCE_STATES).size).toBe(GOVERNANCE_STATES.length);
    expect(new Set(TELEMETRY_KEYS).size).toBe(TELEMETRY_KEYS.length);
    expect(new Set(BID_READINESS_SYNC_INDICATORS).size).toBe(BID_READINESS_SYNC_INDICATORS.length);
    expect(new Set(CONFIDENCE_LEVELS).size).toBe(CONFIDENCE_LEVELS.length);
    expect(new Set(SEVERITY_LEVELS).size).toBe(SEVERITY_LEVELS.length);
    expect(TELEMETRY_KEYS).toHaveLength(5);
  });
});
