import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render } from '@testing-library/react';
import {
  MyWorkPrimaryNavigation,
  type MyWorkPrimaryNavigationProps,
} from './MyWorkPrimaryNavigation.js';
import type { MyWorkModuleId } from '@hbc/models/myWork';

afterEach(() => {
  cleanup();
});

const PANEL_ID = 'my-work-active-surface-panel';

function renderNav(overrides: Partial<MyWorkPrimaryNavigationProps> = {}) {
  const onSelectPrimarySurface = vi.fn();
  const onSelectModule = vi.fn();
  const utils = render(
    <MyWorkPrimaryNavigation
      mode="standardLaptop"
      activePrimarySurfaceId="my-work-home"
      activeModuleId={undefined}
      onSelectPrimarySurface={onSelectPrimarySurface}
      onSelectModule={onSelectModule}
      panelId={PANEL_ID}
      {...overrides}
    />,
  );
  return { ...utils, onSelectPrimarySurface, onSelectModule };
}

function flushFocus(): Promise<void> {
  return new Promise((resolve) => queueMicrotask(() => resolve()));
}

function getTab(container: HTMLElement) {
  return container.querySelector('[data-my-work-tab-id="my-work-home"]') as HTMLButtonElement;
}

function getLauncher(container: HTMLElement) {
  return container.querySelector(
    '[data-my-work-module-launcher="my-work-home"]',
  ) as HTMLButtonElement;
}

function getMenu(container: HTMLElement) {
  return container.querySelector('[data-my-work-module-menu="my-work-home"]');
}

function getMenuItem(container: HTMLElement, id: MyWorkModuleId) {
  return container.querySelector(
    `[data-my-work-module-menu-item="${id}"]`,
  ) as HTMLButtonElement | null;
}

describe('MyWorkPrimaryNavigation — structural contract', () => {
  it('renders exactly one role="tab" with the canonical id and ARIA wiring', () => {
    const { container } = renderNav();
    const tabs = container.querySelectorAll('[data-my-work-primary-navigation] [role="tab"]');
    expect(tabs).toHaveLength(1);
    const tab = tabs[0] as HTMLButtonElement;
    expect(tab.id).toBe('my-work-tab-my-work-home');
    expect(tab.getAttribute('aria-selected')).toBe('true');
    expect(tab.getAttribute('aria-controls')).toBe(PANEL_ID);
    expect(tab.tabIndex).toBe(0);
    expect(tab.getAttribute('data-my-work-tab-active')).toBe('true');
  });

  it('does not introduce any unregistered primary tab ids', () => {
    const { container } = renderNav();
    const tabIds = Array.from(container.querySelectorAll('[data-my-work-tab-id]')).map((el) =>
      el.getAttribute('data-my-work-tab-id'),
    );
    expect(tabIds).toEqual(['my-work-home']);
  });

  it('exposes the launcher with aria-label, aria-haspopup, aria-expanded, and stable aria-controls', () => {
    const { container } = renderNav();
    const launcher = getLauncher(container);
    expect(launcher.getAttribute('aria-label')).toBe('Open My Work Home modules');
    expect(launcher.getAttribute('aria-haspopup')).toBe('menu');
    expect(launcher.getAttribute('aria-expanded')).toBe('false');
    const controlsId = launcher.getAttribute('aria-controls');
    expect(controlsId).toBeTruthy();
    // Menu not yet mounted, so no element with that id exists.
    expect(document.getElementById(controlsId!)).toBeNull();
  });

  it('does not render the module menu until it is opened', () => {
    const { container } = renderNav();
    expect(getMenu(container)).toBeNull();
  });

  it('density flips to "compact" for phone mode', () => {
    const { container } = renderNav({ mode: 'phone' });
    const tablist = container.querySelector('[data-my-work-primary-navigation]')!;
    expect(tablist.getAttribute('data-my-work-tabs-density')).toBe('compact');
    expect(tablist.getAttribute('data-my-work-mode')).toBe('phone');
  });
});

