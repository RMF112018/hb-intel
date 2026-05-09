import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { PccMvpSurfaceId } from '@hbc/models/pcc';
import { PccHorizontalTabs } from '../shell/PccHorizontalTabs';

afterEach(() => {
  cleanup();
});

const TOP_LEVEL_TAB_IDS: readonly PccMvpSurfaceId[] = [
  'project-home',
  'documents',
  'project-readiness',
  'approvals',
];

const PROJECT_HOME_CHILD_IDS: readonly PccMvpSurfaceId[] = [
  'team-and-access',
  'external-systems',
  'control-center-settings',
  'site-health',
];

function renderTabs(
  overrides: {
    activeSurfaceId?: PccMvpSurfaceId;
    panelId?: string;
    onSelectSurface?: (id: PccMvpSurfaceId) => void;
  } = {},
) {
  const onSelectSurface = overrides.onSelectSurface ?? vi.fn();
  const result = render(
    <PccHorizontalTabs
      mode="desktop"
      activeSurfaceId={overrides.activeSurfaceId ?? 'project-home'}
      onSelectSurface={onSelectSurface}
      panelId={overrides.panelId ?? 'pcc-active-panel'}
    />,
  );
  return { ...result, onSelectSurface };
}

describe('PccHorizontalTabs nested navigation', () => {
  it('renders only four visible top-level tabs by default', () => {
    const { container } = renderTabs();
    for (const id of TOP_LEVEL_TAB_IDS) {
      expect(
        container.querySelector(`[data-pcc-horizontal-tabs] [data-pcc-tab-id="${id}"]`),
      ).not.toBeNull();
    }
    for (const id of PROJECT_HOME_CHILD_IDS) {
      expect(
        container.querySelector(`:scope [data-pcc-horizontal-tabs] > [data-pcc-tab-id="${id}"]`),
      ).toBeNull();
    }
  });

  it('Project Home tab click selects project-home', () => {
    const { container, onSelectSurface } = renderTabs({ activeSurfaceId: 'documents' });
    const projectHome = container.querySelector(
      '[data-pcc-tab-id="project-home"]',
    ) as HTMLButtonElement;
    fireEvent.click(projectHome);
    expect(onSelectSurface).toHaveBeenCalledWith('project-home');
  });

  it('caret click opens and closes dropdown without selecting a surface', () => {
    const { container, onSelectSurface } = renderTabs();
    const caret = container.querySelector(
      '[data-pcc-nav-toggle="project-home"]',
    ) as HTMLButtonElement;
    fireEvent.click(caret);
    expect(onSelectSurface).not.toHaveBeenCalled();
    for (const childId of PROJECT_HOME_CHILD_IDS) {
      expect(container.querySelector(`[data-pcc-surface-nav-child="${childId}"]`)).not.toBeNull();
    }
    fireEvent.click(caret);
    for (const childId of PROJECT_HOME_CHILD_IDS) {
      expect(container.querySelector(`[data-pcc-surface-nav-child="${childId}"]`)).toBeNull();
    }
    expect(onSelectSurface).not.toHaveBeenCalled();
  });

  it('mouseEnter alone does not open the menu', () => {
    const { container } = renderTabs();
    const wrapper = container.querySelector(
      '[data-pcc-surface-nav-parent="project-home"]',
    ) as HTMLElement;
    fireEvent.mouseEnter(wrapper);
    for (const childId of PROJECT_HOME_CHILD_IDS) {
      expect(container.querySelector(`[data-pcc-surface-nav-child="${childId}"]`)).toBeNull();
    }
  });

  it('closed dropdown child controls are not tabbable and only active child gets offscreen label when needed', () => {
    const { container } = renderTabs({ activeSurfaceId: 'external-systems' });
    const srOnly = container.querySelector(
      '[data-pcc-sr-only-tab-label]',
    ) as HTMLButtonElement | null;
    expect(srOnly).not.toBeNull();
    expect(srOnly?.getAttribute('id')).toBe('pcc-tab-external-systems');
    expect(srOnly?.tabIndex).toBe(-1);
    expect(container.querySelector('[data-pcc-surface-nav-child="team-and-access"]')).toBeNull();
    expect(container.querySelector('[data-pcc-surface-nav-child="site-health"]')).toBeNull();
  });

  it('ArrowDown on Project Home opens dropdown and exposes first child tab', () => {
    const { container } = renderTabs();
    const projectHome = container.querySelector(
      '[data-pcc-tab-id="project-home"]',
    ) as HTMLButtonElement;
    projectHome.focus();
    fireEvent.keyDown(projectHome, { key: 'ArrowDown' });
    const firstChild = container.querySelector(
      '[data-pcc-surface-nav-child="team-and-access"]',
    ) as HTMLButtonElement | null;
    expect(firstChild).not.toBeNull();
    expect(firstChild?.getAttribute('role')).toBe('tab');
  });

  it('open dropdown child click selects child surface', () => {
    const { container, onSelectSurface } = renderTabs();
    fireEvent.click(
      container.querySelector('[data-pcc-nav-toggle="project-home"]') as HTMLButtonElement,
    );
    fireEvent.click(
      container.querySelector(
        '[data-pcc-surface-nav-child="control-center-settings"]',
      ) as HTMLButtonElement,
    );
    expect(onSelectSurface).toHaveBeenCalledWith('control-center-settings');
  });

  it('prevents duplicate pcc-tab-* ids across closed/open menu states', () => {
    const { container } = renderTabs({ activeSurfaceId: 'team-and-access' });
    const allIds = (): string[] =>
      Array.from(container.querySelectorAll('[id^="pcc-tab-"]'))
        .map((el) => el.getAttribute('id'))
        .filter((id): id is string => Boolean(id));

    const idsClosed = allIds();
    expect(new Set(idsClosed).size).toBe(idsClosed.length);

    fireEvent.click(
      container.querySelector('[data-pcc-nav-toggle="project-home"]') as HTMLButtonElement,
    );
    const idsOpen = allIds();
    expect(new Set(idsOpen).size).toBe(idsOpen.length);
  });

  it('Escape closes menu and returns focus to Project Home tab', () => {
    const { container } = renderTabs({ activeSurfaceId: 'team-and-access' });
    fireEvent.click(
      container.querySelector('[data-pcc-nav-toggle="project-home"]') as HTMLButtonElement,
    );
    const child = container.querySelector(
      '[data-pcc-surface-nav-child="team-and-access"]',
    ) as HTMLButtonElement;
    child.focus();
    fireEvent.keyDown(child, { key: 'Escape' });
    expect(
      container.querySelector('[data-pcc-surface-nav-child]:not([data-pcc-sr-only-tab-label])'),
    ).toBeNull();
    expect(document.activeElement).toBe(
      container.querySelector('[data-pcc-tab-id="project-home"]'),
    );
  });
});
