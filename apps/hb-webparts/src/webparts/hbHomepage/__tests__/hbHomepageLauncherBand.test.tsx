import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import type { PriorityActionsItemNormalized } from '../../../homepage/data/priorityActionsContracts.js';
import { HbHomepageLauncherBand } from '../HbHomepageLauncherBand.js';
import type { ShellContainerState } from '../shell/useShellContainer.js';

const MOCK_ITEMS: PriorityActionsItemNormalized[] = [
  {
    id: 1,
    actionKey: 'a1',
    title: 'Action 1',
    href: '/a1',
    description: '',
    iconKey: 'arrow-right',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: 1,
    isExternal: false,
    openInNewTab: false,
    overflowOnly: false,
    mobilePriority: 0,
    audienceMode: 'all',
    audienceKeys: [],
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 2,
    actionKey: 'a2',
    title: 'Action 2',
    href: '/a2',
    description: '',
    iconKey: 'arrow-right',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: 2,
    isExternal: false,
    openInNewTab: false,
    overflowOnly: false,
    mobilePriority: 0,
    audienceMode: 'all',
    audienceKeys: [],
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 3,
    actionKey: 'a3',
    title: 'Action 3',
    href: '/a3',
    description: '',
    iconKey: 'arrow-right',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: 3,
    isExternal: false,
    openInNewTab: false,
    overflowOnly: false,
    mobilePriority: 0,
    audienceMode: 'all',
    audienceKeys: [],
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 4,
    actionKey: 'a4',
    title: 'Action 4',
    href: '/a4',
    description: '',
    iconKey: 'arrow-right',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: 4,
    isExternal: false,
    openInNewTab: false,
    overflowOnly: false,
    mobilePriority: 0,
    audienceMode: 'all',
    audienceKeys: [],
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
  {
    id: 5,
    actionKey: 'a5',
    title: 'Action 5',
    href: '/a5',
    description: '',
    iconKey: 'arrow-right',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: 5,
    isExternal: false,
    openInNewTab: false,
    overflowOnly: false,
    mobilePriority: 0,
    audienceMode: 'all',
    audienceKeys: [],
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
  },
];

const MOCK_DATA_STATE: {
  config:
    | {
        showHeading: boolean;
        headingText: string;
        overflowLabel: string;
      }
    | undefined;
  items: PriorityActionsItemNormalized[];
  isLoading: boolean;
  error: string | undefined;
} = {
  config: {
    showHeading: true,
    headingText: 'Priority Actions',
    overflowLabel: 'More tools',
  },
  items: MOCK_ITEMS,
  isLoading: false,
  error: undefined,
};

vi.mock('../../../homepage/data/usePriorityActionsData.js', () => ({
  usePriorityActionsData: () => ({
    config: MOCK_DATA_STATE.config,
    items: MOCK_DATA_STATE.items,
    isLoading: MOCK_DATA_STATE.isLoading,
    error: MOCK_DATA_STATE.error,
  }),
  invalidatePriorityActionsCache: vi.fn(),
}));

vi.mock('../../../homepage/data/priorityActionsNormalization.js', () => ({
  filterByDevice: (items: PriorityActionsItemNormalized[]) => items,
  getLauncherVisibleCap: (device: string) => {
    switch (device) {
      case 'desktop':
      case 'laptop':
        return 5;
      case 'tabletLandscape':
      case 'tabletPortrait':
        return 4;
      case 'phone':
        return 3;
      default:
        return 5;
    }
  },
}));

vi.mock('@hbc/ui-kit/homepage', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@hbc/ui-kit/homepage')>();
  return {
    ...actual,
    HbcHomepageLauncher: (props: {
      primary: unknown[];
      overflow: unknown[];
      handheldMode?: string;
    }): React.JSX.Element =>
      React.createElement('div', {
        'data-test-launcher': 'mock',
        'data-test-primary-count': props.primary.length,
        'data-test-overflow-count': props.overflow.length,
        'data-test-handheld-mode': props.handheldMode,
      }),
    HbcPriorityRailEmptyState: (): React.JSX.Element => React.createElement('div'),
    HbcPriorityRailErrorState: (): React.JSX.Element => React.createElement('div'),
    HbcPriorityRailSkeleton: (props: { count: number }): React.JSX.Element =>
      React.createElement('div', {
        'data-test-skeleton': 'mock',
        'data-test-skeleton-count': props.count,
      }),
  };
});

