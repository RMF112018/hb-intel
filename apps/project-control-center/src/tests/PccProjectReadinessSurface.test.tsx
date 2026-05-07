import { afterEach, describe, it, expect, vi } from 'vitest';
import { cleanup, fireEvent, render, waitFor } from '@testing-library/react';
import { PccApp } from '../PccApp';
import { PccBentoGrid } from '../layout/PccBentoGrid';
import { PccProjectReadinessSurface } from '../surfaces/projectReadiness/PccProjectReadinessSurface';
import { createPccFixtureReadModelClient } from '../api/pccFixtureReadModelClient';

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector('[data-pcc-tab-id="project-readiness"]');
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

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — command-first inversion
//
// The default Project Readiness view is now command-first: only the
// hero/native command-critical readiness cards plus a single
// module-index card render. The seven embedded module sections
// (lifecycle-readiness-center, permit-inspection-control-center,
// responsibility-matrix, constraints-log, buyout-log, procore-source-
// confidence, unified-lifecycle) are absent from the default DOM.
// Wiring the detail-section renderer that brings them back is
// Prompt 02's deliverable; presence-based assertions move there.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — Wave 15A B5 default command-first absence', () => {
  it('default render contains no lifecycle-readiness-center section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="lifecycle-readiness-center"]')
        .length,
    ).toBe(0);
  });

  it('default render contains no permit-inspection-control-center section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="permit-inspection-control-center"]')
        .length,
    ).toBe(0);
  });

  it('default render contains no responsibility-matrix section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="responsibility-matrix"]').length,
    ).toBe(0);
  });

  it('default render contains no constraints-log section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-section="constraints-log"]').length,
    ).toBe(0);
  });

  it('default render contains no buyout-log section markers', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(container.querySelectorAll('[data-pcc-readiness-section="buyout-log"]').length).toBe(0);
  });

  it('default render contains no procore-source-confidence region marker', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(
      container.querySelectorAll('[data-pcc-readiness-region="procore-source-confidence"]').length,
    ).toBe(0);
  });

  it('default render contains no unified-lifecycle body markers (timeline / project-memory / related-records)', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
  });

  it('default render exposes a module-index region with strictly local view-selection controls', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    activateProjectReadiness(container);
    const moduleIndex = container.querySelector('[data-pcc-readiness-region="module-index"]');
    expect(moduleIndex).not.toBeNull();
    const controls = moduleIndex!.querySelectorAll('[data-pcc-readiness-drilldown-control]');
    // 1 command overview + 7 detail sections
    expect(controls).toHaveLength(8);
    const enabled = Array.from(controls).filter(
      (c) =>
        !(c as HTMLButtonElement).disabled &&
        (c as HTMLButtonElement).getAttribute('aria-disabled') !== 'true',
    );
    // Only the command-overview control is enabled in Prompt 01;
    // detail controls are disabled until Prompt 02 wires the renderer.
    expect(enabled).toHaveLength(1);
    expect(enabled[0].getAttribute('data-pcc-readiness-drilldown-control')).toBe('command');
    expect(enabled[0].getAttribute('aria-pressed')).toBe('true');
    expect(enabled[0].getAttribute('data-pcc-readiness-drilldown-state')).toBe('selected');
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — fixture-only fallback (no readModelClient)
//
// When no readModelClient is supplied, the surface renders the
// hero/native command-critical readiness cards plus the module-index
// card. None of the seven embedded module sections render in the
// default command view.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — fixture-only fallback (command-first default)', () => {
  it('renders no embedded module section markers when no readModelClient is supplied', () => {
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface />
      </PccBentoGrid>,
    );
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="lifecycle-readiness-center"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="permit-inspection-control-center"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-section="responsibility-matrix"]'),
    ).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="constraints-log"]')).toBeNull();
    expect(container.querySelector('[data-pcc-readiness-section="buyout-log"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-readiness-region="procore-source-confidence"]'),
    ).toBeNull();
    // Hero (active-surface marker) and module-index region must still render.
    expect(
      container.querySelector('[data-pcc-active-surface-panel="project-readiness"]'),
    ).not.toBeNull();
    expect(container.querySelector('[data-pcc-readiness-region="module-index"]')).not.toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — unified-lifecycle hook unconditional-call
