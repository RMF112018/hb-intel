import { afterEach, describe, it, expect } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import {
  DOCUMENT_CONTROL_SOURCE_IDS,
  PRIORITY_ACTION_CATEGORY_LABELS,
  SAMPLE_APPROVAL_CHECKPOINTS,
  SAMPLE_BUSINESS_AUDIT_EVENTS,
  SAMPLE_EXTERNAL_SYSTEM_LINKS,
  SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS,
  SAMPLE_PRIORITY_ACTIONS,
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
import {
  PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS,
  PCC_PRIORITY_RAIL_GROUP_IDS,
} from '../surfaces/projectHome/priorityActionsRailViewModel';
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

// Wave 15A wave-b9 Prompt 4B-01 — `PccProjectIntelligenceCard` was removed
// and `PccPriorityActionsCard` is now the first bento card. Project Home
// moved into SURFACES_WITH_SHELL_ONLY_PANEL across the contract/smoke
// tests, so the card-level `[data-pcc-active-surface-panel="project-home"]`
// compatibility marker is no longer rendered (the shell `<main>` carries
// the marker on its own).
// Phase 06 Prompt 04 — REQUIRED_CARD_TITLES is the canonical 12-card
// fixture order: the Prompt 02 nine-card operational spine with three
// preview analytics cards interleaved (Action Exposure Mix +
// Project Health Trend after Document Control Center;
// Readiness / Approval Rollup between Approvals & Checkpoints and
// Missing Configurations).
const REQUIRED_CARD_TITLES = [
  'Priority Actions',
  'Site Health Summary',
  'Document Control Center',
  'Action Exposure Mix',
  'Project Health Trend',
  'Project Readiness',
  'Approvals & Checkpoints',
  'Readiness / Approval Rollup',
  'Missing Configurations',
  'External Platforms',
  'Team Snapshot',
  'Recent Activity',
] as const;

// Wave 99 / Prompt 05B — unified lifecycle cards are appended to the
// read-model-driven path only. `<PccApp forceMode="desktop" />`
// without a `readModelClient` renders the fixture-only fallback (9
// cards); to render the read-model-driven path, supply a fixture
// client via `readModelClient={createPccFixtureReadModelClient()}`.
const UNIFIED_LIFECYCLE_CARD_TITLES = [
  'Lifecycle Timeline',
  'Project Memory',
  'Project Lens',
  'Related Records',
] as const;

// Wave 99 / Prompt 06C — Ask HBI is integrated as one additional card on
// the read-model-driven path only. Fixture-only path stays at the
// REQUIRED_CARD_TITLES baseline.
const ASK_HBI_CARD_TITLES = ['Ask HBI — Grounded Project Answers'] as const;

// Wave 13 / Prompt 13E — Procore snapshot card is integrated as one
// additional card on the read-model-driven path only. The fixture-only
// path is unaffected and stays at the REQUIRED_CARD_TITLES baseline.
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

  it('renders all required Project Home card titles inside the active panel', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    // Card-scoped title check: query each card's heading slot rather
    // than scanning grid.textContent, so phrases like "Project Memory"
    // or "Project Lens" appearing inside body copy elsewhere never
    // satisfy a card-title assertion (per
    // feedback_per_lane_marker_assertions /
    // feedback_per_component_marker_scoping).
    const headingTexts = Array.from(
      grid!.querySelectorAll<HTMLElement>('[data-pcc-card] :is(h2,h3,h4)'),
    ).map((el) => el.textContent?.trim() ?? '');
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

  it('promotes Priority Actions to the first bento card as Tier 2 operational and renders no in-grid project-home compatibility marker (Wave 15A wave-b9 Prompt 4B-01)', () => {
    // Prompt 4B-01 removed `PccProjectIntelligenceCard` — Project Home
    // moved to SURFACES_WITH_SHELL_ONLY_PANEL across the contract/smoke
    // tests. The shell `<main>` continues to carry the
    // `data-pcc-active-surface-panel="project-home"` marker on its own;
    // no in-grid card is required.
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const directCards = Array.from(grid!.children).filter(
      (child): child is HTMLElement =>
        child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
    );
    expect(directCards.length).toBeGreaterThan(0);

    // Priority Actions is now first.
    const firstCard = directCards[0]!;
    const firstHeading = firstCard.querySelector('h2,h3,h4')?.textContent?.trim();
    expect(firstHeading).toBe('Priority Actions');
    expect(firstCard.getAttribute('data-pcc-footprint')).toBe('wide');
    expect(firstCard.getAttribute('data-pcc-card-hierarchy')).toBe('standard');
    expect(firstCard.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(firstCard.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(firstCard.hasAttribute('data-pcc-active-surface-panel')).toBe(false);

    // Project Intelligence is gone from both render paths.
    expect(grid!.textContent ?? '').not.toContain('Project Intelligence');

    // Shell <main> remains the sole carrier of the project-home marker;
    // the bento grid contains zero direct-child compatibility cards.
    const inGridCompat = grid!.querySelectorAll(
      '[data-pcc-card][data-pcc-active-surface-panel="project-home"]',
    );
    expect(inGridCompat).toHaveLength(0);

    const shellMain = container.querySelector(
      'main[role="tabpanel"][data-pcc-active-surface-panel="project-home"]',
    );
    expect(shellMain).not.toBeNull();
  });

  // Replacement coverage for the deprecated Project Intelligence command-summary
  // row (Wave 15A wave-b9 Prompt 4B-01): the operational counts that used to
  // render in a single summary row now live in their dedicated cards. This
  // assertion proves those operational destinations are still mounted as
  // headed cards on Project Home so the removal cannot silently regress.
  it('renders Priority Actions, Approvals & Checkpoints, and Missing Configurations as headed cards (operational destinations for the deprecated Intelligence command-summary row)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const headingTexts = Array.from(
      grid!.querySelectorAll<HTMLElement>('[data-pcc-card] :is(h2,h3,h4)'),
    ).map((el) => el.textContent?.trim() ?? '');
    expect(headingTexts).toContain('Priority Actions');
    expect(headingTexts).toContain('Approvals & Checkpoints');
    expect(headingTexts).toContain('Missing Configurations');
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

  it('Priority Actions card renders the Wave 5 four-group rail in canonical order after the local toggle is expanded', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rails = container.querySelectorAll('[data-pcc-priority-rail]');
    expect(rails).toHaveLength(1);
    const rail = rails[0] as HTMLElement;
    // Wave 15A wave-b6 Prompt 03 — group order is an expanded-mode invariant.
    const toggle = rail.querySelector<HTMLButtonElement>('[data-pcc-priority-rail-toggle]');
    expect(toggle, 'compact rail must expose the local display-only toggle').not.toBeNull();
    fireEvent.click(toggle!);
    const lanes = rail.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-group]');
    const ids = Array.from(lanes).map((el) => el.getAttribute('data-pcc-priority-rail-group'));
    expect(ids).toEqual([...PCC_PRIORITY_RAIL_GROUP_IDS]);
  });

  it('Priority Actions rail compact default renders <= PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS visible rows with valid tones', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rail = container.querySelector('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    const rows = rail!.querySelectorAll<HTMLElement>('[data-pcc-priority-rail-action-id]');
    expect(rows.length).toBeLessThanOrEqual(PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS);
    expect(rows.length).toBeGreaterThan(0);
    const tones = new Set<PccPriorityTone>();
    for (const row of Array.from(rows)) {
      const tone = row.getAttribute('data-pcc-priority-rail-action-tone') as PccPriorityTone | null;
      expect(tone).not.toBeNull();
      expect(['high', 'medium', 'low']).toContain(tone!);
      tones.add(tone!);
    }
    expect(tones.size).toBeGreaterThan(0);
    // Compact mode is flat — no group sections render until the toggle is clicked.
    expect(rail!.querySelectorAll('[data-pcc-priority-rail-group]')).toHaveLength(0);
    expect(rail!.querySelector('[data-pcc-priority-rail-overflow-summary]')).not.toBeNull();
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

  it('Priority Actions rail renders no row-level executing affordances; the only button is the local display-only toggle', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const rail = container.querySelector<HTMLElement>('[data-pcc-priority-rail]');
    expect(rail).not.toBeNull();
    expect(rail!.querySelectorAll('a')).toHaveLength(0);
    expect(rail!.querySelectorAll('[href]')).toHaveLength(0);
    const buttons = rail!.querySelectorAll<HTMLButtonElement>('button');
    expect(buttons).toHaveLength(1);
    expect(buttons[0].getAttribute('data-pcc-priority-rail-toggle')).not.toBeNull();
    const affordances = rail!.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-disabled-action]',
    );
    expect(affordances.length).toBe(PCC_PRIORITY_RAIL_COMPACT_MAX_VISIBLE_ITEMS);
    for (const el of Array.from(affordances)) {
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Source-owned · act in owning module');
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

  // ── External Platforms ───────────────────────────────────────────────

  it('External Platforms card renders SAMPLE_EXTERNAL_SYSTEM_LINKS.length rows with no anchor elements', () => {
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

  // ── Wave 15A wave-b6 Prompt 04 — core operational cluster order ──────

  // Wave 15A wave-b6 Prompt 05 — Lifecycle / HBI promotion on the read-model path.
  it('read-model path promotes Lifecycle Timeline and Ask HBI above Procore/reference and keeps lower-detail lifecycle cards at the tail', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );

    await waitFor(() => {
      const grid = container.querySelector('[data-pcc-bento-grid]');
      expect(grid).not.toBeNull();
      const titles = Array.from(grid!.children)
        .filter(
          (child): child is HTMLElement =>
            child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
        )
        .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '(untitled)');
      // Phase 06 Prompt 04 — read-model path renders 18 cards: 12
      // spine+analytics (9 operational + 3 preview analytics) + 4
      // unified-lifecycle + 1 Ask HBI + 1 Procore snapshot.
      expect(titles).toHaveLength(18);
      const idx = (t: string): number => {
        const i = titles.indexOf(t);
        expect(i, `card '${t}' should appear`).toBeGreaterThanOrEqual(0);
        return i;
      };
      // Phase 06 Prompt 02 — operational spine renders first; lifecycle
      // section follows below the spine.
      expect(idx('External Platforms')).toBeLessThan(idx('Lifecycle Timeline'));
      expect(idx('Team Snapshot')).toBeLessThan(idx('Lifecycle Timeline'));
      expect(idx('Recent Activity')).toBeLessThan(idx('Lifecycle Timeline'));
      // Lifecycle Timeline is rendered above Procore + Ask HBI inside the
      // unified-lifecycle section's renderAfterTimeline slot.
      expect(idx('Lifecycle Timeline')).toBeLessThan(idx('Ask HBI — Grounded Project Answers'));
      expect(idx('Lifecycle Timeline')).toBeLessThan(idx('Procore snapshot'));
      // Ask HBI sits inside renderAfterTimeline (above Procore snapshot).
      expect(idx('Ask HBI — Grounded Project Answers')).toBeLessThan(idx('Procore snapshot'));
      // Lower-detail lifecycle cards remain at the tail (after Procore
      // snapshot, which is the last node inside renderAfterTimeline).
      expect(idx('Project Memory')).toBeGreaterThan(idx('Procore snapshot'));
      expect(idx('Project Lens')).toBeGreaterThan(idx('Procore snapshot'));
      expect(idx('Related Records')).toBeGreaterThan(idx('Procore snapshot'));
    });

    // Bento direct-child invariant. After Wave 15A wave-b9 Prompt 4B-01 the
    // grid carries zero `[data-pcc-active-surface-panel="project-home"]`
    // cards; the shell `<main>` is the sole semantic carrier of the
    // marker.
    const grid = container.querySelector('[data-pcc-bento-grid]')!;
    for (const card of Array.from(grid.querySelectorAll('[data-pcc-card]'))) {
      expect(card.parentElement === grid).toBe(true);
    }
    const panels = grid.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(0);
    expect(grid.textContent ?? '').not.toContain('Project Intelligence');

    // Promoted lifecycle/HBI children must NOT register routing/tab/workspace
    // ownership: scope the no-marker check to the routing taxonomy.
    expect(grid.querySelectorAll('[data-pcc-tab-id]')).toHaveLength(0);
    expect(grid.querySelectorAll('[data-pcc-surface-active]')).toHaveLength(0);
    expect(grid.querySelectorAll('[data-pcc-workspace]')).toHaveLength(0);

    // Ask HBI remains idle on mount: panel state attribute is "idle" and no
    // unified-search answer rows render before a sample-query click.
    const askHbiPanel = grid.querySelector('[data-pcc-ask-hbi-panel]');
    expect(askHbiPanel, 'Ask HBI panel marker should render').not.toBeNull();
    expect(askHbiPanel!.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('idle');
    expect(grid.querySelectorAll('[data-pcc-unified-search-answer-id]')).toHaveLength(0);

    // No http(s) anchors anywhere in the bento grid.
    for (const a of Array.from(grid.querySelectorAll('a[href]'))) {
      expect(a.getAttribute('href') ?? '').not.toMatch(/^https?:\/\//);
    }
  });

  // ── Wave 15A wave-b6 Prompt 06 — content / source / HBI authority ────

  it('Priority Actions rail row affordance is "Source-owned · act in owning module" and remains a non-interactive span', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const affordances = container.querySelectorAll<HTMLElement>(
      '[data-pcc-priority-rail-disabled-action]',
    );
    expect(affordances.length).toBeGreaterThan(0);
    for (const el of Array.from(affordances)) {
      expect(el.tagName).toBe('SPAN');
      expect(el.textContent).toBe('Source-owned · act in owning module');
    }
  });

  it('Document Control Microsoft-lane disabled actions link to a visible source-boundary reason via aria-describedby', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const microsoftLane = container.querySelector('[data-pcc-doc-lane="microsoft-files"]');
    expect(microsoftLane).not.toBeNull();
    const reasons = microsoftLane!.querySelectorAll<HTMLElement>('[data-pcc-doc-action-reason]');
    expect(reasons.length).toBeGreaterThan(0);
    for (const r of Array.from(reasons)) {
      const txt = r.textContent ?? '';
      expect(txt).toContain('Preview only');
      expect(txt).toContain('Microsoft/SharePoint');
      expect(txt).toContain('source posture');
    }
    const buttons = microsoftLane!.querySelectorAll<HTMLButtonElement>('[data-pcc-doc-action]');
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of Array.from(buttons)) {
      expect(btn.disabled).toBe(true);
      expect(btn.getAttribute('aria-disabled')).toBe('true');
      expect(btn.getAttribute('href')).toBeNull();
      expect(btn.getAttribute('onclick')).toBeNull();
      const describedBy = btn.getAttribute('aria-describedby');
      expect(describedBy, 'disabled action button must link to a reason node').not.toBeNull();
      expect(microsoftLane!.querySelector(`#${CSS.escape(describedBy!)}`)).not.toBeNull();
    }
  });

  it('Document Control external-lane launch cue is bounded "Visibility only — open source systems outside PCC."', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const externalLane = container.querySelector('[data-pcc-doc-lane="external-document-systems"]');
    expect(externalLane).not.toBeNull();
    const cues = externalLane!.querySelectorAll<HTMLElement>('[data-pcc-doc-launch-cue]');
    expect(cues.length).toBeGreaterThan(0);
    for (const cue of Array.from(cues)) {
      expect(cue.textContent).toContain('Visibility only');
      expect(cue.textContent).toContain('outside PCC');
    }
    expect(externalLane!.querySelectorAll('[data-pcc-doc-action]')).toHaveLength(0);
    expect(externalLane!.querySelectorAll('a[href]')).toHaveLength(0);
  });

  it('Procore snapshot card renders the source-boundary line on the read-model path', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await waitFor(() => {
      const boundary = container.querySelector('[data-pcc-procore-source-boundary]');
      expect(boundary).not.toBeNull();
      expect(boundary!.textContent).toContain('Procore remains the system of record');
      expect(boundary!.textContent).toContain('no PCC writeback');
      expect(boundary!.querySelectorAll('a')).toHaveLength(0);
      expect(boundary!.querySelectorAll('button')).toHaveLength(0);
    });
  });

  it('External Platforms card renders the bounded source-boundary line', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const boundary = container.querySelector('[data-pcc-external-source-boundary]');
    expect(boundary).not.toBeNull();
    expect(boundary!.textContent).toContain('Reference only');
    expect(boundary!.textContent).toContain('source-system actions');
    expect(boundary!.textContent).toContain('outside Project Home');
  });

  it('Missing Configurations rows render an owner/next-step cue per row', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const cues = container.querySelectorAll<HTMLElement>('[data-pcc-missing-config-next-step]');
    expect(cues.length).toBe(SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.length);
    for (const cue of Array.from(cues)) {
      expect(cue.tagName).toBe('SPAN');
      expect(cue.textContent).toContain('Next step:');
      expect(cue.textContent).toContain('source configuration workflow');
    }
  });

  it('Project Home grid text does not assert any autonomous HBI/AI mutation authority', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-bento-grid]')).not.toBeNull();
    });
    const FORBIDDEN_HBI_MUTATION_CLAIM =
      /\b(?:hbi|ai)\b(?![^.\n]*(?:not|no|does not|cannot|is not authorized to))[^.\n]*(?:approves?|submits?|syncs?|writes? back|creates?|deletes?|modifies?|completes?)/i;
    const gridText = container.querySelector('[data-pcc-bento-grid]')!.textContent ?? '';
    expect(gridText).not.toMatch(FORBIDDEN_HBI_MUTATION_CLAIM);
  });

  it('Project Home fixture path orders the core operational cluster before state/deferred/reference cards', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const titles = Array.from(grid!.children)
      .filter(
        (child): child is HTMLElement =>
          child instanceof HTMLElement && child.hasAttribute('data-pcc-card'),
      )
      .map((card) => card.querySelector('h2,h3,h4')?.textContent?.trim() ?? '(untitled)');
    const idx = (t: string): number => {
      const i = titles.indexOf(t);
      expect(i, `card '${t}' should appear`).toBeGreaterThanOrEqual(0);
      return i;
    };
    // Phase 06 Prompt 02 — canonical operational spine order:
    // Priority Actions → Site Health Summary → Document Control Center →
    // Project Readiness → Approvals & Checkpoints → Missing Configurations
    // → External Platforms.
    expect(idx('Site Health Summary')).toBeLessThan(idx('Document Control Center'));
    expect(idx('Document Control Center')).toBeLessThan(idx('Project Readiness'));
    expect(idx('Project Readiness')).toBeLessThan(idx('Approvals & Checkpoints'));
    expect(idx('Approvals & Checkpoints')).toBeLessThan(idx('Missing Configurations'));
    expect(idx('Missing Configurations')).toBeLessThan(idx('External Platforms'));
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
  // 9 cards after Wave 15A wave-b9 Prompt 4B-01 removed Project
  // Intelligence) and read-model-driven (readModelClient supplied,
  // 9 existing cards + 4 unified-lifecycle cards + Ask HBI + Procore =
  // 15 cards). Each test below names which path it exercises and asserts
  // the path-specific cardinality / content invariants.

  it('fixture-only fallback (no readModelClient) renders the Phase 06 Prompt 04 12-card baseline (9 operational + 3 analytics) and no unified-lifecycle titles', () => {
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
      'fixture-only fallback must render exactly REQUIRED_CARD_TITLES.length cards (no unified-lifecycle section)',
    ).toBe(REQUIRED_CARD_TITLES.length);
    for (const card of cards) {
      expect(card.parentElement === grid).toBe(true);
    }
    const headingTexts = Array.from(
      grid!.querySelectorAll<HTMLElement>('[data-pcc-card] :is(h2,h3,h4)'),
    ).map((el) => el.textContent?.trim() ?? '');
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

  it('read-model-driven path renders 18 cards (12 Phase 06 Prompt 04 spine+analytics + 4 unified lifecycle + 1 Ask HBI + 1 Procore snapshot) and exposes each unified-lifecycle body marker as a direct child of the bento grid', async () => {
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
    const headingTexts = Array.from(
      grid!.querySelectorAll<HTMLElement>('[data-pcc-card] :is(h2,h3,h4)'),
    ).map((el) => el.textContent?.trim() ?? '');
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
    expect(card!.getAttribute('data-pcc-footprint')).toBe('detail');
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
