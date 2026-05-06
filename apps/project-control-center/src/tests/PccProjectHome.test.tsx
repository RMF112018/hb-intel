import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import {
  DOCUMENT_CONTROL_SOURCE_IDS,
  PRIORITY_ACTION_CATEGORY_LABELS,
  SAMPLE_APPROVAL_CHECKPOINTS,
  SAMPLE_BUSINESS_AUDIT_EVENTS,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_SITE_HEALTH_SUMMARY,
  SAMPLE_WORKFLOW_ITEMS,
  type IPriorityAction,
  type SiteHealthSeverity,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectHome } from '../surfaces/projectHome/PccProjectHome';
import { PccPriorityActionsCard } from '../surfaces/projectHome/PccPriorityActionsCard';
import { TEAM_SNAPSHOT_PLACEHOLDER } from '../surfaces/projectHome/teamSnapshotPlaceholder';
import { PCC_PRIORITY_RAIL_GROUP_IDS } from '../surfaces/projectHome/priorityActionsRailViewModel';
import {
  PCC_CARD_STATES,
  priorityToneForAction,
  type PccPriorityTone,
} from '../surfaces/projectHome/shared';

const SUPPRESSED_CATEGORY_LABELS = [
  PRIORITY_ACTION_CATEGORY_LABELS.health,
  PRIORITY_ACTION_CATEGORY_LABELS.documents,
  PRIORITY_ACTION_CATEGORY_LABELS.safety,
] as const;

const SUPPRESSED_FIXTURES = SAMPLE_PRIORITY_ACTIONS.filter((a) =>
  ['documents', 'health', 'safety'].includes(a.category),
);

const REQUIRED_CARD_TITLES = [
  'Project Intelligence Header',
  'Priority Actions',
  'Site Health Summary',
  'Document Control Center',
  'Project Readiness',
  'Approvals & Checkpoints',
  'External Systems',
  'Team Snapshot',
  'Missing Configurations',
  'Recent Activity',
] as const;

// Wave 99 / Prompt 05B — unified lifecycle cards are appended to the
// read-model-driven path only. `<PccApp forceMode="desktop" />`
// without a `readModelClient` renders the fixture-only fallback (10
// cards); to render the read-model-driven path, supply a fixture
// client via `readModelClient={createPccFixtureReadModelClient()}`.
const UNIFIED_LIFECYCLE_CARD_TITLES = [
  'Lifecycle Timeline',
  'Project Memory',
  'Project Lens',
  'Related Records',
] as const;

// Wave 99 / Prompt 06C — Ask HBI is integrated as one additional card on
// the read-model-driven path only. Read-model-driven Project Home goes
// 14 → 15; fixture-only path stays at 10.
const ASK_HBI_CARD_TITLES = ['Ask HBI — Grounded Project Answers'] as const;

// Wave 13 / Prompt 13E — Procore snapshot card is integrated as one
// additional card on the read-model-driven path only (15 → 16). The
// fixture-only path is unaffected and stays at 10.
const PROCORE_CARD_TITLES = ['Procore snapshot'] as const;

const READINESS_MODULES = new Set(['startup-tasks', 'permits', 'required-inspections']);

