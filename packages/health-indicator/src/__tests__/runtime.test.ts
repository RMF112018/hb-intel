import {
  resolveHealthIndicatorProfileConfig,
  buildHealthIndicatorSummary,
  type IHealthIndicatorCriterion,
  type IHealthIndicatorProfile,
  type IHealthIndicatorVersionedRecord,
  type IHealthIndicatorGovernanceMetadata,
  type IHealthIndicatorCompletenessMetadata,
} from '../runtime.js';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCriterion(
  overrides: Partial<IHealthIndicatorCriterion> & { criterionId: string },
): IHealthIndicatorCriterion {
  return {
    label: overrides.criterionId,
    weight: 25,
    isBlocker: false,
    isComplete: false,
    actionHref: `/action/${overrides.criterionId}`,
    completeness: {
      requiredCount: 1,
      completedCount: 0,
      missingCount: 1,
      completionPercent: 0,
    },
    assignee: null,
    ...overrides,
  };
}

function makeProfile(overrides?: Partial<IHealthIndicatorProfile>): IHealthIndicatorProfile {
  return {
    profileId: 'test-profile',
    criteria: [
      makeCriterion({ criterionId: 'cost-sections-populated', isBlocker: true, weight: 30 }),
      makeCriterion({ criterionId: 'bid-documents-attached', isBlocker: true, weight: 30 }),
      makeCriterion({ criterionId: 'subcontractor-coverage', weight: 20 }),
      makeCriterion({ criterionId: 'ce-sign-off', weight: 20 }),
    ],
    thresholds: {
      readyMinScore: 90,
      nearlyReadyMinScore: 70,
      attentionNeededMinScore: 50,
    },
    ...overrides,
  };
}

const defaultVersion: IHealthIndicatorVersionedRecord = {
  recordId: 'rec-1',
  version: 1,
  updatedAt: '2026-01-01T00:00:00.000Z',
  updatedBy: 'test-user',
};

const defaultGovernance: Omit<IHealthIndicatorGovernanceMetadata, 'telemetryKeys'> = {
  governanceState: 'active',
  recordedAt: '2026-01-01T00:00:00.000Z',
  recordedBy: 'test-user',
  traceId: 'trace-1',
};

const telemetryKeys = ['key-a', 'key-b'];

// ---------------------------------------------------------------------------
// resolveHealthIndicatorProfileConfig
// ---------------------------------------------------------------------------

