import { describe, expect, it } from 'vitest';
import {
  mapItemRow,
  normalizeItemRows,
  filterByAudience,
  filterBySchedule,
  filterByDevice,
  resolveByBreakpoint,
  buildPriorityActionsRenderModel,
} from '../data/priorityActionsNormalization.js';
import { resolveActiveConfig, mapConfigRow } from '../data/priorityActionsConfigListSource.js';
import type { RawPriorityActionsItemRow } from '../data/priorityActionsItemsListDescriptor.js';
import type { RawPriorityActionsConfigRow } from '../data/priorityActionsConfigListDescriptor.js';
import type { PriorityActionsConfigResolved, PriorityActionsItemNormalized } from '../data/priorityActionsContracts.js';

/* ── Helpers ─────────────────────────────────────────────────────── */

function makeRawItem(overrides: Partial<RawPriorityActionsItemRow> = {}): RawPriorityActionsItemRow {
  return {
    ID: 1,
    Title: 'Test Action',
    BandKey: 'homepage-primary',
    ActionKey: 'test-action',
    ItemStatus: 'Enabled',
    Href: '/test',
    SortOrder: 100,
    BadgeVariant: 'neutral',
    Priority: 'primary',
    AudienceMode: 'all',
    OverflowOnly: false,
    VisibleDesktop: true,
    VisibleLaptop: true,
    VisibleTabletLandscape: true,
    VisibleTabletPortrait: true,
    VisiblePhone: true,
    ...overrides,
  };
}

function makeConfig(overrides: Partial<PriorityActionsConfigResolved> = {}): PriorityActionsConfigResolved {
  return {
    id: 1,
    title: 'Homepage Priority Actions',
    bandKey: 'homepage-primary',
    enabled: true,
    isActive: true,
    headingText: '',
    overflowLabel: 'More tools',
    showHeading: false,
    showBadges: true,
    desktopLayoutMode: 'rail',
    tabletLayoutMode: 'grid',
    mobileLayoutMode: 'sheet-trigger',
    maxVisibleDesktop: 5,
    maxVisibleLaptop: 5,
    maxVisibleTabletLandscape: 4,
    maxVisibleTabletPortrait: 4,
    maxVisiblePhone: 4,
    openExternalInNewTabByDefault: true,
    adminNotes: '',
    modified: '2026-04-17T00:00:00Z',
    ...overrides,
  };
}

/* ── mapItemRow ──────────────────────────────────────────────────── */

