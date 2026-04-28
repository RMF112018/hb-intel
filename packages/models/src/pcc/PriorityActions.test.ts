import { describe, it, expect } from 'vitest';
import {
  PRIORITY_ACTION_CATEGORIES,
  PRIORITY_ACTION_CATEGORY_LABELS,
  PRIORITY_ACTION_CATEGORY_META,
} from './PriorityActions.js';

describe('PCC priority action category meta', () => {
  it('covers every category in PRIORITY_ACTION_CATEGORIES', () => {
    for (const category of PRIORITY_ACTION_CATEGORIES) {
      const meta = PRIORITY_ACTION_CATEGORY_META[category];
      expect(meta).toBeDefined();
      expect(meta.id).toBe(category);
      expect(meta.displayName.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
      expect(['MVP', 'Later']).toContain(meta.mvpTier);
    }
  });

  it('every label entry stays present for backward compatibility', () => {
    for (const category of PRIORITY_ACTION_CATEGORIES) {
      expect(PRIORITY_ACTION_CATEGORY_LABELS[category]).toBeTruthy();
    }
  });
});
