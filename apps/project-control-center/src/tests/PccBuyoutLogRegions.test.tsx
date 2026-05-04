import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Fragment } from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  SAMPLE_BUYOUT_LOG_READ_MODEL,
  type PccBuyoutLogReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccBuyoutLogRegions } from '../surfaces/buyoutLog/PccBuyoutLogRegions';
import { buildPccBuyoutLogViewModel } from '../surfaces/buyoutLog/buyoutLogAdapter';
import {
  PCC_BL_BOUNDARY_KEYS,
  PCC_BL_INTEGRATION_TARGET_IDS,
  PCC_BL_REGION_IDS,
  type IPccBuyoutLogReadModelClient,
  type IPccBuyoutLogViewModel,
} from '../surfaces/buyoutLog/buyoutLogViewModel';

const SECTION_MARKER = 'buyout-log';

const REQUIRED_REGIONS: readonly string[] = [
  'command-center',
  'package-table',
  'budget-vs-commitment',
  'unbought-scope',
  'procore-reconciliation',
  'package-detail',
  'compliance-sdi-bond',
  'procurement-leadtime',
  'evidence-lineage',
  'audit-history',
];

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-surface-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function blRegion(container: HTMLElement, region: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-bl-region="${region}"]`);
}

function projectId(): PccProjectId {
  return 'p-w13-bl-regions' as PccProjectId;
}

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccBuyoutLogReadModel = SAMPLE_BUYOUT_LOG_READ_MODEL,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccBuyoutLogReadModel> {
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
  env: PccReadModelEnvelope<PccBuyoutLogReadModel>,
): IPccBuyoutLogReadModelClient {
  return {
    getBuyoutLog: async () => env,
  };
}

function renderRegions(vm: IPccBuyoutLogViewModel): HTMLElement {
  const { container } = render(
    <PccBentoGrid forceMode="wideDesktop">
      <Fragment>
        <PccBuyoutLogRegions viewModel={vm} />
      </Fragment>
    </PccBentoGrid>,
  );
  return container;
}

// ---------------------------------------------------------------------------
// Region-id tuple guard
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — region-id tuple', () => {
  it('PCC_BL_REGION_IDS exports exactly the ten canonical region ids', () => {
    expect([...PCC_BL_REGION_IDS]).toEqual(REQUIRED_REGIONS);
  });
});

// ---------------------------------------------------------------------------
// Default surface render path (fixture-only — no client supplied)
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — bento direct-child invariant', () => {
  it('every Buyout Log region marker resolves to a card whose parent is the bento grid', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBeGreaterThanOrEqual(REQUIRED_REGIONS.length);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });
});

describe('Wave 13 Buyout Log — required regions', () => {
  it('renders every required region', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    for (const region of REQUIRED_REGIONS) {
      expect(blRegion(container, region), `missing region ${region}`).not.toBeNull();
    }
  });

  it('emits exactly ten buyout-log section markers (one per region) in the ready path', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBe(REQUIRED_REGIONS.length);
  });
});

describe('Wave 13 Buyout Log — read-only structural posture', () => {
  it('the buyout log region group contains no anchors, forms, or file inputs', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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

  it('the only enabled buttons in the buyout log region group are local-selection package-row buttons', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      const buttons = card!.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        const isSelect = btn.hasAttribute('data-pcc-bl-package-select');
        expect(
          (btn as HTMLButtonElement).disabled || isSelect,
          `enabled button must be a local-selection package-row button: ${btn.outerHTML.slice(0, 80)}`,
        ).toBe(true);
      }
    }
  });

  it('does not introduce a standalone buyout-log shell route or active surface marker', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    expect(container.querySelector('[data-pcc-surface-id="buyout-log"]')).toBeNull();
    expect(container.querySelector('[data-pcc-active-surface-panel="buyout-log"]')).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Local-only package-detail selection
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — local package-detail selection', () => {
  it('clicking a package row updates the package-detail region to the selected entry', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);

    const detailRegion = blRegion(container, 'package-detail');
    expect(detailRegion).not.toBeNull();

    // Default detail entry is the first package in the fixture.
    const defaultId = SAMPLE_BUYOUT_LOG_READ_MODEL.packages[0].id;
    expect(detailRegion!.querySelector(`[data-pcc-bl-detail-entry="${defaultId}"]`)).not.toBeNull();

    // Click the blocked package row.
    const blockedPkg = SAMPLE_BUYOUT_LOG_READ_MODEL.packages.find((p) => p.status === 'blocked');
    expect(blockedPkg).toBeDefined();
    const targetButton = container.querySelector(
      `[data-pcc-bl-package-select="${blockedPkg!.id}"]`,
    );
    expect(targetButton).not.toBeNull();
    fireEvent.click(targetButton!);

    const detailRegionAfter = blRegion(container, 'package-detail');
    expect(detailRegionAfter).not.toBeNull();
    expect(
      detailRegionAfter!.querySelector(`[data-pcc-bl-detail-entry="${blockedPkg!.id}"]`),
    ).not.toBeNull();
    expect(
      detailRegionAfter!.querySelector(`[data-pcc-bl-detail-entry="${defaultId}"]`),
    ).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Adapter-driven render branches (envelope sourceStatus variants)
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — envelope sourceStatus branches', () => {
  it('renders all ten regions with available envelope', () => {
    const vm = buildPccBuyoutLogViewModel(envelope('available'));
    const container = renderRegions(vm);
    for (const region of REQUIRED_REGIONS) {
      expect(blRegion(container, region), `missing region ${region}`).not.toBeNull();
    }
  });

  it('renders all ten regions with source-unavailable envelope (degraded card state)', () => {
    const vm = buildPccBuyoutLogViewModel(envelope('source-unavailable'));
    if (vm.status !== 'ready') throw new Error('expected ready');
    expect(vm.cardState).toBe('unavailable-fixture');
    expect(vm.sourceStatus).toBe('source-unavailable');
    const container = renderRegions(vm);
    for (const region of REQUIRED_REGIONS) {
      expect(blRegion(container, region), `missing region ${region}`).not.toBeNull();
    }
  });

  it('renders all ten regions with backend-unavailable envelope (degraded card state)', () => {
    const vm = buildPccBuyoutLogViewModel(envelope('backend-unavailable'));
    if (vm.status !== 'ready') throw new Error('expected ready');
    expect(vm.cardState).toBe('error');
    expect(vm.sourceStatus).toBe('backend-unavailable');
    const container = renderRegions(vm);
    for (const region of REQUIRED_REGIONS) {
      expect(blRegion(container, region), `missing region ${region}`).not.toBeNull();
    }
  });
});

describe('Wave 13 Buyout Log — loading and error single-card branches', () => {
  it('loading view-model renders a single full-width card with a command-center marker', () => {
    const container = renderRegions({ status: 'loading' });
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBe(1);
    expect(markers[0].getAttribute('data-pcc-bl-region')).toBe('command-center');
  });

  it('error view-model renders a single full-width card with a command-center marker', () => {
    const container = renderRegions({ status: 'error' });
    const markers = container.querySelectorAll(`[data-pcc-readiness-section="${SECTION_MARKER}"]`);
    expect(markers.length).toBe(1);
    expect(markers[0].getAttribute('data-pcc-bl-region')).toBe('command-center');
  });
});

describe('Wave 13 Buyout Log — narrow client wired through adapter', () => {
  it('client returning the fixture envelope drives the regions through the adapter', async () => {
    const client = makeClient(envelope('available'));
    const env = await client.getBuyoutLog(projectId());
    const vm = buildPccBuyoutLogViewModel(env);
    expect(vm.status).toBe('ready');
  });
});

// ---------------------------------------------------------------------------
// Source-lineage badges
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — source-lineage badges', () => {
  it('package-table source-system markers cover PCC, Procore, and workbook-template entries', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'package-table');
    expect(region).not.toBeNull();
    const sources = Array.from(region!.querySelectorAll('[data-pcc-bl-package-source-system]')).map(
      (n) => n.getAttribute('data-pcc-bl-package-source-system'),
    );
    expect(sources).toContain('pcc');
    expect(sources).toContain('procore');
    expect(sources).toContain('workbook-template');
  });
});

// ---------------------------------------------------------------------------
// HBI eligibility — future-gated / citation-required
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — HBI eligibility future-gated', () => {
  it('evidence-lineage region shows a future-gated HBI eligibility summary', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'evidence-lineage');
    expect(region).not.toBeNull();
    const summary = region!.querySelector('[data-pcc-bl-hbi-eligibility-summary]');
    expect(summary).not.toBeNull();
    expect((summary!.textContent ?? '').toLowerCase()).toContain('future-gated');
  });

  it('package-detail region surfaces a future-eligible HBI eligibility marker for the default package', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'package-detail');
    expect(region).not.toBeNull();
    const marker = region!.querySelector('[data-pcc-bl-detail-region="hbi-eligibility"]');
    expect(marker).not.toBeNull();
    expect(['true', 'false']).toContain(marker!.getAttribute('data-pcc-bl-detail-hbi-eligible'));
  });
});

// ---------------------------------------------------------------------------
// Project memory and traceability — reference-only
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — project memory and traceability reference-only', () => {
  it('audit-history region surfaces project-memory and traceability rows with reference-only captions', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'audit-history');
    expect(region).not.toBeNull();
    const memory = region!.querySelector('[data-pcc-bl-project-memory]');
    const trace = region!.querySelector('[data-pcc-bl-traceability]');
    expect(memory).not.toBeNull();
    expect(trace).not.toBeNull();
    expect((region!.textContent ?? '').toLowerCase()).toContain('reference-only');
  });
});

// ---------------------------------------------------------------------------
// Compliance and procurement region scoping
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — compliance and procurement grouping', () => {
  it('compliance region groups requirements by type', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'compliance-sdi-bond');
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('[data-pcc-bl-compliance-group]').length).toBeGreaterThan(0);
  });

  it('procurement-leadtime region groups milestones by type', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'procurement-leadtime');
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('[data-pcc-bl-procurement-group]').length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// No-runtime import-specifier scan (mirrors Wave 12 implementation)
// ---------------------------------------------------------------------------

const BL_SOURCE_FILES = [
  '../surfaces/buyoutLog/PccBuyoutLogRegions.tsx',
  '../surfaces/buyoutLog/buyoutLogAdapter.ts',
  '../surfaces/buyoutLog/buyoutLogViewModel.ts',
  '../surfaces/buyoutLog/useBuyoutLogReadModel.ts',
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

describe('Wave 13 Buyout Log — no forbidden runtime imports', () => {
  for (const file of BL_SOURCE_FILES) {
    it(`source ${file} contains no forbidden import specifiers`, () => {
      const path = fileURLToPath(new URL(file, import.meta.url));
      const raw = readFileSync(path, 'utf-8');
      const specs = extractImportSpecifiers(raw);
      const offender = findForbiddenSpecifier(specs);
      expect(offender, `${file} should not import ${offender ?? '<none>'}`).toBeUndefined();
    });
  }
});

// ---------------------------------------------------------------------------
// Wave 13 / Prompt 06 — boundary notices, integration posture, reference seams
// ---------------------------------------------------------------------------

describe('Wave 13 Buyout Log — boundary notices in command center', () => {
  it('renders one boundary-notice marker per canonical key inside the command-center region', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'command-center');
    expect(region).not.toBeNull();
    for (const key of PCC_BL_BOUNDARY_KEYS) {
      const notice = region!.querySelector(`[data-pcc-bl-boundary-notice="${key}"]`);
      expect(notice, `missing boundary notice ${key}`).not.toBeNull();
      const text = (notice!.textContent ?? '').toLowerCase();
      expect(
        text.includes('not enabled here') ||
          text.includes('reference only') ||
          text.includes('imported lineage only'),
      ).toBe(true);
    }
  });

  it('boundary notices live within the command-center boundary-notices list and are inert', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = container.querySelector(
      '[data-pcc-bl-region-list="command-center-boundary-notices"]',
    );
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('[data-pcc-bl-boundary-notice]').length).toBe(
      PCC_BL_BOUNDARY_KEYS.length,
    );
    expect(region!.querySelector('a[href]')).toBeNull();
    expect(region!.querySelector('button')).toBeNull();
    expect(region!.querySelector('input')).toBeNull();
    expect(region!.querySelector('form')).toBeNull();
  });
});

describe('Wave 13 Buyout Log — integration posture in command center', () => {
  it('renders one integration-posture marker per canonical target id in the command-center region', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = blRegion(container, 'command-center');
    expect(region).not.toBeNull();
    for (const targetId of PCC_BL_INTEGRATION_TARGET_IDS) {
      const row = region!.querySelector(`[data-pcc-bl-integration-posture="${targetId}"]`);
      expect(row, `missing integration posture row ${targetId}`).not.toBeNull();
      expect(row!.textContent?.toLowerCase()).toContain('reference only');
    }
  });

  it('integration-posture rows are inert (no anchors, no buttons, no inputs, no forms)', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = container.querySelector(
      '[data-pcc-bl-region-list="command-center-integration-posture"]',
    );
    expect(region).not.toBeNull();
    expect(region!.querySelector('a[href]')).toBeNull();
    expect(region!.querySelector('button')).toBeNull();
    expect(region!.querySelector('input')).toBeNull();
    expect(region!.querySelector('form')).toBeNull();
  });
});

describe('Wave 13 Buyout Log — per-seam reference-only labels in package detail', () => {
  // Map each fixture-populated seam kind to a package id whose detail entry
  // surfaces that kind. The seam kinds and packages are taken directly from
  // SAMPLE_BUYOUT_LOG_READ_MODEL fixtures (Prompt 02 / Prompt 05 carry-forward).
  const KIND_TO_PACKAGE_ID: ReadonlyArray<readonly [string, string]> = [
    ['document-control-evidence', 'pkg-w13-ready-001'],
    ['lifecycle-readiness-gate', 'pkg-w13-ready-001'],
    ['responsibility-role', 'pkg-w13-ready-001'],
    ['priority-actions-candidate', 'pkg-w13-blocked-002'],
    ['project-readiness-source-module', 'pkg-w13-ready-001'],
  ];

  it('each fixture-populated seam kind renders a data-pcc-bl-detail-seam-kind marker with a reference-only label', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);

    for (const [kind, pkgId] of KIND_TO_PACKAGE_ID) {
      const selectButton = container.querySelector(`[data-pcc-bl-package-select="${pkgId}"]`);
      expect(selectButton, `missing package row for ${pkgId}`).not.toBeNull();
      fireEvent.click(selectButton!);

      const detailRegion = blRegion(container, 'package-detail');
      expect(detailRegion, `missing package-detail region after selecting ${pkgId}`).not.toBeNull();

      const seamRow = detailRegion!.querySelector(`[data-pcc-bl-detail-seam-kind="${kind}"]`);
      expect(seamRow, `missing seam kind ${kind} on detail entry ${pkgId}`).not.toBeNull();

      const refOnlyLabel = seamRow!.querySelector(
        `[data-pcc-bl-detail-seam-reference-only="${kind}"]`,
      );
      expect(refOnlyLabel, `missing reference-only label for ${kind}`).not.toBeNull();
      const text = (refOnlyLabel!.textContent ?? '').toLowerCase();
      expect(text.includes('reference only') || text.includes('not enabled here')).toBe(true);
    }
  });

  it('every package surfaces the project-readiness-source-module seam declaring "buyout-log"', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);

    // Each package row click resolves the detail panel; the source-module
    // seam must always render with reference value "buyout-log".
    const packageRows = container.querySelectorAll('[data-pcc-bl-package-select]');
    expect(packageRows.length).toBeGreaterThan(0);
    for (const btn of Array.from(packageRows)) {
      fireEvent.click(btn);
      const detailRegion = blRegion(container, 'package-detail');
      expect(detailRegion).not.toBeNull();
      const seamRow = detailRegion!.querySelector(
        '[data-pcc-bl-detail-seam-kind="project-readiness-source-module"]',
      );
      expect(seamRow).not.toBeNull();
      expect(seamRow!.getAttribute('data-pcc-bl-detail-seam')).toBe('buyout-log');
    }
  });

  it('reference-seams subsection is inert (no anchors, no buttons, no inputs, no forms)', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const detailRegion = blRegion(container, 'package-detail');
    expect(detailRegion).not.toBeNull();
    const seamsRegion = detailRegion!.querySelector(
      '[data-pcc-bl-detail-region="reference-seams"]',
    );
    expect(seamsRegion).not.toBeNull();
    expect(seamsRegion!.querySelector('a[href]')).toBeNull();
    expect(seamsRegion!.querySelector('button')).toBeNull();
    expect(seamsRegion!.querySelector('input')).toBeNull();
    expect(seamsRegion!.querySelector('form')).toBeNull();
  });
});