describe('mapItemRow', () => {
  it('maps a valid raw row into a normalized item', () => {
    const item = mapItemRow(makeRawItem({
      ActionKey: 'submit-log',
      Title: 'Submit Daily Log',
      Href: '/daily-log',
      BadgeLabel: 'Due',
      BadgeVariant: 'warning',
      IconKey: 'clipboard',
    }));
    expect(item).toBeDefined();
    expect(item!.actionKey).toBe('submit-log');
    expect(item!.title).toBe('Submit Daily Log');
    expect(item!.href).toBe('/daily-log');
    expect(item!.badgeLabel).toBe('Due');
    expect(item!.badgeVariant).toBe('warning');
    expect(item!.iconKey).toBe('clipboard');
  });

  it('returns undefined when ActionKey is missing', () => {
    expect(mapItemRow(makeRawItem({ ActionKey: '' }))).toBeUndefined();
  });

  it('returns undefined when Title is missing', () => {
    expect(mapItemRow(makeRawItem({ Title: '' }))).toBeUndefined();
  });

  it('returns undefined when Href is missing', () => {
    expect(mapItemRow(makeRawItem({ Href: '' }))).toBeUndefined();
  });

  it('defaults BadgeVariant to neutral for invalid values', () => {
    const item = mapItemRow(makeRawItem({ BadgeVariant: 'fancy' }));
    expect(item!.badgeVariant).toBe('neutral');
  });

  it('defaults Priority to primary for invalid values', () => {
    const item = mapItemRow(makeRawItem({ Priority: 'urgent' }));
    expect(item!.priority).toBe('primary');
  });

  it('drops invalid icon keys to empty string', () => {
    const item = mapItemRow(makeRawItem({ IconKey: 'invalid-icon' }));
    expect(item!.iconKey).toBe('');
  });

  it('parses newline-delimited AudienceKeys', () => {
    const item = mapItemRow(makeRawItem({ AudienceKeys: 'ops\nfield\nadmin' }));
    expect(item!.audienceKeys).toEqual(['ops', 'field', 'admin']);
  });

  it('normalizes audience keys by trim + dedupe', () => {
    const item = mapItemRow(makeRawItem({ AudienceKeys: 'ops\n OPS \n field ' }));
    expect(item!.audienceKeys).toEqual(['ops', 'field']);
  });

  it('resets partial group metadata to empty pair', () => {
    const item = mapItemRow(makeRawItem({ GroupKey: 'ops', GroupTitle: '' }));
    expect(item!.groupKey).toBe('');
    expect(item!.groupTitle).toBe('');
  });

  it('returns null for empty date fields', () => {
    const item = mapItemRow(makeRawItem({ StartsAtUtc: '', EndsAtUtc: undefined }));
    expect(item!.startsAtUtc).toBeNull();
    expect(item!.endsAtUtc).toBeNull();
  });

  it('normalizes valid date strings to ISO format', () => {
    const item = mapItemRow(makeRawItem({ StartsAtUtc: '2026-06-01T08:00:00Z' }));
    expect(item!.startsAtUtc).toBe('2026-06-01T08:00:00.000Z');
  });
});

/* ── normalizeItemRows ───────────────────────────────────────────── */

describe('normalizeItemRows', () => {
  it('deduplicates by ActionKey', () => {
    const items = normalizeItemRows([
      makeRawItem({ ActionKey: 'a', SortOrder: 1 }),
      makeRawItem({ ActionKey: 'a', SortOrder: 2 }),
      makeRawItem({ ActionKey: 'b', SortOrder: 3 }),
    ]);
    expect(items).toHaveLength(2);
    expect(items[0].actionKey).toBe('a');
    expect(items[1].actionKey).toBe('b');
  });

  it('deduplicates by ActionKey case-insensitively', () => {
    const items = normalizeItemRows([
      makeRawItem({ ActionKey: 'A', SortOrder: 1 }),
      makeRawItem({ ActionKey: 'a', SortOrder: 2 }),
    ]);
    expect(items).toHaveLength(1);
  });

  it('sorts by SortOrder then ActionKey', () => {
    const items = normalizeItemRows([
      makeRawItem({ ActionKey: 'z', SortOrder: 1 }),
      makeRawItem({ ActionKey: 'a', SortOrder: 1 }),
      makeRawItem({ ActionKey: 'm', SortOrder: 0 }),
    ]);
    expect(items.map((i) => i.actionKey)).toEqual(['m', 'a', 'z']);
  });

  it('skips rows with missing required fields', () => {
    const items = normalizeItemRows([
      makeRawItem({ ActionKey: '' }),
      makeRawItem({ Title: '' }),
      makeRawItem({ Href: '' }),
      makeRawItem({ ActionKey: 'valid' }),
    ]);
    expect(items).toHaveLength(1);
    expect(items[0].actionKey).toBe('valid');
  });
});

/* ── resolveActiveConfig ─────────────────────────────────────────── */

