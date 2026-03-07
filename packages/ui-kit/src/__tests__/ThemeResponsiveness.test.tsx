// @vitest-environment happy-dom
import * as React from 'react';
import { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { HbcThemeProvider } from '../HbcAppShell/HbcThemeContext.js';
import { WorkspacePageShell } from '../WorkspacePageShell/index.js';
import { HbcSidebar } from '../HbcAppShell/HbcSidebar.js';
import { HbcUserMenu } from '../HbcAppShell/HbcUserMenu.js';
import type { SidebarNavGroup, ShellUser } from '../HbcAppShell/types.js';

/**
 * ThemeResponsiveness tests (PH4C.13).
 * Traceability: D-PH4C-26, D-PH4C-27
 *
 * Verifies runtime theme adaptability for migrated Fluent-token surfaces and
 * conditional field-mode variants on shell dropdowns.
 */

type ReactActGlobal = typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean };

const FIELD_MODE_KEY = 'hbc-field-mode';

const mockUser: ShellUser = {
  id: 'u-1',
  displayName: 'Taylor Brown',
  email: 'taylor.brown@hbconstruction.com',
  initials: 'TB',
};

const sidebarGroups: SidebarNavGroup[] = [
  {
    id: 'g-1',
    label: 'Group',
    items: [{ id: 'item-1', label: 'Item', icon: <span>I</span>, href: '/item' }],
  },
];

function setMatchMedia(prefersDark = false): void {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)' ? prefersDark : false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
}

function setViewport(width: number): void {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    writable: true,
    value: width,
  });
  window.dispatchEvent(new Event('resize'));
}

function hexToRgb(hex: string): string {
  const normalized = hex.replace('#', '');
  const value = Number.parseInt(normalized, 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;
  return `rgb(${r}, ${g}, ${b})`;
}

describe('ThemeResponsiveness (PH4C.13)', () => {
  let host: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    (globalThis as ReactActGlobal).IS_REACT_ACT_ENVIRONMENT = true;
    localStorage.clear();
    document.documentElement.removeAttribute('data-hbc-app');
    document.documentElement.removeAttribute('data-theme');
    setMatchMedia(false);
    setViewport(1280);

    host = document.createElement('div');
    document.body.appendChild(host);
    root = createRoot(host);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    host.remove();
    (globalThis as ReactActGlobal).IS_REACT_ACT_ENVIRONMENT = false;
  });

  it('WorkspacePageShell title uses theme-responsive foreground in office mode', () => {
    localStorage.setItem(FIELD_MODE_KEY, 'false');

    act(() => {
      root.render(
        <HbcThemeProvider>
          <WorkspacePageShell layout="detail" title="Project Hub">
            <div>content</div>
          </WorkspacePageShell>
        </HbcThemeProvider>,
      );
    });

    const title = host.querySelector('h1');
    expect(title).not.toBeNull();
    const titleColor = window.getComputedStyle(title as Element).color;
    expect(titleColor).not.toBe('');
    expect(titleColor).not.toBe(hexToRgb('1A1D23'));
  });

  it('WorkspacePageShell title color changes between office and field mode', () => {
    localStorage.setItem(FIELD_MODE_KEY, 'false');
    act(() => {
      root.render(
        <HbcThemeProvider>
          <WorkspacePageShell layout="detail" title="Project Hub">
            <div>content</div>
          </WorkspacePageShell>
        </HbcThemeProvider>,
      );
    });
    const officeColor = window.getComputedStyle(host.querySelector('h1') as Element).color;

    act(() => {
      root.unmount();
    });
    host.innerHTML = '';
    localStorage.setItem(FIELD_MODE_KEY, 'true');

    act(() => {
      root = createRoot(host);
      root.render(
        <HbcThemeProvider>
          <WorkspacePageShell layout="detail" title="Project Hub">
            <div>content</div>
          </WorkspacePageShell>
        </HbcThemeProvider>,
      );
    });

    const fieldColor = window.getComputedStyle(host.querySelector('h1') as Element).color;
    expect(fieldColor).not.toBe('');
    expect(fieldColor).not.toBe(officeColor);
  });

  it('HbcSidebar root surface is theme-responsive and not static white', () => {
    localStorage.setItem(FIELD_MODE_KEY, 'true');

    act(() => {
      root.render(
        <HbcThemeProvider>
          <HbcSidebar groups={sidebarGroups} />
        </HbcThemeProvider>,
      );
    });

    const sidebar = host.querySelector('[data-hbc-ui="sidebar"]');
    expect(sidebar).not.toBeNull();
    const backgroundColor = window.getComputedStyle(sidebar as Element).backgroundColor;
    expect(backgroundColor).not.toBe('');
    expect(backgroundColor).not.toBe(hexToRgb('FFFFFF'));
  });

  it('HbcUserMenu dropdown uses office Fluent tokens and field static variant split', () => {
    const renderMenu = (fieldMode: boolean) => {
      localStorage.setItem(FIELD_MODE_KEY, fieldMode ? 'true' : 'false');
      act(() => {
        root.unmount();
      });
      host.innerHTML = '';
      act(() => {
        root = createRoot(host);
        root.render(
          <HbcThemeProvider>
            <HbcUserMenu user={mockUser} isFieldMode={fieldMode} onToggleFieldMode={() => undefined} />
          </HbcThemeProvider>,
        );
      });

      const trigger = host.querySelector('button[aria-haspopup="menu"]');
      expect(trigger).not.toBeNull();
      act(() => {
        (trigger as HTMLButtonElement).click();
      });
      const dropdown = host.querySelector('[role="menu"]');
      expect(dropdown).not.toBeNull();
      return window.getComputedStyle(dropdown as Element).backgroundColor;
    };

    const officeBackground = renderMenu(false);
    const fieldBackground = renderMenu(true);

    expect(officeBackground).not.toBe('');
    expect([hexToRgb('1A2332'), '#1A2332']).toContain(fieldBackground);
    expect(fieldBackground).not.toBe(officeBackground);
  });
});
