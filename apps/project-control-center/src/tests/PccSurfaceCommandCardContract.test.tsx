/**
 * PCC route command card contract — Wave 15A wave-b3 Prompt 02.
 *
 * Locks every active-route card and every route-replacing loading/error
 * card to explicit Tier 1 / command (or state / state for degraded
 * branches) semantics, with provenance markers proving the values were
 * set explicitly rather than inferred from `hierarchy` or default
 * resolution.
 *
 * Ready-path cards are exercised through `<PccApp forceMode="desktop" />`
 * by clicking each tab — the same pattern used by
 * `PccSurfaceContextHeader.contract.test.tsx`. Loading and error branches
 * are exercised by rendering the affected surface directly inside
 * `<PccBentoGrid forceMode="desktop">` with a stubbed read-model client
 * whose methods never resolve (loading) or always reject (error).
 *
 * Stubs match the actual client contract (envelope-returning promises) —
 * not invented `{ status: 'loading' }` shapes.
 */

import { describe, it, expect } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  type PccMvpSurfaceId,
  type PccProjectId,
  type PccReadModelEnvelope,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';
import type { IPccLaunchPadReadModelClient } from '../surfaces/externalSystems/launchPadViewModel';
import { getSurfaceSelectionControl } from './shellSurfaceSelection';

const NEVER_RESOLVES = <T,>(): Promise<T> => new Promise<T>(() => {});
const ALWAYS_REJECTS = <T,>(): Promise<T> => Promise.reject(new Error('test: forced rejection'));

const STUB_PROJECT_ID = 'fixture-pcc-project-001' as PccProjectId;

// Wave 15A wave-b9 Prompt 04 + Prompts 4B-01 / 4B-05 / 4B-08 / 4B-09 —
// bifurcated surface sets after the runtime duplicate-header-card
// removal passes. Surfaces that retain an operational/header-hybrid
// card still emit the temporary card-level
// `[data-pcc-card][data-pcc-active-surface-panel]` compatibility marker;
// surfaces whose first card was removed are uniformly shell-only across
// all render branches (ready / loading / error / source-unavailable).
//
// Project Home moved to SURFACES_WITH_SHELL_ONLY_PANEL in Prompt 4B-01:
// `PccProjectIntelligenceCard` was removed and `PccPriorityActionsCard`
// is now the first bento card. The Project Home shell `<main>` continues
// to carry the active-panel marker on its own.
//
// Approvals moved to SURFACES_WITH_SHELL_ONLY_PANEL in Prompt 4B-05:
// `HomeCard` was removed (its metric pills were absorbed into
// `QueueCard`), and the loading/error state cards dropped their
// `dataActiveSurfacePanel="approvals"` markers for cross-branch
// shell-only consistency.
//
// Site Health moved to SURFACES_WITH_SHELL_ONLY_PANEL in Prompt 4B-08:
// `PccSiteHealthOverviewCard` was removed (its four metrics — Overall /
// Failing / Warnings / Last run — were absorbed into
// `PccSiteHealthChecksCard`). Site Health is fixture-only with no async
// loading/error state machine, so no loading-error branch test had to
// migrate from `getSoleActivePanel` → `getSoleStateCard`.
//
// Documents moved to SURFACES_WITH_SHELL_ONLY_PANEL in Prompt 4B-09 —
// the prior "Prompt 04 §3 BLOCKED gate" is now resolved.
// `PccDocumentsHeaderCard` was deleted and replaced by a state-aware
// seam (`PccDocumentControlStateCard`, tier=state / region=state, no
// active-panel marker) that carries the four preserved state copies
// (loading / temporarily-unavailable / sources-unavailable). The ready
// path begins with the first operational lane (project-record). After
// this commit `SURFACES_WITH_COMPATIBILITY_CARD` contains only
// `['project-readiness']`.
const SURFACES_WITH_COMPATIBILITY_CARD: readonly PccMvpSurfaceId[] = ['project-readiness'];

const SURFACES_WITH_SHELL_ONLY_PANEL: readonly PccMvpSurfaceId[] = [
  'project-home',
  'approvals',
  'site-health',
  'documents',
  'team-and-access',
  'external-systems',
  'control-center-settings',
];

interface CommandCardExpectations {
  readonly tier: 'tier1' | 'state';
  readonly region: 'command' | 'state';
}