describe('resolveHealthIndicatorProfileConfig', () => {
  it('returns baseline config when no override is provided', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: null,
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('baseline');
    expect(result.fallbackApplied).toBe(false);
    expect(result.validationErrors).toHaveLength(0);
    expect(result.profile.profileId).toBe('test-profile');
    expect(result.governance.telemetryKeys).toEqual(telemetryKeys);
  });

  it('applies criterion weight, label, and isBlocker overrides correctly', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        criteria: [
          {
            criterionId: 'subcontractor-coverage',
            weight: 40,
            label: 'Sub Coverage (Override)',
            isBlocker: true,
          },
        ],
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('admin-override');
    expect(result.fallbackApplied).toBe(false);

    const overriddenCriterion = result.profile.criteria.find(
      (c) => c.criterionId === 'subcontractor-coverage',
    );
    expect(overriddenCriterion).toBeDefined();
    expect(overriddenCriterion!.label).toBe('Sub Coverage (Override)');
    expect(overriddenCriterion!.isBlocker).toBe(true);
  });

  it('applies threshold overrides correctly', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        thresholds: {
          readyMinScore: 95,
          nearlyReadyMinScore: 80,
          attentionNeededMinScore: 60,
        },
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('admin-override');
    expect(result.profile.thresholds.readyMinScore).toBe(95);
    expect(result.profile.thresholds.nearlyReadyMinScore).toBe(80);
    expect(result.profile.thresholds.attentionNeededMinScore).toBe(60);
  });

  it('returns fallback with errors when duplicate criterion overrides provided', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        criteria: [
          { criterionId: 'subcontractor-coverage', weight: 40 },
          { criterionId: 'subcontractor-coverage', weight: 50 },
        ],
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('fallback');
    expect(result.fallbackApplied).toBe(true);
    expect(result.validationErrors.some((e) => e.includes('Duplicate'))).toBe(true);
  });

  it('returns fallback with errors when invalid threshold ordering (ready < nearly-ready)', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        thresholds: {
          readyMinScore: 50,
          nearlyReadyMinScore: 70,
          attentionNeededMinScore: 30,
        },
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('fallback');
    expect(result.fallbackApplied).toBe(true);
    expect(result.validationErrors.some((e) => e.includes('Threshold ordering invalid'))).toBe(true);
  });

  it('returns fallback with errors when unknown criterion ID in override', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        criteria: [{ criterionId: 'nonexistent-criterion', weight: 10 }],
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('fallback');
    expect(result.fallbackApplied).toBe(true);
    expect(result.validationErrors.some((e) => e.includes('Unknown criterion override id'))).toBe(true);
  });

  it('returns fallback when negative weight in override', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        criteria: [{ criterionId: 'subcontractor-coverage', weight: -5 }],
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('fallback');
    expect(result.fallbackApplied).toBe(true);
    expect(result.validationErrors.some((e) => e.includes('Negative weight'))).toBe(true);
  });

  it('returns fallback when no blocker criteria remain after override', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        criteria: [
          { criterionId: 'cost-sections-populated', isBlocker: false },
          { criterionId: 'bid-documents-attached', isBlocker: false },
        ],
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('fallback');
    expect(result.fallbackApplied).toBe(true);
    expect(result.validationErrors.some((e) => e.includes('blocker criterion is required'))).toBe(true);
  });

  it('normalizes weights to sum to 100', () => {
    const result = resolveHealthIndicatorProfileConfig({
      baseline: makeProfile(),
      override: {
        criteria: [
          { criterionId: 'cost-sections-populated', weight: 10 },
          { criterionId: 'bid-documents-attached', weight: 10 },
          { criterionId: 'subcontractor-coverage', weight: 10 },
          { criterionId: 'ce-sign-off', weight: 10 },
        ],
      },
      telemetryKeys,
      defaultVersion,
      defaultGovernance,
    });

    expect(result.source).toBe('admin-override');
    const totalWeight = result.profile.criteria.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBe(100);
  });
});

// ---------------------------------------------------------------------------
// buildHealthIndicatorSummary
// ---------------------------------------------------------------------------

