import { describe, expect, it } from 'vitest';
import { curatePrimaryForFlagship } from '../data/priorityActionsCuration.js';
import type {
  PriorityActionsConfigResolved,
  PriorityActionsItemNormalized,
} from '../data/priorityActionsContracts.js';

function makeConfig(overrides: Partial<PriorityActionsConfigResolved> = {}): PriorityActionsConfigResolved {
  return {
    id: 1,
    title: 'cfg',
    bandKey: 'homepage-primary',
    enabled: true,
    isActive: true,
    headingText: 'Priority Actions',
    overflowLabel: 'More tools',
    showHeading: true,
    stickyAfterHero: false,
    showBadges: true,
    desktopLayoutMode: 'rail',
    tabletLayoutMode: 'rail',
    mobileLayoutMode: 'scroll',
    maxVisibleDesktop: 4,
    maxVisibleLaptop: 4,
    maxVisibleTabletLandscape: 3,
    maxVisibleTabletPortrait: 3,
    maxVisiblePhone: 2,
    openExternalInNewTabByDefault: false,
    adminNotes: '',
    modified: '',
    ...overrides,
  };
}

function makeItem(overrides: Partial<PriorityActionsItemNormalized> = {}): PriorityActionsItemNormalized {
  return {
    id: 1,
    actionKey: 'a',
    title: 'A',
    href: '/a',
    description: '',
    iconKey: '',
    badgeLabel: '',
    badgeVariant: 'neutral',
    priority: 'primary',
    groupKey: 'safety',
    groupTitle: 'Safety',
    sortOrder: 100,
    overflowOnly: false,
    mobilePriority: 100,
    audienceMode: 'all',
    audienceKeys: [],
    isExternal: false,
    openInNewTab: false,
    visibleDesktop: true,
    visibleLaptop: true,
    visibleTabletLandscape: true,
    visibleTabletPortrait: true,
    visiblePhone: true,
    startsAtUtc: null,
    endsAtUtc: null,
    ...overrides,
  };
}

describe('curatePrimaryForFlagship', () => {
  it('round-robins across groups instead of slicing top-N within a single group', () => {
    const items: PriorityActionsItemNormalized[] = [
      makeItem({ actionKey: 's1', groupKey: 'safety', groupTitle: 'Safety', sortOrder: 10 }),
      makeItem({ actionKey: 's2', groupKey: 'safety', groupTitle: 'Safety', sortOrder: 20 }),
      makeItem({ actionKey: 's3', groupKey: 'safety', groupTitle: 'Safety', sortOrder: 30 }),
      makeItem({ actionKey: 'f1', groupKey: 'field', groupTitle: 'Field', sortOrder: 40 }),
      makeItem({ actionKey: 'a1', groupKey: 'admin', groupTitle: 'Admin', sortOrder: 50 }),
    ];
    const result = curatePrimaryForFlagship(items, makeConfig({ maxVisibleDesktop: 4 }), 'desktop');
    const keys = result.primaryItems.map((i) => i.actionKey);

    expect(keys).toHaveLength(4);
    expect(keys).toEqual(['s1', 'f1', 'a1', 's2']);
    expect(result.overflowItems.map((i) => i.actionKey)).toEqual(['s3']);
  });

  it('promotes featured action keys ahead of bucketed round-robin', () => {
    const items: PriorityActionsItemNormalized[] = [
      makeItem({ actionKey: 'low', groupKey: 'x', groupTitle: 'X', sortOrder: 10 }),
      makeItem({ actionKey: 'star', groupKey: 'y', groupTitle: 'Y', sortOrder: 999 }),
      makeItem({ actionKey: 'mid', groupKey: 'x', groupTitle: 'X', sortOrder: 20 }),
    ];
    const result = curatePrimaryForFlagship(
      items,
      makeConfig({ maxVisibleDesktop: 2 }),
      'desktop',
      { featuredActionKeys: ['star'] },
    );
    expect(result.primaryItems[0].actionKey).toBe('star');
    expect(result.primaryItems).toHaveLength(2);
  });

  it('pushes overflowOnly items to the overflow bucket regardless of order', () => {
    const items: PriorityActionsItemNormalized[] = [
      makeItem({ actionKey: 'a', overflowOnly: true, sortOrder: 1 }),
      makeItem({ actionKey: 'b', groupKey: 'g', groupTitle: 'G', sortOrder: 10 }),
      makeItem({ actionKey: 'c', groupKey: 'h', groupTitle: 'H', sortOrder: 20 }),
    ];
    const result = curatePrimaryForFlagship(items, makeConfig({ maxVisibleDesktop: 3 }), 'desktop');
    expect(result.primaryItems.map((i) => i.actionKey)).toEqual(['b', 'c']);
    expect(result.overflowItems.map((i) => i.actionKey)).toEqual(['a']);
  });

  it('is deterministic — identical input produces identical output', () => {
    const items: PriorityActionsItemNormalized[] = [
      makeItem({ actionKey: 'p', groupKey: 'p-grp', sortOrder: 10 }),
      makeItem({ actionKey: 'q', groupKey: 'q-grp', sortOrder: 20 }),
      makeItem({ actionKey: 'r', groupKey: 'r-grp', sortOrder: 30 }),
    ];
    const r1 = curatePrimaryForFlagship(items, makeConfig(), 'desktop');
    const r2 = curatePrimaryForFlagship(items, makeConfig(), 'desktop');
    expect(r1.primaryItems.map((i) => i.actionKey)).toEqual(r2.primaryItems.map((i) => i.actionKey));
  });

  it('respects priority class ordering (primary before secondary)', () => {
    const items: PriorityActionsItemNormalized[] = [
      makeItem({ actionKey: 'sec', priority: 'secondary', groupKey: 'g', sortOrder: 10 }),
      makeItem({ actionKey: 'pri', priority: 'primary', groupKey: 'h', sortOrder: 20 }),
    ];
    const result = curatePrimaryForFlagship(items, makeConfig({ maxVisibleDesktop: 1 }), 'desktop');
    expect(result.primaryItems.map((i) => i.actionKey)).toEqual(['pri']);
  });

  it('falls back to a single group when only one group is eligible', () => {
    const items: PriorityActionsItemNormalized[] = [
      makeItem({ actionKey: 'a', groupKey: 'only', sortOrder: 10 }),
      makeItem({ actionKey: 'b', groupKey: 'only', sortOrder: 20 }),
      makeItem({ actionKey: 'c', groupKey: 'only', sortOrder: 30 }),
    ];
    const result = curatePrimaryForFlagship(items, makeConfig({ maxVisibleDesktop: 2 }), 'desktop');
    expect(result.primaryItems.map((i) => i.actionKey)).toEqual(['a', 'b']);
  });
});
