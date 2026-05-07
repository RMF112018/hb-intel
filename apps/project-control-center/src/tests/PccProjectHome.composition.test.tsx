/**
 * Project Home composition order — first-impression hierarchy contract.
 *
 * Asserts the bento card ordering surfaces high-frequency operational
 * signals (priority actions → setup gaps → operational health → pending
 * decisions → readiness) before reference / history content. Order
 * markers via card heading text scoped to direct bento children — never
 * sibling indexes — so future cards can be added without re-rewriting
 * the ordering invariant (per feedback_per_lane_marker_assertions).
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

afterEach(() => {
  cleanup();
});

function readCardTitlesInOrder(grid: Element): string[] {
  // Wave 15A wave-b3 Prompt 04 — Tier 1 command cards now render `h2`
  // (per `01_CARD_TIER_REGION_CONTRACT.md`) while every other card
  // stays `h3`. Use the heading-tag union so the Project Intelligence
  // hero card's title participates in the ordering check.
  return Array.from(grid.querySelectorAll('[data-pcc-card] :is(h2,h3,h4)')).map((el) =>
    (el.textContent ?? '').trim(),
  );
}

function indexOfTitle(titles: readonly string[], expected: string): number {
  const idx = titles.indexOf(expected);
  expect(idx, `card '${expected}' should appear in the bento grid`).toBeGreaterThanOrEqual(0);
  return idx;
}

describe('Project Home — first-impression composition order', () => {
  describe('fixture path', () => {
    it('renders the priority cluster (priority actions, missing configurations, site health, approvals, readiness) before reference and history cards', () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid, 'bento grid should render').not.toBeNull();
      const titles = readCardTitlesInOrder(grid!);

      const intelligence = indexOfTitle(titles, 'Project Intelligence');
      const priority = indexOfTitle(titles, 'Priority Actions');
      const missingConfig = indexOfTitle(titles, 'Missing Configurations');
      const siteHealth = indexOfTitle(titles, 'Site Health Summary');
      const approvals = indexOfTitle(titles, 'Approvals & Checkpoints');
      const readiness = indexOfTitle(titles, 'Project Readiness');
      const documents = indexOfTitle(titles, 'Document Control Center');
      const externalSystems = indexOfTitle(titles, 'External Platforms');
      const recentActivity = indexOfTitle(titles, 'Recent Activity');

      // Hero is always first.
      expect(intelligence).toBe(0);
      // Priority cluster comes before reference + history cards.
      expect(priority).toBeLessThan(missingConfig);
      expect(missingConfig).toBeLessThan(siteHealth);
      expect(siteHealth).toBeLessThan(approvals);
      expect(approvals).toBeLessThan(readiness);
      expect(readiness).toBeLessThan(documents);
      expect(documents).toBeLessThan(externalSystems);
      expect(externalSystems).toBeLessThan(recentActivity);
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
    it('renders priority, missing-config, site-health, procore, approvals, and readiness before document/reference and unified-lifecycle cards', async () => {
      const client = createPccFixtureReadModelClient();
      const { container } = render(<PccApp forceMode="desktop" readModelClient={client} />);

      // The read-model path renders Procore + unified lifecycle + Ask HBI
      // after a microtask resolves; wait for at least the Procore snapshot
      // card heading to appear before reading order.
      await waitFor(() => {
        const grid = container.querySelector('[data-pcc-bento-grid]');
        expect(grid).not.toBeNull();
        const titles = readCardTitlesInOrder(grid!);
        expect(titles).toContain('Procore snapshot');
      });

      const grid = container.querySelector('[data-pcc-bento-grid]')!;
      const titles = readCardTitlesInOrder(grid);

      const intelligence = indexOfTitle(titles, 'Project Intelligence');
      const priority = indexOfTitle(titles, 'Priority Actions');
      const missingConfig = indexOfTitle(titles, 'Missing Configurations');
      const siteHealth = indexOfTitle(titles, 'Site Health Summary');
      const procoreSnapshot = indexOfTitle(titles, 'Procore snapshot');
      const approvals = indexOfTitle(titles, 'Approvals & Checkpoints');
      const readiness = indexOfTitle(titles, 'Project Readiness');
      const documents = indexOfTitle(titles, 'Document Control Center');
      const recentActivity = indexOfTitle(titles, 'Recent Activity');

      expect(intelligence).toBe(0);
      expect(priority).toBeLessThan(missingConfig);
      expect(missingConfig).toBeLessThan(siteHealth);
      expect(siteHealth).toBeLessThan(procoreSnapshot);
      expect(procoreSnapshot).toBeLessThan(approvals);
      expect(approvals).toBeLessThan(readiness);
      expect(readiness).toBeLessThan(documents);
      expect(documents).toBeLessThan(recentActivity);

      // Unified-lifecycle and Ask HBI sections sit after the first-scan + reference cluster.
      const lifecycleTimeline = indexOfTitle(titles, 'Lifecycle Timeline');
      expect(recentActivity).toBeLessThan(lifecycleTimeline);
    });
  });
});