describe('MyWorkPrimaryNavigation — menu contents (Adobe queue)', () => {
  it('renders the Adobe queue menu item with verbatim registry copy when opened', () => {
    const { container } = renderNav();
    fireEvent.click(getLauncher(container));
    const menu = getMenu(container)!;
    expect(menu.getAttribute('role')).toBe('menu');
    expect(menu.getAttribute('data-my-work-module-menu')).toBe('my-work-home');

    const item = getMenuItem(container, 'adobe-sign-action-queue')!;
    expect(item.getAttribute('role')).toBe('menuitem');
    expect(item.getAttribute('data-my-work-module-state')).toBe('read-only');
    expect(item.getAttribute('data-my-work-module-selectable')).toBe('true');
    expect(item.getAttribute('data-my-work-module-active')).toBe('false');
    expect(item.textContent).toContain('Adobe Sign Action Queue');
    expect(item.textContent).toContain('Read-only');
    expect(item.textContent).toContain(
      'Agreements in Adobe Sign that require your review, signature, approval, or other source-defined action.',
    );
    expect(item.textContent).toContain(
      'Queue visibility only. Agreement actions remain in Adobe Sign.',
    );
  });

  it('marks the Adobe item active when activeModuleId matches', () => {
    const { container } = renderNav({ activeModuleId: 'adobe-sign-action-queue' });
    fireEvent.click(getLauncher(container));
    const item = getMenuItem(container, 'adobe-sign-action-queue')!;
    expect(item.getAttribute('data-my-work-module-active')).toBe('true');
  });
});

describe('MyWorkPrimaryNavigation — mouse interaction', () => {
  it('clicking the launcher opens the menu and keeps focus on the toggle', () => {
    const { container } = renderNav();
    const launcher = getLauncher(container);
    launcher.focus();
    fireEvent.click(launcher);
    expect(launcher.getAttribute('aria-expanded')).toBe('true');
    expect(getMenu(container)).not.toBeNull();
    expect(document.activeElement).toBe(launcher);
  });

  it('clicking the launcher again closes the menu', () => {
    const { container } = renderNav();
    const launcher = getLauncher(container);
    fireEvent.click(launcher);
    fireEvent.click(launcher);
    expect(launcher.getAttribute('aria-expanded')).toBe('false');
    expect(getMenu(container)).toBeNull();
  });

  it('clicking the Adobe menu item calls onSelectModule and closes the menu', () => {
    const { container, onSelectModule } = renderNav();
    fireEvent.click(getLauncher(container));
    const item = getMenuItem(container, 'adobe-sign-action-queue')!;
    fireEvent.click(item);
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(onSelectModule).toHaveBeenCalledWith('adobe-sign-action-queue');
    expect(getMenu(container)).toBeNull();
  });

  it('clicking the tab calls onSelectPrimarySurface', () => {
    const { container, onSelectPrimarySurface } = renderNav();
    fireEvent.click(getTab(container));
    expect(onSelectPrimarySurface).toHaveBeenCalledTimes(1);
    expect(onSelectPrimarySurface).toHaveBeenCalledWith('my-work-home');
  });
});

