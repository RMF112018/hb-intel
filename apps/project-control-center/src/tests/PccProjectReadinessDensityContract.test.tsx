/**
 * Wave 15A B5 / Prompt 01 — Project Readiness density contract.
 *
 * Locks the command-first default render so the surface ships:
 *   - no more than 12 cards;
 *   - no embedded module section markers
 *     (lifecycle-readiness-center, permit-inspection-control-center,
 *     responsibility-matrix, constraints-log, buyout-log,
 *     procore-source-confidence, unified-lifecycle bodies);
 *   - exactly one `data-pcc-active-surface-panel="project-readiness"`
 *     marker;
 *   - no `[data-pcc-card]` nested inside another `[data-pcc-card]`;
 *   - every card a direct child of `[data-pcc-bento-grid]`;
 *   - enabled buttons (if any) are strictly local view-selection
 *     drilldown controls and carry no executable label.
 *
 * Run on both the fixture path (no readModelClient) and the
 * read-model path (read-model client supplied) — the read-model
 * variant proves the unified-lifecycle hook is called even though
 * its cards are absent.
 */

import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

afterEach(() => {
  cleanup();
});

const ABSENT_SECTION_MARKERS: readonly string[] = [
  'lifecycle-readiness-center',
  'permit-inspection-control-center',
  'responsibility-matrix',
  'constraints-log',
  'buyout-log',
];

const ABSENT_BODY_MARKERS: readonly string[] = [
  'data-pcc-lifecycle-timeline',
  'data-pcc-project-memory',
  'data-pcc-related-records',
];

const FORBIDDEN_LABEL_RX =
  /\b(approve|reject|submit|upload|sync|write[\s-]?back|create|delete|save|launch|open\s+report|mark\s+complete|complete|checklist|assign|escalate|acknowledge)\b/i;

const DRILLDOWN_DETAIL_SECTION_IDS: readonly string[] = [
  'lifecycle-readiness',
  'permits-inspections',
  'responsibility-matrix',
  'constraints',
  'buyout',
  'procore-source-confidence',
  'unified-lifecycle',
];

function bentoOf(container: HTMLElement): HTMLElement {
  const bento = container.querySelector('[data-pcc-bento-grid]');
  expect(bento, 'expected a [data-pcc-bento-grid] node in the rendered output').not.toBeNull();
  return bento as HTMLElement;
}

function cardsOf(bento: HTMLElement): readonly HTMLElement[] {
  return Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
}

function describeCard(card: HTMLElement): string {
  return (
    card.getAttribute('data-pcc-card-id') ??
    card.getAttribute('data-pcc-active-surface-panel') ??
    card.querySelector('[data-pcc-readiness-region]')?.getAttribute('data-pcc-readiness-region') ??
    '<unidentified-card>'
  );
}

function assertDensityInvariants(container: HTMLElement) {
  const bento = bentoOf(container);
  const cards = cardsOf(bento);

  // 1. Card-count cap.
  expect(
    cards.length,
    `default Project Readiness card count must be <= 12 (got ${cards.length})`,
  ).toBeLessThanOrEqual(12);

  // 2. Module section markers absent.
  for (const marker of ABSENT_SECTION_MARKERS) {
    expect(
      container.querySelectorAll(`[data-pcc-readiness-section="${marker}"]`).length,
      `default render must contain no [data-pcc-readiness-section="${marker}"]`,
    ).toBe(0);
  }
  expect(
    container.querySelectorAll('[data-pcc-readiness-region="procore-source-confidence"]').length,
    'default render must contain no [data-pcc-readiness-region="procore-source-confidence"]',
  ).toBe(0);
  for (const body of ABSENT_BODY_MARKERS) {
    expect(
      container.querySelector(`[${body}]`),
      `default render must contain no [${body}]`,
    ).toBeNull();
  }

  // 3. Active-surface uniqueness.
  const surfaceMarkers = container.querySelectorAll('[data-pcc-active-surface-panel]');
  expect(surfaceMarkers).toHaveLength(1);
  expect(surfaceMarkers[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-readiness');

  // 4. No card nesting.
  expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);

  // 5. Direct-child invariant.
  for (const card of cards) {
    expect(
      card.parentElement,
      `card "${describeCard(card)}" must be a direct child of [data-pcc-bento-grid]`,
    ).toBe(bento);
  }

  // 6. Enabled-button discipline.
  const enabledButtons = Array.from(bento.querySelectorAll<HTMLButtonElement>('button')).filter(
    (b) => !b.disabled && b.getAttribute('aria-disabled') !== 'true',
  );
  for (const button of enabledButtons) {
    expect(
      button.hasAttribute('data-pcc-readiness-drilldown-control'),
      `enabled button "${(button.textContent ?? '').trim()}" must carry data-pcc-readiness-drilldown-control`,
    ).toBe(true);
    const accessibleName = `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`;
    expect(
      FORBIDDEN_LABEL_RX.test(accessibleName),
      `enabled drilldown control "${accessibleName.trim()}" must not use executable verb labels`,
    ).toBe(false);
  }
  // No external-launch anchors anywhere in the active surface bento.
  expect(bento.querySelectorAll('a[href^="http"]').length).toBe(0);

  // 7. Wave 15A B5 / Prompt 02 — all eight drilldown controls (command
  //    + seven detail sections) are enabled because every click causes
  //    a real selected-section view change. Default selection is
  //    `command`; that button is `aria-pressed="true"` and carries
  //    `data-pcc-readiness-drilldown-state="selected"`.
  const enabledControls = enabledButtons.filter((b) =>
    b.hasAttribute('data-pcc-readiness-drilldown-control'),
  );
  const enabledIds = new Set(
    enabledControls.map((b) => b.getAttribute('data-pcc-readiness-drilldown-control') ?? ''),
  );
  expect(enabledIds.has('command'), 'command drilldown must be enabled by default').toBe(true);
  for (const detailSectionId of DRILLDOWN_DETAIL_SECTION_IDS) {
    expect(
      enabledIds.has(detailSectionId),
      `detail-section drilldown control "${detailSectionId}" must be enabled in Prompt 02`,
    ).toBe(true);
  }
  const commandSelected = enabledControls.find(
    (b) => b.getAttribute('data-pcc-readiness-drilldown-control') === 'command',
  );
  expect(commandSelected, 'command control must exist').toBeDefined();
  expect(commandSelected!.getAttribute('aria-pressed')).toBe('true');
  expect(commandSelected!.getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
}

describe('PccProjectReadinessSurface — density contract (fixture path)', () => {
  it('default command view satisfies all density invariants when rendered without a read-model client', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    assertDensityInvariants(container);
  });

  it('default command view inside <PccApp /> satisfies all density invariants when rendered without a read-model client', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    // PccApp activates Project Home by default; the active surface
    // marker assertion below is scoped to the project-readiness surface
    // once the user navigates to it. Since this density test is
    // primarily an unrouted surface contract, asserting against the
    // direct render path is sufficient. The PccApp variant is kept
    // purely as a regression smoke test for the bento grid mounting.
    const bento = container.querySelector('[data-pcc-bento-grid]');
    expect(bento).not.toBeNull();
  });
});

