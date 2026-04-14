import { describe, expect, it } from 'vitest';
import {
  canTransition,
  validTransitionsFrom,
} from './workflowStateMachine';

describe('workflow state machine', () => {
  it('allows the canonical pre-publish happy path', () => {
    expect(canTransition('draft', 'review')).toBe(true);
    expect(canTransition('review', 'approved')).toBe(true);
    // `approved → scheduled` is intentionally forbidden in this
    // sprint (P1-1): there is no scheduled-publish executor, so
    // scheduled is inbound-forbidden to prevent dead-end states.
    expect(canTransition('published', 'archived')).toBe(true);
  });

  it('no state can transition INTO `scheduled` — the executor does not exist (P1-1)', () => {
    // Every state except `scheduled` itself must be unable to move
    // an article into `scheduled`. Legacy rows already in
    // `scheduled` can still be read and exited via outbound edges,
    // but operators cannot strand a new article there.
    for (const from of [
      'draft',
      'review',
      'approved',
      'published',
      'archived',
      'withdrawn',
    ] as const) {
      expect(canTransition(from, 'scheduled')).toBe(false);
      expect(validTransitionsFrom(from)).not.toContain('scheduled');
    }
  });

  it('legacy `scheduled` rows can still exit via approved or withdrawn', () => {
    // Preserves the ability to unwind data that was written before
    // the inbound edge was removed.
    expect(canTransition('scheduled', 'approved')).toBe(true);
    expect(canTransition('scheduled', 'withdrawn')).toBe(true);
  });

  it('forbids any generic manual promotion to `published`', () => {
    // `published` is produced exclusively by the publish orchestrator
    // after page creation + binding closure. No from-state should
    // expose it as a direct transition target.
    for (const from of [
      'draft',
      'review',
      'approved',
      'scheduled',
      'archived',
      'withdrawn',
    ] as const) {
      expect(canTransition(from, 'published')).toBe(false);
      expect(validTransitionsFrom(from)).not.toContain('published');
    }
  });

  it('any pre-terminal state can withdraw', () => {
    for (const from of ['draft', 'review', 'approved', 'scheduled', 'published', 'archived'] as const) {
      expect(canTransition(from, 'withdrawn')).toBe(true);
    }
  });

  it('withdrawn is terminal', () => {
    expect(validTransitionsFrom('withdrawn')).toHaveLength(0);
  });

  it('published cannot return to draft or review', () => {
    expect(canTransition('published', 'draft')).toBe(false);
    expect(canTransition('published', 'review')).toBe(false);
  });

  it('uses the tenant `review` state value (never legacy `inReview`)', () => {
    expect(validTransitionsFrom('draft')).toContain('review');
    expect(validTransitionsFrom('review')).toContain('approved');
  });
});
