import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import {
  EMPTY_APPROVALS_READ_MODEL,
  SAMPLE_APPROVALS_READ_MODEL,
  type PccApprovalsReadModel,
  type PccPersona,
  type PccProjectId,
  type PccReadModelEnvelope,
  type PccReadModelSourceStatus,
} from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccApprovalsSurface } from '../surfaces/approvals/PccApprovalsSurface';
import {
  PCC_APPROVALS_LANE_IDS,
  type IPccApprovalsReadModelClient,
} from '../surfaces/approvals/approvalsViewModel';
import { PccSurfaceRouter } from '../shell/PccSurfaceRouter';

const PROJECT_ID = 'p-w14-approvals-surface' as PccProjectId;

function envelope(
  sourceStatus: PccReadModelSourceStatus,
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
  viewerPersona?: PccPersona,
): PccReadModelEnvelope<PccApprovalsReadModel> {
  return {
    projectId: PROJECT_ID,
    mode: 'fixture',
    sourceStatus,
    readOnly: true,
    viewerPersona,
    warnings: [],
    generatedAtUtc: '2026-04-30T00:00:00.000Z',
    data,
  };
}

function fixtureClient(
  sourceStatus: PccReadModelSourceStatus = 'available',
  data: PccApprovalsReadModel = SAMPLE_APPROVALS_READ_MODEL,
): IPccApprovalsReadModelClient {
  return {
    getApprovals: async () => envelope(sourceStatus, data),
  };
}

function rejectingClient(): IPccApprovalsReadModelClient {
  return {
    getApprovals: async () => {
      throw new Error('simulated transport failure');
    },
  };
}

function renderSurface(client?: IPccApprovalsReadModelClient): HTMLElement {
  const { container } = render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccApprovalsSurface readModelClient={client} projectId={PROJECT_ID} />
    </PccBentoGrid>,
  );
  return container;
}

afterEach(() => {
  cleanup();
});

// ---------------------------------------------------------------------------
// Synchronous fixture-fallback path (no client supplied)
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — synchronous fixture-fallback path', () => {
  it('renders one card per Wave 14 lane id without supplying a read-model client', () => {
    const container = renderSurface();
    for (const laneId of PCC_APPROVALS_LANE_IDS) {
      const card = container.querySelector(`[data-pcc-approvals-lane="${laneId}"]`);
      expect(card, `missing lane ${laneId}`).not.toBeNull();
    }
  });

  it('does not render a loading or error PccPreviewState in the fixture-fallback path', () => {
    const container = renderSurface();
    expect(container.querySelector('[data-pcc-state="loading"]')).toBeNull();
    expect(container.querySelector('[data-pcc-state="error"]')).toBeNull();
  });

  it('exposes the canonical readiness-section marker on every approvals lane', () => {
    const container = renderSurface();
    const lanes = container.querySelectorAll('[data-pcc-approvals-lane]');
    expect(lanes.length).toBe(PCC_APPROVALS_LANE_IDS.length);
    for (const lane of Array.from(lanes)) {
      expect(lane.getAttribute('data-pcc-readiness-section')).toBe('approvals');
    }
  });
});

