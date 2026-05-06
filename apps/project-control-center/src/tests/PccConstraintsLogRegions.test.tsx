import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  SAMPLE_CONSTRAINTS_LOG_READ_MODEL,
  type PccConstraintsLogReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccConstraintsLogRegions } from '../surfaces/constraintsLog/PccConstraintsLogRegions';
import { buildPccConstraintsLogViewModel } from '../surfaces/constraintsLog/constraintsLogAdapter';
import type {
  IPccConstraintsLogReadModelClient,
  IPccConstraintsLogViewModel,
} from '../surfaces/constraintsLog/constraintsLogViewModel';

const SECTION_MARKER = 'constraints-log';

const REQUIRED_LANES: readonly string[] = [
  'command-center',
  'make-ready-board',
  'risk-matrix',
  'constraint-exposure-matrix',
  'log-table',
  'detail-panel',
  'weekly-huddle',
  'root-cause-lessons-learned',
  'executive-exposure-summary',
];

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-tab-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function clLane(container: HTMLElement, lane: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-cl-lane="${lane}"]`);
}

function projectId(): PccProjectId {
  return 'p-w12-cl-regions' as PccProjectId;
}

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccConstraintsLogReadModel,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccConstraintsLogReadModel> {
  return {
    projectId: projectId(),
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    viewerPersona,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

function makeClient(
  env: PccReadModelEnvelope<PccConstraintsLogReadModel>,
): IPccConstraintsLogReadModelClient {
  return {
    getConstraintsLog: async () => env,
  };
}

function renderRegions(vm: IPccConstraintsLogViewModel): HTMLElement {
  const { container } = render(
    <PccBentoGrid forceMode="desktop">
      <Fragment>
        <PccConstraintsLogRegions viewModel={vm} />
      </Fragment>
    </PccBentoGrid>,
  );
  return container;
}

// ---------------------------------------------------------------------------
// Default surface render path (fixture-only — no client supplied)
// ---------------------------------------------------------------------------

describe('Wave 12 Constraints Log — bento direct-child invariant', () => {
  it('every Constraints Log lane marker resolves to a card whose parent is the bento grid', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBeGreaterThanOrEqual(REQUIRED_LANES.length);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });
});

describe('Wave 12 Constraints Log — required lanes', () => {
  it('renders every required lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    for (const lane of REQUIRED_LANES) {
      expect(clLane(container, lane), `missing lane ${lane}`).not.toBeNull();
    }
  });

  it('emits exactly nine constraints-log section markers (one per lane)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBe(REQUIRED_LANES.length);
  });
});

describe('Wave 12 Constraints Log — read-only structural posture', () => {
  it('the constraints log region group contains no anchors, forms, or file inputs', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBeGreaterThanOrEqual(1);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.querySelector('a[href]')).toBeNull();
      expect(card!.querySelector('form')).toBeNull();
      expect(card!.querySelector('input[type="file"]')).toBeNull();
    }
  });

  it('the only enabled buttons in the constraints log region group are local-selection log-row buttons', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      const buttons = card!.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        const isSelect = btn.hasAttribute('data-pcc-cl-log-select');
        expect(
          (btn as HTMLButtonElement).disabled || isSelect,
          `enabled button must be a local-selection log-row button: ${btn.outerHTML.slice(0, 80)}`,
        ).toBe(true);
      }
    }
  });

  it('the legal/claim/delay boundary marker appears on the root-cause and executive lanes (and on the default detail entry)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const rootCause = clLane(container, 'root-cause-lessons-learned');
    const executive = clLane(container, 'executive-exposure-summary');
    const detail = clLane(container, 'detail-panel');
    expect(rootCause).not.toBeNull();
    expect(executive).not.toBeNull();
    expect(detail).not.toBeNull();
    expect(rootCause!.querySelector('[data-pcc-cl-boundary="legal-claim-delay"]')).not.toBeNull();
    expect(executive!.querySelector('[data-pcc-cl-boundary="legal-claim-delay"]')).not.toBeNull();
    expect(detail!.querySelector('[data-pcc-cl-boundary="legal-claim-delay"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Local-only detail-panel selection
// ---------------------------------------------------------------------------

describe('Wave 12 Constraints Log — local detail-panel selection', () => {
  it('clicking a log-table row updates the detail-panel lane to the selected entry', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);

    // Default detail entry is the first risk (risk-w12-001).
    const detailLane = clLane(container, 'detail-panel');
    expect(detailLane).not.toBeNull();
    expect(detailLane!.querySelector('[data-pcc-cl-detail-entry="risk-w12-001"]')).not.toBeNull();

    // Click the awaiting-external-party constraint row in the log table.
    const targetButton = container.querySelector('[data-pcc-cl-log-select="constraint-w12-005"]');
    expect(targetButton).not.toBeNull();
    fireEvent.click(targetButton!);

    const detailLaneAfter = clLane(container, 'detail-panel');
    expect(detailLaneAfter).not.toBeNull();
    expect(
      detailLaneAfter!.querySelector('[data-pcc-cl-detail-entry="constraint-w12-005"]'),
    ).not.toBeNull();
    // The previously rendered default entry is no longer in the detail lane.
    expect(detailLaneAfter!.querySelector('[data-pcc-cl-detail-entry="risk-w12-001"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Adapter-driven render branches (envelope sourceStatus variants)
// ---------------------------------------------------------------------------

describe('Wave 12 Constraints Log — envelope sourceStatus branches', () => {
  it('renders all nine lanes with available envelope', () => {
    const vm = buildPccConstraintsLogViewModel(
      envelope('available', SAMPLE_CONSTRAINTS_LOG_READ_MODEL),
    );
    const container = renderRegions(vm);
    for (const lane of REQUIRED_LANES) {
      expect(clLane(container, lane), `missing lane ${lane}`).not.toBeNull();
    }
  });

  it('renders all nine lanes with source-unavailable envelope', () => {
    const vm = buildPccConstraintsLogViewModel(
      envelope('source-unavailable', SAMPLE_CONSTRAINTS_LOG_READ_MODEL),
    );
    const container = renderRegions(vm);
    for (const lane of REQUIRED_LANES) {
      expect(clLane(container, lane), `missing lane ${lane}`).not.toBeNull();
    }
  });

  it('renders all nine lanes with backend-unavailable envelope', () => {
    const vm = buildPccConstraintsLogViewModel(
      envelope('backend-unavailable', SAMPLE_CONSTRAINTS_LOG_READ_MODEL),
    );
    const container = renderRegions(vm);
    for (const lane of REQUIRED_LANES) {
      expect(clLane(container, lane), `missing lane ${lane}`).not.toBeNull();
    }
  });
});

describe('Wave 12 Constraints Log — loading and error single-card branches', () => {
  it('loading view-model renders a single full-width card with a command-center marker', () => {
    const container = renderRegions({ status: 'loading' });
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBe(1);
    expect(markers[0].getAttribute('data-pcc-cl-lane')).toBe('command-center');
  });

  it('error view-model renders a single full-width card with a command-center marker', () => {
    const container = renderRegions({ status: 'error' });
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBe(1);
    expect(markers[0].getAttribute('data-pcc-cl-lane')).toBe('command-center');
  });
});

describe('Wave 12 Constraints Log — narrow client wired through adapter', () => {
  it('client returning the fixture envelope drives the regions through the adapter', async () => {
    const client = makeClient(envelope('available', SAMPLE_CONSTRAINTS_LOG_READ_MODEL));
    const env = await client.getConstraintsLog(projectId());
    const vm = buildPccConstraintsLogViewModel(env);
    expect(vm.status).toBe('ready');
  });
});

// ---------------------------------------------------------------------------
// Wave 12 Prompt 06 — boundary notices, integration posture, per-seam labels
// ---------------------------------------------------------------------------

const REQUIRED_BOUNDARY_KEYS: readonly string[] = [
  'delay-exposure',
  'change-exposure',
  'evidence-link',
  'approval-checkpoint',
];

const REQUIRED_INTEGRATION_TARGETS: readonly string[] = [
  'project-readiness',
  'priority-actions',
  'lifecycle-readiness',
  'permit-inspection',
  'responsibility-matrix',
  'approvals-checkpoints',
  'document-control',
  'scheduler-look-ahead',
  'external-systems',
  'team-access',
];

describe('Wave 12 Constraints Log — boundary notices in command center', () => {
  it('renders one boundary-notice marker per canonical key inside the command-center lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const lane = clLane(container, 'command-center');
    expect(lane).not.toBeNull();
    for (const key of REQUIRED_BOUNDARY_KEYS) {
      const notice = lane!.querySelector(`[data-pcc-cl-boundary-notice="${key}"]`);
      expect(notice, `missing boundary notice ${key}`).not.toBeNull();
      const text = notice!.textContent ?? '';
      expect(text.toLowerCase()).toContain('not enabled here');
    }
  });

  it('boundary notices live within the command-center boundary-notices region', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = container.querySelector(
      '[data-pcc-cl-region="command-center-boundary-notices"]',
    );
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('[data-pcc-cl-boundary-notice]').length).toBe(
      REQUIRED_BOUNDARY_KEYS.length,
    );
  });
});

describe('Wave 12 Constraints Log — integration posture in command center', () => {
  it('renders one integration-posture marker per canonical target in the command-center lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const lane = clLane(container, 'command-center');
    expect(lane).not.toBeNull();
    for (const targetId of REQUIRED_INTEGRATION_TARGETS) {
      const row = lane!.querySelector(`[data-pcc-cl-integration-posture="${targetId}"]`);
      expect(row, `missing integration posture row ${targetId}`).not.toBeNull();
      expect(row!.textContent?.toLowerCase()).toContain('reference only');
    }
  });

  it('integration posture rows are inert (no anchors, no buttons, no inputs)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = container.querySelector(
      '[data-pcc-cl-region="command-center-integration-posture"]',
    );
    expect(region).not.toBeNull();
    expect(region!.querySelector('a')).toBeNull();
    expect(region!.querySelector('button')).toBeNull();
    expect(region!.querySelector('input')).toBeNull();
    expect(region!.querySelector('form')).toBeNull();
  });
});

describe('Wave 12 Constraints Log — per-seam reference-only labels in detail panel', () => {
  // Map each fixture-populated seam kind to a row id in the log table whose
  // detail entry surfaces that kind. The fixture does not populate
  // `scheduler-look-ahead` or `team-access-role`, so those kinds are not
  // asserted here.
  const KIND_TO_ROW_ID: ReadonlyArray<readonly [string, string]> = [
    ['document-control-evidence', 'risk-w12-001'],
    ['project-readiness-source-module', 'risk-w12-001'],
    ['permit-inspection', 'risk-w12-002'],
    ['external-system-launcher', 'risk-w12-002'],
    ['priority-actions-candidate', 'risk-w12-003'],
    ['responsibility-role', 'risk-w12-003'],
    ['approval-checkpoint', 'risk-w12-004'],
    ['lifecycle-readiness-gate', 'risk-w12-004'],
    ['converted-to-constraint', 'risk-w12-006'],
    ['external-party-reference', 'constraint-w12-005'],
  ];

  it('each fixture-populated seam kind renders a data-pcc-cl-detail-seam-kind marker with a reference-only label', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);

    for (const [kind, rowId] of KIND_TO_ROW_ID) {
      const selectButton = container.querySelector(`[data-pcc-cl-log-select="${rowId}"]`);
      expect(selectButton, `missing log row for ${rowId}`).not.toBeNull();
      fireEvent.click(selectButton!);

      const detailLane = clLane(container, 'detail-panel');
      expect(detailLane, `missing detail-panel lane after selecting ${rowId}`).not.toBeNull();

      const seamRow = detailLane!.querySelector(`[data-pcc-cl-detail-seam-kind="${kind}"]`);
      expect(seamRow, `missing seam kind ${kind} on detail entry ${rowId}`).not.toBeNull();

      const refOnlyLabel = seamRow!.querySelector(
        `[data-pcc-cl-detail-seam-reference-only="${kind}"]`,
      );
      expect(refOnlyLabel, `missing reference-only label for ${kind}`).not.toBeNull();
      expect(refOnlyLabel!.textContent?.toLowerCase()).toContain('reference only');
    }
  });
});

// ---------------------------------------------------------------------------
// No-runtime import-specifier scan (mirrors Wave 11 implementation)
// ---------------------------------------------------------------------------

const CL_SOURCE_FILES = [
  '../surfaces/constraintsLog/PccConstraintsLogRegions.tsx',
  '../surfaces/constraintsLog/constraintsLogAdapter.ts',
  '../surfaces/constraintsLog/constraintsLogViewModel.ts',
  '../surfaces/constraintsLog/useConstraintsLogReadModel.ts',
];

const FORBIDDEN_IMPORT_PREFIXES: readonly string[] = [
  '@microsoft/sp-',
  '@pnp/',
  '@microsoft/microsoft-graph',
  'axios',
  'fetch-',
  'node-fetch',
];

function stripCommentsOnly(src: string): string {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const ch = src[i];
    const next = src[i + 1];
    if (ch === '/' && next === '/') {
      while (i < src.length && src[i] !== '\n') i += 1;
      continue;
    }
    if (ch === '/' && next === '*') {
      i += 2;
      while (i < src.length && !(src[i] === '*' && src[i + 1] === '/')) i += 1;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      const quote = ch;
      out += ch;
      i += 1;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === '\\') {
          out += src[i];
          out += src[i + 1] ?? '';
          i += 2;
          continue;
        }
        out += src[i];
        i += 1;
      }
      if (i < src.length) {
        out += src[i];
        i += 1;
      }
      continue;
    }
    out += ch;
    i += 1;
  }
  return out;
}

const STATIC_FROM_RE = /\bfrom\s*['"]([^'"]+)['"]/g;
const SIDE_EFFECT_IMPORT_RE = /(^|[\n;])\s*import\s*['"]([^'"]+)['"]\s*;?/g;
const DYNAMIC_IMPORT_RE = /\bimport\s*\(\s*['"]([^'"]+)['"]\s*\)/g;

function extractImportSpecifiers(src: string): readonly string[] {
  const text = stripCommentsOnly(src);
  const out = new Set<string>();
  let m: RegExpExecArray | null;
  STATIC_FROM_RE.lastIndex = 0;
  while ((m = STATIC_FROM_RE.exec(text))) out.add(m[1]);
  SIDE_EFFECT_IMPORT_RE.lastIndex = 0;
  while ((m = SIDE_EFFECT_IMPORT_RE.exec(text))) out.add(m[2]);
  DYNAMIC_IMPORT_RE.lastIndex = 0;
  while ((m = DYNAMIC_IMPORT_RE.exec(text))) out.add(m[1]);
  return Array.from(out);
}

function findForbiddenSpecifier(specifiers: readonly string[]): string | undefined {
  for (const spec of specifiers) {
    for (const prefix of FORBIDDEN_IMPORT_PREFIXES) {
      if (spec.startsWith(prefix)) return spec;
    }
  }
  return undefined;
}

describe('Wave 12 Constraints Log — no forbidden runtime imports', () => {
  for (const file of CL_SOURCE_FILES) {
    it(`source ${file} contains no forbidden import specifiers`, () => {
      const path = fileURLToPath(new URL(file, import.meta.url));
      const raw = readFileSync(path, 'utf-8');
      const specs = extractImportSpecifiers(raw);
      const offender = findForbiddenSpecifier(specs);
      expect(offender, `${file} should not import ${offender ?? '<none>'}`).toBeUndefined();
    });
  }
});