// lock under command-first default
//
// Even though the unified-lifecycle section is NOT rendered by default
// in Prompt 01, its hook is still called from ReadModelContent so the
// Wave decision #8 (unconditional read-model hooks) contract holds and
// Prompt 02's detail-section renderer can swap content in without an
// extra fetch round-trip. This block replaces the pre-Prompt-01
// presence-of-body-markers test with a hook-call-count assertion plus
// a structural absence assertion.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — unified lifecycle hook unconditional-call lock', () => {
  afterEach(() => {
    cleanup();
  });

  it('mounting the surface with a read-model client invokes getUnifiedLifecycle exactly once even though body markers are absent in the default command view', async () => {
    const client = createPccFixtureReadModelClient();
    const unifiedLifecycleSpy = vi.spyOn(client, 'getUnifiedLifecycle');
    const { container } = render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );
    await waitFor(() => expect(unifiedLifecycleSpy).toHaveBeenCalledTimes(1));
    // Default command view does not render the unified-lifecycle cards.
    expect(container.querySelector('[data-pcc-lifecycle-timeline]')).toBeNull();
    expect(container.querySelector('[data-pcc-project-memory]')).toBeNull();
    expect(container.querySelector('[data-pcc-related-records]')).toBeNull();
    // No unified-lifecycle route or workspace marker is introduced.
    expect(container.querySelector('[data-pcc-tab-id="unified-lifecycle"]')).toBeNull();
    expect(
      container.querySelector('[data-pcc-active-surface-panel="unified-lifecycle"]'),
    ).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────
// Wave 15A B5 / Prompt 01 — non-call architectural lock (extended)
//
// Eight read-model hook acquisitions (six embedded-module/readiness
// hooks + Procore + Unified Lifecycle) each call their canonical
// client method exactly once. The lock holds even though detail
// section components are not rendered in the default command view.
// ─────────────────────────────────────────────────────────────────────

describe('Project Readiness Center surface — non-call architectural lock', () => {
  afterEach(() => {
    cleanup();
  });

  it('mounting the surface invokes each of the eight read-model client methods exactly once', async () => {
    const client = createPccFixtureReadModelClient();
    const projectReadinessSpy = vi.spyOn(client, 'getProjectReadiness');
    const lifecycleReadinessSpy = vi.spyOn(client, 'getLifecycleReadiness');
    const permitInspectionSpy = vi.spyOn(client, 'getPermitInspectionControlCenter');
    const responsibilityMatrixSpy = vi.spyOn(client, 'getResponsibilityMatrix');
    const constraintsLogSpy = vi.spyOn(client, 'getConstraintsLog');
    const buyoutLogSpy = vi.spyOn(client, 'getBuyoutLog');
    // Procore hook calls two client methods in parallel; spying on the
    // mapping method is sufficient as canonical proof the procore hook
    // ran once.
    const procoreMappingSpy = vi.spyOn(client, 'getProcoreProjectMapping');
    const unifiedLifecycleSpy = vi.spyOn(client, 'getUnifiedLifecycle');

    render(
      <PccBentoGrid forceMode="desktop">
        <PccProjectReadinessSurface readModelClient={client} />
      </PccBentoGrid>,
    );

    await waitFor(() => expect(projectReadinessSpy).toHaveBeenCalledTimes(1));
    expect(lifecycleReadinessSpy).toHaveBeenCalledTimes(1);
    expect(permitInspectionSpy).toHaveBeenCalledTimes(1);
    expect(responsibilityMatrixSpy).toHaveBeenCalledTimes(1);
    expect(constraintsLogSpy).toHaveBeenCalledTimes(1);
    expect(buyoutLogSpy).toHaveBeenCalledTimes(1);
    expect(procoreMappingSpy).toHaveBeenCalledTimes(1);
    expect(unifiedLifecycleSpy).toHaveBeenCalledTimes(1);
  });
});