describe('resolveActiveConfig', () => {
  const base: RawPriorityActionsConfigRow = {
    ID: 1,
    Title: 'Config A',
    BandKey: 'homepage-primary',
    Enabled: true,
    IsActive: true,
    Modified: '2026-04-01T00:00:00Z',
  };

  it('picks the newest enabled+active row for the band key', () => {
    const result = resolveActiveConfig([
      { ...base, ID: 1, Modified: '2026-01-01T00:00:00Z' },
      { ...base, ID: 2, Modified: '2026-04-15T00:00:00Z' },
    ]);
    expect(result!.id).toBe(2);
  });

  it('breaks ties by highest ID', () => {
    const result = resolveActiveConfig([
      { ...base, ID: 10, Modified: '2026-04-01T00:00:00Z' },
      { ...base, ID: 20, Modified: '2026-04-01T00:00:00Z' },
    ]);
    expect(result!.id).toBe(20);
  });

  it('excludes disabled rows', () => {
    const result = resolveActiveConfig([
      { ...base, Enabled: false, Modified: '2026-06-01T00:00:00Z' },
    ]);
    expect(result).toBeUndefined();
  });

  it('excludes inactive rows', () => {
    const result = resolveActiveConfig([
      { ...base, IsActive: false, Modified: '2026-06-01T00:00:00Z' },
    ]);
    expect(result).toBeUndefined();
  });

  it('filters by band key', () => {
    const result = resolveActiveConfig(
      [{ ...base, BandKey: 'other-band' }],
      'homepage-primary',
    );
    expect(result).toBeUndefined();
  });

  it('returns undefined for empty input', () => {
    expect(resolveActiveConfig([])).toBeUndefined();
  });
});

/* ── mapConfigRow ────────────────────────────────────────────────── */

describe('mapConfigRow', () => {
  it('maps layout modes with documented defaults', () => {
    const config = mapConfigRow({
      ID: 5,
      BandKey: 'homepage-primary',
      Enabled: true,
      IsActive: true,
      DesktopLayoutMode: 'segmented',
      TabletLayoutMode: 'hybrid',
      MobileLayoutMode: 'scroll',
    });
    expect(config.desktopLayoutMode).toBe('segmented');
    expect(config.tabletLayoutMode).toBe('hybrid');
    expect(config.mobileLayoutMode).toBe('scroll');
  });

  it('falls back to default layout modes for invalid values', () => {
    const config = mapConfigRow({
      DesktopLayoutMode: 'invalid',
      TabletLayoutMode: 'invalid',
      MobileLayoutMode: 'invalid',
    });
    expect(config.desktopLayoutMode).toBe('rail');
    expect(config.tabletLayoutMode).toBe('grid');
    expect(config.mobileLayoutMode).toBe('sheet-trigger');
  });

  it('reads max-visible breakpoint integers with defaults', () => {
    const config = mapConfigRow({
      MaxVisibleDesktop: 8,
      MaxVisibleLaptop: '7',
      MaxVisibleTabletLandscape: undefined,
    });
    expect(config.maxVisibleDesktop).toBe(8);
    expect(config.maxVisibleLaptop).toBe(7);
    expect(config.maxVisibleTabletLandscape).toBe(4);
  });
});

/* ── filterByAudience ────────────────────────────────────────────── */

describe('filterByAudience', () => {
  const items: PriorityActionsItemNormalized[] = [
    { ...mapItemRow(makeRawItem({ ActionKey: 'all', AudienceMode: 'all' }))! },
    { ...mapItemRow(makeRawItem({ ActionKey: 'ops-only', AudienceMode: 'include-only', AudienceKeys: 'ops\nfield' }))! },
    { ...mapItemRow(makeRawItem({ ActionKey: 'exclude-ops', AudienceMode: 'exclude', AudienceKeys: 'ops' }))! },
  ];

  it('keeps all-audience items regardless of active audience', () => {
    expect(filterByAudience(items, 'ops').some((i) => i.actionKey === 'all')).toBe(true);
    expect(filterByAudience(items, undefined).some((i) => i.actionKey === 'all')).toBe(true);
  });

  it('include-only shows matching audience', () => {
    expect(filterByAudience(items, 'ops').some((i) => i.actionKey === 'ops-only')).toBe(true);
  });

  it('include-only hides non-matching audience', () => {
    expect(filterByAudience(items, 'admin').some((i) => i.actionKey === 'ops-only')).toBe(false);
  });

  it('include-only hides when no active audience', () => {
    expect(filterByAudience(items, undefined).some((i) => i.actionKey === 'ops-only')).toBe(false);
  });

  it('exclude hides matching audience', () => {
    expect(filterByAudience(items, 'ops').some((i) => i.actionKey === 'exclude-ops')).toBe(false);
  });

  it('exclude shows non-matching audience', () => {
    expect(filterByAudience(items, 'admin').some((i) => i.actionKey === 'exclude-ops')).toBe(true);
  });
});

