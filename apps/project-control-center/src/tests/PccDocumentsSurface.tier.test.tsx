/**
 * Documents — Project Record / working-files / external-launch tier
 * markers and PccDashboardCard hierarchy distinction. Per-component scoped
 * (feedback_per_component_marker_scoping).
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
    const lanes = utils.container.querySelectorAll('[data-pcc-doc-lane]');
    expect(lanes.length).toBeGreaterThanOrEqual(3);
  });
  return utils;
}

function laneRoot(container: HTMLElement, laneId: string): HTMLElement {
  const root = container.querySelector(`[data-pcc-doc-lane="${laneId}"]`);
  expect(root, `lane '${laneId}' should render`).not.toBeNull();
  return root as HTMLElement;
}

function laneCard(container: HTMLElement, laneId: string): HTMLElement {
  const card = laneRoot(container, laneId).closest('[data-pcc-card]');
  expect(card, `lane '${laneId}' should be wrapped in a PccDashboardCard`).not.toBeNull();
  return card as HTMLElement;
}

describe('Documents — lane tier markers', () => {
  it('Project Record lane carries data-pcc-document-lane-tier="source-of-record"', async () => {
    const { container } = await renderDocuments();
    const root = laneRoot(container as HTMLElement, 'project-record');
    expect(root.getAttribute('data-pcc-document-lane-tier')).toBe('source-of-record');
  });

  it('My Project Files lane carries data-pcc-document-lane-tier="working-files"', async () => {
    const { container } = await renderDocuments();
    const root = laneRoot(container as HTMLElement, 'my-project-files');
    expect(root.getAttribute('data-pcc-document-lane-tier')).toBe('working-files');
  });

  it('External Platforms lane carries data-pcc-document-lane-tier="external-launch"', async () => {
    const { container } = await renderDocuments();
    const root = laneRoot(container as HTMLElement, 'external-systems');
    expect(root.getAttribute('data-pcc-document-lane-tier')).toBe('external-launch');
  });
});

describe('Documents — lane card tier/region/footprint distinction', () => {
  // Wave 15A wave-b3 Prompt 05 — lane cards bind to the shared
  // `PccDashboardCard` tier/region contract from
  // 02_SURFACE_CARD_INVENTORY_MATRIX.md. The legacy
  // `data-pcc-card-hierarchy` distinction was retired here (the
  // redesign moves away from `hierarchy` for non-tier-1 cards) and the
  // assertions retarget to the matrix-locked tier/region/footprint
  // markers (per feedback_no_legacy_marker_preservation.md).

  it('Project Record lane card is Tier 2 operational with footprint="wide"', async () => {
    const { container } = await renderDocuments();
    const card = laneCard(container as HTMLElement, 'project-record');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(card.getAttribute('data-pcc-footprint')).toBe('wide');
  });

  it('My Project Files lane card is Tier 2 operational with footprint="standard"', async () => {
    const { container } = await renderDocuments();
    const card = laneCard(container as HTMLElement, 'my-project-files');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier2');
    expect(card.getAttribute('data-pcc-card-region')).toBe('operational');
    expect(card.getAttribute('data-pcc-footprint')).toBe('standard');
  });

  it('External Platforms lane card is Tier 3 deferred with footprint="standard"', async () => {
    const { container } = await renderDocuments();
    const card = laneCard(container as HTMLElement, 'external-systems');
    expect(card.getAttribute('data-pcc-card-tier')).toBe('tier3');
    expect(card.getAttribute('data-pcc-card-region')).toBe('deferred');
    expect(card.getAttribute('data-pcc-footprint')).toBe('standard');
  });
});

describe('Documents — lane eyebrow short-form copy', () => {
  it('renders product-grade short-form eyebrows on each lane card', async () => {
    const { container } = await renderDocuments();

    const projectRecordCard = laneCard(container as HTMLElement, 'project-record');
    const projectRecordEyebrow = projectRecordCard.querySelector('header span');
    expect(projectRecordEyebrow?.textContent).toBe('Source of record');

    const mpfCard = laneCard(container as HTMLElement, 'my-project-files');
    const mpfEyebrow = mpfCard.querySelector('header span');
    expect(mpfEyebrow?.textContent).toBe('Working files');

    const extCard = laneCard(container as HTMLElement, 'external-systems');
    const extEyebrow = extCard.querySelector('header span');
    expect(extEyebrow?.textContent).toBe('External launches');
  });
});

describe('Documents — active-panel ownership preserved', () => {
  it('exactly one [data-pcc-active-surface-panel="documents"] exists, on the header card', async () => {
    const { container } = await renderDocuments();
    const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(panels).toHaveLength(1);
    expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe('documents');
  });
});
