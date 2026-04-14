import { describe, expect, it } from 'vitest';
import {
  canTransition,
  validTransitionsFrom,
} from './workflowStateMachine';

describe('workflow state machine', () => {
  it('allows the canonical happy path', () => {
    expect(canTransition('draft', 'review')).toBe(true);
    expect(canTransition('review', 'approved')).toBe(true);
    expect(canTransition('approved', 'published')).toBe(true);
    expect(canTransition('published', 'archived')).toBe(true);
  });

  it('permits scheduled → published', () => {
    expect(canTransition('approved', 'scheduled')).toBe(true);
    expect(canTransition('scheduled', 'published')).toBe(true);
  });

  it('forbids skipping steps', () => {
    expect(canTransition('draft', 'published')).toBe(false);
    expect(canTransition('review', 'published')).toBe(false);
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
