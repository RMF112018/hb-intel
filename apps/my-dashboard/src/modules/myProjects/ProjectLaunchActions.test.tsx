import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { ProjectLaunchActions } from './ProjectLaunchActions.js';

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
    buildingConnectedAction: {
      state: 'available',
      label: 'Open BuildingConnected',
      href: 'https://buildingconnected.example.invalid/projects/24-100-01',
    },
    documentCrunchAction: {
      state: 'available',
      label: 'Open Document Crunch',
      href: 'https://documentcrunch.example.invalid/projects/24-100-01',
    },
    provenance: {},
    warnings: [],
  };
  return { ...base, ...overrides };
}

function Harness({
  row,
  mode,
  initialOpen = false,
  onOpen,
}: {
  readonly row: MyProjectLinkItem;
  readonly mode: MyWorkResponsiveMode;
  readonly initialOpen?: boolean;
  readonly onOpen?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <MyWorkBentoGrid mode={mode}>
      <ProjectLaunchActions
        row={row}
        isDrawerOpen={open}
        onDrawerOpenChange={(next) => {
          setOpen(next);
          onOpen?.(next);
        }}
      />
    </MyWorkBentoGrid>
  );
}

function getDrawer(): HTMLElement | null {
  return document.body.querySelector('[data-my-projects-launch-drawer]');
}

