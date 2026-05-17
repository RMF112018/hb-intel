import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { ProjectLaunchActions, hasAvailableLaunchActions } from './ProjectLaunchActions.js';

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
        isActionOverlayOpen={open}
        onActionOverlayOpenChange={(next) => {
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

const UNAVAILABLE_SHAREPOINT: MyProjectLinkItem['sharePointAction'] = {
  state: 'unavailable',
  kind: 'none',
  label: 'SharePoint unavailable',
};
const UNAVAILABLE_PROCORE: MyProjectLinkItem['procoreAction'] = {
  state: 'unavailable',
  label: 'Procore unavailable',
};
const UNAVAILABLE_BUILDING_CONNECTED: MyProjectLinkItem['buildingConnectedAction'] = {
  state: 'unavailable',
  label: 'BuildingConnected unavailable',
};
const UNAVAILABLE_DOCUMENT_CRUNCH: MyProjectLinkItem['documentCrunchAction'] = {
  state: 'unavailable',
  label: 'Document Crunch unavailable',
};

describe('ProjectLaunchActions — non-phone rail', () => {
  it('renders only two direct actions and overflow trigger when additional actions exist', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);

    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail).not.toBeNull();
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('2');
    expect(container.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(getDrawer()).toBeNull();

    const options = Array.from(
      container.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
    ]);
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')?.textContent).toBe(
      'More Resources · 2',
    );
    expect(container.querySelector('[data-my-projects-more-resources-menu]')).toBeNull();
  });

  it('shows no overflow trigger or menu seam when overflow count is zero', () => {
    const row = makeRow({
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);

    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail).not.toBeNull();
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('0');
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')).toBeNull();
    expect(container.querySelector('[data-my-projects-more-resources-menu]')).toBeNull();
  });

  it('keeps direct actions deterministic when SharePoint and Procore are unavailable', () => {
    const row = makeRow({
      sharePointAction: UNAVAILABLE_SHAREPOINT,
      procoreAction: UNAVAILABLE_PROCORE,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);

    const options = Array.from(
      container.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'building-connected',
      'document-crunch',
    ]);
  });

  it('opens overflow menu and renders overflow-only actions in order', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);
    const trigger = container.querySelector(
      '[data-my-projects-more-resources-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);

    const menu = document.body.querySelector('[data-my-projects-more-resources-menu]') as HTMLElement;
    expect(menu).not.toBeNull();
    const options = Array.from(menu.querySelectorAll<HTMLElement>('[data-my-projects-more-resource-option]'));
    expect(options.map((node) => node.getAttribute('data-my-projects-more-resource-option'))).toEqual([
      'building-connected',
      'document-crunch',
    ]);
  });

  it('preserves safe external anchor attributes for overflow actions', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);
    fireEvent.click(
      container.querySelector('[data-my-projects-more-resources-trigger]') as HTMLButtonElement,
    );
    const option = document.body.querySelector(
      '[data-my-projects-more-resource-option="building-connected"]',
    ) as HTMLAnchorElement;
    expect(option.getAttribute('target')).toBe('_blank');
    expect(option.getAttribute('rel')).toBe('noopener noreferrer');
    expect(option.getAttribute('aria-label')).toBe(
      'Open BuildingConnected for Harbor Office Renovation',
    );
  });

  it('closes overflow menu on Escape and restores focus to trigger', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);
    const trigger = container.querySelector(
      '[data-my-projects-more-resources-trigger]',
    ) as HTMLButtonElement;
    trigger.focus();
    fireEvent.click(trigger);
    expect(document.body.querySelector('[data-my-projects-more-resources-menu]')).not.toBeNull();

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    expect(document.body.querySelector('[data-my-projects-more-resources-menu]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
  });

  it('closes overflow menu on outside press', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);
    fireEvent.click(
      container.querySelector('[data-my-projects-more-resources-trigger]') as HTMLButtonElement,
    );
    expect(document.body.querySelector('[data-my-projects-more-resources-menu]')).not.toBeNull();

    fireEvent.pointerDown(document.body);
    fireEvent.mouseDown(document.body);
    fireEvent.click(document.body);
    expect(document.body.querySelector('[data-my-projects-more-resources-menu]')).toBeNull();
  });

  it('closes overflow menu when a menu action is activated', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="desktop" />);
    fireEvent.click(
      container.querySelector('[data-my-projects-more-resources-trigger]') as HTMLButtonElement,
    );
    const overflowOption = document.body.querySelector(
      '[data-my-projects-more-resource-option="building-connected"]',
    ) as HTMLAnchorElement;
    fireEvent.click(overflowOption);
    expect(document.body.querySelector('[data-my-projects-more-resources-menu]')).toBeNull();
  });

  it('renders single direct action and no overflow trigger when only one action exists', () => {
    const row = makeRow({
      procoreAction: UNAVAILABLE_PROCORE,
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);

    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('1');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('0');
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')).toBeNull();
  });

  it('renders 2 direct + overflow 1 for three available actions', () => {
    const row = makeRow({
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('1');
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')?.textContent).toBe(
      'More Resources · 1',
    );
  });

  it('renders SharePoint Folder label for legacy-folder kind', () => {
    const row = makeRow({
      sharePointAction: {
        state: 'available',
        kind: 'legacy-folder',
        label: 'Open SharePoint Folder',
        href: 'https://example.invalid/sites/legacy',
      },
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const sharePoint = container.querySelector(
      '[data-my-projects-launch-option="sharepoint"]',
    ) as HTMLAnchorElement;
    expect(sharePoint.textContent).toBe('SharePoint Folder');
    expect(sharePoint.getAttribute('aria-label')).toBe(
      'Open SharePoint Folder for Harbor Office Renovation',
    );
  });

  it('omits unavailable destinations entirely from the DOM (no disabled buttons, no dashed rows)', () => {
    const row = makeRow({
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);

    expect(
      container.querySelector('[data-my-projects-launch-option="building-connected"]'),
    ).toBeNull();
    expect(
      container.querySelector('[data-my-projects-launch-option="document-crunch"]'),
    ).toBeNull();
    expect(container.querySelector('button[disabled]')).toBeNull();
    expect(
      container.querySelectorAll('[data-my-projects-launch-option-state="unavailable"]').length,
    ).toBe(0);
    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('0');
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')).toBeNull();
  });

  it('renders nothing when no available destinations exist', () => {
    const row = makeRow({
      sharePointAction: UNAVAILABLE_SHAREPOINT,
      procoreAction: UNAVAILABLE_PROCORE,
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);

    expect(container.querySelector('[data-my-projects-launch-shape]')).toBeNull();
    expect(container.querySelector('[data-my-projects-launch-option]')).toBeNull();
    expect(container.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(hasAvailableLaunchActions(row)).toBe(false);
  });

  it('shares the same rail shape on tabletLandscape', () => {
    const row = makeRow({});
    const { container } = render(<Harness row={row} mode="tabletLandscape" />);
    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail).not.toBeNull();
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('2');
    expect(container.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(container.querySelectorAll('[data-my-projects-launch-option]').length).toBe(2);
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
    expect(container.querySelector('[data-my-projects-launch-shape="rail"]')).toBeNull();
    expect(getDrawer()).toBeNull();
  });

  it('renders no trigger and no DOM when zero available destinations exist', () => {
    const row = makeRow({
      sharePointAction: UNAVAILABLE_SHAREPOINT,
      procoreAction: UNAVAILABLE_PROCORE,
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="phone" />);
    expect(container.querySelector('[data-my-projects-launch-trigger]')).toBeNull();
    expect(getDrawer()).toBeNull();
  });

  it('opens a portaled bottom-sheet drawer with available options only in locked order on trigger click', () => {
    const row = makeRow({
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
    });
    const { container } = render(<Harness row={row} mode="phone" />);
    const trigger = container.querySelector(
      '[data-my-projects-launch-trigger]',
    ) as HTMLButtonElement;
    fireEvent.click(trigger);

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    const drawer = getDrawer();
    expect(drawer).not.toBeNull();
    expect(drawer!.getAttribute('data-my-projects-launch-shape')).toBe('drawer');
    expect(drawer!.getAttribute('data-my-projects-launch-count')).toBe('3');
    expect(
      drawer!.querySelector('[data-my-projects-launch-option="building-connected"]'),
    ).toBeNull();

    const options = Array.from(
      drawer!.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'),
    );
    expect(options.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
      'document-crunch',
    ]);
    expect(options.every((node) => node.tagName === 'A')).toBe(true);
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
});

describe('hasAvailableLaunchActions', () => {
  it('returns true when at least one destination is available', () => {
    expect(hasAvailableLaunchActions(makeRow({}))).toBe(true);
    expect(
      hasAvailableLaunchActions(
        makeRow({
          procoreAction: UNAVAILABLE_PROCORE,
          buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
          documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
        }),
      ),
    ).toBe(true);
  });

  it('returns false when every destination is unavailable', () => {
    expect(
      hasAvailableLaunchActions(
        makeRow({
          sharePointAction: UNAVAILABLE_SHAREPOINT,
          procoreAction: UNAVAILABLE_PROCORE,
          buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
          documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
        }),
      ),
    ).toBe(false);
  });
});
