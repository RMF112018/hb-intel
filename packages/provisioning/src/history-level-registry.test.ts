import { describe, expect, it } from 'vitest';
import {
  HISTORY_LEVEL_LABELS,
  PROJECT_SETUP_HISTORY_CONTENT,
  getHistoryContentByLevel,
  isHistoryLevelVisible,
} from './history-level-registry.js';

// ─── HISTORY_LEVEL_LABELS ────────────────────────────────────────────────────

describe('HISTORY_LEVEL_LABELS', () => {
  it('defines labels for all 3 levels', () => {
    expect(HISTORY_LEVEL_LABELS[0]).toBe('Core Summary');
    expect(HISTORY_LEVEL_LABELS[1]).toBe('Activity Timeline');
    expect(HISTORY_LEVEL_LABELS[2]).toBe('Operational Detail');
  });
});

// ─── PROJECT_SETUP_HISTORY_CONTENT ───────────────────────────────────────────

describe('PROJECT_SETUP_HISTORY_CONTENT', () => {
  it('has 13 total content descriptors', () => {
    expect(PROJECT_SETUP_HISTORY_CONTENT).toHaveLength(13);
  });

  it('every descriptor has a unique contentId', () => {
    const ids = PROJECT_SETUP_HISTORY_CONTENT.map((c) => c.contentId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── getHistoryContentByLevel ────────────────────────────────────────────────

describe('getHistoryContentByLevel', () => {
  it('returns Level 1 items', () => {
    const level1 = getHistoryContentByLevel(1);
    expect(level1.length).toBe(6);
    for (const item of level1) {
      expect(item.level).toBe(1);
    }
  });

  it('returns Level 2 items', () => {
    const level2 = getHistoryContentByLevel(2);
    expect(level2.length).toBe(7);
    for (const item of level2) {
      expect(item.level).toBe(2);
    }
  });

  it('returns empty for Level 0 (summary fields are separate)', () => {
    const level0 = getHistoryContentByLevel(0);
    expect(level0).toHaveLength(0);
  });
});

// ─── isHistoryLevelVisible ───────────────────────────────────────────────────

describe('isHistoryLevelVisible', () => {
  it('Level 0 is always visible', () => {
    expect(isHistoryLevelVisible(0, 'essential')).toBe(true);
    expect(isHistoryLevelVisible(0, 'standard')).toBe(true);
    expect(isHistoryLevelVisible(0, 'expert')).toBe(true);
  });

  it('Level 1 is always visible', () => {
    expect(isHistoryLevelVisible(1, 'essential')).toBe(true);
    expect(isHistoryLevelVisible(1, 'standard')).toBe(true);
    expect(isHistoryLevelVisible(1, 'expert')).toBe(true);
  });

  it('Level 2 is NOT visible at essential', () => {
    expect(isHistoryLevelVisible(2, 'essential')).toBe(false);
  });

  it('Level 2 IS visible at standard', () => {
    expect(isHistoryLevelVisible(2, 'standard')).toBe(true);
  });

  it('Level 2 IS visible at expert', () => {
    expect(isHistoryLevelVisible(2, 'expert')).toBe(true);
  });
});