function expectCommandCardPosture(
  card: Element,
  surfaceId: string,
  { tier, region }: CommandCardExpectations,
): void {
  expect(card.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
  expect(card.hasAttribute('data-pcc-card')).toBe(true);
  expect(card.getAttribute('data-pcc-card-tier')).toBe(tier);
  expect(card.getAttribute('data-pcc-card-region')).toBe(region);
  expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
  expect(card.getAttribute('data-pcc-card-region-source')).toBe('explicit');
  expect(card.getAttribute('data-pcc-heading-level')).toBe('2');
}

function getSoleActivePanel(container: HTMLElement, surfaceId: string): Element {
  // Wave 15A wave-b7 Prompt 01 — shell <main role="tabpanel"> owns the
  // active-surface marker semantically; for SURFACES_WITH_COMPATIBILITY_CARD
  // the surface still emits a `[data-pcc-card][data-pcc-active-surface-panel]`
  // compatibility marker on its operational/header-hybrid first card. The
  // card-level posture (tier, region, heading-level) lives on that card,
  // so this helper resolves to it. SURFACES_WITH_SHELL_ONLY_PANEL no longer
  // emit the marker on any branch — use `getSoleStateCard` for those.
  const cards = container.querySelectorAll(
    `[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`,
  );
  expect(
    cards,
    `surface '${surfaceId}' must render exactly one compatibility command card carrying the active-panel marker`,
  ).toHaveLength(1);
  const card = cards[0]!;
  expect(card.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
  return card;
}

// Wave 15A wave-b9 Prompt 04 — for SURFACES_WITH_SHELL_ONLY_PANEL in
// loading / error branches the surface renders exactly one direct-child
// `[data-pcc-card]` and no card-level active-panel marker. Locating the
// state card by direct-child + tier/region keeps tier/region/heading-level
// posture under test without re-introducing the removed marker.
function getSoleStateCard(container: HTMLElement): Element {
  const cards = container.querySelectorAll('[data-pcc-card]');
  expect(cards, 'shell-only state branch must render exactly one direct-child card').toHaveLength(
    1,
  );
  return cards[0]!;
}

function expectStateCardPosture(card: Element): void {
  expect(card.hasAttribute('data-pcc-card')).toBe(true);
  expect(card.getAttribute('data-pcc-card-tier')).toBe('state');
  expect(card.getAttribute('data-pcc-card-region')).toBe('state');
  expect(card.getAttribute('data-pcc-card-tier-source')).toBe('explicit');
  expect(card.getAttribute('data-pcc-card-region-source')).toBe('explicit');
  expect(card.getAttribute('data-pcc-heading-level')).toBe('2');
  expect(card.hasAttribute('data-pcc-active-surface-panel')).toBe(false);
}

// Wave 15A wave-b3 Prompt 05 — accessibility helpers. PccPreviewState
// already emits aria-busy="true" on loading and role="alert" on error;
// these helpers lock that contract for the compatibility command card.
function expectLoadingA11y(card: Element, surfaceId: string): void {
  const busy = card.querySelector('[aria-busy="true"]');
  expect(
    busy,
    `surface '${surfaceId}' loading branch must expose aria-busy="true" inside the compatibility command card`,
  ).not.toBeNull();
}

function expectErrorA11y(card: Element, surfaceId: string): void {
  const alert = card.querySelector('[role="alert"]');
  expect(
    alert,
    `surface '${surfaceId}' error branch must expose role="alert" inside the compatibility command card`,
  ).not.toBeNull();
}

describe('PCC route command card — ready (tier1 / command, explicit, h2) — surfaces with compatibility card', () => {
  for (const surfaceId of SURFACES_WITH_COMPATIBILITY_CARD) {
    it(`'${surfaceId}' route renders one tier1 / command compatibility command card`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const tab = getSurfaceSelectionControl(container, surfaceId);
      expect(tab, `tab for '${surfaceId}' must exist in shell`).not.toBeNull();
      fireEvent.click(tab!);

      const card = getSoleActivePanel(container, surfaceId);
      expectCommandCardPosture(card, surfaceId, { tier: 'tier1', region: 'command' });
    });
  }
});

describe('PCC route command card — ready (shell-only ownership) — surfaces with no compatibility card', () => {
  for (const surfaceId of SURFACES_WITH_SHELL_ONLY_PANEL) {
    it(`'${surfaceId}' route shell <main> owns the active panel and the bento contains no direct-child compatibility card`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const tab = getSurfaceSelectionControl(container, surfaceId);
      expect(tab, `tab for '${surfaceId}' must exist in shell`).not.toBeNull();
      fireEvent.click(tab!);

      const shellPanel = container.querySelector(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${surfaceId}"]`,
      );
      expect(shellPanel, `surface '${surfaceId}' shell active panel must mount`).not.toBeNull();

      const bento = shellPanel!.querySelector('[data-pcc-bento-grid]');
      expect(bento, `surface '${surfaceId}' bento grid must render`).not.toBeNull();

      const compatibilityCards = Array.from(bento!.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${surfaceId}"]`),
      );
      expect(
        compatibilityCards,
        `surface '${surfaceId}' must NOT render a direct bento-child compatibility card after Phase 04`,
      ).toHaveLength(0);

      const cards = bento!.querySelectorAll('[data-pcc-card]');
      expect(
        cards.length,
        `surface '${surfaceId}' must still render at least one direct-child card`,
      ).toBeGreaterThan(0);
    });
  }
});

