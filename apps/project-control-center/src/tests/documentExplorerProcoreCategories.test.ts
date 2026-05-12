import { describe, expect, it } from 'vitest';
import {
  DOCUMENT_EXPLORER_PROCORE_CATEGORIES,
  DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER,
  PROCORE_CATEGORY_DIRECTORY_NODES,
  type ProcoreCategoryId,
} from '../surfaces/documents/documentExplorerProcoreCategories';

const LOCKED_DISPLAY_LABELS: readonly string[] = [
  'Documents',
  'Drawings',
  'Specifications',
  'RFIs',
  'Submittals',
  'Change Orders',
  'Commitments',
  'Change Events',
  'Inspections',
  'Observations',
  'Punch List',
];

const LOCKED_CATEGORY_IDS: readonly ProcoreCategoryId[] = [
  'documents',
  'drawings',
  'specifications',
  'rfis',
  'submittals',
  'change-orders',
  'commitments',
  'change-events',
  'inspections',
  'observations',
  'punch-list',
];

describe('documentExplorerProcoreCategories — locked vocabulary', () => {
  it('category order matches the locked 11-entry list', () => {
    expect(DOCUMENT_EXPLORER_PROCORE_CATEGORY_ORDER).toEqual(LOCKED_CATEGORY_IDS);
  });

  it('display labels match the locked user-facing text exactly', () => {
    const labels = DOCUMENT_EXPLORER_PROCORE_CATEGORIES.map((c) => c.displayLabel);
    expect(labels).toEqual(LOCKED_DISPLAY_LABELS);
  });

  it('category ids align with display labels by index', () => {
    const ids = DOCUMENT_EXPLORER_PROCORE_CATEGORIES.map((c) => c.categoryId);
    expect(ids).toEqual(LOCKED_CATEGORY_IDS);
  });
});

describe('documentExplorerProcoreCategories — directory nodes', () => {
  it('exposes exactly 11 category nodes', () => {
    expect(PROCORE_CATEGORY_DIRECTORY_NODES.length).toBe(LOCKED_CATEGORY_IDS.length);
  });

  it('every node has nodeKind category and posture launch-only', () => {
    for (const node of PROCORE_CATEGORY_DIRECTORY_NODES) {
      expect(node.nodeKind).toBe('category');
      expect(node.posture).toBe('launch-only');
      expect(node.sourceId).toBe('procore');
    }
  });

  it('relativePathSegments use the stable kebab-case categoryId', () => {
    for (let i = 0; i < PROCORE_CATEGORY_DIRECTORY_NODES.length; i += 1) {
      const node = PROCORE_CATEGORY_DIRECTORY_NODES[i];
      const expectedId = LOCKED_CATEGORY_IDS[i];
      expect(node.relativePathSegments).toEqual([expectedId]);
      expect(node.nodeId).toBe(`procore/${expectedId}`);
    }
  });

  it('no linked-record preview rows are populated (Prompt 10E scope)', () => {
    for (const node of PROCORE_CATEGORY_DIRECTORY_NODES) {
      expect(node.children).toBeUndefined();
      expect(node.hasChildren).toBe(false);
      expect(node.linkedRecordRef).toBeUndefined();
    }
  });
});
