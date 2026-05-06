import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { PCC_MVP_SURFACE_IDS, type PccMvpSurfaceId } from '@hbc/models/pcc';
import { PCC_RESPONSIVE_MODES, type PccResponsiveMode } from '../layout/footprints';
import { PccHorizontalTabs } from '../shell/PccHorizontalTabs';

afterEach(() => {
  cleanup();
});

const TAB_LABELS: Record<PccMvpSurfaceId, string> = {
  'project-home': 'Project Home',
  'team-and-access': 'Team',
  documents: 'Documents',
  'project-readiness': 'Project Readiness',
  approvals: 'Approvals',
  'external-systems': 'Apps',
  'control-center-settings': 'Settings',
  'site-health': 'Site Health',
};

function renderTabs(
  overrides: {
    mode?: PccResponsiveMode;
    activeSurfaceId?: PccMvpSurfaceId;
    panelId?: string;
    onSelectSurface?: (id: PccMvpSurfaceId) => void;
  } = {},
) {
  const onSelectSurface = overrides.onSelectSurface ?? vi.fn();
  const result = render(
    <PccHorizontalTabs
      mode={overrides.mode ?? 'standardLaptop'}
      activeSurfaceId={overrides.activeSurfaceId ?? 'project-home'}
      onSelectSurface={onSelectSurface}
      panelId={overrides.panelId}
    />,
  );
  return { ...result, onSelectSurface };
}

