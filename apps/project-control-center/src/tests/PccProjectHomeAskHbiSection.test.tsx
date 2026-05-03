/**
 * Wave 99 / Prompt 06C — PccProjectHomeAskHbiSection focused test suite.
 *
 * Verifies the section renders one wide PccDashboardCard carrying the
 * AskHbiGroundingPreviewPanel (06B) starting in idle posture
 * (initialQuery={null}), proves that selecting a sample query triggers
 * exactly one getUnifiedSearch call with the trimmed query, and
 * locks the non-routing posture (no surface-id / active-surface-panel
 * markers for ask-hbi or unified-search; no live external URLs).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, waitFor } from '@testing-library/react';
import {
  SAMPLE_PROJECT_PROFILE,
  type PccPersona,
  type PccProjectId,
} from '@hbc/models/pcc';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectHomeAskHbiSection } from '../surfaces/projectHome/PccProjectHomeAskHbiSection';
import {
  ASK_HBI_PANEL_DISCLAIMER,
  ASK_HBI_SAMPLE_QUERIES,
  type IPccUnifiedSearchReadModelClient,
} from '../surfaces/unifiedLifecycle/index.js';

const PROJECT_ID: PccProjectId = SAMPLE_PROJECT_PROFILE.projectId;

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => {
      throw new Error('fetch must not be called by the section with the fixture client');
    }),
  );
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function renderSection(
  client: IPccUnifiedSearchReadModelClient,
  viewerPersona: PccPersona = 'project-manager',
) {
  return render(
    <PccBentoGrid forceMode="wideDesktop">
      <PccProjectHomeAskHbiSection
        client={client}
        projectId={PROJECT_ID}
        viewerPersona={viewerPersona}
      />
    </PccBentoGrid>,
  );
}

// ─────────────────────────────────────────────────────────────────────
// Card chrome + idle-on-mount posture
// ─────────────────────────────────────────────────────────────────────

describe('PccProjectHomeAskHbiSection — card chrome and idle-on-mount posture', () => {
  it('renders exactly one PccDashboardCard with the canonical title and footprint="wide"', () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    const cards = container.querySelectorAll('[data-pcc-card]');
    expect(cards).toHaveLength(1);
    const card = cards[0]!;
    expect(card.getAttribute('data-pcc-footprint')).toBe('wide');
    const heading = card.querySelector('h3');
    expect(heading?.textContent?.trim()).toBe('Ask HBI — Grounded Project Answers');
    const grid = container.querySelector('[data-pcc-bento-grid]');
    expect(grid).not.toBeNull();
    expect(card.parentElement === grid).toBe(true);
  });

  it('panel mounts in idle posture (no client call) and renders the disclaimer + all sample buttons', () => {
    const spy = vi.fn(async () => {
      throw new Error('client must not be called on idle mount');
    });
    const client: IPccUnifiedSearchReadModelClient = { getUnifiedSearch: spy };
    const { container } = renderSection(client);
    const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
    expect(panel).not.toBeNull();
    expect(panel!.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('idle');
    expect(spy).not.toHaveBeenCalled();
    const disclaimer = container.querySelector('[data-pcc-ask-hbi-disclaimer]');
    expect(disclaimer?.textContent ?? '').toBe(ASK_HBI_PANEL_DISCLAIMER);
    const buttons = container.querySelectorAll('[data-pcc-ask-hbi-sample-query]');
    expect(buttons).toHaveLength(ASK_HBI_SAMPLE_QUERIES.length);
    expect(
      container.querySelectorAll('[data-pcc-ask-hbi-sample-query-active="true"]').length,
    ).toBe(0);
  });
});

// ─────────────────────────────────────────────────────────────────────
// Sample-query click triggers the hook seam
// ─────────────────────────────────────────────────────────────────────

describe('PccProjectHomeAskHbiSection — sample-query click triggers getUnifiedSearch', () => {
  it('selecting a sample query invokes getUnifiedSearch exactly once with the trimmed query and viewer persona', async () => {
    const spy = vi.fn(async (...args: readonly unknown[]) => {
      void args;
      // Delegate to the canonical fixture so the panel transitions to ready
      // and renders grounded + refusal answers.
      return createPccFixtureReadModelClient().getUnifiedSearch(
        PROJECT_ID,
        'project-manager',
      );
    });
    const client: IPccUnifiedSearchReadModelClient = { getUnifiedSearch: spy };
    const { container } = renderSection(client, 'project-executive');
    const target = ASK_HBI_SAMPLE_QUERIES[2];
    const button = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${target}"]`,
    );
    expect(button).not.toBeNull();
    fireEvent.click(button!);
    await waitFor(() => expect(spy).toHaveBeenCalledTimes(1));
    expect(spy).toHaveBeenCalledWith(PROJECT_ID, 'project-executive', target);
    await waitFor(() => {
      const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
      expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('ready');
    });
    const grounded = container.querySelectorAll(
      '[data-pcc-unified-search-answer-kind="grounded"]',
    );
    expect(grounded.length).toBeGreaterThan(0);
    for (const row of grounded) {
      expect(
        row.querySelectorAll('[data-pcc-unified-search-citation-id]').length,
      ).toBeGreaterThan(0);
    }
  });

  it('refusal answer renders refusal reason and zero citations after sample-query click resolves', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    const target = ASK_HBI_SAMPLE_QUERIES[0];
    const button = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${target}"]`,
    );
    fireEvent.click(button!);
    await waitFor(() =>
      expect(
        container.querySelectorAll('[data-pcc-unified-search-answer-kind="refusal"]').length,
      ).toBeGreaterThan(0),
    );
    const refusalRows = container.querySelectorAll(
      '[data-pcc-unified-search-answer-kind="refusal"]',
    );
    for (const row of refusalRows) {
      expect(row.querySelectorAll('[data-pcc-unified-search-citation-id]').length).toBe(0);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Non-routing posture + no live external URLs
// ─────────────────────────────────────────────────────────────────────

describe('PccProjectHomeAskHbiSection — non-routing posture and no live external URLs', () => {
  it('does not emit ask-hbi or unified-search routed-surface markers on idle mount', () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    for (const id of ['ask-hbi', 'unified-search'] as const) {
      expect(container.querySelector(`[data-pcc-surface-id="${id}"]`)).toBeNull();
      expect(container.querySelector(`[data-pcc-active-surface-panel="${id}"]`)).toBeNull();
    }
  });

  it('does not emit ask-hbi or unified-search routed-surface markers after the user selects a sample query', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    const button = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${ASK_HBI_SAMPLE_QUERIES[0]}"]`,
    );
    fireEvent.click(button!);
    await waitFor(() => {
      const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
      expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('ready');
    });
    for (const id of ['ask-hbi', 'unified-search'] as const) {
      expect(container.querySelector(`[data-pcc-surface-id="${id}"]`)).toBeNull();
      expect(container.querySelector(`[data-pcc-active-surface-panel="${id}"]`)).toBeNull();
    }
  });

  it('renders zero anchors with live external URLs at any panel state', async () => {
    const client = createPccFixtureReadModelClient();
    const { container } = renderSection(client);
    expect(container.querySelectorAll('a[href]').length).toBe(0);
    const button = container.querySelector<HTMLButtonElement>(
      `[data-pcc-ask-hbi-sample-query="${ASK_HBI_SAMPLE_QUERIES[0]}"]`,
    );
    fireEvent.click(button!);
    await waitFor(() => {
      const panel = container.querySelector('[data-pcc-ask-hbi-panel]');
      expect(panel?.getAttribute('data-pcc-ask-hbi-panel-state')).toBe('ready');
    });
    const anchors = container.querySelectorAll<HTMLAnchorElement>('a[href]');
    expect(anchors.length).toBe(0);
  });
});
