import { describe, expect, it } from 'vitest';
import {
  mapItemToChip,
  partitionItems,
  resolveLauncherDeviceClass,
} from '../data/priorityActionsLauncherAdapter.js';
import {
  ArrowRight,
  Calendar,
  DollarSign,
  Shield,
} from '@hbc/ui-kit/homepage';
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
    densityPosture: 'comfortable',
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
  it('uses valid iconKey as primary icon identity', () => {
    const item = makeItem(5);
    item.iconKey = 'safety';
    item.badgeVariant = 'critical';
    const chip = mapItemToChip(item);
    expect(chip.icon).toBe(Shield);
  });

  it('uses explicit launcher icon identity ahead of iconKey when provided', () => {
    const item = makeItem(6);
    item.launcherIconIdentity = 'finance';
    item.iconKey = 'safety';
    const chip = mapItemToChip(item);
    expect(chip.icon).toBe(DollarSign);
  });

  it('falls back to governed service mapping when iconKey is invalid', () => {
    const item = makeItem(8);
    item.iconKey = 'not-governed';
    item.actionKey = 'weekly-project-sync';
    const chip = mapItemToChip(item);
    expect(chip.icon).toBe(Calendar);
  });

  it('falls back safely to neutral icon when no icon semantics resolve', () => {
    const item = makeItem(9);
    item.iconKey = '';
    item.actionKey = 'unique-action';
    item.groupKey = '';
    item.groupTitle = '';
    item.title = 'Unknown Tool';
    const chip = mapItemToChip(item);
    expect(chip.icon).toBe(ArrowRight);
  });

  it('does not regress to badge-variant-first behavior', () => {
    const item = makeItem(10);
    item.badgeVariant = 'critical';
    item.iconKey = 'finance';
    const chip = mapItemToChip(item);
    expect(chip.icon).toBe(DollarSign);
  });

  it('maps normalized item semantics into enriched launcher chip model', () => {
    const item = makeItem(42);
    item.actionKey = 'safety-inspection';
    item.groupKey = 'field-ops';
    item.groupTitle = 'Field Ops';
    item.iconKey = 'hard-hat';
    item.description = 'Daily safety and quality walkthrough';
    item.openInNewTab = true;
    item.isExternal = false;

    const chip = mapItemToChip(item);
    expect(chip.id).toBe('safety-inspection');
    expect(chip.serviceKey).toBe('safety-inspection');
    expect(chip.groupKey).toBe('field-ops');
    expect(chip.groupTitle).toBe('Field Ops');
    expect(chip.iconKey).toBe('hard-hat');
    expect(chip.openInNewTab).toBe(true);
    expect(chip.description).toContain('Daily safety');
    expect(chip.ariaLabel).toContain('safety and quality walkthrough');
  });

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
    const normal = partitionItems(items, 'desktop', makeResolution({}), {
      strictShellAlignment: true,
    });
    const shortHeight = partitionItems(
      items,
      'desktop',
      makeResolution({ shortHeightConstrained: true }),
      { strictShellAlignment: true },
    );
    expect(shortHeight.primary.length).toBe(normal.primary.length - 1);
  });

  it('always keeps overflowOnly items in overflow', () => {
    const items = [makeItem(1), makeItem(2, true), makeItem(3)];
    const partition = partitionItems(items, 'phone', makeResolution({ deviceClass: 'phone' }), {
      strictShellAlignment: true,
    });
    const overflowIds = partition.overflow.map((item) => item.id);
    expect(overflowIds).toContain('2');
  });

  it('preserves grouping metadata on overflow chip mappings', () => {
    const grouped = makeItem(7, true);
    grouped.actionKey = 'qa-log';
    grouped.groupKey = 'quality';
    grouped.groupTitle = 'Quality';
    const partition = partitionItems([grouped], 'desktop', makeResolution({}), {
      strictShellAlignment: true,
    });
    expect(partition.overflow[0].groupKey).toBe('quality');
    expect(partition.overflow[0].groupTitle).toBe('Quality');
    expect(partition.overflow[0].serviceKey).toBe('qa-log');
  });

  it('uses one authoritative visible-count regime regardless of alignment mode', () => {
    const items = [1, 2, 3, 4, 5].map((id) => makeItem(id));
    const strict = partitionItems(
      items,
      'desktop',
      makeResolution({ shellState: 'tablet-portrait' }),
      { strictShellAlignment: true },
    );
    const legacy = partitionItems(
      items,
      'desktop',
      makeResolution({ shellState: 'tablet-portrait' }),
      { strictShellAlignment: false },
    );
    expect(strict.visibleBudget).toBe(5);
    expect(legacy.visibleBudget).toBe(strict.visibleBudget);
  });
});
