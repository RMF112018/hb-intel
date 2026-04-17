import { describe, expect, it } from 'vitest';
import {
  createConfigDraftFromResolved,
  createItemDraftFromNormalized,
  createEmptyItemDraft,
  isConfigDirty,
  isItemDirty,
  isAnyItemDirty,
} from '../data/priorityActionsAdminState.js';
import {
  validateConfig,
  validateItem,
  validateItemBatch,
  validatePriorityRailDraft,
} from '../data/priorityActionsValidation.js';
import {
  mapConfigDraftToFields,
  mapItemDraftToFields,
} from '../data/priorityActionsListWriter.js';
import type { PriorityActionsConfigResolved, PriorityActionsItemNormalized, PriorityActionsConfigDraft, PriorityActionsItemDraft } from '../data/priorityActionsContracts.js';

/* ── Fixtures ────────────────────────────────────────────────────── */

const CONFIG: PriorityActionsConfigResolved = {
  id: 1,
  title: 'Homepage Priority Actions',
  bandKey: 'homepage-primary',
  enabled: true,
  isActive: true,
  headingText: 'Priority Actions',
  overflowLabel: 'More tools',
  showHeading: true,
  stickyAfterHero: false,
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
};

const ITEM: PriorityActionsItemNormalized = {
  id: 10,
  actionKey: 'submit-log',
  title: 'Submit Daily Log',
  href: '/daily-log',
  description: 'Log your daily activity',
  iconKey: 'clipboard',
  badgeLabel: 'Due',
  badgeVariant: 'warning',
  priority: 'primary',
  groupKey: 'daily',
  groupTitle: 'Daily Tasks',
  sortOrder: 1,
  overflowOnly: false,
  mobilePriority: 50,
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
};

/* ── Draft factories ─────────────────────────────────────────────── */

describe('createConfigDraftFromResolved', () => {
  it('maps all editable fields from resolved config', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    expect(draft.title).toBe('Homepage Priority Actions');
    expect(draft.bandKey).toBe('homepage-primary');
    expect(draft.maxVisibleDesktop).toBe(5);
    expect(draft.desktopLayoutMode).toBe('rail');
  });

  it('excludes non-editable fields (id, modified)', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    expect('id' in draft).toBe(false);
    expect('modified' in draft).toBe(false);
  });
});

describe('createItemDraftFromNormalized', () => {
  it('maps all editable fields from normalized item', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    expect(draft.actionKey).toBe('submit-log');
    expect(draft.title).toBe('Submit Daily Log');
    expect(draft.badgeVariant).toBe('warning');
    expect(draft.audienceKeys).toEqual([]);
  });

  it('converts null dates to empty strings', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    expect(draft.startsAtUtc).toBe('');
    expect(draft.endsAtUtc).toBe('');
  });
});

describe('createEmptyItemDraft', () => {
  it('creates a blank draft with default values', () => {
    const draft = createEmptyItemDraft('homepage-primary');
    expect(draft.title).toBe('');
    expect(draft.href).toBe('');
    expect(draft.badgeVariant).toBe('neutral');
    expect(draft.priority).toBe('primary');
    expect(draft.visibleDesktop).toBe(true);
    expect(draft.audienceMode).toBe('all');
  });
});

/* ── Dirty detection ─────────────────────────────────────────────── */

describe('isConfigDirty', () => {
  it('returns false for identical drafts', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    const baseline = createConfigDraftFromResolved(CONFIG);
    expect(isConfigDirty(draft, baseline)).toBe(false);
  });

  it('returns true when a field changes', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    const baseline = createConfigDraftFromResolved(CONFIG);
    draft.headingText = 'Changed';
    expect(isConfigDirty(draft, baseline)).toBe(true);
  });
});

describe('isAnyItemDirty', () => {
  it('returns false for identical item arrays', () => {
    const drafts = [createItemDraftFromNormalized(ITEM)];
    const baselines = [createItemDraftFromNormalized(ITEM)];
    expect(isAnyItemDirty(drafts, baselines)).toBe(false);
  });

  it('returns true when an item is added', () => {
    const drafts = [createItemDraftFromNormalized(ITEM), createEmptyItemDraft('x')];
    const baselines = [createItemDraftFromNormalized(ITEM)];
    expect(isAnyItemDirty(drafts, baselines)).toBe(true);
  });

  it('returns true when an item field changes', () => {
    const drafts = [createItemDraftFromNormalized(ITEM)];
    const baselines = [createItemDraftFromNormalized(ITEM)];
    drafts[0].title = 'Changed';
    expect(isAnyItemDirty(drafts, baselines)).toBe(true);
  });
});

/* ── Validation ──────────────────────────────────────────────────── */

