import { describe, it, expect } from 'vitest';
import {
  WORKFLOW_ITEM_STATUSES,
  WORKFLOW_STATUS_META,
} from './WorkflowItems.js';

const TERMINAL = new Set(['complete', 'archived', 'rejected']);

describe('PCC workflow status meta', () => {
  it('covers every status in WORKFLOW_ITEM_STATUSES', () => {
    for (const status of WORKFLOW_ITEM_STATUSES) {
      const meta = WORKFLOW_STATUS_META[status];
      expect(meta).toBeDefined();
      expect(meta.id).toBe(status);
      expect(meta.displayName.length).toBeGreaterThan(0);
      expect(meta.description.length).toBeGreaterThan(0);
    }
  });

  it('marks complete, archived, and rejected as terminal', () => {
    for (const status of WORKFLOW_ITEM_STATUSES) {
      const meta = WORKFLOW_STATUS_META[status];
      expect(meta.isTerminal).toBe(TERMINAL.has(status));
    }
  });
});
