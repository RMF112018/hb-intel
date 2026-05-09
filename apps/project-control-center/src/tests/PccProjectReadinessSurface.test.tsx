import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
  type PccReadModelEnvelope,
  type PccUnifiedLifecycleReadModel,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-tab-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function readinessRegion(container: HTMLElement, region: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-readiness-region="${region}"]`);
}

describe('Project Readiness Center surface', () => {
  it('renders exactly one shell-owned active-surface panel for project-readiness (Wave 15A wave-b7 Prompt 01 — shell <main> owns the semantic marker)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const shellPanels = container.querySelectorAll(
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-readiness"]',
    );
    expect(shellPanels).toHaveLength(1);
    expect(shellPanels[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-readiness');
  });

  it('renders all six framework regions', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(readinessRegion(container, 'hero')).not.toBeNull();
    expect(readinessRegion(container, 'lifecycle-gates')).not.toBeNull();
    expect(readinessRegion(container, 'domains')).not.toBeNull();
    expect(readinessRegion(container, 'blockers')).not.toBeNull();
    expect(readinessRegion(container, 'evidence-source-health')).not.toBeNull();
    expect(readinessRegion(container, 'downstream-modules')).not.toBeNull();
  });

  it('first bento card uses the operational "Readiness Gate & Blockers" title and "Readiness Signals" eyebrow, drops the duplicate page-title framing, and preserves the MVP stat grid + source-health badges (Wave 15A wave-b9 Prompt 4B-04)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const hero = readinessRegion(container, 'hero');
    expect(hero, 'data-pcc-readiness-region="hero" must render').not.toBeNull();

    // The hero region is the body of the first bento card. The card header
    // (eyebrow + title) is rendered by PccDashboardCard as a sibling of
    // the hero region; resolve via .closest('[data-pcc-card]') so the
    // eyebrow / title assertions stay scoped to the FIRST card and do not
    // false-positive on the shell hero (which legitimately renders
    // 'Project Readiness' as the secondary title).
    const card = hero!.closest('[data-pcc-card]');
    expect(card, 'hero region must live inside a [data-pcc-card]').not.toBeNull();
    const cardHeading = card!.querySelector('h2,h3,h4');
    expect(cardHeading?.textContent).toBe('Readiness Gate & Blockers');
    // Eyebrow text is rendered upper-case by CSS but stored mixed-case in
    // the DOM; match the source-of-truth string passed to PccDashboardCard.
    expect(card!.textContent).toContain('Readiness Signals');

    // Negative assertions scoped to the first card body only — the shell
    // hero outside this region legitimately carries 'Project Readiness' as
    // the secondary title, so a surface-wide negative scan would
    // false-positive (per `feedback_word_blocklists_break_on_corrected_copy`).
    expect(
      hero!.textContent,
      'first card body must not render the dropped "Project readiness" badge',
    ).not.toContain('Project readiness');
    expect(
      hero!.textContent,
      'first card body must not render the dropped "Workflow execution and approvals…" caption',
    ).not.toContain('Workflow execution and approvals are managed by your PCC administrator.');
    expect(
      hero!.textContent,
      'first card body must not render the dropped Module Framework description',
    ).not.toContain('Module Framework shell aggregating readiness posture');

    // MVP stat grid is preserved.
    expect(hero!.querySelector('[data-pcc-readiness-stat="active-gate"]')).not.toBeNull();
    expect(hero!.querySelector('[data-pcc-readiness-stat="overall-posture"]')).not.toBeNull();
    expect(hero!.querySelector('[data-pcc-readiness-stat="blocker-count"]')).not.toBeNull();
    expect(hero!.querySelector('[data-pcc-readiness-stat="evidence-confidence"]')).not.toBeNull();

    // Source-health badge row is preserved (count > 0; exact ids vary
    // with fixture content and are covered by the adapter test).
    const sourceHealthBadges = hero!.querySelectorAll('[data-pcc-readiness-source-health-badge]');
    expect(sourceHealthBadges.length).toBeGreaterThan(0);

    // Card-level compatibility marker preserved (project-readiness stays
    // in SURFACES_WITH_COMPATIBILITY_CARD per the Wave 15A wave-b9 split).
    expect(card!.getAttribute('data-pcc-active-surface-panel')).toBe('project-readiness');
  });

  it('lifecycle gates region renders gate items from structural markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const gates = container.querySelectorAll('[data-pcc-readiness-gate-id]');
    expect(gates.length).toBeGreaterThanOrEqual(1);
  });

  it('domain grid region renders multiple domains from structural markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const domains = container.querySelectorAll('[data-pcc-readiness-domain-id]');
    expect(domains.length).toBeGreaterThanOrEqual(2);
  });

  it('blockers region renders the escalated fixture blocker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const blocker = container.querySelector(
      '[data-pcc-readiness-blocker-id="fixture-pcc-readiness-003"]',
    );
    expect(blocker).not.toBeNull();
  });

  it('evidence and source-health region renders evidence and source-health entries', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = readinessRegion(container, 'evidence-source-health');
    expect(region).not.toBeNull();
    const evidenceBuckets = region!.querySelectorAll('[data-pcc-readiness-evidence-state]');
    const sourceHealthEntries = region!.querySelectorAll('[data-pcc-readiness-source-health]');
    expect(evidenceBuckets.length).toBeGreaterThanOrEqual(1);
    expect(sourceHealthEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('downstream modules region marks Wave 9 as preview-deferred and Wave 11 RACI as implemented', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const wave9 = container.querySelector(
      '[data-pcc-readiness-downstream-source="project-lifecycle-readiness"]',
    );
    const wave11 = container.querySelector(
      '[data-pcc-readiness-downstream-source="responsibility-matrix"]',
    );
    expect(wave9).not.toBeNull();
    expect(wave11).not.toBeNull();
    expect(wave9!.getAttribute('data-pcc-readiness-downstream-status')).toBe('preview-deferred');
    expect(wave9!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 9');
    expect(wave11!.getAttribute('data-pcc-readiness-downstream-status')).toBe('implemented');
    expect(wave11!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 11');
    expect(wave11!.textContent).toContain('RACI');
  });

  it('downstream modules region marks Wave 12 / Wave 14 as preview-deferred', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const downstreamModuleIds = ['constraints-log', 'approvals-checkpoints'] as const;
    for (const id of downstreamModuleIds) {
      const node = container.querySelector(`[data-pcc-readiness-downstream-source="${id}"]`);
      expect(node, `expected downstream module ${id}`).not.toBeNull();
      expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe('preview-deferred');
    }
  });

  it('downstream modules region marks Wave 10 (permit-log) as implemented', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const node = container.querySelector('[data-pcc-readiness-downstream-source="permit-log"]');
    expect(node).not.toBeNull();
    expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe('implemented');
    expect(node!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 10');
    expect(node!.textContent).toContain('Permit & Inspection Control Center');
  });

  it('downstream modules region marks Wave 13 (buyout-log) as implemented', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const node = container.querySelector('[data-pcc-readiness-downstream-source="buyout-log"]');
    expect(node).not.toBeNull();
    expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe('implemented');
    expect(node!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 13');
    expect(node!.textContent).toContain('Buyout Log');
  });

  it('readiness surface tree exposes only local view-selection drilldown controls as enabled buttons (Wave 15A B5 / Prompt 03 — replaces the legacy "all buttons disabled" assertion now that the module-index card intentionally enables drilldown controls)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(bento, '[data-pcc-bento-grid] must mount').not.toBeNull();
    const enabledButtons = Array.from(bento.querySelectorAll<HTMLButtonElement>('button')).filter(
      (b) => !b.disabled && b.getAttribute('aria-disabled') !== 'true',
    );
    const forbiddenVerb =
      /\b(approve|reject|submit|upload|sync|write[\s-]?back|create|delete|save|launch|open\s+report|mark\s+complete|complete|checklist|assign|escalate|acknowledge)\b/i;
    for (const button of enabledButtons) {
      expect(
        button.hasAttribute('data-pcc-readiness-drilldown-control'),
        `enabled button "${(button.textContent ?? '').trim()}" must be a local drilldown control`,
      ).toBe(true);
      const accessibleName = `${button.textContent ?? ''} ${button.getAttribute('aria-label') ?? ''}`;
      expect(
        forbiddenVerb.test(accessibleName),
        `enabled drilldown control "${accessibleName.trim()}" must not use executable-verb labels`,
      ).toBe(false);
    }
    expect(bento.querySelectorAll('a[href^="http"]').length).toBe(0);
  });
});

function readinessRegionsAll(container: HTMLElement): readonly HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-pcc-readiness-region]'));
}

describe('Project Readiness Center surface — Wave 8 Prompt 06 hardening', () => {
  it('renders the ownership-accountability region with per-persona entries', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const ownership = readinessRegion(container, 'ownership-accountability');
    expect(ownership).not.toBeNull();
    const entries = ownership!.querySelectorAll('[data-pcc-readiness-ownership-persona]');
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('flags unassigned-gap items in the ownership region', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const unassignedEntries = container.querySelectorAll(
      '[data-pcc-readiness-ownership-unassigned="true"]',
    );
    expect(unassignedEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('flags safety-qaqc as having an unassigned-gap signal (item 004)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const safety = container.querySelector('[data-pcc-readiness-ownership-persona="safety-qaqc"]');
    expect(safety).not.toBeNull();
    expect(safety!.getAttribute('data-pcc-readiness-ownership-unassigned')).toBe('true');
  });

  it('renders escalation chips that include project-executive and manager-of-operational-excellence', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const escalations = Array.from(
      container.querySelectorAll('[data-pcc-readiness-ownership-escalation]'),
    ).map((el) => el.getAttribute('data-pcc-readiness-ownership-escalation'));
    expect(escalations).toContain('project-executive');
    expect(escalations).toContain('manager-of-operational-excellence');
  });

  it('renders the priority-actions-preview region with the eligible item', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const preview = readinessRegion(container, 'priority-actions-preview');
    expect(preview).not.toBeNull();
    const entry = preview!.querySelector(
      '[data-pcc-readiness-priority-action-id="priority-action-permit-001"]',
    );
    expect(entry).not.toBeNull();
  });

  it('priority-actions-preview region exposes no enabled actions', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const preview = readinessRegion(container, 'priority-actions-preview');
    expect(preview).not.toBeNull();
    const buttons = preview!.querySelectorAll('button');
    for (const button of Array.from(buttons)) {
      expect(button.hasAttribute('disabled')).toBe(true);
    }
    const externalLinks = preview!.querySelectorAll('a[href^="http"]');
    expect(externalLinks.length).toBe(0);
  });

  it('renders a risk-tag chip on blocker item 003 as open-blocker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const blocker = container.querySelector(
      '[data-pcc-readiness-blocker-id="fixture-pcc-readiness-003"]',
    );
    expect(blocker).not.toBeNull();
    const tag = blocker!.querySelector('[data-pcc-readiness-risk-tag]');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('data-pcc-readiness-risk-tag')).toBe('open-blocker');
  });

  it('evidence-source-health region has no upload controls', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = readinessRegion(container, 'evidence-source-health');
    expect(region).not.toBeNull();
    const fileInputs = region!.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBe(0);
    const uploadLabeled = Array.from(region!.querySelectorAll('button')).filter((btn) =>
      /^upload$/i.test((btn.textContent ?? '').trim()),
    );
    expect(uploadLabeled.length).toBe(0);
  });

  it('readiness panel has no enabled Upload button', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panel = activateProjectReadiness(container);
    const enabledUpload = Array.from(panel.querySelectorAll('button')).filter(
      (btn) => /^upload$/i.test((btn.textContent ?? '').trim()) && !btn.hasAttribute('disabled'),
    );
    expect(enabledUpload.length).toBe(0);
  });

  it('renders degraded source-health entries for permit-log (stale), buyout-log and external-systems (source-unavailable)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const permit = container.querySelector('[data-pcc-readiness-source-health="permit-log"]');
    const buyout = container.querySelector('[data-pcc-readiness-source-health="buyout-log"]');
    const external = container.querySelector(
      '[data-pcc-readiness-source-health="external-systems"]',
    );
    expect(permit).not.toBeNull();
    expect(buyout).not.toBeNull();
    expect(external).not.toBeNull();
  });

  it('readiness regions expose no executable-label buttons', () => {
    const forbiddenLabel =
      /^(submit|approve|upload|run|execute|sync|write\s*back|writeback|complete\s*checklist|run\s*workflow)$/i;
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const regions = readinessRegionsAll(container);
    expect(regions.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const region of regions) {
      for (const button of Array.from(region.querySelectorAll('button'))) {
        const label = (button.textContent ?? '').trim();
        if (forbiddenLabel.test(label)) {
          offenders.push(label);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — command-first inversion
//
// The default Project Readiness view is now command-first: only the
// hero/native command-critical readiness cards plus a single
// module-index card render. The seven embedded module sections
// (lifecycle-readiness-center, permit-inspection-control-center,
// responsibility-matrix, constraints-log, buyout-log, procore-source-
// confidence, unified-lifecycle) are absent from the default DOM.
// Wiring the detail-section renderer that brings them back is
// Prompt 02's deliverable; presence-based assertions move there.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — Wave 15A B5 default command-first absence', () => {
  it('default render contains no lifecycle-readiness-center section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="lifecycle-readiness-center"]')
        .length,
    ).toBe(0);
  });

  it('default render contains no permit-inspection-control-center section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="permit-inspection-control-center"]')
        .length,
    ).toBe(0);
  });

  it('default render contains no responsibility-matrix section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="responsibility-matrix"]').length,
    ).toBe(0);
  });

  it('default render contains no constraints-log section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="constraints-log"]').length,
    ).toBe(0);
  });

  it('default render contains no buyout-log section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(container.querySelectorAll('[data-pcc-readiness-section="buyout-log"]').length).toBe(0);
  });

  it('default render contains no procore-source-confidence region marker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-region="procore-source-confidence"]').length,
    ).toBe(0);
  });

  it('default render contains no unified-lifecycle body markers (timeline / project-memory / related-records)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
  });

  it('default render exposes a module-index region with strictly local view-selection controls', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const moduleIndex = container.querySelector('[data-pcc-readiness-region="module-index"]');
    expect(moduleIndex).not.toBeNull();
    const controls = moduleIndex!.querySelectorAll('[data-pcc-readiness-drilldown-control]');
    // 1 command overview + 7 detail sections
    expect(controls).toHaveLength(8);
    const enabled = Array.from(controls).filter(
      (c) =>
        !(c as HTMLButtonElement).disabled &&
        (c as HTMLButtonElement).getAttribute('aria-disabled') !== 'true',
    );
    // Wave 15A B5 / Prompt 02 — all 8 drilldown controls are enabled
    // because every click causes a real selected-section view change.
    expect(enabled).toHaveLength(8);
    const commandControl = Array.from(controls).find(
      (c) => c.getAttribute('data-pcc-readiness-drilldown-control') === 'command',
    );
    expect(commandControl).toBeDefined();
    expect(commandControl!.getAttribute('aria-pressed')).toBe('true');
    expect(commandControl!.getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 02 — selected-section click-and-assert coverage
//
// Clicking a detail-section drilldown control swaps the surface from
// the default command view (hero + 7 native command-critical cards +
// module-index) to the focused detail view (hero + module-index +
// selected detail group). Non-selected detail-section markers remain
// absent. Hero stays unique. Bento direct-child invariant holds.
// ─────────────────────────────────────────────────────────────────────

interface ISectionCase {
  readonly drilldownId: string;
  readonly markerSelector: string;
  readonly additionalPresentMarkers: readonly string[];
  readonly otherMarkerSelectors: readonly string[];
}

const ALL_SECTION_DOM_MARKERS: readonly { readonly id: string; readonly selector: string }[] = [
  {
    id: 'lifecycle-readiness',
    selector: '[data-pcc-readiness-section="lifecycle-readiness-center"]',
  },
  {
    id: 'permits-inspections',
    selector: '[data-pcc-readiness-section="permit-inspection-control-center"]',
  },
  { id: 'responsibility-matrix', selector: '[data-pcc-readiness-section="responsibility-matrix"]' },
  { id: 'constraints', selector: '[data-pcc-readiness-section="constraints-log"]' },
  { id: 'buyout', selector: '[data-pcc-readiness-section="buyout-log"]' },
  { id: 'procore-source-confidence', selector: '[data-pcc-card-id="procore-source-confidence"]' },
  { id: 'unified-lifecycle', selector: '[data-pcc-lifecycle-timeline]' },
];

const ADDITIONAL_PRESENT_MARKERS_BY_ID: Readonly<Record<string, readonly string[]>> = {
  // Wave 15A B5 / Prompt 02 — unified-lifecycle renders three direct
  // bento children whose body markers must all be present after
  // selection: timeline, project memory, related records.
  'unified-lifecycle': ['[data-pcc-project-memory]', '[data-pcc-related-records]'],
};

const SECTION_CASES: readonly ISectionCase[] = ALL_SECTION_DOM_MARKERS.map((selected) => ({
  drilldownId: selected.id,
  markerSelector: selected.selector,
  additionalPresentMarkers: ADDITIONAL_PRESENT_MARKERS_BY_ID[selected.id] ?? [],
  otherMarkerSelectors: ALL_SECTION_DOM_MARKERS.filter((s) => s.id !== selected.id).map(
    (s) => s.selector,
  ),
}));

function selectProjectReadinessSection(container: HTMLElement, sectionId: string): HTMLElement {
  const control = container.querySelector(
    `[data-pcc-readiness-drilldown-control="${sectionId}"]`,
  ) as HTMLButtonElement | null;
  expect(control, `expected drilldown control for "${sectionId}"`).not.toBeNull();
  expect(control!.disabled).toBe(false);
  fireEvent.click(control!);
  expect(control!.getAttribute('aria-pressed')).toBe('true');
  expect(control!.getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
  return control!;
}

describe('Project Readiness Center surface — Wave 15A B5 selected-section view selection', () => {
  afterEach(() => {
    cleanup();
  });

  for (const testCase of SECTION_CASES) {
    it(`click drilldown "${testCase.drilldownId}" renders only the selected detail group; non-selected section markers absent`, async () => {
      const { container } = render(
        <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
      );
      activateProjectReadiness(container);
      selectProjectReadinessSection(container, testCase.drilldownId);

      // Wait for the selected detail group to render. For sections with
      // a synchronous fixture path the marker appears immediately; for
      // unified-lifecycle (read-model-driven) waitFor lets the hook
      // microtask resolve.
      await waitFor(() =>
        expect(
          container.querySelector(testCase.markerSelector),
          `selected section "${testCase.drilldownId}" must render its marker`,
        ).not.toBeNull(),
      );

      // Section-specific additional markers (e.g. unified-lifecycle's
      // three body markers — timeline / project-memory / related-records).
      for (const additional of testCase.additionalPresentMarkers) {
        expect(
          container.querySelector(additional),
          `selected section "${testCase.drilldownId}" must render additional marker ${additional}`,
        ).not.toBeNull();
      }

      // Non-selected detail-section markers are absent.
      for (const otherSelector of testCase.otherMarkerSelectors) {
        expect(
          container.querySelectorAll(otherSelector).length,
          `non-selected section marker "${otherSelector}" must be absent when "${testCase.drilldownId}" is selected`,
        ).toBe(0);
      }

      // Hero/active-surface marker remains unique on the shell semantic
      // owner. Wave 15A wave-b7 Prompt 01 — shell <main> owns the
      // semantic marker; the HeroCard still emits a card-level
      // compatibility marker, so the broad count would be > 1.
      const shellPanels = container.querySelectorAll(
        'main[role="tabpanel"][data-pcc-active-surface-panel="project-readiness"]',
      );
      expect(shellPanels).toHaveLength(1);
      expect(shellPanels[0].getAttribute('data-pcc-active-surface-panel')).toBe(
        'project-readiness',
      );

      // No card-in-card nesting.
      expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);

      // Every rendered card is a direct child of the bento grid.
      const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
      expect(bento).not.toBeNull();
      const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
      for (const card of cards) {
        expect(
          card.parentElement,
          `card "${
            card.getAttribute('data-pcc-card-id') ?? '<unidentified>'
          }" must be a direct child of [data-pcc-bento-grid]`,
        ).toBe(bento);
      }
    });
  }

  it('selecting a detail section then returning to command restores the seven native command-critical cards', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    // Default: native command cards present.
    expect(
      container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]'),
      'lifecycle-gates region (native command card) must render in default view',
    ).not.toBeNull();

    selectProjectReadinessSection(container, 'constraints');
    // Detail mode: native command cards absent, constraints-log present.
    expect(container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="constraints-log"]'),
    ).not.toBeNull();

    selectProjectReadinessSection(container, 'command');
    // Back to default: native command cards present, constraints-log absent.
    expect(container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="constraints-log"]')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — fixture-only fallback (no readModelClient)
