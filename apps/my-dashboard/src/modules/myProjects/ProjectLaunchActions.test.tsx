import { useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { MyProjectLinkItem } from '@hbc/models/myWork';
import { MyWorkBentoGrid } from '../../layout/MyWorkBentoGrid.js';
import type { MyWorkResponsiveMode } from '../../layout/useMyWorkContainerBreakpoint.js';
import { ProjectLaunchActions, hasAvailableLaunchActions } from './ProjectLaunchActions.js';
import { buildMyProjectLaunchPresentation } from './myProjectLaunchPresentation.js';

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
  const presentation = buildMyProjectLaunchPresentation(row);
  return (
    <MyWorkBentoGrid mode={mode}>
      <ProjectLaunchActions
        presentation={presentation}
        projectName={row.projectName}
        isLaunchOptionsOpen={open}
        onLaunchOptionsOpenChange={(next) => {
          setOpen(next);
          onOpen?.(next);
        }}
        moreResourcesPanelId="test-overflow-panel"
        onMoreResourcesTriggerReady={() => {}}
      />
    </MyWorkBentoGrid>
  );
}

function getDrawer(): HTMLElement | null {
  return document.body.querySelector('[data-my-projects-launch-drawer]');
}

describe('ProjectLaunchActions — non-phone rail', () => {
  it('caps direct actions at two and shows overflow trigger when overflow exists', () => {
    const { container } = render(<Harness row={makeRow({})} mode="desktop" />);
    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
    expect(rail).not.toBeNull();
    expect(rail!.getAttribute('data-my-projects-primary-action-count')).toBe('2');
    expect(rail!.getAttribute('data-my-projects-overflow-action-count')).toBe('2');

    const direct = Array.from(container.querySelectorAll('[data-my-projects-launch-option]'));
    expect(direct.map((node) => node.getAttribute('data-my-projects-launch-option'))).toEqual([
      'sharepoint',
      'procore',
    ]);
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')?.textContent).toBe(
      'More Resources · 2',
    );
  });

  it('renders no overflow trigger when overflow is zero', () => {
    const row = makeRow({
      buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED,
      documentCrunchAction: UNAVAILABLE_DOCUMENT_CRUNCH,
    });
    const { container } = render(<Harness row={row} mode="desktop" />);
    const rail = container.querySelector('[data-my-projects-launch-shape="rail"]');
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
    expect(container.querySelector('[data-my-projects-more-resources-trigger]')).toBeNull();
  });
});

describe('ProjectLaunchActions — phone drawer mode', () => {
  it('renders the trigger with closed default state and no rail', () => {
    const { container } = render(<Harness row={makeRow({})} mode="phone" />);
    const trigger = container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement;
    expect(trigger).not.toBeNull();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(container.querySelector('[data-my-projects-launch-shape="rail"]')).toBeNull();
  });

  it('renders no trigger and no drawer when zero available destinations exist', () => {
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

  it('opens a themed drawer with all available actions and closes on action click', () => {
    const onOpen = vi.fn();
    const row = makeRow({ buildingConnectedAction: UNAVAILABLE_BUILDING_CONNECTED });
    const { container } = render(<Harness row={row} mode="phone" onOpen={onOpen} />);

    fireEvent.click(container.querySelector('[data-my-projects-launch-trigger]') as HTMLButtonElement);
    const themedRoot = document.body.querySelector('[data-my-work-themed-portal="launch-drawer"]');
    expect(themedRoot).not.toBeNull();
    const drawer = getDrawer();
    expect(drawer).not.toBeNull();
    expect(drawer!.getAttribute('data-my-projects-launch-count')).toBe('3');

    const options = Array.from(drawer!.querySelectorAll<HTMLElement>('[data-my-projects-launch-option]'));
    expect(options.map((node) => node.textContent)).toEqual([
      'SharePoint Site',
      'Procore',
      'Document Crunch',
    ]);

    fireEvent.click(options[0] as HTMLElement);
    expect(onOpen).toHaveBeenLastCalledWith(false);
  });
});

describe('hasAvailableLaunchActions', () => {
  it('returns true when at least one destination is available', () => {
    expect(hasAvailableLaunchActions(makeRow({}))).toBe(true);
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
