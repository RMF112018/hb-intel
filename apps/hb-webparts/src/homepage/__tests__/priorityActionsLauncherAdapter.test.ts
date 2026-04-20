import { describe, expect, it } from 'vitest';
import {
  mapItemToTile,
  partitionItems,
  resolveLauncherDeviceClass,
} from '../data/priorityActionsLauncherAdapter.js';
import {
  ArrowRight,
  Calendar,
  Building2,
  DollarSign,
  Shield,
} from '@hbc/ui-kit/homepage';
import type { PriorityActionsItemNormalized } from '../data/priorityActionsContracts.js';
import type { PriorityRailDeviceResolution } from '../data/priorityActionsPresentation.js';

function makeResolution(
  overrides: Partial<PriorityRailDeviceResolution>,
): PriorityRailDeviceResolution {
  const base: PriorityRailDeviceResolution = {
    deviceClass: 'desktop',
    shellState: 'standard-laptop',
    entryStateReason: 'width-match',
    shortHeightConstrained: false,
    densityPosture: 'comfortable',
    launcherHandheldMode: 'standard',
  };
  const merged = { ...base, ...overrides };
  return {
    ...merged,
    launcherHandheldMode:
      overrides.launcherHandheldMode ??
      (merged.deviceClass === 'phone' || merged.shortHeightConstrained
        ? 'single-entry-all-tools'
        : 'standard'),
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
    const tile = mapItemToTile(item);
    expect(tile.icon).toBe(Shield);
  });

  it('uses explicit launcher icon identity ahead of iconKey when provided', () => {
    const item = makeItem(6);
    item.launcherIconIdentity = 'finance';
    item.iconKey = 'safety';
    const tile = mapItemToTile(item);
    expect(tile.icon).toBe(DollarSign);
  });

  it('falls back to governed service mapping when iconKey is invalid', () => {
    const item = makeItem(8);
    item.iconKey = 'not-governed';
    item.actionKey = 'weekly-project-sync';
    const tile = mapItemToTile(item);
    expect(tile.icon).toBe(Calendar);
  });

  it('falls back safely to neutral icon when no icon semantics resolve', () => {
    const item = makeItem(9);
    item.iconKey = '';
    item.actionKey = 'unique-action';
    item.groupKey = '';
    item.groupTitle = '';
    item.title = 'Unknown Tool';
    const tile = mapItemToTile(item);
    expect(tile.icon).toBe(ArrowRight);
  });

  it('maps HB Projects to governed Building2 with compliant icon presentation', () => {
    const item = makeItem(11);
    item.actionKey = 'hb-projects';
    item.title = 'HB Projects';
    const tile = mapItemToTile(item);
    expect(tile.icon).toBe(Building2);
    expect(tile.iconPresentation).toBe('compliant');
    expect(tile.iconAssetSrc).toBeUndefined();
    expect(tile.iconKey).toBe('hb-projects-building2');
  });

  it('maps branded tools to governed local SVG assets', () => {
    const adp = makeItem(12);
    adp.actionKey = 'my-adp';
    adp.title = 'My ADP';
    const adpTile = mapItemToTile(adp);
    expect(adpTile.iconAssetSrc).toContain('adp_logo');
    expect(adpTile.iconPresentation).toBe('compliant');
    expect(adpTile.iconAssetStrategy).toBe('img-filter-white');

    const procore = makeItem(13);
    procore.actionKey = 'procore';
    procore.title = 'Procore';
    const procoreTile = mapItemToTile(procore);
    expect(procoreTile.iconAssetSrc).toContain('data:image/svg+xml');
    expect(procoreTile.iconPresentation).toBe('compliant');

    const bamboo = makeItem(14);
    bamboo.actionKey = 'bamboohr';
    bamboo.title = 'BambooHR';
    const bambooTile = mapItemToTile(bamboo);
    expect(bambooTile.iconAssetSrc).toContain('data:image/svg+xml');
    expect(bambooTile.iconPresentation).toBe('compliant');
    expect(bambooTile.iconAssetStrategy).toBe('img-filter-white');
    expect(bambooTile.iconKey).toBe('bamboohr');

    const hbUniversity = makeItem(15);
    hbUniversity.actionKey = 'hb-university';
    hbUniversity.title = 'HB University';
    const hbUniversityTile = mapItemToTile(hbUniversity);
    expect(hbUniversityTile.icon).toBeDefined();
    expect(hbUniversityTile.iconAssetSrc).toBeUndefined();
    expect(hbUniversityTile.iconPresentation).toBe('compliant');
    expect(hbUniversityTile.iconAssetStrategy).toBeUndefined();
    expect(hbUniversityTile.iconKey).toBe('hb-university-graduation-cap');
  });

  it('does not regress to badge-variant-first behavior', () => {
    const item = makeItem(10);
    item.badgeVariant = 'critical';
    item.iconKey = 'finance';
    const tile = mapItemToTile(item);
    expect(tile.icon).toBe(DollarSign);
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

    const tile = mapItemToTile(item);
    expect(tile.id).toBe('safety-inspection');
    expect(tile.serviceKey).toBe('safety-inspection');
    expect(tile.groupKey).toBe('field-ops');
    expect(tile.groupTitle).toBe('Field Ops');
    expect(tile.iconKey).toBe('hard-hat');
    expect(tile.openInNewTab).toBe(true);
    expect(tile.description).toContain('Daily safety');
    expect(tile.ariaLabel).toContain('safety and quality walkthrough');
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

  it('switches to single-entry handheld model under short-height posture', () => {
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
    expect(normal.primary.length).toBe(5);
    expect(shortHeight.primary.length).toBe(1);
    expect(shortHeight.overflow.length).toBe(5);
    expect(shortHeight.handheldMode).toBe('single-entry-all-tools');
  });

  it('always keeps overflowOnly items in handheld drawer payload', () => {
    const items = [makeItem(1), makeItem(2, true), makeItem(3)];
    const partition = partitionItems(items, 'phone', makeResolution({ deviceClass: 'phone' }), {
      strictShellAlignment: true,
    });
    const overflowIds = partition.overflow.map((item) => item.id);
    expect(overflowIds).toContain('2');
    expect(partition.handheldMode).toBe('single-entry-all-tools');
  });

  it('uses single-entry handheld model for phone with all tools in drawer payload', () => {
    const items = [makeItem(1), makeItem(2), makeItem(3), makeItem(4)];
    const partition = partitionItems(items, 'phone', makeResolution({ deviceClass: 'phone' }), {
      strictShellAlignment: true,
    });
    expect(partition.primary).toHaveLength(1);
    expect(partition.overflow).toHaveLength(4);
    expect(partition.visibleBudget).toBe(1);
    expect(partition.primary.every((item) => item.variant === 'mobile-entry')).toBe(true);
    expect(partition.overflow.every((item) => item.variant === 'mobile-entry')).toBe(true);
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
    expect(partition.overflow[0].variant).toBe('secondary-overflow-entry');
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
    expect(strict.visibleBudget).toBe(7);
    expect(legacy.visibleBudget).toBe(strict.visibleBudget);
  });

  it('enforces governed launcher ordering ahead of non-governed items', () => {
    const items = [
      makeItem(101),
      makeItem(102),
      makeItem(103),
      makeItem(104),
      makeItem(105),
      makeItem(106),
      makeItem(107),
      makeItem(108),
      makeItem(109),
    ];
    items[0]!.actionKey = 'random-tool';
    items[0]!.title = 'Random Tool';
    items[1]!.actionKey = 'document-crunch';
    items[1]!.title = 'Document Crunch';
    items[2]!.actionKey = 'hb-university';
    items[2]!.title = 'HB University';
    items[3]!.actionKey = 'procore';
    items[3]!.title = 'Procore';
    items[4]!.actionKey = 'compass';
    items[4]!.title = 'Compass';
    items[5]!.actionKey = 'hb-projects';
    items[5]!.title = 'HB Projects';
    items[6]!.actionKey = 'bamboohr';
    items[6]!.title = 'BambooHR';
    items[7]!.actionKey = 'hh2';
    items[7]!.title = 'hh2';
    items[8]!.actionKey = 'zzz-tool';
    items[8]!.title = 'Zzz Tool';

    const partition = partitionItems(items, 'desktop', makeResolution({}), {
      strictShellAlignment: true,
    });
    const orderedIds = [...partition.primary, ...partition.overflow].map((tile) => tile.id);
    expect(orderedIds.slice(0, 7)).toEqual([
      'hb-projects',
      'hb-university',
      'procore',
      'compass',
      'bamboohr',
      'hh2',
      'document-crunch',
    ]);
    expect(orderedIds.slice(7)).toEqual(['random-tool', 'zzz-tool']);
  });
});