describe('buildHealthIndicatorSummary', () => {
  const fixedTime = '2026-03-16T12:00:00.000Z';

  const resolvedConfig = {
    profile: makeProfile(),
    governance: {
      ...defaultGovernance,
      telemetryKeys,
    },
  };

  it('returns ready status when score is above threshold and no incomplete blockers', () => {
    const criteria = makeProfile().criteria.map((c) => ({ ...c, isComplete: true }));

    const summary = buildHealthIndicatorSummary(criteria, resolvedConfig, fixedTime);

    expect(summary.score.status).toBe('ready');
    expect(summary.score.value).toBe(100);
    expect(summary.score.computedAt).toBe(fixedTime);
  });

  it('returns not-ready when score is below attention-needed threshold', () => {
    // All incomplete => score 0, which is below attentionNeededMinScore (50)
    const criteria = makeProfile().criteria.map((c) => ({ ...c, isComplete: false }));

    const summary = buildHealthIndicatorSummary(criteria, resolvedConfig, fixedTime);

    expect(summary.score.status).toBe('not-ready');
    expect(summary.score.value).toBe(0);
  });

  it('returns attention-needed when score is between thresholds', () => {
    // Complete the two 30-weight blockers => 60/100 = 60%
    // 60 >= attentionNeededMinScore(50), but < nearlyReadyMinScore(70)
    // No incomplete blockers, so it falls through to attention-needed via score check
    const criteria = makeProfile().criteria.map((c) => {
      if (c.criterionId === 'cost-sections-populated' || c.criterionId === 'bid-documents-attached') {
        return { ...c, isComplete: true };
      }
      return { ...c, isComplete: false };
    });

    const summary = buildHealthIndicatorSummary(criteria, resolvedConfig, fixedTime);

    expect(summary.score.status).toBe('attention-needed');
  });

  it('returns correct completeness metadata', () => {
    const criteria = [
      makeCriterion({ criterionId: 'cost-sections-populated', isBlocker: true, isComplete: true, weight: 50 }),
      makeCriterion({ criterionId: 'bid-documents-attached', isBlocker: true, isComplete: false, weight: 50 }),
    ];

    const config = {
      profile: makeProfile({ criteria }),
      governance: { ...defaultGovernance, telemetryKeys },
    };

    const summary = buildHealthIndicatorSummary(criteria, config, fixedTime);

    expect(summary.completeness.requiredCount).toBe(2);
    expect(summary.completeness.completedCount).toBe(1);
    expect(summary.completeness.missingCount).toBe(1);
    expect(summary.completeness.completionPercent).toBe(50);
  });

  it('returns blocker recommendations when blockers are incomplete', () => {
    const criteria = makeProfile().criteria.map((c) => ({ ...c, isComplete: false }));

    const summary = buildHealthIndicatorSummary(criteria, resolvedConfig, fixedTime);

    const blockerRec = summary.recommendations.find(
      (r) => r.recommendationId === 'resolve-blockers',
    );
    expect(blockerRec).toBeDefined();
    expect(blockerRec!.category).toBe('blocker-resolution');
    expect(blockerRec!.priority).toBe('critical');
    expect(blockerRec!.actions.length).toBeGreaterThan(0);
  });

  it('returns improve-readiness-score recommendation when score < 70', () => {
    const criteria = makeProfile().criteria.map((c) => ({ ...c, isComplete: false }));

    const summary = buildHealthIndicatorSummary(criteria, resolvedConfig, fixedTime);

    const scoreRec = summary.recommendations.find(
      (r) => r.recommendationId === 'improve-readiness-score',
    );
    expect(scoreRec).toBeDefined();
    expect(scoreRec!.category).toBe('coverage-improvement');
    expect(scoreRec!.priority).toBe('high');
  });

  it('computes correct category breakdown dimensions', () => {
    const criteria = [
      makeCriterion({ criterionId: 'cost-sections-populated', isComplete: true, weight: 30 }),
      makeCriterion({ criterionId: 'bid-documents-attached', isComplete: false, weight: 30 }),
      makeCriterion({ criterionId: 'subcontractor-coverage', isComplete: true, weight: 20 }),
      makeCriterion({ criterionId: 'ce-sign-off', isComplete: true, weight: 20 }),
    ];

    const config = {
      profile: makeProfile({ criteria }),
      governance: { ...defaultGovernance, telemetryKeys },
    };

    const summary = buildHealthIndicatorSummary(criteria, config, fixedTime);
    const dimensions = summary.categoryBreakdown.map((b) => b.dimension).sort();

    expect(dimensions).toContain('scope-completeness');
    expect(dimensions).toContain('coverage');
    expect(dimensions).toContain('governance');
  });

  it('computes correct band values', () => {
    // Score 100 => excellent
    const allComplete = makeProfile().criteria.map((c) => ({ ...c, isComplete: true }));
    const summaryExcellent = buildHealthIndicatorSummary(allComplete, resolvedConfig, fixedTime);
    expect(summaryExcellent.score.band).toBe('excellent');

    // Score 0 => weak
    const noneComplete = makeProfile().criteria.map((c) => ({ ...c, isComplete: false }));
    const summaryWeak = buildHealthIndicatorSummary(noneComplete, resolvedConfig, fixedTime);
    expect(summaryWeak.score.band).toBe('weak');

    // Score ~60% => moderate (complete the two 20-weight + one 30-weight = 70/100)
    const someComplete = makeProfile().criteria.map((c) => {
      if (c.criterionId === 'cost-sections-populated') {
        return { ...c, isComplete: false };
      }
      return { ...c, isComplete: true };
    });
    const summaryModerate = buildHealthIndicatorSummary(someComplete, resolvedConfig, fixedTime);
    // 70% completed weight => band should be 'strong'
    expect(summaryModerate.score.band).toBe('strong');
  });
});