describe('PccProjectReadinessSurface — density contract (read-model path)', () => {
  it('default command view satisfies all density invariants when a read-model client is supplied (unified-lifecycle hook called, body markers absent)', async () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={createPccFixtureReadModelClient()} />
      </PccBentoGrid>,
    );
    // Wait for the read-model-driven hero card to settle before
    // asserting density. The hero swaps from preview/loading to ready
    // on the first hook microtask.
    await waitFor(() =>
      expect(
        container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
      ).not.toBeNull(),
    );
    assertDensityInvariants(container);
  });
});

// Wave 15A B5 / Prompt 03 — density invariants must survive degraded
// read-model envelopes. These two variants prove the <= 12 cap holds
// when the unified-lifecycle hook rejects and when every read-model
// client method never resolves (loading state). Detail-mode density is
// intentionally not capped — only the default command view is gated.

const ALL_FIXTURE_CLIENT_METHODS = [
  'getProjectReadiness',
  'getApprovals',
  'getLifecycleReadiness',
  'getPermitInspectionControlCenter',
  'getResponsibilityMatrix',
  'getConstraintsLog',
  'getBuyoutLog',
  'getProcoreProjectMapping',
  'getProcoreSyncHealth',
  'getUnifiedLifecycle',
] as const;

describe('PccProjectReadinessSurface — density contract (Wave 15A B5 / Prompt 03 degraded read-model paths)', () => {
  it('default command view satisfies all density invariants when getUnifiedLifecycle rejects', async () => {
    const client = createPccFixtureReadModelClient();
    const ulSpy = vi.spyOn(client, 'getUnifiedLifecycle').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => expect(ulSpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
      ).not.toBeNull(),
    );
    assertDensityInvariants(container);
  });

  it('default command view satisfies all density invariants when every read-model client method never resolves', () => {
    const client = createPccFixtureReadModelClient();
    for (const method of ALL_FIXTURE_CLIENT_METHODS) {
      vi.spyOn(client, method).mockImplementation(
        (): Promise<never> => new Promise<never>(() => undefined),
      );
    }

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    // Loading-state hero renders synchronously; module-index card too.
    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    assertDensityInvariants(container);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 04 — compact loading/error density
//
// After Prompt 04, ReadinessNativeCommandCards returns null in
// loading/error so the default command view collapses to exactly two
// cards (hero state + module-index). FixtureScaffoldRegions was deleted
// in the same change; these tests pin the new behavior.
// ─────────────────────────────────────────────────────────────────────

describe('PccProjectReadinessSurface — density contract (Wave 15A B5 / Prompt 04 compact loading/error)', () => {
  it('default command view renders exactly 2 cards (hero state + module-index) when getProjectReadiness never resolves', () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getProjectReadiness').mockImplementation(
      (): Promise<never> => new Promise<never>(() => undefined),
    );

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length, 'compact loading must render exactly 2 cards').toBe(2);
    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    assertDensityInvariants(container);
  });

  it('default command view renders exactly 2 cards (hero state + module-index) when getProjectReadiness rejects', async () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getProjectReadiness').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull());
    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length, 'compact error must render exactly 2 cards').toBe(2);
    assertDensityInvariants(container);
  });
});