/* ── filterBySchedule ────────────────────────────────────────────── */

describe('filterBySchedule', () => {
  const now = new Date('2026-06-15T12:00:00Z');

  it('includes items with no schedule', () => {
    const item = mapItemRow(makeRawItem({ StartsAtUtc: '', EndsAtUtc: '' }))!;
    expect(filterBySchedule([item], now)).toHaveLength(1);
  });

  it('excludes items before their start date', () => {
    const item = mapItemRow(makeRawItem({ StartsAtUtc: '2026-07-01T00:00:00Z' }))!;
    expect(filterBySchedule([item], now)).toHaveLength(0);
  });

  it('excludes items after their end date', () => {
    const item = mapItemRow(makeRawItem({ EndsAtUtc: '2026-01-01T00:00:00Z' }))!;
    expect(filterBySchedule([item], now)).toHaveLength(0);
  });

  it('includes items within their schedule window', () => {
    const item = mapItemRow(makeRawItem({
      StartsAtUtc: '2026-06-01T00:00:00Z',
      EndsAtUtc: '2026-07-01T00:00:00Z',
    }))!;
    expect(filterBySchedule([item], now)).toHaveLength(1);
  });
});

/* ── filterByDevice ──────────────────────────────────────────────── */

describe('filterByDevice', () => {
  it('respects desktop visibility gate', () => {
    const item = mapItemRow(makeRawItem({ VisibleDesktop: false }))!;
    expect(filterByDevice([item], 'desktop')).toHaveLength(0);
    expect(filterByDevice([item], 'phone')).toHaveLength(1);
  });

  it('respects phone visibility gate', () => {
    const item = mapItemRow(makeRawItem({ VisiblePhone: false }))!;
    expect(filterByDevice([item], 'phone')).toHaveLength(0);
    expect(filterByDevice([item], 'desktop')).toHaveLength(1);
  });

  it('respects tablet landscape visibility gate', () => {
    const item = mapItemRow(makeRawItem({ VisibleTabletLandscape: false }))!;
    expect(filterByDevice([item], 'tabletLandscape')).toHaveLength(0);
  });
});

/* ── resolveByBreakpoint ─────────────────────────────────────────── */

