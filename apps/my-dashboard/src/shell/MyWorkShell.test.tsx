import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import { MY_WORK_ACTIVE_PANEL_ID, MyWorkShell } from './MyWorkShell.js';

afterEach(() => {
  cleanup();
});

describe('MyWorkShell — composition and data-attribute contract', () => {
  it('renders the shell root with shell + mode + view-state markers', () => {
    const { container } = render(<MyWorkShell />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell).not.toBeNull();
    expect(shell.getAttribute('data-my-work-shell')).toBe('thin');
    // Initial mode is the hook's default (no ResizeObserver in jsdom).
    expect(shell.getAttribute('data-my-work-shell-mode')).toBe('standardLaptop');
    expect(shell.getAttribute('data-my-work-view-state')).toBe('home');
  });

  it('renders exactly one active-surface-panel marker, on a <main role="tabpanel">', () => {
    const { container } = render(<MyWorkShell />);
    const panels = container.querySelectorAll('[data-my-work-active-surface-panel]');
    expect(panels).toHaveLength(1);
    const main = panels[0] as HTMLElement;
    expect(main.tagName).toBe('MAIN');
    expect(main.id).toBe(MY_WORK_ACTIVE_PANEL_ID);
    expect(main.getAttribute('role')).toBe('tabpanel');
    expect(main.getAttribute('aria-labelledby')).toBe('my-work-tab-my-work-home');
    expect(main.getAttribute('data-my-work-active-surface-panel')).toBe('my-work-home');
  });

  it('renders the command-surface region and canvas wrapper exactly once each', () => {
    const { container } = render(<MyWorkShell />);
    expect(container.querySelectorAll('[data-my-work-command-surface]')).toHaveLength(1);
    expect(container.querySelectorAll('[data-my-work-canvas]')).toHaveLength(1);
  });

  it('mounts the primary navigation inside the command surface', () => {
    const { container } = render(<MyWorkShell />);
    const commandSurface = container.querySelector('[data-my-work-command-surface]')!;
    expect(commandSurface.querySelector('[data-my-work-primary-navigation]')).not.toBeNull();
  });

  it('forwards forceMode to the breakpoint marker and density', () => {
    const { container } = render(<MyWorkShell forceMode="phone" />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell.getAttribute('data-my-work-shell-mode')).toBe('phone');
    const tablist = container.querySelector('[data-my-work-primary-navigation]')!;
    expect(tablist.getAttribute('data-my-work-tabs-density')).toBe('compact');
  });

  it('flips view-state to "focused-module" once the Adobe module is selected', () => {
    const { container } = render(<MyWorkShell />);
    const shell = container.querySelector('[data-my-work-shell]') as HTMLElement;
    expect(shell.getAttribute('data-my-work-view-state')).toBe('home');

    const launcher = container.querySelector(
      '[data-my-work-module-launcher="my-work-home"]',
    ) as HTMLButtonElement;
    fireEvent.click(launcher);

    const item = container.querySelector(
      '[data-my-work-module-menu-item="adobe-sign-action-queue"]',
    ) as HTMLButtonElement;
    fireEvent.click(item);

    expect(shell.getAttribute('data-my-work-view-state')).toBe('focused-module');
    // active surface panel stays anchored to my-work-home (still the only surface).
    const main = container.querySelector('[data-my-work-active-surface-panel]') as HTMLElement;
    expect(main.getAttribute('data-my-work-active-surface-panel')).toBe('my-work-home');
    expect(main.getAttribute('aria-labelledby')).toBe('my-work-tab-my-work-home');
  });

  it('renders provided active-panel children', () => {
    const { container } = render(
      <MyWorkShell>
        <div data-test-child="">child content</div>
      </MyWorkShell>,
    );
    const main = container.querySelector(`#${MY_WORK_ACTIVE_PANEL_ID}`) as HTMLElement;
    expect(main.querySelector('[data-test-child]')?.textContent).toBe('child content');
  });
});