describe('PCC route command card — loading branches (state / state, explicit, h2)', () => {
  it('approvals loading branch carries state / state with explicit sources (shell-only after Wave 15A wave-b9 Prompt 4B-05)', () => {
    const loadingClient: IPccApprovalsReadModelClient = {
      getApprovals: () => NEVER_RESOLVES(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface readModelClient={loadingClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    const card = getSoleStateCard(container);
    expectStateCardPosture(card);
    expectLoadingA11y(card, 'approvals');
  });

  it('external-systems loading branch carries state / state with explicit sources (shell-only)', () => {
    const loadingClient: IPccLaunchPadReadModelClient = {
      getExternalSystemsLaunchPad: () => NEVER_RESOLVES(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccExternalSystemsSurface readModelClient={loadingClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    const card = getSoleStateCard(container);
    expectStateCardPosture(card);
    expectLoadingA11y(card, 'external-systems');
  });

  it('project-readiness loading branch carries state / state with explicit sources', () => {
    // Inherit fixture defaults via prototype; override every readiness-client
    // method uniformly with a never-resolving promise so the readiness
    // hook stays in its loading envelope. Other intersection-client methods
    // (responsibility matrix, constraints log, buyout log, procore source)
    // continue to resolve via fixture so non-hero regions render normally
    // — they don't carry the active panel marker.
    const fixtureClient = createPccFixtureReadModelClient();
    const loadingClient = Object.create(fixtureClient) as typeof fixtureClient;
    const stubProjectReadiness = (): Promise<
      PccReadModelEnvelope<unknown> & Record<string, unknown>
    > => NEVER_RESOLVES();
    loadingClient.getProjectReadiness =
      stubProjectReadiness as typeof fixtureClient.getProjectReadiness;
    loadingClient.getLifecycleReadiness =
      stubProjectReadiness as typeof fixtureClient.getLifecycleReadiness;
    loadingClient.getApprovals = stubProjectReadiness as typeof fixtureClient.getApprovals;
    loadingClient.getUnifiedLifecycle =
      stubProjectReadiness as typeof fixtureClient.getUnifiedLifecycle;

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={loadingClient} />
      </PccBentoGrid>,
    );
    const card = getSoleActivePanel(container, 'project-readiness');
    expectCommandCardPosture(card, 'project-readiness', { tier: 'state', region: 'state' });
    expectLoadingA11y(card, 'project-readiness');
  });
});

describe('PCC route command card — error branches (state / state, explicit, h2)', () => {
  it('approvals error branch carries state / state with explicit sources (shell-only after Wave 15A wave-b9 Prompt 4B-05)', async () => {
    const errorClient: IPccApprovalsReadModelClient = {
      getApprovals: () => ALWAYS_REJECTS(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface readModelClient={errorClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const card = getSoleStateCard(container);
      expectStateCardPosture(card);
      expectErrorA11y(card, 'approvals');
    });
  });

  it('external-systems error branch carries state / state with explicit sources (shell-only)', async () => {
    const errorClient: IPccLaunchPadReadModelClient = {
      getExternalSystemsLaunchPad: () => ALWAYS_REJECTS(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccExternalSystemsSurface readModelClient={errorClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const card = getSoleStateCard(container);
      expectStateCardPosture(card);
      expectErrorA11y(card, 'external-systems');
    });
  });

  it('project-readiness error branch carries state / state with explicit sources', async () => {
    const fixtureClient = createPccFixtureReadModelClient();
    const errorClient = Object.create(fixtureClient) as typeof fixtureClient;
    const stubProjectReadiness = (): Promise<
      PccReadModelEnvelope<unknown> & Record<string, unknown>
    > => ALWAYS_REJECTS();
    errorClient.getProjectReadiness =
      stubProjectReadiness as typeof fixtureClient.getProjectReadiness;
    errorClient.getLifecycleReadiness =
      stubProjectReadiness as typeof fixtureClient.getLifecycleReadiness;
    errorClient.getApprovals = stubProjectReadiness as typeof fixtureClient.getApprovals;
    errorClient.getUnifiedLifecycle =
      stubProjectReadiness as typeof fixtureClient.getUnifiedLifecycle;

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={errorClient} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const card = getSoleActivePanel(container, 'project-readiness');
      expectCommandCardPosture(card, 'project-readiness', { tier: 'state', region: 'state' });
      expectErrorA11y(card, 'project-readiness');
    });
  });
});
