import { describe, expect, it } from 'vitest';

import {
  buildHistoryLabels,
  buildTrendSeries,
  getConfidenceLabel,
  getConfidenceVariant,
  getDimensionEntries,
  getStatusVariant,
  hasEscalatedCompoundRisk,
  isConfidenceCaution,
  resolveComplexityTier,
} from '../components/displayModel.js';
import type { IProjectHealthPulse } from '../types/index.js';

const pulseFixture: IProjectHealthPulse = {
  projectId: 'p-display',
  computedAt: '2026-03-12T00:00:00.000Z',
  overallScore: 75,
  overallStatus: 'watch',
  overallConfidence: { tier: 'moderate', score: 70, reasons: [] },
  dimensions: {
    cost: {
      score: 70,
      status: 'watch',
      label: 'Cost',
      leadingScore: 72,
      laggingScore: 66,
      metrics: [],
      keyMetric: 'Cost key',
      trend: 'stable',
      hasExcludedMetrics: false,
      confidence: { tier: 'moderate', score: 68, reasons: [] },
    },
    time: {
      score: 74,
      status: 'watch',
      label: 'Time',
      leadingScore: 78,
      laggingScore: 64,
      metrics: [],
      keyMetric: 'Time key',
      trend: 'improving',
      hasExcludedMetrics: false,
      confidence: { tier: 'high', score: 80, reasons: [] },
    },
    field: {
      score: 63,
      status: 'at-risk',
      label: 'Field',
      leadingScore: 60,
      laggingScore: 70,
      metrics: [],
      keyMetric: 'Field key',
      trend: 'declining',
      hasExcludedMetrics: true,
      confidence: { tier: 'low', score: 50, reasons: ['excluded'] },
    },
    office: {
      score: 35,
      status: 'critical',
      label: 'Office',
      leadingScore: 30,
      laggingScore: 42,
      metrics: [],
      keyMetric: 'Office key',
      trend: 'unknown',
      hasExcludedMetrics: true,
      confidence: { tier: 'unreliable', score: 25, reasons: ['stale'] },
    },
  },
  compoundRisks: [],
  topRecommendedAction: null,
  explainability: {
    whyThisStatus: [],
    whatChanged: [],
    topContributors: [],
    whatMattersMost: 'Focus.',
  },
  triage: {
    bucket: 'attention-now',
    sortScore: 90,
    triageReasons: [],
  },
};

describe('displayModel', () => {
  it('maps status and confidence values to variants/labels', () => {
    expect(getStatusVariant('on-track')).toBe('onTrack');
    expect(getStatusVariant('watch')).toBe('warning');
    expect(getStatusVariant('at-risk')).toBe('atRisk');
    expect(getStatusVariant('critical')).toBe('critical');
    expect(getStatusVariant('data-pending')).toBe('pending');

    expect(getConfidenceVariant('high')).toBe('success');
    expect(getConfidenceVariant('moderate')).toBe('info');
    expect(getConfidenceVariant('low')).toBe('warning');
    expect(getConfidenceVariant('unreliable')).toBe('error');

    expect(getConfidenceLabel('high')).toBe('Confidence: High');
    expect(getConfidenceLabel('moderate')).toBe('Confidence: Moderate');
    expect(getConfidenceLabel('low')).toBe('Confidence: Low');
    expect(getConfidenceLabel('unreliable')).toBe('Confidence: Unreliable');
  });

  it('evaluates caution/escalation, entries, and trend/history helpers', () => {
    expect(isConfidenceCaution('low')).toBe(true);
    expect(isConfidenceCaution('unreliable')).toBe(true);
    expect(isConfidenceCaution('high')).toBe(false);

    expect(
      hasEscalatedCompoundRisk([
        { code: 'custom', severity: 'low', affectedDimensions: ['cost'], summary: 'low' },
      ])
    ).toBe(false);
    expect(
      hasEscalatedCompoundRisk([
        { code: 'custom', severity: 'moderate', affectedDimensions: ['cost'], summary: 'moderate' },
      ])
    ).toBe(true);

    const entries = getDimensionEntries(pulseFixture);
    expect(entries.map(([key]) => key)).toEqual(['cost', 'time', 'field', 'office']);

    const improving = buildTrendSeries(50, 'improving');
    const declining = buildTrendSeries(50, 'declining');
    const stable = buildTrendSeries(50, 'stable');

    expect(improving).toHaveLength(13);
    expect(declining).toHaveLength(13);
    expect(stable).toHaveLength(13);
    expect(Math.min(...improving)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...declining)).toBeLessThanOrEqual(100);
    expect(buildHistoryLabels(3)).toEqual(['W1', 'W2', 'W3']);
  });

  it('resolves complexity tiers with explicit and context fallback', () => {
    expect(resolveComplexityTier('expert', 'standard')).toBe('expert');
    expect(resolveComplexityTier(undefined, 'essential')).toBe('essential');
    expect(resolveComplexityTier(undefined, undefined)).toBe('standard');
  });
});
