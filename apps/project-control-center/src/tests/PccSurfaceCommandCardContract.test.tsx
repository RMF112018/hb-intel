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
import { PCC_PRIMARY_TAB_IDS, type PccProjectId, type PccReadModelEnvelope } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';
import type { IPccLaunchPadReadModelClient } from '../surfaces/externalSystems/launchPadViewModel';
import { getPrimaryTabSelectionControl } from './shellSurfaceSelection';

const NEVER_RESOLVES = <T,>(): Promise<T> => new Promise<T>(() => {});
const ALWAYS_REJECTS = <T,>(): Promise<T> => Promise.reject(new Error('test: forced rejection'));

const STUB_PROJECT_ID = 'fixture-pcc-project-001' as PccProjectId;

// Wave 15A wave-b8 Prompt 05 — every PCC MVP surface is shell-only.
// The shell `<main role="tabpanel">` is the sole carrier of
// `data-pcc-active-surface-panel`; no bento-child card emits the marker
// on any branch (ready / loading / error / source-unavailable). The
// previous bifurcation between `SURFACES_WITH_COMPATIBILITY_CARD` and
// `SURFACES_WITH_SHELL_ONLY_PANEL` was retired here; the canonical loop
// iterates `PCC_MVP_SURFACE_IDS` directly.

// Loading / error state branches render exactly one direct-child
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

// PccPreviewState emits aria-busy="true" on loading and role="alert" on
// error; these helpers lock that contract for the shell-only state card.
function expectLoadingA11y(card: Element, surfaceId: string): void {
  const busy = card.querySelector('[aria-busy="true"]');
  expect(
    busy,
    `surface '${surfaceId}' loading branch must expose aria-busy="true" inside the state card`,
  ).not.toBeNull();
}

function expectErrorA11y(card: Element, surfaceId: string): void {
  const alert = card.querySelector('[role="alert"]');
  expect(
    alert,
    `surface '${surfaceId}' error branch must expose role="alert" inside the state card`,
  ).not.toBeNull();
}

describe('PCC route command card — ready (shell-owned active-panel ownership) — every Phase 05 primary tab', () => {
  for (const tabId of PCC_PRIMARY_TAB_IDS) {
    it(`'${tabId}' route shell <main> owns the active panel and the bento contains zero direct-child cards carrying [data-pcc-active-surface-panel]`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const tab = getPrimaryTabSelectionControl(container, tabId);
      expect(tab, `primary tab for '${tabId}' must exist in shell`).not.toBeNull();
      fireEvent.click(tab!);

      const shellPanel = container.querySelector(
        `main[role="tabpanel"][data-pcc-active-surface-panel="${tabId}"]`,
      );
      expect(shellPanel, `primary tab '${tabId}' shell active panel must mount`).not.toBeNull();

      const bento = shellPanel!.querySelector('[data-pcc-bento-grid]');
      expect(bento, `primary tab '${tabId}' bento grid must render`).not.toBeNull();

      const compatibilityCards = Array.from(bento!.children).filter((child) =>
        child.matches(`[data-pcc-card][data-pcc-active-surface-panel="${tabId}"]`),
      );
      expect(
        compatibilityCards,
        `primary tab '${tabId}' must NOT render a direct bento-child compatibility card after Phase 05`,
      ).toHaveLength(0);

      const cards = bento!.querySelectorAll('[data-pcc-card]');
      expect(
        cards.length,
        `primary tab '${tabId}' must still render at least one direct-child card`,
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

  it('project-readiness loading branch carries state / state with explicit sources (shell-only after Wave 15A wave-b9 Prompt 4B-10)', () => {
    // Inherit fixture defaults via prototype; override every readiness-client
    // method uniformly with a never-resolving promise so the readiness
    // hook stays in its loading envelope. Other intersection-client methods
    // (responsibility matrix, constraints log, buyout log, procore source)
    // continue to resolve via fixture so non-hero regions render normally
    // — they don't carry the active panel marker.
    //
    // The shell `<main>` is the sole semantic active-panel owner. Locate
    // the state card via its `[data-pcc-readiness-region="hero"]` body
    // marker (still emitted on the loading state card) instead of via
    // `getSoleStateCard`, since other surface-wide regions also render
    // direct bento cards in the loading branch (so the bento has more
    // than one direct-child card).
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
    const heroBody = container.querySelector('[data-pcc-readiness-region="hero"]');
    expect(heroBody, 'project-readiness loading state card body must render').not.toBeNull();
    const card = heroBody!.closest('[data-pcc-card]');
    expect(card, 'hero body must live inside a [data-pcc-card]').not.toBeNull();
    expectStateCardPosture(card!);
    expectLoadingA11y(card!, 'project-readiness');
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

  it('project-readiness error branch carries state / state with explicit sources (shell-only after Wave 15A wave-b9 Prompt 4B-10)', async () => {
    // Wave 15A wave-b9 Prompt 4B-10 — same pattern as the loading branch
    // above: locate the error state card via its
    // `[data-pcc-readiness-region="hero"]` body marker (still emitted)
    // since other surface-wide regions also render in the error branch.
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
      const heroBody = container.querySelector('[data-pcc-readiness-region="hero"]');
      expect(heroBody, 'project-readiness error state card body must render').not.toBeNull();
      const card = heroBody!.closest('[data-pcc-card]');
      expect(card, 'hero body must live inside a [data-pcc-card]').not.toBeNull();
      expectStateCardPosture(card!);
      expectErrorA11y(card!, 'project-readiness');
    });
  });
});
