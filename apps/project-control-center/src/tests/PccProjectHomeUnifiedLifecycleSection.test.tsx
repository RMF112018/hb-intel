/**
 * Wave 99 / Prompt 05B — PccProjectHomeUnifiedLifecycleSection focused
 * test suite.
 *
 * Renders the section in isolation inside a `<PccBentoGrid>` so each
 * card stays a direct child of the grid (the bento direct-child
 * invariant). The section is a Fragment of four `PccDashboardCard`
 * children — they should never be wrapped in an intermediate node.
 */

import { describe, expect, it } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  SAMPLE_PROJECT_DECISION_RECORD,
  SAMPLE_PROJECT_PROFILE,
  SAMPLE_UNIFIED_LIFECYCLE_ENVELOPE,
  SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
  type PccSecurityPosture,
  type PccUnifiedLifecycleReadModel,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectHomeUnifiedLifecycleSection } from '../surfaces/projectHome/PccProjectHomeUnifiedLifecycleSection';
import type { IPccUnifiedLifecycleReadModelClient } from '../surfaces/unifiedLifecycle/index.js';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

const SECURITY_WITHHELD: PccSecurityPosture = {
  classification: 'restricted',
  allowedPersonas: ['project-executive'],
  redactionLevel: 'withheld',
  crossProjectAllowed: false,
};

function envelope(
  sourceStatus: PccReadModelSourceStatus = 'available',
  data: PccUnifiedLifecycleReadModel = SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
): PccReadModelEnvelope<PccUnifiedLifecycleReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    viewerPersona: 'project-manager' as PccPersona,
    warnings: [],
    generatedAtUtc: '2026-05-03T00:00:00.000Z',
    data,
  };
}

function renderSection(client: IPccUnifiedLifecycleReadModelClient) {
  return render(
    <PccBentoGrid forceMode="desktop">
      <PccProjectHomeUnifiedLifecycleSection client={client} projectId={PROJECT_ID} />
    </PccBentoGrid>,
  );
}

const SECTION_BODY_MARKERS = [
  'data-pcc-lifecycle-timeline',
  'data-pcc-project-memory',
  'data-pcc-project-lens-switcher',
  'data-pcc-related-records',
] as const;

describe('PccProjectHomeUnifiedLifecycleSection — fixture client', () => {
  it('renders four cards, each a direct child of the bento grid with non-zero column span', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards.length).toBe(4);
    for (const card of Array.from(cards)) {
      expect(card.parentElement === grid).toBe(true);
      const footprint = card.getAttribute('data-pcc-footprint');
      expect(footprint).not.toBeNull();
      expect(footprint!.length).toBeGreaterThan(0);
      const span = Number(card.getAttribute('data-pcc-column-span'));
      expect(span).toBeGreaterThan(0);
    }
  });

  it('exposes one of each unified-lifecycle body marker after the hook resolves', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    for (const marker of SECTION_BODY_MARKERS) {
      const nodes = container.querySelectorAll(`[${marker}]`);
      expect(nodes.length, `expected exactly one ${marker}`).toBe(1);
    }
  });

  it('renders the lens switcher with disabled preview-disabled buttons and no anchors', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-project-lens-switcher]')).not.toBeNull(),
    );
    const lensButtons = container.querySelectorAll<HTMLButtonElement>(
      '[data-pcc-project-lens-switcher] [data-pcc-lens-id]',
    );
    expect(lensButtons.length).toBeGreaterThan(0);
    for (const button of Array.from(lensButtons)) {
      expect(button.disabled).toBe(true);
      expect(button.getAttribute('data-pcc-action-state')).toBe('preview-disabled');
    }
    const before = Array.from(lensButtons).map((b) => b.getAttribute('aria-pressed'));
    fireEvent.click(lensButtons[0]!);
    const after = Array.from(lensButtons).map((b) => b.getAttribute('aria-pressed'));
    expect(after).toEqual(before);
    expect(container.querySelectorAll('a[href]').length).toBe(0);
  });
});

describe('PccProjectHomeUnifiedLifecycleSection — degraded paths', () => {
  it('promise rejection from the hook renders one role=alert per card', async () => {
    const rejecting: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle() {
        throw new Error('boom');
      },
    };
    const { container } = renderSection(rejecting);
    await waitFor(() => {
      const alerts = container.querySelectorAll('[role="alert"]');
      expect(alerts.length).toBe(4);
    });
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-lens-switcher]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
  });

  it('backend-unavailable envelope flows through to the four 04C body markers (cardState: error per body)', async () => {
    const client: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle() {
        return envelope('backend-unavailable');
      },
    };
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    // Each 04C body container is still present (the section is in 'ready'
    // state) and renders its OWN PccPreviewState with cardState='error'.
    for (const marker of SECTION_BODY_MARKERS) {
      const node = container.querySelector(`[${marker}]`);
      expect(node).not.toBeNull();
      const stateNode = node!.querySelector('[data-pcc-state="error"]');
      expect(stateNode, `expected [data-pcc-state="error"] inside [${marker}]`).not.toBeNull();
    }
    // Exactly four role=alert nodes — one per leaf body's PccPreviewState.
    expect(container.querySelectorAll('[role="alert"]').length).toBe(4);
  });

  it('withheld project-memory record is omitted from the section', async () => {
    const withheldDecision = {
      ...SAMPLE_PROJECT_DECISION_RECORD,
      memoryId: 'TST-MEM-WITHHELD',
      summary: 'WITHHELD_DO_NOT_EXPOSE_summary',
      decision: 'WITHHELD_DO_NOT_EXPOSE_decision',
      impactStatement: 'WITHHELD_DO_NOT_EXPOSE_impact',
      security: SECURITY_WITHHELD,
    };
    const data: PccUnifiedLifecycleReadModel = {
      ...SAMPLE_UNIFIED_LIFECYCLE_READ_MODEL,
      projectMemory: {
        records: [withheldDecision],
        decisions: [withheldDecision],
        assumptions: [],
      },
    };
    const client: IPccUnifiedLifecycleReadModelClient = {
      async getUnifiedLifecycle() {
        return envelope('available', data);
      },
    };
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-project-memory]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-pcc-memory-record-id="TST-MEM-WITHHELD"]')).toBeNull();
    expect(container.textContent ?? '').not.toContain('WITHHELD_DO_NOT_EXPOSE');
  });
});

describe('PccProjectHomeUnifiedLifecycleSection — non-routing posture', () => {
  it('renders no anchor with href referencing unified-lifecycle / lifecycle-timeline / traceability-graph / closed-project-references', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href]');
    for (const anchor of Array.from(anchors)) {
      const href = anchor.getAttribute('href') ?? '';
      for (const forbidden of [
        'unified-lifecycle',
        'lifecycle-timeline',
        'traceability-graph',
        'closed-project-references',
      ]) {
        expect(href.includes(forbidden)).toBe(false);
      }
    }
  });

  it('renders no [data-pcc-tab-id] or [data-pcc-active-surface-panel] for unified-lifecycle', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-pcc-tab-id="unified-lifecycle"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-active-surface-panel="unified-lifecycle"]'),
    ).toBeNull();
  });
});