describe('PccHorizontalTabs primitive', () => {
  it('renders all 8 PCC MVP tabs in canonical order', () => {
    const { container } = renderTabs();
    const buttons = Array.from(container.querySelectorAll('[data-pcc-tab-id]'));
    expect(buttons).toHaveLength(PCC_MVP_SURFACE_IDS.length);
    const ids = buttons.map((el) => el.getAttribute('data-pcc-tab-id'));
    expect(ids).toEqual([...PCC_MVP_SURFACE_IDS]);
  });

  it('stamps required PCC marker contract on root and each tab', () => {
    const { container } = renderTabs({ mode: 'desktop' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]');
    expect(tablist).not.toBeNull();
    expect(tablist?.getAttribute('role')).toBe('tablist');
    expect(tablist?.getAttribute('data-pcc-mode')).toBe('desktop');

    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`);
      expect(tab, `tab for ${id} should render`).not.toBeNull();
      expect(tab?.getAttribute('role')).toBe('tab');
      expect(tab?.getAttribute('data-pcc-tab-mode')).toBe('desktop');
      expect(tab?.getAttribute('data-pcc-tab-active')).toMatch(/^(true|false)$/);
    }
  });

  it.each(PCC_RESPONSIVE_MODES)('mirrors mode "%s" on every tab marker', (mode) => {
    const { container } = renderTabs({ mode });
    const tabs = Array.from(container.querySelectorAll('[data-pcc-tab-id]'));
    for (const tab of tabs) {
      expect(tab.getAttribute('data-pcc-tab-mode')).toBe(mode);
    }
  });

  it('renders the required PCC-local label for each surface', () => {
    const { container } = renderTabs();
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`);
      expect(tab?.textContent).toContain(TAB_LABELS[id]);
    }
  });

  it('reflects activeSurfaceId via aria-selected, data-pcc-tab-active, and roving tabIndex', () => {
    const { container } = renderTabs({ activeSurfaceId: 'approvals' });
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`) as HTMLButtonElement;
      const isActive = id === 'approvals';
      expect(tab.getAttribute('aria-selected')).toBe(isActive ? 'true' : 'false');
      expect(tab.getAttribute('data-pcc-tab-active')).toBe(isActive ? 'true' : 'false');
      expect(tab.tabIndex).toBe(isActive ? 0 : -1);
    }
  });

  it('icons are decorative (aria-hidden wrapper, no aria-label leak into tab name)', () => {
    const { container } = renderTabs();
    // Each tab carries exactly one decorative icon wrapper marked
    // aria-hidden="true". The wrapper isolates the icon from the accessible
    // name; SVG internals are out of scope for this contract.
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`) as HTMLButtonElement;
      expect(tab.getAttribute('aria-label')).toBeNull();
      const decorativeWrapper = tab.querySelector(':scope > [aria-hidden="true"]');
      expect(
        decorativeWrapper,
        `tab ${id} should have a decorative aria-hidden icon wrapper`,
      ).not.toBeNull();
    }
  });

  it('clicking a non-active tab calls onSelectSurface with that surface id', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'project-home' });
    const target = container.querySelector('[data-pcc-tab-id="approvals"]') as HTMLButtonElement;
    fireEvent.click(target);
    expect(onSelectSurface).toHaveBeenCalledTimes(1);
    expect(onSelectSurface).toHaveBeenCalledWith('approvals');
  });

  it('ArrowRight wraps from last to first', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'site-health' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelectSurface).toHaveBeenCalledWith('project-home');
  });

  it('ArrowLeft wraps from first to last', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'project-home' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    fireEvent.keyDown(tablist, { key: 'ArrowLeft' });
    expect(onSelectSurface).toHaveBeenCalledWith('site-health');
  });

  it('ArrowRight from a middle tab moves to the next surface', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'documents' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    fireEvent.keyDown(tablist, { key: 'ArrowRight' });
    expect(onSelectSurface).toHaveBeenCalledWith('project-readiness');
  });

  it('Home selects the first surface from anywhere', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'documents' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    fireEvent.keyDown(tablist, { key: 'Home' });
    expect(onSelectSurface).toHaveBeenCalledWith('project-home');
  });

  it('End selects the last surface from anywhere', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'documents' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]') as HTMLElement;
    fireEvent.keyDown(tablist, { key: 'End' });
    expect(onSelectSurface).toHaveBeenCalledWith('site-health');
  });

  it('renders each tab as a native <button type="button"> for Enter/Space activation', () => {
    // Native HTML button semantics provide Enter/Space → click activation per
    // the HTML spec; asserting the structural contract keeps the test stable
    // across jsdom versions that do not synthesize click from keyDown.
    const { container } = renderTabs();
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`) as HTMLButtonElement;
      expect(tab.tagName).toBe('BUTTON');
      expect(tab.getAttribute('type')).toBe('button');
    }
  });

  it('Enter activation dispatches exactly one onSelectSurface call', () => {
    const onSelectSurface = vi.fn();
    const { container } = renderTabs({ activeSurfaceId: 'project-home', onSelectSurface });
    const target = container.querySelector('[data-pcc-tab-id="documents"]') as HTMLButtonElement;

    fireEvent.keyDown(target, { key: 'Enter' });
    fireEvent.keyUp(target, { key: 'Enter' });

    expect(onSelectSurface).toHaveBeenCalledTimes(1);
    expect(onSelectSurface).toHaveBeenCalledWith('documents');
  });

  it('Space activation dispatches exactly one onSelectSurface call', () => {
    const onSelectSurface = vi.fn();
    const { container } = renderTabs({ activeSurfaceId: 'project-home', onSelectSurface });
    const target = container.querySelector('[data-pcc-tab-id="approvals"]') as HTMLButtonElement;

    fireEvent.keyDown(target, { key: ' ' });
    fireEvent.keyUp(target, { key: ' ' });

    expect(onSelectSurface).toHaveBeenCalledTimes(1);
    expect(onSelectSurface).toHaveBeenCalledWith('approvals');
  });

  it('passes panelId through as aria-controls on every tab when supplied', () => {
    const { container } = renderTabs({ panelId: 'pcc-active-panel' });
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`);
      expect(tab?.getAttribute('aria-controls')).toBe('pcc-active-panel');
    }
  });

  it('omits aria-controls when no panelId is supplied', () => {
    const { container } = renderTabs();
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`);
      expect(tab?.hasAttribute('aria-controls')).toBe(false);
    }
  });

  it('renders all 8 tabs at phone width (no hidden disclosure)', () => {
    const { container } = renderTabs({ mode: 'phone' });
    const tablist = container.querySelector('[data-pcc-horizontal-tabs]');
    expect(tablist).not.toBeNull();
    expect(tablist?.getAttribute('data-pcc-tabs-density')).toBe('compact');
    const tabs = container.querySelectorAll('[data-pcc-tab-id]');
    expect(tabs).toHaveLength(PCC_MVP_SURFACE_IDS.length);
  });

  it('exposes a structural active indicator independent of text labels', () => {
    const { container } = renderTabs({ activeSurfaceId: 'approvals' });
    for (const id of PCC_MVP_SURFACE_IDS) {
      const tab = container.querySelector(`[data-pcc-tab-id="${id}"]`) as HTMLButtonElement;
      const indicator = tab.querySelector(':scope > [data-pcc-tab-active-indicator]');
      expect(indicator, `tab ${id} should include structural active indicator`).not.toBeNull();
      expect(indicator?.getAttribute('data-pcc-tab-active-indicator-state')).toBe(
        id === 'approvals' ? 'active' : 'inactive',
      );
    }
  });

  it('marks compact density at smallLaptop and below; comfortable above', () => {
    const expectations: Array<[PccResponsiveMode, 'compact' | 'comfortable']> = [
      ['phone', 'compact'],
      ['tabletPortrait', 'compact'],
      ['tabletLandscape', 'compact'],
      ['smallLaptop', 'compact'],
      ['standardLaptop', 'comfortable'],
      ['largeLaptop', 'comfortable'],
      ['desktop', 'comfortable'],
      ['ultrawide', 'comfortable'],
    ];
    for (const [mode, density] of expectations) {
      cleanup();
      const { container } = renderTabs({ mode });
      const tablist = container.querySelector('[data-pcc-horizontal-tabs]');
      expect(
        tablist?.getAttribute('data-pcc-tabs-density'),
        `mode '${mode}' should be ${density}`,
      ).toBe(density);
    }
  });
});
