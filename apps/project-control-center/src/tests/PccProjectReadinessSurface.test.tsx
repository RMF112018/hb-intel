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