describe('resolveByBreakpoint', () => {
  it('splits items at the launcher-governed cap for the device', () => {
    const items = Array.from({ length: 8 }, (_, i) =>
      mapItemRow(makeRawItem({ ActionKey: `a${i}`, SortOrder: i }))!
    );
    const config = makeConfig({ maxVisibleDesktop: 3 });
    const result = resolveByBreakpoint(items, config, 'desktop');
    expect(result.primaryItems).toHaveLength(5);
    expect(result.overflowItems).toHaveLength(3);
    expect(result.maxVisible).toBe(5);
  });

  it('forces OverflowOnly items into overflow regardless of cap', () => {
    const items = [
      mapItemRow(makeRawItem({ ActionKey: 'normal', OverflowOnly: false, SortOrder: 1 }))!,
      mapItemRow(makeRawItem({ ActionKey: 'forced', OverflowOnly: true, SortOrder: 0 }))!,
    ];
    const config = makeConfig({ maxVisibleDesktop: 10 });
    const result = resolveByBreakpoint(items, config, 'desktop');
    expect(result.primaryItems.map((i) => i.actionKey)).toEqual(['normal']);
    expect(result.overflowItems.map((i) => i.actionKey)).toEqual(['forced']);
  });

  it('uses launcher-governed phone max-visible for phone device', () => {
    const items = Array.from({ length: 6 }, (_, i) =>
      mapItemRow(makeRawItem({ ActionKey: `a${i}`, SortOrder: i }))!
    );
    const config = makeConfig({ maxVisiblePhone: 2 });
    const result = resolveByBreakpoint(items, config, 'phone');
    expect(result.primaryItems).toHaveLength(3);
    expect(result.overflowItems).toHaveLength(3);
  });

  it('ignores authored maxVisible config knobs for runtime partitioning', () => {
    const items = Array.from({ length: 10 }, (_, i) =>
      mapItemRow(makeRawItem({ ActionKey: `a${i}`, SortOrder: i }))!
    );
    const strictConfig = makeConfig({
      maxVisibleDesktop: 1,
      maxVisibleLaptop: 1,
      maxVisibleTabletLandscape: 1,
      maxVisibleTabletPortrait: 1,
      maxVisiblePhone: 1,
    });
    const result = resolveByBreakpoint(items, strictConfig, 'desktop');
    expect(result.maxVisible).toBe(5);
    expect(result.primaryItems).toHaveLength(5);
  });

  it('returns overflowLabel from config', () => {
    const config = makeConfig({ overflowLabel: 'Show all' });
    const result = resolveByBreakpoint([], config, 'desktop');
    expect(result.overflowLabel).toBe('Show all');
  });
});

/* ── buildPriorityActionsRenderModel (end-to-end) ────────────────── */

describe('buildPriorityActionsRenderModel', () => {
  it('produces a complete render model from raw rows', () => {
    const config = makeConfig({ maxVisibleDesktop: 2 });
    const rawRows = [
      makeRawItem({ ActionKey: 'a', SortOrder: 1 }),
      makeRawItem({ ActionKey: 'b', SortOrder: 2 }),
      makeRawItem({ ActionKey: 'c', SortOrder: 3 }),
    ];
    const model = buildPriorityActionsRenderModel(config, rawRows, undefined, 'desktop');
    expect(model.config).toBe(config);
    expect(model.allItems).toHaveLength(3);
    expect(model.breakpoint.primaryItems).toHaveLength(3);
    expect(model.breakpoint.overflowItems).toHaveLength(0);
  });

  it('filters by audience before breakpoint resolution', () => {
    const config = makeConfig({ maxVisibleDesktop: 10 });
    const rawRows = [
      makeRawItem({ ActionKey: 'all', AudienceMode: 'all' }),
      makeRawItem({ ActionKey: 'ops', AudienceMode: 'include-only', AudienceKeys: 'ops' }),
    ];
    const model = buildPriorityActionsRenderModel(config, rawRows, 'admin', 'desktop');
    expect(model.allItems).toHaveLength(1);
    expect(model.allItems[0].actionKey).toBe('all');
  });

  it('filters by schedule before breakpoint resolution', () => {
    const config = makeConfig({ maxVisibleDesktop: 10 });
    const future = new Date(Date.now() + 86400000 * 30).toISOString();
    const rawRows = [
      makeRawItem({ ActionKey: 'current' }),
      makeRawItem({ ActionKey: 'future', StartsAtUtc: future }),
    ];
    const model = buildPriorityActionsRenderModel(config, rawRows, undefined, 'desktop');
    expect(model.allItems).toHaveLength(1);
    expect(model.allItems[0].actionKey).toBe('current');
  });

  it('filters by device before breakpoint resolution', () => {
    const config = makeConfig({ maxVisiblePhone: 10 });
    const rawRows = [
      makeRawItem({ ActionKey: 'visible' }),
      makeRawItem({ ActionKey: 'hidden', VisiblePhone: false }),
    ];
    const model = buildPriorityActionsRenderModel(config, rawRows, undefined, 'phone');
    expect(model.allItems).toHaveLength(1);
    expect(model.allItems[0].actionKey).toBe('visible');
  });
});
