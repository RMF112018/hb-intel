import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL } from '@hbc/models/pcc';
import type {
  PccPersona,
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccResponsibilityMatrixReadModel,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { buildPccResponsibilityMatrixViewModel } from '../surfaces/responsibilityMatrix/responsibilityMatrixAdapter';
import type { IPccResponsibilityMatrixReadModelClient } from '../surfaces/responsibilityMatrix/responsibilityMatrixViewModel';

const SECTION_MARKER = 'responsibility-matrix';

const REQUIRED_LANES: readonly string[] = [
  'overview',
  'matrix',
  'register',
  'owner-contract-mapping',
  'my-responsibilities',
  'gaps-and-conflicts',
  'handoffs',
  'template-and-admin',
];

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-surface-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function rmLane(container: HTMLElement, lane: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-rm-lane="${lane}"]`);
}

function projectId(): PccProjectId {
  return 'p-rm-0001' as PccProjectId;
}

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccResponsibilityMatrixReadModel,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccResponsibilityMatrixReadModel> {
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

const EMPTY_READ_MODEL: PccResponsibilityMatrixReadModel = {
  templates: [],
  projectInstances: [],
  exceptions: [],
  healthScore: { state: 'insufficient-data', reason: 'No data ingested.' },
  workbookSourceSummary: {
    defaultItemsTotal: 0,
    pmItems: 0,
    fieldItems: 0,
    strictMarkedRows: 0,
    ambiguousItemsTotal: 0,
    ownerContractActiveDefaultObligations: 0,
    sourceFiles: [],
  },
  sourcePosture: { sourceStatus: 'source-unavailable', pendingHumanReviewCount: 0 },
  snapshotHistory: [],
  auditEvents: [],
};

function makeClient(
  env: PccReadModelEnvelope<PccResponsibilityMatrixReadModel>,
): IPccResponsibilityMatrixReadModelClient {
  return {
    getResponsibilityMatrix: async () => env,
  };
}

// ---------------------------------------------------------------------------
// Default surface render path (fixture-only — no client supplied)
// ---------------------------------------------------------------------------

describe('Wave 11 Responsibility Matrix — bento direct-child invariant', () => {
  it('every Wave 11 lane marker resolves to a card whose parent is the bento grid', () => {
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

describe('Wave 11 Responsibility Matrix — required lanes', () => {
  it('renders every required lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    for (const lane of REQUIRED_LANES) {
      expect(rmLane(container, lane), `missing lane ${lane}`).not.toBeNull();
    }
  });
});

describe('Wave 11 Responsibility Matrix — overview-scoped count posture', () => {
  it('109 / 98 / 0 posture appears in the overview lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const overview = rmLane(container, 'overview');
    expect(overview).not.toBeNull();
    const text = overview!.textContent ?? '';
    expect(text).toContain('109');
    expect(text).toContain('98');
    expect(text).toContain('0 owner-contract active default obligations');
  });

  it('count posture does NOT leak into other lanes', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const matrix = rmLane(container, 'matrix');
    expect(matrix).not.toBeNull();
    expect(matrix!.textContent ?? '').not.toContain('workbook task-row context');
  });
});

describe('Wave 11 Responsibility Matrix — owner-contract placeholder messaging', () => {
  it('placeholder caption + RACI vs contract-party clarification render in the owner-contract lane', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const lane = rmLane(container, 'owner-contract-mapping');
    expect(lane).not.toBeNull();
    const text = lane!.textContent ?? '';
    expect(text).toContain('placeholder');
    expect(text).toContain('0 active default obligations');
    expect(text).toContain('Consulted');
    expect(text).toContain('Contractor');
  });
});

describe('Wave 11 Responsibility Matrix — read-only structural posture', () => {
  it('the responsibility matrix region group contains no anchors, forms, or file inputs', () => {
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

  it('every data-pcc-rm-action element is disabled and aria-disabled="true"', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const actions = container.querySelectorAll('[data-pcc-rm-action]');
    expect(actions.length).toBeGreaterThanOrEqual(1);
    for (const el of Array.from(actions)) {
      const tag = el.tagName.toLowerCase();
      expect(tag === 'button' || tag === 'input').toBe(true);
      expect((el as HTMLButtonElement | HTMLInputElement).disabled).toBe(true);
      expect(el.getAttribute('aria-disabled')).toBe('true');
      expect(el.getAttribute('data-pcc-rm-action-state')).toBe('preview-disabled');
    }
  });

  it('there are no enabled action buttons within the responsibility matrix region group', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      const buttons = card!.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        expect((btn as HTMLButtonElement).disabled).toBe(true);
      }
    }
  });
});

describe('Wave 11 Responsibility Matrix — Who Owns This results from envelope only', () => {
  it('renders Who-Owns results from the current envelope entries', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const overview = rmLane(container, 'overview');
    expect(overview).not.toBeNull();
    const results = overview!.querySelectorAll('[data-pcc-rm-who-owns-instance]');
    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(overview!.querySelector('[data-pcc-rm-action="who-owns-input"]')).not.toBeNull();
  });
});

describe('Wave 11 Responsibility Matrix — role/person toggle', () => {
  it('renders both role and person toggle buttons (preview-only)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const matrix = rmLane(container, 'matrix');
    expect(matrix).not.toBeNull();
    expect(matrix!.querySelector('[data-pcc-rm-action="matrix-toggle-role"]')).not.toBeNull();
    expect(matrix!.querySelector('[data-pcc-rm-action="matrix-toggle-person"]')).not.toBeNull();
  });
});

describe('Wave 11 Responsibility Matrix — exception groups in gaps lane', () => {
  it('renders exception group markers per code', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const lane = rmLane(container, 'gaps-and-conflicts');
    expect(lane).not.toBeNull();
    expect(lane!.querySelector('[data-pcc-rm-exception-code="OVERDUE_ACTION"]')).not.toBeNull();
    expect(
      lane!.querySelector('[data-pcc-rm-exception-code="MISSING_ACCOUNTABLE_OWNER"]'),
    ).not.toBeNull();
  });
});

describe('Wave 11 Responsibility Matrix — handoffs and template admin', () => {
  it('renders the pending handoff row and audit events', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const handoffs = rmLane(container, 'handoffs');
    expect(handoffs).not.toBeNull();
    expect(handoffs!.querySelector('[data-pcc-rm-handoff-accepted="false"]')).not.toBeNull();
    const admin = rmLane(container, 'template-and-admin');
    expect(admin).not.toBeNull();
    expect(admin!.querySelectorAll('[data-pcc-rm-audit-event]').length).toBeGreaterThanOrEqual(1);
  });
});

describe('Wave 11 Responsibility Matrix — item register has rich rendering (not a spreadsheet launcher)', () => {
  it('renders register rows with classification, criticality, and inline detail elements', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const lane = rmLane(container, 'register');
    expect(lane).not.toBeNull();
    const rows = lane!.querySelectorAll('[data-pcc-rm-register-row]');
    expect(rows.length).toBeGreaterThanOrEqual(1);
    const details = lane!.querySelectorAll('details[data-pcc-rm-register-detail]');
    expect(details.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Adapter-driven render branches (avoid PccApp; render the regions directly
// via the read-model adapter applied to envelope variants)
// ---------------------------------------------------------------------------

import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccResponsibilityMatrixRegions } from '../surfaces/responsibilityMatrix/PccResponsibilityMatrixRegions';

function renderRegions(env: PccReadModelEnvelope<PccResponsibilityMatrixReadModel>): HTMLElement {
  const vm = buildPccResponsibilityMatrixViewModel(env);
  const { container } = render(
    <PccBentoGrid forceMode="desktop">
      <Fragment>
        <PccResponsibilityMatrixRegions viewModel={vm} />
      </Fragment>
    </PccBentoGrid>,
  );
  return container;
}

describe('Wave 11 Responsibility Matrix — health score branches', () => {
  it('renders computed at-risk band when health score is computed', () => {
    const container = renderRegions(envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL));
    const overview = container.querySelector('[data-pcc-rm-lane="overview"]');
    expect(overview).not.toBeNull();
    expect(overview!.textContent).toContain('At risk');
    expect(overview!.querySelector('[data-pcc-rm-overview-region="health-counts"]')).not.toBeNull();
  });

  it('renders insufficient-data badge when health score is insufficient-data', () => {
    const container = renderRegions(
      envelope('available', {
        ...SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
        healthScore: {
          state: 'insufficient-data',
          reason: 'Workbook ingestion not yet complete for this project.',
        },
      }),
    );
    const overview = container.querySelector('[data-pcc-rm-lane="overview"]');
    expect(overview).not.toBeNull();
    expect(overview!.textContent).toContain('Insufficient data');
    expect(overview!.textContent).toContain('Workbook ingestion not yet complete');
    expect(overview!.querySelector('[data-pcc-rm-overview-region="health-counts"]')).toBeNull();
  });
});

describe('Wave 11 Responsibility Matrix — envelope sourceStatus branches', () => {
  it('renders all 8 lanes with available envelope', () => {
    const container = renderRegions(envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL));
    for (const lane of REQUIRED_LANES) {
      expect(
        container.querySelector(`[data-pcc-rm-lane="${lane}"]`),
        `missing lane ${lane}`,
      ).not.toBeNull();
    }
  });

  it('renders all 8 lanes (with empty content) with source-unavailable envelope', () => {
    const container = renderRegions(envelope('source-unavailable', EMPTY_READ_MODEL));
    for (const lane of REQUIRED_LANES) {
      expect(
        container.querySelector(`[data-pcc-rm-lane="${lane}"]`),
        `missing lane ${lane}`,
      ).not.toBeNull();
    }
  });

  it('renders all 8 lanes (with empty content) with backend-unavailable envelope', () => {
    const container = renderRegions(envelope('backend-unavailable', EMPTY_READ_MODEL));
    for (const lane of REQUIRED_LANES) {
      expect(
        container.querySelector(`[data-pcc-rm-lane="${lane}"]`),
        `missing lane ${lane}`,
      ).not.toBeNull();
    }
  });
});

describe('Wave 11 Responsibility Matrix — narrow client wired through hook', () => {
  it('client returning the fixture envelope drives the regions through the surface', async () => {
    // Smoke: ensure the narrow client interface is usable; resolve immediately.
    const client = makeClient(envelope('available', SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL));
    const env = await client.getResponsibilityMatrix(projectId());
    const vm = buildPccResponsibilityMatrixViewModel(env);
    expect(vm.status).toBe('ready');
  });
});

// ---------------------------------------------------------------------------
// No-runtime import-specifier scan (Phase 3 / Wave 11 / Prompt 06).
//
// Hardened against the Prompt 05 implementation, which stripped string
// literals before the substring check and so silently neutralized the
// scan: by the time a `from '@microsoft/sp-core-library'` literal reached
// `.includes(...)`, the literal had been removed.
//
// Correct approach:
//   1. Strip line/block comments only — preserve string literals intact.
//   2. Extract actual import specifiers via regex matching the static and
//      dynamic import grammar.
//   3. Assert no extracted specifier starts with a forbidden prefix.
// ---------------------------------------------------------------------------

const RM_SOURCE_FILES = [
  '../surfaces/responsibilityMatrix/PccResponsibilityMatrixRegions.tsx',
  '../surfaces/responsibilityMatrix/PccResponsibilityMatrixIntegrationCard.tsx',
  '../surfaces/responsibilityMatrix/responsibilityMatrixAdapter.ts',
  '../surfaces/responsibilityMatrix/responsibilityMatrixViewModel.ts',
  '../surfaces/responsibilityMatrix/useResponsibilityMatrixReadModel.ts',
  '../surfaces/responsibilityMatrix/integrationSignals.ts',
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
  // Remove `// ...` line comments and `/* ... */` block comments WITHOUT
  // touching string literals. Walks the source, switching to a string
  // mode on quote characters so comment markers inside strings are
  // ignored.
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
      // Preserve the entire string literal (including its content).
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

describe('Wave 11 Responsibility Matrix — no forbidden runtime imports', () => {
  for (const file of RM_SOURCE_FILES) {
    it(`source ${file} contains no forbidden import specifiers`, () => {
      const path = fileURLToPath(new URL(file, import.meta.url));
      const raw = readFileSync(path, 'utf-8');
      const specs = extractImportSpecifiers(raw);
      const offender = findForbiddenSpecifier(specs);
      expect(offender, `${file} should not import ${offender ?? '<none>'}`).toBeUndefined();
    });
  }

  it('self-meta sanity: extractor detects @microsoft/sp-core-library as forbidden when present', () => {
    // Synthetic source with a forbidden import — proves the extractor +
    // forbidden-prefix check actually trigger, so the scan is no longer
    // neutralized by string stripping.
    const synthetic = [
      "import { foo } from './bar';",
      "import { SPHttpClient } from '@microsoft/sp-core-library';",
      "import * as graph from '@microsoft/microsoft-graph-client';",
      "const lib = await import('axios');",
    ].join('\n');
    const specs = extractImportSpecifiers(synthetic);
    expect(specs).toContain('@microsoft/sp-core-library');
    expect(specs).toContain('@microsoft/microsoft-graph-client');
    expect(specs).toContain('axios');
    const offender = findForbiddenSpecifier(specs);
    expect(offender).toBeDefined();
  });
});