const ENTRY_CONTAINER: ShellContainerState = {
  width: 900,
  authoritativeWidth: 980,
  shellInlineInsetTotal: 80,
  height: 900,
  entryState: {
    id: 'tablet-portrait',
    label: 'tablet',
    minWidth: 720,
    maxWidth: 819,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  entryStateReason: 'width-match' as const,
  shortHeightConstrained: false,
};

const PHONE_ENTRY_CONTAINER: ShellContainerState = {
  width: 390,
  authoritativeWidth: 390,
  shellInlineInsetTotal: 0,
  height: 844,
  entryState: {
    id: 'phone-portrait',
    label: 'phone',
    minWidth: 320,
    maxWidth: 719,
    firstLaneColumns: 1,
    firstLanePairingAllowed: false,
    dominanceRule: 'single',
  },
  entryStateReason: 'width-match' as const,
  shortHeightConstrained: false,
};

describe('HbHomepageLauncherBand governance alignment', () => {
  beforeEach(() => {
    MOCK_DATA_STATE.config = {
      showHeading: true,
      headingText: 'Priority Actions',
      overflowLabel: 'More tools',
    };
    MOCK_DATA_STATE.items = MOCK_ITEMS;
    MOCK_DATA_STATE.isLoading = false;
    MOCK_DATA_STATE.error = undefined;
  });

  it('emits shared-entry governance diagnostics on launcher root', () => {
    const { container } = render(
      <HbHomepageLauncherBand
        entryContainer={ENTRY_CONTAINER}
        alignmentMode="shared-entry-governed"
      />,
    );
    const root = container.querySelector('[data-hb-homepage-launcher-band="root"]');
    expect(root?.getAttribute('data-hbc-launcher-entry-authority')).toBe('shared-entry-state');
    expect(root?.getAttribute('data-hbc-launcher-blackbox-contract')).toBe(
      'prompt07-blackbox-v1',
    );
    expect(root?.getAttribute('data-hbc-launcher-alignment-mode')).toBe('shared-entry-governed');
    expect(root?.getAttribute('data-hbc-launcher-density-posture')).toBe('compact');
    expect(root?.getAttribute('data-hbc-launcher-visible-budget')).toBe('4');
    expect(root?.getAttribute('data-hbc-launcher-handheld-mode')).toBe('standard');
    expect(root?.getAttribute('data-hbc-launcher-drawer-source')).toBe('all-tools');
    expect(root?.getAttribute('data-hbc-launcher-cap-governance')).toBe('binding-visible-cap');
    expect(root?.getAttribute('data-hbc-launcher-overflow-strategy')).toBe('more-tools');
    expect(root?.getAttribute('data-hbc-launcher-host-width')).toBe('900');
    expect(root?.getAttribute('data-hbc-launcher-host-width-source')).toBe(
      'entry-container-fallback',
    );
  });

  it('keeps strict alignment budget at or below legacy mode under same state', () => {
    const strict = render(
      <HbHomepageLauncherBand
        entryContainer={ENTRY_CONTAINER}
        alignmentMode="shared-entry-governed"
      />,
    ).container.querySelector('[data-hb-homepage-launcher-band="root"]');
    const legacy = render(
      <HbHomepageLauncherBand entryContainer={ENTRY_CONTAINER} alignmentMode="legacy" />,
    ).container.querySelector('[data-hb-homepage-launcher-band="root"]');

    const strictBudget = Number(strict?.getAttribute('data-hbc-launcher-visible-budget') || 0);
    const legacyBudget = Number(legacy?.getAttribute('data-hbc-launcher-visible-budget') || 0);
    expect(strictBudget).toBe(legacyBudget);
  });

  it('emits phone handheld device-class markers expected by shell CSS contract', () => {
    const { container } = render(
      <HbHomepageLauncherBand
        entryContainer={PHONE_ENTRY_CONTAINER}
        alignmentMode="shared-entry-governed"
      />,
    );
    const root = container.querySelector('[data-hb-homepage-launcher-band="root"]');
    const shell = container.querySelector('[data-hb-homepage-launcher-band-shell="root"]');

    expect(root?.getAttribute('data-hbc-launcher-device-class')).toBe('phone');
    expect(shell?.getAttribute('data-hbc-launcher-device-class')).toBe('phone');
    expect(root?.getAttribute('data-hbc-launcher-handheld-mode')).toBe('single-entry-all-tools');
  });

  it('keeps loading-state density aligned with runtime visible-count governance', () => {
    MOCK_DATA_STATE.isLoading = true;
    const { container } = render(
      <HbHomepageLauncherBand
        entryContainer={ENTRY_CONTAINER}
        alignmentMode="shared-entry-governed"
      />,
    );
    const skeleton = container.querySelector('[data-test-skeleton="mock"]');
    expect(skeleton?.getAttribute('data-test-skeleton-count')).toBe('4');
  });
});