// ---------------------------------------------------------------------------
// Async client-driven path (loading → ready, loading → error)
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — async client-driven path', () => {
  it('renders all eleven lanes after the client resolves available envelope', async () => {
    const container = renderSurface(fixtureClient('available'));
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-approvals-lane="hbi-boundary"]')).not.toBeNull();
    });
    for (const laneId of PCC_APPROVALS_LANE_IDS) {
      expect(container.querySelector(`[data-pcc-approvals-lane="${laneId}"]`)).not.toBeNull();
    }
  });

  it('renders a single full-width loading card before the client resolves', () => {
    const pending: IPccApprovalsReadModelClient = {
      getApprovals: () => new Promise(() => {}),
    };
    const container = renderSurface(pending);
    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    // No other approvals lanes should render in the loading branch.
    const lanes = container.querySelectorAll('[data-pcc-approvals-lane]');
    expect(lanes.length).toBe(1);
    expect(lanes[0]?.getAttribute('data-pcc-approvals-lane')).toBe('home');
  });

  it('renders the error card when the client rejects', async () => {
    const container = renderSurface(rejectingClient());
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-state="error"]')).not.toBeNull();
    });
    const lanes = container.querySelectorAll('[data-pcc-approvals-lane]');
    expect(lanes.length).toBe(1);
  });

  it('renders all eleven lane shells with degraded source-unavailable envelope', async () => {
    const container = renderSurface(fixtureClient('source-unavailable', EMPTY_APPROVALS_READ_MODEL));
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-approvals-lane="hbi-boundary"]')).not.toBeNull();
    });
    for (const laneId of PCC_APPROVALS_LANE_IDS) {
      expect(container.querySelector(`[data-pcc-approvals-lane="${laneId}"]`)).not.toBeNull();
    }
    // Degraded lanes other than the always-available HBI / decision-history /
    // lineage seam cards present the unavailable-fixture preview state.
    expect(container.querySelector('[data-pcc-state="unavailable-fixture"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Bento direct-child invariant
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — bento direct-child invariant', () => {
  it('every approvals lane marker resolves to a card whose parent is the bento grid', () => {
    const container = renderSurface();
    const markers = container.querySelectorAll('[data-pcc-readiness-section="approvals"]');
    expect(markers.length).toBeGreaterThanOrEqual(PCC_APPROVALS_LANE_IDS.length);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Structural no-mutation guards
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — structural no-mutation guards', () => {
  it('the approvals surface contains no anchor with an http(s) href', () => {
    const container = renderSurface();
    const anchors = container.querySelectorAll('a[href]');
    for (const a of Array.from(anchors)) {
      const href = a.getAttribute('href') ?? '';
      expect(/^https?:/.test(href)).toBe(false);
    }
  });

  it('the approvals surface contains no enabled buttons', () => {
    const container = renderSurface();
    const buttons = container.querySelectorAll('button');
    for (const btn of Array.from(buttons)) {
      const isAriaDisabled = btn.getAttribute('aria-disabled') === 'true';
      expect(
        (btn as HTMLButtonElement).disabled || isAriaDisabled,
        `enabled button found in approvals surface: ${btn.outerHTML.slice(0, 80)}`,
      ).toBe(true);
    }
  });

  it('the approvals surface contains no forms or file inputs', () => {
    const container = renderSurface();
    expect(container.querySelector('form')).toBeNull();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });

  it('every disabled action affordance carries a reason caption', () => {
    const container = renderSurface();
    const disabledButtons = container.querySelectorAll(
      '[data-pcc-approvals-action-state="preview-disabled"]',
    );
    expect(disabledButtons.length).toBeGreaterThan(0);
    for (const btn of Array.from(disabledButtons)) {
      const key = btn.getAttribute('data-pcc-approvals-action-key');
      expect(key).not.toBeNull();
      const reason = container.querySelector(`[data-pcc-approvals-action-reason="${key}"]`);
      expect(reason, `missing reason caption for action ${key}`).not.toBeNull();
      expect((reason!.textContent ?? '').length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Deferred-posture seam cards carry no row arrays
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — deferred-posture seams', () => {
  it('decision-history lane carries deferred posture and no approval rows', () => {
    const container = renderSurface();
    const lane = container.querySelector('[data-pcc-approvals-lane="decision-history"]');
    expect(lane).not.toBeNull();
    expect(lane!.getAttribute('data-pcc-approvals-seam-posture')).toBe('deferred');
    expect(lane!.querySelectorAll('[data-pcc-approvals-row]').length).toBe(0);
    expect(lane!.querySelector('[data-pcc-state="not-yet-implemented-operation"]')).not.toBeNull();
  });

  it('lineage lane carries deferred posture and no link or reference rows', () => {
    const container = renderSurface();
    const lane = container.querySelector('[data-pcc-approvals-lane="lineage"]');
    expect(lane).not.toBeNull();
    expect(lane!.getAttribute('data-pcc-approvals-seam-posture')).toBe('deferred');
    expect(lane!.querySelectorAll('[data-pcc-approvals-row]').length).toBe(0);
    // The lineage lane only shows source-module summary rows (composite-derived).
    expect(
      lane!.querySelectorAll('[data-pcc-approvals-lineage-module-row]').length,
    ).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// HBI no-authority panel is scoped to its own lane
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — HBI no-authority panel scoping', () => {
  it('HBI summary copy lives only inside the hbi-boundary lane', () => {
    const container = renderSurface();
    const hbiSummary = container.querySelectorAll('[data-pcc-approvals-hbi-summary]');
    expect(hbiSummary.length).toBe(1);
    const lane = hbiSummary[0]!.closest('[data-pcc-approvals-lane="hbi-boundary"]');
    expect(lane).not.toBeNull();
    expect(container.querySelectorAll('[data-pcc-approvals-hbi-may]').length).toBe(1);
    expect(container.querySelectorAll('[data-pcc-approvals-hbi-may-not]').length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Router pass-through coverage
// ---------------------------------------------------------------------------

describe('PccApprovalsSurface — module-integration ownership posture (Wave 14 / Prompt 06)', () => {
  it('emits one ownership-posture caption per module-integration row', () => {
    const container = renderSurface();
    const lane = container.querySelector('[data-pcc-approvals-lane="module-integration"]');
    expect(lane).not.toBeNull();
    const moduleRows = lane!.querySelectorAll('[data-pcc-approvals-module-row]');
    const postures = lane!.querySelectorAll('[data-pcc-approvals-module-ownership-posture]');
    expect(postures.length).toBe(moduleRows.length);
  });

  it('Wave 13G row carries the feature/UX-authority ownership posture caption (per-row scoped)', () => {
    const container = renderSurface();
    const wave13gPosture = container.querySelector(
      '[data-pcc-approvals-module-ownership-posture="estimating-workbench-wave-13g"]',
    );
    expect(wave13gPosture).not.toBeNull();
    expect(wave13gPosture!.textContent ?? '').toContain(
      'Wave 13G owns estimating feature contracts and UX',
    );
  });
});

describe('PccSurfaceRouter — approvals route pass-through', () => {
  it('passes the readModelClient into PccApprovalsSurface and calls getApprovals once', async () => {
    const spy = vi.fn(async () => envelope('available'));
    // Router test stub: PccSurfaceRouter accepts the full router-level
    // narrow client interface but only exercises `getApprovals` for the
    // `approvals` case. A structural cast through `unknown` keeps the
    // test focused without re-implementing every other read-model method.
    const router = { getApprovals: spy } as unknown as Parameters<
      typeof PccSurfaceRouter
    >[0]['readModelClient'];
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="approvals" readModelClient={router} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-approvals-lane="hbi-boundary"]')).not.toBeNull();
    });
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.length).toBe(1);
  });

  it('renders only one active-surface-panel marker for approvals when router-mounted', async () => {
    const spy = vi.fn(async () => envelope('available'));
    // Router test stub: PccSurfaceRouter accepts the full router-level
    // narrow client interface but only exercises `getApprovals` for the
    // `approvals` case. A structural cast through `unknown` keeps the
    // test focused without re-implementing every other read-model method.
    const router = { getApprovals: spy } as unknown as Parameters<
      typeof PccSurfaceRouter
    >[0]['readModelClient'];
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="approvals" readModelClient={router} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-active-surface-panel="approvals"]')).not.toBeNull();
    });
    const markers = container.querySelectorAll('[data-pcc-active-surface-panel="approvals"]');
    expect(markers.length).toBe(1);
  });

  it('preserves the bento direct-child invariant under router-wrapped render', async () => {
    const spy = vi.fn(async () => envelope('available'));
    // Router test stub: PccSurfaceRouter accepts the full router-level
    // narrow client interface but only exercises `getApprovals` for the
    // `approvals` case. A structural cast through `unknown` keeps the
    // test focused without re-implementing every other read-model method.
    const router = { getApprovals: spy } as unknown as Parameters<
      typeof PccSurfaceRouter
    >[0]['readModelClient'];
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="approvals" readModelClient={router} />
      </PccBentoGrid>,
    );
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-approvals-lane="hbi-boundary"]')).not.toBeNull();
    });
    const markers = container.querySelectorAll('[data-pcc-readiness-section="approvals"]');
    expect(markers.length).toBeGreaterThanOrEqual(PCC_APPROVALS_LANE_IDS.length);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });

  it('renders the loading card before the spy resolves and the ready lanes after', async () => {
    let resolveFn: ((env: PccReadModelEnvelope<PccApprovalsReadModel>) => void) | undefined;
    const promise = new Promise<PccReadModelEnvelope<PccApprovalsReadModel>>((res) => {
      resolveFn = res;
    });
    const spy = vi.fn(() => promise);
    // Router test stub: PccSurfaceRouter accepts the full router-level
    // narrow client interface but only exercises `getApprovals` for the
    // `approvals` case. A structural cast through `unknown` keeps the
    // test focused without re-implementing every other read-model method.
    const router = { getApprovals: spy } as unknown as Parameters<
      typeof PccSurfaceRouter
    >[0]['readModelClient'];
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSurfaceRouter activeSurfaceId="approvals" readModelClient={router} />
      </PccBentoGrid>,
    );
    expect(container.querySelector('[data-pcc-state="loading"]')).not.toBeNull();
    resolveFn?.(envelope('available'));
    await waitFor(() => {
      expect(container.querySelector('[data-pcc-approvals-lane="hbi-boundary"]')).not.toBeNull();
    });
  });
});
