import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PccApp } from '../PccApp';

function activateProjectReadiness(container: HTMLElement): HTMLElement {
  const button = container.querySelector(
    '[data-pcc-surface-id="project-readiness"]',
  );
  expect(button).not.toBeNull();
  fireEvent.click(button!);
  const panel = container.querySelector(
    '[data-pcc-active-surface-panel="project-readiness"]',
  );
  expect(panel).not.toBeNull();
  return panel as HTMLElement;
}

function readinessRegion(container: HTMLElement, region: string): HTMLElement | null {
  return container.querySelector(`[data-pcc-readiness-region="${region}"]`);
}

describe('Project Readiness Center surface', () => {
  it('renders exactly one active-surface marker for project-readiness', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const markers = container.querySelectorAll('[data-pcc-active-surface-panel]');
    expect(markers).toHaveLength(1);
    expect(markers[0].getAttribute('data-pcc-active-surface-panel')).toBe(
      'project-readiness',
    );
  });

  it('renders all six framework regions', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    expect(readinessRegion(container, 'hero')).not.toBeNull();
    expect(readinessRegion(container, 'lifecycle-gates')).not.toBeNull();
    expect(readinessRegion(container, 'domains')).not.toBeNull();
    expect(readinessRegion(container, 'blockers')).not.toBeNull();
    expect(readinessRegion(container, 'evidence-source-health')).not.toBeNull();
    expect(readinessRegion(container, 'downstream-modules')).not.toBeNull();
  });

  it('hero region exposes read-only / no-execution copy', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const hero = readinessRegion(container, 'hero');
    expect(hero).not.toBeNull();
    expect(hero!.textContent).toContain('Read-only readiness framework preview');
    expect(hero!.textContent).toContain('No workflow execution is enabled in Wave 8.');
  });

  it('lifecycle gates region renders gate items from structural markers', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const gates = container.querySelectorAll('[data-pcc-readiness-gate-id]');
    expect(gates.length).toBeGreaterThanOrEqual(1);
  });

  it('domain grid region renders multiple domains from structural markers', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const domains = container.querySelectorAll('[data-pcc-readiness-domain-id]');
    expect(domains.length).toBeGreaterThanOrEqual(2);
  });

  it('blockers region renders the escalated fixture blocker', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const blocker = container.querySelector(
      '[data-pcc-readiness-blocker-id="fixture-pcc-readiness-003"]',
    );
    expect(blocker).not.toBeNull();
  });

  it('evidence and source-health region renders evidence and source-health entries', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const region = readinessRegion(container, 'evidence-source-health');
    expect(region).not.toBeNull();
    const evidenceBuckets = region!.querySelectorAll(
      '[data-pcc-readiness-evidence-state]',
    );
    const sourceHealthEntries = region!.querySelectorAll(
      '[data-pcc-readiness-source-health]',
    );
    expect(evidenceBuckets.length).toBeGreaterThanOrEqual(1);
    expect(sourceHealthEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('downstream modules region marks Wave 9 and Wave 11 RACI as preview-deferred', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const wave9 = container.querySelector(
      '[data-pcc-readiness-downstream-source="project-lifecycle-readiness"]',
    );
    const wave11 = container.querySelector(
      '[data-pcc-readiness-downstream-source="responsibility-matrix"]',
    );
    expect(wave9).not.toBeNull();
    expect(wave11).not.toBeNull();
    expect(wave9!.getAttribute('data-pcc-readiness-downstream-status')).toBe(
      'preview-deferred',
    );
    expect(wave9!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 9');
    expect(wave11!.getAttribute('data-pcc-readiness-downstream-status')).toBe(
      'preview-deferred',
    );
    expect(wave11!.getAttribute('data-pcc-readiness-downstream-wave')).toBe('Wave 11');
    expect(wave11!.textContent).toContain('RACI');
  });

  it('downstream modules region marks Wave 10 / Wave 12 / Wave 13 / Wave 14 as preview-deferred', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const downstreamModuleIds = [
      'permit-log',
      'constraints-log',
      'buyout-log',
      'approvals-checkpoints',
    ] as const;
    for (const id of downstreamModuleIds) {
      const node = container.querySelector(
        `[data-pcc-readiness-downstream-source="${id}"]`,
      );
      expect(node, `expected downstream module ${id}`).not.toBeNull();
      expect(node!.getAttribute('data-pcc-readiness-downstream-status')).toBe(
        'preview-deferred',
      );
    }
  });

  it('readiness surface tree exposes no enabled action buttons', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
  return Array.from(
    container.querySelectorAll<HTMLElement>('[data-pcc-readiness-region]'),
  );
}

describe('Project Readiness Center surface — Wave 8 Prompt 06 hardening', () => {
  it('renders the ownership-accountability region with per-persona entries', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const ownership = readinessRegion(container, 'ownership-accountability');
    expect(ownership).not.toBeNull();
    const entries = ownership!.querySelectorAll('[data-pcc-readiness-ownership-persona]');
    expect(entries.length).toBeGreaterThanOrEqual(2);
  });

  it('flags unassigned-gap items in the ownership region', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const unassignedEntries = container.querySelectorAll(
      '[data-pcc-readiness-ownership-unassigned="true"]',
    );
    expect(unassignedEntries.length).toBeGreaterThanOrEqual(1);
  });

  it('flags safety-qaqc as having an unassigned-gap signal (item 004)', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const safety = container.querySelector(
      '[data-pcc-readiness-ownership-persona="safety-qaqc"]',
    );
    expect(safety).not.toBeNull();
    expect(safety!.getAttribute('data-pcc-readiness-ownership-unassigned')).toBe('true');
  });

  it('renders escalation chips that include project-executive and manager-of-operational-excellence', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const escalations = Array.from(
      container.querySelectorAll('[data-pcc-readiness-ownership-escalation]'),
    ).map((el) => el.getAttribute('data-pcc-readiness-ownership-escalation'));
    expect(escalations).toContain('project-executive');
    expect(escalations).toContain('manager-of-operational-excellence');
  });

  it('renders the priority-actions-preview region with the eligible item', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const preview = readinessRegion(container, 'priority-actions-preview');
    expect(preview).not.toBeNull();
    const entry = preview!.querySelector(
      '[data-pcc-readiness-priority-action-id="priority-action-permit-001"]',
    );
    expect(entry).not.toBeNull();
  });

  it('priority-actions-preview region exposes no enabled actions', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const panel = activateProjectReadiness(container);
    const enabledUpload = Array.from(panel.querySelectorAll('button')).filter(
      (btn) =>
        /^upload$/i.test((btn.textContent ?? '').trim()) && !btn.hasAttribute('disabled'),
    );
    expect(enabledUpload.length).toBe(0);
  });

  it('renders degraded source-health entries for permit-log (stale), buyout-log and external-systems (source-unavailable)', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    activateProjectReadiness(container);
    const permit = container.querySelector(
      '[data-pcc-readiness-source-health="permit-log"]',
    );
    const buyout = container.querySelector(
      '[data-pcc-readiness-source-health="buyout-log"]',
    );
    const external = container.querySelector(
      '[data-pcc-readiness-source-health="external-systems"]',
    );
    expect(permit).not.toBeNull();
    expect(buyout).not.toBeNull();
    expect(external).not.toBeNull();
  });

  it('readiness regions expose no executable-label buttons', () => {
    const forbiddenLabel = /^(submit|approve|upload|run|execute|sync|write\s*back|writeback|complete\s*checklist|run\s*workflow)$/i;
    const { container } = render(<PccApp forceMode="wideDesktop" />);
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