describe('MyWorkPrimaryNavigation — keyboard interaction', () => {
  it('ArrowDown on the tab opens the menu and moves focus to the first item', async () => {
    const { container } = renderNav();
    const tab = getTab(container);
    tab.focus();
    fireEvent.keyDown(tab, { key: 'ArrowDown' });
    expect(getMenu(container)).not.toBeNull();
    await act(async () => {
      await flushFocus();
    });
    expect(document.activeElement).toBe(getMenuItem(container, 'adobe-sign-action-queue'));
  });

  it('ArrowDown on the launcher opens the menu and moves focus to the first item', async () => {
    const { container } = renderNav();
    const launcher = getLauncher(container);
    launcher.focus();
    fireEvent.keyDown(launcher, { key: 'ArrowDown' });
    expect(getMenu(container)).not.toBeNull();
    await act(async () => {
      await flushFocus();
    });
    expect(document.activeElement).toBe(getMenuItem(container, 'adobe-sign-action-queue'));
  });

  it('Enter on the tab calls onSelectPrimarySurface', () => {
    const { container, onSelectPrimarySurface } = renderNav();
    const tab = getTab(container);
    tab.focus();
    fireEvent.keyDown(tab, { key: 'Enter' });
    expect(onSelectPrimarySurface).toHaveBeenCalledWith('my-work-home');
  });

  it('Space on the tab calls onSelectPrimarySurface', () => {
    const { container, onSelectPrimarySurface } = renderNav();
    const tab = getTab(container);
    tab.focus();
    fireEvent.keyDown(tab, { key: ' ' });
    expect(onSelectPrimarySurface).toHaveBeenCalledWith('my-work-home');
  });

  it('Enter on the menu item selects the Adobe module and closes the menu', () => {
    const { container, onSelectModule } = renderNav();
    fireEvent.click(getLauncher(container));
    const item = getMenuItem(container, 'adobe-sign-action-queue')!;
    item.focus();
    fireEvent.keyDown(item, { key: 'Enter' });
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(onSelectModule).toHaveBeenCalledWith('adobe-sign-action-queue');
    expect(getMenu(container)).toBeNull();
  });

  it('Space on the menu item selects the Adobe module and closes the menu', () => {
    const { container, onSelectModule } = renderNav();
    fireEvent.click(getLauncher(container));
    const item = getMenuItem(container, 'adobe-sign-action-queue')!;
    item.focus();
    fireEvent.keyDown(item, { key: ' ' });
    expect(onSelectModule).toHaveBeenCalledTimes(1);
    expect(getMenu(container)).toBeNull();
  });

  it('Escape on a menu item closes the menu and returns focus to the home tab', () => {
    const { container } = renderNav();
    fireEvent.click(getLauncher(container));
    const item = getMenuItem(container, 'adobe-sign-action-queue')!;
    item.focus();
    fireEvent.keyDown(item, { key: 'Escape' });
    expect(getMenu(container)).toBeNull();
    expect(document.activeElement).toBe(getTab(container));
  });

  it('Escape on the launcher closes the menu and returns focus to the home tab', () => {
    const { container } = renderNav();
    const launcher = getLauncher(container);
    launcher.focus();
    fireEvent.click(launcher);
    fireEvent.keyDown(launcher, { key: 'Escape' });
    expect(getMenu(container)).toBeNull();
    expect(document.activeElement).toBe(getTab(container));
  });
});

describe('MyWorkPrimaryNavigation — outside blur', () => {
  it('focus moving outside the nav root closes the menu after a microtask', async () => {
    const outsideButton = document.createElement('button');
    outsideButton.textContent = 'outside';
    document.body.appendChild(outsideButton);
    try {
      const { container } = renderNav();
      fireEvent.click(getLauncher(container));
      const item = getMenuItem(container, 'adobe-sign-action-queue')!;
      item.focus();
      expect(document.activeElement).toBe(item);

      outsideButton.focus();
      expect(document.activeElement).toBe(outsideButton);

      await new Promise<void>((resolve) => queueMicrotask(() => resolve()));

      expect(getMenu(container)).toBeNull();
    } finally {
      outsideButton.remove();
    }
  });
});

describe('MyWorkPrimaryNavigation — aria-controls lifecycle', () => {
  it('toggle aria-controls resolves to a role="menu" element only when open', () => {
    const { container } = renderNav();
    const launcher = getLauncher(container);
    const controlsId = launcher.getAttribute('aria-controls')!;
    expect(document.getElementById(controlsId)).toBeNull();

    fireEvent.click(launcher);
    const mounted = document.getElementById(controlsId);
    expect(mounted).not.toBeNull();
    expect(mounted!.getAttribute('role')).toBe('menu');
    expect(mounted!.getAttribute('data-my-work-module-menu')).toBe('my-work-home');

    fireEvent.click(launcher);
    expect(document.getElementById(controlsId)).toBeNull();
  });
});