describe('Project Home bento dashboard', () => {
  // Wave 99 / Prompt 05B — explicit cleanup between renders so the
  // unified-lifecycle integration tests' read-model-driven `<PccApp />`
  // renders do not pollute one another via accumulated `document.body`
  // DOM. The test-setup file does not enable RTL auto-cleanup
  // workspace-wide, so the previous renders' content otherwise lingers
  // and `waitFor` polling on a fresh hook microtask resolves slowly.
  afterEach(() => {
    cleanup();
  });

  it('renders all 10 required Project Home card titles inside the active panel', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    // Card-scoped title check: query each card's heading slot rather
    // than scanning grid.textContent, so phrases like "Project Memory"
    // or "Project Lens" appearing inside body copy elsewhere never
    // satisfy a card-title assertion (per
    // feedback_per_lane_marker_assertions /
    // feedback_per_component_marker_scoping).
    const headingTexts = Array.from(grid!.querySelectorAll<HTMLElement>('[data-pcc-card] h3')).map(
      (el) => el.textContent?.trim() ?? '',
    );
    for (const title of REQUIRED_CARD_TITLES) {
      expect(headingTexts, `card title '${title}' should render as a card heading`).toContain(
        title,
      );
    }
  });

  it('every Project Home card emits a non-empty data-pcc-footprint and is a direct child of the bento grid', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBe(REQUIRED_CARD_TITLES.length);
    for (const card of cards) {
      expect(card.parentElement === grid, 'card must be a direct child of the bento grid').toBe(
        true,
      );
      const footprint = card.getAttribute('data-pcc-footprint');
      expect(footprint, 'card must emit data-pcc-footprint').not.toBeNull();
      expect(footprint!.length).toBeGreaterThan(0);
      const span = Number(card.getAttribute('data-pcc-column-span'));
      expect(span).toBeGreaterThan(0);
    }
  });

  it('exactly one [data-pcc-active-surface-panel] exists with value "project-home", carried by the Project Intelligence card', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
    expect(panels[0].textContent).toContain('Project Intelligence Header');
  });

  it('the bento grid does not use grid-auto-flow: dense', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.style.gridAutoFlow ?? '').not.toContain('dense');
  });

  it('renders no anchor elements with live launch URLs (no http/https hrefs anywhere on Project Home)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href, `anchor href '${href}' must not be a live launch URL`).not.toMatch(
        /^https?:\/\//,
      );
    }
  });

  // ── Priority Actions Rail (Wave 5) ───────────────────────────────────

  it('Priority Actions card renders the Wave 5 four-group rail in canonical order', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rails = container.querySelectorAll('[data-pcc-priority-rail]');
    expect(rails).toHaveLength(1);
    const rail = rails[0]!;
    const lanes = rail.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-group]');
    const ids = Array.from(lanes).map((el) => el.getAttribute('data-pcc-priority-rail-group'));
    expect(ids).toEqual([...PCC_PRIORITY_RAIL_GROUP_IDS]);
  });

  it('Priority Actions rail renders 15 visible rows from SAMPLE_PRIORITY_ACTIONS, each with valid tone', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rail = container.querySelector('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    const rows = rail!.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]');
    expect(rows).toHaveLength(15);
    const tones = new Set<PccPriorityTone>();
    for (const row of Array.from(rows)) {
      const tone = row.getAttribute('data-pcc-priority-rail-action-tone') as PccPriorityTone | null;
      expect(tone).not.toBeNull();
      expect(['high', 'medium', 'low']).toContain(tone!);
      tones.add(tone!);
    }
    expect(tones.size).toBeGreaterThan(0);
  });

  it('Priority Actions rail suppresses documents/health/safety from the user-facing MVP rail (scoped to rail root)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rail = container.querySelector<HTMLElement>('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    const railText = rail!.textContent ?? '';
    for (const fx of SUPPRESSED_FIXTURES) {
      expect(
        rail!.querySelector(`[data-pcc-priority-rail-action-id="${fx.id}"]`),
        `suppressed action ${fx.id} must not appear in the rail`,
      ).toBeNull();
      expect(
        railText,
        `suppressed fixture title '${fx.title}' must not appear in the rail`,
      ).not.toContain(fx.title);
    }
    for (const label of SUPPRESSED_CATEGORY_LABELS) {
      expect(
        railText,
        `suppressed category label '${label}' must not appear in the rail`,
      ).not.toContain(label);
    }
  });

  it('Priority Actions rail renders inert non-executing affordances (no anchors, no hrefs, no buttons)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rail = container.querySelector<HTMLElement>('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    expect(rail!.querySelectorAll('a')).toHaveLength(0);
    expect(rail!.querySelectorAll('[href]')).toHaveLength(0);
    expect(rail!.querySelectorAll('button')).toHaveLength(0);
    const affordances = rail!.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-disabled-action]',
    );
    expect(affordances.length).toBe(15);
    for (const el of Array.from(affordances)) {
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Reference');
    }
  });

  it('Priority Actions rail renders visible Priority: <Tone> labels matching each row tone', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rail = container.querySelector<HTMLElement>('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    expect(rail!.textContent ?? '').toContain('Priority: ');
    const rows = rail!.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]');
    for (const row of Array.from(rows)) {
      const rowTone = row.getAttribute('data-pcc-priority-rail-action-tone');
      const toneLabel = row.querySelector<HTMLElement>('[data-pcc-priority-rail-tone-label]');
      expect(toneLabel).not.toBeNull();
      expect(toneLabel!.getAttribute('data-pcc-priority-rail-tone-label')).toBe(rowTone);
    }
  });

  it('Priority Actions card non-preview state renders PccPreviewState and does NOT render the rail', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccPriorityActionsCard state="error" />
      </PccBentoGrid>,
    );
    expect(container.querySelector('[data-pcc-priority-rail]')).toBeNull();
    const stateEl = container.querySelector('[data-pcc-state="error"]');
    expect(stateEl).not.toBeNull();
  });

  it('priorityToneForAction maps every SiteHealthSeverity (and undefined) to the correct tone', () => {
    const cases: ReadonlyArray<{
      severity: SiteHealthSeverity | undefined;
      tone: PccPriorityTone;
    }> = [
      { severity: 'Blocking', tone: 'high' },
      { severity: 'Security Risk', tone: 'high' },
      { severity: 'Repair Required', tone: 'high' },
      { severity: 'Warning', tone: 'medium' },
      { severity: 'Info', tone: 'low' },
      { severity: undefined, tone: 'medium' },
    ];
    for (const c of cases) {
      const action: IPriorityAction = {
        id: `synthetic-${c.severity ?? 'undefined'}`,
        category: 'workflow',
        title: 'synthetic',
        severity: c.severity,
      };
      expect(priorityToneForAction(action)).toBe(c.tone);
    }
  });

  // ── Site Health Summary ──────────────────────────────────────────────

  it('Site Health Summary card displays overallSeverity, failingChecks, and warningChecks from the fixture', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const body = container.querySelector('[data-pcc-site-health-body]');
    expect(body).not.toBeNull();
    expect(body!.textContent).toContain(SAMPLE_SITE_HEALTH_SUMMARY.overallSeverity);
    expect(body!.querySelector('[data-pcc-site-health-failing]')?.textContent).toContain(
      String(SAMPLE_SITE_HEALTH_SUMMARY.failingChecks),
    );
    expect(body!.querySelector('[data-pcc-site-health-warning]')?.textContent).toContain(
      String(SAMPLE_SITE_HEALTH_SUMMARY.warningChecks),
    );
  });

  // ── Document Control ─────────────────────────────────────────────────

  it('Document Control card renders one tile per DOCUMENT_CONTROL_SOURCE_IDS entry with posture metadata, grouped by canonical lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const body = container.querySelector('[data-pcc-document-control-body]');
    expect(body).not.toBeNull();

    // Two lane sections from the canonical DOCUMENT_CONTROL_LANES, scoped to this card body.
    const microsoftLane = body!.querySelector('[data-pcc-doc-lane="microsoft-files"]');
    const externalLane = body!.querySelector('[data-pcc-doc-lane="external-document-systems"]');
    expect(microsoftLane, 'Microsoft Files lane section should render').not.toBeNull();
    expect(externalLane, 'External Document Systems lane section should render').not.toBeNull();

    // Tile counts derived from the canonical lane field on DOCUMENT_CONTROL_SOURCES.
    const tiles = body!.querySelectorAll('[data-pcc-document-source-id]');
    expect(tiles).toHaveLength(DOCUMENT_CONTROL_SOURCE_IDS.length);
    for (const tile of tiles) {
      expect(tile.getAttribute('data-pcc-document-posture')).not.toBeNull();
      expect(tile.getAttribute('data-pcc-document-link-behavior')).not.toBeNull();
      expect(tile.getAttribute('data-pcc-doc-lane')).not.toBeNull();
    }
  });

  it('Document Control card Microsoft-lane action chips are disabled buttons with no executable handler or href', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const body = container.querySelector('[data-pcc-document-control-body]');
    expect(body).not.toBeNull();

    const actionEls = body!.querySelectorAll('[data-pcc-doc-action]');
    expect(
      actionEls.length,
      'at least one Microsoft-lane action chip should render',
    ).toBeGreaterThan(0);
    for (const el of actionEls) {
      expect(el.tagName).toBe('BUTTON');
      const button = el as HTMLButtonElement;
      expect(
        button.disabled,
        `action chip ${button.getAttribute('data-pcc-doc-action')} must be disabled`,
      ).toBe(true);
      expect(button.getAttribute('aria-disabled')).toBe('true');
      // No inline onclick attribute string.
      expect(button.getAttribute('onclick')).toBeNull();
      // executionState marker reflects the canonical preview-disabled posture.
      expect(button.getAttribute('data-pcc-doc-action-execution-state')).toBe('preview-disabled');
    }

    // No <a href="http(s)://"> launch behavior anywhere in the card body.
    const anchors = body!.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href).not.toMatch(/^https?:\/\//);
    }

    // External-lane rows surface a launch/visibility cue and contain no action buttons.
    const externalLane = body!.querySelector('[data-pcc-doc-lane="external-document-systems"]');
    expect(externalLane).not.toBeNull();
    const externalLaunchCues = externalLane!.querySelectorAll('[data-pcc-doc-launch-cue]');
    expect(externalLaunchCues.length).toBeGreaterThan(0);
    const externalActionButtons = externalLane!.querySelectorAll('[data-pcc-doc-action]');
    expect(externalActionButtons.length).toBe(0);
  });

  // ── Project Readiness ────────────────────────────────────────────────

  it('Project Readiness card renders a row per readiness-module workflow item', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const expected = SAMPLE_WORKFLOW_ITEMS.filter((i) => READINESS_MODULES.has(i.moduleId));
    const rows = container.querySelectorAll('[data-pcc-readiness-item-id]');
    expect(rows).toHaveLength(expected.length);
  });

  // ── Approvals & Checkpoints ──────────────────────────────────────────

  it('Approvals & Checkpoints card renders SAMPLE_APPROVAL_CHECKPOINTS.length rows', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rows = container.querySelectorAll('[data-pcc-approval-checkpoint-id]');
    expect(rows).toHaveLength(SAMPLE_APPROVAL_CHECKPOINTS.length);
    for (const row of rows) {
      const state = row.getAttribute('data-pcc-approval-state');
      expect(['pending', 'approved', 'rejected', 'waived']).toContain(state);
    }
  });

  // ── External Systems ─────────────────────────────────────────────────

  it('External Systems card renders SAMPLE_EXTERNAL_SYSTEM_LINKS.length rows with no anchor elements', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const body = container.querySelector('[data-pcc-external-systems-body]');
    expect(body).not.toBeNull();
    const rows = body!.querySelectorAll('[data-pcc-external-system-id]');
    expect(rows).toHaveLength(SAMPLE_EXTERNAL_SYSTEM_LINKS.length);
    expect(body!.querySelectorAll('a').length).toBe(0);
  });

  // ── Team Snapshot ────────────────────────────────────────────────────

  it('Team Snapshot card renders TEAM_SNAPSHOT_PLACEHOLDER.length entries; every visible label carries the (preview) suffix', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const entries = container.querySelectorAll('[data-pcc-team-entry-persona]');
    expect(entries).toHaveLength(TEAM_SNAPSHOT_PLACEHOLDER.length);
    for (const entry of entries) {
      expect(entry.textContent).toContain('(preview)');
    }
  });

  // ── Missing Configurations ───────────────────────────────────────────

  it('Missing Configurations card renders SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.length rows with system + message', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rows = container.querySelectorAll('[data-pcc-missing-config-system]');
    expect(rows).toHaveLength(SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.length);
    for (const config of SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS) {
      const row = container.querySelector(`[data-pcc-missing-config-system="${config.systemId}"]`);
      expect(row, `missing-config row for '${config.systemId}' should render`).not.toBeNull();
      expect(row!.textContent).toContain(config.message);
    }
  });

  // ── Recent Activity ──────────────────────────────────────────────────

  it('Recent Activity card renders SAMPLE_BUSINESS_AUDIT_EVENTS.length rows', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rows = container.querySelectorAll('[data-pcc-activity-event-id]');
    expect(rows).toHaveLength(SAMPLE_BUSINESS_AUDIT_EVENTS.length);
  });

  // ── Project Intelligence ─────────────────────────────────────────────

  it('Project Intelligence card displays SAMPLE_PROJECT_PROFILE fields', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const body = container.querySelector('[data-pcc-project-intelligence-body]');
    expect(body).not.toBeNull();
    expect(body!.textContent).toContain(SAMPLE_PROJECT_PROFILE.projectName);
    expect(body!.textContent).toContain(SAMPLE_PROJECT_PROFILE.projectNumber);
  });

  // ── Card-state contract sanity ───────────────────────────────────────

  it('PCC_CARD_STATES exposes preview / empty / missing-config / unavailable-fixture / error / unauthorized-persona', () => {
    expect(PCC_CARD_STATES).toEqual([
      'preview',
      'empty',
      'missing-config',
      'unavailable-fixture',
      'error',
      'unauthorized-persona',
    ]);
  });

  // ── Wave 99 / Prompt 05B — unified lifecycle integration ─────────────
  //
  // Project Home has two render paths: fixture-only (no readModelClient,
  // 10 cards) and read-model-driven (readModelClient supplied, 10
  // existing cards + 4 unified-lifecycle cards from the new section).
  // Each test below names which path it exercises and asserts the
  // path-specific cardinality / content invariants.

  it('fixture-only fallback (no readModelClient) preserves the original 10-card baseline and renders no unified-lifecycle titles', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectHome />
      </PccBentoGrid>,
    );
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(
      cards.length,
      'fixture-only fallback must render exactly the original 10 cards (no unified-lifecycle section)',
    ).toBe(REQUIRED_CARD_TITLES.length);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
    const headingTexts = Array.from(grid!.querySelectorAll<HTMLElement>('[data-pcc-card] h3')).map(
      (el) => el.textContent?.trim() ?? '',
    );
    for (const title of UNIFIED_LIFECYCLE_CARD_TITLES) {
      expect(
        headingTexts,
        `fixture-only fallback must NOT include unified-lifecycle title '${title}'`,
      ).not.toContain(title);
    }
    for (const title of ASK_HBI_CARD_TITLES) {
      expect(
        headingTexts,
        `fixture-only fallback must NOT include Ask-HBI title '${title}'`,
      ).not.toContain(title);
    }
  });

  it('read-model-driven path renders 16 cards (10 existing + 4 unified lifecycle + 1 Ask HBI + 1 Procore snapshot) and exposes each unified-lifecycle body marker as a direct child of the bento grid', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    // Wait for the read-model-driven hook to resolve so the section
    // renders body markers (rather than the loading PccPreviewState).
    await findByText('Lifecycle Timeline');
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBe(
      REQUIRED_CARD_TITLES.length +
        UNIFIED_LIFECYCLE_CARD_TITLES.length +
        ASK_HBI_CARD_TITLES.length +
        PROCORE_CARD_TITLES.length,
    );
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
      const span = Number(card.getAttribute('data-pcc-column-span'));
      expect(span).toBeGreaterThan(0);
    }
    const headingTexts = Array.from(grid!.querySelectorAll<HTMLElement>('[data-pcc-card] h3')).map(
      (el) => el.textContent?.trim() ?? '',
    );
    for (const title of [
      ...REQUIRED_CARD_TITLES,
      ...UNIFIED_LIFECYCLE_CARD_TITLES,
      ...ASK_HBI_CARD_TITLES,
      ...PROCORE_CARD_TITLES,
    ]) {
      expect(headingTexts).toContain(title);
    }
    const bodyMarkers = [
      'data-pcc-lifecycle-timeline',
      'data-pcc-project-memory',
      'data-pcc-project-lens-switcher',
      'data-pcc-related-records',
    ] as const;
    for (const marker of bodyMarkers) {
      const node = container.querySelector(`[${marker}]`);
      expect(node, `unified-lifecycle body marker [${marker}] should render`).not.toBeNull();
      const card = node!.closest('[data-pcc-card]');
      expect(card, `body marker [${marker}] must be inside a PccDashboardCard`).not.toBeNull();
      expect(
        card!.parentElement === grid,
        `card containing [${marker}] must be a direct child of the bento grid`,
      ).toBe(true);
    }
  });

  it('read-model-driven path: unified lifecycle lens switcher renders only preview-disabled buttons and no anchors', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findByText('Project Lens');
    const lensSwitcher = container.querySelector('[data-pcc-project-lens-switcher]');
    expect(lensSwitcher).not.toBeNull();
    const lensButtons = lensSwitcher!.querySelectorAll<HTMLButtonElement>('[data-pcc-lens-id]');
    expect(lensButtons.length).toBeGreaterThan(0);
    for (const button of Array.from(lensButtons)) {
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('data-pcc-action-state')).toBe('preview-disabled');
    }
    expect(lensSwitcher!.querySelectorAll('a[href]').length).toBe(0);
  });

  it('read-model-driven path: Project Home does not introduce a unified-lifecycle, unified-search, or ask-hbi route or workspace marker', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findByText('Lifecycle Timeline');
    await findByText('Ask HBI — Grounded Project Answers');
    for (const id of ['unified-lifecycle', 'unified-search', 'ask-hbi'] as const) {
      expect(
        container.querySelector(`[data-pcc-tab-id="${id}"]`),
        `read-model-driven Project Home must not register a [data-pcc-tab-id="${id}"]`,
      ).toBeNull();
      expect(
        container.querySelector(`[data-pcc-active-surface-panel="${id}"]`),
        `read-model-driven Project Home must not register a [data-pcc-active-surface-panel="${id}"]`,
      ).toBeNull();
    }
    const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href]');
    for (const anchor of Array.from(anchors)) {
      const href = anchor.getAttribute('href') ?? '';
      for (const forbidden of [
        'unified-lifecycle',
        'lifecycle-timeline',
        'traceability-graph',
        'closed-project-references',
        'unified-search',
        'ask-hbi',
      ]) {
        expect(
          href.includes(forbidden),
          `anchor href '${href}' must not reference '${forbidden}'`,
        ).toBe(false);
      }
    }
  });

  // Wave 99 / Prompt 06C — Ask-HBI section integration.
  // The integrated card uses idle-on-mount posture (initialQuery={null}),
  // so the panel renders the idle PccPreviewState and does NOT auto-fire
  // a getUnifiedSearch fetch. Sample-query click behavior is covered by
  // the focused PccProjectHomeAskHbiSection test file.
  it('read-model-driven path: Ask HBI card mounts in idle posture inside a wide PccDashboardCard, with the panel disclaimer', async () => {
    const { container, findByText } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    const askHbiHeading = await findByText('Ask HBI — Grounded Project Answers');
    const card = askHbiHeading.closest('[data-pcc-card]');
    expect(card, 'Ask HBI heading must live inside a PccDashboardCard').not.toBeNull();
    expect(card!.getAttribute('data-pcc-footprint')).toBe('wide');
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(card!.parentElement === grid).toBe(true);
    const panel = card!.querySelector('[data-pcc-ask-hbi-panel]');
    expect(panel, 'Ask HBI panel marker must render inside the card').not.toBeNull();
    expect(panel!.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('idle');
    const disclaimer = card!.querySelector('[data-pcc-ask-hbi-disclaimer]');
    expect(disclaimer, 'panel disclaimer must render inside the card').not.toBeNull();
    expect(disclaimer!.textContent ?? '').toContain('not the source of truth');
  });
});
