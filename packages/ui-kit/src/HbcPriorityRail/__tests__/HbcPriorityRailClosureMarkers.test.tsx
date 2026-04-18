/**
 * Phase-08 Prompt-07 — Closure-grade runtime marker proof.
 *
 * These tests pin the end-to-end marker set required by
 * `docs/architecture/plans/MASTER/spfx/command-band/phase-08/09-Hosted-Runtime-Proof-Checklist.md`.
 *
 * They deliberately over-assert: if any one of the markers goes missing
 * the surface can no longer be closed on the hosted checklist, so the
 * suite is designed to fail loud rather than silently drift. Consumers
 * that inspect the DOM via the hosted-proof checklist depend on every
 * attribute asserted here.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HbcPriorityRailSurface } from '../HbcPriorityRailSurface.js';
import { HbcPriorityRailSkeleton } from '../HbcPriorityRailSkeleton.js';
import { HbcPriorityRailEmptyState } from '../HbcPriorityRailEmptyState.js';
import { HbcPriorityRailErrorState } from '../HbcPriorityRailErrorState.js';
import type { PriorityRailActionModel } from '../types.js';

const ACTIONS: PriorityRailActionModel[] = [
  { id: 'approve-rfi', title: 'Approve RFI', href: '/rfi/1', groupKey: 'approvals', groupTitle: 'Approvals' },
  { id: 'sign-co', title: 'Sign CO #22', href: '/co/22', groupKey: 'approvals', groupTitle: 'Approvals' },
  { id: 'safety-note', title: 'Review Safety Note', href: '/safety/1', groupKey: 'safety', groupTitle: 'Safety' },
  { id: 'field-report', title: 'Submit Field Report', href: '/field/1', groupKey: 'field', groupTitle: 'Field' },
];

describe('HbcPriorityRail — closure-grade runtime markers', () => {
  it('flagship context emits the full hosted-checklist marker set on a single render', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!, ACTIONS[1]!] },
          { key: 'safety', title: 'Safety', actions: [ACTIONS[2]!] },
          { key: 'field', title: 'Field', actions: [ACTIONS[3]!] },
        ]}
        overflowItems={[ACTIONS[3]!]}
        overflowStrategy="menu"
      />,
    );

    // Surface identity markers (checklist §B flagship rail layer)
    const surface = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.getAttribute('data-hbc-priority-rail-context')).toBe('homepage-flagship');
    expect(surface.getAttribute('data-hbc-premium')).toBe('priority-rail');
    expect(surface.getAttribute('data-hbc-flagship-layout')).toBe('command-strip');

    // Grid + tile markers
    expect(container.querySelector('[data-hbc-flagship-grid="true"]')).not.toBeNull();
    expect(
      container.querySelectorAll('[data-hbc-flagship-tile="true"]').length,
    ).toBeGreaterThan(0);

    // Per-tile section reference preserves grouping identity
    const tiles = Array.from(
      container.querySelectorAll('[data-hbc-flagship-tile="true"]'),
    );
    expect(tiles.every((tile) => tile.getAttribute('data-hbc-tile-section'))).toBe(true);

    // Section markers preserved even though flagship flattens groups
    expect(container.querySelectorAll('[data-testid^="section-"]').length).toBe(3);

    // Overflow region renders when overflowItems present
    expect(container.querySelector('[data-hbc-flagship-overflow="true"]')).not.toBeNull();
  });

  it('default context omits flagship-only markers (non-regression guard for admin preview / non-homepage consumers)', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        items={[ACTIONS[0]!, ACTIONS[1]!]}
      />,
    );
    const surface = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement;
    expect(surface.getAttribute('data-hbc-priority-rail-context')).toBe('default');
    expect(surface.getAttribute('data-hbc-flagship-layout')).toBeNull();
    expect(container.querySelector('[data-hbc-flagship-grid]')).toBeNull();
    expect(container.querySelector('[data-hbc-flagship-tile]')).toBeNull();
  });

  it('flagship compaction markers fire when sparse primary collapses to a single command strip', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!] },
        ]}
      />,
    );
    const surface = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement;
    expect(surface.getAttribute('data-hbc-flagship-single-section')).toBe('true');
    // featured-band collapsed because totalVisible === 1
    expect(container.querySelector('[data-hbc-featured-slot="true"]')).toBeNull();
  });

  it('failure states render distinct ARIA roles so hosted proof can observe loading/empty/error independently (checklist §F)', () => {
    // Skeleton + empty use role="status" with distinct aria-labels; error
    // uses role="alert" for assertive SR hand-off. Hosted proof scripts
    // can distinguish all three without coupling to private data-hbc-ui
    // markers that are internal to the failure-state components.
    const skeleton = render(<HbcPriorityRailSkeleton count={3} />).container;
    const skeletonRoot = skeleton.querySelector('[role="status"]');
    expect(skeletonRoot).not.toBeNull();
    expect(skeletonRoot?.getAttribute('aria-label')).toMatch(/loading/i);

    const empty = render(<HbcPriorityRailEmptyState title="No actions" />).container;
    expect(empty.querySelector('[role="status"]')).not.toBeNull();

    const error = render(<HbcPriorityRailErrorState title="Failed" />).container;
    expect(error.querySelector('[role="alert"]')).not.toBeNull();
  });
});
