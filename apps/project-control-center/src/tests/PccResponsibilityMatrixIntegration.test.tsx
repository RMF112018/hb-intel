import { describe, expect, it } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import {
  SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
  SAMPLE_RESPONSIBILITY_MATRIX_READ_MODEL,
} from '@hbc/models/pcc';
import type {
  PccProjectId,
  PccReadModelEnvelope,
  PccReadModelSourceStatus,
  PccResponsibilityMatrixReadModel,
} from '@hbc/models/pcc';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccResponsibilityMatrixRegions } from '../surfaces/responsibilityMatrix/PccResponsibilityMatrixRegions';
import { buildPccResponsibilityMatrixViewModel } from '../surfaces/responsibilityMatrix/responsibilityMatrixAdapter';

const SECTION_MARKER = 'responsibility-matrix';

const REQUIRED_INTEGRATION_REGIONS: readonly string[] = [
  'priority-actions',
  'readiness-signals',
  'approvals-references',
  'team-access-references',
  'document-control-references',
];

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-tab-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  // Wave 15A B5 / Prompt 02 — RM Integration renders only when the
  // 'responsibility-matrix' detail section is selected via the module-index card.
  const drilldown = container.querySelector(
    '[data-pcc-readiness-drilldown-control="responsibility-matrix"]',
  );
  expect(drilldown, 'expected responsibility-matrix drilldown control').not.toBeNull();
  fireEvent.click(drilldown!);
  return panel as HTMLElement;
}

