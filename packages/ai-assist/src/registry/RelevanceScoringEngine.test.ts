import { describe, it, expect } from 'vitest';
import { RelevanceScoringEngine } from './RelevanceScoringEngine.js';
import { createMockAiAction } from '../../testing/createMockAiAction.js';
import type { IAiActionInvokeContext } from '../types/index.js';

const baseContext: IAiActionInvokeContext = {
  userId: 'user-1',
  role: 'estimator',
  recordType: 'scorecard',
  recordId: 'sc-1',
  complexity: 'standard',
};

describe('RelevanceScoringEngine', () => {
  it('returns empty array for empty input', () => {
    expect(RelevanceScoringEngine.scoreActions([], baseContext)).toEqual([]);
  });

  it('scores actions sorted descending by composite score', () => {
    const high = createMockAiAction({ actionKey: 'high', basePriorityScore: 100 });
    const low = createMockAiAction({ actionKey: 'low', basePriorityScore: 10 });

    const scores = RelevanceScoringEngine.scoreActions([low, high], baseContext);
    expect(scores[0].actionId).toBe('high');
    expect(scores[1].actionId).toBe('low');
    expect(scores[0].score).toBeGreaterThan(scores[1].score);
  });

  it('tag matching boosts score when context tags overlap', () => {
    const matched = createMockAiAction({
      actionKey: 'matched',
      relevanceTags: ['analysis', 'scorecard'],
      basePriorityScore: 50,
    });
    const unmatched = createMockAiAction({
      actionKey: 'unmatched',
      relevanceTags: ['finance', 'reporting'],
      basePriorityScore: 50,
    });

    const scores = RelevanceScoringEngine.scoreActions(
      [unmatched, matched],
      baseContext,
      ['analysis', 'scorecard'],
    );
    expect(scores[0].actionId).toBe('matched');
    expect(scores[0].factors.tagMatch).toBe(100);
    expect(scores[1].factors.tagMatch).toBe(0);
  });

  it('assigns neutral tag score (50) when action has no tags', () => {
    const noTags = createMockAiAction({ actionKey: 'no-tags', relevanceTags: undefined });
    const scores = RelevanceScoringEngine.scoreActions([noTags], baseContext, ['something']);
    expect(scores[0].factors.tagMatch).toBe(50);
  });

  it('assigns neutral tag score (50) when contextTags empty', () => {
    const withTags = createMockAiAction({ actionKey: 'with-tags', relevanceTags: ['a'] });
    const scores = RelevanceScoringEngine.scoreActions([withTags], baseContext, []);
    expect(scores[0].factors.tagMatch).toBe(50);
  });

  it('includes factors breakdown in each score', () => {
    const action = createMockAiAction({ actionKey: 'test', basePriorityScore: 80 });
    const scores = RelevanceScoringEngine.scoreActions([action], baseContext);
    expect(scores[0].factors).toHaveProperty('basePriority');
    expect(scores[0].factors).toHaveProperty('tagMatch');
    expect(scores[0].factors).toHaveProperty('complexityAlignment');
    expect(scores[0].factors).toHaveProperty('roleMatch');
  });

  it('complexity alignment gives 100 when met, 0 when not', () => {
    const expertAction = createMockAiAction({ actionKey: 'expert', minComplexity: 'expert' });
    const scores = RelevanceScoringEngine.scoreActions([expertAction], baseContext);
    expect(scores[0].factors.complexityAlignment).toBe(0); // standard < expert

    const expertContext = { ...baseContext, complexity: 'expert' as const };
    const scores2 = RelevanceScoringEngine.scoreActions([expertAction], expertContext);
    expect(scores2[0].factors.complexityAlignment).toBe(100);
  });

  it('role match gives 100 when allowed, 0 when not', () => {
    const restricted = createMockAiAction({ actionKey: 'r', allowedRoles: ['admin'] });
    const scores = RelevanceScoringEngine.scoreActions([restricted], baseContext);
    expect(scores[0].factors.roleMatch).toBe(0);

    const adminContext = { ...baseContext, role: 'admin' };
    const scores2 = RelevanceScoringEngine.scoreActions([restricted], adminContext);
    expect(scores2[0].factors.roleMatch).toBe(100);
  });

  it('caps basePriorityScore between 0 and 100', () => {
    const over = createMockAiAction({ actionKey: 'over', basePriorityScore: 200 });
    const under = createMockAiAction({ actionKey: 'under', basePriorityScore: -50 });
    const scores = RelevanceScoringEngine.scoreActions([over, under], baseContext);
    expect(scores[0].factors.basePriority).toBe(100);
    expect(scores[1].factors.basePriority).toBe(0);
  });
});
