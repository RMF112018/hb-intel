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
import { PCC_MVP_SURFACE_IDS, type PccProjectId, type PccReadModelEnvelope } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { IPccApprovalsReadModelClient } from '../surfaces/approvals/approvalsViewModel';
import type { IPccLaunchPadReadModelClient } from '../surfaces/externalSystems/launchPadViewModel';

const NEVER_RESOLVES = <T,>(): Promise<T> => new Promise<T>(() => {});
const ALWAYS_REJECTS = <T,>(): Promise<T> => Promise.reject(new Error('test: forced rejection'));

const STUB_PROJECT_ID = 'fixture-pcc-project-001' as PccProjectId;

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
  const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
  expect(
    panels,
    `surface '${surfaceId}' must render exactly one active-panel carrier`,
  ).toHaveLength(1);
  const panel = panels[0]!;
  expect(panel.getAttribute('data-pcc-active-surface-panel')).toBe(surfaceId);
  return panel;
}

describe('PCC route command card — ready (tier1 / command, explicit, h2)', () => {
  for (const surfaceId of PCC_MVP_SURFACE_IDS) {
    it(`'${surfaceId}' route renders one tier1 / command active-panel card`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const tab = container.querySelector(`[data-pcc-tab-id="${surfaceId}"]`);
      expect(tab, `tab for '${surfaceId}' must exist in shell`).not.toBeNull();
      fireEvent.click(tab!);

      const card = getSoleActivePanel(container, surfaceId);
      expectCommandCardPosture(card, surfaceId, { tier: 'tier1', region: 'command' });
    });
  }
});

describe('PCC route command card — loading branches (state / state, explicit, h2)', () => {
  it('approvals loading branch carries state / state with explicit sources', () => {
    const loadingClient: IPccApprovalsReadModelClient = {
      getApprovals: () => NEVER_RESOLVES(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface readModelClient={loadingClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    const card = getSoleActivePanel(container, 'approvals');
    expectCommandCardPosture(card, 'approvals', { tier: 'state', region: 'state' });
  });

  it('external-systems loading branch carries state / state with explicit sources', () => {
    const loadingClient: IPccLaunchPadReadModelClient = {
      getExternalSystemsLaunchPad: () => NEVER_RESOLVES(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccExternalSystemsSurface readModelClient={loadingClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    const card = getSoleActivePanel(container, 'external-systems');
    expectCommandCardPosture(card, 'external-systems', { tier: 'state', region: 'state' });
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
  });
});

describe('PCC route command card — error branches (state / state, explicit, h2)', () => {
  it('approvals error branch carries state / state with explicit sources', async () => {
    const errorClient: IPccApprovalsReadModelClient = {
      getApprovals: () => ALWAYS_REJECTS(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccApprovalsSurface readModelClient={errorClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const card = getSoleActivePanel(container, 'approvals');
      expectCommandCardPosture(card, 'approvals', { tier: 'state', region: 'state' });
    });
  });

  it('external-systems error branch carries state / state with explicit sources', async () => {
    const errorClient: IPccLaunchPadReadModelClient = {
      getExternalSystemsLaunchPad: () => ALWAYS_REJECTS(),
    };
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccExternalSystemsSurface readModelClient={errorClient} projectId={STUB_PROJECT_ID} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      const card = getSoleActivePanel(container, 'external-systems');
      expectCommandCardPosture(card, 'external-systems', { tier: 'state', region: 'state' });
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
    });
  });
});
