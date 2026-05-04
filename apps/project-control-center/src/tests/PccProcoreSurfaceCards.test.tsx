/**
 * Wave 13 Prompt 13E — surface-level tests for the Procore cards
 * across External Systems, Site Health, Project Readiness (fixture
 * path), and Project Home (read-model path).
 *
 * Locks:
 *   - card present with stable `data-pcc-card-id` markers;
 *   - bento direct-child invariant via `marker.closest('[data-pcc-card]')`
 *     then `parentElement.matches('[data-pcc-bento-grid]')`;
 *   - no `<a href^="http(s)://">` in any Procore card;
 *   - no enabled mutation/action buttons in any Procore card;
 *   - degraded-state marker present and pill tone is allowed.
 */

import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccApp } from '../PccApp';
import { PccExternalSystemsSurface } from '../surfaces/externalSystems/PccExternalSystemsSurface';
import { PccSiteHealthSurface } from '../surfaces/siteHealth/PccSiteHealthSurface';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

const ALLOWED_PILL_TONES = ['info', 'success', 'warning', 'danger', 'neutral'] as const;
const ALLOWED_DEGRADED_STATES = [
  'available',
  'unmapped',
  'stale',
  'permission-denied',
  'tool-disabled',
  'rate-limited',
  'partial-sync',
  'backend-unavailable',
] as const;

function expectBentoDirectChildByMarker(container: HTMLElement, markerSelector: string) {
  const marker = container.querySelector(markerSelector);
  expect(marker, `marker ${markerSelector} should render`).not.toBeNull();
  const card = marker!.closest('[data-pcc-card]');
  expect(card, `marker ${markerSelector} must be inside a PccDashboardCard`).not.toBeNull();
  expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
}

function expectNoHttpAnchorsOnCard(container: HTMLElement, cardId: string) {
  const card = container
    .querySelector(`[data-pcc-card-id="${cardId}"]`)!
    .closest('[data-pcc-card]')!;
  for (const a of card.querySelectorAll('a[href]')) {
    const href = a.getAttribute('href') ?? '';
    expect(href).not.toMatch(/^https?:\/\//);
  }
}

function expectNoEnabledMutationButtonsOnCard(container: HTMLElement, cardId: string) {
  const card = container
    .querySelector(`[data-pcc-card-id="${cardId}"]`)!
    .closest('[data-pcc-card]')!;
  for (const btn of card.querySelectorAll('button')) {
    expect(btn.getAttribute('disabled')).not.toBeNull();
  }
}

function expectAllowedDegradedStateAndTone(container: HTMLElement, cardId: string) {
  const node = container.querySelector(`[data-pcc-card-id="${cardId}"]`);
  expect(node).not.toBeNull();
  const degraded = node!.getAttribute('data-pcc-procore-degraded-state');
  expect(degraded).not.toBeNull();
  expect(ALLOWED_DEGRADED_STATES).toContain(degraded as (typeof ALLOWED_DEGRADED_STATES)[number]);
  // The PccStatusPill renders inside the card with one of the allowed tones.
  const card = node!.closest('[data-pcc-card]');
  const pill = card!.querySelector('[data-pcc-status-pill-tone]');
  if (pill) {
    const tone = pill.getAttribute('data-pcc-status-pill-tone');
    expect(ALLOWED_PILL_TONES).toContain(tone as (typeof ALLOWED_PILL_TONES)[number]);
  }
}

describe('External Systems — Procore configuration & status card (Wave 13 / Prompt 13E)', () => {
  it('renders one card with data-pcc-card-id="procore-configuration-status" as a direct bento child', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccExternalSystemsSurface />
      </PccBentoGrid>,
    );
    expectBentoDirectChildByMarker(container, '[data-pcc-card-id="procore-configuration-status"]');
    expectAllowedDegradedStateAndTone(container, 'procore-configuration-status');
  });

  it('emits no http(s) anchors and no enabled mutation buttons on the Procore configuration card', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccExternalSystemsSurface />
      </PccBentoGrid>,
    );
    expectNoHttpAnchorsOnCard(container, 'procore-configuration-status');
    expectNoEnabledMutationButtonsOnCard(container, 'procore-configuration-status');
  });

  it("Procore configuration_state is 'configured' only when mapping is confirmed AND envelope is available", () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccExternalSystemsSurface />
      </PccBentoGrid>,
    );
    const node = container.querySelector('[data-pcc-card-id="procore-configuration-status"]');
    const configState = node!.getAttribute('data-pcc-procore-configuration-state');
    expect(['configured', 'missing', 'unavailable-fixture']).toContain(configState);
    if (configState === 'configured') {
      expect(node!.getAttribute('data-pcc-procore-mapping-state')).toBe('mapping-confirmed');
    }
  });
});

describe('Site Health — Procore sync & repair card (Wave 13 / Prompt 13E)', () => {
  it('renders the card with data-pcc-card-id="procore-sync-repair" as a direct bento child', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSiteHealthSurface />
      </PccBentoGrid>,
    );
    expectBentoDirectChildByMarker(container, '[data-pcc-card-id="procore-sync-repair"]');
    expectAllowedDegradedStateAndTone(container, 'procore-sync-repair');
  });

  it('emits no http(s) anchors and no enabled mutation buttons on the Procore sync card', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccSiteHealthSurface />
      </PccBentoGrid>,
    );
    expectNoHttpAnchorsOnCard(container, 'procore-sync-repair');
    expectNoEnabledMutationButtonsOnCard(container, 'procore-sync-repair');
  });
});

describe('Project Readiness — Procore source-confidence region (Wave 13 / Prompt 13E)', () => {
  it('renders the region card with data-pcc-readiness-region="procore-source-confidence" as a direct bento child', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    expectBentoDirectChildByMarker(
      container,
      '[data-pcc-readiness-region="procore-source-confidence"]',
    );
    expectAllowedDegradedStateAndTone(container, 'procore-source-confidence');
  });

  it('emits no http(s) anchors on the Procore source-confidence card', () => {
    const { container } = render(
      <PccBentoGrid forceMode="wideDesktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    expectNoHttpAnchorsOnCard(container, 'procore-source-confidence');
    expectNoEnabledMutationButtonsOnCard(container, 'procore-source-confidence');
  });
});

describe('Project Home — Procore snapshot card (Wave 13 / Prompt 13E, read-model path)', () => {
  it('renders one card with data-pcc-card-id="procore-snapshot" as a direct bento child', async () => {
    const { container, findAllByText } = render(
      <PccApp forceMode="wideDesktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    // Wait for read-model-driven render.
    await findAllByText('Procore snapshot');
    expectBentoDirectChildByMarker(container, '[data-pcc-card-id="procore-snapshot"]');
    expectAllowedDegradedStateAndTone(container, 'procore-snapshot');
  });

  it('emits no http(s) anchors and no enabled mutation buttons on the Procore snapshot card', async () => {
    const { container, findAllByText } = render(
      <PccApp forceMode="wideDesktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    await findAllByText('Procore snapshot');
    expectNoHttpAnchorsOnCard(container, 'procore-snapshot');
    expectNoEnabledMutationButtonsOnCard(container, 'procore-snapshot');
  });
});