describe('ProjectLaunchActions — inline mode (desktop)', () => {
  it('renders four launch options in locked order with no trigger and no drawer', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);

    expect(container.querySelector('[data-my-projects-launch-shape="inline"]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(getDrawer()).toBeNull();

    const options = Array.from(
      container.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
      'building-connected',
      'document-crunch',
    ]);
  });

  it('renders every available destination as a safe external anchor with the locked label', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);

    const sharePoint = container.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLAnchorElement;
    expect(sharePoint.tagName).toBe('A');
    expect(sharePoint.getAttribute('href')).toBe(row.sharePointAction.href!);
    expect(sharePoint.getAttribute('target')).toBe('_blank');
    expect(sharePoint.getAttribute('rel')).toBe('noopener noreferrer');
    expect(sharePoint.textContent).toBe('Open SharePoint Site');

    const procore = container.querySelector(
      '[data-my-projects-launch-option="procore"]',
    ) as HTMLAnchorElement;
    expect(procore.tagName).toBe('A');
    expect(procore.getAttribute('href')).toBe(row.procoreAction.href!);
    expect(procore.textContent).toBe('Open Procore');

    const buildingConnected = container.querySelector(
      '[data-my-projects-launch-option="building-connected"]',
    ) as HTMLAnchorElement;
    expect(buildingConnected.tagName).toBe('A');
    expect(buildingConnected.getAttribute('href')).toBe(row.buildingConnectedAction.href!);
    expect(buildingConnected.getAttribute('target')).toBe('_blank');
    expect(buildingConnected.getAttribute('rel')).toBe('noopener noreferrer');
    expect(buildingConnected.textContent).toBe('Open BuildingConnected');

    const documentCrunch = container.querySelector(
      '[data-my-projects-launch-option="document-crunch"]',
    ) as HTMLAnchorElement;
    expect(documentCrunch.tagName).toBe('A');
    expect(documentCrunch.getAttribute('href')).toBe(row.documentCrunchAction.href!);
    expect(documentCrunch.textContent).toBe('Open Document Crunch');
  });

  it('renders unavailable BuildingConnected as a disabled button with the empty aria-label', () => {
    const row = makeRow({
      buildingConnectedAction: { state: 'unavailable', label: 'BuildingConnected unavailable' },
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const node = container.querySelector(
      '[data-my-projects-launch-option="building-connected"]',
    ) as HTMLButtonElement;
    expect(node.tagName).toBe('BUTTON');
    expect(node.getAttribute('href')).toBeNull();
    expect(node.getAttribute('aria-disabled')).toBe('true');
    expect(node.hasAttribute('disabled')).toBe(true);
    expect(node.getAttribute('aria-label')).toBe('BuildingConnected unavailable for this project.');
    expect(node.getAttribute('data-my-projects-launch-option-state')).toBe('unavailable');
  });

  it('renders unavailable Document Crunch as a disabled button with the empty aria-label', () => {
    const row = makeRow({
      documentCrunchAction: { state: 'unavailable', label: 'Document Crunch unavailable' },
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const node = container.querySelector(
      '[data-my-projects-launch-option="document-crunch"]',
    ) as HTMLButtonElement;
    expect(node.tagName).toBe('BUTTON');
    expect(node.getAttribute('aria-label')).toBe('Document Crunch unavailable for this project.');
  });

  it('surfaces the invalid-URL aria-label variant for BuildingConnected when the warning is present', () => {
    const row = makeRow({
      buildingConnectedAction: { state: 'unavailable', label: 'BuildingConnected unavailable' },
      warnings: [{ code: 'building-connected-url-invalid' }],
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const node = container.querySelector(
      '[data-my-projects-launch-option="building-connected"]',
    ) as HTMLButtonElement;
    expect(node.getAttribute('aria-label')).toBe(
      'BuildingConnected unavailable due to an invalid launch URL.',
    );
  });

  it('surfaces the invalid-URL aria-label variant for Document Crunch when the warning is present', () => {
    const row = makeRow({
      documentCrunchAction: { state: 'unavailable', label: 'Document Crunch unavailable' },
      warnings: [{ code: 'document-crunch-url-invalid' }],
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const node = container.querySelector(
      '[data-my-projects-launch-option="document-crunch"]',
    ) as HTMLButtonElement;
    expect(node.getAttribute('aria-label')).toBe(
      'Document Crunch unavailable due to an invalid launch URL.',
    );
  });

  it('surfaces the invalid-token aria-label variant for Procore when the warning is present', () => {
    const row = makeRow({
      procoreAction: { state: 'unavailable', label: 'Procore unavailable' },
      warnings: [{ code: 'procore-project-invalid' }],
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const node = container.querySelector(
      '[data-my-projects-launch-option="procore"]',
    ) as HTMLButtonElement;
    expect(node.getAttribute('aria-label')).toBe(
      'Procore unavailable due to invalid project token.',
    );
  });
});

describe('ProjectLaunchActions — inline mode (tabletLandscape) shares the desktop shape', () => {
  it('renders the same four-row inline list and no trigger on tabletLandscape', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="tabletLandscape" />);
    expect(container.querySelector('[data-my-projects-launch-shape="inline"]')).not.toBeNull();
    expect(container.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(container.querySelectorAll('[data-my-projects-launch-option]').length).toBe(4);
  });
});

describe('ProjectLaunchActions — phone drawer mode', () => {
  it('renders the trigger with closed default state and no inline list', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="phone" />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.textContent).toBe('Open launch options');
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-label')).toBe(
      'Open launch options for Harbor Office Renovation',
    );
    expect(container.querySelector('[data-my-projects-launch-shape="inline"]')).toBeNull();
    expect(getDrawer()).toBeNull();
  });

  it('opens a portaled bottom-sheet drawer with four launch options in locked order on trigger click', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="phone" />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const drawer = getDrawer();
    expect(drawer).not.toBeNull();
    expect(drawer!.getAttribute('data-my-projects-launch-shape')).toBe('drawer');

    const options = Array.from(
      drawer!.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
      'building-connected',
      'document-crunch',
    ]);
  });

  it('closes the drawer on Escape and restores focus to the trigger', () => {
    const row = makeRow({});
    const onOpen = vi.fn();
    const { container } = render(<Harness row={row} mode="phone" onOpen={onOpen} />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    trigger.focus();
    fireEvent.click(trigger);
    expect(getDrawer()).not.toBeNull();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(getDrawer()).toBeNull();
    expect(onOpen).toHaveBeenLastCalledWith(false);
    expect(document.activeElement).toBe(trigger);
  });

  it('closes the drawer on outside press', () => {
    const row = makeRow({});
    const onOpen = vi.fn();
    const { container } = render(<Harness row={row} mode="phone" onOpen={onOpen} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    expect(getDrawer()).not.toBeNull();

    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);
    expect(getDrawer()).toBeNull();
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });

  it('closes the drawer when a launch anchor is activated', () => {
    const row = makeRow({});
    const onOpen = vi.fn();
    const { container } = render(<Harness row={row} mode="phone" onOpen={onOpen} />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    const drawer = getDrawer();
    expect(drawer).not.toBeNull();
    const sharePoint = drawer!.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLAnchorElement;
    fireEvent.click(sharePoint);
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });

  it('drawer renders unavailable Document Crunch as disabled button with empty aria-label', () => {
    const row = makeRow({
      documentCrunchAction: { state: 'unavailable', label: 'Document Crunch unavailable' },
    });
    const { container } = render(<Harness row={row} mode="phone" />);
    fireEvent.click(
      container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement,
    );
    const drawer = getDrawer();
    const node = drawer!.querySelector(
      '[data-my-projects-launch-option="document-crunch"]',
    ) as HTMLButtonElement;
    expect(node.tagName).toBe('BUTTON');
    expect(node.getAttribute('aria-label')).toBe('Document Crunch unavailable for this project.');
  });
});
