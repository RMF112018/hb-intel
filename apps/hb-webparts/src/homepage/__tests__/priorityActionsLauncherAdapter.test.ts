import { describe, expect, it } from 'vitest';
import {
  partitionItems,
  resolveLauncherDeviceClass,
} from '../data/priorityActionsLauncherAdapter.js';
import type { PriorityActionsItemNormalized } from '../data/priorityActionsContracts.js';
import type { PriorityRailDeviceResolution } from '../data/priorityActionsPresentation.js';

function makeResolution(
  overrides: Partial<PriorityRailDeviceResolution>,
): PriorityRailDeviceResolution {
  return {
    deviceClass: 'desktop',
    shellState: 'standard-laptop',
    entryStateReason: 'width-match',
    shortHeightConstrained: false,
    ...overrides,
  };
}

function makeItem(id: number, overflowOnly = false): PriorityActionsItemNormalized {
  return {
    id,
    actionKey: String(id),
    title: `Action ${id}`,
    href: `/action-${id}`,
    description: '',
    iconKey: 'arrow-right',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: '',
    groupTitle: '',
    sortOrder: Number(id),
    isExternal: false,
    openInNewTab: false,
    overflowOnly,
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
  };
}

describe('priorityActionsLauncherAdapter', () => {
  it('derives ultrawide launcher class from shared shell entry-state', () => {
    const ultrawide = resolveLauncherDeviceClass(
      makeResolution({ deviceClass: 'desktop', shellState: 'ultrawide-desktop' }),
    );
    const standard = resolveLauncherDeviceClass(
      makeResolution({ deviceClass: 'desktop', shellState: 'standard-laptop' }),
    );
    expect(ultrawide).toBe('ultrawide');
    expect(standard).toBe('desktop');
  });

  it('maps non-desktop classes consistently', () => {
    expect(resolveLauncherDeviceClass(makeResolution({ deviceClass: 'laptop' }))).toBe('desktop');
    expect(resolveLauncherDeviceClass(makeResolution({ deviceClass: 'tabletLandscape' }))).toBe(
      'tablet-landscape',
    );
    expect(resolveLauncherDeviceClass(makeResolution({ deviceClass: 'tabletPortrait' }))).toBe(
      'tablet-portrait',
    );
    expect(resolveLauncherDeviceClass(makeResolution({ deviceClass: 'phone' }))).toBe('phone');
  });

  it('reduces visible primary budget under short-height posture', () => {
    const items = [1, 2, 3, 4, 5].map((id) => makeItem(id));
    const normal = partitionItems(items, 'desktop', false);
    const shortHeight = partitionItems(items, 'desktop', true);
    expect(shortHeight.primary.length).toBe(normal.primary.length - 1);
  });

  it('always keeps overflowOnly items in overflow', () => {
    const items = [makeItem(1), makeItem(2, true), makeItem(3)];
    const partition = partitionItems(items, 'phone', false);
    const overflowIds = partition.overflow.map((item) => item.id);
    expect(overflowIds).toContain('2');
  });
});
