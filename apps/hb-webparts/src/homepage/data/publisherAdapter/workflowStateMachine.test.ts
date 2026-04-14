import { describe, expect, it } from 'vitest';
import {
  canTransition,
  historyActionFor,
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

  it('published cannot return to draft or inReview', () => {
    expect(canTransition('published', 'draft')).toBe(false);
    expect(canTransition('published', 'review')).toBe(false);
  });

  it('maps transitions to the correct history action', () => {
    expect(historyActionFor('approved', 'published')).toBe('publish');
    expect(historyActionFor('published', 'archived')).toBe('archive');
    expect(historyActionFor('draft', 'withdrawn')).toBe('withdraw');
    expect(historyActionFor('review', 'approved')).toBe('approvalDecision');
    expect(historyActionFor('scheduled', 'approved')).toBe('approvalDecision');
    expect(historyActionFor('draft', 'review')).toBe('transition');
  });
});
