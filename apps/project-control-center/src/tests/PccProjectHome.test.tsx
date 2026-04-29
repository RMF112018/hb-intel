import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import {
  DOCUMENT_CONTROL_SOURCE_IDS,
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
import { TEAM_SNAPSHOT_PLACEHOLDER } from '../surfaces/projectHome/teamSnapshotPlaceholder';
import {
  PCC_CARD_STATES,
  priorityToneForAction,
  type PccPriorityTone,
} from '../surfaces/projectHome/shared';

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

const READINESS_MODULES = new Set(['startup-tasks', 'permits', 'required-inspections']);

describe('Project Home bento dashboard', () => {
  it('renders all 10 required Project Home card titles inside the active panel', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const visible = grid!.textContent ?? '';
    for (const title of REQUIRED_CARD_TITLES) {
      expect(visible, `card title '${title}' should render`).toContain(title);
    }
  });

  it('every Project Home card emits a non-empty data-pcc-footprint and is a direct child of the bento grid', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBe(REQUIRED_CARD_TITLES.length);
    for (const card of cards) {
      expect(card.parentElement === grid, 'card must be a direct child of the bento grid').toBe(true);
      const footprint = card.getAttribute('data-pcc-footprint');
      expect(footprint, 'card must emit data-pcc-footprint').not.toBeNull();
      expect(footprint!.length).toBeGreaterThan(0);
      const span = Number(card.getAttribute('data-pcc-column-span'));
      expect(span).toBeGreaterThan(0);
    }
  });

  it('exactly one [data-pcc-active-surface-panel] exists with value "project-home", carried by the Project Intelligence card', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
    expect(panels[0].textContent).toContain('Project Intelligence Header');
  });

  it('the bento grid does not use grid-auto-flow: dense', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const grid = container.querySelector('[data-pcc-bento-grid]') as HTMLElement;
    expect(grid).not.toBeNull();
    expect(grid.style.gridAutoFlow ?? '').not.toContain('dense');
  });

  it('renders no anchor elements with live launch URLs (no http/https hrefs anywhere on Project Home)', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const anchors = container.querySelectorAll('a[href]');
    for (const a of anchors) {
      const href = a.getAttribute('href') ?? '';
      expect(href, `anchor href '${href}' must not be a live launch URL`).not.toMatch(/^https?:\/\//);
    }
  });

  // ── Priority Actions ─────────────────────────────────────────────────

  it('Priority Actions card renders SAMPLE_PRIORITY_ACTIONS.length rows, each with data-pcc-priority-tone', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const rows = container.querySelectorAll('[data-pcc-priority-action-id]');
    expect(rows).toHaveLength(SAMPLE_PRIORITY_ACTIONS.length);
    const tones = new Set<PccPriorityTone>();
    for (const row of rows) {
      const tone = row.getAttribute('data-pcc-priority-tone') as PccPriorityTone | null;
      expect(tone).not.toBeNull();
      expect(['high', 'medium', 'low']).toContain(tone!);
      tones.add(tone!);
    }
    expect(tones.size).toBeGreaterThan(0);
  });

  it('priorityToneForAction maps every SiteHealthSeverity (and undefined) to the correct tone', () => {
    const cases: ReadonlyArray<{ severity: SiteHealthSeverity | undefined; tone: PccPriorityTone }> = [
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const body = container.querySelector('[data-pcc-document-control-body]');
    expect(body).not.toBeNull();

    const actionEls = body!.querySelectorAll('[data-pcc-doc-action]');
    expect(actionEls.length, 'at least one Microsoft-lane action chip should render').toBeGreaterThan(0);
    for (const el of actionEls) {
      expect(el.tagName).toBe('BUTTON');
      const button = el as HTMLButtonElement;
      expect(button.disabled, `action chip ${button.getAttribute('data-pcc-doc-action')} must be disabled`).toBe(true);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const expected = SAMPLE_WORKFLOW_ITEMS.filter((i) => READINESS_MODULES.has(i.moduleId));
    const rows = container.querySelectorAll('[data-pcc-readiness-item-id]');
    expect(rows).toHaveLength(expected.length);
  });

  // ── Approvals & Checkpoints ──────────────────────────────────────────

  it('Approvals & Checkpoints card renders SAMPLE_APPROVAL_CHECKPOINTS.length rows', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const rows = container.querySelectorAll('[data-pcc-approval-checkpoint-id]');
    expect(rows).toHaveLength(SAMPLE_APPROVAL_CHECKPOINTS.length);
    for (const row of rows) {
      const state = row.getAttribute('data-pcc-approval-state');
      expect(['pending', 'approved', 'rejected', 'waived']).toContain(state);
    }
  });

  // ── External Systems ─────────────────────────────────────────────────

  it('External Systems card renders SAMPLE_EXTERNAL_SYSTEM_LINKS.length rows with no anchor elements', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const body = container.querySelector('[data-pcc-external-systems-body]');
    expect(body).not.toBeNull();
    const rows = body!.querySelectorAll('[data-pcc-external-system-id]');
    expect(rows).toHaveLength(SAMPLE_EXTERNAL_SYSTEM_LINKS.length);
    expect(body!.querySelectorAll('a').length).toBe(0);
  });

  // ── Team Snapshot ────────────────────────────────────────────────────

  it('Team Snapshot card renders TEAM_SNAPSHOT_PLACEHOLDER.length entries; every visible label carries the (preview) suffix', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const entries = container.querySelectorAll('[data-pcc-team-entry-persona]');
    expect(entries).toHaveLength(TEAM_SNAPSHOT_PLACEHOLDER.length);
    for (const entry of entries) {
      expect(entry.textContent).toContain('(preview)');
    }
  });

  // ── Missing Configurations ───────────────────────────────────────────

  it('Missing Configurations card renders SAMPLE_EXTERNAL_SYSTEM_MISSING_CONFIGS.length rows with system + message', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const rows = container.querySelectorAll('[data-pcc-activity-event-id]');
    expect(rows).toHaveLength(SAMPLE_BUSINESS_AUDIT_EVENTS.length);
  });

  // ── Project Intelligence ─────────────────────────────────────────────

  it('Project Intelligence card displays SAMPLE_PROJECT_PROFILE fields', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const body = container.querySelector('[data-pcc-project-intelligence-body]');
    expect(body).not.toBeNull();
    expect(body!.textContent).toContain(SAMPLE_PROJECT_PROFILE.projectName);
    expect(body!.textContent).toContain(SAMPLE_PROJECT_PROFILE.projectNumber);
  });

  // ── Card-state contract sanity ───────────────────────────────────────

  it('PCC_CARD_STATES exposes preview / empty / missing-config / unavailable-fixture / error', () => {
    expect(PCC_CARD_STATES).toEqual([
      'preview',
      'empty',
      'missing-config',
      'unavailable-fixture',
      'error',
    ]);
  });
});
