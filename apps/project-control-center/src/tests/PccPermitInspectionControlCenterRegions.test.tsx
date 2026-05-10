import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PERMIT_INSPECTION_CONTROL_CENTER_FIXTURE } from '@hbc/models/pcc';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';

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
  'priority-action-signals',
  'readiness-signals',
  'approval-signals',
];

function activateProjectReadiness(): HTMLElement {
  // Phase 05 wave-b10 Prompt 04 — render the legacy surface directly.
  const { container } = render(
    <PccBentoGrid forceMode="desktop">
      <PccProjectReadinessSurface />
    </PccBentoGrid>,
  );
  const drilldown = container.querySelector(
    '[data-pcc-readiness-drilldown-control="permits-inspections"]',
  );
  expect(drilldown, 'expected permits-inspections drilldown control').not.toBeNull();
  fireEvent.click(drilldown!);
  return container;
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
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
    for (const region of REQUIRED_REGIONS) {
      expect(permitRegion(container, region), `missing region ${region}`).not.toBeNull();
    }
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — target-added fields', () => {
  it('record-detail surfaces permit revision, applicationValue, and permitFee', () => {
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
    openAllDetails(container);
    const region = permitRegion(container, 'failed-reinspection-queue');
    expect(region).not.toBeNull();
    expect(region!.textContent).toContain('Reinspection fee $250');
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — failed/reinspection lineage', () => {
  it('renders a lineage details element with the failed item summary', () => {
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
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
    const container = activateProjectReadiness();
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

describe('Wave 10 Permit & Inspection Control Center surface — Prompt 06 integrated signal lanes', () => {
  it('priority-action-signals lane renders Wave 10 expired-permit signal', () => {
    const container = activateProjectReadiness();
    const region = permitRegion(container, 'priority-action-signals');
    expect(region).not.toBeNull();
    expect(region!.textContent).toContain('Plumbing permit expired');
    const signals = region!.querySelectorAll('[data-pcc-permit-priority-signal-id]');
    expect(signals.length).toBeGreaterThanOrEqual(1);
  });

  it('readiness-signals lane preserves the locked permit-log source-module identifier', () => {
    const container = activateProjectReadiness();
    const region = permitRegion(container, 'readiness-signals');
    expect(region).not.toBeNull();
    const sourceModuleMarkers = region!.querySelectorAll(
      '[data-pcc-permit-readiness-source-module="permit-log"]',
    );
    expect(sourceModuleMarkers.length).toBeGreaterThanOrEqual(1);
    expect(region!.textContent).toContain('closeout / TCO / CO');
  });

  it('approval-signals lane renders all four required checkpoint trigger concepts', () => {
    const container = activateProjectReadiness();
    const region = permitRegion(container, 'approval-signals');
    expect(region).not.toBeNull();
    const kindMarkers = Array.from(
      region!.querySelectorAll<HTMLElement>('[data-pcc-permit-approval-checkpoint-kind]'),
    ).map((el) => el.getAttribute('data-pcc-permit-approval-checkpoint-kind'));
    const kinds = new Set(kindMarkers);
    expect(kinds.has('closeout-authorization')).toBe(true);
    expect(kinds.has('no-reinspection-exception')).toBe(true);
    expect(kinds.has('evidence-override-by-reason')).toBe(true);
    expect(kinds.has('transition-exception-override')).toBe(true);
  });

  it('approval-signals lane is metadata-only — no buttons, no forms', () => {
    const container = activateProjectReadiness();
    const region = permitRegion(container, 'approval-signals');
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('button').length).toBe(0);
    expect(region!.querySelectorAll('form').length).toBe(0);
    expect(region!.querySelectorAll('input').length).toBe(0);
  });
});

describe('Wave 10 Permit & Inspection Control Center surface — Procore / external runtime structural guard', () => {
  const FORBIDDEN_RUNTIME_TOKENS: readonly string[] = [
    'ProcoreClient',
    'syncProcore',
    'writeBack',
    'MSGraphClient',
    'GraphServiceClient',
    'sp.web',
    '_api/web',
  ];
  const FORBIDDEN_BUTTON_LABELS =
    /^(launch|sync|write\s*back|writeback|upload|submit|approve|schedule|request)$/i;

  it('Wave 10 surface renders no anchors at all (AHJ portal URLs are spans)', () => {
    const container = activateProjectReadiness();
    const sectioned = container.querySelectorAll(
      `[data-pcc-readiness-section="${SECTION_MARKER}"]`,
    );
    expect(sectioned.length).toBeGreaterThanOrEqual(REQUIRED_REGIONS.length);
    for (const region of Array.from(sectioned)) {
      expect(region.querySelectorAll('a[href]').length).toBe(0);
    }
  });

  it('Wave 10 surface renders no forms, no file inputs, no enabled buttons', () => {
    const container = activateProjectReadiness();
    const sectioned = container.querySelectorAll(
      `[data-pcc-readiness-section="${SECTION_MARKER}"]`,
    );
    for (const region of Array.from(sectioned)) {
      expect(region.querySelectorAll('input[type="file"]').length).toBe(0);
      expect(region.querySelectorAll('form').length).toBe(0);
      for (const btn of Array.from(region.querySelectorAll('button'))) {
        expect(btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true').toBe(
          true,
        );
      }
    }
  });

  it('Wave 10 rendered DOM does not contain forbidden runtime tokens (Procore/Graph/SharePoint)', () => {
    const container = activateProjectReadiness();
    const sectioned = container.querySelectorAll(
      `[data-pcc-readiness-section="${SECTION_MARKER}"]`,
    );
    for (const region of Array.from(sectioned)) {
      const text = region.textContent ?? '';
      for (const token of FORBIDDEN_RUNTIME_TOKENS) {
        expect(text, `Wave 10 region should not contain "${token}"`).not.toContain(token);
      }
    }
  });

  it('Wave 10 surface has no buttons labeled with executable verbs', () => {
    const container = activateProjectReadiness();
    const sectioned = container.querySelectorAll(
      `[data-pcc-readiness-section="${SECTION_MARKER}"]`,
    );
    for (const region of Array.from(sectioned)) {
      const offenders = Array.from(region.querySelectorAll('button')).filter((b) =>
        FORBIDDEN_BUTTON_LABELS.test((b.textContent ?? '').trim()),
      );
      expect(offenders.length).toBe(0);
    }
  });
});
