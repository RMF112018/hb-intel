import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';

describe('PccShell navigation + state (horizontal tabs)', () => {
  it('renders a horizontal tab for every PCC_MVP_SURFACE_IDS and defaults to project-home', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-horizontal-tabs] [data-pcc-tab-id="${id}"]`);
      expect(tab, `tab for '${id}' should render`).not.toBeNull();
    }
    const initialPanel = container.querySelector('[data-pcc-active-surface-panel="project-home"]');
    expect(initialPanel, 'project-home is the default active surface panel').not.toBeNull();
    const initialTab = container.querySelector('[data-pcc-tab-id="project-home"]');
    expect(initialTab?.getAttribute('aria-selected')).toBe('true');
    expect(initialTab?.getAttribute('data-pcc-tab-active')).toBe('true');
  });

  for (const id of PCC_MVP_SURFACE_IDS) {
    it(`clicking the '${id}' tab updates aria-selected and the active surface panel`, () => {
      const { container } = render(<PccApp forceMode="desktop" />);
      const allTabs = Array.from(
        container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]'),
      ) as HTMLButtonElement[];
      const target = allTabs.find((t) => t.getAttribute('data-pcc-tab-id') === id);
      expect(target, `tab for '${id}' should exist`).toBeDefined();
      fireEvent.click(target!);

      // 1. clicked tab is aria-selected
      expect(target!.getAttribute('aria-selected')).toBe('true');
      expect(target!.getAttribute('data-pcc-tab-active')).toBe('true');

      // 2. all other tabs are not aria-selected
      for (const other of allTabs) {
        if (other === target) continue;
        expect(
          other.getAttribute('aria-selected'),
          `'${other.getAttribute('data-pcc-tab-id')}' must not be aria-selected after selecting '${id}'`,
        ).toBe('false');
      }

      // 3. exactly one active panel exists
      const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(panels).toHaveLength(1);

      // 4. active panel marker equals the clicked surface id
      expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe(id);

      // 5. panel includes that surface's display name from PCC_MVP_SURFACES (the
      //    eyebrow on the surface's primary dashboard card). The surface
      //    description is shell-owned (rendered by PccProjectHeroBand outside the
      //    panel using PCC_SURFACE_HERO_DESCRIPTIONS, which differs from
      //    PCC_MVP_SURFACES.description) and is asserted by the shell hero tests.
      //    Wave-b2 Prompt 03 removed the duplicated context header from happy-path
      //    surfaces, so the surface description is no longer asserted in the panel.
      const surface = PCC_MVP_SURFACES[id];
      expect(panels[0].textContent).toContain(surface.displayName);

      // Hero owns surface description; assert the marker is present and non-empty.
      const heroDescription = container.querySelector('[data-pcc-hero-surface-description]');
      expect(heroDescription).not.toBeNull();
      expect(heroDescription?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    });
  }

  it('tab buttons are not disabled', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tabs = Array.from(
      container.querySelectorAll('[data-pcc-horizontal-tabs] [data-pcc-tab-id]'),
    ) as HTMLButtonElement[];
    for (const tab of tabs) {
      expect(tab.disabled).toBe(false);
    }
  });

  it('ArrowLeft / ArrowRight / Home / End move focus and auto-select per tablist contract', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    const initialActive = container.querySelector('[data-pcc-tab-id][aria-selected="true"]');
    expect(initialActive?.getAttribute('data-pcc-tab-id')).toBe('project-home');

    // ArrowRight from first → second surface auto-selects.
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe(PCC_MVP_SURFACE_IDS[1]);
    expect(
      container
        .querySelector('[data-pcc-active-surface-panel]')
        ?.getAttribute('data-pcc-active-surface-panel'),
    ).toBe(PCC_MVP_SURFACE_IDS[1]);

    // End → last surface.
    fireEvent.keyDown(tablist, { key: 'End' });
    const lastId = PCC_MVP_SURFACE_IDS[PCC_MVP_SURFACE_IDS.length - 1];
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe(lastId);
    expect(
      container
        .querySelector('[data-pcc-active-surface-panel]')
        ?.getAttribute('data-pcc-active-surface-panel'),
    ).toBe(lastId);

    // Home → first surface.
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe('project-home');

    // ArrowLeft from first → wraps to last.
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(
      container
        .querySelector('[data-pcc-tab-id][aria-selected="true"]')
        ?.getAttribute('data-pcc-tab-id'),
    ).toBe(lastId);
  });

  it('Enter and Space activate tabs once and keep selected-tab/panel ids aligned', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement;
    fireEvent.keyDown(documentsTab, { key: 'Enter' });
    fireEvent.keyUp(documentsTab, { key: 'Enter' });

    const selectedAfterEnter = container.querySelector('[data-pcc-tab-id][aria-selected="true"]');
    const panelAfterEnter = container.querySelector('[data-pcc-active-surface-panel]');
    expect(selectedAfterEnter?.getAttribute('data-pcc-tab-id')).toBe('documents');
    expect(panelAfterEnter?.getAttribute('data-pcc-active-surface-panel')).toBe('documents');

    const approvalsTab = container.querySelector(
      '[data-pcc-tab-id="approvals"]',
    ) as HTMLButtonElement;
    fireEvent.keyDown(approvalsTab, { key: ' ' });
    fireEvent.keyUp(approvalsTab, { key: ' ' });

    const selectedAfterSpace = container.querySelector('[data-pcc-tab-id][aria-selected="true"]');
    const panelAfterSpace = container.querySelector('[data-pcc-active-surface-panel]');
    expect(selectedAfterSpace?.getAttribute('data-pcc-tab-id')).toBe('approvals');
    expect(panelAfterSpace?.getAttribute('data-pcc-active-surface-panel')).toBe('approvals');
  });

  it('clicking a tab activates it and updates the panel + hero secondary title and description', () => {
    const { container } = render(<PccApp forceMode="desktop" />);
    const documentsTab = container.querySelector(
      '[data-pcc-tab-id="documents"]',
    ) as HTMLButtonElement;
    fireEvent.click(documentsTab);
    expect(documentsTab.getAttribute('aria-selected')).toBe('true');
    expect(container.querySelector('[data-pcc-active-surface-panel="documents"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-active-surface-panel="project-home"]')).toBeNull();
    const secondary = container.querySelector('[data-pcc-hero-secondary-title]');
    expect(secondary?.textContent).toBe('Documents');
    const description = container.querySelector('[data-pcc-hero-surface-description]');
    expect(description?.textContent).toBe(
      'Project document access posture across SharePoint, OneDrive, and external platforms.',
    );
  });
});
