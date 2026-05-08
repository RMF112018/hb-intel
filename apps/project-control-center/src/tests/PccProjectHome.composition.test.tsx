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

const FIXTURE_EXPECTED_ORDER = [
  'Project Intelligence',
  'Priority Actions',
  'Approvals & Checkpoints',
  'Project Readiness',
  'Document Control Center',
  'Site Health Summary',
  'Missing Configurations',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
] as const;

// Wave 15A wave-b6 Prompt 05 — Lifecycle Timeline and Ask HBI promoted
// above Procore / reference / history; lower-detail lifecycle cards
// (Project Memory, Project Lens, Related Records) remain at the tail.
const READ_MODEL_EXPECTED_ORDER = [
  'Project Intelligence',
  'Priority Actions',
  'Approvals & Checkpoints',
  'Project Readiness',
  'Document Control Center',
  'Site Health Summary',
  'Missing Configurations',
  'Lifecycle Timeline',
  'Ask HBI — Grounded Project Answers',
  'Procore snapshot',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
  'Project Memory',
  'Project Lens',
  'Related Records',
] as const;

describe('Project Home — first-impression composition order', () => {
  describe('fixture path', () => {
    it('renders the locked Wave 15A wave-b6 Prompt 04 card sequence as direct bento children', () => {
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

    it('exactly one [data-pcc-active-surface-panel="project-home"] exists, carried by the Project Intelligence card (active-panel ownership preserved)', () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(panels).toHaveLength(1);
      expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
      expect(panels[0].textContent).toContain('Project Intelligence');
    });
  });

  describe('read-model path', () => {
    it('renders the locked Wave 15A wave-b6 Prompt 04 16-card sequence (waits for both async hooks to settle)', async () => {
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