//
// When no readModelClient is supplied, the surface renders the
// hero/native command-critical readiness cards plus the module-index
// card. None of the seven embedded module sections render in the
// default command view.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — fixture-only fallback (command-first default)', () => {
  it('renders no embedded module section markers when no readModelClient is supplied', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="lifecycle-readiness-center"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="permit-inspection-control-center"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="responsibility-matrix"]'),
    ).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="constraints-log"]')).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="buyout-log"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-region="procore-source-confidence"]'),
    ).toBeNull();
    // Hero (active-surface marker) and module-index region must still render.
    expect(
      container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="module-index"]')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — unified-lifecycle hook unconditional-call
// lock under command-first default
//
// Even though the unified-lifecycle section is NOT rendered by default
// in Prompt 01, its hook is still called from ReadModelContent so the
// Wave decision #8 (unconditional read-model hooks) contract holds and
// Prompt 02's detail-section renderer can swap content in without an
// extra fetch round-trip. This block replaces the pre-Prompt-01
// presence-of-body-markers test with a hook-call-count assertion plus
// a structural absence assertion.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — unified lifecycle hook unconditional-call lock', () => {
  afterEach(() => {
    cleanup();
  });

  it('mounting the surface with a read-model client invokes getUnifiedLifecycle exactly once even though body markers are absent in the default command view', async () => {
    const client = createPccFixtureReadModelClient();
    const unifiedLifecycleSpy = vi.spyOn(client, 'getUnifiedLifecycle');
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => expect(unifiedLifecycleSpy).toHaveBeenCalledTimes(1));
    // Default command view does not render the unified-lifecycle cards.
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
    // No unified-lifecycle route or workspace marker is introduced.
    expect(container.querySelector('[data-pcc-tab-id="unified-lifecycle"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-active-surface-panel="unified-lifecycle"]'),
    ).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — non-call architectural lock (extended)
//
// Eight read-model hook acquisitions (six embedded-module/readiness
// hooks + Procore + Unified Lifecycle) each call their canonical
// client method exactly once. The lock holds even though detail
// section components are not rendered in the default command view.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — non-call architectural lock', () => {
  afterEach(() => {
    cleanup();
  });

  it('mounting the surface invokes each of the eight read-model client methods exactly once', async () => {
    const client = createPccFixtureReadModelClient();
    const projectReadinessSpy = vi.spyOn(client, 'getProjectReadiness');
    const lifecycleReadinessSpy = vi.spyOn(client, 'getLifecycleReadiness');
    const permitInspectionSpy = vi.spyOn(client, 'getPermitInspectionControlCenter');
    const responsibilityMatrixSpy = vi.spyOn(client, 'getResponsibilityMatrix');
    const constraintsLogSpy = vi.spyOn(client, 'getConstraintsLog');
    const buyoutLogSpy = vi.spyOn(client, 'getBuyoutLog');
    // Procore hook calls two client methods in parallel; spying on the
    // mapping method is sufficient as canonical proof the procore hook
    // ran once.
    const procoreMappingSpy = vi.spyOn(client, 'getProcoreProjectMapping');
    const unifiedLifecycleSpy = vi.spyOn(client, 'getUnifiedLifecycle');

    render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => expect(projectReadinessSpy).toHaveBeenCalledTimes(1));
    expect(lifecycleReadinessSpy).toHaveBeenCalledTimes(1);
    expect(permitInspectionSpy).toHaveBeenCalledTimes(1);
    expect(responsibilityMatrixSpy).toHaveBeenCalledTimes(1);
    expect(constraintsLogSpy).toHaveBeenCalledTimes(1);
    expect(buyoutLogSpy).toHaveBeenCalledTimes(1);
    expect(procoreMappingSpy).toHaveBeenCalledTimes(1);
    expect(unifiedLifecycleSpy).toHaveBeenCalledTimes(1);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 03 — read-model parity and degraded-state tests
//
// Hooks are unconditional and fire on mount; clicks reveal already-
// resolved (or in-flight) view-models rather than triggering fetches.
// These tests pin structural invariants under degraded read-model
// envelopes (rejection, never-resolution, source-unavailable) for
// both the default command view and the unified-lifecycle detail
// view, and verify that React selection state survives the hook
// state machine.
// ─────────────────────────────────────────────────────────────────────

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

const NEVER_RESOLVED = (): Promise<never> => new Promise<never>(() => undefined);

function buildSourceUnavailableUnifiedLifecycleEnvelope(): PccReadModelEnvelope<PccUnifiedLifecycleReadModel> {
  return { ...SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE, sourceStatus: 'source-unavailable' };
}

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 03 default command resilience', () => {
  afterEach(() => {
    cleanup();
  });

  it('default command view still renders 9 cards with all structural invariants when getUnifiedLifecycle rejects', async () => {
    const client = createPccFixtureReadModelClient();
    const ulSpy = vi.spyOn(client, 'getUnifiedLifecycle').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    // The hook fires on mount even though the section is not rendered.
    await waitFor(() => expect(ulSpy).toHaveBeenCalledTimes(1));

    // No unified-lifecycle body markers leak into the default command view.
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length).toBeLessThanOrEqual(12);
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    for (const card of cards) {
      expect(card.parentElement).toBe(bento);
    }
  });

  it('default command view degrades approvals-derived blocker rows to zero when getApprovals rejects', async () => {
    const client = createPccFixtureReadModelClient();
    const approvalsSpy = vi.spyOn(client, 'getApprovals').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    // Hero stays ready — primary readiness fetch is independent of approvals.
    await waitFor(() => expect(approvalsSpy).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
      ).not.toBeNull(),
    );

    // Approvals-derived blocker rows degrade to zero (per
    // feedback_no_runtime_fixture_fallback_for_envelope_failure: never
    // auto-fall back to a fixture; emit zero derived rows).
    expect(
      container.querySelectorAll('[data-pcc-readiness-blocker-source="approvals-reference"]')
        .length,
      'approvals-derived blocker rows must be absent when getApprovals rejects',
    ).toBe(0);

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length).toBeLessThanOrEqual(12);
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    for (const card of cards) {
      expect(card.parentElement).toBe(bento);
    }
  });

  it('default command view collapses to the loading hero + module-index (compact) when every read-model client method never resolves', () => {
    const client = createPccFixtureReadModelClient();
    for (const method of ALL_FIXTURE_CLIENT_METHODS) {
      vi.spyOn(client, method).mockImplementation(NEVER_RESOLVED);
    }

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    // Hero state card surfaces loading posture; module-index still renders.
    const loadingState = container.querySelector('[data-pcc-state="loading"]');
    expect(loadingState, 'loading-state preview must render in the hero').not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="module-index"]')).not.toBeNull();

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length).toBeLessThanOrEqual(12);
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    for (const card of cards) {
      expect(card.parentElement).toBe(bento);
    }
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 03 selected unified-lifecycle state', () => {
  afterEach(() => {
    cleanup();
  });

  it('selecting unified-lifecycle when getUnifiedLifecycle rejects renders 3 cards with error-state inner content', async () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getUnifiedLifecycle').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    const drilldown = container.querySelector(
      '[data-pcc-readiness-drilldown-control="unified-lifecycle"]',
    ) as HTMLButtonElement | null;
    expect(drilldown).not.toBeNull();
    fireEvent.click(drilldown!);

    // Hook rejection settles → presentational section emits 3 cards in error state.
    await waitFor(() =>
      expect(container.querySelectorAll('[data-pcc-state="error"]').length).toBeGreaterThanOrEqual(
        3,
      ),
    );
    expect(container.querySelectorAll('[role="alert"]').length).toBeGreaterThanOrEqual(3);

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    for (const card of cards) {
      expect(card.parentElement).toBe(bento);
    }
  });

  it('selecting unified-lifecycle when getUnifiedLifecycle never resolves renders 3 cards with loading-state inner content', () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getUnifiedLifecycle').mockImplementation(NEVER_RESOLVED);

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    const drilldown = container.querySelector(
      '[data-pcc-readiness-drilldown-control="unified-lifecycle"]',
    ) as HTMLButtonElement | null;
    expect(drilldown).not.toBeNull();
    fireEvent.click(drilldown!);

    // Three loading-state preview slots inside the three unified-lifecycle cards.
    expect(container.querySelectorAll('[data-pcc-state="loading"]').length).toBeGreaterThanOrEqual(
      3,
    );
    // Hero/module-index unaffected.
    expect(
      container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="module-index"]')).not.toBeNull();
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
  });

  it('selecting unified-lifecycle when getUnifiedLifecycle resolves to a source-unavailable envelope still renders 3 direct bento children with body markers', async () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getUnifiedLifecycle').mockResolvedValue(
      buildSourceUnavailableUnifiedLifecycleEnvelope(),
    );

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    const drilldown = container.querySelector(
      '[data-pcc-readiness-drilldown-control="unified-lifecycle"]',
    ) as HTMLButtonElement | null;
    expect(drilldown).not.toBeNull();
    fireEvent.click(drilldown!);

    // Body markers appear once the ready branch resolves (the leaf 04C
    // components surface degraded posture internally; the surface-level
    // contract is "three direct bento children with body markers").
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-pcc-project-memory]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).not.toBeNull();

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(container.querySelectorAll('[data-pcc-active-surface-panel]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    for (const marker of [
      'data-pcc-lifecycle-timeline',
      'data-pcc-project-memory',
      'data-pcc-related-records',
    ] as const) {
      const node = container.querySelector(`[${marker}]`);
      expect(node).not.toBeNull();
      const card = node!.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement).toBe(bento);
    }
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 03 selection persistence across hook state transitions', () => {
  afterEach(() => {
    cleanup();
  });

  it('selecting unified-lifecycle while the hook is loading keeps aria-pressed=true and surfaces body markers when the promise resolves', async () => {
    const client = createPccFixtureReadModelClient();
    let resolveUL!: (value: PccReadModelEnvelope<PccUnifiedLifecycleReadModel>) => void;
    vi.spyOn(client, 'getUnifiedLifecycle').mockImplementation(
      () =>
        new Promise<PccReadModelEnvelope<PccUnifiedLifecycleReadModel>>((resolve) => {
          resolveUL = resolve;
        }),
    );

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    const drilldown = container.querySelector(
      '[data-pcc-readiness-drilldown-control="unified-lifecycle"]',
    ) as HTMLButtonElement | null;
    expect(drilldown).not.toBeNull();
    fireEvent.click(drilldown!);

    // Loading state visible immediately; selection state is set.
    expect(drilldown!.getAttribute('aria-pressed')).toBe('true');
    expect(drilldown!.getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
    expect(container.querySelectorAll('[data-pcc-state="loading"]').length).toBeGreaterThanOrEqual(
      3,
    );
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();

    // Resolve the promise; selection persists across the loading→ready
    // transition (React useState is independent of hook state).
    resolveUL(SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-pcc-project-memory]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).not.toBeNull();

    // Drilldown still shows selected — selection survived the transition.
    const drilldownAfter = container.querySelector(
      '[data-pcc-readiness-drilldown-control="unified-lifecycle"]',
    );
    expect(drilldownAfter!.getAttribute('aria-pressed')).toBe('true');
    expect(drilldownAfter!.getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 03 non-UL read-model parity', () => {
  afterEach(() => {
    cleanup();
  });

  it('non-UL detail sections each surface their hook-backed marker when selected; the matching client method was acquired unconditionally on mount', async () => {
    const client = createPccFixtureReadModelClient();
    // Hooks are unconditional and fire on mount — these spies record
    // acquisition, not click-driven invocation
    // (feedback_unconditional_hooks_fire_on_mount).
    const spies = {
      'lifecycle-readiness': vi.spyOn(client, 'getLifecycleReadiness'),
      'permits-inspections': vi.spyOn(client, 'getPermitInspectionControlCenter'),
      'responsibility-matrix': vi.spyOn(client, 'getResponsibilityMatrix'),
      constraints: vi.spyOn(client, 'getConstraintsLog'),
      buyout: vi.spyOn(client, 'getBuyoutLog'),
    } as const;

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    // Mount-time fetch acquisition: each method invoked at least once
    // before any click (architectural-lock test still owns exact counts).
    for (const [drilldownId, spy] of Object.entries(spies)) {
      await waitFor(() =>
        expect(spy, `${drilldownId} client method must be invoked at mount`).toHaveBeenCalled(),
      );
    }

    const sectionMarkers: Readonly<Record<string, string>> = {
      'lifecycle-readiness': '[data-pcc-readiness-section="lifecycle-readiness-center"]',
      'permits-inspections': '[data-pcc-readiness-section="permit-inspection-control-center"]',
      'responsibility-matrix': '[data-pcc-readiness-section="responsibility-matrix"]',
      constraints: '[data-pcc-readiness-section="constraints-log"]',
      buyout: '[data-pcc-readiness-section="buyout-log"]',
    };

    for (const drilldownId of Object.keys(spies)) {
      const drilldown = container.querySelector(
        `[data-pcc-readiness-drilldown-control="${drilldownId}"]`,
      ) as HTMLButtonElement | null;
      expect(drilldown, `expected drilldown control for ${drilldownId}`).not.toBeNull();
      fireEvent.click(drilldown!);
      await waitFor(() =>
        expect(
          container.querySelector(sectionMarkers[drilldownId]),
          `selecting ${drilldownId} must reveal ${sectionMarkers[drilldownId]}`,
        ).not.toBeNull(),
      );
    }
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 03 command/detail return under degraded UL', () => {
  afterEach(() => {
    cleanup();
  });

  it('selecting unified-lifecycle then returning to command restores the seven native command-critical cards with no UL body markers', async () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getUnifiedLifecycle').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    // Wait for hero ready so the seven native command-critical cards exist.
    await waitFor(() =>
      expect(
        container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]'),
      ).not.toBeNull(),
    );

    const ulDrilldown = container.querySelector(
      '[data-pcc-readiness-drilldown-control="unified-lifecycle"]',
    ) as HTMLButtonElement;
    fireEvent.click(ulDrilldown);
    // Detail mode: native command card absent.
    expect(container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]')).toBeNull();

    const commandDrilldown = container.querySelector(
      '[data-pcc-readiness-drilldown-control="command"]',
    ) as HTMLButtonElement;
    fireEvent.click(commandDrilldown);
    // Back to default command: native cards re-render, no UL body markers.
    expect(container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 04 — compact loading/error, source-unavailable
// preview preservation, false-affordance exact-match overlay,
// accessibility, and selected-detail tier/region/footprint consistency.
// ─────────────────────────────────────────────────────────────────────

const PROMPT_04_FORBIDDEN_ENABLED_LABEL =
  /^(submit|approve|upload|run|execute|sync|write\s*back|writeback|complete\s*checklist|launch|create|modify|delete|save)$/i;

const ALL_DETAIL_SECTION_DRILLDOWN_IDS: readonly string[] = [
  'lifecycle-readiness',
  'permits-inspections',
  'responsibility-matrix',
  'constraints',
  'buyout',
  'procore-source-confidence',
  'unified-lifecycle',
];

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 04 compact loading & error', () => {
  afterEach(() => {
    cleanup();
  });

  it('default command view renders exactly 2 cards (hero state + module-index) when getProjectReadiness never resolves', () => {
    const client = createPccFixtureReadModelClient();
    vi.spyOn(client, 'getProjectReadiness').mockImplementation(NEVER_RESOLVED);

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length, 'compact loading must render exactly 2 cards').toBe(2);

    // Hero state card surfaces loading posture.
    expect(
      container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    // Module-index renders.
    expect(container.querySelector('[data-pcc-readiness-region="module-index"]')).not.toBeNull();

    // Fixture-scaffold framework markers must NOT render in compact loading.
    expect(container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]')).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="domains"]')).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="blockers"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-region="evidence-source-health"]'),
    ).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="downstream-modules"]')).toBeNull();
    // No embedded module section markers.
    expect(
      container.querySelector('[data-pcc-readiness-section="lifecycle-readiness-center"]'),
    ).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="constraints-log"]')).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="buyout-log"]')).toBeNull();
    expect(container.querySelectorAll('[data-pcc-card] [data-pcc-card]').length).toBe(0);
    for (const card of cards) {
      expect(card.parentElement).toBe(bento);
    }
  });

  it('default command view renders exactly 2 cards (hero state + module-index) when getProjectReadiness rejects', async () => {
    const client = createPccFixtureReadModelClient();
    const spy = vi.spyOn(client, 'getProjectReadiness').mockRejectedValue(new Error('boom'));

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => expect(spy).toHaveBeenCalled());
    await waitFor(() => expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull());

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length, 'compact error must render exactly 2 cards').toBe(2);

    expect(
      container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="module-index"]')).not.toBeNull();

    // No fixture-scaffold framework markers; no embedded module markers.
    expect(container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]')).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="domains"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="lifecycle-readiness-center"]'),
    ).toBeNull();
    for (const card of cards) {
      expect(card.parentElement).toBe(bento);
    }
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 04 source-unavailable preview preservation', () => {
  afterEach(() => {
    cleanup();
  });

  it('default command view preserves the safe 9-card preview layout when getProjectReadiness resolves with a source-unavailable envelope', async () => {
    const client = createPccFixtureReadModelClient();
    const original = client.getProjectReadiness.bind(client);
    vi.spyOn(client, 'getProjectReadiness').mockImplementation(async (projectId) => {
      const envelope = await original(projectId);
      return { ...envelope, sourceStatus: 'source-unavailable' };
    });

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() =>
      expect(
        container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
      ).not.toBeNull(),
    );
    // Source-unavailable adapter output is `preview` status, not `loading` or `error`.
    await waitFor(() =>
      expect(
        container.querySelector('[data-pcc-readiness-region="lifecycle-gates"]'),
      ).not.toBeNull(),
    );

    // Seven framework markers all render.
    for (const region of [
      'hero',
      'lifecycle-gates',
      'domains',
      'blockers',
      'evidence-source-health',
      'downstream-modules',
      'ownership-accountability',
      'priority-actions-preview',
    ]) {
      expect(
        container.querySelector(`[data-pcc-readiness-region="${region}"]`),
        `framework region "${region}" must render in source-unavailable preview`,
      ).not.toBeNull();
    }

    // No embedded module section markers leak in.
    for (const sectionMarker of [
      'lifecycle-readiness-center',
      'permit-inspection-control-center',
      'responsibility-matrix',
      'constraints-log',
      'buyout-log',
    ]) {
      expect(
        container.querySelector(`[data-pcc-readiness-section="${sectionMarker}"]`),
        `embedded section "${sectionMarker}" must remain absent in default command view`,
      ).toBeNull();
    }
    expect(
      container.querySelector('[data-pcc-readiness-region="procore-source-confidence"]'),
    ).toBeNull();

    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
    expect(cards.length, 'source-unavailable preview retains the 9-card command layout').toBe(9);
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 04 false-affordance exact-match overlay', () => {
  afterEach(() => {
    cleanup();
  });

  it('no enabled button anywhere in the active surface bento has an exact-match executable-verb label', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const enabledButtons = Array.from(bento.querySelectorAll<HTMLButtonElement>('button')).filter(
      (b) => !b.disabled && b.getAttribute('aria-disabled') !== 'true',
    );
    for (const button of enabledButtons) {
      const trimmed = (button.textContent ?? '').trim();
      expect(
        PROMPT_04_FORBIDDEN_ENABLED_LABEL.test(trimmed),
        `enabled button text "${trimmed}" must not match the exact-match forbidden-verb regex`,
      ).toBe(false);
    }
  });

  it('every enabled button in the active surface bento is a drilldown control; non-drilldown buttons are disabled or aria-disabled="true"', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    const allButtons = Array.from(bento.querySelectorAll<HTMLButtonElement>('button'));
    for (const button of allButtons) {
      const isEnabled = !button.disabled && button.getAttribute('aria-disabled') !== 'true';
      const isDrilldown = button.hasAttribute('data-pcc-readiness-drilldown-control');
      if (isEnabled) {
        expect(
          isDrilldown,
          `enabled button "${(button.textContent ?? '').trim()}" must carry data-pcc-readiness-drilldown-control`,
        ).toBe(true);
      } else if (!isDrilldown) {
        expect(
          button.disabled || button.getAttribute('aria-disabled') === 'true',
          `non-drilldown button "${(button.textContent ?? '').trim()}" must be disabled or aria-disabled`,
        ).toBe(true);
      }
    }
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 04 drilldown accessibility lock', () => {
  afterEach(() => {
    cleanup();
  });

  it('every drilldown control is a button[type="button"] with a non-empty accessible name; exactly one is aria-pressed=true and carries data-pcc-readiness-drilldown-state="selected"', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const drilldowns = Array.from(
      container.querySelectorAll<HTMLButtonElement>('[data-pcc-readiness-drilldown-control]'),
    );
    expect(drilldowns).toHaveLength(8);

    for (const button of drilldowns) {
      expect(button.tagName).toBe('BUTTON');
      expect(button.getAttribute('type')).toBe('button');
      const accessibleName = (
        (button.textContent ?? '') +
        ' ' +
        (button.getAttribute('aria-label') ?? '')
      ).trim();
      expect(
        accessibleName.length,
        `drilldown control "${button.getAttribute('data-pcc-readiness-drilldown-control')}" must have a non-empty accessible name`,
      ).toBeGreaterThan(0);
    }

    const pressed = drilldowns.filter((b) => b.getAttribute('aria-pressed') === 'true');
    expect(pressed, 'exactly one drilldown must be aria-pressed="true"').toHaveLength(1);
    const selectedMarker = drilldowns.filter(
      (b) => b.getAttribute('data-pcc-readiness-drilldown-state') === 'selected',
    );
    expect(
      selectedMarker,
      'exactly one drilldown must carry data-pcc-readiness-drilldown-state="selected"',
    ).toHaveLength(1);
    expect(pressed[0]).toBe(selectedMarker[0]);
    expect(pressed[0].getAttribute('data-pcc-readiness-drilldown-control')).toBe('command');
  });

  it('clicking each detail drilldown produces exclusive aria-pressed="true" and selected-state markers on that control', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    for (const drilldownId of ALL_DETAIL_SECTION_DRILLDOWN_IDS) {
      const target = container.querySelector(
        `[data-pcc-readiness-drilldown-control="${drilldownId}"]`,
      ) as HTMLButtonElement;
      fireEvent.click(target);
      const drilldowns = Array.from(
        container.querySelectorAll<HTMLButtonElement>('[data-pcc-readiness-drilldown-control]'),
      );
      const pressed = drilldowns.filter((b) => b.getAttribute('aria-pressed') === 'true');
      expect(
        pressed,
        `selecting "${drilldownId}" must produce exactly one aria-pressed`,
      ).toHaveLength(1);
      expect(pressed[0].getAttribute('data-pcc-readiness-drilldown-control')).toBe(drilldownId);
      expect(pressed[0].getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
    }
  });
});

