/**
 * Phase 08 wave-b13 Prompt 10C — Documents ready-path tier/region/footprint
 * contract, retargeted from the legacy three-lane composition to the
 * single Explorer card.
 *
 * Lane-tier and lane-eyebrow assertions are retired: the lane cards no
 * longer mount on the available preview ready path. The Explorer card
 * now carries the ready-path tier/region/footprint contract
 * (tier1 / operational / full). Active-panel ownership assertion is
 * preserved verbatim — the Explorer shell emits no
 * `data-pcc-active-surface-panel` marker.
 */

import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, waitFor } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccDocumentsSurface } from '../surfaces/documents/PccDocumentsSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';
import type { IPccDocumentsReadModelClient } from '../surfaces/documents/documentControlViewModel';

afterEach(() => {
  cleanup();
});

function fixtureClient(): IPccDocumentsReadModelClient {
  const base = createPccFixtureReadModelClient();
  return {
    getDocumentControl: (id, persona) => base.getDocumentControl(id, persona),
  };
}

async function renderDocuments() {
  const utils = render(
    <PccBentoGrid forceMode="desktop">
      <PccDocumentsSurface readModelClient={fixtureClient()} />
    </PccBentoGrid>,
  );
  await waitFor(() => {
    expect(utils.container.querySelector('[data-pcc-doc-explorer="true"]')).not.toBeNull();
  });
  return utils;
}

describe('Documents — Prompt 10C legacy lane composition retired from ready path', () => {
  it('available preview ready path renders zero data-pcc-doc-lane elements', async () => {
    const { container } = await renderDocuments();
    expect(container.querySelectorAll('[data-pcc-doc-lane]')).toHaveLength(0);
  });
});

describe('Documents — Prompt 10C Explorer card tier/region/footprint contract', () => {
  it('renders exactly one ready-path Explorer card with tier1 / operational / full', async () => {
    const { container } = await renderDocuments();
    const explorers = container.querySelectorAll('[data-pcc-doc-explorer="true"]');
    expect(explorers).toHaveLength(1);
    const card = explorers[0]!.closest('[data-pcc-card]');
    expect(card, 'Explorer must be wrapped in a PccDashboardCard').not.toBeNull();
    expect(card!.getAttribute('data-pcc-card-tier')).toBe('tier1');
    expect(card!.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(card!.getAttribute('data-pcc-footprint')).toBe('full');
  });
});

describe('Documents — active-panel ownership preserved (Wave 15A wave-b9 Prompt 4B-09)', () => {
  it('zero in-grid card-level [data-pcc-active-surface-panel="documents"] markers on the ready path', async () => {
    const { container } = await renderDocuments();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(0);
  });
});
