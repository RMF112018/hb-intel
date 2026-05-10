/**
 * Project Home composition order — first-impression hierarchy contract.
 *
 * Asserts the locked Wave 15A wave-b6 Prompt 04 card sequence on both
 * render paths using the direct-child bento card list (not nested
 * heading scans) so card-body content cannot contaminate the order.
 *
 * Read-model order asserts inside `waitFor` so both async hooks
 * (`useProjectHomeReadModel` and `useUnifiedLifecycleReadModel`) settle
 * before the exhaustive sequence is read — title presence alone is not
 * a sufficient signal because a card title can render before its body
 * settles.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

afterEach(() => {
  cleanup();
});

function readDirectCardTitlesInOrder(grid: Element): string[] {
  return Array.from(grid.children)
    .filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    )
    .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '(untitled)');
}

// Phase 06 Prompt 02 — canonical nine-card operational spine:
// Priority Actions, Site Health Summary, Document Control Center,
// Project Readiness, Approvals & Checkpoints, Missing Configurations,
// External Platforms, Team Snapshot, Recent Activity. Replaces the
// Wave 15A wave-b9 Prompt 4B-01 nine-card order.
const FIXTURE_EXPECTED_ORDER = [
  'Priority Actions',
  'Site Health Summary',
  'Document Control Center',
  'Project Readiness',
  'Approvals & Checkpoints',
  'Missing Configurations',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
] as const;

// Phase 06 Prompt 02 — read-model path begins with the same nine-card
// operational spine, then renders Lifecycle / Ask HBI / Procore Snapshot
// inside the unified-lifecycle section's renderAfterTimeline slot, then
// the lower-detail lifecycle cards (Project Memory, Project Lens,
// Related Records) at the tail. External Platforms / Team Snapshot /
// Recent Activity moved out of renderAfterTimeline into the spine.
const READ_MODEL_EXPECTED_ORDER = [
  'Priority Actions',
  'Site Health Summary',
  'Document Control Center',
  'Project Readiness',
  'Approvals & Checkpoints',
  'Missing Configurations',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
  'Lifecycle Timeline',
  'Ask HBI — Grounded Project Answers',
  'Procore snapshot',
  'Project Memory',
  'Project Lens',
  'Related Records',
] as const;

describe('Project Home — first-impression composition order', () => {
  describe('fixture path', () => {
    it('renders the Phase 06 Prompt 02 nine-card spine as direct bento children', () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid, 'bento grid should render').not.toBeNull();
      const titles = readDirectCardTitlesInOrder(grid!);
      expect(titles).toEqual([...FIXTURE_EXPECTED_ORDER]);
    });

    it('Missing Configurations card adopts the standard footprint for first-scan presence', () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const body = container.querySelector('[data-pcc-missing-configurations-body]');
      expect(body, 'Missing Configurations body should render').not.toBeNull();
      const card = body?.closest('[data-pcc-card]');
      expect(card, 'Missing Configurations should be wrapped in a PccDashboardCard').not.toBeNull();
      expect(card?.getAttribute('data-pcc-footprint')).toBe('standard');
    });

    it('zero in-grid `[data-pcc-card][data-pcc-active-surface-panel="project-home"]` cards exist; shell `<main>` is the sole carrier of the marker (Wave 15A wave-b9 Prompt 4B-01 — `PccProjectIntelligenceCard` removed; project-home moved to SURFACES_WITH_SHELL_ONLY_PANEL)', () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid).not.toBeNull();
      const inGridCompat = grid!.querySelectorAll(
        '[data-pcc-card][data-pcc-active-surface-panel="project-home"]',
      );
      expect(inGridCompat).toHaveLength(0);
      expect(grid!.textContent ?? '').not.toContain('Project Intelligence');

      const shellMain = container.querySelector(
        'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
      );
      expect(shellMain).not.toBeNull();
    });
  });

  describe('read-model path', () => {
    it('renders the Phase 06 Prompt 02 15-card sequence (waits for both async hooks to settle)', async () => {
      const client = createPccFixtureReadModelClient();
      const { container } = render(<PccApp forceMode="desktop" readModelClient={client} />);

      // Wrap the full sequence assertion in waitFor: both
      // useProjectHomeReadModel and useUnifiedLifecycleReadModel resolve
      // on independent microtasks, and a card title can render before
      // its body settles. Wait until the exhaustive sequence matches.
      await waitFor(() => {
        const grid = container.querySelector('[data-pcc-bento-grid]');
        expect(grid).not.toBeNull();
        const titles = readDirectCardTitlesInOrder(grid!);
        expect(titles).toEqual([...READ_MODEL_EXPECTED_ORDER]);
      });
    });
  });
});