function integrationRegion(container: HTMLElement, region: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-rm-integration-region="${region}"]`);
}

function projectId(): PccProjectId {
  return 'p-rm-0001' as PccProjectId;
}

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccResponsibilityMatrixReadModel,
): PccReadModelEnvelope<PccResponsibilityMatrixReadModel> {
  return {
    projectId: projectId(),
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

function renderRegions(env: PccReadModelEnvelope<PccResponsibilityMatrixReadModel>): HTMLElement {
  const vm = buildPccResponsibilityMatrixViewModel(env);
  const { container } = render(
    <PccBentoGrid forceMode="desktop">
      <PccResponsibilityMatrixRegions viewModel={vm} />
    </PccBentoGrid>,
  );
  return container;
}

const EMPTY_READ_MODEL: PccResponsibilityMatrixReadModel = {
  templates: [],
  projectInstances: [],
  exceptions: [],
  healthScore: SAMPLE_RESPONSIBILITY_MATRIX_INSUFFICIENT_DATA_HEALTH_SCORE,
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

// ---------------------------------------------------------------------------
// PccApp-driven integration assertions
// ---------------------------------------------------------------------------

describe('Wave 11 Responsibility Matrix — integration card under project-readiness surface', () => {
  it('renders all 5 integration sub-region markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    for (const region of REQUIRED_INTEGRATION_REGIONS) {
      expect(
        integrationRegion(container, region),
        `missing integration region ${region}`,
      ).not.toBeNull();
    }
  });

  it('integration card preserves the bento direct-child invariant', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'priority-actions');
    expect(region).not.toBeNull();
    const card = region!.closest('[data-pcc-card]');
    expect(card).not.toBeNull();
    expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    // Confirm the integration card carries the section marker but NOT a lane id
    // (the 8 RM lanes remain locked at the model registry).
    const sectionMarker = card!.querySelector(
      '[data-pcc-readiness-section="responsibility-matrix"]',
    );
    expect(sectionMarker).not.toBeNull();
    expect(card!.querySelectorAll('[data-pcc-rm-lane]').length).toBe(0);
  });

  it('integration card has no anchors, no forms, no file inputs, and no enabled buttons', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'priority-actions');
    expect(region).not.toBeNull();
    const card = region!.closest('[data-pcc-card]') as HTMLElement;
    expect(card.querySelector('a[href]')).toBeNull();
    expect(card.querySelector('form')).toBeNull();
    expect(card.querySelector('input[type="file"]')).toBeNull();
    const buttons = card.querySelectorAll('button');
    for (const btn of Array.from(buttons)) {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    }
  });
});

describe('Wave 11 Responsibility Matrix — ownership boundary captions', () => {
  it('Priority Actions sub-region preserves Priority-Actions surface ownership', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'priority-actions');
    expect(region!.textContent).toContain('Priority Actions remains');
    expect(region!.textContent).toContain('candidate signals only');
  });

  it('Project Readiness sub-region preserves scoring-doctrine ownership', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'readiness-signals');
    expect(region!.textContent).toContain('Project Readiness retains its scoring doctrine');
  });

  it('Approvals sub-region defers execution to Wave 14', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'approvals-references');
    expect(region!.textContent).toContain('Wave 14');
    expect(region!.textContent).toContain('no approval is requested or executed');
  });

  it('Team & Access sub-region preserves roster ownership', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'team-access-references');
    expect(region!.textContent).toContain('Team & Access remains the roster and access owner');
    expect(region!.textContent).toContain('no roster, permission');
  });

  it('Document Control sub-region preserves evidence-binary ownership', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = integrationRegion(container, 'document-control-references');
    expect(region!.textContent).toContain(
      'HB Document Control Center retains evidence-binary ownership',
    );
    expect(region!.textContent).toContain('no upload, download, sync, mirror, or storage');
  });
});

describe('Wave 11 Responsibility Matrix — required UI conditions visible across lanes + integration', () => {
  it('all 10 required UI conditions are visible (with "missing responsible" derived as missing current action owner / responsible unresolved)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);

    // Priority Actions candidates carry markers per exception code.
    const pa = integrationRegion(container, 'priority-actions');
    expect(pa).not.toBeNull();
    const codes = [
      'MISSING_ACCOUNTABLE_OWNER',
      'MISSING_CURRENT_ACTION_OWNER',
      'OVERDUE_ACTION',
      'ROLE_VACANT',
      'PERSON_INACTIVE',
      'HANDOFF_REQUIRED',
      'MISSING_REQUIRED_EVIDENCE_REFERENCE',
      'OWNER_CONTRACT_AMBIGUITY',
    ];
    for (const code of codes) {
      expect(
        pa!.querySelector(`[data-pcc-rm-integration-priority-code="${code}"]`),
        `expected priority candidate ${code}`,
      ).not.toBeNull();
    }

    // Missing-responsible label rendered explicitly in the missing-current-action-owner group.
    expect(pa!.textContent).toContain('responsible action owner unresolved');

    // Decision-rights gap is rendered in the readiness-signals sub-region (always visible).
    const readiness = integrationRegion(container, 'readiness-signals');
    expect(
      readiness!.querySelector('[data-pcc-rm-integration-readiness-kind="decision-rights-gap"]'),
    ).not.toBeNull();

    // Source review required signal — pending human review aggregated from sourcePosture + ambiguous workbook rows.
    expect(
      readiness!.querySelector('[data-pcc-rm-integration-readiness-kind="pending-human-review"]'),
    ).not.toBeNull();
    expect(readiness!.textContent).toContain('require explicit mapping policy and human review');
  });
});

describe('Wave 11 Responsibility Matrix — degraded source health renders safely', () => {
  it('renders all 5 integration sub-regions with safe/empty content under insufficient-data envelope', () => {
    const container = renderRegions(envelope('source-unavailable', EMPTY_READ_MODEL));
    for (const region of REQUIRED_INTEGRATION_REGIONS) {
      expect(
        container.querySelector(`[data-pcc-rm-integration-region="${region}"]`),
        `missing integration region ${region} under degraded health`,
      ).not.toBeNull();
    }
    // Degraded readiness signal captions reflect insufficient-data state.
    const readiness = container.querySelector(
      '[data-pcc-rm-integration-region="readiness-signals"]',
    );
    expect(readiness!.textContent).toContain('insufficient-data');
  });

  it('integration sub-regions render no enabled buttons and no anchors under degraded health', () => {
    const container = renderRegions(envelope('backend-unavailable', EMPTY_READ_MODEL));
    const region = container.querySelector('[data-pcc-rm-integration-region="priority-actions"]');
    expect(region).not.toBeNull();
    const card = region!.closest('[data-pcc-card]') as HTMLElement;
    expect(card.querySelector('a[href]')).toBeNull();
    expect(card.querySelector('form')).toBeNull();
    expect(card.querySelector('input[type="file"]')).toBeNull();
    const buttons = card.querySelectorAll('button');
    for (const btn of Array.from(buttons)) {
      expect((btn as HTMLButtonElement).disabled).toBe(true);
    }
  });
});
