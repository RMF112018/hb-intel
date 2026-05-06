import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-surface-id="project-readiness"]');
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector('[data-pcc-active-surface-panel="project-readiness"]');
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function readinessRegion(container: HTMLElement, region: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-readiness-region="${region}"]`);
}

describe('Project Readiness Center surface', () => {
  it('renders exactly one active-surface marker for project-readiness', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(markers).toHaveLength(1);
    expect(markers[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-readiness');
  });

  it('renders all six framework regions', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(readinessRegion(container, 'hero')).not.toBeNull();
    expect(readinessRegion(container, 'lifecycle-gates')).not.toBeNull();
    expect(readinessRegion(container, 'domains')).not.toBeNull();
    expect(readinessRegion(container, 'blockers')).not.toBeNull();
    expect(readinessRegion(container, 'evidence-source-health')).not.toBeNull();
    expect(readinessRegion(container, 'downstream-modules')).not.toBeNull();
  });

  it('hero region exposes the project-readiness badge and no-execution caption', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const hero = readinessRegion(container, 'hero');
    expect(hero).not.toBeNull();
    expect(hero!.textContent).toContain('Project readiness');
    expect(hero!.textContent).toContain(
      'Workflow execution and approvals are managed by your PCC administrator.',
    );
  });

  it('lifecycle gates region renders gate items from structural markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const gates = container.querySelectorAll('[data-pcc-readiness-gate-id]');
    expect(gates.length).toBeGreaterThanOrEqual(1);
  });

  it('domain grid region renders multiple domains from structural markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const domains = container.querySelectorAll('[data-pcc-readiness-domain-id]');
    expect(domains.length).toBeGreaterThanOrEqual(2);
  });

  it('blockers region renders the escalated fixture blocker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const blocker = container.querySelector(
      '[data-pcc-readiness-blocker-id="fixture-pcc-readiness-003"]',
    );
    expect(blocker).not.toBeNull();
  });

  it('evidence and source-health region renders evidence and source-health entries', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = readinessRegion(container, 'evidence-source-health');
    expect(region).not.toBeNull();
    const evidenceBuckets = region!.querySelectorAll('[data-pcc-readiness-evidence-state]');
    const sourceHealthEntries = region!.querySelectorAll('[data-pcc-readiness-source-health]');
    expect(evidenceBuckets.length).toBeGreaterThanOrEqual(1);
    expect(sourceHealthEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('downstream modules region marks Wave 9 as preview-deferred and Wave 11 RACI as implemented', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const wave9 = container.querySelector(
      '[data-pcc-readiness-downstream-source="project-lifecycle-readiness"]',
    );
    const wave11 = container.querySelector(
      '[data-pcc-readiness-downstream-source="responsibility-matrix"]',
    );
    expect(wave9).not.toBeNull();
    expect(wave11).not.toBeNull();
    expect(wave9!.getAttribute('data-pcc-readiness-downstream-status')).toBe('preview-deferred');
    expect(wave9!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 9');
    expect(wave11!.getAttribute('data-pcc-readiness-downstream-status')).toBe('implemented');
    expect(wave11!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 11');
    expect(wave11!.textContent).toContain('RACI');
  });

  it('downstream modules region marks Wave 12 / Wave 14 as preview-deferred', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const downstreamModuleIds = ['constraints-log', 'approvals-checkpoints'] as const;
    for (const id of downstreamModuleIds) {
      const node = container.querySelector(`[data-pcc-readiness-downstream-source="${id}"]`);
      expect(node, `expected downstream module ${id}`).not.toBeNull();
      expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe('preview-deferred');
    }
  });

  it('downstream modules region marks Wave 10 (permit-log) as implemented', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const node = container.querySelector('[data-pcc-readiness-downstream-source="permit-log"]');
    expect(node).not.toBeNull();
    expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe('implemented');
    expect(node!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 10');
    expect(node!.textContent).toContain('Permit & Inspection Control Center');
  });

  it('downstream modules region marks Wave 13 (buyout-log) as implemented', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const node = container.querySelector('[data-pcc-readiness-downstream-source="buyout-log"]');
    expect(node).not.toBeNull();
    expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe('implemented');
    expect(node!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 13');
    expect(node!.textContent).toContain('Buyout Log');
  });

  it('readiness surface tree exposes no enabled action buttons', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panel = activateProjectReadiness(container);
    const buttons = panel.querySelectorAll('button');
    for (const button of Array.from(buttons)) {
      expect(button.hasAttribute('disabled')).toBe(true);
    }
    const links = panel.querySelectorAll('a[href^="http"]');
    expect(links.length).toBe(0);
  });
});

function readinessRegionsAll(container: HTMLElement): readonly HTMLElement[] {
  return Array.from(container.querySelectorAll<HTMLElement>('[data-pcc-readiness-region]'));
}

describe('Project Readiness Center surface — Wave 8 Prompt 06 hardening', () => {
  it('renders the ownership-accountability region with per-persona entries', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const ownership = readinessRegion(container, 'ownership-accountability');
    expect(ownership).not.toBeNull();
    const entries = ownership!.querySelectorAll('[data-pcc-readiness-ownership-persona]');
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('flags unassigned-gap items in the ownership region', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const unassignedEntries = container.querySelectorAll(
      '[data-pcc-readiness-ownership-unassigned="true"]',
    );
    expect(unassignedEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('flags safety-qaqc as having an unassigned-gap signal (item 004)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const safety = container.querySelector('[data-pcc-readiness-ownership-persona="safety-qaqc"]');
    expect(safety).not.toBeNull();
    expect(safety!.getAttribute('data-pcc-readiness-ownership-unassigned')).toBe('true');
  });

  it('renders escalation chips that include project-executive and manager-of-operational-excellence', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const escalations = Array.from(
      container.querySelectorAll('[data-pcc-readiness-ownership-escalation]'),
    ).map((el) => el.getAttribute('data-pcc-readiness-ownership-escalation'));
    expect(escalations).toContain('project-executive');
    expect(escalations).toContain('manager-of-operational-excellence');
  });

  it('renders the priority-actions-preview region with the eligible item', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const preview = readinessRegion(container, 'priority-actions-preview');
    expect(preview).not.toBeNull();
    const entry = preview!.querySelector(
      '[data-pcc-readiness-priority-action-id="priority-action-permit-001"]',
    );
    expect(entry).not.toBeNull();
  });

  it('priority-actions-preview region exposes no enabled actions', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const preview = readinessRegion(container, 'priority-actions-preview');
    expect(preview).not.toBeNull();
    const buttons = preview!.querySelectorAll('button');
    for (const button of Array.from(buttons)) {
      expect(button.hasAttribute('disabled')).toBe(true);
    }
    const externalLinks = preview!.querySelectorAll('a[href^="http"]');
    expect(externalLinks.length).toBe(0);
  });

  it('renders a risk-tag chip on blocker item 003 as open-blocker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const blocker = container.querySelector(
      '[data-pcc-readiness-blocker-id="fixture-pcc-readiness-003"]',
    );
    expect(blocker).not.toBeNull();
    const tag = blocker!.querySelector('[data-pcc-readiness-risk-tag]');
    expect(tag).not.toBeNull();
    expect(tag!.getAttribute('data-pcc-readiness-risk-tag')).toBe('open-blocker');
  });

  it('evidence-source-health region has no upload controls', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = readinessRegion(container, 'evidence-source-health');
    expect(region).not.toBeNull();
    const fileInputs = region!.querySelectorAll('input[type="file"]');
    expect(fileInputs.length).toBe(0);
    const uploadLabeled = Array.from(region!.querySelectorAll('button')).filter((btn) =>
      /^upload$/i.test((btn.textContent ?? '').trim()),
    );
    expect(uploadLabeled.length).toBe(0);
  });

  it('readiness panel has no enabled Upload button', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const panel = activateProjectReadiness(container);
    const enabledUpload = Array.from(panel.querySelectorAll('button')).filter(
      (btn) => /^upload$/i.test((btn.textContent ?? '').trim()) && !btn.hasAttribute('disabled'),
    );
    expect(enabledUpload.length).toBe(0);
  });

  it('renders degraded source-health entries for permit-log (stale), buyout-log and external-systems (source-unavailable)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const permit = container.querySelector('[data-pcc-readiness-source-health="permit-log"]');
    const buyout = container.querySelector('[data-pcc-readiness-source-health="buyout-log"]');
    const external = container.querySelector(
      '[data-pcc-readiness-source-health="external-systems"]',
    );
    expect(permit).not.toBeNull();
    expect(buyout).not.toBeNull();
    expect(external).not.toBeNull();
  });

  it('readiness regions expose no executable-label buttons', () => {
    const forbiddenLabel =
      /^(submit|approve|upload|run|execute|sync|write\s*back|writeback|complete\s*checklist|run\s*workflow)$/i;
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const regions = readinessRegionsAll(container);
    expect(regions.length).toBeGreaterThan(0);
    const offenders: string[] = [];
    for (const region of regions) {
      for (const button of Array.from(region.querySelectorAll('button'))) {
        const label = (button.textContent ?? '').trim();
        if (forbiddenLabel.test(label)) {
          offenders.push(label);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('Wave 9 Lifecycle Readiness Center surface', () => {
  function lifecycleRegion(container: HTMLElement, region: string): HTMLElement | null {
    return container.querySelector(`[data-pcc-readiness-region="${region}"]`);
  }

  function lifecycleSectionRegions(container: HTMLElement): NodeListOf<Element> {
    return container.querySelectorAll('[data-pcc-readiness-section="lifecycle-readiness-center"]');
  }

  it('still renders exactly one active-surface marker for project-readiness', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(markers).toHaveLength(1);
    expect(markers[0].getAttribute('data-pcc-active-surface-panel')).toBe('project-readiness');
  });

  it('renders all nine lifecycle-readiness regions with their markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(lifecycleRegion(container, 'lifecycle-hero')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-map')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-family-domains')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-my-actions')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-blockers-exceptions')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-evidence-readiness')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-future-closeout')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-source-traceability')).not.toBeNull();
    expect(lifecycleRegion(container, 'lifecycle-readiness-signals')).not.toBeNull();
  });

  it('each lifecycle region carries the lifecycle-readiness-center section marker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const sectioned = lifecycleSectionRegions(container);
    expect(sectioned.length).toBe(9);
  });

  it('lifecycle hero surfaces canonical 157 library scope and product-grade copy', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const hero = lifecycleRegion(container, 'lifecycle-hero');
    expect(hero).not.toBeNull();
    expect(hero!.textContent).toContain('Lifecycle readiness');
    expect(hero!.textContent).toContain('Workflow execution is managed by your PCC administrator.');
    expect(hero!.textContent).toContain('157');
  });

  it('lifecycle map renders a row for every canonical phase', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const phases = container.querySelectorAll('[data-pcc-lifecycle-phase-id]');
    expect(phases.length).toBe(10);
  });

  it('family region renders 3 family cards with library counts 55 / 32 / 70 (per-lane scoped queries)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const familyRegion = lifecycleRegion(container, 'lifecycle-family-domains');
    expect(familyRegion).not.toBeNull();
    const startup = familyRegion!.querySelector('[data-pcc-lifecycle-family="startup"]');
    const safety = familyRegion!.querySelector('[data-pcc-lifecycle-family="safety"]');
    const closeout = familyRegion!.querySelector('[data-pcc-lifecycle-family="closeout"]');
    expect(startup).not.toBeNull();
    expect(safety).not.toBeNull();
    expect(closeout).not.toBeNull();
    expect(startup!.textContent).toContain('55');
    expect(safety!.textContent).toContain('32');
    expect(closeout!.textContent).toContain('70');
  });

  it('my actions region renders at least one assigned readiness item', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const items = container.querySelectorAll('[data-pcc-lifecycle-item-id]');
    expect(items.length).toBeGreaterThan(0);
  });

  it('blockers region renders blocker-state buckets and flags the escalated fixture project item', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const blockerRegion = lifecycleRegion(container, 'lifecycle-blockers-exceptions');
    expect(blockerRegion).not.toBeNull();
    const buckets = blockerRegion!.querySelectorAll('[data-pcc-lifecycle-blocker-state]');
    expect(buckets.length).toBeGreaterThanOrEqual(3);
    const escalated = blockerRegion!.querySelector(
      '[data-pcc-lifecycle-blocker-item-id="inst-safety-003"]',
    );
    expect(escalated).not.toBeNull();
  });

  it('evidence region renders 4 evidence-state buckets', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const evidence = lifecycleRegion(container, 'lifecycle-evidence-readiness');
    expect(evidence).not.toBeNull();
    const buckets = evidence!.querySelectorAll('[data-pcc-lifecycle-evidence-state]');
    expect(buckets.length).toBe(4);
  });

  it('future closeout region surfaces the fixture future-closeout item and excludes reference-only', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const future = lifecycleRegion(container, 'lifecycle-future-closeout');
    expect(future).not.toBeNull();
    const expected = future!.querySelector(
      '[data-pcc-lifecycle-future-closeout-item-id="tpl-closeout-002"]',
    );
    expect(expected).not.toBeNull();
    const referenceOnly = future!.querySelector(
      '[data-pcc-lifecycle-future-closeout-item-id="tpl-closeout-003"]',
    );
    expect(referenceOnly).toBeNull();
  });

  it('source traceability region surfaces 157 total + 3 source documents with family + sourceFile', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const trace = lifecycleRegion(container, 'lifecycle-source-traceability');
    expect(trace).not.toBeNull();
    expect(trace!.textContent).toContain('157');
    const docs = trace!.querySelectorAll('[data-pcc-lifecycle-source-document]');
    expect(docs.length).toBe(3);
    const docFiles = Array.from(docs).map((el) =>
      el.getAttribute('data-pcc-lifecycle-source-document'),
    );
    expect(docFiles).toEqual(
      expect.arrayContaining([
        'Project_Startup_Checklist(2).pdf',
        'Project_Safety_Checklist(1).pdf',
        'Project_Closeout_Checklist(2).pdf',
      ]),
    );
  });

  it('lifecycle regions contain no <a href> links and no enabled buttons (inert by structural assertion)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const sectioned = lifecycleSectionRegions(container);
    expect(sectioned.length).toBe(9);
    for (const region of Array.from(sectioned)) {
      expect(region.querySelectorAll('a[href]').length).toBe(0);
      const buttons = region.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        expect(btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true').toBe(
          true,
        );
      }
    }
  });
});

describe('Wave 9 lifecycle item detail and degraded states', () => {
  function lifecycleRegion(container: HTMLElement, region: string): HTMLElement | null {
    return container.querySelector(`[data-pcc-readiness-region="${region}"]`);
  }

  function openAllDetails(container: HTMLElement): void {
    const elements = container.querySelectorAll('details');
    for (const el of Array.from(elements)) (el as HTMLDetailsElement).open = true;
  }

  it('renders <details>/<summary> toggles for each item in My Actions, Blockers, and Future Closeout', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const toggles = container.querySelectorAll('[data-pcc-lifecycle-item-detail-toggle]');
    expect(toggles.length).toBeGreaterThan(0);
  });

  it('detail panel reveals source traceability fields (file, page, section, item-key, exact text)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const myActions = lifecycleRegion(container, 'lifecycle-my-actions');
    expect(myActions).not.toBeNull();
    const exactText = myActions!.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="exact-item-text"]',
    );
    expect(exactText.length).toBeGreaterThan(0);
    const sourceFile = myActions!.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="source-file"]',
    );
    const sourcePage = myActions!.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="source-page"]',
    );
    const sourceSection = myActions!.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="source-section"]',
    );
    const sourceItemKey = myActions!.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="source-item-key"]',
    );
    expect(sourceFile.length).toBeGreaterThan(0);
    expect(sourcePage.length).toBeGreaterThan(0);
    expect(sourceSection.length).toBeGreaterThan(0);
    expect(sourceItemKey.length).toBeGreaterThan(0);
    // Exact source text rendered separately from normalized title.
    const titles = myActions!.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="normalized-title"]',
    );
    expect(titles.length).toBeGreaterThan(0);
    expect(titles[0].textContent).not.toBe(exactText[0].textContent);
  });

  it('detail panel renders unpopulated optional fields as "Not listed" (honest placeholder)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    // At least some optional fields are unpopulated in fixture, e.g. completedAtUtc
    // for items still in `not-started`/`in-progress`/`needs-evidence` status.
    const completedCells = container.querySelectorAll(
      '[data-pcc-lifecycle-item-detail-field="completed"]',
    );
    expect(completedCells.length).toBeGreaterThan(0);
    const hasNotListed = Array.from(completedCells).some((el) => el.textContent === 'Not listed');
    expect(hasNotListed).toBe(true);
  });

  it('evidence external reference URL renders as plain text inside the detail panel — no <a href>', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const myActions = lifecycleRegion(container, 'lifecycle-my-actions');
    expect(myActions).not.toBeNull();
    expect(myActions!.querySelectorAll('a[href]').length).toBe(0);
    const blockers = lifecycleRegion(container, 'lifecycle-blockers-exceptions');
    expect(blockers!.querySelectorAll('a[href]').length).toBe(0);
    const future = lifecycleRegion(container, 'lifecycle-future-closeout');
    expect(future!.querySelectorAll('a[href]').length).toBe(0);
  });

  it('inst-safety-003 detail panel surfaces failed-state marker + exception code without compliance editorializing', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const blockers = lifecycleRegion(container, 'lifecycle-blockers-exceptions');
    expect(blockers).not.toBeNull();
    const safetyItem = blockers!.querySelector(
      '[data-pcc-lifecycle-blocker-item-id="inst-safety-003"]',
    );
    expect(safetyItem).not.toBeNull();
    const failedMarker = safetyItem!.querySelector(
      '[data-pcc-lifecycle-safety-failed-state="true"]',
    );
    expect(failedMarker).not.toBeNull();
    const exceptionCell = safetyItem!.querySelector(
      '[data-pcc-lifecycle-item-detail-field="exception-code"]',
    );
    expect(exceptionCell).not.toBeNull();
    expect(exceptionCell!.textContent).toContain('failed-safety-check');
    // Compliance-language guard is scoped to THIS detail panel only — not
    // the whole lifecycle section — to avoid colliding with approved copy.
    const panelText = safetyItem!.textContent ?? '';
    expect(/compliant|non-compliant|violation|audit pass/i.test(panelText)).toBe(false);
  });

  it('closeout-from-day-one chip renders for closeout-family items with activeByDefault=true', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const chips = container.querySelectorAll('[data-pcc-lifecycle-closeout-from-day-one="true"]');
    expect(chips.length).toBeGreaterThan(0);
  });

  it('all detail-panel buttons (if any) are disabled or aria-disabled', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    openAllDetails(container);
    const sectioned = container.querySelectorAll(
      '[data-pcc-readiness-section="lifecycle-readiness-center"]',
    );
    for (const region of Array.from(sectioned)) {
      const buttons = region.querySelectorAll('button');
      for (const btn of Array.from(buttons)) {
        expect(btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true').toBe(
          true,
        );
      }
    }
  });
});

describe('Wave 9 readiness signals (Prompt 07)', () => {
  function lifecycleRegion(container: HTMLElement, region: string): HTMLElement | null {
    return container.querySelector(`[data-pcc-readiness-region="${region}"]`);
  }

  it('renders 7 signal-bucket markers inside the signals region', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = lifecycleRegion(container, 'lifecycle-readiness-signals');
    expect(region).not.toBeNull();
    const buckets = region!.querySelectorAll('[data-pcc-lifecycle-signal-kind]');
    expect(buckets.length).toBe(7);
    const kinds = Array.from(buckets).map((el) =>
      el.getAttribute('data-pcc-lifecycle-signal-kind'),
    );
    expect(kinds).toEqual([
      'blocked',
      'overdue',
      'missing-evidence',
      'failed-safety',
      'gate-blocking',
      'awaiting-approval',
      'external-reference-issue',
    ]);
  });

  it('renders the seeded approval-posture entries with their checkpoint references', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = lifecycleRegion(container, 'lifecycle-readiness-signals');
    expect(region).not.toBeNull();
    const startup = region!.querySelector(
      '[data-pcc-lifecycle-approval-posture-item-id="inst-startup-002"]',
    );
    const safety = region!.querySelector(
      '[data-pcc-lifecycle-approval-posture-item-id="inst-safety-002"]',
    );
    expect(startup).not.toBeNull();
    expect(safety).not.toBeNull();
    expect(startup!.getAttribute('data-pcc-lifecycle-approval-checkpoint')).toBe(
      'apc-startup-insurance-coi-001',
    );
    expect(safety!.getAttribute('data-pcc-lifecycle-approval-checkpoint')).toBe(
      'apc-safety-hot-work-permits-001',
    );
  });

  it('renders the seeded priority-action promotion entries with their related ids', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = lifecycleRegion(container, 'lifecycle-readiness-signals');
    expect(region).not.toBeNull();
    const startup = region!.querySelector(
      '[data-pcc-lifecycle-priority-action-item-id="inst-startup-003"]',
    );
    const closeout = region!.querySelector(
      '[data-pcc-lifecycle-priority-action-item-id="inst-closeout-001"]',
    );
    expect(startup).not.toBeNull();
    expect(closeout).not.toBeNull();
    expect(startup!.getAttribute('data-pcc-lifecycle-priority-action-promotion-id')).toBe(
      'pa-startup-systems-setup-003',
    );
    expect(closeout!.getAttribute('data-pcc-lifecycle-priority-action-promotion-id')).toBe(
      'pa-closeout-owner-utility-setup-001',
    );
  });

  it('renders per-item signal chips inside the detail panel after opening <details>', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const elements = container.querySelectorAll('details');
    for (const el of Array.from(elements)) (el as HTMLDetailsElement).open = true;
    const blockers = lifecycleRegion(container, 'lifecycle-blockers-exceptions');
    expect(blockers).not.toBeNull();
    const safetyItem = blockers!.querySelector(
      '[data-pcc-lifecycle-blocker-item-id="inst-safety-003"]',
    );
    expect(safetyItem).not.toBeNull();
    const failedSafetyChip = safetyItem!.querySelector(
      '[data-pcc-lifecycle-item-signal-kind="failed-safety"]',
    );
    expect(failedSafetyChip).not.toBeNull();
    const blockedChip = safetyItem!.querySelector(
      '[data-pcc-lifecycle-item-signal-kind="blocked"]',
    );
    expect(blockedChip).not.toBeNull();
  });

  it('signals region contains no <a href> and no enabled buttons (display-only / inert)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const region = lifecycleRegion(container, 'lifecycle-readiness-signals');
    expect(region).not.toBeNull();
    expect(region!.querySelectorAll('a[href]').length).toBe(0);
    const buttons = region!.querySelectorAll('button');
    for (const btn of Array.from(buttons)) {
      expect(btn.hasAttribute('disabled') || btn.getAttribute('aria-disabled') === 'true').toBe(
        true,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Wave 11 — Responsibility Matrix region group is mounted inside the
// Project Readiness surface (not its own router case). These additive
// assertions confirm the embedding without duplicating the comprehensive
// coverage in `PccResponsibilityMatrixRegions.test.tsx`.
// ---------------------------------------------------------------------------

describe('Project Readiness surface — Wave 11 Responsibility Matrix embedding', () => {
  const RM_LANES: readonly string[] = [
    'overview',
    'matrix',
    'register',
    'owner-contract-mapping',
    'my-responsibilities',
    'gaps-and-conflicts',
    'handoffs',
    'template-and-admin',
  ];

  it('renders all 8 Responsibility Matrix lane markers within the project-readiness surface output', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    for (const lane of RM_LANES) {
      expect(
        container.querySelector(`[data-pcc-rm-lane="${lane}"]`),
        `missing Responsibility Matrix lane "${lane}"`,
      ).not.toBeNull();
    }
  });

  it('Responsibility Matrix region cards remain direct children of the bento grid', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll(
      '[data-pcc-readiness-section="responsibility-matrix"]',
    );
    expect(markers.length).toBeGreaterThanOrEqual(RM_LANES.length);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 99 / Prompt 05C — Constraints Log surface-level integration
//
// PccConstraintsLogRegions has its own 18-case test file
// (PccConstraintsLogRegions.test.tsx). The two checks below verify
// the integration AT THE SURFACE LEVEL — that the constraints-log
// section appears under the project-readiness panel and does not
// stand up a separate route or active-surface workspace. No
// duplication of lane-content assertions.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — Constraints Log surface-level integration', () => {
  it('Constraints Log appears as a readiness input on the project-readiness surface; each card is a direct child of the bento grid', () => {
    // The "panel" returned by activateProjectReadiness is the hero
    // card; the constraints-log cards are siblings in the bento grid,
    // so scope the marker query to `container` (matching the existing
    // Responsibility Matrix embedding test pattern).
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll('[data-pcc-readiness-section="constraints-log"]');
    expect(markers.length).toBeGreaterThan(0);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });

  it('Constraints Log is not a separate route or active-surface workspace', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(container.querySelector('[data-pcc-surface-id="constraints-log"]')).toBeNull();
    expect(container.querySelector('[data-pcc-active-surface-panel="constraints-log"]')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 13 / Prompt 05 — Buyout Log surface-level integration
//
// PccBuyoutLogRegions has its own region-level test file
// (PccBuyoutLogRegions.test.tsx). The two checks below verify the
// integration AT THE SURFACE LEVEL — that the buyout-log section
// appears under the project-readiness panel and does not stand up a
// separate route or active-surface workspace.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — Buyout Log surface-level integration', () => {
  it('Buyout Log appears as a readiness input on the project-readiness surface; each card is a direct child of the bento grid', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll('[data-pcc-readiness-section="buyout-log"]');
    expect(markers.length).toBeGreaterThan(0);
    for (const marker of Array.from(markers)) {
      const card = marker.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
  });

  it('Buyout Log is not a separate route or active-surface workspace', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(container.querySelector('[data-pcc-surface-id="buyout-log"]')).toBeNull();
    expect(container.querySelector('[data-pcc-active-surface-panel="buyout-log"]')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 99 / Prompt 05C — Project Readiness fixture-only fallback
//
// When no readModelClient is supplied, the surface renders the five
// existing region groups but does NOT mount the new unified-
// lifecycle section. This locks the unchanged fixture-only path
// per feedback_subsection_integration_non_gating.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — fixture-only fallback excludes unified lifecycle section', () => {
  it('renders the surface without unified-lifecycle body markers when no readModelClient is supplied', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
    // The existing region groups must still render at least one card
    // from each lifecycle-readiness / constraints-log / buyout-log section.
    expect(
      container.querySelector('[data-pcc-readiness-section="lifecycle-readiness-center"]'),
    ).not.toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="constraints-log"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="buyout-log"]')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 99 / Prompt 05C — Project Readiness unified lifecycle integration
//
// Tests in this block mount <PccApp readModelClient={…} /> and use
// waitFor to allow the new section's hook microtask to resolve.
// `afterEach(cleanup)` is scoped to this block (per
// feedback_subsection_integration_non_gating: read-model-driven async
// renders accumulate document.body DOM otherwise; the existing 47
// synchronous tests above don't need cleanup and aren't affected).
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — unified lifecycle integration (read-model-driven)', () => {
  afterEach(() => {
    cleanup();
  });

  it('read-model-driven path renders three unified-lifecycle direct-child cards with the three body markers; warranty / closed-project / lens / search markers are NOT rendered', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    activateProjectReadiness(container);
    // Marker queries scoped to `container` (the new section's cards are
    // siblings of the project-readiness hero in the bento grid).
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    // Three expected body markers, each inside a card that is a
    // direct child of the bento grid.
    for (const marker of [
      'data-pcc-lifecycle-timeline',
      'data-pcc-project-memory',
      'data-pcc-related-records',
    ] as const) {
      const node = container.querySelector(`[${marker}]`);
      expect(node, `expected [${marker}] to render`).not.toBeNull();
      const card = node!.closest('[data-pcc-card]');
      expect(card).not.toBeNull();
      expect(card!.parentElement?.matches('[data-pcc-bento-grid]')).toBe(true);
    }
    // Four other 04C component markers are NOT integrated on Project
    // Readiness in 05C.
    expect(container.querySelector('[data-pcc-project-lens-switcher]')).toBeNull();
    expect(container.querySelector('[data-pcc-warranty-trace]')).toBeNull();
    expect(container.querySelector('[data-pcc-closed-project-reference]')).toBeNull();
    expect(container.querySelector('[data-pcc-unified-search]')).toBeNull();
  });

  it('related-records panel renders source-lineage chips and adds no anchors', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    activateProjectReadiness(container);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-related-records]')).not.toBeNull(),
    );
    const relatedRecords = container.querySelector('[data-pcc-related-records]');
    expect(relatedRecords).not.toBeNull();
    // The 04C RelatedRecordsPanel renders source-lineage chips for
    // unredacted edges via the existing PccStatusPill primitive
    // (data-pcc-pill-tone="info" inside [data-pcc-trace-edge-id]).
    const traceEdges = relatedRecords!.querySelectorAll('[data-pcc-trace-edge-id]');
    expect(traceEdges.length).toBeGreaterThan(0);
    expect(relatedRecords!.querySelectorAll('a[href]').length).toBe(0);
  });

  it('does not introduce a unified-lifecycle route or workspace marker, and adds no forbidden anchor href in the new section', async () => {
    const { container } = render(
      <PccApp forceMode="desktop" readModelClient={createPccFixtureReadModelClient()} />,
    );
    activateProjectReadiness(container);
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );
    expect(container.querySelector('[data-pcc-surface-id="unified-lifecycle"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-active-surface-panel="unified-lifecycle"]'),
    ).toBeNull();
    // Scope anchor scan to the three new section cards (each card body
    // marker's nearest ancestor card). Existing PCC surfaces may legit-
    // imately render anchors elsewhere (e.g., Recent Activity in
    // Project Home) — those are not introduced by this prompt and
    // must not be re-asserted here.
    const sectionCards: HTMLElement[] = [];
    for (const marker of [
      'data-pcc-lifecycle-timeline',
      'data-pcc-project-memory',
      'data-pcc-related-records',
    ] as const) {
      const node = container.querySelector(`[${marker}]`);
      const card = node?.closest('[data-pcc-card]') as HTMLElement | null;
      if (card) sectionCards.push(card);
    }
    expect(sectionCards.length).toBe(3);
    for (const card of sectionCards) {
      const anchors = card.querySelectorAll<HTMLAnchorElement>('a[href]');
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
    }
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 99 / Prompt 05C — non-call architectural lock
//
// The new getUnifiedLifecycle method is consumed exclusively by
// PccProjectReadinessUnifiedLifecycleSection through
// useUnifiedLifecycleReadModel. None of the five existing Project
// Readiness region hooks call it; they each call only their own
// canonical method exactly once.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — non-call architectural lock', () => {
  afterEach(() => {
    cleanup();
  });

  it('mounting the surface invokes each existing region method exactly once and getUnifiedLifecycle exactly once (consumed only by the new section)', async () => {
    // Mount the surface directly (not through PccApp navigation) so the
    // call counts reflect ONLY project-readiness-side hooks. Mounting
    // through PccApp would also activate Project Home first, whose
    // unified-lifecycle section also calls getUnifiedLifecycle —
    // doubling the count and obscuring the architectural contract.
    const client = createPccFixtureReadModelClient();
    const projectReadinessSpy = vi.spyOn(client, 'getProjectReadiness');
    const lifecycleReadinessSpy = vi.spyOn(client, 'getLifecycleReadiness');
    const permitInspectionSpy = vi.spyOn(client, 'getPermitInspectionControlCenter');
    const responsibilityMatrixSpy = vi.spyOn(client, 'getResponsibilityMatrix');
    const constraintsLogSpy = vi.spyOn(client, 'getConstraintsLog');
    const buyoutLogSpy = vi.spyOn(client, 'getBuyoutLog');
    const unifiedLifecycleSpy = vi.spyOn(client, 'getUnifiedLifecycle');

    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() =>
      expect(container.querySelector('[data-pcc-lifecycle-timeline]')).not.toBeNull(),
    );

    // Each existing region hook calls its own method exactly once.
    expect(projectReadinessSpy).toHaveBeenCalledTimes(1);
    expect(lifecycleReadinessSpy).toHaveBeenCalledTimes(1);
    expect(permitInspectionSpy).toHaveBeenCalledTimes(1);
    expect(responsibilityMatrixSpy).toHaveBeenCalledTimes(1);
    expect(constraintsLogSpy).toHaveBeenCalledTimes(1);
    expect(buyoutLogSpy).toHaveBeenCalledTimes(1);
    // The new method is invoked exactly once — by the new section
    // via useUnifiedLifecycleReadModel — NOT by any existing region
    // hook.
    expect(unifiedLifecycleSpy).toHaveBeenCalledTimes(1);
  });
});
