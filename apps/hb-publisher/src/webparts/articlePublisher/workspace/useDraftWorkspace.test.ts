/**
 * Phase-09 Prompt-05 — scheduled legacy quarantine invariants.
 *
 * Pins the rail-level policy that `scheduled` is not silently omitted:
 * it participates in the rail's group order (so operators can see and
 * consciously handle legacy rows) and appears in
 * COLLAPSED_GROUPS_BY_DEFAULT (so it is visually quarantined as legacy).
 * Inbound transitions into `scheduled` remain forbidden by the state
 * machine; these tests are rail-integrity tests, not a reintroduction
 * of scheduling.
 */
import { describe, expect, it } from 'vitest';
import {
  COLLAPSED_GROUPS_BY_DEFAULT,
  DRAFT_GROUP_ORDER,
} from './useDraftWorkspace';

describe('DRAFT_GROUP_ORDER — scheduled legacy quarantine', () => {
  it('includes scheduled so it is not silently omitted from the queue rail', () => {
    expect(DRAFT_GROUP_ORDER).toContain('scheduled');
  });

  it('includes every other operational workflow state', () => {
    for (const state of ['draft', 'review', 'approved', 'published', 'archived', 'withdrawn'] as const) {
      expect(DRAFT_GROUP_ORDER).toContain(state);
    }
  });

  it('marks scheduled as collapsed-by-default (visually quarantined as legacy)', () => {
    expect(COLLAPSED_GROUPS_BY_DEFAULT.has('scheduled')).toBe(true);
  });
});