describe('Project Readiness Center surface — Wave 15A B5 / Prompt 04 selected-detail tier/region/footprint consistency', () => {
  afterEach(() => {
    cleanup();
  });

  it.each(ALL_DETAIL_SECTION_DRILLDOWN_IDS)(
    'every card rendered after selecting "%s" carries explicit tier-source, region-source, and a non-empty footprint',
    async (drilldownId) => {
      const { container } = render(
        <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
      );
      activateProjectReadiness(container);
      const drilldown = container.querySelector(
        `[data-pcc-readiness-drilldown-control="${drilldownId}"]`,
      ) as HTMLButtonElement;
      fireEvent.click(drilldown);

      // Wait for the section's first card to render. For unified-lifecycle
      // the body marker resolves on the next hook microtask; for fixture-
      // backed sections the markers render synchronously.
      await waitFor(() => {
        const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
        // Detail mode = hero + module-index + at least one detail card.
        expect(bento.querySelectorAll('[data-pcc-card]').length).toBeGreaterThanOrEqual(3);
      });

      const bento = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
      const cards = Array.from(bento.querySelectorAll<HTMLElement>('[data-pcc-card]'));
      for (const card of cards) {
        const cardId = card.getAttribute('data-pcc-card-id') ?? '<unidentified>';
        expect(
          card.getAttribute('data-pcc-card-tier-source'),
          `card "${cardId}" in section "${drilldownId}" must have explicit tier source`,
        ).toBe('explicit');
        expect(
          card.getAttribute('data-pcc-card-region-source'),
          `card "${cardId}" in section "${drilldownId}" must have explicit region source`,
        ).toBe('explicit');
        const footprint = card.getAttribute('data-pcc-footprint');
        expect(
          footprint && footprint.length > 0,
          `card "${cardId}" in section "${drilldownId}" must have non-empty footprint`,
        ).toBe(true);
        // Direct-child invariant under detail mode.
        expect(card.parentElement).toBe(bento);
      }
    },
  );
});
