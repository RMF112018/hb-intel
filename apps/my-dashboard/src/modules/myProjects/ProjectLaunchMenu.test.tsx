import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import { ProjectLaunchMenu } from './ProjectLaunchMenu.js';

afterEach(() => {
  cleanup();
});

function makeRow(overrides: Partial<MyProjectLinkItem>): MyProjectLinkItem {
  const base: MyProjectLinkItem = {
    recordKey: 'projects:1',
    source: 'projects-only',
    projectName: 'Harbor Office Renovation',
    projectNumber: '24-100-01',
    projectStage: 'Construction',
    assignmentRoles: ['project-manager'],
    sharePointAction: {
      state: 'available',
      kind: 'project-site',
      label: 'Open SharePoint Site',
      href: 'https://example.invalid/sites/24-100-01',
    },
    procoreAction: {
      state: 'available',
      label: 'Open Procore',
      procoreProject: '1234567',
      href: 'https://app.procore.com/1234567/project/home',
    },
    provenance: {},
    warnings: [],
  };
  return { ...base, ...overrides };
}

function MenuHarness({
  row,
  initialOpen = false,
  onOpen,
}: {
  readonly row: MyProjectLinkItem;
  readonly initialOpen?: boolean;
  readonly onOpen?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <ProjectLaunchMenu
      row={row}
      isOpen={open}
      onOpenChange={(next) => {
        setOpen(next);
        onOpen?.(next);
      }}
    />
  );
}

function getMenu(): HTMLElement | null {
  return document.body.querySelector('[data-my-projects-launch-menu]');
}

describe('ProjectLaunchMenu — trigger semantics', () => {
  it('renders an Open button with project-scoped aria-label and closed default state', () => {
    const row = makeRow({});
    const { container } = render(<MenuHarness row={row} />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toBe('Open');
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe(
      'Open launch options for Harbor Office Renovation',
    );
    expect(getMenu()).toBeNull();
  });
});

describe('ProjectLaunchMenu — available links', () => {
  it('mounts a portaled menu with two anchor options carrying target/rel and existing labels', () => {
    const row = makeRow({});
    const { container } = render(<MenuHarness row={row} />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const menu = getMenu();
    expect(menu).not.toBeNull();

    const sharePoint = menu!.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLAnchorElement;
    expect(sharePoint.tagName).toBe('A');
    expect(sharePoint.getAttribute('href')).toBe(row.sharePointAction.href!);
    expect(sharePoint.getAttribute('target')).toBe('_blank');
    expect(sharePoint.getAttribute('rel')).toBe('noopener noreferrer');
    expect(sharePoint.textContent).toBe('Open SharePoint Site');
    expect(sharePoint.getAttribute('data-my-projects-launch-option-state')).toBe('available');

    const procore = menu!.querySelector(
      '[data-my-projects-launch-option="procore"]',
    ) as HTMLAnchorElement;
    expect(procore.tagName).toBe('A');
    expect(procore.getAttribute('href')).toBe(row.procoreAction.href!);
    expect(procore.getAttribute('target')).toBe('_blank');
    expect(procore.getAttribute('rel')).toBe('noopener noreferrer');
    expect(procore.textContent).toBe('Open Procore');
  });

  it('preserves the Open SharePoint Folder label for merged/legacy-folder rows', () => {
    const row = makeRow({
      sharePointAction: {
        state: 'available',
        kind: 'legacy-folder',
        label: 'Open SharePoint Folder',
        href: 'https://example.invalid/sites/2024Projects/Shared%20Documents/24-100-02',
      },
    });
    const { container } = render(<MenuHarness row={row} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    const sharePoint = getMenu()!.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLAnchorElement;
    expect(sharePoint.textContent).toBe('Open SharePoint Folder');
  });
});

describe('ProjectLaunchMenu — unavailable non-link semantics', () => {
  it('renders SharePoint unavailable as a disabled button with the locked aria-label', () => {
    const row = makeRow({
      sharePointAction: {
        state: 'unavailable',
        kind: 'none',
        label: 'SharePoint unavailable',
      },
    });
    const { container } = render(<MenuHarness row={row} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    const sharePoint = getMenu()!.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLButtonElement;
    expect(sharePoint.tagName).toBe('BUTTON');
    expect(sharePoint.getAttribute('href')).toBeNull();
    expect(sharePoint.getAttribute('aria-disabled')).toBe('true');
    expect(sharePoint.hasAttribute('disabled')).toBe(true);
    expect(sharePoint.getAttribute('aria-label')).toBe('SharePoint unavailable for this project.');
    expect(sharePoint.getAttribute('data-my-projects-launch-option-state')).toBe('unavailable');
  });

  it('renders Procore unavailable as a disabled button with the project-not-invalid aria-label by default', () => {
    const row = makeRow({
      procoreAction: {
        state: 'unavailable',
        label: 'Procore unavailable',
      },
    });
    const { container } = render(<MenuHarness row={row} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    const procore = getMenu()!.querySelector(
      '[data-my-projects-launch-option="procore"]',
    ) as HTMLButtonElement;
    expect(procore.tagName).toBe('BUTTON');
    expect(procore.getAttribute('aria-label')).toBe('Procore unavailable for this project.');
  });

  it('surfaces the procore-project-invalid aria-label variant when the row warning is present', () => {
    const row = makeRow({
      procoreAction: { state: 'unavailable', label: 'Procore unavailable' },
      warnings: [{ code: 'procore-project-invalid' }],
    });
    const { container } = render(<MenuHarness row={row} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    const procore = getMenu()!.querySelector(
      '[data-my-projects-launch-option="procore"]',
    ) as HTMLButtonElement;
    expect(procore.getAttribute('aria-label')).toBe(
      'Procore unavailable due to invalid project token.',
    );
  });
});

describe('ProjectLaunchMenu — keyboard and dismissal', () => {
  it('closes on Escape and restores focus to the trigger', async () => {
    const row = makeRow({});
    const onOpen = vi.fn();
    const { container } = render(<MenuHarness row={row} onOpen={onOpen} />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    trigger.focus();
    fireEvent.click(trigger);
    expect(getMenu()).not.toBeNull();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(getMenu()).toBeNull();
    expect(onOpen).toHaveBeenLastCalledWith(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes on outside click', () => {
    const row = makeRow({});
    const onOpen = vi.fn();
    const { container } = render(<MenuHarness row={row} onOpen={onOpen} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    expect(getMenu()).not.toBeNull();

    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);
    expect(getMenu()).toBeNull();
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });

  it('exposes data hooks only while open', () => {
    const row = makeRow({});
    const { container } = render(<MenuHarness row={row} />);
    expect(getMenu()).toBeNull();

    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);
    expect(getMenu()).not.toBeNull();
    expect(
      getMenu()!.querySelectorAll('[data-my-projects-launch-option]').length,
    ).toBe(2);
  });
});
