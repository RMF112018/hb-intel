import { describe, it, expect } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { PCC_MVP_SURFACES, PCC_MVP_SURFACE_IDS } from '@hbc/models/pcc';
import { PccApp } from '../PccApp';

describe('PccShell navigation + state', () => {
  it('renders a rail entry for every PCC_MVP_SURFACE_IDS and defaults to project-home', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    for (const id of PCC_MVP_SURFACE_IDS) {
      const button = container.querySelector(`[data-pcc-rail] [data-pcc-surface-id="${id}"]`);
      expect(button, `rail entry for '${id}' should render`).not.toBeNull();
    }
    const initialPanel = container.querySelector('[data-pcc-active-surface-panel="project-home"]');
    expect(initialPanel, 'project-home is the default active surface panel').not.toBeNull();
    const initialButton = container.querySelector('[data-pcc-surface-id="project-home"]');
    expect(initialButton?.getAttribute('aria-current')).toBe('page');
  });

  for (const id of PCC_MVP_SURFACE_IDS) {
    it(`clicking the '${id}' rail button updates aria-current and the active surface panel`, () => {
      const { container } = render(<PccApp forceMode="wideDesktop" />);
      const allButtons = Array.from(
        container.querySelectorAll('[data-pcc-rail] [data-pcc-surface-id]'),
      ) as HTMLButtonElement[];
      const target = allButtons.find((b) => b.getAttribute('data-pcc-surface-id') === id);
      expect(target, `rail button for '${id}' should exist`).toBeDefined();
      fireEvent.click(target!);

      // 1. clicked button is aria-current page
      expect(target!.getAttribute('aria-current')).toBe('page');

      // 2. all other rail buttons are not aria-current page
      for (const other of allButtons) {
        if (other === target) continue;
        expect(
          other.getAttribute('aria-current'),
          `'${other.getAttribute('data-pcc-surface-id')}' must not be aria-current after selecting '${id}'`,
        ).toBeNull();
      }

      // 3. exactly one active panel exists
      const panels = container.querySelectorAll('[data-pcc-active-surface-panel]');
      expect(panels).toHaveLength(1);

      // 4. active panel marker equals the clicked surface id
      expect(panels[0].getAttribute('data-pcc-active-surface-panel')).toBe(id);

      // 5. panel includes that surface's display name and description from PCC_MVP_SURFACES
      const surface = PCC_MVP_SURFACES[id];
      expect(panels[0].textContent).toContain(surface.displayName);
      expect(panels[0].textContent).toContain(surface.description);
    });
  }

  it('rail surface buttons are not disabled', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const buttons = Array.from(
      container.querySelectorAll('[data-pcc-rail] [data-pcc-surface-id]'),
    ) as HTMLButtonElement[];
    for (const button of buttons) {
      expect(button.disabled).toBe(false);
    }
  });

  it('ArrowDown / ArrowUp / Home / End move focus only and do not auto-activate', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const buttons = Array.from(
      container.querySelectorAll('[data-pcc-rail] [data-pcc-surface-id]'),
    ) as HTMLButtonElement[];
    const initialActive = container.querySelector('[data-pcc-surface-id][aria-current="page"]');
    expect(initialActive?.getAttribute('data-pcc-surface-id')).toBe('project-home');

    buttons[0].focus();
    expect(document.activeElement).toBe(buttons[0]);

    fireEvent.keyDown(buttons[0], { key: 'ArrowDown' });
    expect(document.activeElement).toBe(buttons[1]);

    fireEvent.keyDown(buttons[1], { key: 'End' });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);

    fireEvent.keyDown(buttons[buttons.length - 1], { key: 'Home' });
    expect(document.activeElement).toBe(buttons[0]);

    fireEvent.keyDown(buttons[0], { key: 'ArrowUp' });
    expect(document.activeElement).toBe(buttons[buttons.length - 1]);

    // focus changes alone must not change aria-current
    expect(
      container.querySelector('[data-pcc-surface-id][aria-current="page"]')?.getAttribute('data-pcc-surface-id'),
    ).toBe('project-home');
    expect(container.querySelector('[data-pcc-active-surface-panel]')?.getAttribute('data-pcc-active-surface-panel')).toBe('project-home');
  });

  it('clicking the focused rail button activates it and updates the panel', () => {
    const { container } = render(<PccApp forceMode="wideDesktop" />);
    const documentsButton = container.querySelector('[data-pcc-surface-id="documents"]') as HTMLButtonElement;
    documentsButton.focus();
    expect(document.activeElement).toBe(documentsButton);
    fireEvent.click(documentsButton);
    expect(documentsButton.getAttribute('aria-current')).toBe('page');
    expect(container.querySelector('[data-pcc-active-surface-panel="documents"]')).not.toBeNull();
    expect(container.querySelector('[data-pcc-active-surface-panel="project-home"]')).toBeNull();
  });
});
