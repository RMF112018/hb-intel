import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';

const SECTION_MARKER = 'permit-inspection-control-center';

const REQUIRED_REGIONS: readonly string[] = [
  'permit-hero',
  'permits-blocking',
  'inspections-ready',
  'failed-reinspection-queue',
  'expiring-permits',
  'fee-exposure-open',
  'evidence-missing',
  'closeout-exposure',
  'ahj-launcher-panel',
  'record-detail',
];

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-surface-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function permitRegion(container: HTMLElement, region: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-permit-region="${region}"]`);
}

function openAllDetails(container: HTMLElement): void {
  for (const el of Array.from(container.querySelectorAll('details'))) {
    (el as HTMLDetailsElement).open = true;
  }
}

describe('Wave 10 Permit & Inspection Control Center surface — bento direct-child invariant', () => {
  it('every Wave 10 section marker resolves to a card whose parent is the bento grid', () => {
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

describe('Wave 10 Permit & Inspection Control Center surface — required lanes', () => {
  it('renders every required Wave 10 region', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    for (const region of REQUIRED_REGIONS) {
      expect(permitRegion(container, region), `missing region ${region}`).not.toBeNull();
    }
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — target-added fields', () => {
  it('record-detail surfaces permit revision, applicationValue, and permitFee', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const region = permitRegion(container, 'record-detail');
    expect(region).not.toBeNull();
    const text = region!.textContent ?? '';
    // pending-revision permit fixture has revision: 2
    expect(text).toContain('Revision 2');
    // active permit fixture has applicationValue 1,250,000 and permitFee 18,750
    expect(text).toContain('1,250,000');
    expect(text).toContain('18,750');
  });

  it('failed-reinspection-queue surfaces inspection reInspectionFee in lineage', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const region = permitRegion(container, 'failed-reinspection-queue');
    expect(region).not.toBeNull();
    expect(region!.textContent).toContain('Reinspection fee $250');
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — failed/reinspection lineage', () => {
  it('renders a lineage details element with the failed item summary', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const region = permitRegion(container, 'failed-reinspection-queue');
    expect(region).not.toBeNull();
    const lineageDetails = region!.querySelectorAll('[data-pcc-permit-lineage-id]');
    expect(lineageDetails.length).toBeGreaterThanOrEqual(1);
    const fixtureLineage = PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.reinspectionLineages[0];
    expect(fixtureLineage).toBeDefined();
    expect(region!.textContent).toContain(fixtureLineage!.failedItemSummary);
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — AHJ launcher-only posture', () => {
  it('renders only launcher-only AHJ profiles and never an external href', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = permitRegion(container, 'ahj-launcher-panel');
    expect(region).not.toBeNull();
    const profiles = region!.querySelectorAll('[data-pcc-ahj-launcher-only]');
    expect(profiles.length).toBeGreaterThanOrEqual(1);
    for (const p of Array.from(profiles)) {
      expect(p.getAttribute('data-pcc-ahj-launcher-only')).toBe('true');
    }
    expect(region!.textContent).toContain('Launcher only');
    expect(region!.querySelectorAll('a[href]').length).toBe(0);
    const portalSpans = region!.querySelectorAll('[data-pcc-ahj-portal-url]');
    expect(portalSpans.length).toBeGreaterThanOrEqual(1);
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — evidence reference-only posture', () => {
  it('evidence-missing region has no upload affordance and labels Document Control ownership', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = permitRegion(container, 'evidence-missing');
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('input[type="file"]').length).toBe(0);
    expect(region!.querySelectorAll('form').length).toBe(0);
    expect(region!.textContent).toContain('Document Control');
    const uploadButtons = Array.from(region!.querySelectorAll('button')).filter((b) =>
      /upload/i.test((b.textContent ?? '').trim()),
    );
    expect(uploadButtons.length).toBe(0);
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — inert posture', () => {
  it('every Wave 10 button is disabled and no external anchor is rendered', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const sectioned = container.querySelectorAll(
      `[data-pcc-readiness-section="${SECTION_MARKER}"]`,
    );
    expect(sectioned.length).toBeGreaterThanOrEqual(REQUIRED_REGIONS.length);
    for (const region of Array.from(sectioned)) {
      const buttons = region.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        expect(btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true').toBe(
          true,
        );
      }
      expect(region.querySelectorAll('a[href^="http"]').length).toBe(0);
    }
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — source traceability', () => {
  it('record-detail rows expose the workbook source-traceability chip', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const region = permitRegion(container, 'record-detail');
    expect(region).not.toBeNull();
    const traceChips = region!.querySelectorAll('[data-pcc-permit-source-traceability]');
    expect(traceChips.length).toBeGreaterThanOrEqual(1);
    expect(region!.textContent).toContain('Permit_Log_Template.xlsx');
    expect(region!.textContent).toContain('PERMITS');
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — hero counts', () => {
  it('hero summary renders fixture-derived counts', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const hero = permitRegion(container, 'permit-hero');
    expect(hero).not.toBeNull();
    const s = PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE.summary;
    const text = hero!.textContent ?? '';
    expect(text).toContain(String(s.permitCount));
    expect(text).toContain(String(s.inspectionCount));
    expect(text).toContain(String(s.failedInspectionCount));
    expect(text).toContain(String(s.openReinspectionCount));
    expect(text).toContain(String(s.ahjLauncherCount));
  });
});
