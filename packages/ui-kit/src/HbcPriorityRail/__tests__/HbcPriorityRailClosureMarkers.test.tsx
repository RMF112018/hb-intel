/**
 * Closure-grade runtime markers for the flagship launcher grid.
 *
 * The surface identity markers pinned here are what hosted-runtime
 * proof scripts read to confirm the packaged homepage rail is the
 * quick-launch tile model — not a prior command-band regression.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HbcPriorityRailSurface } from '../HbcPriorityRailSurface.js';
import { HbcPriorityRailSkeleton } from '../HbcPriorityRailSkeleton.js';
import { HbcPriorityRailEmptyState } from '../HbcPriorityRailEmptyState.js';
import { HbcPriorityRailErrorState } from '../HbcPriorityRailErrorState.js';
import type { PriorityRailActionModel } from '../types.js';

const ACTIONS: PriorityRailActionModel[] = [
  { id: 'approve-rfi', title: 'Approve RFI', href: '/rfi/1' },
  { id: 'sign-co', title: 'Sign CO #22', href: '/co/22' },
  { id: 'safety-note', title: 'Review Safety Note', href: '/safety/1' },
  { id: 'field-report', title: 'Submit Field Report', href: '/field/1' },
];

describe('HbcPriorityRail — closure-grade runtime markers', () => {
  it('flagship context emits the launcher-grid marker set on a single render', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[ACTIONS[0]!, ACTIONS[1]!, ACTIONS[2]!, ACTIONS[3]!]}
        overflowItems={[ACTIONS[3]!]}
      />,
    );

    const surface = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement;
    expect(surface).not.toBeNull();
    expect(surface.getAttribute('data-hbc-priority-rail-context')).toBe('homepage-flagship');
    expect(surface.getAttribute('data-hbc-premium')).toBe('priority-rail');
    expect(surface.getAttribute('data-hbc-flagship-layout')).toBe('launcher-grid');

    const grid = container.querySelector('[data-hbc-flagship-grid="true"]');
    expect(grid).not.toBeNull();
    expect(grid?.getAttribute('data-hbc-flagship-tile-count')).toBe('4');

    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(4);
    expect(
      Array.from(tiles).every((t) => Boolean(t.getAttribute('data-hbc-tile-action'))),
    ).toBe(true);

    // Overflow region renders when overflowItems present.
    expect(container.querySelector('[data-hbc-flagship-overflow="true"]')).not.toBeNull();

    // Legacy command-band chrome must be absent.
    expect(surface.getAttribute('data-hbc-flagship-compacted')).toBeNull();
    expect(surface.getAttribute('data-hbc-flagship-single-section')).toBeNull();
    expect(container.querySelector('[data-hbc-featured-slot]')).toBeNull();
    expect(container.querySelector('[data-hbc-flagship-tile-index]')).toBeNull();
  });

  it('default context omits flagship-only markers', () => {
    const { container } = render(
      <HbcPriorityRailSurface title="Priority Actions" items={[ACTIONS[0]!, ACTIONS[1]!]} />,
    );
    const surface = container.querySelector('[data-hbc-ui="priority-rail"]') as HTMLElement;
    expect(surface.getAttribute('data-hbc-priority-rail-context')).toBe('default');
    expect(surface.getAttribute('data-hbc-flagship-layout')).toBeNull();
    expect(container.querySelector('[data-hbc-flagship-grid]')).toBeNull();
    expect(container.querySelector('[data-hbc-flagship-tile]')).toBeNull();
  });

  it('flagship flattens sections into ordered tiles without section-chrome', () => {
    const { container } = render(
      <HbcPriorityRailSurface
        title="Priority Actions"
        context="homepage-flagship"
        items={[]}
        sections={[
          { key: 'approvals', title: 'Approvals', actions: [ACTIONS[0]!, ACTIONS[1]!] },
          { key: 'safety', title: 'Safety', actions: [ACTIONS[2]!] },
        ]}
      />,
    );
    const tiles = container.querySelectorAll('[data-hbc-flagship-tile="true"]');
    expect(tiles.length).toBe(3);
    // No stacked section headings or per-tile eyebrows in the new model.
    expect(container.querySelector('[data-hbc-tile-eyebrow]')).toBeNull();
    expect(container.querySelector('[data-testid^="section-"]')).toBeNull();
  });

  it('failure states render distinct ARIA roles for independent hosted observation', () => {
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