describe('validateConfig', () => {
  it('passes for a valid config', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    expect(validateConfig(draft)).toHaveLength(0);
  });

  it('flags missing band key', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    draft.bandKey = '';
    const issues = validateConfig(draft);
    expect(issues.some((i) => i.kind === 'missing-band-key')).toBe(true);
  });

  it('flags empty title', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    draft.title = '   ';
    const issues = validateConfig(draft);
    expect(issues.some((i) => i.kind === 'empty-title')).toBe(true);
  });
});

describe('validateItem', () => {
  it('passes for a valid item', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    expect(validateItem(draft)).toHaveLength(0);
  });

  it('flags missing title', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    draft.title = '';
    expect(validateItem(draft).some((i) => i.kind === 'empty-title')).toBe(true);
  });

  it('flags missing href', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    draft.href = '';
    expect(validateItem(draft).some((i) => i.kind === 'missing-href')).toBe(true);
  });

  it('flags invalid schedule window (start >= end)', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    draft.startsAtUtc = '2026-07-01T00:00:00Z';
    draft.endsAtUtc = '2026-06-01T00:00:00Z';
    expect(validateItem(draft).some((i) => i.kind === 'invalid-schedule-window')).toBe(true);
  });

  it('flags inconsistent audience mode without keys', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    draft.audienceMode = 'include-only';
    draft.audienceKeys = [];
    expect(validateItem(draft).some((i) => i.kind === 'inconsistent-audience-mode')).toBe(true);
  });

  it('does not flag audience mode "all" without keys', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    draft.audienceMode = 'all';
    draft.audienceKeys = [];
    expect(validateItem(draft).some((i) => i.kind === 'inconsistent-audience-mode')).toBe(false);
  });
});

describe('validateItemBatch', () => {
  it('detects duplicate action keys', () => {
    const a = createItemDraftFromNormalized(ITEM);
    const b = createItemDraftFromNormalized(ITEM);
    const issues = validateItemBatch([a, b]);
    expect(issues.some((i) => i.kind === 'duplicate-action-key')).toBe(true);
  });

  it('passes for unique keys', () => {
    const a = createItemDraftFromNormalized(ITEM);
    const b = createItemDraftFromNormalized({ ...ITEM, actionKey: 'other' });
    const issues = validateItemBatch([a, b]);
    expect(issues.some((i) => i.kind === 'duplicate-action-key')).toBe(false);
  });
});

describe('validatePriorityRailDraft', () => {
  it('returns valid for a clean draft set', () => {
    const configDraft = createConfigDraftFromResolved(CONFIG);
    const itemDrafts = [createItemDraftFromNormalized(ITEM)];
    const result = validatePriorityRailDraft(configDraft, itemDrafts);
    expect(result.valid).toBe(true);
    expect(result.issues).toHaveLength(0);
  });

  it('aggregates config and item issues', () => {
    const configDraft = createConfigDraftFromResolved(CONFIG);
    configDraft.bandKey = '';
    const badItem = createItemDraftFromNormalized(ITEM);
    badItem.href = '';
    const result = validatePriorityRailDraft(configDraft, [badItem]);
    expect(result.valid).toBe(false);
    expect(result.issues.length).toBeGreaterThanOrEqual(2);
  });
});

/* ── Writer field mapping ────────────────────────────────────────── */

describe('mapConfigDraftToFields', () => {
  it('maps draft fields to SharePoint internal names', () => {
    const draft = createConfigDraftFromResolved(CONFIG);
    const fields = mapConfigDraftToFields(draft);
    expect(fields['Title']).toBe('Homepage Priority Actions');
    expect(fields['BandKey']).toBe('homepage-primary');
    expect(fields['Enabled']).toBe(true);
    expect(fields['MaxVisibleDesktop']).toBe(5);
    expect(fields['DesktopLayoutMode']).toBe('rail');
  });
});

describe('mapItemDraftToFields', () => {
  it('maps draft fields with correct band key', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    const fields = mapItemDraftToFields(draft, 'homepage-primary');
    expect(fields['Title']).toBe('Submit Daily Log');
    expect(fields['BandKey']).toBe('homepage-primary');
    expect(fields['ActionKey']).toBe('submit-log');
    expect(fields['ItemStatus']).toBe('Enabled');
    expect(fields['BadgeVariant']).toBe('warning');
    expect(fields['SortOrder']).toBe(1);
  });

  it('serializes audience keys as newline-delimited', () => {
    const draft = createItemDraftFromNormalized({ ...ITEM, audienceKeys: ['ops', 'field'] });
    const fields = mapItemDraftToFields(draft, 'test');
    expect(fields['AudienceKeys']).toBe('ops\nfield');
  });

  it('sets AudienceKeys to null when empty', () => {
    const draft = createItemDraftFromNormalized(ITEM);
    const fields = mapItemDraftToFields(draft, 'test');
    expect(fields['AudienceKeys']).toBeNull();
  });
});
